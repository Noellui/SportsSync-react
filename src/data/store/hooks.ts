import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turfRepository, type TurfQuery } from '../repositories/turfRepository';
import { bookingRepository, type CreateBookingInput } from '../repositories/bookingRepository';
import { teamRepository } from '../repositories/teamRepository';
import { authRepository } from '../repositories/authRepository';
import { useAuthStore } from './authStore';
import { queryClient } from './queryClient';
import type { Player } from '../models/player';

// ---- Turfs ----
export function useTurfs(q?: TurfQuery) {
  return useQuery({
    queryKey: ['turfs', q],
    queryFn: () => turfRepository.getTurfs(q),
  });
}

export function useTurf(id: string | undefined) {
  return useQuery({
    queryKey: ['turf', id],
    queryFn: () => turfRepository.getTurf(id!),
    enabled: !!id,
  });
}

export function useTurfSlots(turfId: string | undefined, date: string, sportId?: string) {
  return useQuery({
    queryKey: ['slots', turfId, date, sportId],
    queryFn: () => turfRepository.getSlots(turfId!, date, sportId),
    enabled: !!turfId,
  });
}

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async () => {
      const { db } = await import('../repositories/db');
      return db.sports;
    },
    staleTime: Infinity,
  });
}

// ---- Bookings ----
export function useMyBookings() {
  const player = useAuthStore((s) => s.player);
  return useQuery({
    queryKey: ['myBookings', player?.player_id],
    queryFn: () => bookingRepository.getMyBookings(player!.player_id),
    enabled: !!player,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ['allBookings'],
    queryFn: () => bookingRepository.getAllBookings(),
  });
}

export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingRepository.getBooking(bookingId!),
    enabled: !!bookingId,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingRepository.createBooking(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['myBookings'] });
      qc.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  const userId = useAuthStore((state) => state.user?.user_id);
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      bookingRepository.cancel(bookingId, reason, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['myBookings'] });
      qc.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useCollectShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => bookingRepository.collectShare(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myBookings'] });
      qc.invalidateQueries({ queryKey: ['allBookings'] });
      qc.invalidateQueries({ queryKey: ['booking'] });
    },
  });
}

export function usePayTeamShare() {
  const qc = useQueryClient();
  const userId = useAuthStore((state) => state.user?.user_id);
  return useMutation({
    mutationFn: ({ bookingId, method }: { bookingId: string; method: 'upi' | 'card' | 'wallet' | 'cash' }) =>
      bookingRepository.payTeamShare(bookingId, userId!, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myBookings'] });
      qc.invalidateQueries({ queryKey: ['allBookings'] });
      qc.invalidateQueries({ queryKey: ['booking'] });
    },
  });
}

// ---- Teams ----
export function useTeams(sportId?: string) {
  return useQuery({
    queryKey: ['teams', sportId],
    queryFn: () => teamRepository.getTeams(sportId),
  });
}

export function useTeam(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamRepository.getTeam(teamId!),
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof teamRepository.createTeam>[0]) =>
      teamRepository.createTeam(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useSendJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { teamId: string; playerId: string; userId: string; message: string }) =>
      teamRepository.sendJoinRequest(input.teamId, input.playerId, input.userId, input.message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) =>
      teamRepository.respondToRequest(requestId, accept),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      qc.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

// ---- Auth ----
export function useLogin() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => authRepository.login(input.email, input.password),
    onSuccess: (session) => {
      setAuth(session.user, session.player ?? null);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: Parameters<typeof authRepository.register>[0]) => authRepository.register(input),
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

export function useUpdatePlayerProfile() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const player = useAuthStore((s) => s.player);
  return useMutation({
    mutationFn: (patch: Partial<Player>) => authRepository.updatePlayerProfile(player!.player_id, patch),
    onSuccess: (p) => refreshUser(useAuthStore.getState().user!, p),
  });
}

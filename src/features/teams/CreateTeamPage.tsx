import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Minus, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { createTeamSchema, type CreateTeamInput } from '../../core/utils/validators';
import { useCreateTeam, useSports } from '../../data/store/hooks';
import { useAuthStore } from '../../data/store/authStore';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { GlassCard } from '../../core/components/GlassCard';

const sportImages: Record<string, string> = {
  Football: '/images/sport_football.jpg',
  Cricket: '/images/sport_cricket.jpg',
  Basketball: '/images/sport_basketball.jpg',
  Badminton: '/images/sport_badminton.jpg',
  Tennis: '/images/sport_tennis.jpg',
  Pickleball: '/images/sport_pickleball.jpg',
};

export function CreateTeamPage() {
  const navigate = useNavigate();
  const { user, player } = useAuthStore();
  const { data: sports = [] } = useSports();
  const createTeam = useCreateTeam();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { required_players: 6, description: '' },
  });

  const sportId = watch('sport_id');
  const requiredPlayers = watch('required_players');

  const onSubmit = async (data: CreateTeamInput) => {
    setServerError(null);
    if (!user || !player) {
      setServerError('You must be signed in as a player to create a team.');
      return;
    }
    try {
      const team = await createTeam.mutateAsync({
        created_by: user.user_id,
        player_id: player.player_id,
        sport_id: data.sport_id,
        team_name: data.team_name,
        description: data.description,
        required_players: data.required_players,
      });
      toast.success('Team created!');
      navigate(`/home/teams/${team.team_id}`, { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create team. Please try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70"
        >
          <ArrowLeft size={18} className="text-text" aria-hidden />
        </button>
        <h1 className="font-display text-[24px] font-bold text-text">Create team</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <GlassCard className="space-y-5">
          <div>
            <label htmlFor="team_name" className="mb-1.5 block text-[12.5px] font-medium text-muted">Team name</label>
            <input
              id="team_name"
              type="text"
              placeholder="Friday Night Strikers"
              aria-invalid={!!errors.team_name}
              className={clsx('h-12 w-full rounded-2xl border bg-elevated px-4 text-[15px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary',
                errors.team_name ? 'border-danger/60' : 'border-line')}
              {...register('team_name')}
            />
            {errors.team_name && <p role="alert" className="mt-1.5 text-[12.5px] text-danger">{errors.team_name.message}</p>}
          </div>

          <div>
            <p className="mb-2 text-[12.5px] font-medium text-muted">Sport</p>
            <div className="grid grid-cols-3 gap-2">
              {sports.map((s) => (
                <button
                  key={s.sport_id}
                  type="button"
                  onClick={() => setValue('sport_id', s.sport_id)}
                  className={clsx('flex flex-col items-center gap-1.5 rounded-2xl border p-3 min-h-24',
                    sportId === s.sport_id ? 'border-primary bg-primary/10' : 'border-line bg-elevated/40')}
                >
                  <img src={sportImages[s.sport_name] ?? ''} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <span className={clsx('text-[11.5px] font-semibold', sportId === s.sport_id ? 'text-primary' : 'text-muted')}>{s.sport_name}</span>
                </button>
              ))}
            </div>
            {errors.sport_id && <p role="alert" className="mt-1.5 text-[12.5px] text-danger">{errors.sport_id.message}</p>}
          </div>

          <div>
            <p className="mb-2 text-[12.5px] font-medium text-muted">Required players</p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Fewer players"
                onClick={() => setValue('required_players', Math.max(2, (requiredPlayers ?? 2) - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-elevated"
              >
                <Minus size={16} className="text-text" aria-hidden />
              </button>
              <span className="w-10 text-center font-display text-[24px] font-bold text-text" aria-live="polite">{requiredPlayers}</span>
              <button
                type="button"
                aria-label="More players"
                onClick={() => setValue('required_players', Math.min(22, (requiredPlayers ?? 2) + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-elevated"
              >
                <Plus size={16} className="text-text" aria-hidden />
              </button>
            </div>
            {errors.required_players && <p role="alert" className="mt-1.5 text-[12.5px] text-danger">{errors.required_players.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-[12.5px] font-medium text-muted">Description (optional)</label>
            <textarea
              id="description"
              rows={3}
              placeholder="What kind of team is this?"
              className="w-full rounded-2xl border border-line bg-elevated px-4 py-3 text-[14px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
              {...register('description')}
            />
          </div>
        </GlassCard>

        {serverError && (
          <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-[13px] font-medium text-danger">
            {serverError}
          </div>
        )}

        <PrimaryButton type="submit" size="lg" full icon={Users} loading={createTeam.isPending}>
          {createTeam.isPending ? 'Creating team…' : 'Create team'}
        </PrimaryButton>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Trophy, CalendarCheck, Users, LogOut, Settings, Bell, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../data/store/authStore';
import { useMyBookings, useTeams, useUpdatePlayerProfile } from '../../data/store/hooks';
import { useLogout } from '../../data/store/hooks';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { GlassCard } from '../../core/components/GlassCard';
import { BottomSheet } from '../../core/components/BottomSheet';
import { avatarForUser } from '../../core/utils/avatar';
import { imageFileToDataUrl } from '../../core/utils/imageUpload';
import { authRepository } from '../../data/repositories/authRepository';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, player, refreshUser } = useAuthStore();
  const logout = useLogout();
  const { data: bookings = [] } = useMyBookings();
  const { data: teams = [] } = useTeams();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const teamCount = teams.filter((t) => t.members.some((m) => m.user_id === user?.user_id)).length;

  const doLogout = async () => {
    await logout.mutateAsync();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <img
            src={avatarForUser(user?.user_id, user?.profile_image)}
            alt={user?.full_name ?? ''}
            className="h-28 w-28 rounded-full ring-4 ring-primary/30 object-cover"
          />
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Edit profile"
            className="absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary-gradient"
          >
            <Settings size={18} className="text-on-primary" aria-hidden />
          </button>
        </div>
        <label className="cursor-pointer rounded-xl border border-primary/40 px-4 py-2 text-[13px] font-semibold text-primary">
            {uploadingPhoto ? 'Uploading photo…' : 'Change photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingPhoto} onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file || !user) return;
              setUploadingPhoto(true);
              try {
                const photo = await imageFileToDataUrl(file);
                const updated = await authRepository.updateProfile(user.user_id, { profile_image: photo });
                refreshUser(updated, player);
                toast.success('Profile photo updated');
              } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not upload photo'); }
              finally { setUploadingPhoto(false); event.target.value = ''; }
            }} />
        </label>
        <h2 className="font-display text-[24px] font-bold text-text">{user?.full_name}</h2>
        <p className="text-[13.5px] text-muted">{user?.email}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase text-primary">
            {player?.skill_level ?? 'beginner'}
          </span>
          <span className="text-[12px] text-muted">{player?.city ?? 'Vadodara'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CalendarCheck, label: 'Bookings', value: bookings.length, color: 'text-primary' },
          { icon: Users, label: 'Teams', value: teamCount, color: 'text-secondary' },
          { icon: Trophy, label: 'Completed', value: bookings.filter((b) => b.booking_status === 'completed').length, color: 'text-warning' },
        ].map((s) => (
          <div key={s.label} className="rounded-[20px] border border-line bg-surface/70 p-4 backdrop-blur-sm">
            <s.icon size={18} className={clsx('mx-auto', s.color)} aria-hidden />
            <p className="mt-1.5 font-display text-[22px] font-bold text-text">{s.value}</p>
            <p className="text-[11.5px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[
          { icon: User, title: 'Edit profile', subtitle: 'Name, phone, city, sport, skill, bio', action: <PrimaryButton variant="ghost" onClick={() => setEditOpen(true)}>Edit</PrimaryButton> },
          { icon: Users, title: 'My teams', subtitle: `${teamCount} team${teamCount !== 1 ? 's' : ''} joined`, action: <PrimaryButton variant="ghost" onClick={() => navigate('/home/teams')}>View</PrimaryButton> },
          { icon: CalendarCheck, title: 'Payment history', subtitle: `${bookings.length} transaction${bookings.length !== 1 ? 's' : ''}`, action: <PrimaryButton variant="ghost" onClick={() => navigate('/home/bookings')}>View</PrimaryButton> },
          { icon: Bell, title: 'Notifications', subtitle: 'Push & email preferences', action: <PrimaryButton variant="ghost" onClick={() => toast('Notification settings (demo)')}>Manage</PrimaryButton> },
          { icon: HelpCircle, title: 'Help & support', subtitle: 'FAQ, contact us, feedback', action: <PrimaryButton variant="ghost" onClick={() => toast('Support chat (demo)')}>Open</PrimaryButton> },
        ].map((s) => (
          <GlassCard key={s.title} className="flex items-center justify-between gap-3" interactive>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <s.icon size={18} className="text-primary" aria-hidden />
              </div>
              <div>
                <p className="font-display text-[15px] font-semibold text-text">{s.title}</p>
                <p className="text-[12px] text-muted">{s.subtitle}</p>
              </div>
            </div>
            {s.action}
          </GlassCard>
        ))}

        <button
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-danger/30 bg-danger/10 px-4 py-3.5 text-[14px] font-semibold text-danger"
        >
          <LogOut size={18} aria-hidden />
          Log out
        </button>
      </div>

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" height="90%">
        <EditProfileForm onClose={() => setEditOpen(false)} />
      </BottomSheet>

      <BottomSheet open={confirmLogout} onClose={() => setConfirmLogout(false)} title="Sign out?">
        <div className="space-y-4 pb-4 text-center">
          <p className="text-[14px] text-muted">Are you sure you want to sign out?</p>
          <div className="flex gap-3">
            <PrimaryButton variant="outline" className="flex-1" onClick={() => setConfirmLogout(false)}>Stay</PrimaryButton>
            <PrimaryButton variant="danger" className="flex-1" onClick={doLogout}>Sign out</PrimaryButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export function EditProfileForm({ onClose }: { onClose: () => void }) {
  const { user, player, refreshUser } = useAuthStore();
  const updateProfile = useUpdatePlayerProfile();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    phone_number: user?.phone_number ?? '',
    city: player?.city ?? '',
    preferred_sport: player?.preferred_sport ?? '',
    skill_level: player?.skill_level ?? 'beginner',
    bio: player?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (user) {
        const { authRepository } = await import('../../data/repositories/authRepository');
        const u = await authRepository.updateProfile(user.user_id, {
          full_name: form.full_name,
          phone_number: form.phone_number,
        });
        const p = await updateProfile.mutateAsync({
          city: form.city,
          preferred_sport: form.preferred_sport,
          skill_level: form.skill_level,
          bio: form.bio,
        });
        refreshUser(u, p);
      }
      toast.success('Profile saved');
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const sports = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Pickleball'];
  const skills = ['beginner', 'intermediate', 'pro'] as const;

  return (
    <div className="space-y-4 pb-4">
      <input
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        placeholder="Full name"
        className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text"
      />
      <input
        value={form.phone_number}
        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
        placeholder="Phone"
        className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text"
      />
      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-muted">City</p>
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="Vadodara"
          className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text"
        />
      </div>
      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-muted">Preferred sport</p>
        <div className="flex flex-wrap gap-2">
          {sports.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, preferred_sport: s })}
              className={clsx('rounded-full border px-3.5 py-2 text-[12.5px] font-semibold min-h-9',
                form.preferred_sport === s ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-muted">Skill level</p>
        <div className="flex gap-2">
          {skills.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, skill_level: s })}
              className={clsx('flex-1 rounded-full border px-4 py-2 text-[12.5px] font-semibold capitalize min-h-9',
                form.skill_level === s ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[12.5px] font-medium text-muted">Bio</p>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          placeholder="Tell others about your game…"
          className="w-full rounded-2xl border border-line bg-elevated px-4 py-3 text-[14px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-[1.5px] focus:ring-primary"
        />
      </div>
      <PrimaryButton size="lg" full loading={saving} onClick={save}>
        Save changes
      </PrimaryButton>
    </div>
  );
}

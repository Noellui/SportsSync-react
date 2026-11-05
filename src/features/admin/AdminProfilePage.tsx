import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../data/store/authStore';
import { authRepository } from '../../data/repositories/authRepository';
import { useLogout } from '../../data/store/hooks';
import { GlassCard } from '../../core/components/GlassCard';
import { PrimaryButton } from '../../core/components/PrimaryButton';

export function AdminProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [saving, setSaving] = useState(false);

  return <div className="space-y-5 pb-8">
    <h1 className="font-display text-[24px] font-bold text-text">Admin profile</h1>
    <GlassCard className="space-y-4">
      <p className="text-sm text-muted">{user?.email}</p>
      <label className="block text-sm text-text">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-line bg-elevated px-4" /></label>
      <label className="block text-sm text-text">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-line bg-elevated px-4" /></label>
      <PrimaryButton full loading={saving} onClick={async () => {
        if (!user) return;
        setSaving(true);
        try {
          const updated = await authRepository.updateProfile(user.user_id, { full_name: name.trim(), phone_number: phone.trim() });
          refreshUser(updated, null);
          toast.success('Profile saved');
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save profile'); }
        finally { setSaving(false); }
      }}>Save changes</PrimaryButton>
    </GlassCard>
    <PrimaryButton variant="danger" full onClick={async () => {
      try { await logout.mutateAsync(); navigate('/login', { replace: true }); }
      catch (e) { toast.error(e instanceof Error ? e.message : 'Could not sign out'); }
    }}>Sign out</PrimaryButton>
  </div>;
}

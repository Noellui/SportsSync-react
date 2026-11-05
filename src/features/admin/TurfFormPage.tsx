import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useTurf, useSports } from '../../data/store/hooks';
import { turfRepository } from '../../data/repositories/turfRepository';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { GlassCard } from '../../core/components/GlassCard';
import { Skeleton } from '../../core/components/Skeleton';
import { ErrorState } from '../../core/components/ErrorState';
import { clsx } from 'clsx';
import { TurfImagePicker } from './TurfImagePicker';
import { queryClient } from '../../data/store/queryClient';

export function TurfFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: turf } = useTurf(id ?? '');
  const { data: allSports = [] } = useSports();
  const [form, setForm] = useState({
    turf_name: turf?.turf_name ?? '',
    description: turf?.description ?? '',
    address: turf?.address ?? '',
    city: turf?.city ?? 'Ahmedabad',
    opening_time: turf?.opening_time ?? '06:00',
    closing_time: turf?.closing_time ?? '23:00',
    sport_ids: turf?.sport_ids ?? [],
    image_urls: turf?.images.map(i => i.image_url) ?? [],
    primary_image: turf?.images.find(i => i.is_primary)?.image_url ?? '',
    turf_status: turf?.turf_status ?? 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!turf) return;
    setForm({
      turf_name: turf.turf_name,
      description: turf.description,
      address: turf.address,
      city: turf.city,
      opening_time: turf.opening_time,
      closing_time: turf.closing_time,
      sport_ids: turf.sport_ids,
      image_urls: turf.images.map(i => i.image_url),
      primary_image: turf.images.find(i => i.is_primary)?.image_url ?? '',
      turf_status: turf.turf_status,
    });
  }, [turf]);

  const save = async () => {
    setSaving(true);
    try {
      if (isEdit && id) await turfRepository.updateTurf(id, form);
      else await turfRepository.createTurf('a_1', form);
      await queryClient.invalidateQueries({ queryKey: ['turfs'] });
      if (id) await queryClient.invalidateQueries({ queryKey: ['turf', id] });
      toast.success(isEdit ? 'Turf updated' : 'Turf created');
      navigate('/admin/turfs', { replace: true });
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  if (isEdit && turf === undefined) {
    return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-24 w-full" /></div>;
  }
  if (isEdit && !turf) {
    return <ErrorState message="Turf not found" onRetry={() => navigate('/admin/turfs')} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/turfs')} className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70" aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="font-display text-[24px] font-bold text-text">{isEdit ? 'Edit turf' : 'Add turf'}</h1>
      </div>

      <form onSubmit={e => { e.preventDefault(); save(); }} className="space-y-4" noValidate>
        <GlassCard className="space-y-4 p-5">
          <input value={form.turf_name} onChange={e => setForm({...form, turf_name: e.target.value})} placeholder="Turf name" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" required />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Description" className="w-full rounded-2xl border border-line bg-elevated px-4 py-3 text-[14px] text-text" />
          <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" required />
          <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" />
          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={form.opening_time} onChange={e => setForm({...form, opening_time: e.target.value})} className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" />
            <input type="time" value={form.closing_time} onChange={e => setForm({...form, closing_time: e.target.value})} className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" />
          </div>
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-muted">Sports</p>
            <div className="flex flex-wrap gap-2">
              {allSports.map(s => {
                const isSelected = form.sport_ids.includes(s.sport_id);
                const newIds = isSelected
                  ? form.sport_ids.filter(x => x !== s.sport_id)
                  : [...form.sport_ids, s.sport_id];
                return (
                  <button
                    key={s.sport_id}
                    type="button"
                    onClick={() => setForm(f => ({...f, sport_ids: newIds}))}
                    className={clsx(
                      'rounded-full border px-3.5 py-2 text-[12.5px] font-semibold min-h-9',
                      isSelected ? 'border-primary bg-primary/15 text-primary' : 'border-line bg-elevated/50 text-muted'
                    )}
                  >
                    {s.sport_name}
                  </button>
                );
              })}
            </div>
          </div>
          <TurfImagePicker images={form.image_urls} primaryImage={form.primary_image} onChange={(images, primaryImage) => setForm(f => ({ ...f, image_urls: images, primary_image: primaryImage }))} />
          {isEdit && (
            <div>
              <p className="mb-2 text-[12.5px] font-medium text-muted">Status</p>
              <select value={form.turf_status} onChange={e => setForm({...form, turf_status: e.target.value as any})} className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          )}
        </GlassCard>
        <PrimaryButton type="submit" size="lg" full loading={saving}>{isEdit ? 'Save changes' : 'Create turf'}</PrimaryButton>
      </form>
    </div>
  );
}

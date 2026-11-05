import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ToggleLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useTurfs, useTurf } from '../../data/store/hooks';
import { useSports } from '../../data/store/hooks';
import { turfRepository } from '../../data/repositories/turfRepository';
import { inr } from '../../core/utils/format';
import { PrimaryButton } from '../../core/components/PrimaryButton';
import { GlassCard } from '../../core/components/GlassCard';
import { StatusChip } from '../../core/components/StatusChip';
import { Skeleton } from '../../core/components/Skeleton';
import { EmptyState } from '../../core/components/EmptyState';
import { BottomSheet } from '../../core/components/BottomSheet';
import { ErrorState } from '../../core/components/ErrorState';
import { TurfImagePicker } from './TurfImagePicker';
import { queryClient } from '../../data/store/queryClient';

const statusTone = { active: 'success', inactive: 'warning', maintenance: 'danger' } as const;

export function ManageTurfsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: turfs = [], isLoading, isError, refetch, error } = useTurfs();

  const openEdit = (id: string) => { setEditingId(id); setFormOpen(true); };
  const openDelete = (id: string) => setDeleteId(id);
  const closeAll = () => { setFormOpen(false); setEditingId(null); setDeleteId(null); };

  const toggleStatus = async (t: any) => {
    const next: 'active' | 'inactive' | 'maintenance' = t.turf_status === 'active' ? 'inactive' : 'active';
    try {
      await turfRepository.updateTurf(t.turf_id, { turf_status: next });
      toast.success('Turf marked ' + next);
      refetch();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to update'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-bold text-text">Manage turfs</h1>
          <p className="text-[13.5px] text-muted">{turfs?.length ?? 0} venues in your portfolio</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => { setEditingId(null); setFormOpen(true); }}>
          Add turf
        </PrimaryButton>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-[20px]" />)}</div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : !turfs?.length ? (
        <EmptyState icon={Plus} title="No turfs yet" message="Create your first venue to get started." action={<PrimaryButton icon={Plus} onClick={() => { setEditingId(null); setFormOpen(true); }}>Add turf</PrimaryButton>} />
      ) : (
        <div className="space-y-3">
          {turfs.map((t) => (
            <GlassCard key={t.turf_id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-4 min-w-0">
                {t.images[0] && <img src={(t.images.find(image => image.is_primary) ?? t.images[0]).image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />}
                <div className="min-w-0">
                  <p className="font-display text-[16px] font-semibold text-text truncate">{t.turf_name}</p>
                  <p className="text-[12px] text-muted">{t.address.split(',')[0]} \u00B7 {t.city}</p>
                  <p className="text-[11.5px] text-muted">{t.sport_ids.length} sport(s) \u00B7 From {inr(t.min_price)}/hr</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip tone={statusTone[t.turf_status]}>{t.turf_status}</StatusChip>
                <button
                  onClick={() => toggleStatus(t)}
                  className={clsx('flex h-9 w-9 items-center justify-center rounded-full transition-colors', t.turf_status === 'active' ? 'bg-success/15' : 'bg-elevated/50')}
                  aria-label={t.turf_status === 'active' ? 'Deactivate' : 'Activate'}
                >
                  <ToggleLeft size={18} className={t.turf_status === 'active' ? 'text-success' : 'text-muted'} aria-hidden />
                </button>
                <PrimaryButton variant="ghost" icon={Edit} className="h-9 w-9" onClick={() => openEdit(t.turf_id)} aria-label="Edit">E</PrimaryButton>
                <button
                  onClick={() => openDelete(t.turf_id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger hover:bg-danger/20"
                  aria-label="Delete"
                >
                  <Trash2 size={18} aria-hidden />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <BottomSheet open={formOpen} onClose={closeAll} title={editingId ? 'Edit turf' : 'Add turf'} height="95%">
        <TurfFormPage turfId={editingId} onSaved={closeAll} />
      </BottomSheet>

      <BottomSheet open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete turf?">
        <div className="space-y-4 pb-4 text-center">
          <p className="text-[14px] text-muted">This will permanently remove the turf and its slots.</p>
          <div className="flex gap-3">
            <PrimaryButton variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</PrimaryButton>
            <PrimaryButton variant="danger" className="flex-1" onClick={async () => {
              if (!deleteId) return;
              try { await turfRepository.deleteTurf(deleteId); toast.success('Turf deleted'); refetch(); setDeleteId(null); }
              catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed'); }
            }}>Delete</PrimaryButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function TurfFormPage({ turfId, onSaved }: { turfId: string | null; onSaved: () => void }) {
  const { data: turf } = useTurf(turfId ?? '');
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
      image_urls: turf.images.map((image) => image.image_url),
      primary_image: turf.images.find((image) => image.is_primary)?.image_url ?? '',
      turf_status: turf.turf_status,
    });
  }, [turf]);

  const save = async () => {
    setSaving(true);
    try {
      if (turfId) await turfRepository.updateTurf(turfId, form);
      else await turfRepository.createTurf('a_1', form);
      await queryClient.invalidateQueries({ queryKey: ['turfs'] });
      if (turfId) await queryClient.invalidateQueries({ queryKey: ['turf', turfId] });
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 pb-4 overflow-y-auto max-h-[85vh]">
      <input value={form.turf_name} onChange={e => setForm({...form, turf_name: e.target.value})} placeholder="Turf name" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" />
      <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Description" className="w-full rounded-2xl border border-line bg-elevated px-4 py-3 text-[14px] text-text" />
      <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Address" className="h-12 w-full rounded-2xl border border-line bg-elevated px-4 text-[15px] text-text" />
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
      <PrimaryButton size="lg" full loading={saving} onClick={save}>{turfId ? 'Save changes' : 'Create turf'}</PrimaryButton>
    </div>
  );
}

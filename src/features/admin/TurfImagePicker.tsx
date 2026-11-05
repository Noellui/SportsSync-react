import { useState } from 'react';
import { toast } from 'sonner';
import { imageFileToDataUrl } from '../../core/utils/imageUpload';

const mockImages = ['/images/turf_1.jpg', '/images/turf_2.jpg', '/images/turf_3.jpg', '/images/turf_4.jpg', '/images/turf_5.jpg', '/images/turf_6.jpg'];

export function TurfImagePicker({ images, primaryImage, onChange }: {
  images: string[];
  primaryImage: string;
  onChange: (images: string[], primaryImage: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const toggle = (image: string) => {
    const next = images.includes(image) ? images.filter((item) => item !== image) : [...images, image];
    onChange(next, next.includes(primaryImage) ? primaryImage : (next[0] ?? ''));
  };

  return <div className="space-y-3">
    <p className="text-[12.5px] font-medium text-muted">Turf photos</p>
    <label className="inline-flex cursor-pointer rounded-xl border border-primary px-3 py-2 text-[12px] font-semibold text-primary">
      {uploading ? 'Adding photo…' : 'Upload photos'}
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={async (event) => {
        const files = Array.from(event.target.files ?? []);
        if (!files.length) return;
        if (images.length + files.length > 8) {
          toast.error('Choose up to 8 turf photos');
          event.target.value = '';
          return;
        }
        setUploading(true);
        try {
          const uploaded = await Promise.all(files.map(imageFileToDataUrl));
          const next = [...images, ...uploaded];
          onChange(next, primaryImage || next[0]);
        } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not upload photo'); }
        finally { setUploading(false); event.target.value = ''; }
      }} />
    </label>
    {images.length > 0 && <div className="flex flex-wrap gap-2">
      {images.map((image, index) => <div key={`${image.slice(0, 60)}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
        <img src={image} alt={`Selected turf photo ${index + 1}`} className="h-full w-full object-cover" />
        <button type="button" onClick={() => onChange(images, image)} aria-label={`Make photo ${index + 1} primary`} className="absolute left-1 top-1 rounded bg-surface/90 px-1 text-xs text-primary">{primaryImage === image ? '★' : '☆'}</button>
        <button type="button" onClick={() => toggle(image)} aria-label={`Remove photo ${index + 1}`} className="absolute bottom-1 right-1 rounded bg-surface/90 px-1 text-xs text-danger">×</button>
      </div>)}
    </div>}
    <p className="text-[11px] text-muted">Or choose demo photos:</p>
    <div className="flex flex-wrap gap-2">
      {mockImages.map((image) => <button key={image} type="button" onClick={() => toggle(image)} aria-label={`${images.includes(image) ? 'Remove' : 'Add'} demo photo`} className={`h-14 w-14 overflow-hidden rounded-xl border-2 ${images.includes(image) ? 'border-primary' : 'border-line'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}
    </div>
  </div>;
}

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EditProfileForm } from './ProfilePage';

export function EditProfilePage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/70">
          <ArrowLeft size={18} className="text-text" aria-hidden />
        </button>
        <h1 className="font-display text-[24px] font-bold text-text">Edit profile</h1>
      </div>
      <EditProfileForm onClose={() => navigate('/home/profile', { replace: true })} />
    </div>
  );
}

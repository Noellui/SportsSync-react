import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useRef, type ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: string;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, height = '85%', className }: BottomSheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title ?? 'Sheet'}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ height, maxHeight: '92dvh' }}
            className={clsx(
              'absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[32px] border-t border-line bg-elevated',
              className,
            )}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <div className="mx-auto absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-line" aria-hidden />
              <span className="w-8" />
              {title && <h2 className="font-display text-[17px] font-semibold text-text">{title}</h2>}
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted hover:text-text min-w-11 min-h-11"
              >
                <X size={17} aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

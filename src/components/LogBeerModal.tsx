import { useEffect } from 'react';
import { SubmissionForm } from './SubmissionForm';

const AUTO_CLOSE_DELAY_MS = 1200;

export function LogBeerModal({ groupTotal, onClose }: { groupTotal: number; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSuccess() {
    setTimeout(onClose, AUTO_CLOSE_DELAY_MS);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-amber-900/40 bg-[#1c1712] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-amber-900/40 px-4 py-3">
          <h2 className="font-[var(--font-display)] text-lg font-bold text-amber-400">Log a beer 🍺</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-lg leading-none text-amber-100/60 hover:bg-white/10 hover:text-amber-100"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <SubmissionForm groupTotal={groupTotal} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}

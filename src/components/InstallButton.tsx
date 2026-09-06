import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallButton() {
  const { canInstall, iosHint, promptInstall } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  if (!canInstall && !iosHint) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (canInstall ? promptInstall() : setShowIosHint((v) => !v))}
        className="rounded-full border border-amber-900/40 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/10"
      >
        Install App
      </button>

      {showIosHint && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-xl border border-amber-900/40 bg-[#1c1712] p-3 text-left text-xs text-amber-100/70 shadow-lg">
          Tap the Share icon <span className="text-amber-100">⬆️</span> then{' '}
          <span className="font-semibold text-amber-100">Add to Home Screen</span> to install Beer Tracker.
        </div>
      )}
    </div>
  );
}

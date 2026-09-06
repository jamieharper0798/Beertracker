import { SUBMISSION_MILESTONE } from '../lib/firebase';

export function GroupTotalCard({ liveTotal, sequenceTotal }: { liveTotal: number; sequenceTotal: number }) {
  const toNextMilestone = SUBMISSION_MILESTONE - (sequenceTotal % SUBMISSION_MILESTONE);

  return (
    <div className="rounded-2xl border border-amber-900/40 bg-[#1c1712] p-6 text-center shadow-lg">
      <p className="text-xs uppercase tracking-widest text-amber-100/60">Group Total</p>
      <p className="mt-1 font-[var(--font-display)] text-5xl font-extrabold text-amber-400">{liveTotal}</p>
      <p className="mt-2 text-xs text-amber-100/50">
        {toNextMilestone === SUBMISSION_MILESTONE
          ? `Submission #${sequenceTotal} was a milestone 🎥`
          : `${toNextMilestone} more until beer #${sequenceTotal + toNextMilestone} needs a video 🎥`}
      </p>
    </div>
  );
}

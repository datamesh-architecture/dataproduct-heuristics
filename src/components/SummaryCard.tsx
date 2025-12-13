import { SectionId, STRONG_FIT_THRESHOLDS, SummaryStep } from '../data/heuristics';

interface SummaryCardProps {
  step: SummaryStep;
  totals: Record<SectionId, { score: number; max: number }>;
}

const SummaryCard = ({ step, totals }: SummaryCardProps) => {
  const sectionTotal = totals[step.sectionId];
  const threshold = STRONG_FIT_THRESHOLDS[step.sectionId];
  const progress = sectionTotal.max > 0 ? Math.round((sectionTotal.score / sectionTotal.max) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-900/40">
      <h2 className="text-2xl font-semibold text-white">{step.title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
        <span className="rounded-full border border-slate-700 px-3 py-1">
          {sectionTotal.score} / {sectionTotal.max} pts
        </span>
        <span className="text-slate-400">Progress: {progress}%</span>
        {threshold !== undefined && (
          <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-200">
            Strong fit ≥ {threshold}
          </span>
        )}
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-200">
        {step.description.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {step.note && <p className="mt-4 text-sm text-slate-400">{step.note}</p>}
    </div>
  );
};

export default SummaryCard;

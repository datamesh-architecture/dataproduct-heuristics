import { SectionId, STRONG_FIT_THRESHOLDS, SummaryStep } from '../data/heuristics';

interface SummaryCardProps {
  step: SummaryStep;
  totals: Record<SectionId, { score: number; max: number }>;
}

const SummaryCard = ({ step, totals }: SummaryCardProps) => {
  const sectionTotal = totals[step.sectionId];
  const threshold = STRONG_FIT_THRESHOLDS[step.sectionId];
  const isStrongFit = threshold !== undefined && sectionTotal.score >= threshold;
  const progress = sectionTotal.max > 0 ? Math.round((sectionTotal.score / sectionTotal.max) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <h2 className="text-2xl font-semibold text-slate-900">{step.title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1">
          {sectionTotal.score} / {sectionTotal.max} pts
        </span>
        <span className="text-slate-500">Progress: {progress}%</span>
        {threshold !== undefined && (
          <span
            className={`rounded-full border px-3 py-1 font-medium ${
              isStrongFit
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-rose-300 bg-rose-50 text-rose-700'
            }`}
          >
            {isStrongFit ? 'Strong fit' : 'Not a strong fit'}
          </span>
        )}
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
        {step.description.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {step.note && <p className="mt-4 text-sm text-slate-500">{step.note}</p>}
    </div>
  );
};

export default SummaryCard;

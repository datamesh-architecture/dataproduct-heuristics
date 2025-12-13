import {
  AnswerMap,
  SectionId,
  STRONG_FIT_THRESHOLDS,
  SummaryStep,
  getHardRequirementIssues,
} from '../data/heuristics';

interface SummaryCardProps {
  step: SummaryStep;
  totals: Record<SectionId, { score: number; max: number }>;
  answers: AnswerMap;
  showGoToSummary?: boolean;
  onGoToSummary?: () => void;
}

const SummaryCard = ({
  step,
  totals,
  answers,
  showGoToSummary,
  onGoToSummary,
}: SummaryCardProps) => {
  const sectionTotal = totals[step.sectionId];
  const threshold = STRONG_FIT_THRESHOLDS[step.sectionId];
  const isStrongFit = threshold !== undefined && sectionTotal.score >= threshold;
  const hardRequirementIssues = getHardRequirementIssues(answers).filter(
    (issue) => issue.sectionId === step.sectionId
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <h2 className="text-2xl font-semibold text-slate-900">{step.title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1">
          {sectionTotal.score} / {sectionTotal.max} pts
        </span>
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
      {hardRequirementIssues.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Hard requirements not met in this section:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {hardRequirementIssues.map((issue) => (
              <li key={issue.id}>{issue.prompt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;

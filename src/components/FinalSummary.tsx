import {
  AnswerMap,
  HARD_REQUIREMENT_IDS,
  QuestionStep,
  RecommendationResult,
  SECTION_META,
  SectionId,
  getAnswerLabel,
} from '../data/heuristics';

interface FinalSummaryProps {
  totals: Record<SectionId, { score: number; max: number }>;
  answers: AnswerMap;
  recommendation: RecommendationResult;
  questionSteps: QuestionStep[];
  visibleSections: SectionId[];
  onSelectQuestion?: (questionId: string) => void;
}

const FinalSummary = ({
  totals,
  answers,
  recommendation,
  questionSteps,
  visibleSections,
  onSelectQuestion,
}: FinalSummaryProps) => {
  const hardRequirementIssues = HARD_REQUIREMENT_IDS.filter((id) => answers[id] === 0);
  const statusToClasses = {
    positive: {
      box: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      label: 'text-emerald-600',
    },
    caution: {
      box: 'border-amber-200 bg-amber-50 text-amber-900',
      label: 'text-amber-600',
    },
    negative: {
      box: 'border-rose-200 bg-rose-50 text-rose-900',
      label: 'text-rose-600',
    },
  } as const;
  const currentStatus = statusToClasses[recommendation.status];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <h2 className="text-2xl font-semibold text-slate-900">Overall summary</h2>
      <p className="mt-2 text-slate-600">All responses and their point values are listed below.</p>
      <div className={`mt-4 rounded-xl border p-4 ${currentStatus.box}`}>
        <p className={`text-sm uppercase tracking-wide ${currentStatus.label}`}>Recommendation</p>
        <p className="mt-1 text-lg font-medium">{recommendation.message}</p>
        {hardRequirementIssues.length > 0 && (
          <ul className="mt-2 space-y-1">
            {hardRequirementIssues.map((id) => {
              const step = questionSteps.find((item) => item.id === id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSelectQuestion?.(id)}
                    className="text-left text-sky-600 underline decoration-sky-500 underline-offset-2 transition hover:text-sky-800"
                  >
                    {step?.prompt ?? id}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleSections.map((sectionId) => {
          const { score, max } = totals[sectionId];
          return (
            <div key={sectionId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-500">
                {SECTION_META[sectionId].title}
              </p>
              <p className="text-2xl font-semibold text-slate-900">{score} / {max}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Heuristic</th>
              <th className="px-4 py-3">Answer</th>
              <th className="px-4 py-3">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {questionSteps.map((step) => (
              <tr key={step.id}>
                <td className="px-4 py-3 text-slate-500">{SECTION_META[step.sectionId].title}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSelectQuestion?.(step.id)}
                    className="w-full text-left text-sky-600 underline decoration-sky-500 underline-offset-2 transition hover:text-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                  >
                    {step.prompt}
                  </button>
                </td>
                <td className="px-4 py-3">{getAnswerLabel(step, answers[step.id])}</td>
                <td className="px-4 py-3">{answers[step.id] ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinalSummary;

import {
  AnswerMap,
  HARD_STOP_IDS,
  QuestionStep,
  SECTION_META,
  SectionId,
  STEPS,
  getAnswerLabel,
} from '../data/heuristics';

interface FinalSummaryProps {
  totals: Record<SectionId, { score: number; max: number }>;
  answers: AnswerMap;
  recommendation: string;
}

const questionSteps = STEPS.filter((step): step is QuestionStep => step.kind === 'question');

const FinalSummary = ({ totals, answers, recommendation }: FinalSummaryProps) => {
  const hardStopIssues = HARD_STOP_IDS.filter((id) => answers[id] === 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-900/40">
      <h2 className="text-2xl font-semibold text-white">Outcome transparency</h2>
      <p className="mt-2 text-slate-300">All responses and their point values are listed below.</p>
      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-100">
        <p className="text-sm uppercase tracking-wide text-slate-400">Recommendation</p>
        <p className="mt-1 text-lg font-medium text-white">{recommendation}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.entries(SECTION_META).map(([sectionId, meta]) => {
          const { score, max } = totals[sectionId as SectionId];
          return (
            <div key={sectionId} className="rounded-lg border border-slate-800 p-4">
              <p className="text-sm uppercase tracking-wide text-slate-400">{meta.title}</p>
              <p className="text-2xl font-semibold text-white">{score} / {max}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-slate-800 p-4">
        <p className="text-sm font-semibold text-slate-200">Hard stop check</p>
        {hardStopIssues.length === 0 ? (
          <p className="mt-1 text-sm text-emerald-400">No hard stops triggered.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-300">
            {hardStopIssues.map((id) => {
              const step = questionSteps.find((item) => item.id === id);
              return <li key={id}>{step?.prompt ?? id}</li>;
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Heuristic</th>
              <th className="px-4 py-3">Answer</th>
              <th className="px-4 py-3">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {questionSteps.map((step) => (
              <tr key={step.id}>
                <td className="px-4 py-3 text-slate-400">{SECTION_META[step.sectionId].title}</td>
                <td className="px-4 py-3">{step.prompt}</td>
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

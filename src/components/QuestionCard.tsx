import { HARD_REQUIREMENT_IDS, QuestionStep, getScaleLabels } from '../data/heuristics';

interface QuestionCardProps {
  step: QuestionStep;
  selectedAnswer: number | undefined;
  onAnswer: (value: number) => void;
}

const baseButtonStyles =
  'border flex items-start gap-3 rounded-md px-4 py-3 text-left text-sm text-slate-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400';

const QuestionCard = ({ step, selectedAnswer, onAnswer }: QuestionCardProps) => {
  const labels = getScaleLabels(step.maxScore);
  const isHardRequirement = HARD_REQUIREMENT_IDS.includes(step.id);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <div className="flex min-h-[28px] flex-wrap items-center gap-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">{step.groupTitle}</p>
        {isHardRequirement && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Hard requirement
          </span>
        )}
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{step.prompt}</h2>
      <p className="mt-2 text-sm text-slate-600">Select the statement that best matches your reality.</p>
      <div className="mt-6 grid gap-3">
        {labels.map((label, index) => {
          const isSelected = selectedAnswer === index;
          const buttonClasses = `${baseButtonStyles} ${
            isSelected
              ? 'border-sky-400 bg-sky-50 text-sky-900'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onAnswer(index)}
              className={buttonClasses}
              aria-pressed={isSelected}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;

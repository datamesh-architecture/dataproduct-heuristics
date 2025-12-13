import { QuestionStep } from '../data/heuristics';
import { getScaleLabels } from '../data/heuristics';

interface QuestionCardProps {
  step: QuestionStep;
  selectedAnswer: number | undefined;
  onAnswer: (value: number) => void;
}

const baseButtonStyles =
  'rounded-md border border-slate-600 px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400';

const QuestionCard = ({ step, selectedAnswer, onAnswer }: QuestionCardProps) => {
  const labels = getScaleLabels(step.maxScore);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-900/40">
      <p className="text-xs uppercase tracking-wide text-slate-400">{step.groupTitle}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{step.prompt}</h2>
      <p className="mt-2 text-sm text-slate-400">Select the statement that best matches your reality.</p>
      <div className="mt-6 grid gap-3">
        {labels.map((label, index) => {
          const isSelected = selectedAnswer === index;
          const buttonClasses = `${baseButtonStyles} ${
            isSelected ? 'bg-sky-500/20 border-sky-400 text-white' : 'hover:border-slate-400 hover:bg-slate-800'
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

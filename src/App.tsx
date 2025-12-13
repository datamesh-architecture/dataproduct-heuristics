import { useEffect, useMemo, useState } from 'react';
import FinalSummary from './components/FinalSummary';
import QuestionCard from './components/QuestionCard';
import SummaryCard from './components/SummaryCard';
import {
  AnswerMap,
  STEPS,
  STORAGE_KEY,
  Step,
  getSectionTotals,
  findFirstUnansweredIndex,
  getRecommendation,
  SectionId,
  SECTION_META,
  QuestionStep,
} from './data/heuristics';

interface StoredState {
  answers: AnswerMap;
  currentIndex?: number;
}

const sanitizeAnswerMap = (value: unknown): AnswerMap => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<AnswerMap>(
    (acc, [key, entry]) => {
      if (typeof entry === 'number' && Number.isFinite(entry)) {
        acc[key] = entry;
      }
      return acc;
    },
    {}
  );
};

const parseStoredState = (raw: unknown): StoredState => {
  if (!raw || typeof raw !== 'object') {
    return { answers: {} };
  }

  const record = raw as Record<string, unknown>;
  if ('answers' in record) {
    return {
      answers: sanitizeAnswerMap(record.answers),
      currentIndex:
        typeof record.currentIndex === 'number' && Number.isFinite(record.currentIndex)
          ? record.currentIndex
          : undefined,
    };
  }

  return { answers: sanitizeAnswerMap(record) };
};

const App = () => {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = parseStoredState(JSON.parse(cached));
        setAnswers(parsed.answers);
        if (typeof parsed.currentIndex === 'number') {
          const clampedIndex = Math.max(
            0,
            Math.min(Math.floor(parsed.currentIndex), STEPS.length - 1)
          );
          setCurrentIndex(clampedIndex);
        } else {
          setCurrentIndex(findFirstUnansweredIndex(parsed.answers));
        }
      }
    } catch (error) {
      console.warn('Failed to read saved answers', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, currentIndex })
      );
    } catch (error) {
      console.warn('Failed to persist answers', error);
    }
  }, [answers, currentIndex, isHydrated]);

  const totals = useMemo(() => getSectionTotals(answers), [answers]);
  const recommendation = useMemo(() => getRecommendation(totals, answers), [totals, answers]);
  const questionStepIds = useMemo(
    () =>
      STEPS.filter((step): step is QuestionStep => step.kind === 'question').map(
        (step) => step.id
      ),
    []
  );
  const allQuestionsAnswered = useMemo(
    () => questionStepIds.every((id) => answers[id] !== undefined),
    [answers, questionStepIds]
  );

  const currentStep = STEPS[currentIndex];
  const totalSteps = STEPS.length;
  const currentProgress = Math.round(((currentIndex + 1) / totalSteps) * 100);

  const handleAnswer = (value: number) => {
    if (currentStep.kind !== 'question') {
      return;
    }
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
    goNext();
  };

  const goNext = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const clearAll = () => {
    const confirmed = window.confirm(
      'Start over and clear all saved answers? This cannot be undone.'
    );
    if (!confirmed) {
      return;
    }
    setAnswers({});
    setCurrentIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSelectQuestion = (questionId: string) => {
    const targetIndex = STEPS.findIndex(
      (step) => step.kind === 'question' && step.id === questionId
    );
    if (targetIndex !== -1) {
      setCurrentIndex(targetIndex);
    }
  };

  const goToSummary = () => {
    setCurrentIndex(STEPS.length - 1);
  };

  const canProceed =
    currentStep.kind !== 'question' || answers[currentStep.id] !== undefined;

  const renderStep = (step: Step) => {
    switch (step.kind) {
      case 'question':
        return (
          <QuestionCard
            step={step}
            selectedAnswer={answers[step.id]}
            onAnswer={handleAnswer}
          />
        );
      case 'summary':
        return <SummaryCard step={step} totals={totals} />;
      case 'final':
        return (
          <FinalSummary
            totals={totals}
            answers={answers}
            recommendation={recommendation}
            onSelectQuestion={handleSelectQuestion}
          />
        );
      default:
        return null;
    }
  };

  const activeSectionTitle = (() => {
    if (currentStep.kind === 'question' || currentStep.kind === 'summary') {
      return SECTION_META[currentStep.sectionId].title;
    }
    return 'Recommendation';
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Autonomous Data Product Heuristics</h1>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="self-start rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-400 hover:text-white"
          >
            Start over
          </button>
        </header>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
            <span>
              Step {currentIndex + 1} / {totalSteps}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        <main className="mt-6 flex-1">{renderStep(currentStep)}</main>

        <footer className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            Unsaved? Never. Inputs sync to your browser automatically.
          </div>
          <div className="flex flex-wrap gap-3">
            {allQuestionsAnswered && currentStep.kind === 'question' && (
              <button
                type="button"
                onClick={goToSummary}
                className="rounded-full border border-emerald-500/60 px-5 py-2 text-sm font-medium text-emerald-200 transition hover:border-emerald-400 hover:text-emerald-100"
              >
                Jump to summary
              </button>
            )}
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-100 transition hover:border-slate-400"
              disabled={currentIndex === 0}
            >
              Back
            </button>
            {currentStep.kind !== 'final' && (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                disabled={!canProceed || currentIndex === totalSteps - 1}
              >
                {currentStep.kind === 'question' ? 'Next' : 'Continue'}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;

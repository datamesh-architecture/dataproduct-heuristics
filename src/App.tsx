import { useEffect, useMemo, useRef, useState } from 'react';
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
} from './data/heuristics';

const App = () => {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const hydrationComplete = useRef(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as AnswerMap;
        setAnswers(parsed);
        setCurrentIndex(findFirstUnansweredIndex(parsed));
      }
    } catch (error) {
      console.warn('Failed to read saved answers', error);
    } finally {
      hydrationComplete.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrationComplete.current) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.warn('Failed to persist answers', error);
    }
  }, [answers]);

  const totals = useMemo(() => getSectionTotals(answers), [answers]);
  const recommendation = useMemo(() => getRecommendation(totals, answers), [totals, answers]);

  const currentStep = STEPS[currentIndex];
  const totalSteps = STEPS.length;
  const currentProgress = Math.round(((currentIndex + 1) / totalSteps) * 100);

  const handleAnswer = (value: number) => {
    if (currentStep.kind !== 'question') {
      return;
    }
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
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
    setAnswers({});
    setCurrentIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const canProceed =
    currentStep.kind !== 'question' || answers[currentStep.id] !== undefined;

  const nextLabel = (() => {
    if (currentStep.kind === 'question') {
      return 'Next';
    }
    if (currentStep.kind === 'summary' && currentIndex < totalSteps - 1) {
      return 'Continue';
    }
    return 'Done';
  })();

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
        return <FinalSummary totals={totals} answers={answers} recommendation={recommendation} />;
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
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Data product cut</p>
            <h1 className="text-3xl font-bold text-white">Decision canvas assistant</h1>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="self-start rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-400 hover:text-white"
          >
            Clear saved answers
          </button>
        </header>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
            <span>Focus: {activeSectionTitle}</span>
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-100 transition hover:border-slate-400"
              disabled={currentIndex === 0}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              disabled={!canProceed || currentIndex === totalSteps - 1}
            >
              {nextLabel}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;

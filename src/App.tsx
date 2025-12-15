import { useEffect, useMemo, useState } from 'react';
import ArchetypeSelector from './components/ArchetypeSelector';
import FinalSummary from './components/FinalSummary';
import QuestionCard from './components/QuestionCard';
import SummaryCard from './components/SummaryCard';
import {
  ARCHETYPE_IDS,
  DEFAULT_SELECTED_ARCHETYPE,
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
  ArchetypeId,
  SelectedArchetype,
  SECTION_QUESTION_IDS,
  SummaryStep,
  getQualifiedArchetypes,
} from './data/heuristics';

interface StoredState {
  answers: AnswerMap;
  currentIndex?: number;
  selectedArchetype?: SelectedArchetype;
}

interface ArchetypeSelectionStep {
  kind: 'archetype-selection';
  id: 'archetype-selection';
}

type FlowStep = Step | ArchetypeSelectionStep;

const ARCHETYPE_SELECTION_STEP: ArchetypeSelectionStep = {
  kind: 'archetype-selection',
  id: 'archetype-selection',
};

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

const sanitizeSelectedArchetype = (value: unknown): SelectedArchetype | undefined => {
  if (typeof value === 'string' && ARCHETYPE_IDS.includes(value as ArchetypeId)) {
    return value as ArchetypeId;
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const selectedFromMap = ARCHETYPE_IDS.find((id) => record[id] === true);
  return selectedFromMap ?? undefined;
};

const deriveSelectionFromAnswers = (answers: AnswerMap): SelectedArchetype => {
  const firstArchetypeWithAnswers = ARCHETYPE_IDS.find((id) =>
    SECTION_QUESTION_IDS[id].some((questionId) => answers[questionId] !== undefined)
  );

  return firstArchetypeWithAnswers ?? DEFAULT_SELECTED_ARCHETYPE;
};

const isSectionBoundStep = (step: Step): step is QuestionStep | SummaryStep =>
  step.kind === 'question' || step.kind === 'summary';

const shouldIncludeStep = (step: Step, selectedArchetype: SelectedArchetype) => {
  if (!isSectionBoundStep(step)) {
    return true;
  }
  if (step.sectionId === 'general') {
    return true;
  }
  return selectedArchetype === step.sectionId;
};

const getContentSteps = (selectedArchetype: SelectedArchetype): Step[] =>
  STEPS.filter((step) => shouldIncludeStep(step, selectedArchetype));

const getFlowSteps = (selectedArchetype: SelectedArchetype): FlowStep[] => [
  ARCHETYPE_SELECTION_STEP,
  ...getContentSteps(selectedArchetype),
];

const parseStoredState = (raw: unknown): StoredState => {
  if (!raw || typeof raw !== 'object') {
    return { answers: {} };
  }

  const record = raw as Record<string, unknown>;
  if ('answers' in record) {
    const rawSelection =
      'selectedArchetype' in record ? record.selectedArchetype : record.selectedArchetypes;
    return {
      answers: sanitizeAnswerMap(record.answers),
      currentIndex:
        typeof record.currentIndex === 'number' && Number.isFinite(record.currentIndex)
          ? record.currentIndex
          : undefined,
      selectedArchetype: sanitizeSelectedArchetype(rawSelection),
    };
  }

  return { answers: sanitizeAnswerMap(record) };
};

const App = () => {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [selectedArchetype, setSelectedArchetype] = useState<SelectedArchetype>(
    DEFAULT_SELECTED_ARCHETYPE
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = parseStoredState(JSON.parse(cached));
        setAnswers(parsed.answers);
        const storedSelection =
          parsed.selectedArchetype ?? deriveSelectionFromAnswers(parsed.answers);
        setSelectedArchetype(storedSelection);
        const contentSteps = getContentSteps(storedSelection);
        const flowSteps = getFlowSteps(storedSelection);
        if (typeof parsed.currentIndex === 'number') {
          const offset = parsed.selectedArchetype ? 0 : 1;
          const adjustedIndex = Math.max(
            0,
            Math.min(Math.floor(parsed.currentIndex + offset), flowSteps.length - 1)
          );
          setCurrentIndex(adjustedIndex);
        } else {
          const firstUnanswered = findFirstUnansweredIndex(parsed.answers, contentSteps);
          setCurrentIndex(firstUnanswered + 1);
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
        JSON.stringify({ answers, currentIndex, selectedArchetype })
      );
    } catch (error) {
      console.warn('Failed to persist answers', error);
    }
  }, [answers, currentIndex, isHydrated, selectedArchetype]);

  const contentSteps = useMemo(() => getContentSteps(selectedArchetype), [selectedArchetype]);
  const steps = useMemo<FlowStep[]>(
    () => [ARCHETYPE_SELECTION_STEP, ...contentSteps],
    [contentSteps]
  );
  const questionSteps = useMemo(
    () => contentSteps.filter((step): step is QuestionStep => step.kind === 'question'),
    [contentSteps]
  );
  const questionStepIds = useMemo(
    () => questionSteps.map((step) => step.id),
    [questionSteps]
  );
  const allQuestionsAnswered = useMemo(
    () => questionStepIds.every((id) => answers[id] !== undefined),
    [answers, questionStepIds]
  );

  const totals = useMemo(() => getSectionTotals(answers, contentSteps), [answers, contentSteps]);
  const activeArchetypes = useMemo(
    () => (selectedArchetype ? [selectedArchetype] : []),
    [selectedArchetype]
  );
  const recommendation = useMemo(
    () => getRecommendation(totals, answers, activeArchetypes),
    [totals, answers, activeArchetypes]
  );
  const recommendedArchetype = useMemo(
    () => getQualifiedArchetypes(totals, activeArchetypes)[0] ?? null,
    [totals, activeArchetypes]
  );
  const visibleSectionIds = useMemo<SectionId[]>(
    () => ['general', ...activeArchetypes],
    [activeArchetypes]
  );

  const totalSteps = steps.length;
  const effectiveIndex = Math.min(currentIndex, totalSteps - 1);
  const currentStep = steps[effectiveIndex];
  const currentProgress = Math.round(((effectiveIndex + 1) / totalSteps) * 100);
  const isOnFirstStep = effectiveIndex === 0;
  const isLastStep = effectiveIndex === totalSteps - 1;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    setCurrentIndex((prev) => Math.min(prev, Math.max(steps.length - 1, 0)));
  }, [isHydrated, steps.length]);

  const hasSelectedArchetype = activeArchetypes.length > 0;

  const handleSelectArchetype = (archetypeId: ArchetypeId) => {
    setSelectedArchetype((prev) => (prev === archetypeId ? null : archetypeId));
  };

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
    setSelectedArchetype(DEFAULT_SELECTED_ARCHETYPE);
    setCurrentIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSelectQuestion = (questionId: string) => {
    const targetIndex = steps.findIndex(
      (step) => step.kind === 'question' && step.id === questionId
    );
    if (targetIndex !== -1) {
      setCurrentIndex(targetIndex);
    }
  };

  const goToSummary = () => {
    setCurrentIndex(steps.length - 1);
  };

  const canProceed = (() => {
    if (currentStep.kind === 'question') {
      return answers[currentStep.id] !== undefined;
    }
    if (currentStep.kind === 'archetype-selection') {
      return hasSelectedArchetype;
    }
    return true;
  })();

  const renderStep = (step: FlowStep) => {
    switch (step.kind) {
      case 'archetype-selection':
        return (
          <ArchetypeSelector selectedArchetype={selectedArchetype} onSelect={handleSelectArchetype} />
        );
      case 'question':
        return (
          <QuestionCard
            step={step}
            selectedAnswer={answers[step.id]}
            onAnswer={handleAnswer}
          />
        );
      case 'summary':
        return (
          <SummaryCard
            step={step}
            totals={totals}
            answers={answers}
            showGoToSummary={allQuestionsAnswered}
            onGoToSummary={goToSummary}
          />
        );
      case 'final':
        return (
          <FinalSummary
            totals={totals}
            answers={answers}
            recommendation={recommendation}
            questionSteps={questionSteps}
            visibleSections={visibleSectionIds}
            selectedArchetype={selectedArchetype}
            recommendedArchetype={recommendedArchetype}
            onGoToArchetypeSelection={() => setCurrentIndex(0)}
            onSelectQuestion={handleSelectQuestion}
          />
        );
      default:
        return null;
    }
  };

  const activeSectionTitle = (() => {
    if (currentStep.kind === 'archetype-selection') {
      return 'Tell us about your data product';
    }
    if (currentStep.kind === 'question' || currentStep.kind === 'summary') {
      return SECTION_META[currentStep.sectionId].title;
    }
    return 'Recommendation';
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Autonomous Data Product Heuristics</h1>
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            Start over
          </button>
        </header>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm shadow-amber-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Work in progress
          </p>
          <p className="mt-1 text-sm text-amber-800">
            This tool is under active development and its guidance may change.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/80">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
            <span>
              Step {effectiveIndex + 1} / {totalSteps}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        <main className="mt-6 flex-1">{renderStep(currentStep)}</main>

        <footer className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div />
          <div className="flex flex-wrap gap-3">
            {allQuestionsAnswered && currentStep.kind !== 'final' && (
              <button
                type="button"
                onClick={goToSummary}
                className="rounded-full border border-emerald-300 bg-white px-5 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-800"
              >
                Go to summary
              </button>
            )}
            {currentStep.kind !== 'archetype-selection' && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                disabled={isOnFirstStep}
              >
                Back
              </button>
            )}
            {currentStep.kind !== 'final' && (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                disabled={!canProceed || isLastStep}
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

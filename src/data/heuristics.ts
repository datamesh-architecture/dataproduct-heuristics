export type SectionId = 'general' | 'source' | 'aggregate' | 'consumer' | 'hardStops';

export interface QuestionStep {
  kind: 'question';
  id: string;
  sectionId: SectionId;
  groupTitle: string;
  prompt: string;
  maxScore: 1 | 2 | 3;
}

export interface SummaryStep {
  kind: 'summary';
  id: string;
  sectionId: SectionId;
  title: string;
  description: string[];
  note?: string;
  strongFitThreshold?: number;
}

export interface FinalStep {
  kind: 'final';
  id: string;
  title: string;
}

export type Step = QuestionStep | SummaryStep | FinalStep;

export type AnswerMap = Record<string, number>;

export const STORAGE_KEY = 'data-product-cut-answers';

const createQuestion = (
  id: string,
  sectionId: SectionId,
  groupTitle: string,
  prompt: string,
  maxScore: QuestionStep['maxScore']
): QuestionStep => ({
  kind: 'question',
  id,
  sectionId,
  groupTitle,
  prompt,
  maxScore,
});

const generalQuestions: QuestionStep[] = [
  createQuestion('general-clear-teams', 'general', 'Clear consumer & use case', 'Do concrete teams or roles exist now?', 2),
  createQuestion(
    'general-no-stitching',
    'general',
    'Clear consumer & use case',
    'Can consumers use this without stitching other products?',
    2
  ),
  createQuestion(
    'general-purpose-one-sentence',
    'general',
    'Clear consumer & use case',
    'Can you describe its purpose in one sentence?',
    2
  ),
  createQuestion('general-single-owner', 'general', 'Stable ownership', 'Is one accountable team in place?', 2),
  createQuestion(
    'general-future-owner',
    'general',
    'Stable ownership',
    'Would the owner credibly handle future changes?',
    2
  ),
  createQuestion(
    'general-standalone-unit',
    'general',
    'Low integration burden',
    'Is this the smallest useful standalone unit?',
    2
  ),
  createQuestion(
    'general-immediate-use',
    'general',
    'Low integration burden',
    'Can a consumer start using it immediately?',
    2
  ),
  createQuestion('general-needed-only', 'general', 'Bounded scope', 'Does it include only what is needed?', 2),
  createQuestion(
    'general-no-speculative-data',
    'general',
    'Bounded scope',
    'Does it exclude speculative future data?',
    2
  ),
  createQuestion(
    'general-independent-sla',
    'general',
    'Distinct SLA & quality',
    'Does it have independent latency, freshness, and data-quality rules?',
    2
  ),
  createQuestion(
    'general-coherent-operations',
    'general',
    'Coherent operations',
    'Do operations share similar batch/stream cadence and latency?',
    2
  ),
];

const sourceQuestions: QuestionStep[] = [
  createQuestion('source-one-event', 'source', 'Source-aligned', 'Is there one coherent business event type?', 2),
  createQuestion('source-standalone-sense', 'source', 'Source-aligned', 'Does the product make sense on its own?', 2),
  createQuestion(
    'source-domain-modules',
    'source',
    'Source-aligned',
    'Does it follow domain modules rather than whole systems?',
    2
  ),
  createQuestion('source-local-dimensions', 'source', 'Source-aligned', 'Are dimensions mostly local?', 2),
  createQuestion(
    'source-isolated-changes',
    'source',
    'Source-aligned',
    'Do source model changes affect only this data product?',
    2
  ),
];

const aggregateQuestions: QuestionStep[] = [
  createQuestion('aggregate-broad-demand', 'aggregate', 'Aggregate', 'Do three or more teams need the same semantics?', 3),
  createQuestion(
    'aggregate-duplicate-integration',
    'aggregate',
    'Aggregate',
    'Would duplicate integrations be costly?',
    3
  ),
  createQuestion(
    'aggregate-combined-value',
    'aggregate',
    'Aggregate',
    'Does value emerge only after combining sources?',
    3
  ),
  createQuestion('aggregate-expensive-derivation', 'aggregate', 'Aggregate', 'Is derivation expensive (features, matching, etc.)?', 3),
  createQuestion(
    'aggregate-clear-owner',
    'aggregate',
    'Aggregate',
    'Is there a clear owner for semantics and cost?',
    3
  ),
  createQuestion(
    'aggregate-tight-scope',
    'aggregate',
    'Aggregate',
    'Is the scope tight with strong governance?',
    3
  ),
];

const consumerQuestions: QuestionStep[] = [
  createQuestion('consumer-job', 'consumer', 'Consumer-aligned', 'Is there one clear job to be done?', 3),
  createQuestion('consumer-verb-object', 'consumer', 'Consumer-aligned', 'Is the purpose framed as verb + object?', 3),
  createQuestion(
    'consumer-artifact',
    'consumer',
    'Consumer-aligned',
    'Does it map roughly to one artifact for the consumer?',
    3
  ),
  createQuestion(
    'consumer-boundary',
    'consumer',
    'Consumer-aligned',
    'Does the boundary follow a decision or process?',
    3
  ),
  createQuestion(
    'consumer-named-consumers',
    'consumer',
    'Consumer-aligned',
    'Are the business consumers explicitly named?',
    2
  ),
  createQuestion(
    'consumer-no-catchall',
    'consumer',
    'Consumer-aligned',
    'Is the scope free of catch-all requests?',
    2
  ),
];

const hardStopQuestions: QuestionStep[] = [
  createQuestion('hard-owner', 'hardStops', 'Hard stops', 'Is there a clear operational owner?', 1),
  createQuestion(
    'hard-domain-split',
    'hardStops',
    'Hard stops',
    'Is the source-aligned cut limited to a single domain?',
    1
  ),
  createQuestion(
    'hard-cost-owner',
    'hardStops',
    'Hard stops',
    'Is there a clear owner for costs?',
    1
  ),
  createQuestion(
    'hard-named-consumers',
    'hardStops',
    'Hard stops',
    'Do you have named business consumers?',
    1
  ),
];

const summarySteps: SummaryStep[] = [
  {
    kind: 'summary',
    id: 'general-summary',
    sectionId: 'general',
    title: 'General viability summary',
    description: [
      'General score < 14 → This is not a data product yet. Rework the boundary first.',
      'General score ≥ 14 → Proceed to the archetype checks.',
    ],
    note: 'Score honestly and look for clear signals, not perfection.',
  },
  {
    kind: 'summary',
    id: 'source-summary',
    sectionId: 'source',
    title: 'Source-aligned summary',
    description: ['Score ≥ 8 indicates a strong source-aligned fit.'],
  },
  {
    kind: 'summary',
    id: 'aggregate-summary',
    sectionId: 'aggregate',
    title: 'Aggregate summary',
    description: ['Score ≥ 13 indicates a strong aggregate fit.'],
  },
  {
    kind: 'summary',
    id: 'consumer-summary',
    sectionId: 'consumer',
    title: 'Consumer-aligned summary',
    description: ['Score ≥ 12 indicates a strong consumer-aligned fit.'],
  },
  {
    kind: 'summary',
    id: 'hard-summary',
    sectionId: 'hardStops',
    title: 'Hard stops reminder',
    description: [
      'Any “no” on these checks is a blocker.',
      'Resolve owners, domain boundaries, and named consumers before continuing.',
    ],
  },
];

const finalStep: FinalStep = {
  kind: 'final',
  id: 'final-summary',
  title: 'Overall summary',
};

export const STEPS: Step[] = [
  ...generalQuestions,
  summarySteps[0],
  ...sourceQuestions,
  summarySteps[1],
  ...aggregateQuestions,
  summarySteps[2],
  ...consumerQuestions,
  summarySteps[3],
  ...hardStopQuestions,
  summarySteps[4],
  finalStep,
];

export const SECTION_META: Record<SectionId, { title: string }> = {
  general: { title: 'General viability' },
  source: { title: 'Source-aligned' },
  aggregate: { title: 'Aggregate' },
  consumer: { title: 'Consumer-aligned' },
  hardStops: { title: 'Hard stops' },
};

export const SECTION_QUESTION_IDS: Record<SectionId, string[]> = {
  general: generalQuestions.map((q) => q.id),
  source: sourceQuestions.map((q) => q.id),
  aggregate: aggregateQuestions.map((q) => q.id),
  consumer: consumerQuestions.map((q) => q.id),
  hardStops: hardStopQuestions.map((q) => q.id),
};

export const HARD_STOP_IDS = SECTION_QUESTION_IDS.hardStops;

export const STRONG_FIT_THRESHOLDS: Partial<Record<SectionId, number>> = {
  general: 14,
  source: 8,
  aggregate: 13,
  consumer: 12,
};

export const RECOMMENDATION_THRESHOLDS: Record<
  Exclude<SectionId, 'general' | 'hardStops'>,
  number
> = {
  source: 9,
  aggregate: 13,
  consumer: 12,
};

export const getScaleLabels = (maxScore: QuestionStep['maxScore']): string[] => {
  switch (maxScore) {
    case 1:
      return ['No', 'Yes'];
    case 2:
      return ['No', 'Partially / unclear', 'Yes'];
    case 3:
      return ['No', 'Limited evidence', 'Mostly there', 'Fully there'];
    default:
      return [];
  }
};

export const getAnswerLabel = (
  step: QuestionStep,
  value: number | undefined
): string => {
  if (value === undefined) {
    return 'Not answered';
  }
  const labels = getScaleLabels(step.maxScore);
  return labels[value] ?? `Score ${value}`;
};

export const getSectionTotals = (answers: AnswerMap) => {
  const totals: Record<SectionId, { score: number; max: number }> = {
    general: { score: 0, max: 0 },
    source: { score: 0, max: 0 },
    aggregate: { score: 0, max: 0 },
    consumer: { score: 0, max: 0 },
    hardStops: { score: 0, max: 0 },
  };

  STEPS.forEach((step) => {
    if (step.kind !== 'question') {
      return;
    }
    totals[step.sectionId].max += step.maxScore;
    const value = answers[step.id];
    if (typeof value === 'number') {
      totals[step.sectionId].score += value;
    }
  });

  return totals;
};

export const findFirstUnansweredIndex = (answers: AnswerMap): number => {
  const index = STEPS.findIndex((step) => {
    if (step.kind !== 'question') {
      return false;
    }
    return answers[step.id] === undefined;
  });

  if (index === -1) {
    return STEPS.length - 1; // final summary
  }

  return index;
};

export const getRecommendation = (
  totals: ReturnType<typeof getSectionTotals>,
  answers: AnswerMap
): string => {
  const generalScore = totals.general.score;
  if (generalScore < 14) {
    return 'General viability is below 14. Rework the boundary before moving ahead.';
  }

  const hardStopIssues = HARD_STOP_IDS.filter((id) => answers[id] === 0);
  if (hardStopIssues.length > 0) {
    return 'Resolve hard stops (ownership, domains, costs, or consumers) before building the product.';
  }

  const fits: string[] = [];
  if (totals.source.score >= RECOMMENDATION_THRESHOLDS.source) {
    fits.push('source-aligned');
  }
  if (totals.aggregate.score >= RECOMMENDATION_THRESHOLDS.aggregate) {
    fits.push('aggregate');
  }
  if (totals.consumer.score >= RECOMMENDATION_THRESHOLDS.consumer) {
    fits.push('consumer-aligned');
  }

  if (fits.length === 0) {
    return 'No archetype fit crossed the threshold. Redesign the cut.';
  }

  if (fits.length === 1) {
    return `Build a ${fits[0]} data product.`;
  }

  return 'Multiple archetypes qualify. Layer the products deliberately.';
};

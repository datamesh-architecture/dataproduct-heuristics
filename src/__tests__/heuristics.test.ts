import {
  STEPS,
  type AnswerMap,
  type SectionId,
  type QuestionStep,
  getRecommendation,
  getSectionTotals,
  getStrongFitThreshold,
} from '../data/heuristics';

type SectionTotals = Record<SectionId, { score: number; max: number }>;

const totalsTemplate = getSectionTotals({}, STEPS);
const strongFitThresholds: Record<SectionId, number> = {
  general: getStrongFitThreshold('general'),
  source: getStrongFitThreshold('source'),
  aggregate: getStrongFitThreshold('aggregate'),
  consumer: getStrongFitThreshold('consumer'),
};
const baseTotals: SectionTotals = {
  general: { score: strongFitThresholds.general + 2, max: totalsTemplate.general.max },
  source: { score: 0, max: totalsTemplate.source.max },
  aggregate: { score: 0, max: totalsTemplate.aggregate.max },
  consumer: { score: 0, max: totalsTemplate.consumer.max },
};

const hardRequirementQuestions = STEPS.filter(
  (step): step is QuestionStep => step.kind === 'question' && step.isHardRequirement === true
);

const safeAnswers: AnswerMap = hardRequirementQuestions.reduce<AnswerMap>((acc, question) => {
  acc[question.id] = question.maxScore;
  return acc;
}, {});

describe('getRecommendation', () => {
  it('bases the recommendation on the chosen archetype when multiple would qualify', () => {
    const totals: SectionTotals = {
      ...baseTotals,
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: strongFitThresholds.source + 1, max: totalsTemplate.source.max },
      aggregate: { score: strongFitThresholds.aggregate + 1, max: totalsTemplate.aggregate.max },
    };

    const result = getRecommendation(totals, safeAnswers, ['aggregate']);

    expect(result.message).toBe('Build an aggregate data product.');
    expect(result.status).toBe('positive');
  });

  it('ignores broken hard requirements for archetypes that do not meet thresholds', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: strongFitThresholds.source + 1, max: totalsTemplate.source.max },
      aggregate: { score: 5, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'aggregate-cost-owner': 0,
    };

    const result = getRecommendation(totals, answers, ['source']);

    expect(result.message).toBe('Build a source-aligned data product.');
    expect(result.status).toBe('positive');
  });

  it('labels consumer recommendations with consumer-aligned wording', () => {
    const totals: SectionTotals = {
      ...baseTotals,
      general: { score: 20, max: totalsTemplate.general.max },
      consumer: { score: strongFitThresholds.consumer + 1, max: totalsTemplate.consumer.max },
    };

    const result = getRecommendation(totals, safeAnswers, ['consumer']);

    expect(result.message).toBe('Build a consumer-aligned data product.');
    expect(result.status).toBe('positive');
  });

  it('mentions qualifying archetype when blocked by a hard requirement', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: strongFitThresholds.source + 2, max: totalsTemplate.source.max },
      aggregate: { score: 0, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'source-domain-modules': 0,
    };

    const result = getRecommendation(totals, answers, ['source']);

    expect(result.message).toBe(
      'Qualifies for source-aligned, but resolve hard requirements before building the product.'
    );
    expect(result.status).toBe('negative');
  });

  it('handles hard requirements when no archetype qualifies', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: strongFitThresholds.source - 1, max: totalsTemplate.source.max },
      aggregate: { score: 0, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'general-single-owner': 0,
    };

    const result = getRecommendation(totals, answers, ['source']);

    expect(result.message).toBe(
      'Archetype does not qualify yet; also resolve hard requirements before building the product.'
    );
    expect(result.status).toBe('negative');
  });

  it('does not surface hard requirements for archetypes that are not qualified', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: strongFitThresholds.source - 1, max: totalsTemplate.source.max },
      aggregate: { score: 0, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'source-domain-modules': 0,
    };

    const result = getRecommendation(totals, answers, ['source']);

    expect(result.message).toBe('Archetype does not qualify yet. Redesign the cut.');
    expect(result.status).toBe('negative');
  });
});

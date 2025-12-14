import {
  HARD_REQUIREMENT_IDS,
  STEPS,
  STRONG_FIT_THRESHOLDS,
  type AnswerMap,
  type SectionId,
  getRecommendation,
  getSectionTotals,
} from '../data/heuristics';

type SectionTotals = Record<SectionId, { score: number; max: number }>;

const totalsTemplate = getSectionTotals({}, STEPS);
const baseTotals: SectionTotals = {
  general: { score: STRONG_FIT_THRESHOLDS.general + 2, max: totalsTemplate.general.max },
  source: { score: 0, max: totalsTemplate.source.max },
  aggregate: { score: 0, max: totalsTemplate.aggregate.max },
  consumer: { score: 0, max: totalsTemplate.consumer.max },
};

const safeAnswers: AnswerMap = HARD_REQUIREMENT_IDS.reduce<AnswerMap>((acc, id) => {
  const question = STEPS.find((step) => step.id === id && step.kind === 'question');
  if (!question || question.kind !== 'question') {
    throw new Error(`Hard requirement id ${id} does not match a question step.`);
  }
  acc[id] = question.maxScore;
  return acc;
}, {});

describe('getRecommendation', () => {
  it('flags multiple archetype fits as a cautionary outcome', () => {
    const totals: SectionTotals = {
      ...baseTotals,
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: STRONG_FIT_THRESHOLDS.source + 1, max: totalsTemplate.source.max },
      aggregate: { score: STRONG_FIT_THRESHOLDS.aggregate + 1, max: totalsTemplate.aggregate.max },
    };

    const result = getRecommendation(totals, safeAnswers);

    expect(result.message).toBe('Multiple archetypes qualify. Consider layering the products deliberately.');
    expect(result.status).toBe('caution');
  });

  it('ignores broken hard requirements for archetypes that do not meet thresholds', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: STRONG_FIT_THRESHOLDS.source + 1, max: totalsTemplate.source.max },
      aggregate: { score: 5, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'aggregate-cost-owner': 0,
    };

    const result = getRecommendation(totals, answers);

    expect(result.message).toBe('Build a source-aligned data product.');
    expect(result.status).toBe('positive');
  });

  it('labels consumer recommendations with consumer-aligned wording', () => {
    const totals: SectionTotals = {
      ...baseTotals,
      general: { score: 20, max: totalsTemplate.general.max },
      consumer: { score: STRONG_FIT_THRESHOLDS.consumer + 1, max: totalsTemplate.consumer.max },
    };

    const result = getRecommendation(totals, safeAnswers);

    expect(result.message).toBe('Build a consumer-aligned data product.');
    expect(result.status).toBe('positive');
  });

  it('mentions qualifying archetype when blocked by a hard requirement', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: STRONG_FIT_THRESHOLDS.source + 2, max: totalsTemplate.source.max },
      aggregate: { score: 0, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'source-domain-modules': 0,
    };

    const result = getRecommendation(totals, answers);

    expect(result.message).toBe(
      'Qualifies for source-aligned, but resolve hard requirements before building the product.'
    );
    expect(result.status).toBe('negative');
  });

  it('handles hard requirements when no archetype qualifies', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: STRONG_FIT_THRESHOLDS.source - 1, max: totalsTemplate.source.max },
      aggregate: { score: 0, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'general-single-owner': 0,
    };

    const result = getRecommendation(totals, answers);

    expect(result.message).toBe(
      'No archetype qualifies yet; also resolve hard requirements before building the product.'
    );
    expect(result.status).toBe('negative');
  });

  it('does not surface hard requirements for archetypes that are not qualified', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: totalsTemplate.general.max },
      source: { score: STRONG_FIT_THRESHOLDS.source - 1, max: totalsTemplate.source.max },
      aggregate: { score: 0, max: totalsTemplate.aggregate.max },
      consumer: { score: 0, max: totalsTemplate.consumer.max },
    };

    const answers: AnswerMap = {
      ...safeAnswers,
      'source-domain-modules': 0,
    };

    const result = getRecommendation(totals, answers);

    expect(result.message).toBe('No archetype fit crossed the threshold. Redesign the cut.');
    expect(result.status).toBe('negative');
  });
});

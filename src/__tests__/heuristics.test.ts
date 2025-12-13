import {
  HARD_REQUIREMENT_IDS,
  STEPS,
  STRONG_FIT_THRESHOLDS,
  type AnswerMap,
  type SectionId,
  getRecommendation,
} from '../data/heuristics';

type SectionTotals = Record<SectionId, { score: number; max: number }>;

const baseTotals: SectionTotals = {
  general: { score: 19, max: 22 },
  source: { score: 0, max: 12 },
  aggregate: { score: 0, max: 23 },
  consumer: { score: 0, max: 18 },
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
      general: { score: 20, max: 22 },
      source: { score: STRONG_FIT_THRESHOLDS.source + 1, max: 12 },
      aggregate: { score: STRONG_FIT_THRESHOLDS.aggregate + 1, max: 23 },
    };

    const result = getRecommendation(totals, safeAnswers);

    expect(result.message).toBe('Multiple archetypes qualify. Consider layering the products deliberately.');
    expect(result.status).toBe('caution');
  });

  it('ignores broken hard requirements for archetypes that do not meet thresholds', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: 22 },
      source: { score: STRONG_FIT_THRESHOLDS.source + 1, max: 12 },
      aggregate: { score: 5, max: 23 },
      consumer: { score: 0, max: 18 },
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
      general: { score: 20, max: 22 },
      consumer: { score: STRONG_FIT_THRESHOLDS.consumer + 1, max: 18 },
    };

    const result = getRecommendation(totals, safeAnswers);

    expect(result.message).toBe('Build a consumer-aligned data product.');
    expect(result.status).toBe('positive');
  });

  it('mentions qualifying archetype when blocked by a hard requirement', () => {
    const totals: SectionTotals = {
      general: { score: 20, max: 22 },
      source: { score: STRONG_FIT_THRESHOLDS.source + 2, max: 12 },
      aggregate: { score: 0, max: 23 },
      consumer: { score: 0, max: 18 },
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
      general: { score: 20, max: 22 },
      source: { score: STRONG_FIT_THRESHOLDS.source - 1, max: 12 },
      aggregate: { score: 0, max: 23 },
      consumer: { score: 0, max: 18 },
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
      general: { score: 20, max: 22 },
      source: { score: STRONG_FIT_THRESHOLDS.source - 1, max: 12 },
      aggregate: { score: 0, max: 23 },
      consumer: { score: 0, max: 18 },
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

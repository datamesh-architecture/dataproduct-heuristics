import {
  HARD_REQUIREMENT_IDS,
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
  acc[id] = 1;
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
});

export type SectionId = "general" | "source" | "aggregate" | "consumer";
export type ArchetypeId = Exclude<SectionId, "general">;

export interface QuestionStep {
  kind: "question";
  id: string;
  sectionId: SectionId;
  groupTitle: string;
  prompt: string;
  maxScore: 1 | 2 | 3;
}

export interface SummaryStep {
  kind: "summary";
  id: string;
  sectionId: SectionId;
  title: string;
  description: string[];
  note?: string;
  strongFitThreshold?: number;
}

export interface FinalStep {
  kind: "final";
  id: string;
  title: string;
}

export type Step = QuestionStep | SummaryStep | FinalStep;

export type AnswerMap = Record<string, number>;

export const STORAGE_KEY = "data-product-cut-answers";

export type RecommendationStatus = "positive" | "caution" | "negative";

export interface RecommendationResult {
  message: string;
  status: RecommendationStatus;
}

const createQuestion = (
  id: string,
  sectionId: SectionId,
  groupTitle: string,
  prompt: string,
  maxScore: QuestionStep["maxScore"],
): QuestionStep => ({
  kind: "question",
  id,
  sectionId,
  groupTitle,
  prompt,
  maxScore,
});

const generalQuestions: QuestionStep[] = [
  createQuestion(
    "general-clear-teams",
    "general",
    "Clear consumer & use case",
    "Are there any specific teams or roles that want to use this product right now?",
    2,
  ),
  createQuestion(
    "general-purpose-one-sentence",
    "general",
    "Clear consumer & use case",
    "Can you describe the main purpose in one sentence?",
    2,
  ),
  createQuestion(
    "general-single-owner",
    "general",
    "Stable ownership",
    "Is one specific domain or team accountable for semantics, quality, and operations?",
    2,
  ),
  createQuestion(
    "general-future-owner",
    "general",
    "Stable ownership",
    "Would the owner credibly handle future changes?",
    2,
  ),
  createQuestion(
    "general-standalone-unit",
    "general",
    "Low integration burden",
    "Is this the smallest useful standalone unit that does not force consumers to stitch things together?",
    2,
  ),
  createQuestion(
    "general-immediate-use",
    "general",
    "Low integration burden",
    "Can a typical consumer immediately start using this product meaningfully on their own?",
    2,
  ),
  createQuestion(
    "general-needed-only",
    "general",
    "Bounded scope",
    "Does the product include only what is needed for its purpose?",
    2,
  ),
  createQuestion(
    "general-no-speculative-data",
    "general",
    "Bounded scope",
    "Is it limited to only including things that are useful in the present?",
    2,
  ),
  createQuestion(
    "general-independent-sla",
    "general",
    "Distinct SLA & quality",
    "Can you define the latency, refresh cadence, completeness, and data quality rules for this product independently?",
    2,
  ),
  createQuestion(
    "general-coherent-operations",
    "general",
    "Coherent operations",
    "Do the contents share similar batch versus stream needs, frequency and latency expectations?",
    2,
  ),
];

const sourceQuestions: QuestionStep[] = [
  createQuestion(
    "source-stable-package",
    "source",
    "Source-aligned",
    "Do the data elements belong together from a consumer perspective and form a stable package?",
    2,
  ),
  createQuestion(
    "source-standalone-sense",
    "source",
    "Source-aligned",
    "Does the data product make sense on its own, or does it require the other parts of the source data? ",
    2,
  ),
  createQuestion(
    "source-cohesive-whole",
    "source",
    "Source-aligned",
    "Does it feel like a cohesive, integrated whole rather than a random collection of related items?",
    2,
  ),
  createQuestion(
    "source-domain-modules",
    "source",
    "Source-aligned",
    "Does the cut follow meaningful domain modules rather than whole systems?",
    2,
  ),
  createQuestion(
    "source-local-dimensions",
    "source",
    "Source-aligned",
    "Does the data contain only internal or also cross-domain dimensions?",
    2,
  ),
  createQuestion(
    "source-isolated-changes",
    "source",
    "Source-aligned",
    "Do source changes impact more than one data product?",
    2,
  ),
];

const aggregateQuestions: QuestionStep[] = [
  createQuestion(
    "aggregate-broad-demand",
    "aggregate",
    "Aggregate",
    "Are there more than two teams that need the same derived view with identical meaning?",
    3,
  ),
  createQuestion(
    "aggregate-duplicate-integration",
    "aggregate",
    "Aggregate",
    "Would teams repeatedly build the same integration or calculation without the aggregate?",
    2,
  ),
  createQuestion(
    "aggregate-combined-value",
    "aggregate",
    "Aggregate",
    "Does value emerge only after combining sources?",
    3,
  ),
  createQuestion(
    "aggregate-expensive-derivation",
    "aggregate",
    "Aggregate",
    "Is the derivation expensive (feature engineering, entity matching, deduplication, cross-source joins)?",
    2,
  ),
  createQuestion(
    "aggregate-high-quality-derivation",
    "aggregate",
    "Aggregate",
    "Is a single high-quality derivation more efficient than duplicating logic across teams?",
    2,
  ),
  createQuestion(
    "aggregate-cost-owner",
    "aggregate",
    "Aggregate",
    "Is there someone in the company willing to bear the costs of this data product?",
    3,
  ),
  createQuestion(
    "aggregate-tight-scope",
    "aggregate",
    "Aggregate",
    "Is the scope tight enough so the product is not drifting toward a mini data warehouse?",
    2,
  ),
  createQuestion(
    "aggregate-strong-governance",
    "aggregate",
    "Aggregate",
    "Is the outcome valuable enough to justify the required strong governance?",
    3,
  ),
  createQuestion(
    "aggregate-semantics-owner",
    "aggregate",
    "Aggregate",
    "Can the owning team maintain the integrated semantics, despite spanning multiple sources?",
    3,
  ),
];

const consumerQuestions: QuestionStep[] = [
  createQuestion(
    "consumer-specific-job",
    "consumer",
    "Consumer-aligned",
    "Does the product serve one specific job to be done?",
    2,
  ),
  createQuestion(
    "consumer-exact-data",
    "consumer",
    "Consumer-aligned",
    "Does the product provide exactly the data and semantics needed for that job and does not serve a general purpose?",
    2,
  ),
  createQuestion(
    "consumer-verb-object",
    "consumer",
    "Consumer-aligned",
    "Can this purpose be expressed as a verb + object sentence (for example, monitor churn by segment, forecast demand by categories, or review fraud cases)?",
    3,
  ),
  createQuestion(
    "consumer-artifact",
    "consumer",
    "Consumer-aligned",
    "Does the product roughly map one-to-one to a key artifact (dashboard core, report, reverse ETL output, ML feature set) or does it feed many unrelated dashboards?",
    3,
  ),
  createQuestion(
    "consumer-process-boundary",
    "consumer",
    "Consumer-aligned",
    "Does the boundary follow a process and not a system boundary?",
    2,
  ),
  createQuestion(
    "consumer-decision-boundary",
    "consumer",
    "Consumer-aligned",
    "Does the cut reflect how a consumer acts or decides, not how data happens to be stored?",
    2,
  ),
  createQuestion(
    "consumer-business-consumers",
    "consumer",
    "Consumer-aligned",
    "Are there clear business consumers who need this product now?",
    2,
  ),
  createQuestion(
    "consumer-not-speculative",
    "consumer",
    "Consumer-aligned",
    "Does the product contain only what is required for the use case, not speculative additions?",
    2,
  ),
];

const summarySteps: SummaryStep[] = [
  {
    kind: "summary",
    id: "general-summary",
    sectionId: "general",
    title: "General viability summary",
    description: [
      "General score < 17 → This is not a data product yet. Rework the boundary first.",
      "General score ≥ 17 → Proceed to the archetype checks.",
    ],
    note: "Score honestly and look for clear signals, not perfection.",
  },
  {
    kind: "summary",
    id: "source-summary",
    sectionId: "source",
    title: "Source-aligned summary",
    description: ["Score ≥ 9 indicates a strong source-aligned fit."],
  },
  {
    kind: "summary",
    id: "aggregate-summary",
    sectionId: "aggregate",
    title: "Aggregate summary",
    description: ["Score ≥ 18 indicates a strong aggregate fit."],
  },
  {
    kind: "summary",
    id: "consumer-summary",
    sectionId: "consumer",
    title: "Consumer-aligned summary",
    description: ["Score ≥ 13 indicates a strong consumer-aligned fit."],
  },
];

const finalStep: FinalStep = {
  kind: "final",
  id: "final-summary",
  title: "Overall summary",
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
  finalStep,
];

export const SECTION_META: Record<SectionId, { title: string }> = {
  general: { title: "General viability" },
  source: { title: "Source-aligned" },
  aggregate: { title: "Aggregate" },
  consumer: { title: "Consumer-aligned" },
};

export const SECTION_QUESTION_IDS: Record<SectionId, string[]> = {
  general: generalQuestions.map((q) => q.id),
  source: sourceQuestions.map((q) => q.id),
  aggregate: aggregateQuestions.map((q) => q.id),
  consumer: consumerQuestions.map((q) => q.id),
};

export const ARCHETYPE_IDS: ArchetypeId[] = ["source", "aggregate", "consumer"];
export type ArchetypeSelectionMap = Record<ArchetypeId, boolean>;
export const DEFAULT_ARCHETYPE_SELECTION: ArchetypeSelectionMap = {
  source: true,
  aggregate: false,
  consumer: true,
};

export const HARD_REQUIREMENT_IDS: readonly QuestionStep["id"][] = [
  "general-single-owner",
  "source-domain-modules",
  "aggregate-cost-owner",
  "consumer-business-consumers",
];

export const STRONG_FIT_THRESHOLDS: Record<SectionId, number> = {
  general: 17,
  source: 9,
  aggregate: 18,
  consumer: 13,
};

const ARCHETYPE_LABELS: Record<ArchetypeId, string> = {
  source: "source-aligned",
  aggregate: "aggregate",
  consumer: "consumer-aligned",
};

export const getQualifiedArchetypes = (
  totals: ReturnType<typeof getSectionTotals>,
  archetypes: ArchetypeId[] = ARCHETYPE_IDS,
): ArchetypeId[] =>
  ARCHETYPE_IDS.filter(
    (archetypeId) =>
      archetypes.includes(archetypeId) &&
      totals[archetypeId].score >= STRONG_FIT_THRESHOLDS[archetypeId],
  );

export const getScaleLabels = (
  maxScore: QuestionStep["maxScore"],
): string[] => {
  switch (maxScore) {
    case 1:
      return ["No", "Yes"];
    case 2:
      return ["No", "Partially / unclear", "Yes"];
    case 3:
      return ["No", "Limited evidence", "Mostly there", "Fully there"];
    default:
      return [];
  }
};

export const getAnswerLabel = (
  step: QuestionStep,
  value: number | undefined,
): string => {
  if (value === undefined) {
    return "Not answered";
  }
  const labels = getScaleLabels(step.maxScore);
  return labels[value] ?? `Score ${value}`;
};

export const getSectionTotals = (answers: AnswerMap, steps: Step[] = STEPS) => {
  const totals: Record<SectionId, { score: number; max: number }> = {
    general: { score: 0, max: 0 },
    source: { score: 0, max: 0 },
    aggregate: { score: 0, max: 0 },
    consumer: { score: 0, max: 0 },
  };

  steps.forEach((step) => {
    if (step.kind !== "question") {
      return;
    }
    totals[step.sectionId].max += step.maxScore;
    const value = answers[step.id];
    if (typeof value === "number") {
      totals[step.sectionId].score += value;
    }
  });

  return totals;
};

export const findFirstUnansweredIndex = (
  answers: AnswerMap,
  steps: Step[] = STEPS,
): number => {
  const index = steps.findIndex((step) => {
    if (step.kind !== "question") {
      return false;
    }
    return answers[step.id] === undefined;
  });

  if (index === -1) {
    return steps.length - 1; // final summary
  }

  return index;
};

export const getHardRequirementIssues = (
  answers: AnswerMap,
): QuestionStep[] => {
  const hardRequirementIssues = HARD_REQUIREMENT_IDS.map(
    (id) => STEPS.find((step) => step.id === id) as QuestionStep,
  ).filter(
    (questionStep) => answers[questionStep.id] < questionStep?.maxScore,
  );

  return hardRequirementIssues;
};

export const getRecommendation = (
  totals: ReturnType<typeof getSectionTotals>,
  answers: AnswerMap,
  archetypes: ArchetypeId[] = ARCHETYPE_IDS,
): RecommendationResult => {
  const generalScore = totals.general.score;
  const generalThreshold = STRONG_FIT_THRESHOLDS.general;
  if (generalScore < generalThreshold) {
    return {
      message:
        "General viability is below 19. Rework the boundary before moving ahead.",
      status: "negative",
    };
  }

  const hardRequirementIssues = getHardRequirementIssues(answers);
  const qualifiedArchetypes = getQualifiedArchetypes(totals, archetypes);
  const formatArchetypeLabel = (archetypeId: ArchetypeId) =>
    ARCHETYPE_LABELS[archetypeId];

  const blockingHardRequirements = hardRequirementIssues.filter((issue) => {
    if (issue.sectionId === "general") {
      return true;
    }
    return qualifiedArchetypes.includes(issue.sectionId as ArchetypeId);
  });

  if (blockingHardRequirements.length > 0) {
    const qualifiedLabel =
      qualifiedArchetypes.length > 0
        ? `Qualifies for ${qualifiedArchetypes.map(formatArchetypeLabel).join(", ")}, but `
        : "No archetype qualifies yet; also ";
    return {
      message: `${qualifiedLabel}resolve hard requirements before building the product.`,
      status: "negative",
    };
  }

  const fits: string[] = qualifiedArchetypes.map(formatArchetypeLabel);

  if (fits.length === 0) {
    return {
      message: "No archetype fit crossed the threshold. Redesign the cut.",
      status: "negative",
    };
  }

  if (fits.length === 1) {
    return {
      message: `Build a ${fits[0]} data product.`,
      status: "positive",
    };
  }

  return {
    message:
      "Multiple archetypes qualify. Consider layering the products deliberately.",
    status: "caution",
  };
};

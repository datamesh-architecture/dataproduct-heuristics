import {
  ARCHETYPE_IDS,
  ArchetypeId,
  ArchetypeSelectionMap,
  SECTION_META,
} from '../data/heuristics';

interface ArchetypeSelectorProps {
  selection: ArchetypeSelectionMap;
  onToggle: (archetypeId: ArchetypeId) => void;
}

const QUESTIONS: Record<ArchetypeId, { prompt: string; helper: string }> = {
  source: {
    prompt: 'Would you like the data product to expose data from a production service or an external system?',
    helper: 'Choose this if you are sharing a direct slice of a single upstream system.',
  },
  aggregate: {
    prompt: 'Is your data product an aggregation of data from various domains that should be consumed by other data products?',
    helper: 'Choose this if value appears only after integrating multiple inputs.',
  },
  consumer: {
    prompt:
      'Will your data product serve a specific purpose and be used by business users, data analysts, data scientists, or applications?',
    helper: 'Choose this if you are shaping the product for specific consumers or decisions.',
  },
};

const ArchetypeSelector = ({ selection, onToggle }: ArchetypeSelectorProps) => {
  const hasSelection = ARCHETYPE_IDS.some((id) => selection[id]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <h2 className="text-2xl font-semibold text-slate-900">Tell us about what you are building</h2>
      <p className="mt-2 text-sm text-slate-600">Answer the prompts that fit; we will pull in the right heuristics.</p>
      <div className="mt-6 flex flex-col gap-4">
        {ARCHETYPE_IDS.map((id) => {
          const isSelected = selection[id];
          const title = SECTION_META[id].title;
          const { prompt, helper } = QUESTIONS[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className={`flex flex-col rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${
                isSelected
                  ? 'border-sky-400 bg-sky-50 text-sky-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={isSelected}
            >
              <p className="text-base font-semibold text-slate-900">{prompt}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                  {title}
                </span>
                <span className="text-sm text-slate-600">{helper}</span>
              </div>
            </button>
          );
        })}
      </div>
      {!hasSelection && (
        <p className="mt-4 text-sm text-rose-600">Select at least one statement to continue.</p>
      )}
    </div>
  );
};

export default ArchetypeSelector;

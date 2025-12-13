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

const DESCRIPTIONS: Record<ArchetypeId, string> = {
  source: 'Direct slices of a single data source where ownership sits with one domain.',
  aggregate: 'Integrated and governed packages that combine multiple upstream products.',
  consumer: 'Purpose-built products that mirror how end users act or decide.',
};

const ArchetypeSelector = ({ selection, onToggle }: ArchetypeSelectorProps) => {
  const hasSelection = ARCHETYPE_IDS.some((id) => selection[id]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
      <h2 className="text-2xl font-semibold text-slate-900">Choose the archetypes you want to assess</h2>
      <p className="mt-2 text-sm text-slate-600">
        Pick the archetype heuristics that match what you plan to build. You can adjust this later.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        {ARCHETYPE_IDS.map((id) => {
          const isSelected = selection[id];
          const title = SECTION_META[id].title;
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
              <div className="text-sm uppercase tracking-wide text-slate-500">{title}</div>
              <p className="mt-3 text-sm text-slate-600">{DESCRIPTIONS[id]}</p>
            </button>
          );
        })}
      </div>
      {!hasSelection && (
        <p className="mt-4 text-sm text-rose-600">Select at least one archetype to continue.</p>
      )}
    </div>
  );
};

export default ArchetypeSelector;

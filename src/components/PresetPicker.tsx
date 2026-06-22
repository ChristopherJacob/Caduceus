import { PRESETS } from '../lib/presets';
import type { SoulDraft } from '../lib/model';

interface Props {
  onApply: (draft: SoulDraft) => void;
}

export function PresetPicker({ onApply }: Props) {
  return (
    <div className="presets">
      {PRESETS.map((p) => (
        <button key={p.id} type="button" className="preset" title={p.description}
          onClick={() => onApply({ ...p.draft })}>
          {p.name}
        </button>
      ))}
    </div>
  );
}

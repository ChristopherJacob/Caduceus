import type { Draft } from '../lib/model';
import type { Preset } from '../lib/pack/schema';

interface Props {
  presets: Preset[];
  onApply: (draft: Draft) => void;
}

export function PresetPicker({ presets, onApply }: Props) {
  return (
    <div className="presets">
      {presets.map((p) => (
        <button key={p.id} type="button" className="preset" title={p.description}
          onClick={() => onApply(structuredClone(p.draft))}>
          {p.name}
        </button>
      ))}
    </div>
  );
}

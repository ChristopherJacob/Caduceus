import { DOC_TYPES } from '../lib/docTypes';
import type { DocId } from '../lib/pack/schema';

interface Props {
  active: DocId;
  onSelect: (id: DocId) => void;
}

export function TabBar({ active, onSelect }: Props) {
  return (
    <div className="tab-bar" role="tablist">
      {DOC_TYPES.map((d) => (
        <button key={d.id} role="tab" type="button"
          aria-selected={active === d.id}
          className={`tab${active === d.id ? ' active' : ''}`}
          onClick={() => onSelect(d.id)}>
          {d.label}
        </button>
      ))}
    </div>
  );
}

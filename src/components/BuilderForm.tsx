import type { Draft } from '../lib/model';
import type { SectionDef } from '../lib/pack/schema';
import { ListEditor } from './ListEditor';

interface Props {
  sections: SectionDef[];
  draft: Draft;
  onChange: (draft: Draft) => void;
}

export function BuilderForm({ sections, draft, onChange }: Props) {
  const set = (id: string, value: string | string[] | undefined) => {
    const next = { ...draft };
    if (value === undefined) delete next[id];
    else next[id] = value;
    onChange(next);
  };

  const present = (s: SectionDef) => draft[s.id] !== undefined;

  return (
    <div className="builder">
      {sections.map((s) => {
        if (s.optional && !present(s)) {
          return (
            <button key={s.id} type="button" className="add-section"
              onClick={() => set(s.id, s.kind === 'text' ? '' : [''])}>
              + Add {s.heading}
            </button>
          );
        }

        if (s.kind === 'text') {
          return (
            <label className="field" key={s.id}>
              <span>{s.heading}</span>
              <textarea aria-label={s.heading} rows={3} placeholder={s.placeholder}
                value={(draft[s.id] as string) ?? ''}
                onChange={(e) => set(s.id, e.target.value)} />
              {s.optional && (
                <button type="button" className="remove-section" onClick={() => set(s.id, undefined)}>
                  Remove {s.heading}
                </button>
              )}
            </label>
          );
        }

        return (
          <section className={`field${s.optional ? ' optional' : ''}`} key={s.id}>
            <span>{s.heading}</span>
            <ListEditor label={s.heading} items={(draft[s.id] as string[]) ?? []} placeholder={s.placeholder}
              onChange={(items) => set(s.id, items)} />
            {s.optional && (
              <button type="button" className="remove-section" onClick={() => set(s.id, undefined)}>
                Remove {s.heading}
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}

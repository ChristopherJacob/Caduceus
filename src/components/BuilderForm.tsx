import { useState } from 'react';
import { SoulDraft } from '../lib/model';
import { ListEditor } from './ListEditor';

interface Props {
  draft: SoulDraft;
  onChange: (draft: SoulDraft) => void;
}

export function BuilderForm({ draft, onChange }: Props) {
  const set = (patch: Partial<SoulDraft>) => onChange({ ...draft, ...patch });

  const [showDomain, setShowDomain] = useState(draft.domainPosture !== undefined);
  const [showExamples, setShowExamples] = useState(draft.examples !== undefined);

  const domainPosture = draft.domainPosture ?? { title: '', lines: [''] };
  const examples = draft.examples ?? [''];

  return (
    <div className="builder">
      <label className="field">
        <span>Identity</span>
        <textarea
          aria-label="Identity"
          rows={3}
          placeholder="Who is Hermes? e.g. You are Hermes, a pragmatic engineer…"
          value={draft.identity}
          onChange={(e) => set({ identity: e.target.value })}
        />
      </label>

      <section className="field">
        <span>Style — how it sounds</span>
        <ListEditor label="Style" items={draft.style} placeholder="Be direct."
          onChange={(style) => set({ style })} />
      </section>

      <section className="field">
        <span>What to avoid</span>
        <ListEditor label="Avoid" items={draft.avoid} placeholder="Avoid hype language."
          onChange={(avoid) => set({ avoid })} />
      </section>

      <section className="field">
        <span>Defaults — behavior under ambiguity</span>
        <ListEditor label="Defaults" items={draft.defaults} placeholder="When ambiguous, ask one question."
          onChange={(defaults) => set({ defaults })} />
      </section>

      {showDomain ? (
        <section className="field optional">
          <label>
            <span>Domain title</span>
            <input aria-label="Domain title" value={domainPosture.title}
              placeholder="e.g. Code Review"
              onChange={(e) => set({ domainPosture: { ...domainPosture, title: e.target.value } })} />
          </label>
          <ListEditor label="Domain line" items={domainPosture.lines} placeholder="Prioritize correctness."
            onChange={(lines) => set({ domainPosture: { ...domainPosture, lines } })} />
          <button type="button" className="remove-section"
            onClick={() => { setShowDomain(false); set({ domainPosture: undefined }); }}>
            Remove domain posture
          </button>
        </section>
      ) : (
        <button type="button" className="add-section"
          onClick={() => { setShowDomain(true); set({ domainPosture: { title: '', lines: [''] } }); }}>
          + Add domain posture
        </button>
      )}

      {showExamples ? (
        <section className="field optional">
          <span>Examples</span>
          <ListEditor label="Example" items={examples} placeholder="Say when something is a bad idea."
            onChange={(examples) => set({ examples })} />
          <button type="button" className="remove-section"
            onClick={() => { setShowExamples(false); set({ examples: undefined }); }}>
            Remove examples
          </button>
        </section>
      ) : (
        <button type="button" className="add-section"
          onClick={() => { setShowExamples(true); set({ examples: [''] }); }}>
          + Add examples
        </button>
      )}
    </div>
  );
}

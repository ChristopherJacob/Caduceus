import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Draft } from '../lib/model';
import type { SectionDef, GateRule } from '../lib/pack/schema';
import { generate } from '../lib/generator';
import { evaluateGate } from '../lib/pack/engine';

interface Props {
  sections: SectionDef[];
  gate: GateRule[];
  draft: Draft;
  filename: string;
}

export function PreviewPane({ sections, gate, draft, filename }: Props) {
  const markdown = useMemo(() => generate(sections, draft), [sections, draft]);
  const result = useMemo(() => evaluateGate(gate, draft, sections), [gate, draft, sections]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="preview-pane">
      <div className="export-bar">
        <button type="button" onClick={copy} disabled={!result.ok}>{copied ? 'Copied!' : 'Copy'}</button>
        <button type="button" onClick={download} disabled={!result.ok}>Download {filename}</button>
      </div>
      {!result.ok && (
        <ul className="gate-reasons">
          {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}
      <div className="preview-markdown"><ReactMarkdown>{markdown}</ReactMarkdown></div>
      <details className="preview-raw"><summary>Raw Markdown</summary><pre>{markdown}</pre></details>
    </div>
  );
}

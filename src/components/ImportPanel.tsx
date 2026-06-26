import { useState } from 'react';

interface Props {
  onImport: (markdown: string) => void;
  onClose: () => void;
}

export function ImportPanel({ onImport, onClose }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (trimmed) onImport(text);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  return (
    <div className="import-panel">
      <label className="import-field">
        <span>Paste Markdown</span>
        <textarea
          aria-label="Paste Markdown"
          rows={6}
          placeholder="Paste an existing SOUL.md or AGENTS.md…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="import-actions">
        <label className="import-file">
          Choose file
          <input type="file" accept=".md,text/markdown" onChange={onFile} />
        </label>
        <span className="import-buttons">
          <button type="button" onClick={submit}>Import</button>
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
        </span>
      </div>
    </div>
  );
}

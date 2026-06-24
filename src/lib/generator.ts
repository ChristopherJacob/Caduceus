import { cleanLines } from './model';
import type { Draft } from './model';
import type { SectionDef } from './pack/schema';

function sectionMarkdown(def: SectionDef, draft: Draft): string | null {
  const hashes = def.level === 1 ? '#' : '##';
  const value = draft[def.id];

  if (def.kind === 'text') {
    const text = typeof value === 'string' ? value.trim() : '';
    return text ? `${hashes} ${def.heading}\n${text}` : null;
  }

  const items = cleanLines(Array.isArray(value) ? value : undefined);
  if (items.length === 0) return null;
  return `${hashes} ${def.heading}\n${items.map((s) => `- ${s}`).join('\n')}`;
}

export function generate(sections: SectionDef[], draft: Draft): string {
  const blocks = sections
    .map((def) => sectionMarkdown(def, draft))
    .filter((b): b is string => b !== null);
  return blocks.join('\n\n') + '\n';
}

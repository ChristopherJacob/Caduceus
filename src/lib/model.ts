import type { SectionDef } from './pack/schema';

export type SectionValue = string | string[];
export type Draft = Record<string, SectionValue>;

/** Trim and drop empty entries from a string list. */
export function cleanLines(items: string[] | undefined): string[] {
  return (items ?? []).map((s) => s.trim()).filter(Boolean);
}

/** Build an empty draft: '' for text sections, [] for list sections. */
export function emptyDraft(sections: SectionDef[]): Draft {
  const draft: Draft = {};
  for (const s of sections) draft[s.id] = s.kind === 'text' ? '' : [];
  return draft;
}

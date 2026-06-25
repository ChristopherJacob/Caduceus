import type { Draft } from './model';
import type { DocId, SectionDef } from './pack/schema';

export interface Block {
  heading: string;
  body: string;
}

const HEADING_RE = /^#{1,2}\s+(.*\S)\s*$/;
const BULLET_RE = /^[-*]\s+/;

/** Split Markdown into heading blocks. Preamble before the first heading is an empty-heading block. */
export function splitBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let current: Block = { heading: '', body: '' };
  const push = () => {
    current.body = current.body.replace(/\n+$/, '');
    if (current.heading !== '' || current.body.trim() !== '') blocks.push(current);
  };
  for (const line of markdown.split('\n')) {
    const m = line.match(HEADING_RE);
    if (m) {
      push();
      current = { heading: m[1].trim(), body: '' };
    } else {
      current.body += current.body ? `\n${line}` : line;
    }
  }
  push();
  return blocks;
}

/** Map blocks onto a doc type's sections. Returns the draft plus any unmatched content. */
export function parseForDoc(
  blocks: Block[],
  sections: SectionDef[],
): { draft: Draft; unmatched: { heading: string; body: string }[] } {
  const byHeading = new Map(sections.map((s) => [s.heading.trim().toLowerCase(), s]));
  const draft: Draft = {};
  const unmatched: { heading: string; body: string }[] = [];

  for (const block of blocks) {
    const sec = byHeading.get(block.heading.trim().toLowerCase());
    if (!sec) {
      unmatched.push({ heading: block.heading, body: block.body.trim() });
      continue;
    }
    if (sec.kind === 'text') {
      draft[sec.id] = block.body.trim();
      continue;
    }
    const lines = block.body.split('\n').map((l) => l.trim()).filter(Boolean);
    draft[sec.id] = lines.filter((l) => BULLET_RE.test(l)).map((l) => l.replace(BULLET_RE, '').trim());
    const nonBullet = lines.filter((l) => !BULLET_RE.test(l));
    if (nonBullet.length) unmatched.push({ heading: `${block.heading} (non-list lines)`, body: nonBullet.join('\n') });
  }

  return { draft, unmatched };
}

export interface ParseResult {
  docId: DocId;
  draft: Draft;
  unmatched: { heading: string; body: string }[];
  detection: 'confident' | 'fallback';
}

function countHeadingMatches(blocks: Block[], sections: SectionDef[]): number {
  const set = new Set(sections.map((s) => s.heading.trim().toLowerCase()));
  return blocks.filter((b) => set.has(b.heading.trim().toLowerCase())).length;
}

/**
 * Parse arbitrary Markdown into a draft. Detects the doc type by canonical
 * heading matches; on a tie or zero matches, falls back to `activeTab`.
 */
export function parseMarkdown(
  markdown: string,
  activeTab: DocId,
  sectionsByDoc: Record<DocId, SectionDef[]>,
): ParseResult {
  const blocks = splitBlocks(markdown);
  const soul = countHeadingMatches(blocks, sectionsByDoc.soul);
  const agents = countHeadingMatches(blocks, sectionsByDoc.agents);

  let docId: DocId;
  let detection: 'confident' | 'fallback';
  if (soul > agents && soul >= 1) {
    docId = 'soul';
    detection = 'confident';
  } else if (agents > soul && agents >= 1) {
    docId = 'agents';
    detection = 'confident';
  } else {
    docId = activeTab;
    detection = 'fallback';
  }

  const { draft, unmatched } = parseForDoc(blocks, sectionsByDoc[docId]);
  return { docId, draft, unmatched, detection };
}

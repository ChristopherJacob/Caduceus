import { describe, it, expect } from 'vitest';
import { splitBlocks, parseForDoc } from './parser';
import type { SectionDef } from './pack/schema';

const soulSections: SectionDef[] = [
  { id: 'identity', heading: 'Personality', level: 1, kind: 'text', optional: false, placeholder: '' },
  { id: 'style', heading: 'Style', level: 2, kind: 'list', optional: false, placeholder: '' },
  { id: 'avoid', heading: 'What to avoid', level: 2, kind: 'list', optional: false, placeholder: '' },
];

describe('splitBlocks', () => {
  it('splits on # and ## headings and captures bodies', () => {
    const blocks = splitBlocks('# Personality\nI am Hermes.\n\n## Style\n- Be direct.');
    expect(blocks).toEqual([
      { heading: 'Personality', body: 'I am Hermes.' },
      { heading: 'Style', body: '- Be direct.' },
    ]);
  });

  it('captures preamble before the first heading as an empty-heading block', () => {
    const blocks = splitBlocks('loose text\n# Personality\nx');
    expect(blocks[0]).toEqual({ heading: '', body: 'loose text' });
  });
});

describe('parseForDoc', () => {
  it('maps matching headings; text sections take the body, list sections take bullets', () => {
    const md = '# Personality\nI am Hermes.\n\n## Style\n- Be direct.\n- Say when wrong.';
    const { draft, unmatched } = parseForDoc(splitBlocks(md), soulSections);
    expect(draft).toEqual({ identity: 'I am Hermes.', style: ['Be direct.', 'Say when wrong.'] });
    expect(unmatched).toEqual([]);
  });

  it('collects unrecognized headings as unmatched (lossless), nothing dropped', () => {
    const md = '# Personality\nI am Hermes.\n\n## Tone\nwarm and terse';
    const { draft, unmatched } = parseForDoc(splitBlocks(md), soulSections);
    expect(draft).toEqual({ identity: 'I am Hermes.' });
    expect(unmatched).toEqual([{ heading: 'Tone', body: 'warm and terse' }]);
  });

  it('surfaces non-bullet lines inside a list block as unmatched', () => {
    const md = '## Style\n- Be direct.\nstray prose';
    const { draft, unmatched } = parseForDoc(splitBlocks(md), soulSections);
    expect(draft.style).toEqual(['Be direct.']);
    expect(unmatched).toEqual([{ heading: 'Style (non-list lines)', body: 'stray prose' }]);
  });
});

import { parseMarkdown } from './parser';
import { generate } from './generator';
import { BASELINE_PACK } from './pack/baseline';
import type { DocId } from './pack/schema';

const sectionsByDoc: Record<DocId, SectionDef[]> = {
  soul: BASELINE_PACK.docTypes.soul.sections,
  agents: BASELINE_PACK.docTypes.agents.sections,
};

describe('parseMarkdown', () => {
  it('detects SOUL from its canonical headings', () => {
    const md = '# Personality\nI am Hermes.\n\n## Style\n- Be direct.';
    const r = parseMarkdown(md, 'agents', sectionsByDoc);
    expect(r.docId).toBe('soul');
    expect(r.detection).toBe('confident');
    expect(r.draft.identity).toBe('I am Hermes.');
  });

  it('detects AGENTS from its canonical headings', () => {
    const md = '# Project overview\nA web app.\n\n## Setup & commands\n- `npm test`';
    const r = parseMarkdown(md, 'soul', sectionsByDoc);
    expect(r.docId).toBe('agents');
    expect(r.detection).toBe('confident');
  });

  it('falls back to the active tab when no canonical headings match', () => {
    const r = parseMarkdown('just some notes\n## Random\nx', 'agents', sectionsByDoc);
    expect(r.docId).toBe('agents');
    expect(r.detection).toBe('fallback');
  });

  it('round-trips a generated document back to the same draft', () => {
    const draft = {
      identity: 'You are Hermes, a careful engineer.',
      style: ['Be direct.', 'Say when wrong.'],
      avoid: ['Avoid hype.'],
      defaults: ['Ask one question when ambiguous.'],
    };
    const md = generate(BASELINE_PACK.docTypes.soul.sections, draft);
    const r = parseMarkdown(md, 'soul', sectionsByDoc);
    expect(r.docId).toBe('soul');
    expect(r.draft).toEqual(draft);
    expect(r.unmatched).toEqual([]);
  });
});

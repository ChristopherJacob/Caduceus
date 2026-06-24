import { describe, it, expect } from 'vitest';
import { cleanLines, emptyDraft } from './model';
import type { SectionDef } from './pack/schema';

const sections: SectionDef[] = [
  { id: 'identity', heading: 'Personality', level: 1, kind: 'text', optional: false, placeholder: '' },
  { id: 'style', heading: 'Style', level: 2, kind: 'list', optional: false, placeholder: '' },
];

describe('cleanLines', () => {
  it('trims and drops empties', () => {
    expect(cleanLines([' a ', '', '  ', 'b'])).toEqual(['a', 'b']);
  });
  it('handles undefined', () => {
    expect(cleanLines(undefined)).toEqual([]);
  });
});

describe('emptyDraft', () => {
  it('builds empty values per section kind', () => {
    expect(emptyDraft(sections)).toEqual({ identity: '', style: [] });
  });
});

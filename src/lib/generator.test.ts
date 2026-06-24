import { describe, it, expect } from 'vitest';
import { generate } from './generator';
import type { SectionDef } from './pack/schema';

const sections: SectionDef[] = [
  { id: 'identity', heading: 'Personality', level: 1, kind: 'text', optional: false, placeholder: '' },
  { id: 'style', heading: 'Style', level: 2, kind: 'list', optional: false, placeholder: '' },
  { id: 'examples', heading: 'Examples', level: 2, kind: 'list', optional: true, placeholder: '' },
];

describe('generate', () => {
  it('emits H1 for level-1 text and H2 bullet lists, omitting empty sections', () => {
    const md = generate(sections, { identity: 'I am Hermes.', style: ['Be direct.', ' '], examples: [] });
    expect(md).toBe('# Personality\nI am Hermes.\n\n## Style\n- Be direct.\n');
  });

  it('trims and ends with a single trailing newline', () => {
    const md = generate(sections, { identity: '  hi  ', style: [] });
    expect(md).toBe('# Personality\nhi\n');
  });

  it('returns just a newline for a fully empty draft', () => {
    expect(generate(sections, { identity: '', style: [] })).toBe('\n');
  });
});

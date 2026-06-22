import { describe, it, expect } from 'vitest';
import { generateSoul } from './generator';
import { SoulDraft } from './model';

const base: SoulDraft = {
  identity: 'You are Hermes, a pragmatic engineer.',
  style: ['Be direct.', '  '],
  avoid: ['Avoid hype language.'],
  defaults: ['When ambiguous, ask one clarifying question.'],
};

describe('generateSoul', () => {
  it('emits canonical headings and bullets, dropping empty lines', () => {
    const out = generateSoul(base);
    expect(out).toContain('# Personality\nYou are Hermes, a pragmatic engineer.');
    expect(out).toContain('## Style\n- Be direct.');
    expect(out).toContain('## What to avoid\n- Avoid hype language.');
    expect(out).toContain('## Defaults\n- When ambiguous, ask one clarifying question.');
    expect(out).not.toContain('- \n');
    expect(out.endsWith('\n')).toBe(true);
  });

  it('omits sections with no content', () => {
    const out = generateSoul({ identity: 'X', style: [], avoid: [], defaults: [] });
    expect(out).toContain('# Personality\nX');
    expect(out).not.toContain('## Style');
    expect(out).not.toContain('## What to avoid');
  });

  it('includes optional domain posture and examples when present', () => {
    const out = generateSoul({
      ...base,
      domainPosture: { title: 'Code Review', lines: ['Prioritize correctness.'] },
      examples: ['Say when something is a bad idea.'],
    });
    expect(out).toContain('## Code Review\n- Prioritize correctness.');
    expect(out).toContain('## Examples\n- Say when something is a bad idea.');
  });
});

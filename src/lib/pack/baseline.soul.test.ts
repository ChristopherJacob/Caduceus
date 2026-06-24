import { describe, it, expect } from 'vitest';
import { BASELINE_PACK } from './baseline';
import { scoreDraft, evaluateGate } from './engine';
import type { Draft } from '../model';

const soul = BASELINE_PACK.docTypes.soul;
const score = (d: Draft) => scoreDraft(soul.rubric, d, soul.sections).score;

const pragmatic: Draft = {
  identity: 'You are Hermes, a pragmatic senior engineer who values clarity and correctness over ceremony.',
  style: ['Be direct.', 'Be concise unless complexity requires depth.', 'Say when something is a bad idea.'],
  avoid: ['Avoid hype language.', 'Avoid hedging when you are confident.'],
  defaults: ['When a request is ambiguous, ask one focused clarifying question.', 'Prefer the simplest solution that is correct.'],
};

describe('baseline SOUL rubric parity with v1', () => {
  it('scores the Pragmatic Engineer draft at 100', () => {
    expect(score(pragmatic)).toBe(100);
  });

  it('scores an empty draft at 0', () => {
    expect(score({ identity: '', style: [], avoid: [], defaults: [] })).toBe(0);
  });

  it('penalizes a file-path leak in portability (16 -> 8)', () => {
    const d: Draft = { identity: 'I am Hermes, a careful engineer.', style: ['Use ./src/index.ts as the entry.'], avoid: [], defaults: [] };
    const cats = scoreDraft(soul.rubric, d, soul.sections).categories;
    expect(cats.find((c) => c.key === 'portability')?.score).toBe(8);
  });

  it('gate blocks empty and clears on a valid draft', () => {
    expect(evaluateGate(soul.gate, { identity: '', style: [], avoid: [], defaults: [] }, soul.sections).ok).toBe(false);
    expect(evaluateGate(soul.gate, pragmatic, soul.sections).ok).toBe(true);
  });

  it('rubric weights sum to 100', () => {
    expect(soul.rubric.reduce((s, r) => s + r.max, 0)).toBe(100);
  });
});

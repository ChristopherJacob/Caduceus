import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScorePanel } from './ScorePanel';
import type { DraftScore } from '../lib/pack/engine';

const result: DraftScore = {
  score: 50,
  categories: [
    { key: 'identity', label: 'Identity', score: 18, max: 18, tip: 'Clear identity statement.' },
    { key: 'portability', label: 'Portability', score: 8, max: 16, tip: 'Move to AGENTS.md — found command: npm.', hits: ['command: npm'] },
  ],
};

describe('ScorePanel', () => {
  it('shows total and a tip only for sub-max categories', () => {
    render(<ScorePanel result={result} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.queryByText('Clear identity statement.')).toBeNull();
    expect(screen.getByText(/Move to AGENTS\.md — found/)).toBeInTheDocument();
  });

  it('offers the move action when hits + callback present', () => {
    const onMove = vi.fn();
    render(<ScorePanel result={result} onMoveLeaks={onMove} />);
    fireEvent.click(screen.getByText('Move to AGENTS.md'));
    expect(onMove).toHaveBeenCalledTimes(1);
  });

  it('does not produce NaN width when a category max is 0', () => {
    const zero: DraftScore = { score: 0, categories: [{ key: 'z', label: 'Zero', score: 0, max: 0, tip: 't' }] };
    const { container } = render(<ScorePanel result={zero} />);
    const fill = container.querySelector('.score-bar-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabBar } from './TabBar';

describe('TabBar', () => {
  it('marks the active tab and fires onSelect', () => {
    const onSelect = vi.fn();
    render(<TabBar active="soul" onSelect={onSelect} />);
    expect(screen.getByRole('tab', { name: 'SOUL.md' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'AGENTS.md' }));
    expect(onSelect).toHaveBeenCalledWith('agents');
  });
});

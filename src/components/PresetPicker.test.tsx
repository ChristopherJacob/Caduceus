import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetPicker } from './PresetPicker';
import { PRESETS } from '../lib/presets';

describe('PresetPicker', () => {
  it('applies a preset draft when clicked', async () => {
    const onApply = vi.fn();
    render(<PresetPicker onApply={onApply} />);
    await userEvent.click(screen.getByRole('button', { name: /pragmatic engineer/i }));
    const expected = PRESETS.find((p) => p.id === 'pragmatic-engineer')!.draft;
    expect(onApply).toHaveBeenCalledWith(expected);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresetPicker } from './PresetPicker';
import { presetsFor } from '../lib/presets';
import { BASELINE_PACK } from '../lib/pack/baseline';

describe('PresetPicker', () => {
  it('renders presets and applies a deep copy of the draft', () => {
    const onApply = vi.fn();
    render(<PresetPicker presets={presetsFor(BASELINE_PACK, 'soul')} onApply={onApply} />);
    fireEvent.click(screen.getByText('Pragmatic Engineer'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect((onApply.mock.calls[0][0] as { identity: string }).identity).toContain('pragmatic');
  });
});

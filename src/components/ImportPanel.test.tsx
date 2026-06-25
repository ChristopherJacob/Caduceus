import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportPanel } from './ImportPanel';

describe('ImportPanel', () => {
  it('emits pasted markdown on Import and can be closed', () => {
    const onImport = vi.fn();
    const onClose = vi.fn();
    render(<ImportPanel onImport={onImport} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Paste Markdown'), { target: { value: '# Personality\nHi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(onImport).toHaveBeenCalledWith('# Personality\nHi');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not emit when the textarea is empty', () => {
    const onImport = vi.fn();
    render(<ImportPanel onImport={onImport} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(onImport).not.toHaveBeenCalled();
  });
});

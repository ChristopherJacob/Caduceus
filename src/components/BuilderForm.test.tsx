import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuilderForm } from './BuilderForm';
import { EMPTY_DRAFT } from '../lib/model';

describe('BuilderForm', () => {
  it('edits the identity field', async () => {
    const onChange = vi.fn();
    render(<BuilderForm draft={EMPTY_DRAFT} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/identity/i), 'Hi');
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0];
    expect(last.identity).toContain('i');
  });

  it('reveals the optional domain posture section on demand', async () => {
    render(<BuilderForm draft={EMPTY_DRAFT} onChange={vi.fn()} />);
    expect(screen.queryByLabelText(/domain title/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add domain posture/i }));
    expect(screen.getByLabelText(/domain title/i)).toBeInTheDocument();
  });
});

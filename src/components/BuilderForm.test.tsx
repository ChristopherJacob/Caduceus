import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuilderForm } from './BuilderForm';
import type { SectionDef } from '../lib/pack/schema';

const sections: SectionDef[] = [
  { id: 'identity', heading: 'Personality', level: 1, kind: 'text', optional: false, placeholder: 'who…' },
  { id: 'style', heading: 'Style', level: 2, kind: 'list', optional: false, placeholder: 'Be direct.' },
  { id: 'examples', heading: 'Examples', level: 2, kind: 'list', optional: true, placeholder: 'eg' },
];

describe('BuilderForm', () => {
  it('edits a text section', () => {
    const onChange = vi.fn();
    render(<BuilderForm sections={sections} draft={{ identity: '', style: [] }} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Personality'), { target: { value: 'I am Hermes.' } });
    expect(onChange).toHaveBeenCalledWith({ identity: 'I am Hermes.', style: [] });
  });

  it('reveals an optional section on demand', () => {
    const onChange = vi.fn();
    render(<BuilderForm sections={sections} draft={{ identity: '', style: [] }} onChange={onChange} />);
    fireEvent.click(screen.getByText('+ Add Examples'));
    expect(onChange).toHaveBeenCalledWith({ identity: '', style: [], examples: [''] });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => localStorage.clear());

describe('App', () => {
  it('renders the SOUL builder and updates the live score when a preset is applied', () => {
    render(<App />);
    expect(screen.getByText('SOUL Creator')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // empty score
    fireEvent.click(screen.getByText('Pragmatic Engineer'));
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('switches to the AGENTS tab and shows its sections', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'AGENTS.md' }));
    expect(screen.getByText('Project overview')).toBeInTheDocument();
    expect(screen.getByText('Setup & commands')).toBeInTheDocument();
  });
});

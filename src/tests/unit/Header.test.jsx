import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../components/layout/Header';

describe('Header Component', () => {
  const mockOnModeChange = vi.fn();

  it('should render header with app title', () => {
    render(<Header currentMode="notes" onModeChange={mockOnModeChange} />);

    const title = screen.getByText('Task & Notes App');
    expect(title).toBeInTheDocument();
  });

  it('should apply dark theme classes', () => {
    const { container } = render(<Header currentMode="notes" onModeChange={mockOnModeChange} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-bg-panel');
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-border');
  });

  it('should render ModeToggle component', () => {
    render(<Header currentMode="notes" onModeChange={mockOnModeChange} />);

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should have correct border and padding', () => {
    const { container } = render(<Header currentMode="notes" onModeChange={mockOnModeChange} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('px-6');
    expect(header).toHaveClass('py-4');
  });

  it('should have correct text styling', () => {
    render(<Header currentMode="notes" onModeChange={mockOnModeChange} />);

    const title = screen.getByText('Task & Notes App');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('text-text-primary');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModeToggle from '../../components/layout/ModeToggle';

describe('ModeToggle Component', () => {
  const mockOnModeChange = vi.fn();

  it('should render Notes and Tasks buttons', () => {
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should highlight active mode with yellow background', () => {
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const notesButton = screen.getByText('Notes');
    expect(notesButton).toHaveClass('bg-accent-yellow');
    expect(notesButton).toHaveClass('text-text-inverse');
  });

  it('should apply dark theme to inactive button', () => {
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const tasksButton = screen.getByText('Tasks');
    expect(tasksButton).toHaveClass('bg-bg-elevated');
    expect(tasksButton).toHaveClass('text-text-secondary');
    expect(tasksButton).toHaveClass('border');
  });

  it('should call onModeChange when Notes clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle currentMode="tasks" onModeChange={mockOnModeChange} />);

    const notesButton = screen.getByText('Notes');
    await user.click(notesButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('notes');
  });

  it('should call onModeChange when Tasks clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const tasksButton = screen.getByText('Tasks');
    await user.click(tasksButton);

    expect(mockOnModeChange).toHaveBeenCalledWith('tasks');
  });

  it('should toggle between modes correctly', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    // Notes is active
    expect(screen.getByText('Notes')).toHaveClass('bg-accent-yellow');
    expect(screen.getByText('Tasks')).toHaveClass('bg-bg-elevated');

    // Switch to tasks
    rerender(<ModeToggle currentMode="tasks" onModeChange={mockOnModeChange} />);

    expect(screen.getByText('Tasks')).toHaveClass('bg-accent-yellow');
    expect(screen.getByText('Notes')).toHaveClass('bg-bg-elevated');
  });

  it('should have correct hover states', () => {
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const notesButton = screen.getByText('Notes');
    const tasksButton = screen.getByText('Tasks');

    expect(notesButton).toHaveClass('hover:bg-accent-yellow/90');
    expect(tasksButton).toHaveClass('hover:bg-bg-hover');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const notesButton = screen.getByText('Notes');
    const tasksButton = screen.getByText('Tasks');

    // Tab to buttons
    await user.tab();
    expect(notesButton).toHaveFocus();

    await user.tab();
    expect(tasksButton).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');
    expect(mockOnModeChange).toHaveBeenCalledWith('tasks');
  });

  it('should have correct button styling', () => {
    render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const notesButton = screen.getByText('Notes');
    expect(notesButton).toHaveClass('px-4');
    expect(notesButton).toHaveClass('py-2');
    expect(notesButton).toHaveClass('rounded-button');
    expect(notesButton).toHaveClass('text-sm');
    expect(notesButton).toHaveClass('font-medium');
    expect(notesButton).toHaveClass('transition-colors');
  });

  it('should have inline-flex layout with gap', () => {
    const { container } = render(<ModeToggle currentMode="notes" onModeChange={mockOnModeChange} />);

    const wrapper = container.querySelector('.inline-flex');
    expect(wrapper).toHaveClass('gap-2');
  });
});

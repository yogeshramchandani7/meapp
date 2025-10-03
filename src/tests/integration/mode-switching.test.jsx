import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainLayout from '../../components/layout/MainLayout';

describe('Mode Switching Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should switch from Notes to Tasks mode', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Initially in Notes mode
    expect(screen.getByText('Notes')).toHaveClass('bg-accent-yellow');

    // Switch to Tasks
    const tasksButton = screen.getByText('Tasks');
    await user.click(tasksButton);

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toHaveClass('bg-accent-yellow');
    });

    // Verify Tasks view is shown
    expect(screen.getByText(/no board selected/i) || screen.getByText(/create your first board/i)).toBeInTheDocument();
  });

  it('should switch from Tasks to Notes mode', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Switch to Tasks first
    await user.click(screen.getByText('Tasks'));

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toHaveClass('bg-accent-yellow');
    });

    // Switch back to Notes
    await user.click(screen.getByText('Notes'));

    await waitFor(() => {
      expect(screen.getByText('Notes')).toHaveClass('bg-accent-yellow');
    });

    // Verify Notes view is shown
    expect(screen.getByText(/all notes/i)).toBeInTheDocument();
  });

  it('should preserve Notes data when switching to Tasks', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Create a folder in Notes mode
    await user.click(screen.getByText(/\+ new folder/i));
    await user.type(screen.getByPlaceholderText(/folder name/i), 'Work Notes');
    await user.click(screen.getByText(/add/i));

    await waitFor(() => {
      expect(screen.getByText(/📁 work notes/i)).toBeInTheDocument();
    });

    // Switch to Tasks
    await user.click(screen.getByText('Tasks'));

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toHaveClass('bg-accent-yellow');
    });

    // Switch back to Notes
    await user.click(screen.getByText('Notes'));

    // Verify folder still exists
    await waitFor(() => {
      expect(screen.getByText(/📁 work notes/i)).toBeInTheDocument();
    });
  });

  it('should preserve Tasks data when switching to Notes', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Switch to Tasks mode
    await user.click(screen.getByText('Tasks'));

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toHaveClass('bg-accent-yellow');
    });

    // Create a board
    await user.click(screen.getByText(/\+ new board/i));
    await user.type(screen.getByPlaceholderText(/board name/i), 'Project Board');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/project board/i).length).toBeGreaterThan(0);
    });

    // Switch to Notes
    await user.click(screen.getByText('Notes'));

    await waitFor(() => {
      expect(screen.getByText('Notes')).toHaveClass('bg-accent-yellow');
    });

    // Switch back to Tasks
    await user.click(screen.getByText('Tasks'));

    // Verify board still exists
    await waitFor(() => {
      expect(screen.getAllByText(/project board/i).length).toBeGreaterThan(0);
    });
  });

  it('should highlight correct button in header', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Notes is active by default
    const notesButton = screen.getByText('Notes');
    const tasksButton = screen.getByText('Tasks');

    expect(notesButton).toHaveClass('bg-accent-yellow');
    expect(notesButton).toHaveClass('text-text-inverse');
    expect(tasksButton).toHaveClass('bg-bg-elevated');
    expect(tasksButton).toHaveClass('text-text-secondary');

    // Switch to Tasks
    await user.click(tasksButton);

    await waitFor(() => {
      expect(tasksButton).toHaveClass('bg-accent-yellow');
      expect(tasksButton).toHaveClass('text-text-inverse');
      expect(notesButton).toHaveClass('bg-bg-elevated');
      expect(notesButton).toHaveClass('text-text-secondary');
    });
  });

  it('should work with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    const notesButton = screen.getByText('Notes');
    const tasksButton = screen.getByText('Tasks');

    // Focus on Tasks button directly
    tasksButton.focus();
    expect(tasksButton).toHaveFocus();

    // Press Enter to switch
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(tasksButton).toHaveClass('bg-accent-yellow');
    });
  });

  it('should handle rapid mode switches', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    const notesButton = screen.getByText('Notes');
    const tasksButton = screen.getByText('Tasks');

    // Rapidly switch between modes
    await user.click(tasksButton);
    await user.click(notesButton);
    await user.click(tasksButton);
    await user.click(notesButton);
    await user.click(tasksButton);

    await waitFor(() => {
      expect(tasksButton).toHaveClass('bg-accent-yellow');
    });

    // Verify Tasks view is shown
    expect(screen.getByText(/no board selected/i) || screen.getByText(/create your first board/i)).toBeInTheDocument();
  });

  it('should maintain app state across mode switches', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Create data in Notes mode
    await user.click(screen.getByText(/\+ new folder/i));
    await user.type(screen.getByPlaceholderText(/folder name/i), 'Folder 1');
    await user.click(screen.getByText(/add/i));

    await waitFor(() => {
      expect(screen.getByText(/📁 folder 1/i)).toBeInTheDocument();
    });

    // Switch to Tasks
    await user.click(screen.getByText('Tasks'));

    // Create data in Tasks mode
    await user.click(screen.getByText(/\+ new board/i));
    await user.type(screen.getByPlaceholderText(/board name/i), 'Board 1');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/board 1/i).length).toBeGreaterThan(0);
    });

    // Switch back to Notes
    await user.click(screen.getByText('Notes'));

    // Verify Notes data still exists
    await waitFor(() => {
      expect(screen.getByText(/📁 folder 1/i)).toBeInTheDocument();
    });

    // Switch back to Tasks
    await user.click(screen.getByText('Tasks'));

    // Verify Tasks data still exists
    await waitFor(() => {
      expect(screen.getAllByText(/board 1/i).length).toBeGreaterThan(0);
    });
  });
});

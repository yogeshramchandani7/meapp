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

    // Initially in Notes mode - check mobile header or BottomNav
    expect(screen.getByText('📝 Notes') || screen.getAllByText('Notes').find(el => el.className.includes('text-accent-yellow'))).toBeTruthy();

    // Switch to Tasks - find any Tasks button (desktop header or mobile bottom nav)
    const tasksButtons = screen.getAllByText('Tasks');
    await user.click(tasksButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('✓ Tasks') || screen.getAllByText('Tasks').some(el => el.className.includes('text-accent-yellow'))).toBeTruthy();
    });

    // Verify Tasks view is shown
    expect(screen.getByText(/no board selected/i) || screen.getByText(/create your first board/i)).toBeInTheDocument();
  });

  it('should switch from Tasks to Notes mode', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Switch to Tasks first
    const tasksButtons = screen.getAllByText('Tasks');
    await user.click(tasksButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('✓ Tasks') || screen.getAllByText('Tasks').some(el => el.className.includes('text-accent-yellow'))).toBeTruthy();
    });

    // Switch back to Notes
    const notesButtons = screen.getAllByText('Notes');
    await user.click(notesButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('📝 Notes') || screen.getAllByText('Notes').some(el => el.className.includes('text-accent-yellow'))).toBeTruthy();
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
    const tasksButtons = screen.getAllByText('Tasks');
    await user.click(tasksButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('✓ Tasks')).toBeInTheDocument();
    });

    // Create a board
    await user.click(screen.getByText(/\+ new board/i));
    await user.type(screen.getByPlaceholderText(/board name/i), 'Project Board');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/project board/i).length).toBeGreaterThan(0);
    });

    // Switch to Notes
    const notesButtons = screen.getAllByText('Notes');
    await user.click(notesButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('📝 Notes')).toBeInTheDocument();
    });

    // Switch back to Tasks
    await user.click(screen.getAllByText('Tasks')[0]);

    // Verify board still exists
    await waitFor(() => {
      expect(screen.getAllByText(/project board/i).length).toBeGreaterThan(0);
    });
  });

  it('should highlight correct button in navigation', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    // Notes is active by default - check for active indicator
    expect(screen.getByText('📝 Notes') || screen.getAllByText('Notes').some(el => el.className.includes('text-accent-yellow'))).toBeTruthy();

    // Switch to Tasks
    const tasksButtons = screen.getAllByText('Tasks');
    await user.click(tasksButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('✓ Tasks') || screen.getAllByText('Tasks').some(el => el.className.includes('text-accent-yellow'))).toBeTruthy();
    });
  });

  it('should work with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    const tasksButtons = screen.getAllByText('Tasks');

    // Focus on Tasks button directly
    tasksButtons[0].focus();
    expect(tasksButtons[0]).toHaveFocus();

    // Press Enter to switch
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('✓ Tasks')).toBeInTheDocument();
    });
  });

  it('should handle rapid mode switches', async () => {
    const user = userEvent.setup();
    render(<MainLayout />);

    const notesButtons = screen.getAllByText('Notes');
    const tasksButtons = screen.getAllByText('Tasks');

    // Rapidly switch between modes
    await user.click(tasksButtons[0]);
    await user.click(notesButtons[0]);
    await user.click(tasksButtons[0]);
    await user.click(notesButtons[0]);
    await user.click(tasksButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('✓ Tasks')).toBeInTheDocument();
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
    await user.click(screen.getAllByText('Tasks')[0]);

    // Create data in Tasks mode
    await user.click(screen.getByText(/\+ new board/i));
    await user.type(screen.getByPlaceholderText(/board name/i), 'Board 1');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/board 1/i).length).toBeGreaterThan(0);
    });

    // Switch back to Notes
    await user.click(screen.getAllByText('Notes')[0]);

    // Verify Notes data still exists
    await waitFor(() => {
      expect(screen.getByText(/📁 folder 1/i)).toBeInTheDocument();
    });

    // Switch back to Tasks
    await user.click(screen.getAllByText('Tasks')[0]);

    // Verify Tasks data still exists
    await waitFor(() => {
      expect(screen.getAllByText(/board 1/i).length).toBeGreaterThan(0);
    });
  });
});

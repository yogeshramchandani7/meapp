import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteEditor from '../../components/notes/NoteEditor';
import { useNotesStore } from '../../store/notesStore';

// Mock the store
vi.mock('../../store/notesStore');

describe('NoteEditor Component', () => {
  const mockUpdateNote = vi.fn();
  const mockDeleteNote = vi.fn();
  const mockTogglePinNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNotesStore.mockReturnValue({
      getSelectedNote: () => null,
      updateNote: mockUpdateNote,
      deleteNote: mockDeleteNote,
      togglePinNote: mockTogglePinNote,
    });
  });

  describe('empty state', () => {
    it('should display empty state when no note is selected', () => {
      render(<NoteEditor />);

      expect(screen.getByText(/no note selected/i)).toBeInTheDocument();
      expect(screen.getByText(/select a note or create a new one/i)).toBeInTheDocument();
    });

    it('should not render editor when no note selected', () => {
      render(<NoteEditor />);

      expect(screen.queryByPlaceholderText(/note title/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/start typing/i)).not.toBeInTheDocument();
    });
  });

  describe('with selected note', () => {
    const mockNote = {
      id: 'note-1',
      title: 'Test Note',
      content: 'This is test content',
      updatedAt: new Date('2025-10-02T08:00:00.000Z').toISOString(),
      isPinned: false,
    };

    beforeEach(() => {
      useNotesStore.mockReturnValue({
        getSelectedNote: () => mockNote,
        updateNote: mockUpdateNote,
        deleteNote: mockDeleteNote,
        togglePinNote: mockTogglePinNote,
      });
    });

    it('should render note title and content', () => {
      render(<NoteEditor />);

      const titleInput = screen.getByPlaceholderText(/note title/i);
      const contentTextarea = screen.getByPlaceholderText(/start typing/i);

      expect(titleInput).toHaveValue('Test Note');
      expect(contentTextarea).toHaveValue('This is test content');
    });

    it('should display formatted timestamp', () => {
      render(<NoteEditor />);

      // Check for date part only (time varies by timezone)
      expect(screen.getByText(/october 2, 2025 at \d{1,2}:\d{2} [ap]m/i)).toBeInTheDocument();
    });

    it('should show pin button', () => {
      render(<NoteEditor />);

      expect(screen.getByRole('button', { name: /pin/i })).toBeInTheDocument();
    });

    it('should show delete button', () => {
      render(<NoteEditor />);

      expect(screen.getByRole('button', { name: /delete note/i })).toBeInTheDocument();
    });

    describe('title editing', () => {
      it('should update title on change', async () => {
        const user = userEvent.setup();
        render(<NoteEditor />);

        const titleInput = screen.getByPlaceholderText(/note title/i);
        await user.clear(titleInput);
        await user.type(titleInput, 'New Title');

        await waitFor(() => {
          expect(mockUpdateNote).toHaveBeenCalledWith(
            'note-1',
            expect.objectContaining({ title: 'New Title' })
          );
        }, { timeout: 600 });
      });

      it('should debounce title updates', async () => {
        const user = userEvent.setup();
        render(<NoteEditor />);

        const titleInput = screen.getByPlaceholderText(/note title/i);
        await user.type(titleInput, 'a');
        await user.type(titleInput, 'b');
        await user.type(titleInput, 'c');

        // Should not call immediately
        expect(mockUpdateNote).not.toHaveBeenCalled();

        // Should call after debounce
        await waitFor(() => {
          expect(mockUpdateNote).toHaveBeenCalled();
        }, { timeout: 600 });
      });
    });

    describe('content editing', () => {
      it('should update content on change', async () => {
        const user = userEvent.setup();
        render(<NoteEditor />);

        const contentTextarea = screen.getByPlaceholderText(/start typing/i);
        await user.clear(contentTextarea);
        await user.type(contentTextarea, 'New content');

        await waitFor(() => {
          expect(mockUpdateNote).toHaveBeenCalledWith(
            'note-1',
            expect.objectContaining({ content: 'New content' })
          );
        }, { timeout: 600 });
      });

      it('should handle long content', async () => {
        const user = userEvent.setup();
        render(<NoteEditor />);

        const longContent = 'a'.repeat(1000);
        const contentTextarea = screen.getByPlaceholderText(/start typing/i);
        await user.clear(contentTextarea);
        await user.type(contentTextarea, longContent);

        await waitFor(() => {
          expect(mockUpdateNote).toHaveBeenCalledWith(
            'note-1',
            expect.objectContaining({ content: longContent })
          );
        }, { timeout: 600 });
      });
    });

    describe('pin functionality', () => {
      it('should show "Pin" button when note is not pinned', () => {
        render(<NoteEditor />);

        const pinButton = screen.getByRole('button', { name: /📌 pin$/i });
        expect(pinButton).toBeInTheDocument();
      });

      it('should show "Pinned" button when note is pinned', () => {
        const pinnedNote = { ...mockNote, isPinned: true };
        useNotesStore.mockReturnValue({
          getSelectedNote: () => pinnedNote,
          updateNote: mockUpdateNote,
          deleteNote: mockDeleteNote,
          togglePinNote: mockTogglePinNote,
        });

        render(<NoteEditor />);

        const pinButton = screen.getByRole('button', { name: /📌 pinned/i });
        expect(pinButton).toBeInTheDocument();
      });

      it('should toggle pin when button clicked', async () => {
        const user = userEvent.setup();
        render(<NoteEditor />);

        const pinButton = screen.getByRole('button', { name: /pin/i });
        await user.click(pinButton);

        expect(mockTogglePinNote).toHaveBeenCalledWith('note-1');
      });
    });

    describe('delete functionality', () => {
      it('should show confirmation dialog when delete clicked', async () => {
        const user = userEvent.setup();
        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<NoteEditor />);

        const deleteButton = screen.getByRole('button', { name: /delete note/i });
        await user.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this note?');
        expect(mockDeleteNote).toHaveBeenCalledWith('note-1');

        confirmSpy.mockRestore();
      });

      it('should not delete if user cancels confirmation', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(<NoteEditor />);

        const deleteButton = screen.getByRole('button', { name: /delete note/i });
        await user.click(deleteButton);

        expect(mockDeleteNote).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
      });
    });
  });

  describe('note switching', () => {
    it('should update when different note is selected', () => {
      const { rerender } = render(<NoteEditor />);

      const newNote = {
        id: 'note-2',
        title: 'Different Note',
        content: 'Different content',
        updatedAt: new Date().toISOString(),
        isPinned: false,
      };

      useNotesStore.mockReturnValue({
        getSelectedNote: () => newNote,
        updateNote: vi.fn(),
        deleteNote: vi.fn(),
        togglePinNote: vi.fn(),
      });

      rerender(<NoteEditor />);

      expect(screen.getByPlaceholderText(/note title/i)).toHaveValue('Different Note');
      expect(screen.getByPlaceholderText(/start typing/i)).toHaveValue('Different content');
    });
  });

  describe('accessibility', () => {
    const mockNote = {
      id: 'note-1',
      title: 'Test Note',
      content: 'Content',
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };

    beforeEach(() => {
      useNotesStore.mockReturnValue({
        getSelectedNote: () => mockNote,
        updateNote: mockUpdateNote,
        deleteNote: mockDeleteNote,
        togglePinNote: mockTogglePinNote,
      });
    });

    it('should have accessible inputs', () => {
      render(<NoteEditor />);

      const titleInput = screen.getByPlaceholderText(/note title/i);
      const contentTextarea = screen.getByPlaceholderText(/start typing/i);

      expect(titleInput).toBeInTheDocument();
      expect(contentTextarea).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<NoteEditor />);

      expect(screen.getByRole('button', { name: /pin/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete note/i })).toBeInTheDocument();
    });
  });
});

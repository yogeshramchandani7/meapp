import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useNotesStore } from '../../store/notesStore';
import { act } from '@testing-library/react';

describe('notesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Properly reset Zustand store state
    useNotesStore.setState({
      folders: [],
      notes: [],
      selectedFolderId: null,
      selectedNoteId: null,
      searchQuery: ''
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const state = useNotesStore.getState();

      expect(state.folders).toEqual([]);
      expect(state.notes).toEqual([]);
      expect(state.selectedFolderId).toBeNull();
      expect(state.selectedNoteId).toBeNull();
      expect(state.searchQuery).toBe('');
    });
  });

  describe('loadData', () => {
    it('should load folders and notes from storage', async () => {
      // Pre-populate localStorage
      localStorage.setItem('folders', JSON.stringify([
        { id: 'f1', name: 'Folder 1', noteCount: 0, createdAt: new Date().toISOString() }
      ]));
      localStorage.setItem('notes', JSON.stringify([
        { id: 'n1', folderId: 'f1', title: 'Note 1', content: 'Content', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]));

      await act(async () => {
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      expect(state.folders).toHaveLength(1);
      expect(state.notes).toHaveLength(1);
    });

    it('should select first folder automatically if none selected', async () => {
      localStorage.setItem('folders', JSON.stringify([
        { id: 'f1', name: 'Folder 1', noteCount: 0, createdAt: new Date().toISOString() }
      ]));

      await act(async () => {
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      expect(state.selectedFolderId).toBe('f1');
    });
  });

  describe('folder operations', () => {
    describe('createFolder', () => {
      it('should create a new folder', async () => {
        let folder;
        await act(async () => {
          folder = await useNotesStore.getState().createFolder('My Folder');
        });

        expect(folder).toBeDefined();
        expect(folder.name).toBe('My Folder');
        expect(folder.id).toBeDefined();
        expect(folder.noteCount).toBe(0);

        const state = useNotesStore.getState();
        expect(state.folders).toHaveLength(1);
      });

      it('should persist folder to localStorage', async () => {
        await act(async () => {
          await useNotesStore.getState().createFolder('Test Folder');
        });

        const stored = JSON.parse(localStorage.getItem('folders'));
        expect(stored).toHaveLength(1);
        expect(stored[0].name).toBe('Test Folder');
      });
    });

    describe('updateFolder', () => {
      it('should update an existing folder', async () => {
        let folderId;
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('Original Name');
          folderId = folder.id;
          await useNotesStore.getState().updateFolder(folderId, { name: 'Updated Name' });
        });

        const state = useNotesStore.getState();
        const updated = state.folders.find(f => f.id === folderId);
        expect(updated.name).toBe('Updated Name');
      });

      it('should update noteCount', async () => {
        let folderId;
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('Test');
          folderId = folder.id;
          await useNotesStore.getState().updateFolder(folderId, { noteCount: 5 });
        });

        const state = useNotesStore.getState();
        const updated = state.folders.find(f => f.id === folderId);
        expect(updated.noteCount).toBe(5);
      });
    });

    describe('deleteFolder', () => {
      it('should delete a folder', async () => {
        let folderId;
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('To Delete');
          folderId = folder.id;
          await useNotesStore.getState().deleteFolder(folderId);
        });

        const state = useNotesStore.getState();
        expect(state.folders).toHaveLength(0);
      });

      it('should delete all notes in the folder', async () => {
        let folderId;
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('Test Folder');
          folderId = folder.id;
          await useNotesStore.getState().createNote(folderId, 'Note 1');
          await useNotesStore.getState().createNote(folderId, 'Note 2');
          await useNotesStore.getState().deleteFolder(folderId);
        });

        const state = useNotesStore.getState();
        expect(state.notes).toHaveLength(0);
      });

      it('should unselect folder if currently selected', async () => {
        let folderId;
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('Test');
          folderId = folder.id;
          useNotesStore.getState().selectFolder(folderId);
          await useNotesStore.getState().deleteFolder(folderId);
        });

        const state = useNotesStore.getState();
        expect(state.selectedFolderId).toBeNull();
      });
    });

    describe('selectFolder', () => {
      it('should select a folder', async () => {
        let folderId;
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('Test');
          folderId = folder.id;
          useNotesStore.getState().selectFolder(folderId);
        });

        const state = useNotesStore.getState();
        expect(state.selectedFolderId).toBe(folderId);
      });

      it('should clear selected note when selecting folder', async () => {
        await act(async () => {
          const folder = await useNotesStore.getState().createFolder('Test');
          const note = await useNotesStore.getState().createNote(folder.id);
          useNotesStore.getState().selectNote(note.id);
          useNotesStore.getState().selectFolder(folder.id);
        });

        const state = useNotesStore.getState();
        expect(state.selectedNoteId).toBeNull();
      });
    });
  });

  describe('note operations', () => {
    let folderId;

    beforeEach(async () => {
      await act(async () => {
        const folder = await useNotesStore.getState().createFolder('Test Folder');
        folderId = folder.id;
        useNotesStore.getState().selectFolder(folderId);
      });
    });

    describe('createNote', () => {
      it('should create a note in the selected folder', async () => {
        let note;
        await act(async () => {
          note = await useNotesStore.getState().createNote(folderId, 'My Note', 'Content here');
        });

        expect(note).toBeDefined();
        expect(note.title).toBe('My Note');
        expect(note.content).toBe('Content here');
        expect(note.folderId).toBe(folderId);
      });

      it('should auto-select created note', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
        });

        const state = useNotesStore.getState();
        expect(state.selectedNoteId).toBe(noteId);
      });

      it('should increment folder noteCount', async () => {
        await act(async () => {
          await useNotesStore.getState().createNote(folderId);
          await useNotesStore.getState().createNote(folderId);
        });

        const state = useNotesStore.getState();
        const folder = state.folders.find(f => f.id === folderId);
        expect(folder.noteCount).toBe(2);
      });

      it('should set isPinned to false by default', async () => {
        let note;
        await act(async () => {
          note = await useNotesStore.getState().createNote(folderId);
        });

        expect(note.isPinned).toBe(false);
      });

      it('should persist to localStorage', async () => {
        await act(async () => {
          await useNotesStore.getState().createNote(folderId, 'Test Note');
        });

        const stored = JSON.parse(localStorage.getItem('notes'));
        expect(stored).toHaveLength(1);
        expect(stored[0].title).toBe('Test Note');
      });
    });

    describe('updateNote', () => {
      it('should update note content', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId, 'Original');
          noteId = note.id;
          await useNotesStore.getState().updateNote(noteId, { content: 'Updated content' });
        });

        const state = useNotesStore.getState();
        const updated = state.notes.find(n => n.id === noteId);
        expect(updated.content).toBe('Updated content');
      });

      it('should update title', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
          await useNotesStore.getState().updateNote(noteId, { title: 'New Title' });
        });

        const state = useNotesStore.getState();
        const updated = state.notes.find(n => n.id === noteId);
        expect(updated.title).toBe('New Title');
      });
    });

    describe('deleteNote', () => {
      it('should delete a note', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
          await useNotesStore.getState().deleteNote(noteId);
        });

        const state = useNotesStore.getState();
        expect(state.notes).toHaveLength(0);
      });

      it('should decrement folder noteCount', async () => {
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          await useNotesStore.getState().deleteNote(note.id);
        });

        const state = useNotesStore.getState();
        const folder = state.folders.find(f => f.id === folderId);
        expect(folder.noteCount).toBe(0);
      });

      it('should unselect note if currently selected', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
          useNotesStore.getState().selectNote(noteId);
          await useNotesStore.getState().deleteNote(noteId);
        });

        const state = useNotesStore.getState();
        expect(state.selectedNoteId).toBeNull();
      });
    });

    describe('togglePinNote', () => {
      it('should pin an unpinned note', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
          await useNotesStore.getState().togglePinNote(noteId);
        });

        const state = useNotesStore.getState();
        const note = state.notes.find(n => n.id === noteId);
        expect(note.isPinned).toBe(true);
      });

      it('should unpin a pinned note', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
          await useNotesStore.getState().togglePinNote(noteId);
          await useNotesStore.getState().togglePinNote(noteId);
        });

        const state = useNotesStore.getState();
        const note = state.notes.find(n => n.id === noteId);
        expect(note.isPinned).toBe(false);
      });
    });

    describe('selectNote', () => {
      it('should select a note', async () => {
        let noteId;
        await act(async () => {
          const note = await useNotesStore.getState().createNote(folderId);
          noteId = note.id;
          useNotesStore.getState().selectNote(noteId);
        });

        const state = useNotesStore.getState();
        expect(state.selectedNoteId).toBe(noteId);
      });
    });
  });

  describe('search and filter', () => {
    beforeEach(async () => {
      await act(async () => {
        const folder1 = await useNotesStore.getState().createFolder('Folder 1');
        const folder2 = await useNotesStore.getState().createFolder('Folder 2');

        await useNotesStore.getState().createNote(folder1.id, 'Apple Note', 'About apples');
        await useNotesStore.getState().createNote(folder1.id, 'Banana Note', 'About bananas');
        await useNotesStore.getState().createNote(folder2.id, 'Cherry Note', 'About cherries');
      });
    });

    describe('setSearchQuery', () => {
      it('should set search query', () => {
        act(() => {
          useNotesStore.getState().setSearchQuery('apple');
        });

        const state = useNotesStore.getState();
        expect(state.searchQuery).toBe('apple');
      });
    });

    describe('getFilteredNotes', () => {
      it('should return all notes when no filters', () => {
        const filtered = useNotesStore.getState().getFilteredNotes();
        expect(filtered).toHaveLength(3);
      });

      it('should filter by folder', () => {
        const state = useNotesStore.getState();
        const folder1Id = state.folders[0].id;

        act(() => {
          useNotesStore.getState().selectFolder(folder1Id);
        });

        const filtered = useNotesStore.getState().getFilteredNotes();
        expect(filtered).toHaveLength(2);
        expect(filtered.every(n => n.folderId === folder1Id)).toBe(true);
      });

      it('should search by title', () => {
        act(() => {
          useNotesStore.getState().setSearchQuery('apple');
        });

        const filtered = useNotesStore.getState().getFilteredNotes();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].title).toBe('Apple Note');
      });

      it('should search by content', () => {
        act(() => {
          useNotesStore.getState().setSearchQuery('bananas');
        });

        const filtered = useNotesStore.getState().getFilteredNotes();
        expect(filtered).toHaveLength(1);
        expect(filtered[0].title).toBe('Banana Note');
      });

      it('should be case-insensitive', () => {
        act(() => {
          useNotesStore.getState().setSearchQuery('CHERRY');
        });

        const filtered = useNotesStore.getState().getFilteredNotes();
        expect(filtered).toHaveLength(1);
      });

      it('should sort pinned notes first', async () => {
        const state = useNotesStore.getState();
        const secondNoteId = state.notes[1].id;

        await act(async () => {
          await useNotesStore.getState().togglePinNote(secondNoteId);
        });

        const filtered = useNotesStore.getState().getFilteredNotes();
        expect(filtered[0].isPinned).toBe(true);
        expect(filtered[0].id).toBe(secondNoteId);
      });
    });

    describe('getSelectedNote', () => {
      it('should return selected note', async () => {
        const state = useNotesStore.getState();
        const noteId = state.notes[0].id;

        act(() => {
          useNotesStore.getState().selectNote(noteId);
        });

        const selected = useNotesStore.getState().getSelectedNote();
        expect(selected).toBeDefined();
        expect(selected.id).toBe(noteId);
      });

      it('should return null when no note selected', () => {
        // Reset store state to clear any previously selected note
        useNotesStore.setState({ selectedNoteId: null });

        const selected = useNotesStore.getState().getSelectedNote();
        expect(selected).toBeNull();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle creating note without folder selected', async () => {
      await act(async () => {
        await useNotesStore.getState().createNote(null, 'Test');
      });

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(1);
    });

    it('should handle updating non-existent note', async () => {
      // Should not throw error, just fail silently
      await act(async () => {
        await useNotesStore.getState().updateNote('non-existent', { title: 'Test' });
      });

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should handle multiple rapid operations', async () => {
      await act(async () => {
        const folder = await useNotesStore.getState().createFolder('Test');
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(useNotesStore.getState().createNote(folder.id, `Note ${i}`));
        }
        await Promise.all(promises);
      });

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(10);
    });
  });
});

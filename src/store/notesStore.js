import { create } from 'zustand';
import { getStorageService } from '../services/storage';

const foldersService = getStorageService('folders');
const notesService = getStorageService('notes');

export const useNotesStore = create((set, get) => ({
  folders: [],
  notes: [],
  selectedFolderId: null,
  selectedNoteId: null,
  searchQuery: '',
  isLoading: true,

  // Initialize data from localStorage
  loadData: async () => {
    set({ isLoading: true });
    try {
      const [folders, notes] = await Promise.all([
        foldersService.list(),
        notesService.list()
      ]);

      // Simulate network delay for better UX demonstration
      await new Promise(resolve => setTimeout(resolve, 300));

      set({ folders, notes, isLoading: false });

      // Select first folder if exists and no folder selected
      if (folders.length > 0 && !get().selectedFolderId) {
        set({ selectedFolderId: folders[0].id });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  },

  // Folder actions
  createFolder: async (name) => {
    try {
      const newFolder = await foldersService.create({
        name,
        noteCount: 0
      });
      set({ folders: [...get().folders, newFolder] });
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  },

  updateFolder: async (id, changes) => {
    try {
      const updated = await foldersService.update(id, changes);
      set({
        folders: get().folders.map(f => f.id === id ? updated : f)
      });
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  },

  deleteFolder: async (id) => {
    try {
      // Delete all notes in this folder first
      const notesInFolder = get().notes.filter(n => n.folderId === id);
      await Promise.all(notesInFolder.map(n => notesService.delete(n.id)));

      await foldersService.delete(id);

      set({
        folders: get().folders.filter(f => f.id !== id),
        notes: get().notes.filter(n => n.folderId !== id),
        selectedFolderId: get().selectedFolderId === id ? null : get().selectedFolderId,
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  },

  selectFolder: (id) => {
    set({ selectedFolderId: id, selectedNoteId: null });
  },

  // Note actions
  createNote: async (folderId, title = '', content = '') => {
    try {
      const targetFolderId = folderId || get().selectedFolderId;
      const notesInFolder = get().notes.filter(n => n.folderId === targetFolderId);
      const position = notesInFolder.length;

      const newNote = await notesService.create({
        folderId: targetFolderId,
        title,
        content,
        isPinned: false,
        tags: [],
        color: 'default',
        position
      });

      set({
        notes: [...get().notes, newNote],
        selectedNoteId: newNote.id
      });

      // Update folder note count
      const folder = get().folders.find(f => f.id === newNote.folderId);
      if (folder) {
        get().updateFolder(folder.id, { noteCount: folder.noteCount + 1 });
      }

      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
    }
  },

  updateNote: async (id, changes) => {
    try {
      const updated = await notesService.update(id, changes);
      set({
        notes: get().notes.map(n => n.id === id ? updated : n)
      });
    } catch (error) {
      console.error('Error updating note:', error);
    }
  },

  deleteNote: async (id) => {
    try {
      const note = get().notes.find(n => n.id === id);
      await notesService.delete(id);

      set({
        notes: get().notes.filter(n => n.id !== id),
        selectedNoteId: get().selectedNoteId === id ? null : get().selectedNoteId
      });

      // Update folder note count
      if (note) {
        const folder = get().folders.find(f => f.id === note.folderId);
        if (folder) {
          get().updateFolder(folder.id, { noteCount: Math.max(0, folder.noteCount - 1) });
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  },

  togglePinNote: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned });
    }
  },

  selectNote: (id) => {
    set({ selectedNoteId: id });
  },

  moveNote: async (noteId, newFolderId, newPosition) => {
    try {
      const note = get().notes.find(n => n.id === noteId);
      if (!note) return;

      const oldFolderId = note.folderId;
      const oldPosition = note.position;

      // If same folder and same position, do nothing
      if (oldFolderId === newFolderId && oldPosition === newPosition) return;

      let updatedNotes = [...get().notes];

      if (oldFolderId === newFolderId) {
        // Reordering within same folder
        const notesInFolder = updatedNotes
          .filter(n => n.folderId === oldFolderId && n.id !== noteId && !n.isPinned)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        // Insert note at new position
        notesInFolder.splice(newPosition, 0, note);

        // Update positions
        for (let i = 0; i < notesInFolder.length; i++) {
          const n = notesInFolder[i];
          if ((n.position || 0) !== i) {
            await notesService.update(n.id, { position: i });
            updatedNotes = updatedNotes.map(un =>
              un.id === n.id ? { ...un, position: i } : un
            );
          }
        }
      } else {
        // Moving to different folder
        // Update positions in old folder
        const oldFolderNotes = updatedNotes
          .filter(n => n.folderId === oldFolderId && n.id !== noteId && !n.isPinned)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        for (let i = 0; i < oldFolderNotes.length; i++) {
          if ((oldFolderNotes[i].position || 0) !== i) {
            await notesService.update(oldFolderNotes[i].id, { position: i });
            updatedNotes = updatedNotes.map(n =>
              n.id === oldFolderNotes[i].id ? { ...n, position: i } : n
            );
          }
        }

        // Update positions in new folder
        const newFolderNotes = updatedNotes
          .filter(n => n.folderId === newFolderId && !n.isPinned)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        newFolderNotes.splice(newPosition, 0, { ...note, folderId: newFolderId, position: newPosition });

        for (let i = 0; i < newFolderNotes.length; i++) {
          const n = newFolderNotes[i];
          if (n.id === noteId) {
            await notesService.update(n.id, { folderId: newFolderId, position: i });
            updatedNotes = updatedNotes.map(un =>
              un.id === n.id ? { ...un, folderId: newFolderId, position: i } : un
            );
          } else if ((n.position || 0) !== i) {
            await notesService.update(n.id, { position: i });
            updatedNotes = updatedNotes.map(un =>
              un.id === n.id ? { ...un, position: i } : un
            );
          }
        }

        // Update folder note counts
        const oldFolder = get().folders.find(f => f.id === oldFolderId);
        const newFolder = get().folders.find(f => f.id === newFolderId);
        if (oldFolder) {
          get().updateFolder(oldFolder.id, { noteCount: Math.max(0, oldFolder.noteCount - 1) });
        }
        if (newFolder) {
          get().updateFolder(newFolder.id, { noteCount: newFolder.noteCount + 1 });
        }
      }

      set({ notes: updatedNotes });
    } catch (error) {
      console.error('Error moving note:', error);
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Computed getters
  getFilteredNotes: () => {
    const { notes, selectedFolderId, searchQuery } = get();
    let filtered = notes;

    // Filter by folder
    if (selectedFolderId) {
      filtered = filtered.filter(n => n.folderId === selectedFolderId);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(query) ||
        n.content?.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by position (for manual ordering), fallback to updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both pinned or both unpinned, sort by position
      if (typeof a.position === 'number' && typeof b.position === 'number') {
        return a.position - b.position;
      }

      // Fallback to date if position not set
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },

  getSelectedNote: () => {
    const { notes, selectedNoteId } = get();
    return notes.find(n => n.id === selectedNoteId) || null;
  }
}));

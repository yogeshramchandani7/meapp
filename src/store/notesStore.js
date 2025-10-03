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

  // Initialize data from localStorage
  loadData: async () => {
    try {
      const [folders, notes] = await Promise.all([
        foldersService.list(),
        notesService.list()
      ]);

      set({ folders, notes });

      // Select first folder if exists and no folder selected
      if (folders.length > 0 && !get().selectedFolderId) {
        set({ selectedFolderId: folders[0].id });
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
      const newNote = await notesService.create({
        folderId: folderId || get().selectedFolderId,
        title,
        content,
        isPinned: false,
        tags: []
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

    // Sort: pinned first, then by updatedAt desc
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  },

  getSelectedNote: () => {
    const { notes, selectedNoteId } = get();
    return notes.find(n => n.id === selectedNoteId) || null;
  }
}));

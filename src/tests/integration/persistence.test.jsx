import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { useNotesStore } from '../../store/notesStore';
import { useTasksStore } from '../../store/tasksStore';
import NotesView from '../../components/notes/NotesView';
import TasksView from '../../components/tasks/TasksView';

describe('Data Persistence Across Page Reloads', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Notes Persistence', () => {
    it('should persist folders and notes across "page reload" simulation', async () => {
      // Step 1: Create data in first "session"
      await act(async () => {
        useNotesStore.setState({
          folders: [],
          notes: [],
          selectedFolderId: null,
          selectedNoteId: null,
          searchQuery: '',
          isLoading: false
        });

        const folder = await useNotesStore.getState().createFolder('Personal Notes');
        await useNotesStore.getState().createNote(folder.id, 'My First Note', 'This is important content');
        await useNotesStore.getState().createNote(folder.id, 'Second Note', 'More content here');
      });

      // Verify data was saved to localStorage
      const storedFolders = JSON.parse(localStorage.getItem('folders'));
      const storedNotes = JSON.parse(localStorage.getItem('notes'));
      expect(storedFolders).toHaveLength(1);
      expect(storedNotes).toHaveLength(2);

      // Step 2: Simulate page reload by resetting store state
      await act(async () => {
        useNotesStore.setState({
          folders: [],
          notes: [],
          selectedFolderId: null,
          selectedNoteId: null,
          searchQuery: '',
          isLoading: false
        });

        // Reload data (simulating component mount)
        await useNotesStore.getState().loadData();
      });

      // Step 3: Verify data was restored from localStorage
      const state = useNotesStore.getState();
      expect(state.folders).toHaveLength(1);
      expect(state.folders[0].name).toBe('Personal Notes');
      expect(state.notes).toHaveLength(2);
      expect(state.notes[0].title).toBe('My First Note');
      expect(state.notes[1].title).toBe('Second Note');
    });

    it('should persist note updates across reload', async () => {
      let noteId;

      // Create and update a note
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        const folder = await useNotesStore.getState().createFolder('Test');
        const note = await useNotesStore.getState().createNote(folder.id, 'Original Title', 'Original Content');
        noteId = note.id;
        await useNotesStore.getState().updateNote(noteId, { title: 'Updated Title', content: 'Updated Content' });
      });

      // Reload
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      const note = state.notes.find(n => n.id === noteId);
      expect(note.title).toBe('Updated Title');
      expect(note.content).toBe('Updated Content');
    });

    it('should persist pinned status across reload', async () => {
      let noteId;

      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        const folder = await useNotesStore.getState().createFolder('Test');
        const note = await useNotesStore.getState().createNote(folder.id, 'Important Note');
        noteId = note.id;
        await useNotesStore.getState().togglePinNote(noteId);
      });

      // Reload
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      const note = state.notes.find(n => n.id === noteId);
      expect(note.isPinned).toBe(true);
    });

    it('should persist tags across reload', async () => {
      let noteId;

      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        const folder = await useNotesStore.getState().createFolder('Test');
        const note = await useNotesStore.getState().createNote(folder.id, 'Tagged Note');
        noteId = note.id;
        await useNotesStore.getState().updateNote(noteId, {
          tags: [
            { name: 'urgent', color: 'red' },
            { name: 'work', color: 'blue' }
          ]
        });
      });

      // Reload
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      const note = state.notes.find(n => n.id === noteId);
      expect(note.tags).toHaveLength(2);
      expect(note.tags[0].name).toBe('urgent');
      expect(note.tags[1].name).toBe('work');
    });

    it('should handle empty localStorage gracefully', async () => {
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      expect(state.folders).toEqual([]);
      expect(state.notes).toEqual([]);
    });
  });

  describe('Tasks Persistence', () => {
    it('should persist boards, lists, and cards across "page reload" simulation', async () => {
      // Step 1: Create data in first "session"
      await act(async () => {
        useTasksStore.setState({
          boards: [],
          lists: [],
          cards: [],
          selectedBoardId: null,
          selectedCardId: null,
          isLoading: false
        });

        const board = await useTasksStore.getState().createBoard('My Project');
        const list = await useTasksStore.getState().createList(board.id, 'To Do');
        await useTasksStore.getState().createCard(list.id, { title: 'Task 1', description: 'Do this first' });
        await useTasksStore.getState().createCard(list.id, { title: 'Task 2', description: 'Do this second' });
      });

      // Verify data was saved to localStorage
      const storedBoards = JSON.parse(localStorage.getItem('boards'));
      const storedLists = JSON.parse(localStorage.getItem('lists'));
      const storedCards = JSON.parse(localStorage.getItem('cards'));
      expect(storedBoards).toHaveLength(1);
      expect(storedLists).toHaveLength(1);
      expect(storedCards).toHaveLength(2);

      // Step 2: Simulate page reload
      await act(async () => {
        useTasksStore.setState({
          boards: [],
          lists: [],
          cards: [],
          selectedBoardId: null,
          selectedCardId: null,
          isLoading: false
        });

        await useTasksStore.getState().loadData();
      });

      // Step 3: Verify data was restored
      const state = useTasksStore.getState();
      expect(state.boards).toHaveLength(1);
      expect(state.boards[0].name).toBe('My Project');
      expect(state.lists).toHaveLength(1);
      expect(state.lists[0].name).toBe('To Do');
      expect(state.cards).toHaveLength(2);
      expect(state.cards[0].title).toBe('Task 1');
      expect(state.cards[1].title).toBe('Task 2');
    });

    it('should persist card updates across reload', async () => {
      let cardId;

      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        const board = await useTasksStore.getState().createBoard('Test');
        const list = await useTasksStore.getState().createList(board.id, 'List');
        const card = await useTasksStore.getState().createCard(list.id, { title: 'Original' });
        cardId = card.id;
        await useTasksStore.getState().updateCard(cardId, {
          title: 'Updated Task',
          description: 'Updated description',
          tags: ['important', 'urgent']
        });
      });

      // Reload
      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        await useTasksStore.getState().loadData();
      });

      const state = useTasksStore.getState();
      const card = state.cards.find(c => c.id === cardId);
      expect(card.title).toBe('Updated Task');
      expect(card.description).toBe('Updated description');
      expect(card.tags).toEqual(['important', 'urgent']);
    });

    it('should persist card positions after drag-and-drop', async () => {
      let card1Id, card2Id, card3Id;

      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        const board = await useTasksStore.getState().createBoard('Test');
        const list = await useTasksStore.getState().createList(board.id, 'List');
        const card1 = await useTasksStore.getState().createCard(list.id, { title: 'Card 1' });
        const card2 = await useTasksStore.getState().createCard(list.id, { title: 'Card 2' });
        const card3 = await useTasksStore.getState().createCard(list.id, { title: 'Card 3' });
        card1Id = card1.id;
        card2Id = card2.id;
        card3Id = card3.id;

        // Move card 1 to position 2 (end)
        await useTasksStore.getState().moveCard(card1Id, list.id, 2);
      });

      // Reload
      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        await useTasksStore.getState().loadData();
      });

      const state = useTasksStore.getState();
      const sortedCards = state.cards.sort((a, b) => a.position - b.position);
      expect(sortedCards[0].id).toBe(card2Id);
      expect(sortedCards[1].id).toBe(card3Id);
      expect(sortedCards[2].id).toBe(card1Id);
    });

    it('should persist list positions after reorder', async () => {
      let list1Id, list2Id, list3Id;

      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        const board = await useTasksStore.getState().createBoard('Test');
        const list1 = await useTasksStore.getState().createList(board.id, 'List 1');
        const list2 = await useTasksStore.getState().createList(board.id, 'List 2');
        const list3 = await useTasksStore.getState().createList(board.id, 'List 3');
        list1Id = list1.id;
        list2Id = list2.id;
        list3Id = list3.id;

        // Move list 1 to position 2
        await useTasksStore.getState().reorderList(list1Id, 2);
      });

      // Reload
      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        await useTasksStore.getState().loadData();
      });

      const state = useTasksStore.getState();
      const sortedLists = state.lists.sort((a, b) => a.position - b.position);
      expect(sortedLists[0].id).toBe(list2Id);
      expect(sortedLists[1].id).toBe(list3Id);
      expect(sortedLists[2].id).toBe(list1Id);
    });

    it('should handle empty localStorage gracefully', async () => {
      await act(async () => {
        useTasksStore.setState({ boards: [], lists: [], cards: [], selectedBoardId: null, selectedCardId: null, isLoading: false });
        await useTasksStore.getState().loadData();
      });

      const state = useTasksStore.getState();
      expect(state.boards).toEqual([]);
      expect(state.lists).toEqual([]);
      expect(state.cards).toEqual([]);
    });
  });

  describe('localStorage Clearing', () => {
    it('should start fresh when localStorage is cleared', async () => {
      // Create some data
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        const folder = await useNotesStore.getState().createFolder('Test');
        await useNotesStore.getState().createNote(folder.id, 'Note');
      });

      expect(useNotesStore.getState().folders).toHaveLength(1);

      // Clear localStorage
      localStorage.clear();

      // Reload
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        await useNotesStore.getState().loadData();
      });

      const state = useNotesStore.getState();
      expect(state.folders).toEqual([]);
      expect(state.notes).toEqual([]);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all timestamps and IDs across reload', async () => {
      let folderId, noteId;

      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        const folder = await useNotesStore.getState().createFolder('Test');
        folderId = folder.id;
        const note = await useNotesStore.getState().createNote(folder.id, 'Test Note');
        noteId = note.id;
      });

      const originalState = useNotesStore.getState();
      const originalFolder = originalState.folders[0];
      const originalNote = originalState.notes[0];

      // Reload
      await act(async () => {
        useNotesStore.setState({ folders: [], notes: [], selectedFolderId: null, selectedNoteId: null, isLoading: false });
        await useNotesStore.getState().loadData();
      });

      const newState = useNotesStore.getState();
      const reloadedFolder = newState.folders.find(f => f.id === folderId);
      const reloadedNote = newState.notes.find(n => n.id === noteId);

      expect(reloadedFolder.id).toBe(originalFolder.id);
      expect(reloadedFolder.createdAt).toBe(originalFolder.createdAt);
      expect(reloadedNote.id).toBe(originalNote.id);
      expect(reloadedNote.createdAt).toBe(originalNote.createdAt);
      expect(reloadedNote.updatedAt).toBe(originalNote.updatedAt);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import NotesView from '../../components/notes/NotesView';
import { useNotesStore } from '../../store/notesStore';

describe('Performance Tests', () => {
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

  describe('Large Dataset Performance', () => {
    it('should handle 100+ notes efficiently', async () => {
      // Generate 100 notes
      const folder = { id: 'f1', name: 'Big Folder', noteCount: 100, createdAt: new Date().toISOString() };
      const notes = Array.from({ length: 100 }, (_, i) => ({
        id: `note-${i}`,
        folderId: 'f1',
        title: `Note ${i}`,
        content: `This is the content for note number ${i}. `.repeat(10),
        createdAt: new Date(Date.now() - i * 1000).toISOString(),
        updatedAt: new Date(Date.now() - i * 1000).toISOString(),
        isPinned: i % 10 === 0,
        tags: []
      }));

      localStorage.setItem('folders', JSON.stringify([folder]));
      localStorage.setItem('notes', JSON.stringify(notes));

      const startTime = performance.now();
      const { container } = render(<NotesView />);
      const renderTime = performance.now() - startTime;

      // Should render in less than 1 second
      expect(renderTime).toBeLessThan(1000);

      await waitFor(() => {
        const noteElements = container.querySelectorAll('[class*="cursor-pointer"]');
        expect(noteElements.length).toBeGreaterThan(0);
      });
    });

    it('should search through 100+ notes quickly', async () => {
      // Setup large dataset
      const folder = { id: 'f1', name: 'Test', noteCount: 100, createdAt: new Date().toISOString() };
      const notes = Array.from({ length: 100 }, (_, i) => ({
        id: `note-${i}`,
        folderId: 'f1',
        title: `Note ${i}`,
        content: `Content ${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        tags: []
      }));

      localStorage.setItem('folders', JSON.stringify([folder]));
      localStorage.setItem('notes', JSON.stringify(notes));

      await act(async () => {
        await useNotesStore.getState().loadData();
      });

      const startTime = performance.now();
      act(() => {
        useNotesStore.getState().setSearchQuery('Note 50');
      });
      const searchTime = performance.now() - startTime;

      // Search should be instant (< 100ms)
      expect(searchTime).toBeLessThan(100);

      const filtered = useNotesStore.getState().getFilteredNotes();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Note 50');
    });

    it('should handle rapid CRUD operations', async () => {
      await act(async () => {
        const folder = await useNotesStore.getState().createFolder('Test');

        const startTime = performance.now();

        // Create 20 notes rapidly
        const promises = Array.from({ length: 20 }, (_, i) =>
          useNotesStore.getState().createNote(folder.id, `Note ${i}`, `Content ${i}`)
        );

        await Promise.all(promises);

        const createTime = performance.now() - startTime;

        // Should complete in less than 500ms
        expect(createTime).toBeLessThan(500);

        const state = useNotesStore.getState();
        expect(state.notes).toHaveLength(20);
      });
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory when creating/deleting many notes', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      await act(async () => {
        const folder = await useNotesStore.getState().createFolder('Test');

        // Create and delete 50 notes
        for (let i = 0; i < 50; i++) {
          const note = await useNotesStore.getState().createNote(folder.id, `Note ${i}`);
          await useNotesStore.getState().deleteNote(note.id);
        }
      });

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 10MB)
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });

  describe('Rendering Performance', () => {
    it('should re-render efficiently when state changes', async () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        return <NotesView />;
      };

      const { rerender } = render(<TestComponent />);

      const initialRenderCount = renderCount;

      // Trigger state change
      await act(async () => {
        await useNotesStore.getState().createFolder('Test');
      });

      rerender(<TestComponent />);

      // Should not cause excessive re-renders (< 5 additional renders)
      expect(renderCount - initialRenderCount).toBeLessThan(5);
    });

    it('should handle rapid filter changes efficiently', async () => {
      // Setup data
      const folder = { id: 'f1', name: 'Test', noteCount: 50, createdAt: new Date().toISOString() };
      const notes = Array.from({ length: 50 }, (_, i) => ({
        id: `note-${i}`,
        folderId: 'f1',
        title: `Note ${i}`,
        content: `Content ${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        tags: []
      }));

      localStorage.setItem('folders', JSON.stringify([folder]));
      localStorage.setItem('notes', JSON.stringify(notes));

      await act(async () => {
        await useNotesStore.getState().loadData();
      });

      const startTime = performance.now();

      // Rapidly change search query
      const queries = ['Note', 'Note 1', 'Note 10', 'Note 20', 'Note 30'];
      for (const query of queries) {
        act(() => {
          useNotesStore.getState().setSearchQuery(query);
        });
        useNotesStore.getState().getFilteredNotes();
      }

      const filterTime = performance.now() - startTime;

      // Should handle all filter changes in < 100ms
      expect(filterTime).toBeLessThan(100);
    });
  });

  describe('localStorage Performance', () => {
    it('should read from localStorage efficiently', async () => {
      // Populate localStorage with large dataset
      const folders = Array.from({ length: 10 }, (_, i) => ({
        id: `f${i}`,
        name: `Folder ${i}`,
        noteCount: 10,
        createdAt: new Date().toISOString()
      }));

      const notes = Array.from({ length: 100 }, (_, i) => ({
        id: `note-${i}`,
        folderId: `f${i % 10}`,
        title: `Note ${i}`,
        content: `Content ${i}`.repeat(100),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        tags: []
      }));

      localStorage.setItem('folders', JSON.stringify(folders));
      localStorage.setItem('notes', JSON.stringify(notes));

      const startTime = performance.now();
      await act(async () => {
        await useNotesStore.getState().loadData();
      });
      const loadTime = performance.now() - startTime;

      // Should load in < 200ms
      expect(loadTime).toBeLessThan(200);

      const state = useNotesStore.getState();
      expect(state.folders).toHaveLength(10);
      expect(state.notes).toHaveLength(100);
    });

    it('should write to localStorage efficiently', async () => {
      await act(async () => {
        const folder = await useNotesStore.getState().createFolder('Test');

        const startTime = performance.now();

        // Create 10 notes
        for (let i = 0; i < 10; i++) {
          await useNotesStore.getState().createNote(folder.id, `Note ${i}`, `Content ${i}`.repeat(100));
        }

        const writeTime = performance.now() - startTime;

        // Should complete in < 500ms
        expect(writeTime).toBeLessThan(500);
      });
    });
  });

  describe('Date Grouping Performance', () => {
    it('should group large number of notes by date efficiently', async () => {
      // Create notes with various dates
      const folder = { id: 'f1', name: 'Test', noteCount: 200, createdAt: new Date().toISOString() };
      const notes = [];

      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;

      for (let i = 0; i < 200; i++) {
        const daysAgo = Math.floor(i / 20); // 20 notes per day
        notes.push({
          id: `note-${i}`,
          folderId: 'f1',
          title: `Note ${i}`,
          content: `Content ${i}`,
          createdAt: new Date(now - (daysAgo * dayInMs)).toISOString(),
          updatedAt: new Date(now - (daysAgo * dayInMs)).toISOString(),
          isPinned: false,
          tags: []
        });
      }

      localStorage.setItem('folders', JSON.stringify([folder]));
      localStorage.setItem('notes', JSON.stringify(notes));

      const startTime = performance.now();
      render(<NotesView />);
      const renderTime = performance.now() - startTime;

      // Should render with date grouping in < 1 second
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent reads and writes', async () => {
      await act(async () => {
        const folder = await useNotesStore.getState().createFolder('Test');

        const startTime = performance.now();

        // Simulate concurrent operations
        const operations = [
          ...Array.from({ length: 5 }, (_, i) =>
            useNotesStore.getState().createNote(folder.id, `Note ${i}`)
          ),
          ...Array.from({ length: 5 }, () =>
            useNotesStore.getState().getFilteredNotes()
          ),
          useNotesStore.getState().loadData(),
        ];

        await Promise.all(operations);

        const operationTime = performance.now() - startTime;

        // Should handle concurrent operations in < 500ms
        expect(operationTime).toBeLessThan(500);
      });
    });
  });
});

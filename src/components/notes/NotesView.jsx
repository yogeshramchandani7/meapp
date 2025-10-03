import { useEffect } from 'react';
import { useNotesStore } from '../../store/notesStore';
import FolderSelector from './FolderSelector';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';

export default function NotesView() {
  const { loadData, searchQuery, setSearchQuery } = useNotesStore();

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="h-full flex bg-bg-app text-text-primary">
      {/* Left Sidebar - Notes List */}
      <div className="w-64 bg-bg-panel border-r border-border flex flex-col">
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-bg-elevated text-text-primary placeholder-text-tertiary rounded-input px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-border-focus"
            />
          </div>
        </div>

        {/* Folder Selector */}
        <FolderSelector />

        {/* Notes List */}
        <NotesList />
      </div>

      {/* Right Side - Note Editor */}
      <div className="flex-1 bg-bg-app">
        <NoteEditor />
      </div>
    </div>
  );
}

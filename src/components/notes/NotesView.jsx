import { useEffect } from 'react';
import { useNotesStore } from '../../store/notesStore';
import MobileMenu from '../layout/MobileMenu';
import FolderSelector from './FolderSelector';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import { NotesSkeleton, NoteEditorSkeleton } from '../ui/Skeleton';

export default function NotesView() {
  const { loadData, searchQuery, setSearchQuery, isLoading } = useNotesStore();

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex bg-bg-app text-text-primary">
        <MobileMenu title="Notes">
          <NotesSkeleton />
        </MobileMenu>
        <div className="flex-1 bg-bg-app">
          <NoteEditorSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-bg-app text-text-primary">
      {/* Left Sidebar - Wrapped in MobileMenu for responsive behavior */}
      <MobileMenu title="Notes">
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
      </MobileMenu>

      {/* Right Side - Note Editor (Full width on mobile, flex-1 on desktop) */}
      <div className="flex-1 bg-bg-app">
        <NoteEditor />
      </div>
    </div>
  );
}

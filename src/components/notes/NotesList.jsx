import { formatDistanceToNow } from 'date-fns';
import { useNotesStore } from '../../store/notesStore';

// Helper to group notes by date
function groupNotesByDate(notes) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const groups = {
    pinned: [],
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: []
  };

  notes.forEach(note => {
    const noteDate = new Date(note.updatedAt);
    const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());

    if (note.isPinned) {
      groups.pinned.push(note);
    } else if (noteDateOnly.getTime() === today.getTime()) {
      groups.today.push(note);
    } else if (noteDateOnly.getTime() === yesterday.getTime()) {
      groups.yesterday.push(note);
    } else if (noteDate >= sevenDaysAgo) {
      groups.previous7Days.push(note);
    } else if (noteDate >= thirtyDaysAgo) {
      groups.previous30Days.push(note);
    } else {
      groups.older.push(note);
    }
  });

  return groups;
}

function NoteItem({ note, isSelected, onClick }) {
  const preview = note.content?.substring(0, 100) || 'No content';
  const date = note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-card p-2 cursor-pointer transition-colors ${
        isSelected ? 'bg-accent-yellow' : 'bg-bg-elevated hover:bg-bg-hover'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-text-inverse' : 'text-text-primary'}`}>
            {note.isPinned && '📌 '}{note.title || 'Untitled Note'}
          </h3>
          <p className={`text-xs mt-0.5 line-clamp-2 ${isSelected ? 'text-text-inverse/90' : 'text-text-secondary'}`}>
            {date && `${date} • `}{preview}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotesList() {
  const { getFilteredNotes, selectedNoteId, selectNote, createNote, selectedFolderId } = useNotesStore();
  const notes = getFilteredNotes();
  const groups = groupNotesByDate(notes);

  const handleCreateNote = async () => {
    if (!selectedFolderId) {
      alert('Please select a folder first');
      return;
    }
    await createNote(selectedFolderId);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Pinned Section */}
      {groups.pinned.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">📌 Pinned</p>
          </div>
          <div className="space-y-1 px-2">
            {groups.pinned.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => selectNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today Section */}
      {groups.today.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Today</p>
          </div>
          <div className="space-y-1 px-2">
            {groups.today.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => selectNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Yesterday Section */}
      {groups.yesterday.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Yesterday</p>
          </div>
          <div className="space-y-1 px-2">
            {groups.yesterday.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => selectNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Previous 7 Days Section */}
      {groups.previous7Days.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Previous 7 Days</p>
          </div>
          <div className="space-y-1 px-2">
            {groups.previous7Days.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => selectNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Previous 30 Days Section */}
      {groups.previous30Days.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Previous 30 Days</p>
          </div>
          <div className="space-y-1 px-2">
            {groups.previous30Days.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => selectNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Older Section */}
      {groups.older.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Older</p>
          </div>
          <div className="space-y-1 px-2">
            {groups.older.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => selectNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="p-8 text-center text-text-tertiary text-sm">
          <p>No notes yet</p>
          <p className="mt-2">Click "New Note" to create one</p>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="sticky bottom-0 p-3 bg-bg-panel border-t border-border">
        <button
          onClick={handleCreateNote}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover rounded-button transition-colors"
        >
          <span>📝</span>
          <span>New Note</span>
        </button>
      </div>
    </div>
  );
}

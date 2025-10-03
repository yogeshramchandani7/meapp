import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { useNotesStore } from '../../store/notesStore';

export default function NoteEditor() {
  const { getSelectedNote, updateNote, deleteNote, togglePinNote } = useNotesStore();
  const selectedNote = getSelectedNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const saveTimeoutRef = useRef(null);

  // Update local state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || '');
      setContent(selectedNote.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNote?.id]);

  // Auto-save function (debounced)
  const autoSave = useCallback((noteId, updates) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateNote(noteId, updates);
    }, 500); // 500ms debounce
  }, [updateNote]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (selectedNote) {
      autoSave(selectedNote.id, { title: newTitle, content });
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (selectedNote) {
      autoSave(selectedNote.id, { title, content: newContent });
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(selectedNote.id);
    }
  };

  const handleTogglePin = () => {
    if (selectedNote) {
      togglePinNote(selectedNote.id);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Empty state
  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center text-text-tertiary">
        <div className="text-center">
          <p className="text-lg">No note selected</p>
          <p className="text-sm mt-2">Select a note or create a new one</p>
        </div>
      </div>
    );
  }

  const formattedDate = selectedNote.updatedAt
    ? format(new Date(selectedNote.updatedAt), "MMMM d, yyyy 'at' h:mm a")
    : '';

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-16 py-8">
      {/* Header with timestamp */}
      <div className="mb-6">
        <p className="text-xs text-text-tertiary text-center">{formattedDate}</p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleTogglePin}
          className={`px-3 py-1.5 text-sm rounded-button transition-colors ${
            selectedNote.isPinned
              ? 'bg-accent-yellow text-text-inverse'
              : 'bg-bg-elevated text-text-secondary hover:bg-bg-hover'
          }`}
        >
          {selectedNote.isPinned ? '📌 Pinned' : '📌 Pin'}
        </button>

        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-sm text-accent-red hover:bg-accent-red/10 rounded-button transition-colors"
        >
          Delete Note
        </button>
      </div>

      {/* Note Title */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-3xl font-bold bg-transparent text-text-primary border-none focus:outline-none placeholder-text-tertiary"
        />
      </div>

      {/* Note Content */}
      <div className="flex-1 overflow-y-auto">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing your note..."
          className="w-full h-full resize-none bg-transparent text-text-secondary border-none focus:outline-none placeholder-text-tertiary leading-relaxed"
        />
      </div>

      {/* Auto-save indicator */}
      <div className="mt-4 text-xs text-text-tertiary text-center">
        Auto-saved
      </div>
    </div>
  );
}

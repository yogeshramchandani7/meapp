import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNotesStore } from '../../store/notesStore';

const TAG_COLORS = [
  { name: 'blue', bg: 'bg-accent-blue/20', text: 'text-accent-blue', border: 'border-accent-blue/30' },
  { name: 'green', bg: 'bg-accent-green/20', text: 'text-accent-green', border: 'border-accent-green/30' },
  { name: 'yellow', bg: 'bg-accent-yellow/20', text: 'text-accent-yellow', border: 'border-accent-yellow/30' },
  { name: 'red', bg: 'bg-accent-red/20', text: 'text-accent-red', border: 'border-accent-red/30' },
  { name: 'purple', bg: 'bg-accent-purple/20', text: 'text-accent-purple', border: 'border-accent-purple/30' },
  { name: 'orange', bg: 'bg-accent-orange/20', text: 'text-accent-orange', border: 'border-accent-orange/30' },
];

const NOTE_COLOR_OPTIONS = [
  { name: 'default', label: 'Default', color: '#3a3a3c', ring: 'ring-gray-500' },
  { name: 'blue', label: 'Blue', color: '#0a84ff', ring: 'ring-accent-blue' },
  { name: 'green', label: 'Green', color: '#32d74b', ring: 'ring-accent-green' },
  { name: 'purple', label: 'Purple', color: '#bf5af2', ring: 'ring-accent-purple' },
  { name: 'orange', label: 'Orange', color: '#ff9500', ring: 'ring-accent-orange' }
];

export default function NoteEditor() {
  const { getSelectedNote, updateNote, deleteNote, togglePinNote, notes } = useNotesStore();
  const selectedNote = getSelectedNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Update local state when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || '');
      setContent(selectedNote.content || '');
      setTags(selectedNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
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

    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete this note?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await deleteNote(selectedNote.id);
              toast.dismiss(t.id);
              toast.success('Note deleted');
            }}
            className="px-3 py-1 bg-accent-red text-white rounded-button text-sm hover:bg-accent-red/80 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-bg-elevated text-text-primary rounded-button text-sm hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        maxWidth: '500px',
      },
    });
  };

  const handleTogglePin = () => {
    if (selectedNote) {
      togglePinNote(selectedNote.id);
    }
  };

  const handleColorChange = async (colorName) => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { color: colorName });
    toast.success(`Color changed to ${colorName}`);
  };

  // Get all existing tags from all notes for autocomplete
  const getAllTags = () => {
    const tagSet = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag.name));
      }
    });
    return Array.from(tagSet);
  };

  const getTagColor = (tagName) => {
    // Check if tag already has a color in current note
    const existingTag = tags.find(t => t.name === tagName);
    if (existingTag) return existingTag.color;

    // Hash the tag name to consistently assign a color
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[hash % TAG_COLORS.length].name;
  };

  const handleAddTag = (e) => {
    e?.preventDefault();
    if (!newTag.trim() || tags.some(t => t.name === newTag.trim())) return;

    const tagObj = {
      name: newTag.trim(),
      color: getTagColor(newTag.trim())
    };

    const updatedTags = [...tags, tagObj];
    setTags(updatedTags);
    updateNote(selectedNote.id, { tags: updatedTags });
    setNewTag('');
    setShowTagSuggestions(false);
    toast.success('Tag added');
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter(t => t.name !== tagToRemove.name);
    setTags(updatedTags);
    updateNote(selectedNote.id, { tags: updatedTags });
    toast.success('Tag removed');
  };

  const filteredSuggestions = getAllTags().filter(
    tag => tag.toLowerCase().includes(newTag.toLowerCase()) && !tags.some(t => t.name === tag)
  );

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

      {/* Color Picker */}
      <div className="mb-3">
        <div className="flex gap-1.5">
          {NOTE_COLOR_OPTIONS.map((option) => (
            <button
              key={option.name}
              onClick={() => handleColorChange(option.name)}
              className={`group relative w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 ${
                (selectedNote.color || 'default') === option.name ? `ring-2 ${option.ring} ring-offset-1 ring-offset-bg-app` : ''
              }`}
              style={{ backgroundColor: option.color }}
              title={option.label}
            >
              {(selectedNote.color || 'default') === option.name && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Note Title */}
      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-3xl font-bold bg-transparent text-text-primary border-none focus:outline-none placeholder-text-tertiary"
        />
      </div>

      {/* Tags Section */}
      <div className="mb-6">
        {/* Existing Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => {
            const colorScheme = TAG_COLORS.find(c => c.name === tag.color) || TAG_COLORS[0];
            return (
              <span
                key={tag.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1 ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border} text-sm rounded-full font-medium`}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className={`${colorScheme.text} hover:opacity-70 transition-opacity`}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>

        {/* Add Tag Input */}
        <div className="relative">
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setShowTagSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowTagSuggestions(newTag.length > 0)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-1.5 text-sm bg-bg-elevated text-text-primary border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-border-focus placeholder:text-text-tertiary"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent-blue text-white text-sm rounded-button hover:bg-accent-blue/80 transition-colors"
            >
              Add Tag
            </button>
          </form>

          {/* Autocomplete Suggestions */}
          {showTagSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-bg-elevated border border-border rounded-card shadow-modal z-10 max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setNewTag(suggestion);
                    handleAddTag();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
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

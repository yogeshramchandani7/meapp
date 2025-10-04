import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  LeadingActions,
  Type as ListType
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { useNotesStore } from '../../store/notesStore';

const TAG_COLORS = [
  { name: 'blue', bg: 'bg-accent-blue/20', text: 'text-accent-blue', border: 'border-accent-blue/30' },
  { name: 'green', bg: 'bg-accent-green/20', text: 'text-accent-green', border: 'border-accent-green/30' },
  { name: 'yellow', bg: 'bg-accent-yellow/20', text: 'text-accent-yellow', border: 'border-accent-yellow/30' },
  { name: 'red', bg: 'bg-accent-red/20', text: 'text-accent-red', border: 'border-accent-red/30' },
  { name: 'purple', bg: 'bg-accent-purple/20', text: 'text-accent-purple', border: 'border-accent-purple/30' },
  { name: 'orange', bg: 'bg-accent-orange/20', text: 'text-accent-orange', border: 'border-accent-orange/30' },
];

const NOTE_COLORS = {
  default: {
    bg: 'bg-bg-elevated',
    selected: 'bg-bg-elevated',
    hover: 'bg-bg-hover',
    text: 'text-text-primary',
    textSelected: 'text-text-primary'
  },
  blue: {
    bg: 'bg-accent-blue/10',
    selected: 'bg-accent-blue/30',
    hover: 'bg-accent-blue/20',
    text: 'text-text-primary',
    textSelected: 'text-text-primary'
  },
  green: {
    bg: 'bg-accent-green/10',
    selected: 'bg-accent-green/30',
    hover: 'bg-accent-green/20',
    text: 'text-text-primary',
    textSelected: 'text-text-primary'
  },
  purple: {
    bg: 'bg-accent-purple/10',
    selected: 'bg-accent-purple/30',
    hover: 'bg-accent-purple/20',
    text: 'text-text-primary',
    textSelected: 'text-text-primary'
  },
  orange: {
    bg: 'bg-accent-orange/10',
    selected: 'bg-accent-orange/30',
    hover: 'bg-accent-orange/20',
    text: 'text-text-primary',
    textSelected: 'text-text-primary'
  }
};

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

function NoteItem({ note, isSelected, onClick, index, isDraggable = true }) {
  const { deleteNote, updateNote } = useNotesStore();
  const preview = note.content?.substring(0, 100) || 'No content';
  const date = note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : '';

  // Get color scheme for this note
  const noteColor = NOTE_COLORS[note.color || 'default'] || NOTE_COLORS.default;

  // Drag and drop functionality (skip for pinned notes)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: note.id,
    data: {
      type: 'note',
      note
    },
    disabled: !isDraggable || note.isPinned,
    activationConstraint: {
      distance: 5
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleDelete = () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete "{note.title}"?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await deleteNote(note.id);
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
    ), { duration: Infinity });
  };

  const handlePin = async () => {
    await updateNote(note.id, { isPinned: !note.isPinned });
    toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
  };

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction onClick={handleDelete} destructive={true}>
        <div className="flex items-center justify-center h-full bg-accent-red px-4">
          <span className="text-white font-semibold">🗑️ Delete</span>
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction onClick={handlePin}>
        <div className="flex items-center justify-center h-full bg-accent-yellow px-4">
          <span className="text-text-inverse font-semibold">
            {note.isPinned ? '📍 Unpin' : '📌 Pin'}
          </span>
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <SwipeableListItem
        leadingActions={leadingActions()}
        trailingActions={trailingActions()}
        className="lg:hidden"
      >
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          {...attributes}
          {...listeners}
          className={`rounded-card p-2.5 cursor-pointer transition-all duration-200 touch-none ${
            isSelected ? `${noteColor.selected} shadow-hover` : `${noteColor.bg} hover:${noteColor.hover} hover:shadow-card`
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-bold truncate tracking-tight ${isSelected ? noteColor.textSelected : noteColor.text}`}>
                {note.isPinned && '📌 '}{note.title || 'Untitled Note'}
              </h3>
              <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isSelected ? `${noteColor.textSelected}/90` : 'text-text-secondary'}`}>
                {date && `${date} • `}{preview}
              </p>
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {note.tags.slice(0, 3).map((tag) => {
                    const colorScheme = TAG_COLORS.find(c => c.name === tag.color) || TAG_COLORS[0];
                    return (
                      <span
                        key={tag.name}
                        className={`px-1.5 py-0.5 ${colorScheme.bg} ${colorScheme.text} text-xs rounded font-medium`}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                  {note.tags.length > 3 && (
                    <span className="px-1.5 py-0.5 text-xs text-text-tertiary">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </SwipeableListItem>

      {/* Desktop version without swipe */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        {...attributes}
        {...listeners}
        className={`hidden lg:block rounded-card p-2.5 cursor-pointer transition-all duration-200 touch-none ${
          isSelected ? `${noteColor.selected} shadow-hover` : `${noteColor.bg} hover:${noteColor.hover} hover:shadow-card`
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold truncate tracking-tight ${isSelected ? noteColor.textSelected : noteColor.text}`}>
              {note.isPinned && '📌 '}{note.title || 'Untitled Note'}
            </h3>
            <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isSelected ? `${noteColor.textSelected}/90` : 'text-text-secondary'}`}>
              {date && `${date} • `}{preview}
            </p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {note.tags.slice(0, 3).map((tag) => {
                  const colorScheme = TAG_COLORS.find(c => c.name === tag.color) || TAG_COLORS[0];
                  return (
                    <span
                      key={tag.name}
                      className={`px-1.5 py-0.5 ${colorScheme.bg} ${colorScheme.text} text-xs rounded font-medium`}
                    >
                      {tag.name}
                    </span>
                  );
                })}
                {note.tags.length > 3 && (
                  <span className="px-1.5 py-0.5 text-xs text-text-tertiary">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NotesList() {
  const { getFilteredNotes, selectedNoteId, selectNote, createNote, selectedFolderId, moveNote } = useNotesStore();
  const notes = getFilteredNotes();
  const groups = groupNotesByDate(notes);

  const [activeNote, setActiveNote] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // Configure sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'note') {
      setActiveNote(active.data.current.note);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Only handle note dragging
    if (activeData?.type !== 'note') return;

    const activeNoteId = active.id;
    const overNoteId = over.id;

    // If dragging over another note
    if (overData?.type === 'note') {
      const activeNote = activeData.note;
      const overNote = overData.note;

      // Skip if dragging over a pinned note or if active note is pinned
      if (activeNote.isPinned || overNote.isPinned) return;

      // Only reorder within same folder
      if (activeNote.folderId !== overNote.folderId) return;

      if (activeNoteId !== overNoteId) {
        const folderNotes = notes.filter(n => n.folderId === activeNote.folderId && !n.isPinned);
        const activeIndex = folderNotes.findIndex(n => n.id === activeNoteId);
        const overIndex = folderNotes.findIndex(n => n.id === overNoteId);

        if (activeIndex !== overIndex) {
          moveNote(activeNoteId, activeNote.folderId, overIndex);
        }
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.data.current?.note) {
      const note = active.data.current.note;
      setAnnouncement(`Moved "${note.title || 'Untitled Note'}"`);
    }

    setActiveNote(null);

    // Clear announcement after screen reader reads it
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const handleCreateNote = async () => {
    if (!selectedFolderId) {
      toast.error('Please select a folder first');
      return;
    }
    await createNote(selectedFolderId);
    toast.success('Note created');
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Pinned Section */}
        {groups.pinned.length > 0 && (
          <div className="mb-4">
            <div className="px-3 py-1">
              <p className="text-xs text-text-tertiary font-medium">📌 Pinned</p>
            </div>
            <div className="space-y-1 px-2">
              {groups.pinned.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                  isDraggable={false}
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
          <SortableContext items={groups.today.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 px-2">
              {groups.today.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Yesterday Section */}
      {groups.yesterday.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Yesterday</p>
          </div>
          <SortableContext items={groups.yesterday.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 px-2">
              {groups.yesterday.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Previous 7 Days Section */}
      {groups.previous7Days.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Previous 7 Days</p>
          </div>
          <SortableContext items={groups.previous7Days.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 px-2">
              {groups.previous7Days.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Previous 30 Days Section */}
      {groups.previous30Days.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Previous 30 Days</p>
          </div>
          <SortableContext items={groups.previous30Days.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 px-2">
              {groups.previous30Days.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Older Section */}
      {groups.older.length > 0 && (
        <div className="mb-4">
          <div className="px-3 py-1">
            <p className="text-xs text-text-tertiary font-medium">Older</p>
          </div>
          <SortableContext items={groups.older.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 px-2">
              {groups.older.map((note, index) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  index={index}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Empty State */}
      {notes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="text-7xl mb-4">📝</div>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent-yellow/20 blur-xl rounded-full"></div>
              <h3 className="relative text-xl font-bold text-text-primary mb-2">No notes yet</h3>
            </div>
          </motion.div>
          <p className="text-text-secondary mb-6">
            Start capturing your thoughts, ideas, and important information
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-2 text-text-tertiary text-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-accent-yellow">✨</span>
              <span>Organize with folders</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-accent-blue">🔖</span>
              <span>Pin important notes</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-accent-green">🔍</span>
              <span>Search instantly</span>
            </div>
          </motion.div>
        </motion.div>
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

    {/* Drag Overlay */}
    <DragOverlay>
      {activeNote ? (
        <div className="bg-bg-panel p-2.5 rounded-card shadow-modal border-2 border-accent-yellow cursor-grabbing rotate-3">
          <h3 className="text-sm font-bold text-text-primary truncate">
            {activeNote.isPinned && '📌 '}{activeNote.title || 'Untitled Note'}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-2 mt-1">
            {activeNote.content?.substring(0, 100) || 'No content'}
          </p>
          {activeNote.tags && activeNote.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {activeNote.tags.slice(0, 3).map((tag) => {
                const colorScheme = TAG_COLORS.find(c => c.name === tag.color) || TAG_COLORS[0];
                return (
                  <span
                    key={tag.name}
                    className={`px-1.5 py-0.5 ${colorScheme.bg} ${colorScheme.text} text-xs rounded font-medium`}
                  >
                    {tag.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </DragOverlay>
  </DndContext>
  );
}

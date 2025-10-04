import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useTasksStore } from '../../store/tasksStore';

export default function Card({ card }) {
  const { selectCard, deleteCard } = useTasksStore();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const pressTimer = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card
    },
    // Enable keyboard navigation
    activationConstraint: {
      distance: 5
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const handleClick = (e) => {
    // Prevent opening modal while dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
    selectCard(card.id);
  };

  // Long-press handlers for mobile context menu
  const handleTouchStart = () => {
    pressTimer.current = setTimeout(() => {
      setShowContextMenu(true);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleDelete = async () => {
    await deleteCard(card.id);
    setShowContextMenu(false);
  };

  const handleEdit = () => {
    selectCard(card.id);
    setShowContextMenu(false);
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        aria-label={`Card: ${card.title}. Press space to drag and move with arrow keys.`}
        aria-pressed={isDragging}
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)', transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        className="bg-bg-panel p-3 md:p-2 mb-3 md:mb-2 min-h-[56px] rounded-card shadow-card border border-border hover:bg-bg-hover transition-all duration-200 touch-none"
      >
        <p className="text-sm font-medium text-text-primary">{card.title}</p>
        {card.tags && card.tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mobile Context Menu (Bottom Sheet) */}
      {showContextMenu && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowContextMenu(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet Menu */}
          <div className="fixed bottom-0 inset-x-0 bg-bg-glass-heavy backdrop-blur-xl border-t border-border/50 rounded-t-modal z-50 animate-slide-up shadow-2xl">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{card.title}</h3>
              <button
                onClick={handleEdit}
                className="w-full py-3 text-left text-text-primary hover:bg-bg-hover rounded-button transition-colors"
              >
                Edit Card
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-3 text-left text-accent-red hover:bg-bg-hover rounded-button transition-colors"
              >
                Delete Card
              </button>
              <button
                onClick={() => setShowContextMenu(false)}
                className="w-full py-3 text-left text-text-secondary hover:bg-bg-hover rounded-button transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

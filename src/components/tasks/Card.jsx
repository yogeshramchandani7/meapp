import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasksStore } from '../../store/tasksStore';

export default function Card({ card }) {
  const { selectCard } = useTasksStore();

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Card: ${card.title}. Press space to drag and move with arrow keys.`}
      aria-pressed={isDragging}
      className="bg-bg-panel p-3 rounded-card shadow-card border border-border hover:bg-bg-hover transition-colors touch-none"
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
    </div>
  );
}

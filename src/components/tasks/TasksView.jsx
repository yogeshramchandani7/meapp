import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTasksStore } from '../../store/tasksStore';
import MobileMenu from '../layout/MobileMenu';
import BoardSidebar from './BoardSidebar';
import List from './List';
import Card from './Card';
import CardModal from './CardModal';

export default function TasksView() {
  const { loadData, boards, selectedBoardId, getListsForBoard, createList, moveCard, getCardsForList } = useTasksStore();
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const selectedBoard = boards.find(b => b.id === selectedBoardId);
  const lists = getListsForBoard(selectedBoardId);

  // Configure sensors for drag & drop (mouse/touch and keyboard)
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
    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Only handle card dragging
    if (activeData?.type !== 'card') return;

    const activeCardId = active.id;
    const overCardId = over.id;

    // If dragging over a list (not another card)
    if (overData?.type === 'list') {
      const newListId = over.id;
      const activeCard = activeData.card;

      // If card is not already in this list, move it
      if (activeCard.listId !== newListId) {
        const newListCards = getCardsForList(newListId);
        moveCard(activeCardId, newListId, newListCards.length);
      }
    }
    // If dragging over another card
    else if (overData?.type === 'card') {
      const activeCard = activeData.card;
      const overCard = overData.card;

      if (activeCard.listId !== overCard.listId) {
        // Moving to different list
        const newListCards = getCardsForList(overCard.listId);
        const overIndex = newListCards.findIndex(c => c.id === overCardId);
        moveCard(activeCardId, overCard.listId, overIndex);
      } else if (activeCardId !== overCardId) {
        // Reordering within same list
        const listCards = getCardsForList(activeCard.listId);
        const activeIndex = listCards.findIndex(c => c.id === activeCardId);
        const overIndex = listCards.findIndex(c => c.id === overCardId);

        if (activeIndex !== overIndex) {
          moveCard(activeCardId, activeCard.listId, overIndex);
        }
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.data.current?.card) {
      const card = active.data.current.card;
      const overData = over.data.current;

      if (overData?.type === 'list') {
        const list = overData.list;
        setAnnouncement(`Moved "${card.title}" to ${list.name} list`);
      } else if (overData?.type === 'card') {
        setAnnouncement(`Reordered "${card.title}"`);
      }
    }

    setActiveCard(null);

    // Clear announcement after screen reader reads it
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    await createList(selectedBoardId, newListName.trim());
    setNewListName('');
    setShowAddList(false);
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

      <div className="h-full flex">
        {/* Board Sidebar - Wrapped in MobileMenu for responsive behavior */}
        <MobileMenu title="Boards">
          <BoardSidebar />
        </MobileMenu>

        {/* Board Area */}
        <div className="flex-1 bg-bg-app overflow-x-auto">
          {selectedBoard ? (
            <div className="p-4 md:p-6">
              <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-4 md:mb-6">{selectedBoard.name}</h1>

              {/* Lists Container - Horizontal scroll with snap points for mobile */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {/* Render Lists */}
                {lists.map(list => (
                  <div key={list.id} className="snap-start">
                    <List list={list} />
                  </div>
                ))}

                {/* Add List Button/Form */}
                <div className="w-72 flex-shrink-0">
                  {!showAddList ? (
                    <button
                      onClick={() => setShowAddList(true)}
                      className="w-full py-3 px-4 bg-bg-elevated hover:bg-bg-hover rounded-card text-left text-text-primary font-medium transition-colors"
                    >
                      + Add another list
                    </button>
                  ) : (
                    <div className="bg-bg-elevated rounded-card p-3">
                      <form onSubmit={handleAddList} className="space-y-2">
                        <input
                          type="text"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder="Enter list title..."
                          autoFocus
                          className="w-full px-3 py-2 text-sm bg-bg-panel text-text-primary border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-border-focus placeholder:text-text-tertiary"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-accent-blue text-white text-sm rounded-button hover:bg-accent-blue/80"
                          >
                            Add List
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddList(false);
                              setNewListName('');
                            }}
                            className="px-3 py-1.5 bg-bg-panel text-text-primary text-sm rounded-button hover:bg-bg-hover border border-border"
                          >
                            ✕
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Empty State - No Lists */}
              {lists.length === 0 && !showAddList && (
                <div className="text-center py-12">
                  <p className="text-text-secondary text-lg mb-4">This board is empty</p>
                  <p className="text-text-tertiary text-sm mb-6">Create your first list to get started</p>
                  <button
                    onClick={() => setShowAddList(true)}
                    className="px-6 py-3 bg-accent-blue text-white rounded-button hover:bg-accent-blue/80 font-medium"
                  >
                    + Add a list
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State - No Board Selected */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-text-secondary text-xl mb-2">No board selected</p>
                <p className="text-text-tertiary text-sm">
                  {boards.length === 0 ? 'Create your first board to get started' : 'Select a board from the sidebar'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card Modal */}
        <CardModal />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? (
          <div className="bg-bg-panel p-3 rounded-card shadow-modal border-2 border-accent-yellow cursor-grabbing rotate-3">
            <p className="text-sm font-medium text-text-primary">{activeCard.title}</p>
            {activeCard.tags && activeCard.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {activeCard.tags.map((tag, index) => (
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
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

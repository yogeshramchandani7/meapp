import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTasksStore } from '../../store/tasksStore';
import Card from './Card';

export default function List({ list }) {
  const { getCardsForList, createCard, updateList, deleteList } = useTasksStore();
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [listName, setListName] = useState(list.name);

  const cards = getCardsForList(list.id);
  const cardIds = cards.map(c => c.id);

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      list
    }
  });

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await createCard(list.id, { title: newCardTitle.trim() });
    setNewCardTitle('');
    setShowAddCard(false);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;
    await updateList(list.id, { name: listName.trim() });
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete list "${list.name}" and all its cards?`)) {
      await deleteList(list.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-bg-panel rounded-card p-3">
        {/* List Header */}
        <div className="flex items-center justify-between mb-3">
          {!isRenaming ? (
            <h2 className="font-semibold text-text-primary">{list.name}</h2>
          ) : (
            <form onSubmit={handleRename} className="flex-1">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onBlur={handleRename}
                autoFocus
                className="w-full px-2 py-1 text-sm font-semibold bg-bg-elevated text-text-primary border border-border-focus rounded-input focus:outline-none"
              />
            </form>
          )}

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-secondary hover:text-text-primary px-2"
            >
              ⋯
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-bg-elevated rounded-card shadow-modal border border-border py-1 z-10">
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-hover"
                >
                  Rename List
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-bg-hover"
                >
                  Delete List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div
          ref={setNodeRef}
          className="space-y-2 mb-3 min-h-[20px]"
          role="region"
          aria-label={`${list.name} list - drop zone for cards`}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <Card key={card.id} card={card} />
            ))}
          </SortableContext>
        </div>

        {/* Add Card Form */}
        {!showAddCard ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full py-2 px-3 text-left text-sm text-text-secondary hover:bg-bg-hover rounded-button transition-colors"
          >
            + Add a card
          </button>
        ) : (
          <form onSubmit={handleAddCard} className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              autoFocus
              rows={3}
              className="w-full px-3 py-2 text-sm bg-bg-elevated text-text-primary border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-border-focus placeholder:text-text-tertiary"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-accent-blue text-white text-sm rounded-button hover:bg-accent-blue/80"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCard(false);
                  setNewCardTitle('');
                }}
                className="px-3 py-1.5 bg-bg-elevated text-text-primary border border-border text-sm rounded-button hover:bg-bg-hover"
              >
                ✕
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

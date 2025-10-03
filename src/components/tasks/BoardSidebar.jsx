import { useState } from 'react';
import { useTasksStore } from '../../store/tasksStore';

export default function BoardSidebar() {
  const { boards, selectedBoardId, selectBoard, createBoard, deleteBoard } = useTasksStore();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    await createBoard(newBoardName.trim());
    setNewBoardName('');
    setShowNewBoard(false);
  };

  const handleDeleteBoard = async (id, name, e) => {
    e.stopPropagation();
    if (confirm(`Delete board "${name}" and all its lists and cards?`)) {
      await deleteBoard(id);
    }
  };

  return (
    <div className="w-64 bg-bg-panel border-r border-border p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Boards</h2>

      {/* Boards List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {boards.map(board => (
          <div
            key={board.id}
            onClick={() => selectBoard(board.id)}
            className={`p-3 rounded-card border cursor-pointer transition-colors ${
              selectedBoardId === board.id
                ? 'bg-accent-yellow border-accent-yellow'
                : 'bg-bg-elevated border-border hover:bg-bg-hover'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${
                selectedBoardId === board.id ? 'text-text-inverse' : 'text-text-primary'
              }`}>
                {board.isStarred && '⭐ '}{board.name}
              </p>
              <button
                onClick={(e) => handleDeleteBoard(board.id, board.name, e)}
                className={`text-xs ${
                  selectedBoardId === board.id ? 'text-text-inverse/70 hover:text-text-inverse' : 'text-text-secondary hover:text-accent-red'
                }`}
                title="Delete board"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {boards.length === 0 && !showNewBoard && (
          <div className="text-center text-text-secondary text-sm py-8">
            <p>No boards yet</p>
            <p className="text-xs text-text-tertiary mt-1">Create your first board!</p>
          </div>
        )}
      </div>

      {/* New Board Form */}
      {!showNewBoard ? (
        <button
          onClick={() => setShowNewBoard(true)}
          className="mt-4 w-full py-2 px-4 bg-accent-blue text-white rounded-button hover:bg-accent-blue/80 transition-colors text-sm font-medium"
        >
          + New Board
        </button>
      ) : (
        <form onSubmit={handleCreateBoard} className="mt-4 space-y-2">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Board name"
            autoFocus
            className="w-full px-3 py-2 text-sm bg-bg-elevated text-text-primary border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-border-focus placeholder:text-text-tertiary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 bg-accent-blue text-white text-sm rounded-button hover:bg-accent-blue/80"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewBoard(false);
                setNewBoardName('');
              }}
              className="flex-1 px-3 py-1.5 bg-bg-elevated text-text-primary border border-border text-sm rounded-button hover:bg-bg-hover"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import { StickyNote, CheckSquare, Plus } from 'lucide-react';

export default function BottomNav({ currentMode, onModeChange, onQuickAdd }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-bg-glass-heavy backdrop-blur-xl border-t border-border/50 z-50 shadow-lg">
      <div
        className="flex justify-around items-center h-16 px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Notes Button */}
        <button
          onClick={() => onModeChange('notes')}
          className={`
            flex flex-col items-center justify-center flex-1 py-2 rounded-button transition-colors
            ${currentMode === 'notes' ? 'text-accent-yellow' : 'text-text-secondary'}
          `}
          aria-label="Switch to Notes mode"
          aria-current={currentMode === 'notes' ? 'page' : undefined}
        >
          <StickyNote size={24} />
          <span className="text-xs mt-1 font-medium">Notes</span>
        </button>

        {/* Quick Add Button (Floating) */}
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            className="flex items-center justify-center w-14 h-14 -mt-8 bg-accent-yellow text-text-inverse rounded-full shadow-modal hover:bg-accent-yellow/90 transition-colors"
            aria-label="Quick add"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        )}

        {/* Tasks Button */}
        <button
          onClick={() => onModeChange('tasks')}
          className={`
            flex flex-col items-center justify-center flex-1 py-2 rounded-button transition-colors
            ${currentMode === 'tasks' ? 'text-accent-yellow' : 'text-text-secondary'}
          `}
          aria-label="Switch to Tasks mode"
          aria-current={currentMode === 'tasks' ? 'page' : undefined}
        >
          <CheckSquare size={24} />
          <span className="text-xs mt-1 font-medium">Tasks</span>
        </button>
      </div>
    </nav>
  );
}

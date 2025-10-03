export default function ModeToggle({ currentMode, onModeChange }) {
  return (
    <div className="inline-flex gap-2">
      <button
        onClick={() => onModeChange('notes')}
        className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
          currentMode === 'notes'
            ? 'bg-accent-yellow text-text-inverse hover:bg-accent-yellow/90'
            : 'bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border'
        }`}
      >
        Notes
      </button>
      <button
        onClick={() => onModeChange('tasks')}
        className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
          currentMode === 'tasks'
            ? 'bg-accent-yellow text-text-inverse hover:bg-accent-yellow/90'
            : 'bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border'
        }`}
      >
        Tasks
      </button>
    </div>
  );
}

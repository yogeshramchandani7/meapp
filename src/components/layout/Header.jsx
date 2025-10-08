import ModeToggle from './ModeToggle';

export default function Header({ currentMode, onModeChange }) {
  return (
    <header className="bg-bg-panel border-b border-border pl-3 pr-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h1 className="text-2xl font-extrabold bg-gradient-yellow bg-clip-text text-transparent tracking-tight">
            Task & Notes
          </h1>
        </div>
        <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />
      </div>
    </header>
  );
}

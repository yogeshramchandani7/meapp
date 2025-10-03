import ModeToggle from './ModeToggle';

export default function Header({ currentMode, onModeChange }) {
  return (
    <header className="bg-bg-panel border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <h1 className="text-xl font-semibold text-text-primary">
          Task & Notes App
        </h1>
        <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />
      </div>
    </header>
  );
}

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Header from './Header';
import BottomNav from './BottomNav';
import NotesView from '../notes/NotesView';
import TasksView from '../tasks/TasksView';
import ToastProvider from '../ui/ToastProvider';

export default function MainLayout() {
  const [currentMode, setCurrentMode] = useState('notes');

  // Swipe gesture handlers for mobile mode switching
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentMode('tasks'),
    onSwipedRight: () => setCurrentMode('notes'),
    preventScrollOnSwipe: true,
    trackMouse: false, // Only touch, not mouse
    delta: 50, // Minimum swipe distance
  });

  const handleQuickAdd = () => {
    // TODO: Implement quick add functionality
    // For now, this is a placeholder
    console.log('Quick add clicked');
  };

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gray-50" {...swipeHandlers}>
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header currentMode={currentMode} onModeChange={setCurrentMode} />
        </div>

        {/* Mobile: Simple Title Only */}
        <div className="lg:hidden sticky top-0 z-40 bg-bg-glass-heavy backdrop-blur-xl border-b border-border/50 px-4 py-4">
          <h1 className="text-xl font-extrabold bg-gradient-yellow bg-clip-text text-transparent tracking-tight">
            {currentMode === 'notes' ? '📝 Notes' : '✓ Tasks'}
          </h1>
        </div>

        {/* Main Content: Account for bottom nav on mobile */}
        <main className="h-[calc(100vh-57px)] lg:h-[calc(100vh-73px)] pb-16 lg:pb-0">
          {currentMode === 'notes' ? <NotesView /> : <TasksView />}
        </main>

        {/* Bottom Navigation (mobile only) */}
        <BottomNav
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onQuickAdd={handleQuickAdd}
        />
      </div>
    </>
  );
}

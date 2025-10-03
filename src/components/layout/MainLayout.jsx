import { useState } from 'react';
import Header from './Header';
import NotesView from '../notes/NotesView';
import TasksView from '../tasks/TasksView';

export default function MainLayout() {
  const [currentMode, setCurrentMode] = useState('notes');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentMode={currentMode} onModeChange={setCurrentMode} />
      <main className="h-[calc(100vh-73px)]">
        {currentMode === 'notes' ? <NotesView /> : <TasksView />}
      </main>
    </div>
  );
}

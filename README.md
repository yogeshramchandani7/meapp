# Task & Notes App

A modern, feature-rich task management and note-taking application built with React, featuring dark mode UI and drag-and-drop functionality.

## Features

### 📝 Notes

- **Folders & Organization**: Create folders to organize your notes
- **Drag & Drop Reordering**: Drag notes to manually reorder them within folders
- **Color Coding**: Assign colors to notes for visual organization (5 minimalistic color options)
- **Tags**: Add colorful tags to categorize notes
- **Pin Important Notes**: Pin notes to keep them at the top
- **Auto-save**: Changes are automatically saved as you type
- **Smart Search**: Search notes by title, content, or tags
- **Date Grouping**: Notes automatically grouped by date (Today, Yesterday, Previous 7 Days, etc.)

### ✅ Tasks (Kanban Board)

- **Multiple Boards**: Create separate boards for different projects
- **Drag & Drop Cards**: Drag cards between lists and reorder within lists
- **Progress Tracking**: Visual progress bars for each list
- **Tags**: Add tags to cards for better organization
- **Card Details**: Add descriptions and additional information to cards

### 🎨 UI/UX

- **Dark Mode**: Beautiful dark theme with minimalistic design
- **Mobile Responsive**: Fully responsive with touch-optimized gestures
- **Swipe Actions**: Swipe notes and cards for quick actions on mobile
- **Smooth Animations**: Polished transitions and micro-interactions using Framer Motion
- **Accessibility**: Keyboard navigation, screen reader support, and ARIA labels

## Tech Stack

- **React 19** - UI framework
- **Zustand** - State management
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **@dnd-kit** - Drag and drop functionality
- **date-fns** - Date formatting and manipulation
- **localStorage** - Data persistence

## Data Storage & Persistence

This app uses **browser localStorage** for data persistence - no backend or database required!

### How It Works

- All notes, tasks, folders, and boards are **automatically saved** to your browser's localStorage
- Data **persists between sessions** - close the tab/browser and come back anytime
- **No account needed** - your data stays private on your device
- **Works offline** - no internet connection required

### Important Notes

- **Device/Browser Specific**: Data is stored locally in your browser and won't sync across devices or different browsers
- **Storage Limit**: Most browsers allow 5-10MB of localStorage (more than enough for thousands of notes)
- **Private/Incognito Mode**: Data will be cleared when you close the browser in private/incognito mode
- **Clearing Browser Data**: If you clear your browser's cache/cookies, your notes and tasks will be deleted

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd claude-project
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Usage

### Notes

1. **Creating a Folder**: Click "+ New Folder" in the folder selector
2. **Creating a Note**: Select a folder and click "+ New Note"
3. **Drag to Reorder**: Click and drag notes to reorder them (pinned notes cannot be dragged)
4. **Color Coding**: Select a color from the color picker in the note editor
5. **Adding Tags**: Type tag name and click "Add Tag"
6. **Pin Note**: Click the pin button to keep important notes at the top

### Tasks

1. **Creating a Board**: Click "+ New Board" in the board sidebar
2. **Adding Lists**: Click "+ Add another list" to create columns
3. **Creating Cards**: Click "+ Add a card" within any list
4. **Moving Cards**: Drag cards between lists or reorder within a list
5. **Editing Cards**: Click on a card to open the detail modal

## Project Structure

```
src/
├── components/
│   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   ├── notes/         # Notes-related components
│   │   ├── NoteEditor.jsx
│   │   ├── NotesList.jsx
│   │   └── FolderSelector.jsx
│   ├── tasks/         # Task-related components
│   │   ├── TasksView.jsx
│   │   ├── List.jsx
│   │   ├── Card.jsx
│   │   └── CardModal.jsx
│   └── ui/            # Reusable UI components
├── store/             # Zustand state management
│   ├── notesStore.js
│   └── tasksStore.js
├── services/          # Services (localStorage, etc.)
└── tests/             # Unit, integration, and E2E tests
```

## License

MIT

## Troubleshooting

### Notes or Tasks Disappearing?

If your notes or tasks are disappearing when you close the browser:

1. **Check Browser Mode**: Are you using Private/Incognito mode? Data is automatically cleared when you close private windows
2. **Browser Settings**: Check if your browser is set to "Clear cookies and site data when you close all windows"
3. **Storage Permissions**: Ensure your browser allows localStorage for this site
4. **Browser Updates**: Try updating to the latest browser version
5. **Test localStorage**: Open browser console (F12) and run:
   ```javascript
   localStorage.setItem('test', 'data');
   localStorage.getItem('test'); // Should return 'data'
   ```

### Storage Full?

If you see errors about storage:

- Each browser typically allows 5-10MB of localStorage
- Try deleting old folders/boards you no longer need
- Consider exporting important data (feature coming soon!)

### Data Not Syncing?

Remember: This app uses **localStorage**, which is device and browser-specific. Your data will NOT sync:
- Between different devices (phone vs laptop)
- Between different browsers (Chrome vs Firefox)
- Across browser profiles

For multi-device sync, you'd need a backend service (not currently implemented).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

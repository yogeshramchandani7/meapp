# Task & Notes App

A modern, feature-rich task management and note-taking application built with React, featuring dark mode UI, drag-and-drop functionality, and full markdown support.

## Features

### 📝 Notes

- **Folders & Organization**: Create folders to organize your notes
- **Rich Markdown Editor**: Full markdown support with live preview
  - Syntax highlighting for code blocks
  - Tables, checkboxes, lists, and more (GitHub Flavored Markdown)
  - Split-pane view on desktop, toggle view on mobile
  - Toolbar with quick formatting buttons
  - Keyboard shortcuts (Cmd/Ctrl+B for bold, Cmd/Ctrl+I for italic, etc.)
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
- **react-markdown** - Markdown rendering
- **react-syntax-highlighter** - Code syntax highlighting
- **date-fns** - Date formatting and manipulation
- **localStorage** - Data persistence

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
3. **Using Markdown**:
   - Use the toolbar buttons for quick formatting
   - Or type markdown syntax directly (e.g., `# Heading`, `**bold**`, `*italic*`)
   - Toggle preview on mobile or use split view on desktop
4. **Drag to Reorder**: Click and drag notes to reorder them (pinned notes cannot be dragged)
5. **Color Coding**: Select a color from the color picker in the note editor
6. **Adding Tags**: Type tag name and click "Add Tag"
7. **Pin Note**: Click the pin button to keep important notes at the top

### Tasks

1. **Creating a Board**: Click "+ New Board" in the board sidebar
2. **Adding Lists**: Click "+ Add another list" to create columns
3. **Creating Cards**: Click "+ Add a card" within any list
4. **Moving Cards**: Drag cards between lists or reorder within a list
5. **Editing Cards**: Click on a card to open the detail modal

## Markdown Support

The app supports full GitHub Flavored Markdown (GFM):

- **Headings**: `# H1`, `## H2`, `### H3`
- **Bold**: `**bold text**` or `__bold text__`
- **Italic**: `*italic text*` or `_italic text_`
- **Strikethrough**: `~~strikethrough~~`
- **Code**: `` `inline code` ``
- **Code Blocks**: ` ```language ... ``` `
- **Links**: `[link text](url)`
- **Lists**: `- item` or `1. item`
- **Checkboxes**: `- [ ] unchecked` or `- [x] checked`
- **Quotes**: `> quote text`
- **Tables**: Standard GFM table syntax
- **Horizontal Rules**: `---`

### Keyboard Shortcuts

- `Cmd/Ctrl + B`: Bold
- `Cmd/Ctrl + I`: Italic
- `Cmd/Ctrl + K`: Insert link
- `Tab`: Indent

## Project Structure

```
src/
├── components/
│   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   ├── notes/         # Notes-related components
│   │   ├── NoteEditor.jsx
│   │   ├── NotesList.jsx
│   │   ├── MarkdownEditor.jsx
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

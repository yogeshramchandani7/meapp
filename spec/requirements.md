# Task Management & Note-Taking App Specification

## Overview
A dual-mode application that provides both note-taking (Apple Notes replica) and task management (Trello replica) functionality with a toggle to switch between modes.

---

## 1. Requirements

### 1.1 Core Features

#### Top-Level Navigation
- **Mode Toggle**: A prominent toggle/switcher at the top of the app to switch between:
  - Notes Mode (Apple Notes replica)
  - Tasks Mode (Trello replica)
- The toggle should preserve state when switching (e.g., current note/board selection)

---

### 1.2 Notes Mode (Apple Notes Replica)

#### Layout
- **Three-column layout**:
  1. **Folders Sidebar** (left): List of folders and iCloud/On My Device sections (covers 15% of horizontal width)
  2. **Notes List** (middle): Preview of notes in selected folder (covers 15% of horizontal width)
  3. **Note Editor** (right): Full note content and editing area (covers remaining 70% of horizontal width)

#### Folders Management
- Create new folders
- Rename folders
- Delete folders
- Default "Notes" folder
- Folder count badge (number of notes in folder)
- Drag Functionality to move folders up or down

#### Notes List Features
- Display notes with:
  - Note title (first line or explicit title)
  - Preview text (first few lines)
  - Last modified date/time
  - Pinned indicator
- Sort options:
  - Default sort to which is the most latest created note
- Drag Functionality to move Notes up or down

#### Note Editor Features
- **Rich text editing**:
  - Bold, italic, underline, strikethrough
  - Headings (H1, H2, H3)
  - Bulleted lists
  - Numbered lists
  - Checklist items
  - Indentation/outdentation
- **Formatting toolbar**: Show/hide formatting options
- **Character/word count** (optional)
- **Auto-save**: Save changes automatically
- **Timestamp**: Display "last edited" timestamp
- Create new note button
- Delete note option



---

### 1.3 Tasks Mode (Trello Replica)

#### Board Management
- **Boards sidebar**: List of all boards
- Create new boards
- Rename boards
- Delete boards
- Archive boards
- Board backgrounds/colors
- Star/favorite boards

#### Lists (Columns)
- Create lists within a board
- Rename lists
- Delete/archive lists
- Reorder lists (drag & drop)
- List actions menu:
  - Move all cards
  - Archive all cards
  - Sort cards by name/date

#### Cards
- **Card creation**: Quick add card at bottom of list
- **Card details**:
  - Title (required)
  - Description (rich text optional)
  - Due date
  - Labels/tags with colors
  - Checklists
  - Attachments (optional for v1)
  - Comments/activity log
  - Members/assignees (optional for v1)
- **Card actions**:
  - Edit card
  - Move card to different list
  - Copy card
  - Archive/delete card
- **Drag & drop**:
  - Cards between lists
  - Cards within same list (reorder)
  - Lists (reorder)

#### Additional Tasks Features


---

### 1.4 Common/Shared Features

- **Responsive design**: Mobile, tablet, desktop
- **Data persistence**: Local storage or database
- **Settings panel**:
  - Default view mode
  - Font size preferences
  - Auto-save intervals

---

## 2. Design Approach

### 2.1 Architecture Pattern
- **Component-based architecture**: React/Vue components for reusability
- **State management**: Context API or lightweight state library (Zustand/Redux)
- **Separation of concerns**:
  - UI Components
  - Business Logic (hooks/services)
  - Data Layer (local storage/API)

### 2.2 Data Structure

#### Notes Data Model
```json
{
  "id": "unique-id",
  "folderId": "folder-id",
  "title": "Note title",
  "content": "Rich text content",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "isPinned": false,
  "tags": []
}
```

#### Folders Data Model
```json
{
  "id": "unique-id",
  "name": "Folder name",
  "createdAt": "timestamp",
  "noteCount": 0
}
```

#### Boards Data Model
```json
{
  "id": "unique-id",
  "name": "Board name",
  "background": "#color or image-url",
  "isStarred": false,
  "lists": [],
  "createdAt": "timestamp"
}
```

#### Lists Data Model
```json
{
  "id": "unique-id",
  "boardId": "board-id",
  "name": "List name",
  "position": 0,
  "cards": []
}
```

#### Cards Data Model
```json
{
  "id": "unique-id",
  "listId": "list-id",
  "title": "Card title",
  "description": "Card description",
  "position": 0,
  "labels": [],
  "dueDate": "timestamp",
  "checklists": [],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 2.3 UI/UX Principles
- **Apple Notes aesthetic**: Clean, minimal, focus on content
- **Trello aesthetic**: Card-based, visual, drag-and-drop friendly
- **Smooth transitions**: Animate mode switching, card movements
- **Intuitive navigation**: Clear visual hierarchy
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support


---

## 3. Recommended Tech Stack

### 3.1 Frontend Framework
**Primary Choice: React with Vite**
- **React 18+**: Component-based, large ecosystem, easy testing
- **Vite**: Fast build tool, instant HMR for quick development
- **TypeScript**: Type safety, better IDE support, fewer bugs

**Alternative: Vue 3**
- Simpler learning curve
- Built-in composition API
- Good for smaller teams

### 3.2 State Management
**Zustand** (Recommended)
- Minimal boilerplate
- Simple API
- Perfect for this size app
- Easy to test

**Alternative: Redux Toolkit**
- More structure for complex state
- Better DevTools
- Industry standard

### 3.3 UI Component Library
**Headless UI + Tailwind CSS**
- **Headless UI**: Unstyled, accessible components
- **Tailwind CSS**: Utility-first CSS, rapid styling
- Full design control
- Small bundle size

**Alternative: Chakra UI or shadcn/ui**
- Pre-built components
- Faster initial development
- Consistent design system

### 3.4 Rich Text Editor
**Tiptap** (Recommended)
- Modern, extensible
- Built on ProseMirror
- React integration
- Headless (full styling control)

**Alternative: Draft.js or Slate**
- More mature (Draft.js)
- Good documentation

### 3.5 Drag & Drop
**dnd-kit** (Recommended)
- Modern, accessible
- Touch-friendly
- Great performance
- Active maintenance

**Alternative: react-beautiful-dnd**
- More opinionated
- Simpler API
- Less flexible

### 3.6 Data Persistence
**Phase 1: Local Storage**
- localStorage API for simple persistence
- No backend needed initially
- Quick to implement

**Phase 2 (Optional): IndexedDB**
- localForage library (wraps IndexedDB)
- Better for larger datasets
- Offline-first approach

**Phase 3 (Optional): Backend**
- **Supabase**: Postgres DB, real-time, auth
- **Firebase**: Real-time database, auth
- **Custom Node.js API**: Full control

### 3.7 Styling
**Tailwind CSS** (Recommended)
- Utility-first
- Rapid development
- Consistent design
- Tree-shaking for small bundles

**Alternative: CSS Modules or Emotion**
- Component-scoped styles
- More traditional CSS

### 3.8 Utilities
- **date-fns** or **Day.js**: Date formatting and manipulation
- **nanoid** or **uuid**: Generate unique IDs
- **clsx**: Conditional className management
- **react-icons**: Icon library

### 3.9 Development Tools
- **ESLint + Prettier**: Code quality and formatting
- **Vitest**: Unit testing (fast, Vite-native)
- **React Testing Library**: Component testing
- **Playwright** or **Cypress**: E2E testing (optional)

### 3.10 Recommended Project Structure
```
claude-project/
├── src/
│   ├── components/
│   │   ├── common/           # Shared components (Button, Modal, etc.)
│   │   ├── notes/            # Notes mode components
│   │   │   ├── FolderSidebar.tsx
│   │   │   ├── NotesList.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── NotesView.tsx
│   │   ├── tasks/            # Tasks mode components
│   │   │   ├── BoardSidebar.tsx
│   │   │   ├── Board.tsx
│   │   │   ├── List.tsx
│   │   │   ├── Card.tsx
│   │   │   └── TasksView.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── ModeToggle.tsx
│   │       └── MainLayout.tsx
│   ├── hooks/                # Custom React hooks
│   ├── store/                # Zustand stores
│   │   ├── notesStore.ts
│   │   └── tasksStore.ts
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript types
│   ├── styles/               # Global styles
│   ├── App.tsx
│   └── main.tsx
├── spec/                     # Documentation
├── public/                   # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## 4. Testing Strategy

### 4.1 Incremental Testing Milestones

**Milestone 1: Basic Structure**
- ✅ Mode toggle switches between views
- ✅ Both views render placeholder content
- ✅ Layout is responsive

**Milestone 2: Notes - Basic CRUD**
- ✅ Create a folder
- ✅ Create a note in folder
- ✅ Edit note content
- ✅ Delete note and folder
- ✅ Data persists on page reload

**Milestone 3: Notes - Rich Features**
- ✅ Rich text formatting works
- ✅ Search finds notes
- ✅ Pin/unpin notes
- ✅ Sort notes by different criteria

**Milestone 4: Tasks - Basic CRUD**
- ✅ Create a board
- ✅ Create lists in board
- ✅ Create cards in lists
- ✅ Edit cards
- ✅ Delete cards, lists, boards

**Milestone 5: Tasks - Drag & Drop**
- ✅ Drag cards within list
- ✅ Drag cards between lists
- ✅ Drag lists to reorder
- ✅ Position persists on reload

**Milestone 6: Tasks - Advanced Features**
- ✅ Add labels to cards
- ✅ Add due dates
- ✅ Add checklists
- ✅ Filter and search cards

**Milestone 7: Polish**
- ✅ Dark mode works in both modes
- ✅ All keyboard shortcuts work
- ✅ Smooth animations
- ✅ No console errors

### 4.2 Manual Testing Checklist
- Test on Chrome, Firefox, Safari
- Test on mobile (responsive)
- Test keyboard navigation
- Test with large datasets (100+ notes/cards)
- Test edge cases (empty states, long text, special characters)

---

## 5. Quick Start Commands

### Initial Setup
```bash
# Create React + Vite + TypeScript project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install zustand @tiptap/react @tiptap/starter-kit @dnd-kit/core @dnd-kit/sortable
npm install date-fns nanoid clsx react-icons

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Dev tools
npm install -D eslint prettier @vitejs/plugin-react
```

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 6. Success Criteria

### Minimum Viable Product (MVP)
- ✅ Toggle between Notes and Tasks modes
- ✅ Notes: Create folders, create/edit/delete notes with rich text
- ✅ Tasks: Create boards, lists, cards with drag & drop
- ✅ Data persists locally
- ✅ Responsive on desktop and mobile
- ✅ Core Apple Notes and Trello features replicated

### Future Enhancements
- Cloud sync (multi-device)
- Collaboration features
- Mobile apps (React Native)
- Advanced search and filters
- Integrations and webhooks
- AI-powered features (auto-categorization, summaries)

---

## 7. Timeline Estimate

- **Setup & Foundation**: 1-2 weeks
- **Notes Mode Complete**: 2-3 weeks
- **Tasks Mode Complete**: 2-3 weeks
- **Polish & Testing**: 1-2 weeks

**Total**: 6-10 weeks for full-featured MVP

---

## Conclusion

This specification provides a comprehensive roadmap for building a dual-mode task management and note-taking app. The recommended tech stack prioritizes simplicity, modern best practices, and incremental testability. By following the phased approach and testing milestones, you can validate functionality at each step and adjust as needed.

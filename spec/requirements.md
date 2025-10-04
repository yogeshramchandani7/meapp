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
  1. **Folders Sidebar** (left): List of folders and iCloud/On My Device sections
  2. **Notes List** (middle): Preview of notes in selected folder
  3. **Note Editor** (right): Full note content and editing area

#### Folders Management
- Create new folders
- Rename folders
- Delete folders
- Default "Notes" folder
- Nested folder support (optional for v1)
- Folder count badge (number of notes in folder)

#### Notes List Features
- Display notes with:
  - Note title (first line or explicit title)
  - Preview text (first few lines)
  - Last modified date/time
  - Pinned indicator
- Sort options:
  - Date Edited
  - Date Created
  - Title (alphabetical)
- Search functionality across all notes
- Pin/unpin notes (pinned notes appear at top)

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
- Share note option (optional for v1)

#### Additional Notes Features
- Lock notes with password (optional for v1)
- Attachments: Images, links (optional for v1)
- Tags/hashtags support (optional for v1)
- Dark mode support

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
- **Filters**: Filter cards by labels, members, due date
- **Search**: Search across all boards and cards
- **Card cover images** (optional for v1)
- **Power-ups/integrations** (optional for v1)
- Dark mode support

---

### 1.4 Common/Shared Features

- **Responsive design**: Mobile, tablet, desktop
- **Data persistence**: Local storage or database
- **Export options**: Export notes/tasks to JSON/PDF (optional)
- **Keyboard shortcuts**: Common actions (Cmd/Ctrl + N for new, etc.)
- **Settings panel**:
  - Theme selection (light/dark)
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

**Design Note**: All models include optional `userId` field for easy Supabase integration later. Use ISO 8601 timestamps for consistency.

#### Notes Data Model
```json
{
  "id": "uuid",
  "userId": "user-uuid (optional for localStorage, required for Supabase)",
  "folderId": "folder-uuid",
  "title": "Note title",
  "content": "Rich text content or markdown",
  "createdAt": "2025-10-02T10:30:00.000Z",
  "updatedAt": "2025-10-02T10:30:00.000Z",
  "isPinned": false,
  "tags": []
}
```

#### Folders Data Model
```json
{
  "id": "uuid",
  "userId": "user-uuid (optional initially)",
  "name": "Folder name",
  "createdAt": "2025-10-02T10:30:00.000Z",
  "noteCount": 0
}
```

#### Boards Data Model
```json
{
  "id": "uuid",
  "userId": "user-uuid (optional initially)",
  "name": "Board name",
  "background": "#color or image-url",
  "isStarred": false,
  "createdAt": "2025-10-02T10:30:00.000Z",
  "updatedAt": "2025-10-02T10:30:00.000Z"
}
```

#### Lists Data Model
```json
{
  "id": "uuid",
  "boardId": "board-uuid",
  "name": "List name",
  "position": 0,
  "createdAt": "2025-10-02T10:30:00.000Z"
}
```

#### Cards Data Model
```json
{
  "id": "uuid",
  "listId": "list-uuid",
  "title": "Card title",
  "description": "Card description",
  "position": 0,
  "labels": [],
  "dueDate": "2025-10-02T10:30:00.000Z or null",
  "checklists": [],
  "createdAt": "2025-10-02T10:30:00.000Z",
  "updatedAt": "2025-10-02T10:30:00.000Z"
}
```

### 2.3 Storage Abstraction Layer

**Key Design Principle**: Separate data storage from business logic to enable easy backend switching.

#### Pattern: Storage Service Interface

All data access goes through storage services that implement a common interface:

```javascript
// src/services/storage/storageInterface.js
// Common interface for localStorage and Supabase

export class StorageService {
  async create(entity) { /* implemented by subclass */ }
  async read(id) { /* implemented by subclass */ }
  async update(id, changes) { /* implemented by subclass */ }
  async delete(id) { /* implemented by subclass */ }
  async list(filters) { /* implemented by subclass */ }
  async search(query) { /* implemented by subclass */ }
}
```

#### LocalStorage Implementation (Phase 1)
```javascript
// src/services/storage/localStorageService.js

export class LocalStorageService extends StorageService {
  constructor(key) {
    super();
    this.key = key;
  }

  async create(entity) {
    const items = this.getAll();
    items.push({ ...entity, id: nanoid() });
    localStorage.setItem(this.key, JSON.stringify(items));
    return entity;
  }

  async list(filters = {}) {
    const items = this.getAll();
    // Apply filters
    return items;
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }
}
```

#### Supabase Implementation (Phase 2+)
```javascript
// src/services/storage/supabaseService.js

export class SupabaseService extends StorageService {
  constructor(tableName, supabaseClient) {
    super();
    this.table = tableName;
    this.client = supabaseClient;
  }

  async create(entity) {
    const { data, error } = await this.client
      .from(this.table)
      .insert([entity])
      .select();
    if (error) throw error;
    return data[0];
  }

  async list(filters = {}) {
    let query = this.client.from(this.table).select('*');
    // Apply filters
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
```

#### Usage in Zustand Store
```javascript
// src/store/notesStore.js

import { create } from 'zustand';
import { getStorageService } from '../services/storage';

const storageService = getStorageService('notes'); // Auto-selects localStorage or Supabase

export const useNotesStore = create((set, get) => ({
  notes: [],

  loadNotes: async () => {
    const notes = await storageService.list();
    set({ notes });
  },

  createNote: async (note) => {
    const created = await storageService.create(note);
    set({ notes: [...get().notes, created] });
  },

  // Component doesn't know if it's localStorage or Supabase!
}));
```

#### Configuration (Easy Backend Switching)
```javascript
// src/services/storage/index.js

import { LocalStorageService } from './localStorageService';
import { SupabaseService } from './supabaseService';
import { createClient } from '@supabase/supabase-js';

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export function getStorageService(entity) {
  if (USE_SUPABASE) {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_KEY
    );
    return new SupabaseService(entity, supabase);
  }
  return new LocalStorageService(entity);
}
```

**Migration**: Change `.env` variable from `VITE_USE_SUPABASE=false` to `true` - that's it!

#### Benefits of This Architecture:

✅ **Zero Code Changes**: Components never know if they're using localStorage or Supabase
✅ **Test Anytime**: Switch backends with one env variable
✅ **Offline-First**: Keep localStorage as fallback even with Supabase
✅ **Easy Onboarding**: New developers start with localStorage (no backend setup)
✅ **Future-Proof**: Want to switch to Firebase or custom API? Just implement the interface

---

### 2.4 UI/UX Principles
- **Apple Notes aesthetic**: Clean, minimal, focus on content
- **Trello aesthetic**: Card-based, visual, drag-and-drop friendly
- **Smooth transitions**: Animate mode switching, card movements
- **Intuitive navigation**: Clear visual hierarchy
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 2.4 Development Phases

**Phase 1: Foundation (Week 1-2)**
- Set up project structure with storage abstraction layer
- Implement mode toggle
- Basic layout for both modes
- Data models and localStorage implementation
- **Test**: Create/read/update/delete works with localStorage

**Phase 2: Notes Mode (Week 3-4)**
- Folder CRUD operations
- Notes list with sorting/search
- Basic text editor (textarea)
- **Test**: All notes features work offline

**Phase 3: Tasks Mode (Week 5-6)**
- Board CRUD operations
- List management
- Card creation and editing
- Move cards with buttons (no drag & drop yet)
- **Test**: All task features work offline

**Phase 4: Enhanced Features (Week 7-8)**
- Add drag & drop with react-beautiful-dnd
- Rich text formatting with Tiptap/Lexical
- Card details (labels, checklists, due dates)
- Search and filters
- Dark mode
- **Test**: Advanced features work smoothly

**Phase 5 (Optional): Supabase Migration (Week 9-10)**
- Set up Supabase project
- Run SQL schema
- Update .env to use Supabase
- Test data sync
- Add authentication (optional)
- **Test**: Switch between localStorage and Supabase seamlessly

**Phase 6: Polish & Testing (Week 11-12)**
- Performance optimization
- Bug fixes
- User testing
- Documentation

---

## 3. Recommended Tech Stack

### Summary: Pragmatic, Incremental Approach

**Core Stack (Start Day 1):**
- React 18 + Vite + JavaScript
- Zustand (state management)
- Tailwind CSS (styling)
- **LocalStorage with abstraction layer** (easy Supabase migration later)

**Upgrade Later (When Core Works):**
- **Supabase** (multi-device sync, just change .env variable)
- Rich text editor (start with textarea, upgrade to Tiptap/Lexical)
- Drag & drop (start with buttons, add react-beautiful-dnd)
- TypeScript (optional, for type safety)

**Key Design Principle:** Build storage abstraction from day 1 - enables switching from localStorage to Supabase without changing any component code.

This approach prioritizes **testing early and often** - you'll have a working app quickly and add complexity incrementally.

---

### 3.1 Frontend Framework
**React 18 + Vite + JavaScript** (Start simple, add TypeScript later if needed)
- **React 18+**: Component-based, large ecosystem, easy testing
- **Vite**: Fast build tool, instant HMR for quick development
- **JavaScript**: Faster initial development, less boilerplate
- **TypeScript**: Optional upgrade later for type safety

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
**Incremental Approach:**

**Phase 1 - Simple Start: textarea with markdown**
- Plain `<textarea>` for note content
- Save as markdown
- Fast to implement, easy to test
- Good enough for MVP

**Phase 2 - Basic Formatting: react-contenteditable + document.execCommand**
- Bold, italic, underline with buttons
- Simple implementation
- Deprecated but works for basic needs

**Phase 3 - Full Rich Text: Tiptap or Lexical**
- **Tiptap**: Modern, extensible, built on ProseMirror
- **Lexical**: Meta's new editor, simpler API than Tiptap
- Add when basic features are working

### 3.5 Drag & Drop
**Incremental Approach:**

**Phase 1 - No Drag & Drop:**
- Use buttons: "Move Up", "Move Down", "Move to List"
- Test core functionality first
- Simpler to implement and debug

**Phase 2 - HTML5 Drag & Drop:**
- Native browser API (onDragStart, onDrop)
- No library needed
- Works for basic card movement

**Phase 3 - Library: react-beautiful-dnd**
- Simpler API than dnd-kit
- Great for Trello-style boards
- Good documentation and examples
- Trade-off: Maintenance is paused but stable

### 3.6 Data Persistence

**Design Philosophy**: Build with storage abstraction from day 1 to enable seamless backend switching.

**Phase 1: LocalStorage (Start Here)**
- localStorage API for simple persistence
- No backend setup, no configuration
- 5-10MB storage limit
- Perfect for MVP testing
- **When to use**: Solo development, testing features

**Phase 2: Supabase (Recommended for Production)**
- **PostgreSQL database** with REST API auto-generated
- **Real-time subscriptions** (see changes live across devices)
- **Authentication built-in** (email, Google, GitHub)
- **Free tier**: 500MB DB, 2GB bandwidth/month
- **Row-level security** for multi-user apps
- **Migration**: Just change .env variable!
- **When to use**: Multi-device sync, sharing, collaboration

**Migration Steps** (localStorage → Supabase):
1. `npm install @supabase/supabase-js`
2. Create Supabase project (2 minutes at supabase.com)
3. Run SQL schema (provided in Quick Start section)
4. Update `.env.local`: set `VITE_USE_SUPABASE=true`
5. Add URL and API key
6. Restart dev server - that's it!

**Alternative Options** (Not Recommended):
- **IndexedDB**: More storage than localStorage (50MB+), but still no sync
- **Firebase**: NoSQL, harder to query, complex pricing
- **Custom Backend**: More work to build and maintain

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
│   │   │   ├── FolderSidebar.jsx
│   │   │   ├── NotesList.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   └── NotesView.jsx
│   │   ├── tasks/            # Tasks mode components
│   │   │   ├── BoardSidebar.jsx
│   │   │   ├── Board.jsx
│   │   │   ├── List.jsx
│   │   │   ├── Card.jsx
│   │   │   └── TasksView.jsx
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── ModeToggle.jsx
│   │       └── MainLayout.jsx
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Storage abstraction layer
│   │   └── storage/
│   │       ├── index.js                # Config & service factory
│   │       ├── storageInterface.js     # Base class
│   │       ├── localStorageService.js  # localStorage implementation
│   │       └── supabaseService.js      # Supabase implementation
│   ├── store/                # Zustand stores
│   │   ├── notesStore.js
│   │   └── tasksStore.js
│   ├── utils/                # Utility functions
│   ├── styles/               # Global styles
│   ├── App.jsx
│   └── main.jsx
├── spec/                     # Documentation
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── .env.local                # Local config (gitignored)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

**.env.example** (commit this):
```bash
# Storage Backend (false = localStorage, true = Supabase)
VITE_USE_SUPABASE=false

# Supabase Config (only needed when VITE_USE_SUPABASE=true)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
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

### Initial Setup (LocalStorage - Phase 1)
```bash
# Create React + Vite project (JavaScript)
npm create vite@latest . -- --template react

# Install core dependencies
npm install zustand date-fns nanoid clsx react-icons

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create environment file
cp .env.example .env.local
# Edit .env.local and set VITE_USE_SUPABASE=false

# Dev tools
npm install -D eslint prettier eslint-plugin-react
```

### Supabase Setup (Phase 2+ - When Ready for Backend)
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Create Supabase project at https://supabase.com
# 1. Create new project
# 2. Go to Project Settings > API
# 3. Copy URL and anon key

# Update .env.local:
# VITE_USE_SUPABASE=true
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Run SQL in Supabase SQL Editor to create tables:
```

**Supabase SQL Schema** (run this in Supabase SQL Editor):
```sql
-- Enable Row Level Security
create table folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  created_at timestamptz default now(),
  note_count integer default 0
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  folder_id uuid references folders(id) on delete cascade,
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_pinned boolean default false,
  tags text[] default '{}'
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  background text,
  is_starred boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  name text not null,
  position integer not null,
  created_at timestamptz default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  title text not null,
  description text,
  position integer not null,
  labels jsonb default '[]',
  due_date timestamptz,
  checklists jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security Policies (optional for MVP, required for auth)
-- Enable RLS on all tables
alter table folders enable row level security;
alter table notes enable row level security;
alter table boards enable row level security;
alter table lists enable row level security;
alter table cards enable row level security;

-- Example policy (allow all for now, restrict later with auth)
create policy "Allow all for authenticated users" on folders
  for all using (true);
-- Repeat for other tables or customize per user_id
```

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Upgrading Features
```bash
# Add drag & drop when ready
npm install react-beautiful-dnd

# Add rich text editor when ready
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
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

This specification provides a comprehensive roadmap for building a dual-mode task management and note-taking app. The recommended tech stack prioritizes:

- **Simplicity**: Start with localStorage, no backend complexity
- **Flexibility**: Storage abstraction enables easy Supabase migration
- **Incremental Testing**: Test each feature as you build
- **Modern Best Practices**: React 18, Zustand, Tailwind CSS

By following the phased approach and building the storage abstraction layer from day 1, you can develop and test quickly with localStorage, then seamlessly upgrade to Supabase when you need multi-device sync or collaboration features.

---

## Quick Reference: LocalStorage → Supabase Migration

**How easy is it to switch?**

1. Install Supabase: `npm install @supabase/supabase-js`
2. Create project at supabase.com (2 minutes)
3. Run SQL schema (provided above)
4. Update `.env.local`:
   ```
   VITE_USE_SUPABASE=true
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```
5. Restart dev server

**Zero code changes required.** Your components, stores, and business logic remain identical. The storage service abstraction handles everything.

---

## 8. Drag & Drop Implementation (Milestone 5)

### 8.1 Overview

This section documents the complete implementation requirements for adding drag-and-drop functionality to the Tasks Mode, enabling users to:
- **Drag cards between lists** (move card from "To Do" to "In Progress")
- **Reorder cards within a list** (change priority/sequence)
- **Reorder lists within a board** (reorganize workflow columns)

**Current Status**: All Task CRUD operations are implemented (Milestone 4 ✅). Drag & drop is the next enhancement.

**Technical Approach**: Use `@dnd-kit` library for modern, accessible, and performant drag-and-drop.

---

### 8.2 Updated Tech Stack

#### 8.2.1 Drag & Drop Library Selection

**RECOMMENDED: @dnd-kit** (Modern, Actively Maintained)

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Why @dnd-kit over react-beautiful-dnd:**
- ✅ **Actively Maintained**: Regular updates, modern React support
- ✅ **Better Performance**: Uses modern browser APIs
- ✅ **Smaller Bundle**: Modular architecture (install only what you need)
- ✅ **Accessibility Built-in**: Keyboard navigation, screen reader support
- ✅ **TypeScript Native**: Better type safety (even with JavaScript)
- ✅ **More Flexible**: Better customization options

**Comparison:**

| Feature | @dnd-kit | react-beautiful-dnd |
|---------|----------|---------------------|
| Maintenance | ✅ Active | ⚠️ Paused |
| React 18 Support | ✅ Native | ⚠️ Works but not optimized |
| Bundle Size | ~20KB | ~35KB |
| Accessibility | ✅ Built-in | ✅ Built-in |
| Learning Curve | Medium | Easy |
| Documentation | ✅ Excellent | ✅ Excellent |

**Packages Needed:**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

### 8.3 Detailed Requirements

#### 8.3.1 Drag Cards Between Lists

**User Story**: As a user, I want to drag a card from one list to another to update its status/workflow stage.

**Acceptance Criteria:**
- ✅ User can grab a card and drag it
- ✅ Visual feedback shows card is being dragged (semi-transparent, follow cursor)
- ✅ Drop zones highlight when card is dragged over them
- ✅ Card moves to destination list on drop
- ✅ Card position updates correctly (appears at drop location)
- ✅ Changes persist to localStorage/Supabase
- ✅ Animation smooth and responsive
- ✅ Cancel drag with ESC key

#### 8.3.2 Reorder Cards Within Same List

**User Story**: As a user, I want to reorder cards within a list to prioritize tasks.

**Acceptance Criteria:**
- ✅ User can drag card up/down within same list
- ✅ Other cards shift to make space (placeholder effect)
- ✅ Card position updates correctly
- ✅ New order persists to storage
- ✅ Smooth animation when cards shift

#### 8.3.3 Reorder Lists

**User Story**: As a user, I want to reorder lists (columns) to organize my workflow.

**Acceptance Criteria:**
- ✅ User can drag list headers left/right
- ✅ Lists reorder horizontally
- ✅ All cards stay with their list
- ✅ New list order persists to storage

#### 8.3.4 Visual Feedback

**Requirements:**
- **Drag Handle**: Visible indicator users can grab (⋮⋮ icon or entire card)
- **Dragging State**: Card becomes semi-transparent (opacity: 0.5)
- **Drop Zone Highlight**: Lists highlight with blue border when card is over them
- **Placeholder**: Dotted outline shows where card will drop
- **Cursor**: Changes to `grabbing` during drag
- **Animation**: Smooth 200ms transitions

---

### 8.4 Data Model Updates

#### 8.4.1 Ensure Position Fields Exist

**Cards Data Model** (CONFIRMED - Already Correct):
```json
{
  "id": "uuid",
  "listId": "list-uuid",
  "title": "Card title",
  "description": "Card description",
  "position": 0,  // ← CRITICAL: Used for ordering
  "tags": [],
  "createdAt": "2025-10-02T10:30:00.000Z",
  "updatedAt": "2025-10-02T10:30:00.000Z"
}
```

**Lists Data Model** (CONFIRMED - Already Correct):
```json
{
  "id": "uuid",
  "boardId": "board-uuid",
  "name": "List name",
  "position": 0,  // ← CRITICAL: Used for ordering
  "createdAt": "2025-10-02T10:30:00.000Z"
}
```

**NO SCHEMA CHANGES NEEDED** - Current data models already support drag & drop! 🎉

#### 8.4.2 Position Field Behavior

**Rules:**
1. **Sequential Integers**: `0, 1, 2, 3, ...`
2. **Unique Within Scope**: 
   - Card positions unique within a list
   - List positions unique within a board
3. **Auto-Increment**: New card gets `position = cards.length`
4. **Recalculate After Drag**: Update positions of all affected items

**Example Position Updates:**

**Before Drag:**
```
List A: [Card1(pos:0), Card2(pos:1), Card3(pos:2)]
List B: [Card4(pos:0), Card5(pos:1)]
```

**After dragging Card2 from List A to List B (position 1):**
```
List A: [Card1(pos:0), Card3(pos:1)]  // Card3 position updated 2→1
List B: [Card4(pos:0), Card2(pos:1), Card5(pos:2)]  // Card5 position updated 1→2
```

---

### 8.5 Component Modifications Required

This section details **EXACTLY** what needs to change in each existing component.

#### 8.5.1 TasksView.jsx - MODIFY

**File**: `src/components/tasks/TasksView.jsx`

**Current Responsibility**: 
- Renders BoardSidebar, Lists, and CardModal
- Handles board selection
- Manages "Add List" functionality

**NEW Responsibilities**:
- Wrap everything in `<DndContext>`
- Implement `handleDragEnd` to process drag operations
- Detect drag type (card vs list)
- Update state via tasksStore

**Changes Needed**:

```jsx
// ADD IMPORTS
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useState } from 'react'; // Add if not already present

// ADD STATE for active drag
const [activeId, setActiveId] = useState(null);

// ADD HANDLERS
const handleDragStart = (event) => {
  setActiveId(event.active.id);
};

const handleDragEnd = (event) => {
  const { active, over } = event;
  
  if (!over) {
    setActiveId(null);
    return;
  }

  // Determine if dragging card or list
  const isCard = active.data.current?.type === 'card';
  
  if (isCard) {
    const cardId = active.id;
    const sourceListId = active.data.current.listId;
    const destListId = over.data.current?.listId || over.id;
    const newPosition = over.data.current?.index || 0;

    if (sourceListId !== destListId || active.data.current.index !== newPosition) {
      moveCard(cardId, destListId, newPosition);
    }
  } else {
    // Handle list reordering
    const listId = active.id;
    const newPosition = over.data.current?.index || 0;
    reorderList(listId, newPosition);
  }

  setActiveId(null);
};

const handleDragCancel = () => {
  setActiveId(null);
};

// WRAP RETURN JSX
return (
  <DndContext
    collisionDetection={closestCorners}
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
    onDragCancel={handleDragCancel}
  >
    {/* Existing JSX */}
    <div className="h-full flex">
      <BoardSidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 overflow-x-auto">
        {/* ... existing code ... */}
      </div>
      <CardModal />
    </div>

    {/* ADD DRAG OVERLAY for better UX */}
    <DragOverlay>
      {activeId ? (
        <div className="opacity-50">
          {/* Render dragging card */}
        </div>
      ) : null}
    </DragOverlay>
  </DndContext>
);
```

**Lines to Add**: ~40 lines
**Complexity**: Medium
**Breaking Changes**: None (wraps existing components)

---

#### 8.5.2 List.jsx - MODIFY

**File**: `src/components/tasks/List.jsx`

**Current Responsibility**:
- Displays list name
- Renders cards
- Handles "Add Card" functionality
- List menu (rename/delete)

**NEW Responsibilities**:
- Make list draggable (for reordering lists)
- Make cards container a drop zone
- Provide droppable ID for cards

**Changes Needed**:

```jsx
// ADD IMPORTS
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// INSIDE COMPONENT - ADD DROPPABLE HOOK
const { setNodeRef } = useDroppable({
  id: list.id,
  data: {
    type: 'list',
    listId: list.id
  }
});

// GET CARD IDS FOR SORTABLE CONTEXT
const cardIds = cards.map(c => c.id);

// MODIFY CARDS CONTAINER JSX
<div ref={setNodeRef} className="space-y-2 mb-3">
  <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
    {cards.map((card, index) => (
      <Card key={card.id} card={card} index={index} />
    ))}
  </SortableContext>
</div>
```

**Lines to Add**: ~15 lines
**Complexity**: Low
**Breaking Changes**: None (Card component needs to handle `index` prop)

---

#### 8.5.3 Card.jsx - MODIFY

**File**: `src/components/tasks/Card.jsx`

**Current Responsibility**:
- Displays card title and tags
- Opens modal on click

**NEW Responsibilities**:
- Make card draggable
- Prevent modal opening during drag (only on click)
- Show visual feedback during drag

**Changes Needed**:

```jsx
// ADD IMPORTS
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// MODIFY COMPONENT SIGNATURE to accept index
export default function Card({ card, index }) {
  const { selectCard } = useTasksStore();

  // ADD SORTABLE HOOK
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
      index,
      listId: card.listId
    }
  });

  // ADD STYLE COMPUTATION
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // FIX CLICK HANDLER to not trigger during drag
  const handleClick = (e) => {
    // Only open modal if not dragging
    if (!isDragging) {
      selectCard(card.id);
    }
  };

  // MODIFY RETURN JSX
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        isDragging ? 'z-50' : ''
      }`}
    >
      {/* Existing card content */}
    </div>
  );
}
```

**Lines to Add**: ~30 lines
**Complexity**: Medium
**Breaking Changes**: Requires `index` prop (List.jsx provides this)

---

#### 8.5.4 tasksStore.js - ADD NEW ACTIONS

**File**: `src/store/tasksStore.js`

**Current State**: Already has `moveCard()` action! ✅

**Check Existing Implementation**:
```javascript
moveCard: async (cardId, newListId, newPosition) => {
  // Already implemented!
}
```

**NEW Actions Needed**:

```javascript
// ADD: Reorder list positions
reorderList: async (listId, newPosition) => {
  try {
    const lists = get().lists.filter(l => l.boardId === get().selectedBoardId);
    const currentList = lists.find(l => l.id === listId);
    const oldPosition = currentList.position;

    if (oldPosition === newPosition) return;

    // Update positions of all affected lists
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return { ...list, position: newPosition };
      }
      if (oldPosition < newPosition) {
        // Moving right: shift left lists in between
        if (list.position > oldPosition && list.position <= newPosition) {
          return { ...list, position: list.position - 1 };
        }
      } else {
        // Moving left: shift right lists in between
        if (list.position >= newPosition && list.position < oldPosition) {
          return { ...list, position: list.position + 1 };
        }
      }
      return list;
    });

    // Persist all changes
    await Promise.all(
      updatedLists.map(list => listsService.update(list.id, { position: list.position }))
    );

    set({
      lists: get().lists.map(l => updatedLists.find(ul => ul.id === l.id) || l)
    });
  } catch (error) {
    console.error('Error reordering list:', error);
  }
},

// VERIFY: moveCard implementation handles position recalculation
// Current implementation should already handle this, but verify:
moveCard: async (cardId, newListId, newPosition) => {
  try {
    const card = get().cards.find(c => c.id === cardId);
    const oldListId = card.listId;
    
    // Get all affected cards
    const oldListCards = get().cards.filter(c => c.listId === oldListId);
    const newListCards = get().cards.filter(c => c.listId === newListId);

    // Update card's list and position
    await get().updateCard(cardId, {
      listId: newListId,
      position: newPosition
    });

    // Recalculate positions in old list
    if (oldListId !== newListId) {
      const updatedOldList = oldListCards
        .filter(c => c.id !== cardId)
        .map((c, index) => ({ ...c, position: index }));

      await Promise.all(
        updatedOldList.map(c => cardsService.update(c.id, { position: c.position }))
      );
    }

    // Recalculate positions in new list
    const cardsToBefore = newListCards.filter(c => c.position < newPosition);
    const cardsAfter = newListCards.filter(c => c.position >= newPosition);
    
    const updatedNewList = [
      ...cardsToBefore.map((c, i) => ({ ...c, position: i })),
      { ...card, listId: newListId, position: newPosition },
      ...cardsAfter.map((c, i) => ({ ...c, position: newPosition + 1 + i }))
    ];

    await Promise.all(
      updatedNewList.map(c => cardsService.update(c.id, { position: c.position }))
    );

    // Reload data to reflect changes
    await get().loadData();
  } catch (error) {
    console.error('Error moving card:', error);
  }
}
```

**Lines to Add**: ~60 lines
**Complexity**: High (position recalculation logic)
**Breaking Changes**: None

---

#### 8.5.5 Components That DON'T Need Changes

**NO CHANGES NEEDED**:
- ✅ `BoardSidebar.jsx` - Board selection is independent of drag & drop
- ✅ `CardModal.jsx` - Modal opens on click, which we handle in Card.jsx
- ✅ `src/services/storage/*` - Storage layer already handles position fields
- ✅ `notesStore.js` - Notes mode unaffected
- ✅ `MainLayout.jsx`, `Header.jsx`, `ModeToggle.jsx` - Layout components unaffected

---

### 8.6 Implementation Checklist

#### Phase 1: Setup (30 mins)
- [ ] Install @dnd-kit packages: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [ ] Verify installation: Check package.json
- [ ] Read @dnd-kit documentation: https://docs.dndkit.com/

#### Phase 2: Card Dragging (2 hours)
- [ ] Modify `TasksView.jsx` - Add DndContext wrapper
- [ ] Modify `TasksView.jsx` - Add handleDragEnd for cards
- [ ] Modify `List.jsx` - Add useDroppable hook
- [ ] Modify `List.jsx` - Add SortableContext for cards
- [ ] Modify `Card.jsx` - Add useSortable hook
- [ ] Modify `Card.jsx` - Fix click vs drag behavior
- [ ] Test: Drag card within same list
- [ ] Test: Drag card between lists
- [ ] Verify: Positions update correctly in localStorage

#### Phase 3: Visual Feedback (1 hour)
- [ ] Add drag overlay in TasksView.jsx
- [ ] Add opacity change during drag in Card.jsx
- [ ] Add drop zone highlighting in List.jsx
- [ ] Add cursor: grabbing style
- [ ] Add smooth transitions
- [ ] Test: Visual feedback works correctly

#### Phase 4: List Reordering (1 hour)
- [ ] Add reorderList action to tasksStore.js
- [ ] Make lists draggable in List.jsx
- [ ] Handle list drag in TasksView handleDragEnd
- [ ] Test: Drag lists left/right
- [ ] Verify: List order persists

#### Phase 5: Edge Cases & Polish (1 hour)
- [ ] Handle drag cancel (ESC key)
- [ ] Handle drag outside drop zones
- [ ] Prevent card modal opening during drag
- [ ] Test rapid drags
- [ ] Test with many cards (100+)
- [ ] Verify: No performance issues

#### Phase 6: Accessibility (30 mins)
- [ ] Test keyboard navigation (Tab, Space, Arrow keys)
- [ ] Test screen reader announcements
- [ ] Add ARIA labels where needed
- [ ] Test: Can drag without mouse

#### Phase 7: Testing (1 hour)
- [ ] Test: All existing tests still pass
- [ ] Add new tests for drag & drop
- [ ] Test: Cross-browser (Chrome, Firefox, Safari)
- [ ] Test: Mobile drag (touch events)
- [ ] Verify: Data persistence across reloads

**Total Estimated Time: 7-8 hours**

---

### 8.7 Technical Implementation Details

#### 8.7.1 Collision Detection Strategy

Use `closestCorners` algorithm for best UX:

```javascript
import { closestCorners } from '@dnd-kit/core';

<DndContext collisionDetection={closestCorners}>
```

**Why closestCorners:**
- Better for nested droppables (lists within board)
- More intuitive than closestCenter
- Handles edge cases better

#### 8.7.2 Handling Position Recalculation

**Algorithm for updating positions after drag:**

```javascript
function recalculatePositions(items, movedItemId, oldIndex, newIndex) {
  return items.map((item, index) => {
    if (item.id === movedItemId) {
      return { ...item, position: newIndex };
    }
    if (oldIndex < newIndex) {
      // Moving down: shift up items in between
      if (index > oldIndex && index <= newIndex) {
        return { ...item, position: item.position - 1 };
      }
    } else {
      // Moving up: shift down items in between
      if (index >= newIndex && index < oldIndex) {
        return { ...item, position: item.position + 1 };
      }
    }
    return item;
  });
}
```

#### 8.7.3 Performance Optimizations

**For boards with 100+ cards:**

1. **Virtualization**: Use `react-window` for long lists
2. **Debounce position updates**: Wait for drag end before persisting
3. **Optimistic updates**: Update UI immediately, persist async
4. **Batch writes**: Update all positions in one transaction

```javascript
// Optimistic update
set({ cards: updatedCards }); // Instant UI update

// Persist async
await Promise.all(
  updatedCards.map(c => cardsService.update(c.id, { position: c.position }))
);
```

#### 8.7.4 Mobile Touch Support

**@dnd-kit automatically handles touch events! ✅**

No additional code needed. Test with:
- Chrome DevTools mobile emulation
- Real mobile device

**Recommended touch behavior:**
- Long press to start drag (500ms)
- Drag with finger
- Release to drop

---

### 8.8 Testing Requirements

#### 8.8.1 Unit Tests

**Test tasksStore actions:**

```javascript
describe('tasksStore drag & drop', () => {
  it('should move card to different list', async () => {
    // Setup: Create board with 2 lists, 1 card
    // Action: Move card from list1 to list2
    // Assert: Card.listId updated, positions recalculated
  });

  it('should reorder card within same list', async () => {
    // Setup: Create list with 3 cards
    // Action: Move card from position 0 to position 2
    // Assert: All positions updated correctly
  });

  it('should reorder lists', async () => {
    // Setup: Create board with 3 lists
    // Action: Move list from position 0 to position 2
    // Assert: All list positions updated correctly
  });
});
```

#### 8.8.2 Integration Tests

```javascript
describe('Drag & Drop Integration', () => {
  it('should drag card between lists in UI', async () => {
    // Render TasksView with data
    // Simulate drag card from List A to List B
    // Verify card appears in List B
    // Verify data persisted to localStorage
  });
});
```

#### 8.8.3 E2E Tests (Playwright)

```javascript
test('drag card to different list', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Tasks'); // Switch to Tasks mode
  
  // Drag card
  const card = page.locator('text=Design homepage mockup');
  const targetList = page.locator('text=In Progress').locator('..');
  
  await card.dragTo(targetList);
  
  // Verify card moved
  await expect(targetList.locator('text=Design homepage mockup')).toBeVisible();
  
  // Reload page
  await page.reload();
  
  // Verify persistence
  await expect(targetList.locator('text=Design homepage mockup')).toBeVisible();
});
```

---

### 8.9 Accessibility Requirements

**WCAG 2.1 Level AA Compliance:**

- ✅ **Keyboard Navigation**: Arrow keys to move cards
- ✅ **Screen Reader**: Announce drag start/end
- ✅ **Focus Management**: Focus follows dragged item
- ✅ **ARIA Attributes**: `aria-grabbed`, `aria-dropeffect`

**@dnd-kit provides this automatically, but verify:**

```javascript
// Add ARIA labels
<div
  {...attributes}
  {...listeners}
  aria-label={`Card: ${card.title}. Press space to pick up, arrow keys to move, space to drop`}
>
```

---

### 8.10 Migration Path for Existing Data

**GOOD NEWS: No migration needed! 🎉**

Existing data models already have `position` fields. If any cards/lists were created before drag & drop:

**Auto-fix on load:**

```javascript
loadData: async () => {
  const [boards, lists, cards] = await Promise.all([/*...*/]);

  // Auto-assign positions if missing
  const fixedLists = lists.map((list, index) => ({
    ...list,
    position: list.position ?? index
  }));

  const fixedCards = cards.map((card, index) => ({
    ...card,
    position: card.position ?? index
  }));

  set({ boards, lists: fixedLists, cards: fixedCards });
}
```

---

### 8.11 Common Issues & Solutions

#### Issue 1: Click Opens Modal During Drag

**Problem**: Clicking to drag also triggers click event
**Solution**: Check `isDragging` in click handler

```javascript
const handleClick = () => {
  if (!isDragging) {
    selectCard(card.id);
  }
};
```

#### Issue 2: Positions Out of Sync

**Problem**: Positions become non-sequential (0, 1, 5, 8...)
**Solution**: Normalize positions after every drag

```javascript
const normalizePositions = (items) => {
  return items
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }));
};
```

#### Issue 3: Slow Performance with Many Cards

**Problem**: Dragging lags with 100+ cards
**Solution**: Use virtualization

```bash
npm install react-window
```

#### Issue 4: Touch Drag Not Working

**Problem**: Mobile users can't drag
**Solution**: @dnd-kit handles touch automatically. Verify touch-action CSS:

```css
.draggable-card {
  touch-action: none; /* Enable touch dragging */
}
```

---

### 8.12 Success Metrics

**Drag & drop is successful when:**

- ✅ User can drag card between lists in < 1 second
- ✅ Positions update correctly 100% of the time
- ✅ Changes persist across page reload
- ✅ Works on Chrome, Firefox, Safari
- ✅ Works on mobile (iOS + Android)
- ✅ No console errors during drag
- ✅ Keyboard users can drag with arrow keys
- ✅ Screen readers announce drag operations
- ✅ Performance: No lag with 100+ cards
- ✅ All existing tests still pass

---

## Summary: Drag & Drop Requirements

**What's Required:**
1. ✅ Install `@dnd-kit` packages (3 packages)
2. ✅ Modify 3 existing components (TasksView, List, Card)
3. ✅ Add 1 new action to tasksStore (reorderList)
4. ✅ Verify moveCard handles position recalculation
5. ✅ Add visual feedback (opacity, highlighting)
6. ✅ Test on desktop + mobile

**What's NOT Required:**
- ❌ No schema changes (position fields exist)
- ❌ No data migration (positions auto-fix)
- ❌ No changes to BoardSidebar, CardModal, or Notes components

**Estimated Time**: 7-8 hours total
**Risk Level**: Low (incremental, well-documented)
**User Impact**: High (major UX improvement)

---

## 9. UI Consistency & Design System (Apple Notes Theme)

### 9.1 Overview & Goals

**Current State:**
- Notes Mode: Apple Notes dark theme (black background, white text, yellow selection)
- Tasks Mode: Trello-style light theme (gradient blue/purple background, white cards)

**Problem:**
The app feels like two separate applications due to inconsistent visual design between modes.

**Goal:**
Extend the Apple Notes dark theme to Tasks Mode, creating a unified, cohesive user experience that feels like a single native application.

### 9.2 Design Philosophy

**Apple Notes Visual Identity:**
- Deep black backgrounds (#000000)
- Subtle gray panels (#1c1c1e, #2c2c2e)
- White primary text with gray secondary text
- Yellow accent for selection/highlights (#ffd60a)
- Blue for interactive elements (#0a84ff)
- Minimal borders, generous spacing
- San Francisco font (system default)

**Implementation Strategy:**
Use Tailwind CSS theme extension to create a centralized design system that both modes inherit from.

---

### 9.3 Tailwind Configuration

Update `tailwind.config.js` with the following theme extension:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors
        bg: {
          app: '#000000',           // Main app background
          panel: '#1c1c1e',         // Sidebar, cards, elevated surfaces
          elevated: '#2c2c2e',      // Modals, dropdowns, hover states
          input: '#1c1c1e',         // Form inputs
          hover: '#2c2c2e',         // Hover state for interactive elements
        },
        
        // Text Colors
        text: {
          primary: '#ffffff',       // Main headings, important text
          secondary: '#98989d',     // Labels, subtitles, secondary info
          tertiary: '#636366',      // Placeholders, disabled text
          inverse: '#000000',       // Text on light backgrounds (rare)
        },
        
        // Accent Colors (Apple Notes palette)
        accent: {
          yellow: '#ffd60a',        // Selection, highlights (signature Apple Notes color)
          blue: '#0a84ff',          // Primary actions, links
          green: '#32d74b',         // Success states, completed
          red: '#ff453a',           // Destructive actions, errors
          orange: '#ff9f0a',        // Warnings
          purple: '#bf5af2',        // Secondary accent (optional)
        },
        
        // Border & Divider Colors
        border: {
          DEFAULT: '#38383a',       // Standard borders
          subtle: '#2c2c2e',        // Subtle dividers
          focus: '#0a84ff',         // Focus rings
        },
        
        // Neutral Grays (for layering)
        neutral: {
          800: '#1c1c1e',
          900: '#000000',
        },
      },
      
      // Border Radius
      borderRadius: {
        card: '12px',
        input: '8px',
        button: '8px',
        modal: '16px',
      },
      
      // Box Shadows
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.3)',
        modal: '0 8px 24px rgba(0, 0, 0, 0.5)',
        hover: '0 4px 12px rgba(0, 0, 0, 0.4)',
      },
      
      // Typography
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
```

---

### 9.4 Component-Specific Changes

#### 9.4.1 **Tasks Mode - Main Container (TasksView.jsx)**

**Current State:**
```jsx
<div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 overflow-x-auto">
```

**Required Change:**
```jsx
<div className="flex-1 bg-bg-app overflow-x-auto">
```

**Impact:** Changes Tasks Mode background from light gradient to deep black (matching Notes Mode)

---

#### 9.4.2 **Board Sidebar (BoardSidebar.jsx)**

**Current State:**
```jsx
<div className="w-64 bg-white border-r border-gray-200">
  <button className="text-gray-700 hover:bg-gray-100">
```

**Required Changes:**
```jsx
<div className="w-64 bg-bg-panel border-r border-border">
  <button className="text-text-primary hover:bg-bg-hover">
    
  {/* Board items */}
  <div className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
    {/* Change to: */}
  <div className="px-3 py-2 rounded-lg bg-bg-elevated hover:bg-bg-hover">
    
  {/* Selected board */}
  <div className="bg-blue-500 text-white">
    {/* Change to: */}
  <div className="bg-accent-yellow text-text-inverse">
```

**Key Updates:**
- Background: `white` → `bg-bg-panel`
- Borders: `border-gray-200` → `border-border`
- Text: `text-gray-700` → `text-text-primary`
- Hover states: `hover:bg-gray-100` → `hover:bg-bg-hover`
- Selected state: `bg-blue-500` → `bg-accent-yellow` (matching Notes Mode selection)

---

#### 9.4.3 **List Component (List.jsx)**

**Current State:**
```jsx
<div className="bg-gray-100 rounded-lg p-3">
  <h2 className="font-semibold text-gray-800">
  <button className="text-gray-600 hover:text-gray-800">
```

**Required Changes:**
```jsx
<div className="bg-bg-panel rounded-card p-3">
  <h2 className="font-semibold text-text-primary">
  <button className="text-text-secondary hover:text-text-primary">
    
  {/* Dropdown menu */}
  <div className="bg-white rounded-lg shadow-lg border border-gray-200">
    {/* Change to: */}
  <div className="bg-bg-elevated rounded-lg shadow-modal border border-border">
    
  {/* Menu items */}
  <button className="text-gray-700 hover:bg-gray-100">
    {/* Change to: */}
  <button className="text-text-primary hover:bg-bg-hover">
    
  {/* Delete option */}
  <button className="text-red-600 hover:bg-red-50">
    {/* Change to: */}
  <button className="text-accent-red hover:bg-bg-hover">
```

**Key Updates:**
- List background: `bg-gray-100` → `bg-bg-panel`
- List header text: `text-gray-800` → `text-text-primary`
- Menu dropdown: `bg-white` → `bg-bg-elevated` with `shadow-modal`
- Destructive actions: `text-red-600` → `text-accent-red`

---

#### 9.4.4 **Card Component (Card.jsx)**

**Current State:**
```jsx
<div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50">
  <p className="text-sm font-medium text-gray-800">
  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
```

**Required Changes:**
```jsx
<div className="bg-bg-panel p-3 rounded-card shadow-card border border-border cursor-grab hover:bg-bg-hover">
  <p className="text-sm font-medium text-text-primary">
  <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-xs rounded">
    
  {/* Dragging state (already in useSortable) */}
  style={{
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  }}
```

**Key Updates:**
- Card background: `bg-white` → `bg-bg-panel`
- Card border: `border-gray-200` → `border-border`
- Card shadow: `shadow-sm` → `shadow-card`
- Hover state: `hover:bg-gray-50` → `hover:bg-bg-hover`
- Tags: `bg-blue-100 text-blue-700` → `bg-accent-blue/20 text-accent-blue` (semi-transparent blue)

---

#### 9.4.5 **Card Modal (CardModal.jsx)**

**Current State:**
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50">
  <div className="bg-white rounded-lg shadow-xl">
    <input className="text-2xl font-bold text-gray-800 border-none">
    <textarea className="border border-gray-300 rounded-lg">
```

**Required Changes:**
```jsx
<div className="fixed inset-0 bg-black bg-opacity-60">
  <div className="bg-bg-elevated rounded-modal shadow-modal">
    <input className="text-2xl font-bold text-text-primary bg-bg-elevated border-none">
    <textarea className="border border-border rounded-lg bg-bg-panel text-text-primary">
      
  {/* Section headers */}
  <h3 className="text-sm font-semibold text-gray-700">
    {/* Change to: */}
  <h3 className="text-sm font-semibold text-text-secondary">
    
  {/* Tags */}
  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
    {/* Change to: */}
  <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full">
    
  {/* Delete button */}
  <button className="bg-red-500 text-white hover:bg-red-600">
    {/* Change to: */}
  <button className="bg-accent-red text-white hover:bg-accent-red/80">
    
  {/* Close button */}
  <button className="bg-gray-200 text-gray-700 hover:bg-gray-300">
    {/* Change to: */}
  <button className="bg-bg-panel text-text-primary hover:bg-bg-hover border border-border">
```

**Key Updates:**
- Modal background: `bg-white` → `bg-bg-elevated`
- Modal shadow: `shadow-xl` → `shadow-modal`
- Input/textarea backgrounds: Add `bg-bg-panel` and `bg-bg-elevated`
- Text colors: `text-gray-800` → `text-text-primary`, `text-gray-700` → `text-text-secondary`
- Buttons: Update to use accent colors and proper hover states

---

#### 9.4.6 **Drag Overlay (TasksView.jsx)**

**Current State:**
```jsx
<div className="bg-white p-3 rounded-lg shadow-xl border-2 border-blue-400">
```

**Required Change:**
```jsx
<div className="bg-bg-panel p-3 rounded-card shadow-modal border-2 border-accent-yellow">
```

**Impact:** Dragged card shows yellow border (matching Apple Notes selection color)

---

#### 9.4.7 **Add List Button (TasksView.jsx)**

**Current State:**
```jsx
<button className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-left text-gray-700">
  + Add another list
</button>

<div className="bg-gray-100 rounded-lg p-3">
  <input className="border border-gray-300 rounded">
  <button className="bg-blue-500 text-white hover:bg-blue-600">
```

**Required Changes:**
```jsx
<button className="w-full py-3 px-4 bg-bg-panel hover:bg-bg-hover rounded-lg text-left text-text-primary border border-border">
  + Add another list
</button>

<div className="bg-bg-elevated rounded-lg p-3 border border-border">
  <input className="border border-border rounded bg-bg-panel text-text-primary">
  <button className="bg-accent-blue text-white hover:bg-accent-blue/80">
```

---

#### 9.4.8 **Screen Reader Announcements (TasksView.jsx)**

**Current State:**
```jsx
<div role="status" aria-live="polite" className="sr-only">
```

**No changes needed** - `sr-only` utility class is already defined in `src/index.css`

---

#### 9.4.9 **Empty States**

**TasksView.jsx - No Board Selected:**
```jsx
{/* Current */}
<p className="text-gray-500 text-xl mb-2">No board selected</p>
<p className="text-gray-400 text-sm">

{/* Change to */}
<p className="text-text-secondary text-xl mb-2">No board selected</p>
<p className="text-text-tertiary text-sm">
```

**TasksView.jsx - Empty Board:**
```jsx
{/* Current */}
<p className="text-gray-500 text-lg mb-4">This board is empty</p>
<button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">

{/* Change to */}
<p className="text-text-secondary text-lg mb-4">This board is empty</p>
<button className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80">
```

---

#### 9.4.10 **Header Component (Header.jsx / MainLayout.jsx)**

**Goal:** Integrate the header into the dark Apple Notes aesthetic by updating the background, title text, and mode toggle buttons to match the unified design system.

**Current State:**
```jsx
{/* Header Container */}
<header className="bg-white border-b border-gray-200 px-6 py-4">
  {/* App Title */}
  <h1 className="text-xl font-bold text-gray-900">Task & Notes App</h1>

  {/* Mode Toggle Buttons */}
  <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100">
    Notes
  </button>
  <button className="bg-blue-500 text-white hover:bg-blue-600">
    Tasks
  </button>
</header>
```

**Required Changes:**

**1. Header Container:**
```jsx
{/* Change from light background to dark panel */}
<header className="bg-bg-panel border-b border-border px-6 py-4">
```
- Background: `bg-bg-panel` (#1c1c1e) - matches sidebar/panel aesthetic
- Border: `border-b border-border` (#38383a) - subtle separator

**2. App Title:**
```jsx
{/* Change from dark text to white text */}
<h1 className="text-xl font-bold text-text-primary">Task & Notes App</h1>
```
- Text: `text-text-primary` (#ffffff) - white text on dark background
- Font weight: Keep `font-bold` for hierarchy

**3. Mode Toggle Buttons - Inactive State:**
```jsx
{/* Change from light button to dark elevated button */}
<button className="bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border rounded-button px-4 py-2 transition-colors">
  Notes
</button>
```
- Background: `bg-bg-elevated` (#2c2c2e) - dark elevated surface
- Text: `text-text-secondary` (#98989d) - gray text for inactive state
- Hover: `hover:bg-bg-hover` (#2c2c2e with subtle brightness)
- Border: `border border-border` (#38383a) - subtle outline
- Border radius: `rounded-button` (8px) - consistent with design system
- Transition: `transition-colors` - smooth color changes

**4. Mode Toggle Buttons - Active State:**
```jsx
{/* Change from blue button to yellow highlight button */}
<button className="bg-accent-yellow text-text-inverse hover:bg-accent-yellow/90 rounded-button px-4 py-2 transition-colors">
  Tasks
</button>
```
- Background: `bg-accent-yellow` (#ffd60a) - signature Apple Notes selection color
- Text: `text-text-inverse` (#000000) - black text on yellow (high contrast)
- Hover: `hover:bg-accent-yellow/90` - subtle darkening on hover
- Border radius: `rounded-button` (8px)
- Transition: `transition-colors`
- **Note:** No border on active state (cleaner look)

**5. Complete Header Example:**
```jsx
<header className="bg-bg-panel border-b border-border px-6 py-4 flex items-center justify-between">
  {/* App Title */}
  <h1 className="text-xl font-bold text-text-primary">Task & Notes App</h1>

  {/* Mode Toggle Buttons */}
  <div className="flex gap-2">
    <button
      onClick={() => setMode('notes')}
      className={`px-4 py-2 rounded-button transition-colors ${
        mode === 'notes'
          ? 'bg-accent-yellow text-text-inverse hover:bg-accent-yellow/90'
          : 'bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border'
      }`}
    >
      Notes
    </button>
    <button
      onClick={() => setMode('tasks')}
      className={`px-4 py-2 rounded-button transition-colors ${
        mode === 'tasks'
          ? 'bg-accent-yellow text-text-inverse hover:bg-accent-yellow/90'
          : 'bg-bg-elevated text-text-secondary hover:bg-bg-hover border border-border'
      }`}
    >
      Tasks
    </button>
  </div>
</header>
```

**Visual Consistency Checklist:**
- [ ] Header background matches sidebar color (`bg-bg-panel`)
- [ ] Title text is white and readable (`text-text-primary`)
- [ ] Inactive buttons have dark background with gray text
- [ ] Active button has yellow background with black text (matching selection highlights)
- [ ] Hover states are smooth and consistent
- [ ] Border at bottom of header creates subtle separation
- [ ] No visual jarring when switching modes

**Impact:**
- **Before:** White header with black text and blue buttons feels disconnected from dark app
- **After:** Dark header seamlessly integrates with overall Apple Notes aesthetic
- **User Benefit:** App feels like one cohesive product, not two separate tools

---

### 9.5 Notes Mode - Minor Adjustments

**Goal:** Ensure Notes Mode uses the new design tokens consistently

**Files to Update:**
1. **NotesView.jsx** - Already uses black background, verify consistency
2. **FolderSelector.jsx** - Already uses `bg-neutral-800`, no changes needed
3. **NotesList.jsx** - Verify selection uses `bg-accent-yellow`
4. **NoteEditor.jsx** - Verify text colors use semantic tokens

**Verification Checklist:**
- [ ] Selected note background: Should use `bg-accent-yellow` or `bg-accent-yellow/20`
- [ ] Folder dropdown: Should use `bg-bg-panel`
- [ ] New Note button: Should use consistent hover states
- [ ] Pin button: Should use `accent-blue` or `accent-yellow`

---

### 9.6 Implementation Checklist

#### Phase 1: Foundation (30 minutes)
- [ ] Update `tailwind.config.js` with complete design system
- [ ] Test Tailwind rebuild: `npm run dev`
- [ ] Verify new color classes are available in DevTools

#### Phase 2: Global & Tasks Mode Components (2-3 hours)
- [ ] Update **Header.jsx / MainLayout.jsx** with dark panel background and yellow active buttons
- [ ] Update **TasksView.jsx** main container background
- [ ] Update **BoardSidebar.jsx** with new colors
- [ ] Update **List.jsx** background, text, and menu styles
- [ ] Update **Card.jsx** with new card styling
- [ ] Update **CardModal.jsx** with elevated modal styling
- [ ] Update **Drag Overlay** border to yellow
- [ ] Update **Add List** button and form
- [ ] Update all **empty states**

#### Phase 3: Notes Mode Verification (1 hour)
- [ ] Audit **NotesView.jsx** for consistency
- [ ] Verify **FolderSelector.jsx** uses semantic tokens
- [ ] Check **NotesList.jsx** selection highlighting
- [ ] Verify **NoteEditor.jsx** text colors

#### Phase 4: Testing (1 hour)
- [ ] Visual regression test: Switch between Notes/Tasks modes
- [ ] Test header toggle buttons: verify yellow active state switches correctly
- [ ] Verify header remains consistent across both modes
- [ ] Verify drag & drop visual feedback
- [ ] Test modals, dropdowns, hover states
- [ ] Verify dark theme consistency across all components (including header)
- [ ] Test accessibility: contrast ratios, keyboard navigation

#### Phase 5: Polish (30 minutes)
- [ ] Ensure all transitions are smooth
- [ ] Verify focus states use `border-focus` (blue)
- [ ] Check that error states use `accent-red`
- [ ] Confirm all buttons have consistent hover effects

---

### 9.7 Color Usage Guidelines

**When to Use Each Color:**

| Color | Usage | Examples |
|-------|-------|----------|
| `bg-app` | Main app background | Root container, body |
| `bg-panel` | Elevated surfaces | Sidebar, cards, lists |
| `bg-elevated` | Highest elevation | Modals, dropdowns, overlays |
| `bg-input` | Form inputs | Text fields, textareas, selects |
| `bg-hover` | Hover states | Interactive elements on hover |
| `text-primary` | Primary content | Headings, main text |
| `text-secondary` | Supporting text | Labels, timestamps, counts |
| `text-tertiary` | Minimal emphasis | Placeholders, disabled text |
| `accent-yellow` | Selection/Highlight | Selected items, active states |
| `accent-blue` | Primary actions | Buttons, links, CTAs |
| `accent-green` | Success | Completed tasks, success messages |
| `accent-red` | Destructive | Delete, errors, warnings |
| `border` | Standard borders | Card borders, dividers |
| `border-subtle` | Minimal dividers | Subtle separators |
| `border-focus` | Focus rings | Input focus, keyboard navigation |

---

### 9.8 Typography Scale

Use Tailwind's default typography scale with these semantic mappings:

```jsx
// Headings
<h1 className="text-2xl font-bold text-text-primary">      // Board titles
<h2 className="text-xl font-semibold text-text-primary">   // List titles
<h3 className="text-sm font-semibold text-text-secondary"> // Section labels

// Body Text
<p className="text-base text-text-primary">    // Main content
<p className="text-sm text-text-secondary">    // Supporting text
<p className="text-xs text-text-tertiary">     // Metadata, timestamps

// Buttons
<button className="text-sm font-medium">       // Primary buttons
<button className="text-xs">                   // Secondary/tertiary buttons
```

---

### 9.9 Spacing & Layout

**Consistent Spacing:**
- Card padding: `p-3` (12px)
- Modal padding: `p-6` (24px)
- List gaps: `gap-4` (16px)
- Section spacing: `mb-6` (24px)

**Border Radius:**
- Cards: `rounded-card` (12px)
- Inputs: `rounded-input` (8px)
- Buttons: `rounded-button` (8px)
- Modals: `rounded-modal` (16px)

---

### 9.10 Before & After Visual Summary

**Before (Current State):**
- Notes Mode: Black background, white text ✅
- Tasks Mode: Light gradient, white cards ❌
- Inconsistent: Feels like 2 separate apps

**After (Target State):**
- Notes Mode: Black background, white text ✅
- Tasks Mode: Black background, dark panels ✅
- Unified: Single cohesive Apple Notes aesthetic

**Key Visual Changes:**
1. Tasks background: `gradient-blue` → `black`
2. Cards: `white` → `dark gray panels`
3. Selection: `blue` → `yellow` (Apple Notes signature)
4. Borders: `gray-200` → `subtle dark gray`
5. Text: `gray-700/800` → `white/light gray`

---

### 9.11 Components Summary Table

| Component | File | Lines to Update | Effort |
|-----------|------|-----------------|--------|
| Main Container | TasksView.jsx | ~5 | 5 min |
| Board Sidebar | BoardSidebar.jsx | ~15 | 15 min |
| List | List.jsx | ~20 | 20 min |
| Card | Card.jsx | ~10 | 10 min |
| Card Modal | CardModal.jsx | ~25 | 30 min |
| Drag Overlay | TasksView.jsx | ~3 | 5 min |
| Add List Form | TasksView.jsx | ~8 | 10 min |
| Empty States | TasksView.jsx | ~6 | 5 min |
| Notes Verification | NotesView, etc. | ~10 | 15 min |
| **Total** | **9 files** | **~102 lines** | **~2 hours** |

---

### 9.12 Testing Requirements

**Visual Testing Checklist:**
- [ ] Switch between Notes/Tasks - no jarring color changes
- [ ] Drag & drop - yellow highlight on dragged cards
- [ ] Modals - elevated dark background with proper contrast
- [ ] Hover states - consistent across all buttons
- [ ] Focus states - blue focus rings visible
- [ ] Dark theme - all text is readable (WCAG AA compliant)

**Accessibility Testing:**
- [ ] Run existing accessibility tests: `npm test src/tests/accessibility`
- [ ] Verify contrast ratios: White on dark backgrounds must meet 4.5:1 ratio
- [ ] Test keyboard navigation: Focus indicators clearly visible

**Cross-Browser Testing:**
- [ ] Chrome/Edge (Webkit)
- [ ] Firefox
- [ ] Safari (if on Mac)

---

### 9.13 Migration Impact

**Files Requiring Updates:**
✅ **9 Component Files** (listed above)
✅ **1 Config File** (`tailwind.config.js`)

**Files NOT Requiring Changes:**
❌ Store files (`notesStore.js`, `tasksStore.js`)
❌ Service layer (`localStorage`, storage abstraction)
❌ Test files (functionality unchanged)
❌ Data models (no schema changes)

**Breaking Changes:** None  
**Data Migration:** Not required  
**Backward Compatibility:** Fully maintained

---

### 9.14 Success Metrics

**Qualitative:**
- App feels like a single cohesive product
- Visual consistency between Notes and Tasks modes
- Apple Notes aesthetic achieved across entire app

**Quantitative:**
- All components use centralized design tokens
- Zero hardcoded colors (all from Tailwind theme)
- 100% of components pass accessibility tests
- Design system documented and maintainable

**User Experience:**
- Smooth visual transition when switching modes
- Consistent interaction patterns (hover, focus, selection)
- Dark theme reduces eye strain
- Professional, polished appearance

---

### 9.15 Future Enhancements

**Phase 2 (Optional):**
1. **Light Mode Support**
   - Extend Tailwind config with light theme colors
   - Add theme toggle in header
   - Persist theme preference in localStorage

2. **Shared Component Library**
   - Extract common patterns (Button, Input, Card)
   - Create reusable UI components
   - Further reduce duplication

3. **Animation & Transitions**
   - Smooth color transitions on theme changes
   - Card animation improvements
   - Modal entrance/exit animations

---

## Summary: UI Consistency Requirements

**What's Required:**
1. ✅ Update `tailwind.config.js` with Apple Notes design system
2. ✅ Modify 9 component files (TasksView, BoardSidebar, List, Card, CardModal, etc.)
3. ✅ Replace all hardcoded colors with semantic design tokens
4. ✅ Verify visual consistency across Notes and Tasks modes
5. ✅ Test accessibility and contrast ratios

**What's NOT Required:**
- ❌ No store/logic changes
- ❌ No data model changes
- ❌ No functionality changes
- ❌ No test rewrites

**Estimated Time:** 4-5 hours total
**Risk Level:** Low (purely cosmetic, no logic changes)
**User Impact:** High (dramatically improves UX and visual coherence)

---

## 10. Current Implementation Status

### 10.1 Completed Features ✅

**Status as of:** January 2025
**Deployment:** Live at https://claude-project-two.vercel.app

#### Core Architecture
- ✅ **React 19.1.1** with Vite 7.1.7 build system
- ✅ **Zustand 5.0.8** for state management
- ✅ **Tailwind CSS 3.4.18** for styling with Apple Notes dark theme
- ✅ **localStorage** for data persistence
- ✅ **Dual-mode architecture** (Notes + Tasks) with seamless switching

#### Notes Mode - Complete ✅
- ✅ Folder management (create, rename, delete)
- ✅ Note CRUD operations (create, read, update, delete)
- ✅ Search functionality across all notes
- ✅ Sort by date edited, date created, title
- ✅ Pin/unpin notes
- ✅ Auto-save with debouncing
- ✅ Apple Notes dark theme (black background, yellow selection)
- ✅ Three-column layout (folders, notes list, editor)

#### Tasks Mode - Complete ✅
- ✅ Board management (create, rename, delete, star)
- ✅ List management (create, rename, delete)
- ✅ Card CRUD operations
- ✅ **Drag & drop** with @dnd-kit (cards between lists, reorder cards, reorder lists)
- ✅ Card modal with detailed view
- ✅ Card tags/labels
- ✅ Board sidebar with selection
- ✅ Apple Notes dark theme applied to Tasks mode

#### Design System ✅
- ✅ Centralized Tailwind color system
- ✅ Semantic design tokens (`bg-app`, `text-primary`, `accent-yellow`, etc.)
- ✅ Consistent UI across Notes and Tasks modes
- ✅ Dark theme throughout application
- ✅ Accessibility-compliant contrast ratios

#### Testing Infrastructure ✅
- ✅ **188 tests total** (100% pass rate)
- ✅ **Vitest 3.2.4** for unit and integration tests
- ✅ **Playwright 1.55.1** for E2E tests
- ✅ **React Testing Library 16.3.0**
- ✅ **vitest-axe** for accessibility testing
- ✅ Comprehensive test coverage documented in `spec/TEST_DOCUMENTATION.md`

#### Deployment ✅
- ✅ Git repository initialized
- ✅ Deployed to Vercel via CLI
- ✅ Production URL: https://claude-project-two.vercel.app
- ✅ Publicly accessible
- ✅ .gitignore configured

---

### 10.2 Technology Stack (Implemented)

#### Frontend Core
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "vite": "^7.1.7",
  "@vitejs/plugin-react": "^5.0.3"
}
```

#### State Management & Utilities
```json
{
  "zustand": "^5.0.8",          // State management
  "nanoid": "^5.1.6",           // UUID generation
  "date-fns": "^4.1.0",         // Date formatting
  "clsx": "^2.1.1",             // Conditional classNames
  "react-icons": "^5.5.0"       // Icon library
}
```

#### Drag & Drop
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

#### Styling
```json
{
  "tailwindcss": "^3.4.18",
  "autoprefixer": "^10.4.21",
  "postcss": "^8.5.6"
}
```

#### Testing
```json
{
  "vitest": "^3.2.4",
  "@vitest/ui": "^3.2.4",
  "@playwright/test": "^1.55.1",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "@testing-library/jest-dom": "^6.9.1",
  "vitest-axe": "^0.1.0",
  "@axe-core/react": "^4.10.2",
  "happy-dom": "^19.0.2",
  "jsdom": "^27.0.0"
}
```

#### Code Quality
```json
{
  "eslint": "^9.36.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.20"
}
```

---

### 10.3 Project Structure (Implemented)

```
claude-project/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx          ✅ Dual-mode container
│   │   │   ├── Header.jsx              ✅ App header with title
│   │   │   └── ModeToggle.jsx          ✅ Notes/Tasks switcher
│   │   ├── notes/
│   │   │   ├── NotesView.jsx           ✅ Three-column layout
│   │   │   ├── FolderSelector.jsx      ✅ Folder dropdown + CRUD
│   │   │   ├── NotesList.jsx           ✅ Notes list with search/sort
│   │   │   └── NoteEditor.jsx          ✅ Text editor with auto-save
│   │   └── tasks/
│   │       ├── TasksView.jsx           ✅ Board view + DndContext
│   │       ├── BoardSidebar.jsx        ✅ Board selection sidebar
│   │       ├── List.jsx                ✅ List component with droppable
│   │       ├── Card.jsx                ✅ Draggable card component
│   │       └── CardModal.jsx           ✅ Card details modal
│   ├── store/
│   │   ├── notesStore.js               ✅ Zustand store for notes
│   │   └── tasksStore.js               ✅ Zustand store for tasks
│   ├── tests/
│   │   ├── unit/                       ✅ 38 tests (tasksStore, components)
│   │   ├── integration/                ✅ 30 tests (flows, mode switching)
│   │   ├── e2e/                        ✅ 120 E2E tests (Playwright)
│   │   └── accessibility/              ✅ Accessibility tests (vitest-axe)
│   ├── App.jsx                         ✅ Root component
│   ├── main.jsx                        ✅ Entry point
│   └── index.css                       ✅ Global styles
├── spec/
│   ├── requirements.md                 ✅ This document
│   ├── TEST_DOCUMENTATION.md           ✅ Comprehensive test docs
│   ├── todo.md                         ✅ Development checklist
│   └── claude.md                       ✅ Project context
├── .gitignore                          ✅ Git ignore rules
├── package.json                        ✅ Dependencies
├── vite.config.js                      ✅ Vite configuration
├── vitest.config.js                    ✅ Vitest configuration
├── playwright.config.js                ✅ Playwright configuration
├── tailwind.config.js                  ✅ Tailwind design system
├── postcss.config.js                   ✅ PostCSS config
└── eslint.config.js                    ✅ ESLint rules
```

---

### 10.4 Data Storage (Current Implementation)

**Current:** localStorage-based persistence

**Data Models:**
```javascript
// Folders
{
  id: "uuid",
  name: "Folder name",
  createdAt: "ISO 8601 timestamp"
}

// Notes
{
  id: "uuid",
  folderId: "folder-uuid",
  title: "Note title",
  content: "Note content",
  createdAt: "ISO 8601",
  updatedAt: "ISO 8601",
  isPinned: false
}

// Boards
{
  id: "uuid",
  name: "Board name",
  isStarred: false,
  createdAt: "ISO 8601",
  updatedAt: "ISO 8601"
}

// Lists
{
  id: "uuid",
  boardId: "board-uuid",
  name: "List name",
  position: 0,
  createdAt: "ISO 8601"
}

// Cards
{
  id: "uuid",
  listId: "list-uuid",
  title: "Card title",
  description: "Card description",
  position: 0,
  tags: ["tag1", "tag2"],
  createdAt: "ISO 8601",
  updatedAt: "ISO 8601"
}
```

**Storage Keys:**
- `folders` - Array of folder objects
- `notes` - Array of note objects
- `boards` - Array of board objects
- `lists` - Array of list objects
- `cards` - Array of card objects

**Limitations:**
- 5-10MB storage limit (browser-dependent)
- No multi-device sync
- No real-time collaboration
- Data tied to single browser

**Future Migration:** Architecture ready for Supabase migration (see Section 2.3)

---

### 10.5 Testing Documentation

Comprehensive testing documentation available in:
📄 **`spec/TEST_DOCUMENTATION.md`**

**Test Statistics:**
- **Total Tests:** 188
- **Pass Rate:** 100%
- **Test Files:** 11
- **Coverage Areas:**
  - Unit tests (tasksStore, notesStore, components)
  - Integration tests (full workflows, mode switching)
  - E2E tests (Playwright - user journeys)
  - Accessibility tests (vitest-axe)

**Test Commands:**
```bash
npm test              # Run all unit/integration tests
npm run test:ui       # Open Vitest UI
npm run test:run      # Run tests once (CI mode)
npm run test:e2e      # Run E2E tests with Playwright
npm run test:all      # Run all tests (unit + E2E)
```

---

### 10.6 Deployment Information

**Platform:** Vercel
**Production URL:** https://claude-project-two.vercel.app
**Deployment Method:** Vercel CLI (`vercel --yes --prod`)

**Deployment Status:**
- ✅ Production deployed
- ✅ Publicly accessible
- ✅ Auto-reload on refresh
- ✅ localStorage data persists per browser
- ⏳ CI/CD pipeline (not yet configured)
- ⏳ GitHub repository link (pending)

**Future Deployment Enhancements:**
1. Link GitHub repository for automatic deployments
2. Set up GitHub Actions CI/CD (see TEST_DOCUMENTATION.md)
3. Add smoke tests for production
4. Configure environment variables for Supabase migration

---

### 10.7 Pending Enhancements

**High Priority:**
1. **Mobile Responsiveness** (See Section 11 below) - Make app fully usable on mobile devices
2. **Supabase Backend Migration** - Enable multi-device sync
3. **User Authentication** - Add login/signup

**Medium Priority:**
4. **Rich Text Editor** - Replace textarea with Tiptap/Lexical
5. **Advanced Task Features** - Due dates, checklists, card descriptions
6. **Global Search** - Search across both notes and tasks
7. **Data Export/Import** - JSON/Markdown export

**Low Priority:**
8. **Keyboard Shortcuts** - Power user efficiency
9. **Themes** - Light mode option
10. **Collaboration** - Real-time multi-user editing

---

## 11. Mobile Responsiveness Enhancement

### 11.1 Overview & Current State

**Current Status:** Desktop-Optimized Only ❌

**Problems:**
- Notes sidebar: Fixed 256px (68% of mobile screen!)
- Tasks board: Horizontal scroll unusable on mobile
- No touch gestures (drag-and-drop mouse-only)
- Header too wide for small screens
- No mobile navigation patterns

**Target:** Mobile-First Responsive Design ✅

**Goal:** Make the app fully functional and delightful on mobile devices (375px minimum width)

---

### 11.2 Implementation Strategy

**Approach:** Progressive Enhancement (Recommended)
- Keep desktop layout intact
- Add mobile breakpoints with Tailwind
- Use hamburger menu + bottom nav on mobile
- Optimize for iPhone SE (375px) minimum

**Alternative:** Complete Rebuild (Not Recommended)
- More work, higher risk
- Would require redesigning components from scratch

---

### 11.3 Technical Requirements

#### 11.3.1 Dependencies to Install

```bash
npm install lucide-react react-swipeable
```

**Packages:**
- `lucide-react`: Icon library for menu, navigation icons
- `react-swipeable`: Touch gesture support (swipe between modes)

---

#### 11.3.2 New Components to Create

**1. MobileMenu.jsx** (Collapsible Sidebar)
```jsx
// src/components/layout/MobileMenu.jsx
// Hamburger menu with slide-in sidebar for mobile
// Fixed positioning with overlay
// Desktop: static sidebar (always visible)
```

**2. BottomNav.jsx** (Mobile Navigation Bar)
```jsx
// src/components/layout/BottomNav.jsx
// Fixed bottom navigation with Notes/Tasks toggle
// Floating action button for quick add
// Icons with labels
// iOS safe-area support
```

---

#### 11.3.3 Components to Modify

**Modified Files:**
1. **MainLayout.jsx**
   - Add swipe gesture handlers
   - Conditionally render desktop header vs mobile header
   - Account for bottom nav height on mobile
   - Integrate BottomNav component

2. **NotesView.jsx**
   - Wrap sidebar in MobileMenu component
   - Make editor full-width on mobile
   - Adjust padding for mobile

3. **TasksView.jsx**
   - Wrap BoardSidebar in MobileMenu component
   - Enable horizontal scroll with snap points
   - Optimize list width for mobile

4. **Header.jsx**
   - Hide on mobile (< lg breakpoint)
   - Show simplified mobile header

5. **Card.jsx**
   - Increase touch targets (min 44px height)
   - Add mobile spacing (larger padding)
   - Implement long-press context menu

6. **List.jsx**
   - Adjust width for mobile (full screen or snap-scroll)
   - Optimize spacing

---

### 11.4 Detailed Implementation Plan

#### Phase 1: Core Responsive Layout (1-2 hours)

**Step 1.1: Create MobileMenu Component**
```jsx
// Features:
// - Hamburger button (mobile only)
// - Slide-in sidebar with animation
// - Overlay with close on click
// - Desktop: always visible (no hamburger)
// - Responsive transform transitions

// Breakpoint: lg (1024px)
// Mobile: fixed, transform translate
// Desktop: static, always visible
```

**Step 1.2: Create BottomNav Component**
```jsx
// Features:
// - Fixed bottom positioning
// - Notes/Tasks buttons with icons
// - Floating action button (elevated, centered)
// - Active state highlighting (yellow)
// - Safe area insets (iOS notch)
// - Only visible on mobile (< lg)

// Layout: 3-column flex
// [Notes] [+ FAB] [Tasks]
```

**Step 1.3: Update MainLayout**
```jsx
// Changes:
// - Add swipe handlers (left/right to switch modes)
// - Conditional header rendering
// - Mobile header: Simple title only
// - Desktop header: Full Header component
// - Add BottomNav component
// - Adjust main content height for bottom nav
```

**Step 1.4: Update NotesView & TasksView**
```jsx
// NotesView changes:
// - Wrap sidebar in MobileMenu
// - Full-width editor on mobile

// TasksView changes:
// - Wrap BoardSidebar in MobileMenu
// - Horizontal scroll container with snap points
// - Optimize list rendering for mobile
```

---

#### Phase 2: Touch Gestures & Mobile UX (2-3 hours)

**Step 2.1: Swipe Gestures**
```jsx
// Implement in MainLayout:
// - Swipe left → Switch to Tasks
// - Swipe right → Switch to Notes
// - Use react-swipeable hooks
// - Prevent scroll interference
// - Mobile only (no mouse tracking)
```

**Step 2.2: Mobile Card Optimization**
```jsx
// Card.jsx updates:
// - Increase touch targets: min-h-[56px] (iOS: 44px minimum)
// - Larger padding on mobile: p-3 md:p-2
// - More spacing between cards: mb-3 md:mb-2
// - Touch feedback: active:scale-95
// - Smooth transitions
```

**Step 2.3: Long-Press Context Menu**
```jsx
// Card.jsx feature:
// - 500ms long press triggers menu
// - Bottom sheet style menu (mobile)
// - Options: Edit, Delete, Move, Copy
// - Cancel button
// - Overlay dismissal
```

**Step 2.4: Horizontal Scroll Snap**
```jsx
// TasksView updates:
// - Lists container: overflow-x-auto
// - Snap behavior: snap-x snap-mandatory
// - Each list: snap-start
// - Smooth scrolling
```

---

#### Phase 3: Responsive Breakpoints (30 minutes)

**Step 3.1: Update Tailwind Config**
```javascript
// tailwind.config.js additions:
theme: {
  extend: {
    screens: {
      'xs': '375px',    // iPhone SE
      'sm': '640px',    // Default
      'md': '768px',    // Tablets
      'lg': '1024px',   // Desktop
      'xl': '1280px',   // Large desktop
    },
    spacing: {
      'safe-bottom': 'env(safe-area-inset-bottom)', // iOS notch
    },
  },
}
```

**Step 3.2: Responsive Typography**
```jsx
// Update all headings and text:
<h1 className="text-xl md:text-2xl lg:text-3xl">
<p className="text-sm md:text-base">
<button className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base">
```

---

#### Phase 4: Mobile-Specific Features (1 hour)

**Step 4.1: Pull-to-Refresh**
```jsx
// NotesView & TasksView:
// - Touch event handlers (touchStart, touchMove, touchEnd)
// - Pull threshold: 80px
// - Loading spinner animation
// - Reload data on release
// - Smooth bounce animation
```

**Step 4.2: Mobile Touch Area Verification**
```jsx
// Check all interactive elements:
// - Buttons: min-h-[44px] (iOS standard)
// - Cards: min-h-[56px]
// - List items: py-3 (generous padding)
// - Icons: size={24} or size={28}
```

**Step 4.3: Safe Area Support**
```jsx
// iOS notch/home indicator:
// - Bottom nav: pb-safe-bottom
// - Main content: pb-[calc(4rem+env(safe-area-inset-bottom))]
// - Modals: Account for safe areas
```

---

### 11.5 Implementation Checklist

#### Setup (30 minutes)
- [ ] Install lucide-react: `npm install lucide-react`
- [ ] Install react-swipeable: `npm install react-swipeable`
- [ ] Verify installation in package.json
- [ ] Update Tailwind config with mobile breakpoints
- [ ] Add safe-area-inset spacing utilities

#### Core Layout (2 hours)
- [ ] Create MobileMenu.jsx component
- [ ] Create BottomNav.jsx component
- [ ] Update MainLayout.jsx with conditional rendering
- [ ] Add swipe gesture handlers to MainLayout
- [ ] Update NotesView with MobileMenu wrapper
- [ ] Update TasksView with MobileMenu wrapper
- [ ] Update Header visibility (desktop only)
- [ ] Create mobile header (simple title)

#### Touch Optimization (2 hours)
- [ ] Increase touch targets in Card.jsx (min-h-[56px])
- [ ] Add mobile spacing to cards (p-3 mb-3)
- [ ] Implement long-press context menu in Card.jsx
- [ ] Add horizontal scroll snap to TasksView lists
- [ ] Add touch feedback animations (active:scale-95)
- [ ] Verify all buttons meet 44px minimum

#### Responsive Styling (1 hour)
- [ ] Update all typography with breakpoint classes
- [ ] Adjust padding/margins for mobile
- [ ] Test layout at 375px, 768px, 1024px widths
- [ ] Verify sidebars collapse on mobile
- [ ] Test bottom navigation functionality
- [ ] Verify swipe gestures work correctly

#### Advanced Features (1 hour)
- [ ] Implement pull-to-refresh in NotesView
- [ ] Implement pull-to-refresh in TasksView
- [ ] Add safe-area-inset support (iOS)
- [ ] Test on iOS Safari (if available)
- [ ] Test on Android Chrome

#### Testing (1 hour)
- [ ] Test on Chrome DevTools mobile emulation
- [ ] Test on real mobile device (iOS or Android)
- [ ] Verify touch drag-and-drop works
- [ ] Test swipe gestures
- [ ] Test bottom navigation
- [ ] Test hamburger menu
- [ ] Verify no horizontal scroll issues
- [ ] Test in portrait and landscape modes

---

### 11.6 Responsive Breakpoint Strategy

**Mobile First Approach:**

```jsx
// Default (mobile): 375px - 1023px
<div className="w-full px-4">

// Tablet (md): 768px+
<div className="w-full md:w-1/2 px-4 md:px-6">

// Desktop (lg): 1024px+
<div className="w-full md:w-1/2 lg:w-1/3 px-4 md:px-6 lg:px-8">
```

**Hide/Show Components:**
```jsx
// Show on mobile only
<div className="lg:hidden">Mobile Menu Button</div>

// Show on desktop only
<div className="hidden lg:block">Desktop Header</div>

// Show on tablet and up
<div className="hidden md:block">Desktop Sidebar</div>
```

---

### 11.7 Testing Requirements

#### Manual Testing Checklist
- [ ] **Mobile (< 768px)**
  - [ ] Hamburger menu opens/closes sidebar
  - [ ] Bottom navigation switches modes
  - [ ] Swipe gestures work
  - [ ] No horizontal scroll (unless intended)
  - [ ] Touch targets are easy to tap
  - [ ] Long-press menu appears

- [ ] **Tablet (768px - 1023px)**
  - [ ] Layout adapts to tablet size
  - [ ] Sidebar behavior appropriate
  - [ ] Touch interactions smooth

- [ ] **Desktop (1024px+)**
  - [ ] Existing desktop layout unchanged
  - [ ] No mobile components visible
  - [ ] Mouse interactions work as before

#### Device Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad (768px)
- [ ] Android phones (various sizes)

#### Browser Testing
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

---

### 11.8 Component Modifications Summary

| Component | File | Changes | Effort |
|-----------|------|---------|--------|
| MainLayout | MainLayout.jsx | Swipe gestures, conditional header, bottom nav | 1 hour |
| MobileMenu | MobileMenu.jsx (new) | Hamburger + slide-in sidebar | 45 min |
| BottomNav | BottomNav.jsx (new) | Mobile navigation bar | 30 min |
| NotesView | NotesView.jsx | Wrap sidebar, adjust spacing | 30 min |
| TasksView | TasksView.jsx | Wrap sidebar, horizontal scroll | 30 min |
| Header | Header.jsx | Desktop-only visibility | 10 min |
| Card | Card.jsx | Touch targets, long-press menu | 45 min |
| List | List.jsx | Mobile width optimization | 15 min |
| Tailwind Config | tailwind.config.js | Breakpoints, safe-area spacing | 15 min |
| **Total** | **9 files** | **~5 hours** | **Low risk** |

---

### 11.9 Mobile UX Patterns

#### Navigation Patterns
**Desktop:** Top header with mode toggle
**Mobile:** Bottom navigation bar with icons

**Rationale:** Thumb-friendly access on mobile devices

#### Sidebar Patterns
**Desktop:** Always visible, fixed width
**Mobile:** Collapsible with hamburger menu, slide-in animation

**Rationale:** Maximize screen real estate on small devices

#### Touch Interactions
**Desktop:** Mouse hover, click, drag
**Mobile:** Tap, long-press, swipe, drag

**Rationale:** Touch-first design for mobile users

---

### 11.10 Accessibility Considerations

**Mobile Accessibility:**
- [ ] Touch targets: Minimum 44x44px (WCAG)
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announcements for mode switching
- [ ] Swipe gestures don't interfere with assistive technologies
- [ ] Bottom navigation labeled with ARIA
- [ ] Hamburger menu keyboard accessible

**Testing Tools:**
- [ ] VoiceOver (iOS)
- [ ] TalkBack (Android)
- [ ] Axe DevTools on mobile viewports

---

### 11.11 Performance Optimizations

**Mobile Performance:**
- [ ] Lazy load off-screen components
- [ ] Debounce scroll events
- [ ] Optimize animations (use transform/opacity only)
- [ ] Reduce bundle size for mobile (code splitting)
- [ ] Test on slow network (3G throttling)

**Touch Performance:**
- [ ] Use passive event listeners for scroll
- [ ] Avoid layout thrashing
- [ ] Use CSS transforms for animations (GPU accelerated)
- [ ] Minimize re-renders during drag

---

### 11.12 Success Metrics

**Mobile responsiveness is successful when:**
- ✅ App is fully functional on iPhone SE (375px)
- ✅ All features accessible via touch
- ✅ No horizontal scroll (unless intentional)
- ✅ Bottom navigation works smoothly
- ✅ Swipe gestures feel natural
- ✅ Touch targets meet 44px minimum
- ✅ Drag-and-drop works on mobile
- ✅ Long-press context menu functions correctly
- ✅ Performance is smooth (60fps animations)
- ✅ Layout adapts at all breakpoints

---

### 11.13 Future Mobile Enhancements

**Phase 2 (Optional):**
1. **PWA Support**
   - Service workers for offline access
   - Install prompt
   - App icon and splash screen
   - Background sync

2. **Native App Feel**
   - Haptic feedback on interactions
   - Native-like transitions
   - Bottom sheet modals
   - Pull-to-dismiss gestures

3. **Advanced Touch Gestures**
   - Swipe to delete (cards, notes)
   - Pinch to zoom (optional)
   - Two-finger pan (board navigation)

4. **Mobile-Specific Features**
   - Voice input for notes
   - Camera access for attachments
   - Share sheet integration
   - Quick actions from home screen

---

## Summary: Mobile Responsiveness Requirements

**What's Required:**
1. ✅ Install `lucide-react` and `react-swipeable`
2. ✅ Create 2 new components (MobileMenu, BottomNav)
3. ✅ Modify 7 existing components (MainLayout, NotesView, TasksView, Header, Card, List, Tailwind config)
4. ✅ Add responsive breakpoints and mobile-first styling
5. ✅ Implement touch gestures and mobile UX patterns
6. ✅ Test on real devices and mobile viewports

**What's NOT Required:**
- ❌ No changes to stores (notesStore, tasksStore)
- ❌ No data model changes
- ❌ No changes to business logic
- ❌ No backend changes

**Estimated Time:** 7-8 hours total
**Risk Level:** Low (additive changes, desktop functionality preserved)
**User Impact:** Very High (enables mobile usage, expands user base)

---

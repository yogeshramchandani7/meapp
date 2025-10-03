# Task Management & Note-Taking App - Development TODO

## Project Setup

### Phase 0: Initial Setup
- [ ] Create React + Vite project (`npm create vite@latest . -- --template react`)
- [ ] Install core dependencies (zustand, date-fns, nanoid, clsx, react-icons)
- [ ] Install Tailwind CSS
- [ ] Configure Tailwind (tailwind.config.js, postcss.config.js)
- [ ] Create `.env.example` file with storage config
- [ ] Create `.env.local` file (set `VITE_USE_SUPABASE=false`)
- [ ] Set up project folder structure (components, services, store, utils)
- [ ] Configure ESLint and Prettier
- [ ] Test dev server runs (`npm run dev`)

---

## Milestone 1: Basic Structure

**Goal**: Get the foundation and layout working

### Layout & Navigation
- [ ] Create `MainLayout.jsx` component with header and main content area
- [ ] Create `Header.jsx` component
- [ ] Create `ModeToggle.jsx` component (buttons/tabs to switch between Notes and Tasks)
- [ ] Implement mode switching state (use React state or Zustand)
- [ ] Mode toggle switches between "Notes" and "Tasks" views

### Storage Abstraction Layer
- [ ] Create `src/services/storage/storageInterface.js` (base class)
- [ ] Create `src/services/storage/localStorageService.js` (localStorage implementation)
- [ ] Create `src/services/storage/supabaseService.js` (stub for now)
- [ ] Create `src/services/storage/index.js` (service factory based on env variable)
- [ ] Test localStorage service: create, read, update, delete, list operations

### Notes View Placeholder
- [ ] Create `NotesView.jsx` component
- [ ] Create basic three-column layout (folders sidebar, notes list, editor)
- [ ] Add placeholder text/content for each column
- [ ] Make layout responsive (mobile: stack columns vertically)

### Tasks View Placeholder
- [ ] Create `TasksView.jsx` component
- [ ] Create basic layout (board sidebar, board area)
- [ ] Add placeholder text/content
- [ ] Make layout responsive

### Testing
- [ ] ✅ Mode toggle switches between views
- [ ] ✅ Both views render placeholder content
- [ ] ✅ Layout is responsive on mobile, tablet, desktop
- [ ] ✅ No console errors

---

## Milestone 2: Notes - Basic CRUD

**Goal**: Full folder and note creation, editing, deletion with localStorage persistence

### Zustand Store Setup
- [ ] Create `src/store/notesStore.js`
- [ ] Integrate storage service in notesStore
- [ ] Implement state: `folders`, `notes`, `selectedFolderId`, `selectedNoteId`
- [ ] Implement actions: `loadFolders`, `createFolder`, `updateFolder`, `deleteFolder`
- [ ] Implement actions: `loadNotes`, `createNote`, `updateNote`, `deleteNote`

### Folder Sidebar
- [ ] Create `FolderSidebar.jsx` component
- [ ] Display list of folders from store
- [ ] Add "New Folder" button
- [ ] Add folder name input/modal
- [ ] Implement create folder functionality
- [ ] Show selected folder highlight
- [ ] Click folder to select it
- [ ] Add folder count badge (number of notes)
- [ ] Add delete folder button/icon (with confirmation)
- [ ] Add rename folder functionality

### Notes List
- [ ] Create `NotesList.jsx` component
- [ ] Display notes for selected folder
- [ ] Show note title (first line of content)
- [ ] Show note preview (first few lines)
- [ ] Show last modified date
- [ ] Add "New Note" button
- [ ] Click note to select and open in editor
- [ ] Show selected note highlight
- [ ] Handle empty state (no notes in folder)

### Note Editor
- [ ] Create `NoteEditor.jsx` component
- [ ] Use simple `<textarea>` for content editing
- [ ] Display selected note content
- [ ] Auto-save on change (debounced, 500ms delay)
- [ ] Show "last edited" timestamp
- [ ] Add delete note button (with confirmation)
- [ ] Handle empty state (no note selected)

### Data Persistence
- [ ] Notes save to localStorage via storage service
- [ ] Folders save to localStorage via storage service
- [ ] Data loads on app startup
- [ ] Generate UUIDs with nanoid for IDs
- [ ] Use ISO 8601 timestamps (createdAt, updatedAt)

### Testing
- [ ] ✅ Create a folder
- [ ] ✅ Create a note in folder
- [ ] ✅ Edit note content
- [ ] ✅ Delete note and folder
- [ ] ✅ Data persists on page reload
- [ ] ✅ Auto-save works correctly
- [ ] ✅ No console errors

---

## Milestone 3: Notes - Rich Features

**Goal**: Search, sorting, pinning, and basic text formatting

### Search Functionality
- [ ] Add search input in NotesView header
- [ ] Implement search filter in notesStore
- [ ] Search across note titles and content
- [ ] Highlight search results in notes list
- [ ] Show "no results" state

### Sorting
- [ ] Add sort dropdown in NotesView header
- [ ] Implement sort by: Date Edited (default)
- [ ] Implement sort by: Date Created
- [ ] Implement sort by: Title (alphabetical)
- [ ] Save sort preference in localStorage

### Pin/Unpin Notes
- [ ] Add pin button/icon to note editor
- [ ] Add pin button/icon to notes list items
- [ ] Show pin indicator on pinned notes
- [ ] Pinned notes appear at top of list
- [ ] Update `isPinned` field in data model

### Text Formatting (Phase 1 - Basic)
- [ ] Add formatting toolbar to NoteEditor
- [ ] Add Bold button (Cmd/Ctrl + B)
- [ ] Add Italic button (Cmd/Ctrl + I)
- [ ] Add Underline button (Cmd/Ctrl + U)
- [ ] Implement basic formatting with `document.execCommand` or similar
- [ ] Save formatted content (markdown or HTML)

### UI Polish
- [ ] Add folder icons
- [ ] Add note icons
- [ ] Improve spacing and typography
- [ ] Add hover states to interactive elements

### Testing
- [ ] ✅ Rich text formatting works (bold, italic, underline)
- [ ] ✅ Search finds notes by title and content
- [ ] ✅ Pin/unpin notes works
- [ ] ✅ Sort notes by different criteria
- [ ] ✅ Pinned notes stay at top
- [ ] ✅ No console errors

---

## Milestone 4: Tasks - Basic CRUD

**Goal**: Create boards, lists, and cards with full CRUD operations

### Zustand Store Setup
- [ ] Create `src/store/tasksStore.js`
- [ ] Integrate storage service
- [ ] Implement state: `boards`, `lists`, `cards`, `selectedBoardId`
- [ ] Implement board actions: `loadBoards`, `createBoard`, `updateBoard`, `deleteBoard`
- [ ] Implement list actions: `createList`, `updateList`, `deleteList`
- [ ] Implement card actions: `createCard`, `updateCard`, `deleteCard`, `moveCard`

### Board Sidebar
- [ ] Create `BoardSidebar.jsx` component
- [ ] Display list of boards
- [ ] Add "Create Board" button
- [ ] Implement create board with name input
- [ ] Click board to select and display
- [ ] Add star/favorite board toggle
- [ ] Show starred boards at top
- [ ] Add delete board button (with confirmation)
- [ ] Add rename board functionality

### Board View
- [ ] Create `Board.jsx` component
- [ ] Display board name as header
- [ ] Display lists horizontally
- [ ] Add "Add List" button at end
- [ ] Show empty state (no lists in board)

### List Component
- [ ] Create `List.jsx` component
- [ ] Display list name as header
- [ ] Display cards vertically within list
- [ ] Add "Add Card" input at bottom of list
- [ ] Quick add card functionality (enter to create)
- [ ] Add list actions menu (rename, delete, move all cards)
- [ ] Implement delete list (with confirmation)
- [ ] Implement rename list

### Card Component
- [ ] Create `Card.jsx` component
- [ ] Display card title
- [ ] Click card to open details modal/view
- [ ] Add edit card functionality
- [ ] Add delete card button (with confirmation)
- [ ] Show card labels (colored tags)
- [ ] Show due date if set

### Card Details Modal
- [ ] Create card details modal/popup
- [ ] Show/edit card title
- [ ] Show/edit card description (textarea)
- [ ] Add close button
- [ ] Click outside to close

### Move Card Functionality (No Drag & Drop Yet)
- [ ] Add "Move Card" button in card details
- [ ] Show dropdown/modal to select destination list
- [ ] Implement move card to different list
- [ ] Add "Move Up" and "Move Down" buttons (reorder within list)
- [ ] Update card position in data model

### Data Persistence
- [ ] Boards, lists, cards save to localStorage
- [ ] Position field tracks order of lists and cards
- [ ] Data loads on app startup
- [ ] All CRUD operations persist correctly

### Testing
- [ ] ✅ Create a board
- [ ] ✅ Create lists in board
- [ ] ✅ Create cards in lists
- [ ] ✅ Edit cards (title, description)
- [ ] ✅ Delete cards, lists, boards
- [ ] ✅ Move cards between lists using buttons
- [ ] ✅ Reorder cards within list (move up/down)
- [ ] ✅ Data persists on page reload
- [ ] ✅ No console errors

---

## Milestone 5: Tasks - Drag & Drop

**Goal**: Implement drag-and-drop for cards and lists

### Setup
- [ ] Install `react-beautiful-dnd` (`npm install react-beautiful-dnd`)
- [ ] Read react-beautiful-dnd documentation

### Drag & Drop - Cards
- [ ] Wrap Board component with DragDropContext
- [ ] Wrap List component with Droppable
- [ ] Wrap Card component with Draggable
- [ ] Implement onDragEnd handler
- [ ] Handle drag card within same list (reorder)
- [ ] Handle drag card to different list (move)
- [ ] Update card positions after drag
- [ ] Smooth drag animations

### Drag & Drop - Lists
- [ ] Make lists draggable
- [ ] Implement horizontal list reordering
- [ ] Update list positions after drag
- [ ] Smooth animations

### Data Persistence
- [ ] Save new positions to localStorage after drag
- [ ] Positions persist on reload

### Testing
- [ ] ✅ Drag cards within list (reorder)
- [ ] ✅ Drag cards between lists (move)
- [ ] ✅ Drag lists to reorder
- [ ] ✅ Position persists on reload
- [ ] ✅ Smooth animations
- [ ] ✅ No console errors or drag bugs

---

## Uniform UI: Apple Notes Design System

**Goal**: Extend Apple Notes dark theme to Tasks Mode for visual consistency across the entire app

**Reference**: See `spec/requirements.md` Section 9 for detailed design specifications

### Phase 1: Tailwind Design System (30 minutes)

#### Design Tokens Setup
- [ ] Update `tailwind.config.js` with Apple Notes color palette
- [ ] Add background colors: `bg-app`, `bg-panel`, `bg-elevated`, `bg-input`, `bg-hover`
- [ ] Add text colors: `text-primary`, `text-secondary`, `text-tertiary`, `text-inverse`
- [ ] Add accent colors: `accent-yellow`, `accent-blue`, `accent-green`, `accent-red`
- [ ] Add border colors: `border`, `border-subtle`, `border-focus`
- [ ] Add border radius tokens: `rounded-card`, `rounded-input`, `rounded-button`, `rounded-modal`
- [ ] Add shadow tokens: `shadow-card`, `shadow-modal`, `shadow-hover`
- [ ] Verify Tailwind rebuild: `npm run dev` (check DevTools for new classes)

### Phase 2: Tasks Mode - Component Updates (2-3 hours)

#### TasksView.jsx - Main Container
- [ ] Change main background from `bg-gradient-to-br from-blue-50 to-purple-50` to `bg-bg-app`
- [ ] Update empty state text colors to `text-text-secondary` and `text-text-tertiary`
- [ ] Update "Add a list" button to use `bg-accent-blue` and `hover:bg-accent-blue/80`
- [ ] Update drag overlay border from `border-blue-400` to `border-accent-yellow`
- [ ] Update add list form background to `bg-bg-elevated`
- [ ] Update add list input to use `bg-bg-panel` and `text-text-primary`

#### BoardSidebar.jsx - Sidebar Styling
- [ ] Change sidebar background from `bg-white` to `bg-bg-panel`
- [ ] Change border from `border-gray-200` to `border-border`
- [ ] Update header text from `text-gray-700` to `text-text-primary`
- [ ] Update "New Board" button to use `text-text-primary` and `hover:bg-bg-hover`
- [ ] Update board items background from `bg-gray-100` to `bg-bg-elevated`
- [ ] Change selected board background from `bg-blue-500` to `bg-accent-yellow`
- [ ] Change selected board text from `text-white` to `text-text-inverse`
- [ ] Update hover states from `hover:bg-gray-200` to `hover:bg-bg-hover`

#### List.jsx - List Component
- [ ] Change list background from `bg-gray-100` to `bg-bg-panel`
- [ ] Update border radius from `rounded-lg` to `rounded-card`
- [ ] Change list header text from `text-gray-800` to `text-text-primary`
- [ ] Update menu button text from `text-gray-600` to `text-text-secondary`
- [ ] Change dropdown menu background from `bg-white` to `bg-bg-elevated`
- [ ] Update dropdown shadow from `shadow-lg` to `shadow-modal`
- [ ] Change dropdown border from `border-gray-200` to `border-border`
- [ ] Update menu items text from `text-gray-700` to `text-text-primary`
- [ ] Change menu hover from `hover:bg-gray-100` to `hover:bg-bg-hover`
- [ ] Update delete option text from `text-red-600` to `text-accent-red`
- [ ] Update "Add card" button text to `text-text-secondary`
- [ ] Update add card form background to `bg-bg-panel` or `bg-bg-elevated`

#### Card.jsx - Card Styling
- [ ] Change card background from `bg-white` to `bg-bg-panel`
- [ ] Update border from `border-gray-200` to `border-border`
- [ ] Change shadow from `shadow-sm` to `shadow-card`
- [ ] Update hover state from `hover:bg-gray-50` to `hover:bg-bg-hover`
- [ ] Change card title text from `text-gray-800` to `text-text-primary`
- [ ] Update tags background from `bg-blue-100` to `bg-accent-blue/20`
- [ ] Update tags text from `text-blue-700` to `text-accent-blue`
- [ ] Verify cursor changes to `grab` (already implemented in drag & drop)

#### CardModal.jsx - Modal Styling
- [ ] Change modal overlay opacity from `bg-opacity-50` to `bg-opacity-60`
- [ ] Update modal background from `bg-white` to `bg-bg-elevated`
- [ ] Change modal shadow from `shadow-xl` to `shadow-modal`
- [ ] Update modal border radius from `rounded-lg` to `rounded-modal`
- [ ] Change title input background to `bg-bg-elevated`
- [ ] Update title input text from `text-gray-800` to `text-text-primary`
- [ ] Change textarea background to `bg-bg-panel`
- [ ] Update textarea text to `text-text-primary`
- [ ] Change textarea border from `border-gray-300` to `border-border`
- [ ] Update section headers from `text-gray-700` to `text-text-secondary`
- [ ] Change tags background from `bg-blue-100` to `bg-accent-blue/20`
- [ ] Update tags text from `text-blue-700` to `text-accent-blue`
- [ ] Change delete button from `bg-red-500` to `bg-accent-red`
- [ ] Update delete button hover to `hover:bg-accent-red/80`
- [ ] Change close button background from `bg-gray-200` to `bg-bg-panel`
- [ ] Update close button text from `text-gray-700` to `text-text-primary`
- [ ] Add border to close button: `border border-border`

### Phase 3: Notes Mode - Verification (1 hour)

#### NotesView.jsx - Consistency Check
- [ ] Verify main background uses `bg-bg-app` or equivalent black
- [ ] Ensure layout doesn't conflict with new Tailwind tokens

#### FolderSelector.jsx - Dropdown Styling
- [ ] Verify uses `bg-bg-panel` or `bg-neutral-800` (equivalent)
- [ ] Check text colors use semantic tokens
- [ ] Ensure "New Folder" button uses consistent hover states

#### NotesList.jsx - List Styling
- [ ] Verify selected note uses `bg-accent-yellow` or `bg-accent-yellow/20`
- [ ] Check note item text uses `text-text-primary`
- [ ] Verify timestamps use `text-text-secondary`
- [ ] Ensure hover states are consistent

#### NoteEditor.jsx - Editor Styling
- [ ] Verify editor background is consistent
- [ ] Check text uses `text-text-primary`
- [ ] Verify "Pin" button uses `accent-blue` or `accent-yellow`
- [ ] Check "Delete" button uses `accent-red`

### Phase 4: Visual & Accessibility Testing (1 hour)

#### Visual Regression Testing
- [ ] Switch between Notes/Tasks modes - verify smooth visual transition
- [ ] Verify no jarring color changes when switching modes
- [ ] Check drag & drop visual feedback (yellow highlight on dragged cards)
- [ ] Test all modals have elevated dark background
- [ ] Verify hover states are consistent across all buttons
- [ ] Check focus states show blue focus rings (visible for keyboard navigation)

#### Dark Theme Consistency
- [ ] Verify all text is readable against dark backgrounds
- [ ] Check contrast ratios meet WCAG AA (4.5:1 for normal text)
- [ ] Ensure borders are visible but subtle
- [ ] Verify cards have proper elevation/depth

#### Accessibility Testing
- [ ] Run existing accessibility tests: `npm test src/tests/accessibility`
- [ ] Test keyboard navigation: Tab through all interactive elements
- [ ] Verify focus indicators are clearly visible
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Check all buttons have proper ARIA labels

#### Cross-Browser Testing
- [ ] Test in Chrome/Edge (Chromium)
- [ ] Test in Firefox
- [ ] Test in Safari (if on Mac)
- [ ] Verify consistent rendering across browsers

### Phase 5: Polish & Documentation (30 minutes)

#### Final Touches
- [ ] Ensure all CSS transitions are smooth (200ms)
- [ ] Verify focus states use `border-focus` (blue outline)
- [ ] Check error states use `accent-red` consistently
- [ ] Confirm all buttons have proper hover effects
- [ ] Remove any hardcoded colors (use design tokens only)

#### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors
- [ ] Remove unused CSS classes
- [ ] Clean up commented-out code

#### Documentation
- [ ] Update component comments to reference design tokens
- [ ] Document color usage in README (optional)
- [ ] Take screenshots of before/after (optional)

### Testing Checklist

**Core Functionality (ensure nothing broke):**
- [ ] ✅ All existing tests pass: `npm test`
- [ ] ✅ Notes CRUD operations work
- [ ] ✅ Tasks CRUD operations work
- [ ] ✅ Drag & drop still functions correctly
- [ ] ✅ Modal interactions work properly

**Visual Consistency:**
- [ ] ✅ Tasks Mode matches Notes Mode aesthetic
- [ ] ✅ All components use centralized design tokens
- [ ] ✅ No hardcoded colors remain
- [ ] ✅ App feels like one cohesive product

**User Experience:**
- [ ] ✅ Smooth transitions when switching modes
- [ ] ✅ Consistent interaction patterns (hover, focus, selection)
- [ ] ✅ Dark theme reduces eye strain
- [ ] ✅ Professional, polished appearance

---


## Milestone 6: Tasks - Advanced Features

**Goal**: Labels, due dates, checklists, filters, and search

### Labels
- [ ] Create label color picker
- [ ] Add "Add Label" button to card details
- [ ] Create/edit/delete labels
- [ ] Assign labels to cards
- [ ] Display labels on card component (colored badges)
- [ ] Store labels in card data model

### Due Dates
- [ ] Add due date picker to card details (use native date input or date-fns)
- [ ] Display due date on card component
- [ ] Highlight overdue cards (red)
- [ ] Highlight due soon cards (yellow)
- [ ] Store `dueDate` in card data model

### Checklists
- [ ] Add "Add Checklist" button to card details
- [ ] Create checklist component (list of checkbox items)
- [ ] Add checklist items
- [ ] Check/uncheck items
- [ ] Delete checklist items
- [ ] Show checklist progress on card (e.g., "2/5 completed")
- [ ] Store checklists in card data model (JSON array)

### Search & Filters
- [ ] Add search input in Board header
- [ ] Search cards by title and description
- [ ] Add filter dropdown: filter by labels
- [ ] Add filter dropdown: filter by due date (overdue, due soon, no date)
- [ ] Apply filters to displayed cards
- [ ] Show "no results" state

### Card Cover Images (Optional)
- [ ] Add cover image URL input to card details
- [ ] Display cover image on card component
- [ ] Handle broken image URLs gracefully

### Testing
- [ ] ✅ Add labels to cards (multiple labels)
- [ ] ✅ Add due dates to cards
- [ ] ✅ Add checklists to cards
- [ ] ✅ Check/uncheck checklist items
- [ ] ✅ Filter cards by labels
- [ ] ✅ Filter cards by due date
- [ ] ✅ Search cards by title/description
- [ ] ✅ No console errors

---

## Milestone 7: Polish

**Goal**: Dark mode, keyboard shortcuts, animations, and overall polish

### Dark Mode
- [ ] Add dark mode toggle in Header
- [ ] Define dark mode color palette (Tailwind dark: classes)
- [ ] Apply dark mode styles to all components
- [ ] Apply dark mode to Notes mode
- [ ] Apply dark mode to Tasks mode
- [ ] Save dark mode preference in localStorage
- [ ] Load dark mode preference on startup

### Keyboard Shortcuts
- [ ] Implement Cmd/Ctrl + N: Create new note/card (context-aware)
- [ ] Implement Cmd/Ctrl + F: Focus search input
- [ ] Implement Cmd/Ctrl + S: Manual save (if applicable)
- [ ] Implement Escape: Close modal/details
- [ ] Implement Arrow keys: Navigate notes/cards (optional)
- [ ] Add keyboard shortcuts help modal (?)

### Animations & Transitions
- [ ] Smooth mode toggle transition
- [ ] Fade-in animations for notes/cards
- [ ] Smooth card drag animations (already in react-beautiful-dnd)
- [ ] Hover animations on buttons and interactive elements
- [ ] Loading states for async operations

### Error Handling
- [ ] Add error boundaries
- [ ] Show user-friendly error messages
- [ ] Handle localStorage quota exceeded error
- [ ] Handle malformed data gracefully

### Performance Optimization
- [ ] Memoize expensive components (React.memo)
- [ ] Optimize re-renders with useMemo/useCallback
- [ ] Virtualize long lists if needed (react-window)
- [ ] Debounce search and auto-save operations

### Final Testing
- [ ] ✅ Dark mode works in both Notes and Tasks modes
- [ ] ✅ All keyboard shortcuts work
- [ ] ✅ Smooth animations throughout
- [ ] ✅ No console errors or warnings
- [ ] ✅ Test on Chrome, Firefox, Safari
- [ ] ✅ Test on mobile (responsive design works)
- [ ] ✅ Test with large datasets (100+ notes, 100+ cards)
- [ ] ✅ Test edge cases (empty states, long text, special characters)

---

## Milestone 8 (Optional): Supabase Migration

**Goal**: Upgrade from localStorage to Supabase for multi-device sync

### Supabase Setup
- [ ] Install `@supabase/supabase-js` (`npm install @supabase/supabase-js`)
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy project URL and anon key
- [ ] Update `.env.local`: set `VITE_USE_SUPABASE=true`
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Database Schema
- [ ] Open Supabase SQL Editor
- [ ] Run SQL schema for `folders` table
- [ ] Run SQL schema for `notes` table
- [ ] Run SQL schema for `boards` table
- [ ] Run SQL schema for `lists` table
- [ ] Run SQL schema for `cards` table
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Create RLS policies (allow all for now, restrict with auth later)

### Complete Supabase Service Implementation
- [ ] Implement `create()` method in SupabaseService
- [ ] Implement `read()` method
- [ ] Implement `update()` method
- [ ] Implement `delete()` method
- [ ] Implement `list()` method with filters
- [ ] Implement `search()` method
- [ ] Handle Supabase errors gracefully

### Testing with Supabase
- [ ] Test create operations (folders, notes, boards, lists, cards)
- [ ] Test read operations
- [ ] Test update operations
- [ ] Test delete operations
- [ ] Test search and filters
- [ ] Test data syncs across browser tabs/windows (real-time)
- [ ] Test switching back to localStorage (change .env)

### Authentication (Optional)
- [ ] Enable Supabase authentication
- [ ] Add login/signup UI
- [ ] Implement email/password authentication
- [ ] Update RLS policies to filter by user_id
- [ ] Test multi-user data isolation

### Data Migration (Optional)
- [ ] Create script to export localStorage data
- [ ] Create script to import data into Supabase
- [ ] Test migration with sample data

### Testing
- [ ] ✅ All CRUD operations work with Supabase
- [ ] ✅ Data persists in Supabase database
- [ ] ✅ Real-time sync works across devices/tabs
- [ ] ✅ Can switch between localStorage and Supabase seamlessly
- [ ] ✅ No data loss during operations
- [ ] ✅ No console errors

---

## Milestone 9: Rich Text Editor Upgrade (Optional)

**Goal**: Replace textarea with full-featured rich text editor

### Setup
- [ ] Install Tiptap (`npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`)
- [ ] Or install Lexical (Meta's editor)

### Tiptap Integration
- [ ] Create TiptapEditor component
- [ ] Replace textarea in NoteEditor with TiptapEditor
- [ ] Configure extensions: Bold, Italic, Underline, Headings, Lists
- [ ] Add formatting toolbar with buttons
- [ ] Style editor to match Apple Notes aesthetic
- [ ] Save content as JSON or HTML
- [ ] Load existing notes into Tiptap

### Features
- [ ] Bold, Italic, Underline, Strikethrough
- [ ] Headings (H1, H2, H3)
- [ ] Bulleted lists
- [ ] Numbered lists
- [ ] Checklist items ([ ] and [x])
- [ ] Code blocks (optional)
- [ ] Links (optional)
- [ ] Images (optional)

### Testing
- [ ] ✅ All formatting options work
- [ ] ✅ Content saves and loads correctly
- [ ] ✅ Existing notes migrate to new format
- [ ] ✅ No formatting bugs or lost content
- [ ] ✅ No console errors

---

## Final Checklist

### Code Quality
- [ ] All components are properly organized
- [ ] No unused imports or code
- [ ] Consistent code formatting (Prettier)
- [ ] No ESLint warnings
- [ ] Meaningful variable and function names
- [ ] Comments for complex logic

### Documentation
- [ ] README.md with setup instructions
- [ ] Document environment variables
- [ ] Document storage abstraction pattern
- [ ] Add inline code comments where needed

### Testing
- [ ] Manual testing on all major browsers
- [ ] Responsive design works on all screen sizes
- [ ] All features work as expected
- [ ] No console errors or warnings

### Performance
- [ ] App loads quickly
- [ ] No lag when dragging cards
- [ ] Search is fast
- [ ] Auto-save doesn't cause UI jank

### Deployment (Optional)
- [ ] Build production bundle (`npm run build`)
- [ ] Test production build (`npm run preview`)
- [ ] Deploy to Vercel/Netlify/GitHub Pages
- [ ] Configure environment variables in deployment platform
- [ ] Test deployed app

---

## Summary

**Total Milestones**: 9 (7 core + 2 optional)

**Estimated Timeline**:
- Milestones 1-2: 2 weeks (Foundation + Notes CRUD)
- Milestone 3: 1 week (Notes rich features)
- Milestones 4-5: 2-3 weeks (Tasks CRUD + Drag & Drop)
- Milestone 6: 1-2 weeks (Tasks advanced features)
- Milestone 7: 1 week (Polish)
- Milestone 8: 1 week (Supabase - optional)
- Milestone 9: 1 week (Rich text editor - optional)

**Total**: 8-12 weeks for full-featured app

---

## Notes

- Test frequently after completing each sub-task
- Commit changes regularly to version control
- Use feature branches for major milestones
- Keep the app working at all times (don't break main functionality)
- Prioritize core features over nice-to-haves
- Get user feedback early and often

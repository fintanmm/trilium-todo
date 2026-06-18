# Journal

## 2026-06-16 — Phase 1: Project Scaffold

- Created `src/todoTxtParser.js` — Parses todo.txt lines into structured task objects and serializes them back. Handles completion status, priority `(A)–(Z)`, dates, `@contexts`, `+projects`, and `key:value` metadata.
- Created `src/todoStore.js` — Finds the backing note via `#todotxtStore` label, reads/writes content. Auto-creates the backing note on first save.
- Created `src/todoWidget.jsx` — Preact widget using `defineWidget` from `trilium:preact`. Mounts in the right-pane. Displays tasks with checkboxes, priority badges, context/project tags. Supports toggling visibility via `Ctrl+Shift+T` and a hide button.
- Created `install.js` — Node.js ETAPI installer. Reads source files from `src/`, creates the note tree in Trilium with correct types, MIME, and labels (`#widget`, `#run=frontendStartup`, `#codeMime`, `#todotxtStore`).
- Created `PLAN.md` — Architecture overview, component map, data flow, UI layout, toggle mechanism, task operations, format support, implementation phases, API reference.
- Created `JOURNAL.md` (this file).
- Created `README.md` — Plugin description, features, requirements, installation, usage, development, license.
- Initialized git repository with `.gitignore`.

## 2026-06-16 — Phase 2: Parser Module

- Refined `todoTxtParser.js`:
  - Fixed `key:value` parsing to only match tokens with exactly one colon (prevents URL false positives)
  - Added `.filter.byContext()`, `.filter.byProject()`, `.filter.byPriority()`, `.filter.byCompleted()`
  - Added `.uniqueContexts()`, `.uniqueProjects()` for filter bar aggregation
  - Added `.sort.byPriority()`, `.sort.byCreationDate()`, `.sort.byCompletionDate()`
  - Added `.addTask()`, `.toggleComplete()`, `.removeTask()` convenience functions
  - Properly handles empty input, lines with no metadata, multiple spaces
- Updated `todoWidget.jsx`:
  - Uses new parser utilities (toggleComplete, addTask, removeTask)
  - Added inline edit via double-click
  - Added delete button per task
  - Added filter bar with clickable context/project tags
  - Added sort selector (priority / created date)
  - Added task counter (incomplete / total)
  - Shows creation dates on tasks

## 2026-06-16 — Phase 3: Store Module

- Refined `todoStore.js`:
  - Caches note ID across calls to avoid repeated `searchForNotes` queries
  - `invalidateCache()` to force re-resolve if the backing note is replaced
  - `saveDebounced(content)` — 500ms debounce for batching rapid task changes
  - `onChange(fn)` — subscribe to store changes; returns unsubscribe function
  - Error handling with try/catch on all API calls
  - Auto-creates backing note with `#todotxtStore` label when missing
- Updated `todoWidget.jsx`:
  - Switched from `save()` to `saveDebounced()` for instant UI + async persistence
  - Added `loading` state with "Loading…" indicator
  - Subscribes to `todoStore.onChange` for reactivity on external changes
  - Unsubscribes on unmount
  - Reloads tasks when toggling widget back visible

## 2026-06-16 — Phase 4: Widget Shell

- Added embedded CSS via `<style>` block in widget JSX
- Styles use Trilium CSS variables (`--main-background-color`, `--main-text-color`, `--muted-text-color`, `--main-border-color`, `--accented-background-color`, `--input-*`, `--hover-*`, `--button-*`, `--primary-button-*`) for full dark/light theme compatibility
- Priority color coding: A=red, B=orange, C=yellow (via `data-prio` attribute)
- Contexts styled in blue (`--context-color`), projects in green
- Completed tasks: line-through + muted color
- Hover effects on task rows (background highlight, delete button fade-in)
- Focus states on input and select fields
- Transitions on interactive elements (hover, filter pills, button fade)

## 2026-06-16 — Phase 5: Task List

- Fixed stale closure bug: all mutation handlers now read latest tasks via `useRef` or use functional updater `setTasks(prev => ...)`, preventing lost updates on rapid clicks
- Refactored `saveTasks` to accept either a direct value or an updater function for correct batching
- Completed tasks always sort to bottom (via `sort.byCompleted`) regardless of primary sort key
- Differentiated empty states: "No tasks yet." (fresh list) vs "No matching tasks." (filter with no results)
- Displayed `key:value` metadata (e.g. `due:2024-01-01`) as small tags — `due:` colored red, others muted
- Clicking context/project tags in task rows now sets the filter (not just in filter bar)
- Added `.completed` opacity reduction on completed task rows
- Extracted `sortDisplayed()` helper for cleaner render logic

## 2026-06-16 — Phase 6: Mutations

- Replaced `prompt()` dialog with proper inline input field for editing — double-click to edit, Enter/blur to commit, Escape to cancel; auto-focuses + selects text on open
- `addTask` now auto-sets today's creation date if none was specified in the input
- `toggleComplete` preserves priority as `pri:A` key:value on completion; restores it from `pri:` on un-complete
- Added `updateTask(task, fields)` utility for partial task updates
- `pri:` key:value hidden from display (round-trip preservation only)
- All mutation handlers use `tasksRef.current.indexOf(task)` for reliable index lookup across filtered/sorted lists
- `saveTasks` consistently uses updater function pattern for correct batching

## 2026-06-16 — Phase 7: Filter & Sort

- Added text search input filtering by description (case-insensitive)
- Added priority filter pills (`A`/`B`/`C`/`D`/`E`) — only shown for priorities present in tasks
- Filter bar now shows when any priority pills exist, not just contexts/projects
- Search and tag filters stack (can search + filter by context simultaneously)
- Added `sortDisplayed` support for: priority filter, text search, `completed` sort key
- Footer shows filtered count in accent color when filter/search is active: `3 / 10 (2)`
- Added "Completed" sort option (sorts by completion date, newest first)
- Escape key clears search then filter (if search is empty), skips when focused in search input or inline edit
- Added refs for filter/search/editing state to avoid re-registering the keydown listener

## 2026-06-16 — Phase 8: Toggle Persistence

- Widget visibility persisted to `localStorage` key `todotxt-visible`
- Initial state read from `localStorage.getItem('todotxt-visible') !== 'false'` (defaults to visible)
- `useEffect` syncs `visible` state to localStorage on every change (toggle button and `Ctrl+Shift+T` both covered)

## 2026-06-16 — Phase 9: Polish & Edge-case Hardening

- Added `loadError` state with try/catch in `loadTasks` so backend failures don't silently break the widget; error shown in red inline
- Added `aria-label` attributes on icon-only buttons (Show, Hide, Delete) for screen reader accessibility
- Added `:focus-visible` outlines on widget container, filter pills, context/project tags, delete button, and inputs for keyboard navigation
- Added `word-break: break-word` and `max-width: 200px` on `.todotxt-kv` and `.todotxt-date` to prevent long values from overflowing
- Added `e.preventDefault()` on search Escape handler to prevent unwanted browser defaults
- Added subtle transition on inline edit input focus state

## 2026-06-16 — install.js: Fix for Trilium v0.102.2 ETAPI

- Replaced broken `GET /etapi/notes/{id}/children` (404 in v0.102.2) with `GET /etapi/notes/{id}` → `childNoteIds` + per-child fetches
- Added `findChildByTitle(parentId, title)` helper for cross-version child lookups
- Added `resolveFolderChain(parts)` to walk/create nested folder paths under root
- Changed parent from root-level "Trilium todo.txt" to Root → Trilium → Trilium todo.txt
- Removed `PUT /etapi/notes/{id}/labels` calls (endpoint doesn't exist; labels set via `attributes` on creation only)
- Changed default port from 7777 to 37840 to match this Trilium instance

## 2026-06-16 — Fix: RightPanelWidget wrapper + JSX setup reminder

- Added `RightPanelWidget` import from `"trilium:preact"` and wrapped the widget body in `<RightPanelWidget id="todotxt" title="todo.txt">` so the widget properly registers as a named section in the right sidebar (required by Trilium's new layout)
- Removed manual `.todotxt-header` section (the section header is now provided by `RightPanelWidget`)
- Moved the hide button to the footer area
- Added JSX setup reminder to install.js output

## 2026-06-16 — Fix: Bundle child notes as widget children (fixes ReferenceError)

- **Root cause**: `todoTxtParser` and `todoStore` were created as siblings of `TodoTXT Widget` under the parent folder. Trilium's bundle system only evaluates **direct children** of the running script/widget note as globals — sibling notes are not loaded.
- **Fix**: Restructured `install.js` to create `todoTxtParser` and `todoStore` as children of `TodoTXT Widget`, not as siblings. Added `#scriptBundle` label to the widget note to explicitly signal bundle module loading.
- **Migration**: The installer now detects orphaned sibling copies and warns the user to delete them manually.
- Updated `README.md` manual install table to include `#scriptBundle`.
- Updated `PLAN.md` component structure tree to show correct parent → widget → children hierarchy.

## 2026-06-16 — Fix: Frontend API methods not available (getNoteContent, putNoteContent, registerKeyboardShortcut)

- **Root cause**: The widget bundle used backend-only API methods (`api.getNoteContent`, `api.putNoteContent`) and `api.registerKeyboardShortcut` which doesn't exist on the frontend API in this Trilium version.
- **`todoStore.js`**:
  - `load()`: Replaced `api.getNoteContent(noteId)` with `api.getNote(noteId)` + `note.getNoteComplement()` — matches the official word count widget pattern.
  - `save()`: Replaced `api.createNote` and `api.putNoteContent` (frontend-only) with `api.runOnBackend` — the correct way to execute backend code from the frontend. Note creation uses `api.createTextNote` + `api.createLabel` on the backend; updates use `api.putNoteContent` on the backend.
- **`todoWidget.jsx`**: Replaced `api.registerKeyboardShortcut("Ctrl+Shift+T", ...)` with native `window.addEventListener('keydown', ...)` checking for `Ctrl+Shift+T` — more portable and works across all Trilium versions.

## 2026-06-18 — Archive feature

- **`todoStore.js`**: Added `ARCHIVE_LABEL`, `_archiveNoteId`, `_archiveAppendPromise`, `_resolveArchiveNote()`, `loadArchive()`, `saveArchive()`, `appendToArchive()` for managing a separate `#todotxtArchive` backing note.
- `appendToArchive()` uses promise chaining to serialize concurrent appends, preventing race conditions.
- **`todoWidget.jsx`**: Added archive UI:
  - **Archive button** (📥) on each completed task row — calls `archiveTask(idx)` to remove from active and append to archive.
  - **Archive all** footer link — archives all completed tasks at once.
  - **Archived** footer link — opens dedicated archive view that loads from `#todotxtArchive` note.
  - **Archive view** — shows archived tasks with **Unarchive** (↩️) and **Delete** (✕) options.
  - `unarchiveTask()` moves the task back to the active note (sets `completed=false`).
- Updated `README.md`, `PLAN.md`, `install.js` to document the archive backing note.

## 2026-06-18 — Fix: `@` context symbol conflict with CKEditor mentions

- **Problem**: Trilium's CKEditor converts `@text` into a note mention link (`<a class="ck-link">`), which would corrupt `@context` strings in todo.txt if a user opened the backing note in Trilium's text editor.
- **Solution**: Changed backing notes (`#todotxtStore`, `#todotxtArchive`) from `type: "text"` to `type: "code"` with `mime: "text/plain"`. Code notes use CodeMirror (no CKEditor), so `@` is never interpreted. The widget's programmatic read/write path (`getNoteComplement()`/`setContent()`) works identically for both types.
- **Updated**:
  - `install.js`: Creates backing notes as `type: "code"` with `mime: "text/plain"`
  - `src/todoStore.js`: Auto-creation fallback uses `api.createNewNote()` instead of `api.createTextNote()`, passing `type: "code"` and `mime: "text/plain"`
  - `README.md`, `PLAN.md`: Updated note type documentation
- Commit: *(pending)*

## 2026-06-18 — Fix: Lenient priority parsing (allow `(A)task` without space)

- **Problem**: The priority regex `/^\(([A-Z])\)\s+/` required one or more spaces after the closing `)`, so `(A)my todo` was not recognized as having priority `A` — the entire string was treated as a description.
- **Fix**: Changed `\s+` to `\s*` in `src/todoTxtParser.js:139` so `(A)task` and `(A) task` are both parsed correctly. Serialization (`serializeTask`) already emits the canonical `(A) desc` format via `parts.join(' ')`.

## 2026-06-18 — Feature: Inline due date picker

- Added inline `<input type="date">` editing for `due:YYYY-MM-DD` key-values in each task row.
- **UX**: Click an existing `due:date` tag → it turns into a date picker; pick a date → saved immediately. Tasks without a due date show a faded `+due` clickable to add one. Clearing the date input removes the `due:` key-value.
- **Implementation** (`src/todoWidget.jsx`):
  - Added `editingDueIdx` state + `editDueRef` to track which task's due date is being edited.
  - `commitDue()` updates `task.keyValues.due` or removes it if cleared.
  - Renders three states per row: date input (editing), clickable `due:date` tag (set), faded `+due` (unset).
  - Auto-focuses the date picker when entering edit mode.
  - `<input type="date">` uses the `.todotxt-edit-input` class, consistent with the description inline editor.

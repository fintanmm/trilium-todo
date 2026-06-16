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

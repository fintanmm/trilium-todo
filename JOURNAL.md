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

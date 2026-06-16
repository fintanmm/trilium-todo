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

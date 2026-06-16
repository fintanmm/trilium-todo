# Trilium todo.txt Plugin — Plan

A [Trilium Notes](https://github.com/TriliumNext/Trilium) widget plugin that implements the [todo.txt](http://todotxt.org/) format.

## Architecture

A **Preact widget** (`trilium:preact`) mounted in the **right-pane** that reads/writes todo.txt content from a dedicated Trilium text note. The note stores raw todo.txt; the widget parses, renders, and persists it.

## Component Structure (note tree in Trilium)

```
📁 TodoTXT Widget          (JS frontend, #widget, run=frontendStartup)
  ├── 📄 todoTxtParser.js  (parse/serialize todo.txt lines)
  ├── 📄 todoStore.js      (read/write the backing text note via api)
  └── 📄 todoWidget.jsx    (Preact UI — the widget itself)
```

Backing storage: a single text note (e.g. `📄 todo.txt`) with a `#todotxtStore` label so the widget can find it by attribute search.

## Data Flow

1. **Startup** — Widget finds the `#todotxtStore` note via `api.searchForNote('#todotxtStore')`.
2. **Read** — Load note content, parse into structured task objects.
3. **Render** — Display tasks in a list with priority colors, completion toggles, project/context badges.
4. **Write** — On any change (add/complete/edit), serialize back to todo.txt format and save to note via `api.putNoteContent()`.
5. **Reactivity** — Re-render only the affected parts.

## Widget UI Layout

```
┌──────────────────────────┐
│ [+ Add task]  [Hide ☰]   │  <- header bar
├──────────────────────────┤
│ ☐ (A) Call Mom @phone    │  <- task rows with checkbox,
│ ☑ x 2024-01-01 Done +Proj│     priority, project/context tags
│ ☐ Write report +Work     │
├──────────────────────────┤
│ 📋 @phone  🔖 +Work      │  <- filter bar (clickable tags)
└──────────────────────────┘
```

## Toggle Visibility

- **Button** — A toggle button inside the widget header (`[Hide]` / `[Show]`).
- **Keyboard shortcut** — `Ctrl+Shift+T` via `api.registerKeyboardShortcut` toggles a CSS class on the widget's root element (`display: none/block`).
- **Persistence** — Toggle state stored in `api.putToLocalStorage`.

## Task Operations

| Action       | Implementation                                               |
| ------------ | ------------------------------------------------------------ |
| **Add**      | Input field at top; on Enter, prepend new line to todo.txt   |
| **Complete** | Click checkbox -> prepend `x YYYY-MM-DD` and remove priority |
| **Delete**   | Click trash icon -> remove line                              |
| **Edit**     | Double-click task -> inline text input                       |
| **Filter**   | Click context/project tag -> filter displayed tasks          |
| **Sort**     | By priority (A-Z), by project, by creation date              |

## todo.txt Format Support

- **Parse** — Regex per line to extract: completion status, priority `(A)–(Z)`, completion date, creation date, description, `@contexts`, `+projects`, `key:value` pairs.
- **Serialize** — Reconstruct lines from task objects in spec order: `x`? -> priority? -> completion date? -> creation date? -> description + contexts + projects + key:values.
- **Edge cases** — Lines with no priority, no dates, duplicate contexts, malformed lines (render as-is).

## Implementation Phases

| Phase                   | What                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| **1. Project scaffold** | Create note structure, `#widget` label, `run=frontendStartup`    |
| **2. Parser module**    | `todoTxtParser.js` — parse/serialize functions                   |
| **3. Store module**     | `todoStore.js` — find backing note, read/write content           |
| **4. Widget shell**     | Basic Preact widget rendering in right-pane                      |
| **5. Task list**        | Render parsed tasks with checkboxes, priorities, tags            |
| **6. Mutations**        | Add, complete, delete, edit inline                               |
| **7. Filter & sort**    | Tag-based filtering, priority/project sorting                    |
| **8. Toggle**           | Keyboard shortcut `Ctrl+Shift+T`, hide/show button, localStorage |
| **9. Polish**           | CSS styling matching Trilium theme, responsive                   |

## Key Trilium APIs

- `defineWidget` from `trilium:preact`
- `api.searchForNote('#label')` to find backing note
- `api.getNoteContent(noteId)` / `api.putNoteContent(noteId, content)`
- `api.registerKeyboardShortcut(shortcut, actionId, handler)`
- `api.putToLocalStorage` / `api.getFromLocalStorage` for toggle state
- `parentWidget: "right-pane"` for placement

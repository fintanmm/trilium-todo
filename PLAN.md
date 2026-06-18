# Trilium todo.txt Plugin — Plan

A [Trilium Notes](https://github.com/TriliumNext/Trilium) widget plugin that implements the [todo.txt](http://todotxt.org/) format.

## Architecture

A **Preact widget** (`trilium:preact`) mounted in the **right-pane** that reads/writes todo.txt content from a dedicated Trilium text note. The note stores raw todo.txt; the widget parses, renders, and persists it.

## Component Structure (note tree in Trilium)

```
📁 Trilium                    (text folder — created automatically)
  └── 📁 Trilium todo.txt       (text folder — container for plugin notes)
        └── 📁 TodoTXT Widget   (code, JSX frontend, #widget, #run=frontendStartup, #codeMime=text/x-trilium-jsx)
              ├── 📄 todoTxtParser  (code JS, #codeMime=application/javascript;env=frontend — parsed as global `todoTxtParser`)
              └── 📄 todoStore      (code JS, #codeMime=application/javascript;env=frontend — parsed as global `todoStore`)

Backing storage:
📄 todo.txt                   (text, #todotxtStore — located at root level)
📄 todo.txt (archive)         (text, #todotxtArchive — located at root level)
```

> **Important**: Bundle child notes (`todoTxtParser`, `todoStore`) must be **direct children** of the widget note, not siblings. Trilium evaluates child notes first and exposes their `module.exports` as globals named after the note title (spaces stripped).

## Data Flow

1. **Startup** — Widget finds the `#todotxtStore` note via `api.searchForNote('#todotxtStore')`.
2. **Read** — Load note content, parse into structured task objects.
3. **Render** — Display tasks in a list with priority colors, completion toggles, project/context badges.
4. **Write** — On any change (add/complete/edit), serialize back to todo.txt format and save to note via `api.runOnBackend` with `note.setContent()`.
5. **Archive** — Completed tasks can be archived to a separate `#todotxtArchive` note. Archiving removes the task from the active note and appends it to the archive. Archive view supports unarchive and permanent delete.
6. **Reactivity** — Re-render only the affected parts.

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
| **Archive**  | Archive button on completed tasks -> moves to `#todotxtArchive` note |
| **View archive** | Click "Archived" in footer -> loads archive note in separate view |
| **Unarchive** | In archive view -> moves task back to active note            |
| **Filter**   | Click context/project tag -> filter displayed tasks          |
| **Sort**     | By priority (A-Z), by project, by creation date              |

## todo.txt Format Support

- **Parse** — Regex per line to extract: completion status, priority `(A)–(Z)`, completion date, creation date, description, `@contexts`, `+projects`, `key:value` pairs.
- **Serialize** — Reconstruct lines from task objects in spec order: `x`? -> priority? -> completion date? -> creation date? -> description + contexts + projects + key:values.
- **Edge cases** — Lines with no priority, no dates, duplicate contexts, malformed lines (render as-is).

## Implementation Phases

| Phase                   | What                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| **1. Project scaffold** | Create note structure: `TodoTXT Widget` with `#widget`, `#run=frontendStartup`, `#codeMime=text/x-trilium-jsx`; child notes `todoTxtParser` and `todoStore` under the widget with `#codeMime=application/javascript;env=frontend` |
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
- `api.searchForNote('#label')` to find backing and archive notes
- `api.runOnBackend(fn, args)` to execute backend code (create notes, set content, set labels)
- Backend `note.setContent(content)` / `note.setLabel(name)` for persistence
- `api.registerKeyboardShortcut(shortcut, actionId, handler)`
- `api.putToLocalStorage` / `api.getFromLocalStorage` for toggle state
- `parentWidget: "right-pane"` for placement

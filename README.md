# Trilium todo.txt Plugin

A [Trilium Notes](https://github.com/TriliumNext/Trilium) widget plugin that implements the [todo.txt](http://todotxt.org/) format.

## Features

- **todo.txt compliant** — Full format support: priorities `(A)`, projects `+Project`, contexts `@context`, creation/completion dates, `key:value` metadata.
- **Preact widget** — Mounts in the right-pane using Trilium's modern widget framework.
- **Toggle visibility** — Hide/show the widget with a button or `Ctrl+Shift+T` keyboard shortcut.
- **Task management** — Add, complete, delete, and filter tasks inline.
- **Inline edit** — Double-click any task to edit its text inline.
- **Due date picker** — Click a `due:date` tag to change it, or click `+due` to add one. Cleared input removes the due date.
- **Due date filters** — Filter tasks by Today, Tomorrow, Next 7 days, or Overdue.
- **Due today toast** — On load, shows a notification listing tasks due today.
- **Multi-filter** — Combine context, project, priority, and text search simultaneously.
- **Priority filter pills** — Clickable A/B/C/D/E pills for priority filtering.
- **Text search** — Search across task descriptions with live filtering.
- **Sort options** — Sort by priority, creation date, completion date, or completed status.
- **Task counter** — Shows incomplete / total tasks, plus filtered count when a filter is active.
- **Archive** — Completed tasks can be archived to a separate note for a clean working list, with unarchive and permanent delete options.
- **Persistent storage** — Tasks are stored in standard text notes inside Trilium (active and archive).
- **Dark/light theme** — Automatically adapts to Trilium's theme via CSS variables.

## Requirements

- TriliumNext (or Trilium v0.101+) with JSX support enabled
- Node.js 14+ (for the installer script)
- ETAPI token (for automated installation)

## Installation

### Automated (ETAPI)

```bash
export TRILIUM_URL=http://localhost:8080
export TRILIUM_TOKEN=your-etapi-token
node install.js
```

Get your ETAPI token from Trilium → Options → ETAPI.

### Manual

Create the following notes in Trilium:

| Note                              | Type              | Labels                                                            | Content                  |
| --------------------------------- | ----------------- | ----------------------------------------------------------------- | ------------------------ |
| `TodoTXT Widget`                  | JS frontend (JSX) | `#widget`, `#run=frontendStartup`, `#codeMime=text/x-trilium-jsx` | `src/todoWidget.jsx`     |
| `todoTxtParser` (child of widget) | JS frontend       | `#codeMime=application/javascript;env=frontend`                   | `src/todoTxtParser.js`   |
| `todoStore` (child of widget)     | JS frontend       | `#codeMime=application/javascript;env=frontend`                   | `src/todoStore.js`       |
| `todo.txt`                        | Code (`text/plain`) | `#todotxtStore`                                                  | (empty, will hold tasks) |
| `todo.txt (archive)`              | Code (`text/plain`) | `#todotxtArchive`                                                | (empty)                  |

The resulting note tree must look like this (bundle child notes as direct children of the widget):

```
Trilium todo.txt (text folder)
└── TodoTXT Widget (code JSX, #widget, #run=frontendStartup, #codeMime=text/x-trilium-jsx)
    ├── todoTxtParser (code JS, #codeMime=application/javascript;env=frontend)
    └── todoStore (code JS, #codeMime=application/javascript;env=frontend)

todo.txt (code, text/plain, #todotxtStore — anywhere in the tree)
todo.txt (archive) (code, text/plain, #todotxtArchive — anywhere in the tree)
```

After creating the notes, reload Trilium.

## Usage

- The widget appears in the right sidebar.
- Type a task in the input field and press Enter to add it. Supports `(A)` priority, `@context`, `+project`, `due:YYYY-MM-DD`, and any `key:value` metadata.
- Click the checkbox to complete a task. Completed tasks sort to the bottom.
- **Double-click** a task to edit its text inline (Enter to save, Escape to cancel).
- **Due dates**: click a `due:date` tag to open a date picker, or click `+due` to add one. Clearing the input removes the date.
- **Archive**: click the archive button (📥) on a completed task, or use **Archive all** in the footer. Click **Archived** in the footer to view, unarchive, or permanently delete archived tasks.
- **Filter bar**: click context (`@work`) or project (`+project`) tags in any task to filter by them. Use priority pills (A/B/C/D/E) to filter by priority.
- **Search**: type in the search box to filter tasks by description text.
- **Multi-filter**: all filters stack — you can search while filtering by context, project, and priority simultaneously.
- **Sort**: use the sort dropdown to reorder by priority, creation date, completion date, or completed status.
- **Today toast**: when the widget loads, a toast lists any tasks due today.
- **Due date filters**: click **Today**, **Tomorrow**, **Next 7** or **Overdue** in the footer to filter by due date range.
- **Task counter**: the footer shows `incomplete / total` tasks. When a filter is active, it shows `filtered / total (incomplete)`.
- Click the hide button or press `Ctrl+Shift+T` to toggle the widget.

## Development

```
├── .github/workflows/release.yml   # CI/CD: builds zip and publishes GitHub Release on tag push
├── install.js                       # ETAPI installer
├── package.json                     # Build scripts (npm run build)
└── src/
    ├── todoWidget.jsx               # Preact widget (main entry)
    ├── todoTxtParser.js             # todo.txt parse/serialize module
    └── todoStore.js                 # Note storage module
```

### Build

```bash
npm run build
```

Creates `dist/trilium-todo.zip` containing `src/`, `install.js`, and `README.md`.

### Release

```bash
git tag v0.2.0 && git push --tags
```

GitHub Actions builds the zip and creates a GitHub Release with auto-generated release notes.

## License

MIT

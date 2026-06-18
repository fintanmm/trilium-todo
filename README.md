# Trilium todo.txt Plugin

A [Trilium Notes](https://github.com/TriliumNext/Trilium) widget plugin that implements the [todo.txt](http://todotxt.org/) format.

## Features

- **todo.txt compliant** — Full format support: priorities `(A)`, projects `+Project`, contexts `@context`, creation/completion dates, `key:value` metadata.
- **Preact widget** — Mounts in the right-pane using Trilium's modern widget framework.
- **Toggle visibility** — Hide/show the widget with a button or `Ctrl+Shift+T` keyboard shortcut.
- **Task management** — Add, complete, delete, and filter tasks inline.
- **Persistent storage** — Tasks are stored in a standard text note inside Trilium.
- **Archive** — Completed tasks can be archived to a separate note for a clean working list.

## Requirements

- TriliumNext (or Trilium v0.101+) with JSX support enabled
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
- Type a task in the input field and press Enter to add it.
- Click the checkbox to complete a task.
- Click the archive button (📥) on a completed task to archive it, or use **Archive all** in the footer.
- Click **Archived** in the footer to view, unarchive, or permanently delete archived tasks.
- Click the hide button or press `Ctrl+Shift+T` to toggle the widget.
- Use `@context` and `+project` tags in task descriptions for filtering.

## Development

```
src/
├── todoWidget.jsx      # Preact widget (main entry)
├── todoTxtParser.js    # todo.txt parse/serialize module
└── todoStore.js        # Note storage module
install.js              # ETAPI installer
PLAN.md                 # Architecture plan
JOURNAL.md              # Work journal
```

## License

MIT

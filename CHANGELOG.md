# Changelog

## [0.3.0] — 2026-06-30

### Added
- CHANGELOG.md with full project history

### Changed
- Release zip now includes CHANGELOG.md
- README synced with all features (due date picker, filters, sort, inline edit, search, toasts, multi-filter)

### Fixed
- Release workflow: replaced `softprops/action-gh-release` with `gh release create` to fix 403 permission error

## [0.2.0] — 2026-06-30

### Added
- CI/CD: GitHub Actions release workflow (builds zip on tag push)
- `package.json` with `npm run build` for creating release artifacts
- Overdue due-date filter

### Fixed
- `todoStore.appendToArchive` no longer depends on `todoTxtParser` being a global — injected as a parameter instead

### Changed
- README fully synced with current features and build/release process

## [0.1.0] — 2026-06-16 – 2026-06-26

### Features
- **todo.txt format support** — priorities `(A)`, projects `+Project`, contexts `@Context`, creation/completion dates, `key:value` metadata
- **Preact widget** — mounts in Trilium's right-pane via `RightPanelWidget`
- **Toggle visibility** — hide/show with button or `Ctrl+Shift+T`
- **Task management** — add, complete, delete, inline edit (double-click)
- **Inline due date picker** — click `due:date` to edit, click `+due` to add
- **Due date filters** — Today, Tomorrow, Next 7 days
- **Due today toast** — notification listing tasks due today on load
- **Archive** — completed tasks archive to separate note, with unarchive and permanent delete
- **Multi-filter** — combine context, project, priority, and text search simultaneously
- **Priority filter pills** — clickable A/B/C/D/E filters
- **Text search** — live filtering by description
- **Sort** — by priority, creation date, completion date, or completed status
- **Task counter** — incomplete/total with filtered count
- **Clear search button** — one-click reset of the search field
- **Dark/light theme** — adapts to Trilium's CSS variables
- **Custom checkbox styling** — uses Trilium's `tn-checkbox` class
- **`sort.byCompleted`** — completed tasks always sort to bottom

### Fixes
- Use frontend-safe APIs (`getNote` + `getNoteComplement`, `runOnBackend`)
- Use `require`/`module.exports` for Trilium bundle compatibility
- Restructure installer so child notes are direct children of the widget
- Use `RightPanelWidget` wrapper for proper sidebar registration
- Use non-destructured `require` for `buildJsx` regex compatibility
- Use functional updaters everywhere for correct save batching
- Use `parse-merge-serialize` in `appendToArchive` for reliable line breaks
- Installer: fix for Trilium v0.102.2 ETAPI, URL parsing, protocol handling
- Lenient priority parsing — `(A)task` now recognized without space

### Documentation
- README, PLAN, JOURNAL updated with bundle/API fixes and archive feature

## [0.0.1] — 2026-06-16

- Initial project scaffold, parser, store, widget shell with CSS

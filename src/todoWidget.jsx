const preact = require("trilium:preact");
const { defineWidget, useState, useEffect, useRef } = preact;

const styles = `
.todotxt-widget {
  font-size: var(--main-font-size);
  color: var(--main-text-color);
  padding: 12px;
  user-select: none;
}
.todotxt-widget:focus-visible {
  outline: 2px solid var(--active-item-background-color);
  outline-offset: -2px;
  border-radius: 6px;
}

/* ── Header ── */
.todotxt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--main-border-color);
  margin-bottom: 10px;
}
.todotxt-header strong {
  font-size: 0.82em;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted-text-color);
  opacity: 0.85;
}
.todotxt-header button {
  color: var(--muted-text-color);
  padding: 3px 8px;
  transition: all 0.15s;
}
.todotxt-header button:hover {
  color: var(--main-text-color);
}

/* ── Add task input ── */
.todotxt-add {
  margin-bottom: 6px;
}
.todotxt-add input {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
}

/* ── Search input ── */
.todotxt-search {
  margin-bottom: 6px;
}
.todotxt-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.todotxt-search-wrap input {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 28px 6px 10px;
}
.todotxt-search-clear {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-text-color);
  opacity: 0.5;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
}
.todotxt-search-clear:hover {
  opacity: 1;
  color: var(--main-text-color);
  background: var(--accented-background-color);
}

/* ── Filter pills ── */
.todotxt-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 2px 0 8px;
}
.todotxt-filters button {
  background: var(--accented-background-color);
  border: 1px solid transparent;
  color: var(--muted-text-color);
  font-size: 0.75em;
  padding: 3px 9px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
}
.todotxt-filters button:focus-visible {
  outline: 2px solid var(--active-item-background-color);
  outline-offset: 2px;
}
.todotxt-filters button:hover {
  color: var(--main-text-color);
  border-color: var(--main-border-color);
  transform: translateY(-1px);
}
.todotxt-filters button.active {
  background: var(--primary-button-background-color);
  color: var(--primary-button-text-color);
  border-color: var(--primary-button-border-color);
  font-weight: 600;
}
.todotxt-filters .todotxt-clear {
  background: none;
  color: var(--muted-text-color);
  font-size: 0.78em;
  padding: 3px 7px;
  opacity: 0.6;
}
.todotxt-filters .todotxt-clear:hover {
  opacity: 1;
  transform: none;
}

/* ── Task list body ── */
.todotxt-body {
  max-height: 50vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--main-border-color) transparent;
}
.todotxt-body::-webkit-scrollbar {
  width: 5px;
}
.todotxt-body::-webkit-scrollbar-thumb {
  background: var(--main-border-color);
  border-radius: 3px;
}

/* ── Empty state ── */
.todotxt-empty {
  color: var(--muted-text-color);
  font-size: 0.82em;
  text-align: center;
  padding: 20px 0;
  opacity: 0.7;
  line-height: 1.6;
}

/* ── Task row ── */
.todotxt-task {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 7px 8px 7px 6px;
  border-radius: 6px;
  transition: background 0.15s, opacity 0.2s;
  font-size: 0.85em;
  line-height: 1.5;
  border-left: 3px solid transparent;
  margin-bottom: 2px;
}
.todotxt-task:hover {
  background: var(--hover-item-background-color);
  border-left-color: var(--main-border-color);
}
.todotxt-task.completed {
  opacity: 0.6;
  border-left-color: transparent !important;
}

/* ── Checkbox ── */
.todotxt-task input[type="checkbox"] {
  width: 15px;
  height: 15px;
}
.todotxt-task label.tn-checkbox {
  flex-shrink: 0;
  width: 1em;
  height: 1.15em;
  padding: 0 !important;
  cursor: pointer;
}

/* ── Priority badge ── */
.todotxt-prio {
  font-weight: 700;
  font-size: 0.7em;
  flex-shrink: 0;
  min-width: 20px;
  text-align: center;
  padding: 1px 5px;
  border-radius: 4px;
  color: #fff;
  letter-spacing: 0.3px;
}
.todotxt-prio[data-prio="A"] { background: #c0392b; }
.todotxt-prio[data-prio="B"] { background: #d35400; }
.todotxt-prio[data-prio="C"] { background: #f39c12; color: #222; }
.todotxt-prio[data-prio="D"] { background: #7f8c8d; }
.todotxt-prio[data-prio="E"] { background: #95a5a6; }

/* ── Task description ── */
.todotxt-desc {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  cursor: default;
  padding: 1px 0;
}
.todotxt-desc:hover {
  color: var(--main-text-color);
}

.todotxt-done {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  text-decoration: line-through;
  color: var(--muted-text-color);
  font-style: italic;
}

/* ── Inline edit ── */
.todotxt-edit-input {
  flex: 1;
  min-width: 0;
  background: var(--input-background-color);
  color: var(--input-text-color);
  border: 1.5px solid var(--active-item-background-color);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.85em;
  font-family: inherit;
  outline: none;
  box-shadow: 0 0 0 2px rgba(67, 133, 245, 0.12);
}

/* ── Context tag ── */
.todotxt-ctx {
  color: #5dade2;
  font-size: 0.78em;
  flex-shrink: 0;
  cursor: pointer;
  padding: 0 3px;
  border-radius: 3px;
  transition: background 0.12s;
}
.todotxt-ctx:hover {
  background: rgba(93, 173, 226, 0.12);
  text-decoration: none;
}

/* ── Project tag ── */
.todotxt-proj {
  color: #58d68d;
  font-size: 0.78em;
  flex-shrink: 0;
  cursor: pointer;
  padding: 0 3px;
  border-radius: 3px;
  transition: background 0.12s;
}
.todotxt-proj:hover {
  background: rgba(88, 214, 141, 0.12);
  text-decoration: none;
}

/* ── Date ── */
.todotxt-date {
  color: var(--muted-text-color);
  font-size: 0.75em;
  flex-shrink: 0;
  word-break: break-word;
  opacity: 0.8;
  padding: 1px 0;
}

/* ── Key-value metadata ── */
.todotxt-kv {
  color: var(--muted-text-color);
  font-size: 0.75em;
  flex-shrink: 0;
  background: var(--accented-background-color);
  padding: 1px 6px;
  border-radius: 4px;
  word-break: break-word;
  max-width: 200px;
  font-family: monospace;
  line-height: 1.6;
}
.todotxt-kv.due {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  font-weight: 600;
}

/* ── Delete button ── */
.todotxt-del {
  color: var(--muted-text-color);
  padding: 1px 4px;
  font-size: 1.1em;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, transform 0.15s;
  flex-shrink: 0;
  line-height: 1;
}
.todotxt-del:focus-visible {
  opacity: 0.8;
  outline: 1px solid var(--active-item-background-color);
}
.todotxt-task:hover .todotxt-del {
  opacity: 0.5;
}
.todotxt-task .todotxt-del:hover {
  opacity: 1;
  color: #e74c3c;
  transform: scale(1.15);
}

/* ── Footer ── */
.todotxt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--main-border-color);
  margin-top: 8px;
  font-size: 0.76em;
  color: var(--muted-text-color);
}
.todotxt-footer select {
  font-size: 0.82em;
}

/* ── Collapsed state ── */
.todotxt-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px !important;
  cursor: pointer;
  border: 1.5px dashed var(--main-border-color);
  border-radius: 8px;
  transition: all 0.2s;
  opacity: 0.65;
  margin: 4px;
}
.todotxt-collapsed:hover {
  opacity: 1;
  border-color: var(--active-item-background-color);
  background: var(--hover-item-background-color);
}
.todotxt-collapsed button {
  background: var(--accented-background-color);
  border: none;
  color: var(--muted-text-color);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 1.1em;
  transition: all 0.15s;
}
.todotxt-collapsed:hover button {
  color: var(--main-text-color);
  background: var(--primary-button-background-color);
  color: var(--primary-button-text-color);
}
.todotxt-collapsed-label {
  font-size: 0.78em;
  color: var(--muted-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ── Archive button ── */
.todotxt-archive-btn {
  color: var(--muted-text-color);
  padding: 1px 4px;
  font-size: 1em;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, transform 0.15s;
  flex-shrink: 0;
  line-height: 1;
}
.todotxt-archive-btn:focus-visible {
  opacity: 0.8;
  outline: 1px solid var(--active-item-background-color);
}
.todotxt-task:hover .todotxt-archive-btn {
  opacity: 0.5;
}
.todotxt-task .todotxt-archive-btn:hover {
  opacity: 1;
  color: #2980b9;
  transform: scale(1.15);
}
.todotxt-task .todotxt-del:hover {
  opacity: 1;
  color: #e74c3c;
  transform: scale(1.15);
}

/* ── Footer link ── */
.todotxt-footer-link {
  cursor: pointer;
  padding: 1px 4px;
  border-radius: 4px;
  transition: background 0.15s;
  color: var(--muted-text-color);
}
.todotxt-footer-link:hover {
  background: var(--accented-background-color);
  color: var(--main-text-color);
}
`;

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function sortDisplayed(tasks, sortKey, filters, searchQuery) {
  let result = [...tasks];

  for (const f of filters) {
    if (f.type === "context") {
      result = todoTxtParser.filter.byContext(result, f.value);
    } else if (f.type === "project") {
      result = todoTxtParser.filter.byProject(result, f.value);
    } else if (f.type === "priority") {
      result = todoTxtParser.filter.byPriority(result, f.value);
    } else if (f.type === "due") {
      const today = dateOffset(0);
      if (f.value === "today") {
        result = result.filter((t) => t.keyValues.due === today);
      } else if (f.value === "tomorrow") {
        result = result.filter((t) => t.keyValues.due === dateOffset(1));
      } else if (f.value === "next-week") {
        const end = dateOffset(6);
        result = result.filter((t) => t.keyValues.due && t.keyValues.due >= today && t.keyValues.due <= end);
      } else if (f.value === "overdue") {
        result = result.filter((t) => t.keyValues.due && t.keyValues.due < today);
      }
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter((t) => t.description.toLowerCase().includes(q));
  }

  result = todoTxtParser.sort.byCompleted(result, false);
  if (sortKey === "priority") result = todoTxtParser.sort.byPriority(result);
  else if (sortKey === "created")
    result = todoTxtParser.sort.byCreationDate(result, true);
  else if (sortKey === "completed")
    result = todoTxtParser.sort.byCompletionDate(result, true);

  return result;
}

module.exports = defineWidget({
  parent: "right-pane",
  position: 100,

  render() {
    const [tasks, setTasks] = useState([]);
    const [visible, setVisible] = useState(
      () => localStorage.getItem("todotxt-visible") !== "false",
    );
    const [filter, setFilter] = useState([]);
    const [sortKey, setSortKey] = useState("priority");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editingDueIdx, setEditingDueIdx] = useState(null);
    const [viewArchived, setViewArchived] = useState(false);
    const [archivedTasks, setArchivedTasks] = useState([]);

    const tasksRef = useRef(tasks);
    const filterRef = useRef(filter);
    const searchRefState = useRef(searchQuery);
    const editingRef = useRef(editingIdx);
    useEffect(() => {
      tasksRef.current = tasks;
    }, [tasks]);
    useEffect(() => {
      filterRef.current = filter;
    }, [filter]);
    useEffect(() => {
      searchRefState.current = searchQuery;
    }, [searchQuery]);
    useEffect(() => {
      editingRef.current = editingIdx;
    }, [editingIdx]);
    const editRef = useRef(null);
    const editDueRef = useRef(null);
    const searchRef = useRef(null);
    const notifiedDueToday = useRef(false);

    useEffect(() => {
      localStorage.setItem("todotxt-visible", visible);
    }, [visible]);

    const loadTasks = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const content = await todoStore.load();
        setTasks(todoTxtParser.parse(content));
      } catch (e) {
        console.error("Failed to load tasks:", e);
        setLoadError("Failed to load tasks.");
      }
      setLoading(false);
    };

    useEffect(() => {
      loadTasks();
      const unsub = todoStore.onChange(() => {
        if (visible) loadTasks();
      });
      function onKeyDown(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'T' || e.key === 't')) {
          e.preventDefault();
          setVisible((v) => !v);
          return;
        }
        if (
          e.key === "Escape" &&
          editingRef.current === null &&
          !e.target.closest(".todotxt-search") &&
          !e.target.closest(".todotxt-edit-input")
        ) {
          if (searchRefState.current) {
            setSearchQuery("");
            searchRef.current?.focus();
          } else if (filterRef.current.length) setFilter([]);
        }
      }
      window.addEventListener("keydown", onKeyDown);
      return () => {
        unsub();
        window.removeEventListener("keydown", onKeyDown);
      };
    }, [visible]);

    useEffect(() => {
      if (editingIdx !== null && editRef.current) {
        editRef.current.focus();
        editRef.current.select();
      }
    }, [editingIdx]);

    useEffect(() => {
      if (editingDueIdx !== null && editDueRef.current) {
        editDueRef.current.focus();
      }
    }, [editingDueIdx]);

    useEffect(() => {
      if (loading || tasks.length === 0) return;

      const today = dateOffset(0);
      const dueTodayTasks = tasks.filter(
        t => !t.completed && t.keyValues.due === today
      );

      if (dueTodayTasks.length > 0 && !notifiedDueToday.current) {
        notifiedDueToday.current = true;
        const msg = `${dueTodayTasks.length} task${dueTodayTasks.length > 1 ? 's' : ''} due today`;
        api.showMessage(msg);
      }
    }, [tasks, loading]);

    const saveTasks = (updater) => {
      setTasks((prev) => {
        const next = updater(prev);
        todoStore.saveDebounced(todoTxtParser.serialize(next));
        return next;
      });
    };

    function toggleFilter(type, value) {
      setFilter((prev) => {
        const idx = prev.findIndex((f) => f.type === type && f.value === value);
        if (idx !== -1) return prev.filter((_, i) => i !== idx);
        if (type === "due") return [...prev.filter((f) => f.type !== "due"), { type, value }];
        return [...prev, { type, value }];
      });
    }

    function findRealIdx(task) {
      return tasksRef.current.indexOf(task);
    }

    function commitEdit(task, newDesc) {
      const idx = findRealIdx(task);
      if (idx === -1) return;
      setEditingIdx(null);
      if (!newDesc.trim()) return;
      saveTasks((prev) => {
        const next = [...prev];
        next[idx] = todoTxtParser.updateTask(next[idx], {
          description: newDesc.trim(),
        });
        return next;
      });
    }

    function commitDue(task, newDate) {
      const idx = findRealIdx(task);
      if (idx === -1) return;
      setEditingDueIdx(null);
      const oldDate = task.keyValues.due || null;
      if (newDate === oldDate) return;
      saveTasks((prev) => {
        const next = [...prev];
        const updated = { ...next[idx], keyValues: { ...next[idx].keyValues } };
        if (newDate) {
          updated.keyValues.due = newDate;
        } else {
          delete updated.keyValues.due;
        }
        next[idx] = updated;
        return next;
      });
    }

    function archiveTask(idx) {
      const task = tasksRef.current[idx];
      if (!task || !task.completed) return;
      const line = todoTxtParser.serialize([task]);
      saveTasks((prev) => {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      todoStore.appendToArchive(line, todoTxtParser);
    }

    function archiveAllCompleted() {
      const completed = tasksRef.current.filter((t) => t.completed);
      if (completed.length === 0) return;
      const lines = todoTxtParser.serialize(completed);
      saveTasks((prev) => prev.filter((t) => !t.completed));
      todoStore.appendToArchive(lines, todoTxtParser);
    }

    async function unarchiveTask(idx) {
      const task = archivedTasks[idx];
      if (!task) return;
      const updated = [...archivedTasks];
      updated.splice(idx, 1);
      setArchivedTasks(updated);
      todoStore.saveArchive(todoTxtParser.serialize(updated));
      const unarchived = todoTxtParser.toggleComplete(
        { ...task, keyValues: { ...task.keyValues } }
      );
      saveTasks((prev) => [...prev, unarchived]);
    }

    function deleteArchivedTask(idx) {
      const updated = [...archivedTasks];
      updated.splice(idx, 1);
      setArchivedTasks(updated);
      todoStore.saveArchive(todoTxtParser.serialize(updated));
    }

    async function loadAndViewArchived() {
      const content = await todoStore.loadArchive();
      setArchivedTasks(todoTxtParser.parse(content));
      setViewArchived(true);
    }

    if (!visible) {
      return (
        <div>
          <style>{styles}</style>
          <div
            class="todotxt-widget todotxt-collapsed"
            onClick={() => {
              setVisible(true);
              loadTasks();
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setVisible(true);
                loadTasks();
              }
            }}
          >
            <button
              class="bx bx-list-check"
              aria-label="Show todo.txt"
              title="Show todo.txt"
            ></button>
            <span class="todotxt-collapsed-label">Show todo.txt</span>
          </div>
        </div>
      );
    }

    if (viewArchived) {
      return (
        <div>
          <style>{styles}</style>
          <div class="todotxt-widget" tabIndex={-1}>
            <div class="todotxt-header">
              <strong>todo.txt Archive</strong>
              <button
                class="bx bx-list-ul tn-low-profile"
                onClick={() => setViewArchived(false)}
                aria-label="Back to active tasks"
                title="Active tasks"
                style="margin-left: auto;"
              ></button>
              <button
                class="bx bx-hide tn-low-profile"
                onClick={() => setVisible(false)}
                aria-label="Hide"
                title="Hide"
              ></button>
            </div>
            <div class="todotxt-body">
              {archivedTasks.length === 0 && (
                <p class="todotxt-empty">No archived tasks.</p>
              )}
              {archivedTasks.map((task, i) => (
                <div class="todotxt-task" key={i}>
                  <span class="todotxt-done">{task.description}</span>
                  {task.completionDate && (
                    <span class="todotxt-date">{task.completionDate}</span>
                  )}
                  {task.creationDate && (
                    <span class="todotxt-date">{task.creationDate}</span>
                  )}
                  <button
                    class="bx bx-archive-out tn-low-profile todotxt-archive-btn"
                    aria-label="Unarchive"
                    title="Unarchive"
                    onClick={() => unarchiveTask(i)}
                  />
                  <button
                    class="bx bx-x tn-low-profile todotxt-del"
                    aria-label="Delete archived task"
                    title="Delete"
                    onClick={() => deleteArchivedTask(i)}
                  />
                </div>
              ))}
            </div>
            <div class="todotxt-footer">
              <span>{archivedTasks.length} archived</span>
            </div>
          </div>
        </div>
      );
    }

    const displayed = sortDisplayed(tasks, sortKey, filter, searchQuery);
    const hasFilter = filter.length > 0 || searchQuery !== "";
    const allContexts = todoTxtParser.uniqueContexts(tasks);
    const allProjects = todoTxtParser.uniqueProjects(tasks);
    const prios = ["A", "B", "C", "D", "E"].filter((p) =>
      tasks.some((t) => t.priority === p),
    );
    const filteredCount = displayed.length;
    const hasDueTasks = tasks.some((t) => t.keyValues.due);

    return (
      <div>
        <style>{styles}</style>
        <div class="todotxt-widget" tabIndex={-1}>
          <div class="todotxt-header">
            <strong>todo.txt</strong>
            <button
              class="bx bx-hide tn-low-profile"
              onClick={() => setVisible(false)}
              aria-label="Hide"
              title="Hide"
              style="margin-left: auto;"
            ></button>
          </div>

          <div class="todotxt-add">
            <input
              type="text"
              placeholder="+ Add task…"
               onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  const text = e.target.value;
                  e.target.value = "";
                  saveTasks((prev) => todoTxtParser.addTask(prev, text));
                }
              }}
            />
          </div>

          <div class="todotxt-search">
            <div class="todotxt-search-wrap">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onInput={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setSearchQuery("");
                    e.target.blur();
                  }
                }}
              />
              {searchQuery !== "" && (
                <button
                  class="tn-low-profile todotxt-search-clear"
                  aria-label="Clear search"
                  title="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    searchRef.current?.focus();
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {(allContexts.length > 0 ||
            allProjects.length > 0 ||
            prios.length > 0 ||
            hasDueTasks) && (
            <div class="todotxt-filters">
              {allContexts.map((c) => (
                <button
                  class={
                    filter.some((f) => f.value === c && f.type === "context")
                      ? "active"
                      : ""
                  }
                  onClick={() => toggleFilter("context", c)}
                >
                  @{c}
                </button>
              ))}
              {allProjects.map((p) => (
                <button
                  class={
                    filter.some((f) => f.value === p && f.type === "project")
                      ? "active"
                      : ""
                  }
                  onClick={() => toggleFilter("project", p)}
                >
                  +{p}
                </button>
              ))}
              {prios.map((p) => (
                <button
                  class={
                    filter.some((f) => f.value === p && f.type === "priority")
                      ? "active"
                      : ""
                  }
                  onClick={() => toggleFilter("priority", p)}
                >
                  {p}
                </button>
              ))}
              {hasDueTasks && (
                <>
                  <span style="width:1px;background:var(--main-border-color);margin:2px 4px" />
                  {["today", "tomorrow", "next-week", "overdue"].map((range) => (
                    <button
                      class={
                        filter.some((f) => f.type === "due" && f.value === range)
                          ? "active"
                          : ""
                      }
                      onClick={() => toggleFilter("due", range)}
                    >
                      {range === "next-week" ? "Next 7 days" : range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </>
              )}
              {hasFilter && (
                <button
                  class="todotxt-clear"
                  onClick={() => {
                    setFilter([]);
                    setSearchQuery("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div class="todotxt-body">
            {loading && <p class="todotxt-empty">Loading…</p>}
            {loadError && (
              <p class="todotxt-empty" style="color:#e74c3c">
                {loadError}
              </p>
            )}
            {!loading && !loadError && displayed.length === 0 && (
              <p class="todotxt-empty">
                {hasFilter ? "No matching tasks." : "No tasks yet."}
              </p>
            )}
            {displayed.map((task, i) => {
              const realIdx = findRealIdx(task);
              const isEditing = editingIdx === realIdx;

              return (
                <div
                  class={{ "todotxt-task": true, completed: task.completed }}
                  key={realIdx}
                >
                  <label class="tn-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onClick={() => {
                        const idx = findRealIdx(task);
                        if (idx === -1) return;
                        saveTasks((prev) => {
                          const next = [...prev];
                          next[idx] = todoTxtParser.toggleComplete(next[idx]);
                          return next;
                        });
                      }}
                    />
                  </label>
                  {task.priority && !task.completed && (
                    <span class="todotxt-prio" data-prio={task.priority}>
                      {task.priority}
                    </span>
                  )}

                  {isEditing ? (
                    <input
                      class="todotxt-edit-input"
                      ref={editRef}
                      defaultValue={task.description}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(task, e.target.value);
                        else if (e.key === "Escape") setEditingIdx(null);
                      }}
                      onBlur={(e) => commitEdit(task, e.target.value)}
                    />
                  ) : (
                    <span
                      class={task.completed ? "todotxt-done" : "todotxt-desc"}
                      onDblClick={() => setEditingIdx(realIdx)}
                    >
                      {task.description}
                    </span>
                  )}

                  {task.contexts.map((c) => (
                    <span
                      class="todotxt-ctx"
                      onClick={() => toggleFilter("context", c)}
                    >
                      @{c}
                    </span>
                  ))}
                  {task.projects.map((p) => (
                    <span
                      class="todotxt-proj"
                      onClick={() => toggleFilter("project", p)}
                    >
                      +{p}
                    </span>
                  ))}
                  {editingDueIdx === realIdx ? (
                    <span style="display:inline-flex;align-items:center;gap:3px">
                      <input
                        class="todotxt-edit-input"
                        type="date"
                        ref={editDueRef}
                        defaultValue={task.keyValues.due || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          commitDue(task, val || null);
                        }}
                        onBlur={() => setEditingDueIdx(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditingDueIdx(null);
                          }
                        }}
                        style="width:135px"
                      />
                      <span
                        class="bx bx-calendar tn-low-profile"
                        onClick={() => editDueRef.current?.showPicker()}
                        aria-label="Pick date"
                        title="Pick date"
                      />
                    </span>
                  ) : task.keyValues.due ? (
                    <span
                      class="todotxt-kv due"
                      onClick={() => setEditingDueIdx(realIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingDueIdx(realIdx);
                      }}
                    >
                      due:{task.keyValues.due}
                    </span>
                  ) : (
                    <span
                      class="todotxt-kv"
                      onClick={() => setEditingDueIdx(realIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingDueIdx(realIdx);
                      }}
                      style="cursor:pointer;opacity:0.3;font-size:0.75em"
                    >
                      +due
                    </span>
                  )}
                  {Object.entries(task.keyValues)
                    .filter(([k]) => k !== "pri" && k !== "due")
                    .map(([k, v]) => (
                      <span class={{ "todotxt-kv": true, [k]: true }}>
                        {k}:{v}
                      </span>
                    ))}
                  {task.creationDate && (
                    <span class="todotxt-date">{task.creationDate}</span>
                  )}
                  {task.completed && (
                    <button
                      class="bx bx-archive-in tn-low-profile todotxt-archive-btn"
                      aria-label="Archive task"
                      title="Archive"
                      onClick={() => {
                        const idx = findRealIdx(task);
                        if (idx === -1) return;
                        archiveTask(idx);
                      }}
                    />
                  )}
                  <button
                    class="bx bx-x tn-low-profile todotxt-del"
                    aria-label="Delete task"
                    title="Delete"
                    onClick={() => {
                      const idx = findRealIdx(task);
                      if (idx === -1) return;
                      saveTasks((prev) => todoTxtParser.removeTask(prev, idx));
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div class="todotxt-footer">
            <span>
              {tasks.filter((t) => !t.completed).length} / {tasks.length}
              {hasFilter && (
                <span style="margin-left:4px;color:var(--primary-button-background-color)">
                  ({filteredCount})
                </span>
              )}
              {tasks.some(t => t.completed) && (
                <>
                  <span style="margin:0 5px">·</span>
                  <span class="todotxt-footer-link" onClick={archiveAllCompleted}>
                    Archive all
                  </span>
                </>
              )}
              <span style="margin:0 5px">·</span>
              <span class="todotxt-footer-link" onClick={loadAndViewArchived}>
                Archived
              </span>
            </span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="priority">Priority</option>
              <option value="created">Created</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
    );
  },
});

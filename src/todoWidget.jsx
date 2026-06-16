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
  background: none;
  border: none;
  color: var(--muted-text-color);
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}
.todotxt-header button:hover {
  background: var(--accented-background-color);
  color: var(--main-text-color);
}

/* ── Add task input ── */
.todotxt-add {
  margin-bottom: 6px;
}
.todotxt-add input {
  width: 100%;
  box-sizing: border-box;
  background: var(--input-background-color);
  color: var(--input-text-color);
  border: 1.5px solid var(--main-border-color);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 0.85em;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.todotxt-add input:focus {
  border-color: var(--active-item-background-color);
  box-shadow: 0 0 0 2px rgba(67, 133, 245, 0.15);
}
.todotxt-add input::placeholder {
  color: var(--muted-text-color);
  opacity: 0.7;
}

/* ── Search input ── */
.todotxt-search {
  margin-bottom: 6px;
}
.todotxt-search input {
  width: 100%;
  box-sizing: border-box;
  background: var(--input-background-color);
  color: var(--input-text-color);
  border: 1.5px solid var(--main-border-color);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.82em;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.todotxt-search input:focus {
  border-color: var(--active-item-background-color);
  box-shadow: 0 0 0 2px rgba(67, 133, 245, 0.15);
}
.todotxt-search input::placeholder {
  color: var(--muted-text-color);
  opacity: 0.7;
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
  margin-top: 3px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: var(--primary-button-background-color);
  width: 15px;
  height: 15px;
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
  background: none;
  border: none;
  color: var(--muted-text-color);
  cursor: pointer;
  padding: 1px 4px;
  font-size: 1.1em;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, transform 0.15s;
  flex-shrink: 0;
  border-radius: 4px;
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
  background: var(--input-background-color);
  color: var(--input-text-color);
  border: 1px solid var(--main-border-color);
  border-radius: 5px;
  padding: 3px 6px;
  font-size: 0.82em;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.todotxt-footer select:focus {
  border-color: var(--active-item-background-color);
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
`;

function sortDisplayed(tasks, sortKey, filter, searchQuery) {
  let result = [...tasks];

  if (filter) {
    if (filter.type === "context") {
      result = todoTxtParser.filter.byContext(result, filter.value);
    } else if (filter.type === "project") {
      result = todoTxtParser.filter.byProject(result, filter.value);
    } else if (filter.type === "priority") {
      result = todoTxtParser.filter.byPriority(result, filter.value);
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
    const [filter, setFilter] = useState(null);
    const [sortKey, setSortKey] = useState("priority");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [editingIdx, setEditingIdx] = useState(null);

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
    const searchRef = useRef(null);

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
          } else if (filterRef.current) setFilter(null);
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

    const saveTasks = (updater) => {
      if (typeof updater === "function") {
        setTasks((prev) => {
          const next = updater(prev);
          todoStore.saveDebounced(todoTxtParser.serialize(next));
          return next;
        });
      } else {
        setTasks(updater);
        todoStore.saveDebounced(todoTxtParser.serialize(updater));
      }
    };

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

    const displayed = sortDisplayed(tasks, sortKey, filter, searchQuery);
    const hasFilter = filter !== null || searchQuery !== "";
    const allContexts = todoTxtParser.uniqueContexts(tasks);
    const allProjects = todoTxtParser.uniqueProjects(tasks);
    const prios = ["A", "B", "C", "D", "E"].filter((p) =>
      tasks.some((t) => t.priority === p),
    );
    const filteredCount = displayed.length;

    return (
      <div>
        <style>{styles}</style>
        <div class="todotxt-widget" tabIndex={-1}>
          <div class="todotxt-header">
            <strong>todo.txt</strong>
            <button
              class="bx bx-hide"
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
                  const next = todoTxtParser.addTask(
                    tasksRef.current,
                    e.target.value,
                  );
                  saveTasks(next);
                  e.target.value = "";
                }
              }}
            />
          </div>

          <div class="todotxt-search">
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
          </div>

          {(allContexts.length > 0 ||
            allProjects.length > 0 ||
            prios.length > 0) && (
            <div class="todotxt-filters">
              {allContexts.map((c) => (
                <button
                  class={
                    filter?.value === c && filter?.type === "context"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      filter?.value === c && filter?.type === "context"
                        ? null
                        : { type: "context", value: c },
                    )
                  }
                >
                  @{c}
                </button>
              ))}
              {allProjects.map((p) => (
                <button
                  class={
                    filter?.value === p && filter?.type === "project"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      filter?.value === p && filter?.type === "project"
                        ? null
                        : { type: "project", value: p },
                    )
                  }
                >
                  +{p}
                </button>
              ))}
              {prios.map((p) => (
                <button
                  class={
                    filter?.value === p && filter?.type === "priority"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      filter?.value === p && filter?.type === "priority"
                        ? null
                        : { type: "priority", value: p },
                    )
                  }
                >
                  {p}
                </button>
              ))}
              {hasFilter && (
                <button
                  class="todotxt-clear"
                  onClick={() => {
                    setFilter(null);
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
                      onClick={() => setFilter({ type: "context", value: c })}
                    >
                      @{c}
                    </span>
                  ))}
                  {task.projects.map((p) => (
                    <span
                      class="todotxt-proj"
                      onClick={() => setFilter({ type: "project", value: p })}
                    >
                      +{p}
                    </span>
                  ))}
                  {Object.entries(task.keyValues)
                    .filter(([k]) => k !== "pri")
                    .map(([k, v]) => (
                      <span class={{ "todotxt-kv": true, [k]: true }}>
                        {k}:{v}
                      </span>
                    ))}
                  {task.creationDate && (
                    <span class="todotxt-date">{task.creationDate}</span>
                  )}
                  <button
                    class="bx bx-x todotxt-del"
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

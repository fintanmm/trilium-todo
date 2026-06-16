import { defineWidget, useState, useEffect, useCallback } from "trilium:preact";

const styles = `
.todotxt-widget {
  font-size: var(--main-font-size);
  color: var(--main-text-color);
  padding: 8px;
  user-select: none;
}

.todotxt-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--main-border-color);
  margin-bottom: 6px;
}

.todotxt-header strong {
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--muted-text-color);
}

.todotxt-header button {
  background: none;
  border: none;
  color: var(--muted-text-color);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
}
.todotxt-header button:hover {
  background: var(--accented-background-color);
  color: var(--main-text-color);
}

.todotxt-add input {
  width: 100%;
  box-sizing: border-box;
  background: var(--input-background-color);
  color: var(--input-text-color);
  border: 1px solid var(--main-border-color);
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.85em;
  outline: none;
}
.todotxt-add input:focus {
  border-color: var(--active-item-background-color);
}
.todotxt-add input::placeholder {
  color: var(--muted-text-color);
}

.todotxt-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 0;
}
.todotxt-filters button {
  background: var(--accented-background-color);
  border: 1px solid transparent;
  color: var(--muted-text-color);
  font-size: 0.78em;
  padding: 2px 7px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.todotxt-filters button:hover {
  color: var(--main-text-color);
  border-color: var(--main-border-color);
}
.todotxt-filters button.active {
  background: var(--primary-button-background-color);
  color: var(--primary-button-text-color);
  border-color: var(--primary-button-border-color);
}
.todotxt-filters .todotxt-clear {
  background: none;
  color: var(--muted-text-color);
  font-size: 0.8em;
  padding: 2px 5px;
}

.todotxt-body {
  max-height: 50vh;
  overflow-y: auto;
}

.todotxt-empty {
  color: var(--muted-text-color);
  font-size: 0.85em;
  text-align: center;
  padding: 16px 0;
}

.todotxt-task {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 4px 4px 4px 2px;
  border-radius: 4px;
  transition: background 0.12s;
  font-size: 0.85em;
  line-height: 1.5;
}
.todotxt-task:hover {
  background: var(--hover-item-background-color);
}

.todotxt-task input[type="checkbox"] {
  margin-top: 3px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: var(--primary-button-background-color);
}

.todotxt-prio {
  font-weight: bold;
  font-size: 0.78em;
  flex-shrink: 0;
  min-width: 16px;
  text-align: center;
  padding: 1px 0;
  border-radius: 3px;
}
.todotxt-prio[data-prio="A"] { color: #e74c3c; }
.todotxt-prio[data-prio="B"] { color: #e67e22; }
.todotxt-prio[data-prio="C"] { color: #f1c40f; }

.todotxt-desc {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  cursor: default;
}
.todotxt-desc:hover {
  text-decoration: underline dotted var(--muted-text-color);
}

.todotxt-done {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  text-decoration: line-through;
  color: var(--muted-text-color);
}

.todotxt-ctx {
  color: #3498db;
  font-size: 0.85em;
  flex-shrink: 0;
  cursor: pointer;
}
.todotxt-ctx:hover { text-decoration: underline; }

.todotxt-proj {
  color: #2ecc71;
  font-size: 0.85em;
  flex-shrink: 0;
  cursor: pointer;
}
.todotxt-proj:hover { text-decoration: underline; }

.todotxt-date {
  color: var(--muted-text-color);
  font-size: 0.78em;
  flex-shrink: 0;
}

.todotxt-del {
  background: none;
  border: none;
  color: var(--muted-text-color);
  cursor: pointer;
  padding: 0 2px;
  font-size: 1em;
  opacity: 0;
  transition: opacity 0.12s;
  flex-shrink: 0;
}
.todotxt-task:hover .todotxt-del {
  opacity: 0.6;
}
.todotxt-task .todotxt-del:hover {
  opacity: 1;
  color: #e74c3c;
}

.todotxt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px solid var(--main-border-color);
  margin-top: 6px;
  font-size: 0.78em;
  color: var(--muted-text-color);
}

.todotxt-footer select {
  background: var(--input-background-color);
  color: var(--input-text-color);
  border: 1px solid var(--main-border-color);
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 0.85em;
  outline: none;
}
.todotxt-footer select:focus {
  border-color: var(--active-item-background-color);
}
`;

export default defineWidget({
  parent: "right-pane",
  position: 100,

  render() {
    const [tasks, setTasks] = useState([]);
    const [visible, setVisible] = useState(true);
    const [filter, setFilter] = useState(null);
    const [sortKey, setSortKey] = useState('priority');
    const [loading, setLoading] = useState(true);

    const loadTasks = useCallback(async () => {
      setLoading(true);
      const content = await todoStore.load();
      setTasks(todoTxtParser.parse(content));
      setLoading(false);
    }, []);

    useEffect(() => {
      loadTasks();
      api.registerKeyboardShortcut('Ctrl+Shift+T', 'todotxt-toggle', () => setVisible(v => !v));
      const unsub = todoStore.onChange(() => {
        if (visible) loadTasks();
      });
      return unsub;
    }, [visible]);

    const saveTasks = useCallback((newTasks) => {
      setTasks(newTasks);
      todoStore.saveDebounced(todoTxtParser.serialize(newTasks));
    }, []);

    if (!visible) {
      return (
        <div>
          <style>{styles}</style>
          <div class="todotxt-widget" style="padding: 8px; cursor: pointer;" onClick={() => {
            setVisible(true);
            loadTasks();
          }}>
            <button class="bx bx-list-check" title="Show todo.txt"></button>
          </div>
        </div>
      );
    }

    let displayed = [...tasks];
    if (filter) {
      if (filter.type === 'context') {
        displayed = todoTxtParser.filter.byContext(displayed, filter.value);
      } else if (filter.type === 'project') {
        displayed = todoTxtParser.filter.byProject(displayed, filter.value);
      }
    }
    if (sortKey === 'priority') displayed = todoTxtParser.sort.byPriority(displayed);
    else if (sortKey === 'created') displayed = todoTxtParser.sort.byCreationDate(displayed, true);

    const allContexts = todoTxtParser.uniqueContexts(tasks);
    const allProjects = todoTxtParser.uniqueProjects(tasks);

    return (
      <div>
        <style>{styles}</style>
        <div class="todotxt-widget">
          <div class="todotxt-header">
            <strong>todo.txt</strong>
            <button class="bx bx-hide" onClick={() => setVisible(false)} title="Hide" style="margin-left: auto;"></button>
          </div>

          <div class="todotxt-add">
            <input type="text" placeholder="+ Add task…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const next = todoTxtParser.addTask(tasks, e.target.value);
                  saveTasks(next);
                  e.target.value = '';
                }
              }}
            />
          </div>

          {(allContexts.length > 0 || allProjects.length > 0) && (
            <div class="todotxt-filters">
              {allContexts.map(c => (
                <button class={filter?.value === c && filter?.type === 'context' ? 'active' : ''}
                  onClick={() => setFilter(filter?.value === c ? null : { type: 'context', value: c })}>
                  @{c}
                </button>
              ))}
              {allProjects.map(p => (
                <button class={filter?.value === p && filter?.type === 'project' ? 'active' : ''}
                  onClick={() => setFilter(filter?.value === p ? null : { type: 'project', value: p })}>
                  +{p}
                </button>
              ))}
              {filter && <button class="todotxt-clear" onClick={() => setFilter(null)}>✕</button>}
            </div>
          )}

          <div class="todotxt-body">
            {loading && <p class="todotxt-empty">Loading…</p>}
            {!loading && displayed.length === 0 && <p class="todotxt-empty">No tasks yet.</p>}
            {displayed.map((task, i) => (
              <div class="todotxt-task" key={i}>
                <input type="checkbox" checked={task.completed}
                  onClick={() => {
                    const next = [...tasks];
                    const idx = tasks.indexOf(task);
                    next[idx] = todoTxtParser.toggleComplete(task);
                    saveTasks(next);
                  }}
                />
                {task.priority && !task.completed && (
                  <span class="todotxt-prio" data-prio={task.priority}>{task.priority}</span>
                )}
                <span class={task.completed ? 'todotxt-done' : 'todotxt-desc'}
                  onDblClick={() => {
                    const newDesc = prompt('Edit task:', task.description);
                    if (newDesc !== null && newDesc.trim()) {
                      const next = [...tasks];
                      const idx = tasks.indexOf(task);
                      next[idx] = { ...next[idx], description: newDesc.trim() };
                      saveTasks(next);
                    }
                  }}>
                  {task.description}
                </span>
                {task.contexts.map(c => <span class="todotxt-ctx">@{c}</span>)}
                {task.projects.map(p => <span class="todotxt-proj">+{p}</span>)}
                {task.creationDate && <span class="todotxt-date">{task.creationDate}</span>}
                <button class="bx bx-x todotxt-del" title="Delete"
                  onClick={() => {
                    const next = todoTxtParser.removeTask(tasks, tasks.indexOf(task));
                    saveTasks(next);
                  }}
                />
              </div>
            ))}
          </div>

          <div class="todotxt-footer">
            <span>{tasks.filter(t => !t.completed).length} / {tasks.length}</span>
            <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
});

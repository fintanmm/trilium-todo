import { defineWidget, useState, useEffect, useCallback } from "trilium:preact";

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
        <div class="todotxt-widget" style="padding: 8px; cursor: pointer;" onClick={() => {
          setVisible(true);
          loadTasks();
        }}>
          <button class="bx bx-list-check" title="Show todo.txt"></button>
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
      <div class="todotxt-widget">
        <div class="todotxt-header">
          <strong>todo.txt</strong>
          <button class="bx bx-hide" onClick={() => setVisible(false)} title="Hide widget" style="margin-left: auto;"></button>
        </div>

        <div class="todotxt-add">
          <input type="text" placeholder="+ Add task…"
            onKeyDown={async (e) => {
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
              {task.priority && !task.completed && <span class="todotxt-prio">{task.priority}</span>}
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
    );
  }
});

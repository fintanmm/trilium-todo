import { defineWidget, useState, useEffect, useCallback } from "trilium:preact";

export default defineWidget({
  parent: "right-pane",
  position: 100,

  render() {
    const [tasks, setTasks] = useState([]);
    const [visible, setVisible] = useState(true);

    const loadTasks = useCallback(async () => {
      const content = await todoStore.load();
      setTasks(todoTxtParser.parse(content));
    }, []);

    useEffect(() => {
      loadTasks();

      api.registerKeyboardShortcut(
        'Ctrl+Shift+T',
        'todotxt-toggle',
        () => setVisible(v => !v)
      );
    }, []);

    const saveTasks = useCallback(async (newTasks) => {
      setTasks(newTasks);
      await todoStore.save(todoTxtParser.serialize(newTasks));
    }, []);

    if (!visible) {
      return (
        <div class="todotxt-widget" style="padding: 8px; cursor: pointer;" onClick={() => setVisible(true)}>
          <button class="bx bx-list-check" title="Show todo.txt"></button>
        </div>
      );
    }

    return (
      <div class="todotxt-widget">
        <div class="todotxt-header">
          <strong>todo.txt</strong>
          <button class="bx bx-hide" onClick={() => setVisible(false)} title="Hide"></button>
        </div>
        <div class="todotxt-body">
          {tasks.length === 0 && <p style="color: var(--muted-text);">No tasks yet.</p>}
          {tasks.map((task, i) => (
            <div class="todotxt-task" key={i}>
              <input
                type="checkbox"
                checked={task.completed}
                onClick={() => {
                  const next = [...tasks];
                  next[i] = { ...next[i], completed: !next[i].completed };
                  if (next[i].completed) {
                    next[i].completionDate = new Date().toISOString().slice(0, 10);
                  } else {
                    next[i].completionDate = null;
                  }
                  saveTasks(next);
                }}
              />
              {task.priority && <span class="todotxt-prio">{task.priority}</span>}
              <span class={task.completed ? 'todotxt-done' : ''}>{task.description}</span>
              {task.contexts.map(c => <span class="todotxt-ctx">@{c}</span>)}
              {task.projects.map(p => <span class="todotxt-proj">+{p}</span>)}
            </div>
          ))}
        </div>
        <div class="todotxt-add">
          <input
            type="text"
            placeholder="+ Add task…"
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const newTask = todoTxtParser.parse(e.target.value.trim())[0] || {
                  description: e.target.value.trim()
                };
                await saveTasks([...tasks, newTask]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
    );
  }
});

module.exports = {
  parse(content) {
    return (content || '')
      .split('\n')
      .filter(l => l.trim())
      .map(line => parseLine(line));
  },

  serialize(tasks) {
    return tasks
      .map(t => serializeTask(t))
      .join('\n');
  },

  addTask(tasks, text) {
    const parsed = parseLine(text.trim());
    return [...tasks, parsed];
  },

  toggleComplete(task) {
    const next = { ...task };
    if (next.completed) {
      next.completed = false;
      next.completionDate = null;
    } else {
      next.completed = true;
      next.completionDate = today();
    }
    return next;
  },

  removeTask(tasks, index) {
    return tasks.filter((_, i) => i !== index);
  },

  filter: {
    byContext(tasks, context) {
      return tasks.filter(t => t.contexts.includes(context));
    },
    byProject(tasks, project) {
      return tasks.filter(t => t.projects.includes(project));
    },
    byPriority(tasks, priority) {
      return tasks.filter(t => t.priority === priority);
    },
    byCompleted(tasks, completed = true) {
      return tasks.filter(t => t.completed === completed);
    }
  },

  uniqueContexts(tasks) {
    const set = new Set();
    for (const t of tasks) for (const c of t.contexts) set.add(c);
    return [...set].sort();
  },

  uniqueProjects(tasks) {
    const set = new Set();
    for (const t of tasks) for (const p of t.projects) set.add(p);
    return [...set].sort();
  },

  sort: {
    byPriority(tasks) {
      return [...tasks].sort((a, b) => {
        const pa = a.priority ? a.priority.charCodeAt(0) : 99;
        const pb = b.priority ? b.priority.charCodeAt(0) : 99;
        return pa - pb;
      });
    },
    byCreationDate(tasks, desc = false) {
      return [...tasks].sort((a, b) => {
        if (!a.creationDate) return desc ? -1 : 1;
        if (!b.creationDate) return desc ? 1 : -1;
        return desc
          ? b.creationDate.localeCompare(a.creationDate)
          : a.creationDate.localeCompare(b.creationDate);
      });
    },
    byCompletionDate(tasks, desc = false) {
      return [...tasks].sort((a, b) => {
        if (!a.completionDate) return desc ? -1 : 1;
        if (!b.completionDate) return desc ? 1 : -1;
        return desc
          ? b.completionDate.localeCompare(a.completionDate)
          : a.completionDate.localeCompare(b.completionDate);
      });
    }
  }
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseLine(line) {
  const task = {
    raw: line,
    completed: false,
    priority: null,
    completionDate: null,
    creationDate: null,
    description: '',
    contexts: [],
    projects: [],
    keyValues: {}
  };

  let rest = line;

  const completedMatch = rest.match(/^x\s+/);
  if (completedMatch) {
    task.completed = true;
    rest = rest.slice(completedMatch[0].length);
  }

  const prioMatch = rest.match(/^\(([A-Z])\)\s+/);
  if (prioMatch) {
    task.priority = prioMatch[1];
    rest = rest.slice(prioMatch[0].length);
  }

  if (task.completed) {
    const d = rest.match(/^(\d{4}-\d{2}-\d{2})\s+/);
    if (d) {
      task.completionDate = d[1];
      rest = rest.slice(d[0].length);
    }
  }

  const d = rest.match(/^(\d{4}-\d{2}-\d{2})\s+/);
  if (d) {
    task.creationDate = d[1];
    rest = rest.slice(d[0].length);
  }

  const tokens = rest.split(/\s+/).filter(Boolean);
  task.description = tokens.filter(t => {
    if (t.startsWith('@')) {
      task.contexts.push(t.slice(1));
      return false;
    }
    if (t.startsWith('+')) {
      task.projects.push(t.slice(1));
      return false;
    }
    const colons = (t.match(/:/g) || []).length;
    if (colons === 1) {
      const [k, v] = t.split(':');
      if (k && v) {
        task.keyValues[k] = v;
        return false;
      }
    }
    return true;
  }).join(' ');

  return task;
}

function serializeTask(task) {
  const parts = [];

  if (task.completed) {
    parts.push('x');
    if (task.completionDate) parts.push(task.completionDate);
  }

  if (task.priority && !task.completed) {
    parts.push(`(${task.priority})`);
  }

  if (task.creationDate) parts.push(task.creationDate);
  parts.push(task.description);

  for (const ctx of task.contexts) parts.push(`@${ctx}`);
  for (const proj of task.projects) parts.push(`+${proj}`);
  for (const [k, v] of Object.entries(task.keyValues)) parts.push(`${k}:${v}`);

  return parts.join(' ');
}

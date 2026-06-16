module.exports = {
  parse(content) {
    const lines = content.split('\n').filter(l => l.trim());
    return lines.map(line => parseLine(line));
  },

  serialize(tasks) {
    return tasks.map(t => serializeTask(t)).join('\n');
  }
};

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
    const dateMatch = rest.match(/^(\d{4}-\d{2}-\d{2})\s+/);
    if (dateMatch) {
      task.completionDate = dateMatch[1];
      rest = rest.slice(dateMatch[0].length);
    }
  }

  const dateMatch = rest.match(/^(\d{4}-\d{2}-\d{2})\s+/);
  if (dateMatch) {
    task.creationDate = dateMatch[1];
    rest = rest.slice(dateMatch[0].length);
  }

  const tokens = rest.split(/\s+/);
  task.description = tokens.filter(t => {
    if (t.startsWith('@')) {
      task.contexts.push(t.slice(1));
      return false;
    }
    if (t.startsWith('+')) {
      task.projects.push(t.slice(1));
      return false;
    }
    const kv = t.match(/^(\S+):(\S+)$/);
    if (kv) {
      task.keyValues[kv[1]] = kv[2];
      return false;
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

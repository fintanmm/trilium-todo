// Trilium todo.txt Plugin — ETAPI Installer
// Usage:
//   export TRILIUM_URL=http://localhost:8080
//   export TRILIUM_TOKEN=your-etapi-token
//   node install.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const TRILIUM_URL = process.env.TRILIUM_URL || 'http://localhost:8080';
const TRILIUM_TOKEN = process.env.TRILIUM_TOKEN;

if (!TRILIUM_TOKEN) {
  console.error('ERROR: TRILIUM_TOKEN environment variable is required.');
  console.error('Get your token from Trilium → Options → ETAPI.');
  process.exit(1);
}

const { hostname, port, protocol } = new URL(TRILIUM_URL);

async function api(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = (protocol === 'https:' ? https : require('http')).request(
      {
        hostname, port,
        path: `/etapi/${endpoint}`,
        method,
        headers: {
          'Authorization': TRILIUM_TOKEN,
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
        }
      },
      res => {
        let chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(text ? JSON.parse(text) : null);
          } else {
            reject(new Error(`ETAPI ${endpoint} → ${res.statusCode}: ${text}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function readSource(name) {
  return fs.readFileSync(path.join(__dirname, 'src', name), 'utf-8');
}

async function run() {
  // Find or create plugin parent folder
  let parents = await api('GET', `notes/root/children`);
  let parent = parents.results.find(n => n.title === 'Trilium todo.txt');

  if (!parent) {
    parent = await api('POST', 'notes', {
      parentNoteId: 'root',
      title: 'Trilium todo.txt',
      type: 'text',
      content: ''
    });
    parent = parent.note;
    console.log(`Created parent note "${parent.title}" (${parent.noteId})`);
  } else {
    console.log(`Found parent note "${parent.title}" (${parent.noteId})`);
  }

  const spec = [
    {
      title: 'TodoTXT Widget',
      type: 'code',
      mime: 'text/x-trilium-jsx',
      content: readSource('todoWidget.jsx'),
      labels: [
        { name: 'widget' },
        { name: 'run', value: 'frontendStartup' },
        { name: 'codeMime', value: 'text/x-trilium-jsx' }
      ]
    },
    {
      title: 'todoTxtParser',
      type: 'code',
      mime: 'application/javascript;env=frontend',
      content: readSource('todoTxtParser.js'),
      labels: [
        { name: 'codeMime', value: 'application/javascript;env=frontend' }
      ]
    },
    {
      title: 'todoStore',
      type: 'code',
      mime: 'application/javascript;env=frontend',
      content: readSource('todoStore.js'),
      labels: [
        { name: 'codeMime', value: 'application/javascript;env=frontend' }
      ]
    }
  ];

  for (const s of spec) {
    let children = await api('GET', `notes/${parent.noteId}/children`);
    let existing = children.results.find(n => n.title === s.title);

    if (existing) {
      console.log(`Updating note "${s.title}" (${existing.noteId})`);
      await api('PUT', `notes/${existing.noteId}/content`, { content: s.content });
      for (const l of s.labels) {
        await api('PUT', `notes/${existing.noteId}/labels`, {
          name: l.name,
          value: l.value || ''
        });
      }
    } else {
      console.log(`Creating note "${s.title}"`);
      const result = await api('POST', 'notes', {
        parentNoteId: parent.noteId,
        title: s.title,
        type: s.type,
        mime: s.mime,
        content: s.content,
        attributes: s.labels.map(l => ({
          type: 'label',
          name: l.name,
          value: l.value || ''
        }))
      });
      console.log(`  Created ${result.note.noteId}`);
    }
  }

  // Check for backing todo.txt note
  let search = await api('GET', 'notes?search=%23todotxtStore');
  let storeNote = search.results && search.results[0];
  if (!storeNote) {
    const result = await api('POST', 'notes', {
      parentNoteId: 'root',
      title: 'todo.txt',
      type: 'text',
      content: '',
      attributes: [{ type: 'label', name: 'todotxtStore' }]
    });
    console.log(`Created backing note "${result.note.title}" (${result.note.noteId})`);
  } else {
    console.log(`Found backing note "${storeNote.title}" (${storeNote.noteId})`);
  }

  console.log('\nInstallation complete! Reload Trilium to see the widget.');
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});

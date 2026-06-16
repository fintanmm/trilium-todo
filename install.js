// Trilium todo.txt Plugin — ETAPI Installer
// Usage:
//   export TRILIUM_URL=http://localhost:8080
//   export TRILIUM_TOKEN=your-etapi-token
//   node install.js

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const TRILIUM_URL = process.env.TRILIUM_URL || "http://localhost:7777";
const TRILIUM_TOKEN = process.env.TRILIUM_TOKEN;

if (!TRILIUM_TOKEN) {
  console.error("ERROR: TRILIUM_TOKEN environment variable is required.");
  console.error("Get your token from Trilium → Options → ETAPI.");
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(TRILIUM_URL);
} catch (e) {
  console.error(`ERROR: Invalid TRILIUM_URL "${TRILIUM_URL}": ${e.message}`);
  process.exit(1);
}

const { hostname, port, protocol } = parsedUrl;
const effectivePort = port || (protocol === "https:" ? 443 : 80);

console.log(`Target: ${protocol}//${hostname}${port ? ":" + port : ""}/etapi/`);

async function api(method, endpoint, body) {
  const start = Date.now();
  const data = body ? JSON.stringify(body) : null;
  console.log(`  → ${method} /etapi/${endpoint}`);
  return new Promise((resolve, reject) => {
    const mod = protocol === "https:" ? https : http;
    const req = mod.request(
      {
        hostname,
        port: effectivePort,
        path: `/etapi/${endpoint}`,
        method,
        headers: {
          Authorization: TRILIUM_TOKEN,
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const elapsed = Date.now() - start;
          const text = Buffer.concat(chunks).toString();
          const status = res.statusCode;
          console.log(`  ← ${status} (${elapsed}ms)`);
          if (status >= 200 && status < 300) {
            resolve(text ? JSON.parse(text) : null);
          } else if (status >= 300 && status < 400 && res.headers.location) {
            console.log(`     → redirect to ${res.headers.location}`);
            reject(new Error(`Unexpected redirect to ${res.headers.location} — check TRILIUM_URL`));
          } else {
            reject(new Error(`/etapi/${endpoint} → ${status}: ${text.slice(0, 500)}`));
          }
        });
      },
    );
    req.on("error", (e) => {
      if (e.message.includes("Parse Error") && protocol === "http:") {
        console.error(`  ✗ Protocol mismatch — server may expect HTTPS. Try setting TRILIUM_URL to https://${hostname}${port ? ":" + port : ""}`);
      } else {
        console.error(`  ✗ ${e.message}`);
      }
      reject(e);
    });
    if (data) req.write(data);
    req.end();
  });
}

function readSource(name) {
  return fs.readFileSync(path.join(__dirname, "src", name), "utf-8");
}

async function run() {
  const startTotal = Date.now();
  console.log("── Trilium todo.txt Installer ──\n");

  // Find or create plugin parent folder
  console.log("[1/4] Resolving parent note…");
  let parents = await api("GET", `notes/root/children`);
  let parent = parents.results.find((n) => n.title === "Trilium todo.txt");

  if (!parent) {
    parent = await api("POST", "notes", {
      parentNoteId: "root",
      title: "Trilium todo.txt",
      type: "text",
      content: "",
    });
    parent = parent.note;
    console.log(`  → Created parent note "${parent.title}" (${parent.noteId})`);
  } else {
    console.log(`  → Found parent note "${parent.title}" (${parent.noteId})`);
  }

  const spec = [
    {
      title: "TodoTXT Widget",
      type: "code",
      mime: "text/x-trilium-jsx",
      content: readSource("todoWidget.jsx"),
      labels: [
        { name: "widget" },
        { name: "run", value: "frontendStartup" },
        { name: "codeMime", value: "text/x-trilium-jsx" },
      ],
    },
    {
      title: "todoTxtParser",
      type: "code",
      mime: "application/javascript;env=frontend",
      content: readSource("todoTxtParser.js"),
      labels: [
        { name: "codeMime", value: "application/javascript;env=frontend" },
      ],
    },
    {
      title: "todoStore",
      type: "code",
      mime: "application/javascript;env=frontend",
      content: readSource("todoStore.js"),
      labels: [
        { name: "codeMime", value: "application/javascript;env=frontend" },
      ],
    },
  ];

  console.log("\n[2/4] Installing bundle notes…");
  for (const s of spec) {
    let children = await api("GET", `notes/${parent.noteId}/children`);
    let existing = children.results.find((n) => n.title === s.title);

    if (existing) {
      console.log(`  ~ "${s.title}" (${existing.noteId}) — updating`);
      await api("PUT", `notes/${existing.noteId}/content`, {
        content: s.content,
      });
      for (const l of s.labels) {
        await api("PUT", `notes/${existing.noteId}/labels`, {
          name: l.name,
          value: l.value || "",
        });
      }
    } else {
      console.log(`  + "${s.title}" — creating`);
      const result = await api("POST", "notes", {
        parentNoteId: parent.noteId,
        title: s.title,
        type: s.type,
        mime: s.mime,
        content: s.content,
        attributes: s.labels.map((l) => ({
          type: "label",
          name: l.name,
          value: l.value || "",
        })),
      });
      console.log(`    → ${result.note.noteId}`);
    }
  }

  // Check for backing todo.txt note
  console.log("\n[3/4] Checking backing note (#todotxtStore)…");
  let search = await api("GET", "notes?search=%23todotxtStore");
  let storeNote = search.results && search.results[0];
  if (!storeNote) {
    console.log("  + Creating backing note…");
    const result = await api("POST", "notes", {
      parentNoteId: "root",
      title: "todo.txt",
      type: "text",
      content: "",
      attributes: [{ type: "label", name: "todotxtStore" }],
    });
    console.log(`    → "${result.note.title}" (${result.note.noteId})`);
  } else {
    console.log(`  → "${storeNote.title}" (${storeNote.noteId})`);
  }

  const elapsed = ((Date.now() - startTotal) / 1000).toFixed(1);
  console.log(`\n[4/4] Done in ${elapsed}s. Reload Trilium to see the widget.`);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

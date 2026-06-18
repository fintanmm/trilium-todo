module.exports = {
  STORE_LABEL: 'todotxtStore',
  ARCHIVE_LABEL: 'todotxtArchive',
  SAVE_DELAY: 500,

  _noteId: null,
  _archiveNoteId: null,
  _saveTimer: null,
  _listeners: [],
  _archiveAppendPromise: Promise.resolve(),

  onChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  },

  _notify() {
    for (const fn of this._listeners) fn();
  },

  async _resolveNote() {
    if (this._noteId) return this._noteId;
    const results = await api.searchForNotes(`#${this.STORE_LABEL}`);
    if (results && results.length > 0) {
      this._noteId = results[0].noteId;
      return this._noteId;
    }
    return null;
  },

  async _resolveArchiveNote() {
    if (this._archiveNoteId) return this._archiveNoteId;
    const results = await api.searchForNotes(`#${this.ARCHIVE_LABEL}`);
    if (results && results.length > 0) {
      this._archiveNoteId = results[0].noteId;
      return this._archiveNoteId;
    }
    return null;
  },

  invalidateCache() {
    this._noteId = null;
    this._archiveNoteId = null;
  },

  async load() {
    const noteId = await this._resolveNote();
    if (!noteId) return '';
    try {
      const note = await api.getNote(noteId);
      const { content } = await note.getNoteComplement();
      return content || '';
    } catch (e) {
      console.error('todoStore.load error:', e);
      return '';
    }
  },

  async loadArchive() {
    const noteId = await this._resolveArchiveNote();
    if (!noteId) return '';
    try {
      const note = await api.getNote(noteId);
      const { content } = await note.getNoteComplement();
      return content || '';
    } catch (e) {
      console.error('todoStore.loadArchive error:', e);
      return '';
    }
  },

  async save(content) {
    try {
      let noteId = await this._resolveNote();
      if (!noteId) {
        const newId = await api.runOnBackend(
          ({ label, content }) => {
            const { note } = api.createTextNote('root', 'todo.txt', content);
            note.setLabel(label);
            return note.noteId;
          },
          [{ label: this.STORE_LABEL, content }]
        );
        this._noteId = newId;
      } else {
        try {
          await api.runOnBackend(
            ({ noteId, content }) => {
              const note = api.getNote(noteId);
              note.setContent(content);
            },
            [{ noteId, content }]
          );
        } catch (e) {
          console.error('todoStore.save: putNoteContent failed, recreating note:', e);
          this._noteId = null;
          const newId = await api.runOnBackend(
            ({ label, content }) => {
              const { note } = api.createTextNote('root', 'todo.txt', content);
              note.setLabel(label);
              return note.noteId;
            },
            [{ label: this.STORE_LABEL, content }]
          );
          this._noteId = newId;
        }
      }
      this._notify();
    } catch (e) {
      console.error('todoStore.save error:', e);
    }
  },

  async saveArchive(content) {
    try {
      let noteId = await this._resolveArchiveNote();
      if (!noteId) {
        const newId = await api.runOnBackend(
          ({ label, content }) => {
            const { note } = api.createTextNote('root', 'todo.txt (archive)', content);
            note.setLabel(label);
            return note.noteId;
          },
          [{ label: this.ARCHIVE_LABEL, content }]
        );
        this._archiveNoteId = newId;
      } else {
        try {
          await api.runOnBackend(
            ({ noteId, content }) => {
              const note = api.getNote(noteId);
              note.setContent(content);
            },
            [{ noteId, content }]
          );
        } catch (e) {
          console.error('todoStore.saveArchive: putContent failed, recreating note:', e);
          this._archiveNoteId = null;
          const newId = await api.runOnBackend(
            ({ label, content }) => {
              const { note } = api.createTextNote('root', 'todo.txt (archive)', content);
              note.setLabel(label);
              return note.noteId;
            },
            [{ label: this.ARCHIVE_LABEL, content }]
          );
          this._archiveNoteId = newId;
        }
      }
    } catch (e) {
      console.error('todoStore.saveArchive error:', e);
    }
  },

  async appendToArchive(text) {
    this._archiveAppendPromise = this._archiveAppendPromise
      .then(async () => {
        const content = await this.loadArchive();
        const existingTasks = content ? todoTxtParser.parse(content) : [];
        const newTasks = todoTxtParser.parse(text);
        await this.saveArchive(
          todoTxtParser.serialize([...existingTasks, ...newTasks])
        );
      })
      .catch((e) =>
        console.error("todoStore.appendToArchive error:", e)
      );
    return this._archiveAppendPromise;
  },

  saveDebounced(content) {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.save(content), this.SAVE_DELAY);
  }
};

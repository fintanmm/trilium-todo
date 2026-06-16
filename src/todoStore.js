module.exports = {
  STORE_LABEL: 'todotxtStore',
  SAVE_DELAY: 500,

  _noteId: null,
  _saveTimer: null,
  _listeners: [],

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

  invalidateCache() {
    this._noteId = null;
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

  async save(content) {
    try {
      let noteId = await this._resolveNote();
      if (!noteId) {
        const newId = await api.runOnBackend(
          ({ label, content }) => {
            const note = api.createTextNote('root', 'todo.txt', content);
            api.createLabel(note.note.noteId, label);
            return note.note.noteId;
          },
          { label: this.STORE_LABEL, content }
        );
        this._noteId = newId;
      } else {
        await api.runOnBackend(
          ({ noteId, content }) => api.putNoteContent(noteId, content),
          { noteId, content }
        );
      }
      this._notify();
    } catch (e) {
      console.error('todoStore.save error:', e);
    }
  },

  saveDebounced(content) {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.save(content), this.SAVE_DELAY);
  }
};

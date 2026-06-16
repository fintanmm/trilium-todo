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
      return await api.getNoteContent(noteId);
    } catch (e) {
      console.error('todoStore.load error:', e);
      return '';
    }
  },

  async save(content) {
    try {
      let noteId = await this._resolveNote();
      if (!noteId) {
        const note = await api.createNote('root', 'todo.txt', content, 'text', [
          { type: 'label', name: this.STORE_LABEL }
        ]);
        const n = note.note || note;
        this._noteId = n.noteId;
      } else {
        await api.putNoteContent(noteId, content);
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

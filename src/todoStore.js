module.exports = {
  STORE_LABEL: 'todotxtStore',

  findNote() {
    return api.searchForNote(`#${this.STORE_LABEL}`);
  },

  async load() {
    const note = this.findNote();
    if (!note) return '';
    return await api.getNoteContent(note.noteId);
  },

  async save(content) {
    let note = this.findNote();
    if (!note) {
      note = await api.createTextNote('root', 'todo.txt', content);
      await note.setLabel(this.STORE_LABEL);
    } else {
      await api.putNoteContent(note.noteId, content);
    }
  }
};

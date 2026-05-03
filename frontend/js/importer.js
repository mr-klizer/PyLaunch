/**
 * importer.js — Import project with copy/link choice
 */
const importer = {
  _pendingPath: null,
  _pendingType: null,   // 'folder' | 'py' | 'zip'

  async fromFolder() {
    const path = await api.openFileDialog('folder');
    if (!path) return;
    this._pendingPath = path;
    this._pendingType = 'folder';
    this._showCopyModal(path, 'folder');
  },

  async fromZip() {
    const path = await api.openFileDialog('zip');
    if (!path) return;
    // ZIP always copies — no choice needed
    this._doImport(path, true, 'zip');
  },

  async fromPy() {
    const path = await api.openFileDialog('py');
    if (!path) return;
    this._pendingPath = path;
    this._pendingType = 'py';
    this._showCopyModal(path, 'py');
  },

  // ── Copy/link choice modal ────────────────────────────────────────────────
  _showCopyModal(path, type) {
    const name = path.replace(/\\/g, '/').split('/').pop();
    const modal = document.getElementById('copy-modal');
    const nameEl = document.getElementById('copy-modal-name');
    if (nameEl) nameEl.textContent = name;
    if (modal)  modal.classList.remove('hidden');
  },

  closeCopyModal() {
    document.getElementById('copy-modal').classList.add('hidden');
  },

  chooseCopy(doCopy) {
    this.closeCopyModal();
    if (this._pendingPath) {
      this._doImport(this._pendingPath, doCopy, this._pendingType);
      this._pendingPath = null;
      this._pendingType = null;
    }
  },

  // ── Actual import ─────────────────────────────────────────────────────────
  async _doImport(sourcePath, copyMode, type) {
    const progress = document.getElementById('import-progress');
    const title    = document.getElementById('import-progress-title');
    const sub      = document.getElementById('import-progress-sub');

    if (progress) progress.classList.remove('hidden');
    if (title) title.textContent = type === 'zip' ? 'Распаковываем архив...' : 'Добавляем программу...';
    if (sub)   sub.textContent   = sourcePath;

    try {
      const result = await api.importProject(sourcePath, copyMode);
      if (progress) progress.classList.add('hidden');
      if (result && result.ok) {
        const badge = copyMode ? '' : ' (оригинальная папка)';
        toast.show(`Программа «${result.project.name}» добавлена${badge}!`, 'success');
        await catalog.load();
        nav.show('catalog');
      } else {
        toast.show(result?.error || 'Не удалось добавить программу', 'error');
      }
    } catch (e) {
      if (progress) progress.classList.add('hidden');
      toast.show(`Ошибка: ${e}`, 'error');
    }
  },
};

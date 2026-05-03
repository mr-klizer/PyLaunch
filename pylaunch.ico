/**
 * modals.js
 * Fix: file entry picker used broken regex /\/g which crashed the whole picker.
 * Fix: file paths passed via data-attributes, not inlined into onclick strings.
 */
const modals = {

  // ── Error modal ─────────────────────────────────────────────────────────────
  _errorAction: null, _errorProjectId: null, _errorModule: null,

  showError(err, pid) {
    this._errorProjectId = pid;
    document.getElementById('error-modal-title').textContent   = err.title   || 'Ошибка';
    document.getElementById('error-modal-message').textContent = err.message || '';
    document.getElementById('error-modal-raw').textContent     = err.raw     || '';
    const btn = document.getElementById('error-modal-action-btn');
    if (err.action && err.action_label) {
      btn.textContent = err.action_label; btn.style.display = '';
      this._errorAction = err.action;
      const m = (err.message || '').match(/«(.+?)»/);
      if (m) this._errorModule = m[1];
    } else { btn.style.display = 'none'; this._errorAction = null; }
    document.getElementById('error-modal').classList.remove('hidden');
  },
  closeError() {
    document.getElementById('error-modal').classList.add('hidden');
    this._errorAction = null;
  },
  errorAction() {
    const pid = this._errorProjectId;
    if (this._errorAction === 'install_module' && this._errorModule && pid)
      api.installModule(pid, this._errorModule).then(() =>
        toast.show(`Устанавливаем «${this._errorModule}»...`, 'info'));
    else if (this._errorAction === 'reinstall' && pid)
      catalog.install(pid);
    this.closeError();
  },

  // ── Entry point picker ───────────────────────────────────────────────────────
  _entryChangeMode: false,
  _entryProjectId: null,

  async showEntryPicker(pid, changeMode) {
    this._entryProjectId  = pid;
    this._entryChangeMode = !!changeMode;

    const titleEl = document.getElementById('entry-modal-title');
    const subEl   = document.getElementById('entry-modal-sub');
    if (titleEl) titleEl.textContent = changeMode ? 'Изменить файл запуска' : 'Какой файл запустить?';
    if (subEl)   subEl.textContent   = changeMode
      ? 'Выберите файл, который будет запускаться по умолчанию:'
      : 'Не удалось автоматически определить главный файл. Выберите его:';

    const curProject = catalog._projects.find(p => p.id === pid);
    const cur = curProject?.entry_point || '';

    let files = [];
    try { files = await api.getPyFiles(pid) || []; } catch (e) { files = []; }

    const list = document.getElementById('entry-file-list');
    if (list) {
      list.innerHTML = '';
      if (!files.length) {
        list.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px">Python-файлы не найдены</div>';
      } else {
        files.forEach(f => {
          // Normalise separators to forward slash for consistent comparison
          const fNorm = f.replace(/\\/g, '/');
          const curNorm = cur.replace(/\\/g, '/');
          const isCur = fNorm === curNorm;
          const depth = fNorm.split('/').length - 1;

          const item = document.createElement('div');
          item.className = 'file-item' + (isCur ? ' current' : '');
          if (depth > 0) item.style.color = 'var(--text-secondary)';
          item.innerHTML = (isCur ? '<span style="color:var(--accent);margin-right:6px">✓</span>' : '') + fNorm;

          // Use closure — no path string escaping in HTML attributes
          item.addEventListener('click', () => modals.selectEntry(pid, fNorm));
          list.appendChild(item);
        });
      }
    }

    document.getElementById('entry-modal').classList.remove('hidden');
  },

  async selectEntry(pid, file) {
    try {
      const r = await api.updateProjectEntry(pid, file);
      if (r && r.ok === false) {
        toast.show(r.error || 'Не удалось сохранить', 'error'); return;
      }
      // Update local cache
      const p = catalog._projects.find(x => x.id === pid);
      if (p) {
        p.entry_point = file;
        const card = document.getElementById(`card-${pid}`);
        if (card) card.outerHTML = catalog._cardHTML(p);
      }
      this.closeEntry();
      toast.show('Файл запуска: ' + file, 'success');
      if (!this._entryChangeMode) catalog.run(pid);
    } catch (e) {
      toast.show('Ошибка: ' + e, 'error');
    }
  },

  closeEntry() { document.getElementById('entry-modal').classList.add('hidden'); },

  // ── Delete confirm ───────────────────────────────────────────────────────────
  _deleteCallback: null,

  showDeleteConfirm(project, cb) {
    this._deleteCallback = cb;
    const el = document.getElementById('delete-modal-name');
    if (el) el.textContent = project.name;
    document.getElementById('delete-modal').classList.remove('hidden');
  },
  confirmDelete(deleteFiles) {
    this.closeDelete();
    if (this._deleteCallback) {
      this._deleteCallback(deleteFiles);
      this._deleteCallback = null;
    }
  },
  closeDelete() { document.getElementById('delete-modal').classList.add('hidden'); },
};

// ── Toast ────────────────────────────────────────────────────────────────────
const toast = {
  show(msg, type, dur) {
    type = type || 'info';
    dur  = dur  || 3500;
    const c = document.getElementById('toast-container');
    if (!c) return;
    const icons  = { success: '✓', error: '!', info: 'i' };
    const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--accent)' };
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<span style="color:${colors[type]};font-weight:900;font-size:14px">${icons[type]}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toastOut .3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, dur);
  },
};

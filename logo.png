/**
 * catalog.js — Project catalog
 * v9 fixes:
 * - On load, sync card states with get_running_projects()
 * - Stop/Start button toggles based on actual run state
 * - _runningSet tracks which projects are currently running
 */
const catalog = {
  _projects: [],
  _filter: '',
  _runningSet: new Set(),   // project IDs currently running

  async load() {
    const grid  = document.getElementById('catalog-grid');
    const empty = document.getElementById('catalog-empty');
    if (!grid) return;

    grid.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:4px 0;grid-column:1/-1">
      Загружаем список программ...</div>`;
    empty.classList.add('hidden');

    try {
      const [projects, running] = await Promise.all([
        api.getProjects(),
        api.getRunningProjects().catch(() => []),
      ]);
      this._projects   = Array.isArray(projects) ? projects : [];
      this._runningSet = new Set(Array.isArray(running) ? running : []);
      this._render();
    } catch (e) {
      console.error('catalog.load:', e);
      grid.innerHTML = '';
      this._showError();
    }
  },

  _showError() {
    const empty = document.getElementById('catalog-empty');
    if (!empty) return;
    empty.classList.remove('hidden');
    empty.innerHTML = `
      <div class="empty-icon">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <rect width="56" height="56" rx="14" fill="var(--bg-card)"/>
          <path d="M14 20h28v20a2 2 0 01-2 2H16a2 2 0 01-2-2V20z" stroke="var(--text-muted)" stroke-width="1.5" fill="none"/>
          <path d="M10 20h36v-2a2 2 0 00-2-2H12a2 2 0 00-2 2v2z" stroke="var(--text-muted)" stroke-width="1.5" fill="none"/>
          <circle cx="36" cy="36" r="8" fill="var(--bg-base)" stroke="var(--danger)" stroke-width="1.5"/>
          <path d="M36 32v4M36 38.5v.5" stroke="var(--danger)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h2 style="color:var(--text-primary)">Не удалось загрузить программы</h2>
      <p style="color:var(--text-secondary)">
        Подождите несколько секунд и переключитесь на другую вкладку,<br>
        затем вернитесь — список загрузится автоматически.
      </p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:4px">
        <button class="btn-primary" onclick="catalog.load()">Обновить список</button>
        <button class="btn-outline" onclick="nav.show('import')">Добавить программу</button>
      </div>`;
  },

  _showEmpty() {
    const empty = document.getElementById('catalog-empty');
    if (!empty) return;
    empty.classList.remove('hidden');
    empty.innerHTML = `
      <div class="empty-icon">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <rect width="56" height="56" rx="14" fill="var(--bg-card)"/>
          <path d="M14 20h28v20a2 2 0 01-2 2H16a2 2 0 01-2-2V20z" stroke="var(--text-muted)" stroke-width="1.5" fill="none"/>
          <path d="M10 20h36v-2a2 2 0 00-2-2H12a2 2 0 00-2 2v2z" stroke="var(--text-muted)" stroke-width="1.5" fill="none"/>
          <path d="M22 30h12M22 34h8" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h2>Программ пока нет</h2>
      <p>Добавьте первую программу из папки, ZIP-архива или .py файла</p>
      <button class="btn-primary" onclick="nav.show('import')">Добавить программу</button>`;
  },

  search(q) { this._filter = q.toLowerCase().trim(); this._render(); },

  _filtered() {
    if (!this._filter) return this._projects;
    return this._projects.filter(p =>
      p.name.toLowerCase().includes(this._filter) ||
      (p.description || '').toLowerCase().includes(this._filter));
  },

  _render() {
    const grid  = document.getElementById('catalog-grid');
    const empty = document.getElementById('catalog-empty');
    const list  = this._filtered();
    if (!list.length) {
      grid.innerHTML = '';
      this._showEmpty();
      return;
    }
    empty.classList.add('hidden');
    grid.innerHTML = list.map(p => this._cardHTML(p)).join('');
  },

  // Generate a hue (0-359) from project name — same name always same hue
  _hue(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
    return h % 360;
  },

  _placeholder(letter, name) {
    // Uses CSS custom properties so it adapts to every theme automatically.
    // We only set the hue via inline style; lightness/saturation come from CSS.
    const hue = this._hue(name || letter || '?');
    return `<div class="card-banner-placeholder" style="--ph-hue:${hue}">
      <div class="ph-letter">${letter}</div></div>`;
  },

  _cardHTML(p) {
    const installed   = !!p.installed;
    const isRunning   = this._runningSet.has(p.id);
    const withTerm    = !!p.with_terminal;
    const letter      = (p.name || '?')[0].toUpperCase();
    const bannerSrc   = p.custom_banner || p.screenshot;
    const entryLabel  = p.entry_point || 'не задан';

    const hue = this._hue(p.name || letter);
    const banner = bannerSrc
      ? `<img src="file://${bannerSrc}" alt=""
             onerror="this.outerHTML=catalog._placeholder('${letter}','${p.name || letter}')">`
      : this._placeholder(letter, p.name || letter);

    // Status dot + text
    let statusClass, statusText;
    if (isRunning) {
      statusClass = 'running'; statusText = 'Работает';
    } else if (installed) {
      statusClass = 'installed'; statusText = 'Готова к запуску';
    } else {
      statusClass = 'not-installed'; statusText = 'Требует подготовки';
    }

    // Main action button — toggles between Run / Stop / Prepare
    let mainBtn;
    if (isRunning) {
      mainBtn = `<button class="card-btn stop" onclick="catalog.stop('${p.id}')">&#9632; Остановить</button>`;
    } else if (installed) {
      mainBtn = `<button class="card-btn run" onclick="catalog.run('${p.id}')">&#9654; Запустить</button>`;
    } else {
      mainBtn = `<button class="card-btn install" onclick="catalog.install('${p.id}')">&#8659; Подготовить</button>`;
    }

    return `
<div class="project-card" id="card-${p.id}">
  <div class="card-banner">
    ${banner}
    <div class="card-banner-edit" onclick="bannerEditor.open('${p.id}')">
      <button class="banner-edit-btn">&#128247; Сменить баннер</button>
    </div>
  </div>
  <div class="card-body">
    <div class="card-name" title="${p.name}">${p.name}</div>
    <div class="card-desc">${p.description || 'Описание отсутствует'}</div>

    <div class="card-tags-row">
      ${p.link_mode
        ? '<span class="card-tag tag-link" title="Запускается из исходной папки">&#128279; Исходная папка</span>'
        : '<span class="card-tag tag-copy" title="Хранится в папке PyLaunch">&#128190; Резервная копия</span>'
      }
      ${p.installed ? '' : '<span class="card-tag tag-warn">&#9888; Не подготовлена</span>'}
    </div>

    <div class="card-entry-row">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;opacity:.5">
        <path d="M2 3h8M2 6h5M2 9h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
      <span class="card-entry-label" title="Файл запуска">${entryLabel}</span>
      <button class="card-entry-change" onclick="catalog.changeEntry('${p.id}')" title="Изменить файл запуска">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="card-toggles">
      <label class="card-terminal-toggle" title="Открывать консоль при запуске">
        <input type="checkbox" id="term-${p.id}" ${withTerm ? 'checked' : ''}
               onchange="catalog.setTerminal('${p.id}', this.checked)">
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">Показывать консоль</span>
      </label>
      <label class="card-terminal-toggle card-autoquit-toggle ${withTerm ? '' : 'toggle-disabled'}"
             title="${withTerm ? 'Закрывать консоль автоматически после завершения программы' : 'Сначала включите «Показывать консоль»'}">
        <input type="checkbox" id="autoquit-${p.id}" ${p.auto_close_terminal ? 'checked' : ''}
               ${withTerm ? '' : 'disabled'}
               onchange="catalog.setAutoClose('${p.id}', this.checked)">
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">Закрывать консоль после завершения</span>
      </label>
    </div>

    <div class="card-meta">
      <div class="card-status">
        <div class="status-dot ${statusClass}" id="dot-${p.id}"></div>
        <span id="status-text-${p.id}">${statusText}</span>
      </div>
      <div class="card-actions">
        <span id="main-btn-${p.id}">${mainBtn}</span>
        <button class="card-btn more" onclick="catalog.showMenu('${p.id}')">&#8943;</button>
      </div>
    </div>
  </div>
  <div class="card-status-overlay" id="overlay-${p.id}">
    <div class="overlay-spinner"></div>
    <span id="overlay-text-${p.id}"></span>
  </div>
</div>`;
  },

  // ── Actions ────────────────────────────────────────────────────────────────
  async install(id) {
    this._setOverlay(id, true, 'Подготавливаем программу к запуску...');
    await api.installProject(id);
  },

  async run(id) {
    const r = await api.runProject(id);
    if (r && r.error === 'no_entry_point') { modals.showEntryPicker(id); return; }
    if (r && !r.ok) toast.show(r.error || 'Не удалось запустить', 'error');
  },

  async stop(id) {
    const r = await api.stopProject(id);
    if (r && !r.ok) toast.show(r.error || 'Не удалось остановить', 'error');
    // UI update comes via run_status event from Python
  },

  async changeEntry(id) {
    await modals.showEntryPicker(id, true);
  },

  async setTerminal(id, value) {
    const p = this._projects.find(x => x.id === id);
    if (p) p.with_terminal = value;
    await api.setProjectOption(id, 'with_terminal', value);
    // Enable/disable the auto-close toggle in sync
    const autoLabel = document.querySelector(`label.card-autoquit-toggle[for="autoquit-${id}"], .card-autoquit-toggle`);
    const autoInput = document.getElementById('autoquit-' + id);
    if (autoInput) {
      autoInput.disabled = !value;
      const label = autoInput.closest('label');
      if (label) {
        label.classList.toggle('toggle-disabled', !value);
        label.title = value
          ? 'Закрывать консоль автоматически после завершения программы'
          : 'Сначала включите «Показывать консоль»';
      }
    }
  },

  async setAutoClose(id, value) {
    const p = this._projects.find(x => x.id === id);
    if (p) p.auto_close_terminal = value;
    await api.setProjectOption(id, 'auto_close_terminal', value);
  },

  showMenu(id) {
    const p = this._projects.find(x => x.id === id);
    if (!p) return;
    const items = [
      { label: '📄  Описание (README)',          fn: () => readmeViewer.open(id, p.name) },
      { label: '📁  Открыть папку',             fn: () => api.revealInExplorer(p.path) },
      { label: '🖼   Сменить баннер',            fn: () => bannerEditor.open(id) },
      { label: '⚙   Изменить файл запуска',     fn: () => catalog.changeEntry(id) },
      { label: '⬇  Переустановить компоненты',  fn: () => catalog.install(id) },
      { label: '🗑  Удалить из каталога',        fn: () => catalog._confirmDelete(id) },
    ];
    const menu = document.createElement('div');
    menu.style.cssText = `position:fixed;z-index:999;background:var(--bg-surface);
      border:1px solid var(--border);border-radius:var(--radius-md);padding:6px;
      box-shadow:0 8px 32px rgba(0,0,0,.5);min-width:230px`;
    items.forEach(a => {
      const b = document.createElement('button');
      b.style.cssText = `display:block;width:100%;text-align:left;padding:10px 14px;
        background:none;border:none;color:var(--text-primary);font-family:var(--font-ui);
        font-size:13px;cursor:pointer;border-radius:6px;transition:background .1s`;
      b.textContent = a.label;
      b.onmouseenter = () => b.style.background = 'var(--bg-card)';
      b.onmouseleave = () => b.style.background = 'none';
      b.onclick = () => { a.fn(); menu.remove(); };
      menu.appendChild(b);
    });
    const card = document.getElementById(`card-${id}`);
    if (card) {
      const r = card.getBoundingClientRect();
      menu.style.top  = `${Math.min(r.bottom - 8, window.innerHeight - 260)}px`;
      menu.style.left = `${Math.max(r.right - 240, 8)}px`;
    }
    document.body.appendChild(menu);
    const close = e => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 50);
  },

  _confirmDelete(id) {
    const p = this._projects.find(x => x.id === id);
    if (!p) return;
    modals.showDeleteConfirm(p, deleteFiles => {
      api.deleteProject(id, deleteFiles).then(r => {
        if (r?.ok) {
          this._projects = this._projects.filter(x => x.id !== id);
          this._runningSet.delete(id);
          this._render();
          toast.show('Программа удалена', 'success');
        } else {
          toast.show(r?.error || 'Не удалось удалить', 'error');
        }
      });
    });
  },

  _setOverlay(id, show, msg) {
    const el = document.getElementById(`overlay-${id}`);
    const tx = document.getElementById(`overlay-text-${id}`);
    if (el) el.classList.toggle('visible', show);
    if (tx && msg) tx.textContent = msg;
  },

  // ── Update card after status change (no full re-render) ───────────────────
  _updateCardStatus(id, status, msg) {
    const dot     = document.getElementById(`dot-${id}`);
    const stxt    = document.getElementById(`status-text-${id}`);
    const btnWrap = document.getElementById(`main-btn-${id}`);

    const busy = ['preparing','installing'].includes(status);
    this._setOverlay(id, busy, msg);

    const isRunning = status === 'running';

    if (isRunning) {
      this._runningSet.add(id);
    } else {
      this._runningSet.delete(id);
    }

    // Update dot
    if (dot) {
      dot.className = `status-dot ${
        isRunning             ? 'running'      :
        status === 'done'     ? 'installed'    :
        status === 'error'    ? 'error'        :
        status === 'stopped'  ? 'installed'    : 'not-installed'}`;
    }
    if (stxt) {
      stxt.textContent =
        isRunning            ? 'Работает'            :
        status === 'stopped' ? 'Готова к запуску'    :
        status === 'done'    ? 'Готова к запуску'    :
        status === 'error'   ? 'Ошибка'              :
        msg || status;
    }

    // Swap run/stop button
    if (btnWrap) {
      const p = this._projects.find(x => x.id === id);
      const installed = p ? !!p.installed : false;
      if (isRunning) {
        btnWrap.innerHTML = `<button class="card-btn stop" onclick="catalog.stop('${id}')">&#9632; Остановить</button>`;
      } else if (status === 'done' || installed) {
        // Mark installed in local cache
        if (p && status === 'done') p.installed = true;
        btnWrap.innerHTML = `<button class="card-btn run" onclick="catalog.run('${id}')">&#9654; Запустить</button>`;
      }
    }
  },

  handleInstallStatus(e) {
    const { project_id: id, status, message: msg } = e.detail;
    catalog._updateCardStatus(id, status, msg);
    if (status === 'done')  toast.show(msg, 'success');
    if (status === 'error') toast.show(msg, 'error');
  },
  handleRunStatus(e) {
    const { project_id: id, status, message: msg, error } = e.detail;
    if (status === 'error' && error) {
      catalog._updateCardStatus(id, status, error.message || 'Ошибка');
      modals.showError(error, id);
    } else {
      catalog._updateCardStatus(id, status, msg);
      if (status === 'stopped') toast.show(msg || 'Программа завершила работу', 'info');
    }
  },
};

window.addEventListener('install_status', catalog.handleInstallStatus.bind(catalog));
window.addEventListener('run_status',     catalog.handleRunStatus.bind(catalog));

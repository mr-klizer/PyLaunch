/**
 * python-mgr.js
 * Fix: paths passed via data-attributes, never inlined into onclick strings.
 * This avoids breakage on Windows paths with backslashes and quotes.
 */
const pythonMgr = {
  _versions: [],

  async load() {
    await this.refresh();
    this._renderDownloadTiles();
  },

  async refresh() {
    const list = document.getElementById('python-versions-list');
    if (!list) return;
    list.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:4px 0">
      Ищем установленные версии Python...</div>`;
    try {
      this._versions = await api.getPythonVersions() || [];
      this._renderVersions();
    } catch (e) {
      list.innerHTML = `<div style="color:var(--danger);font-size:13px">${e}</div>`;
    }
  },

  _renderVersions() {
    const list  = document.getElementById('python-versions-list');
    const badge = document.getElementById('sys-python-badge');
    if (!list) return;

    if (!this._versions.length) {
      list.innerHTML = `
        <div style="background:var(--warning-dim);border:1px solid var(--warning);
          border-radius:var(--radius-md);padding:16px 20px;display:flex;align-items:center;gap:14px;margin-bottom:16px">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L22 20H2L12 2Z" stroke="var(--warning)" stroke-width="1.5" fill="none"/>
            <path d="M12 9v5M12 16.5v.5" stroke="var(--warning)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div>
            <div style="font-weight:700;color:var(--warning);margin-bottom:3px">Python не найден</div>
            <div style="font-size:12.5px;color:var(--text-secondary)">
              Установите Python по инструкции ниже, затем нажмите «Обновить список»
            </div>
          </div>
        </div>`;
      if (badge) badge.textContent = 'Python не найден';
      return;
    }

    const current = this._versions.find(v => v.current);
    if (badge) {
      if (current) {
        badge.textContent = current.label;
      } else if (this._versions.length) {
        // No version marked current — show first found as info
        badge.textContent = this._versions[0].label + ' (не выбран)';
      }
    }

    // Build DOM elements directly — NO path interpolation into onclick strings
    list.innerHTML = '';
    this._versions.forEach((v, idx) => {
      const row = document.createElement('div');
      row.className = 'version-item';

      row.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <div class="version-label">${v.label}</div>
            ${v.recommended ? '<span class="version-badge recommended">&#9733; Рекомендуется</span>' : ''}
            ${v.current     ? '<span class="version-badge active">Активный</span>'                    : ''}
          </div>
          <div class="version-path">${v.path}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn-outline select-btn" style="padding:6px 14px;font-size:12px">
            ${v.current ? '&#10003; Используется' : 'Выбрать'}
          </button>
          ${!v.current ? `<button class="btn-danger uninstall-btn"
            style="padding:6px 12px;font-size:12px"
            title="Удалить этот интерпретатор с компьютера">&#128465;</button>` : ''}
        </div>`;

      // Attach listeners with closure over path — no string escaping needed
      const path = v.path;
      const label = v.label;
      row.querySelector('.select-btn').addEventListener('click', () => {
        pythonMgr.setActive(path);
      });
      const uninstBtn = row.querySelector('.uninstall-btn');
      if (uninstBtn) {
        uninstBtn.addEventListener('click', () => {
          pythonMgr.confirmUninstall(path, label);
        });
      }

      list.appendChild(row);
    });
  },

  async setActive(path) {
    try {
      const chosen = this._versions.find(v => v.path === path);
      const label  = chosen ? chosen.label : '';
      const r = await api.setPythonPath(path, label);
      if (r && r.ok === false) {
        toast.show(r.error || 'Не удалось выбрать', 'error'); return;
      }
      // Update current flags locally so UI updates immediately without re-scan
      this._versions.forEach(v => { v.current = (v.path === path); });
      // Update sidebar badge with the label we already have
      const badge = document.getElementById('sys-python-badge');
      if (badge && label) badge.textContent = label;
      this._renderVersions();
      toast.show('Python выбран: ' + (label || path), 'success');
    } catch (e) {
      toast.show('Ошибка: ' + e, 'error');
    }
  },

  async confirmUninstall(path, label) {
    if (!confirm(
      `Удалить ${label} с компьютера?\n\n` +
      `Это действие необратимо. Все программы, использующие эту версию Python, перестанут работать.`
    )) return;
    const result = await api.uninstallPython(path);
    if (result && result.ok) {
      if (result.fallback) {
        toast.show(result.message || 'Откройте «Установка и удаление программ»', 'info', 6000);
      } else {
        toast.show('Удаление запущено. Обновите список через минуту.', 'success');
        setTimeout(() => this.refresh(), 3000);
      }
    } else {
      toast.show(result?.error || 'Не удалось удалить', 'error');
    }
  },

  _renderDownloadTiles() {
    const tiles = document.getElementById('python-download-tiles');
    if (!tiles) return;
    const versions = [
      { num: '3.11.9',  rec: true  },
      { num: '3.12.4',  rec: false },
      { num: '3.10.14', rec: false },
      { num: '3.9.19',  rec: false },
    ];
    tiles.innerHTML = versions.map(v => `
      <div class="version-tile ${v.rec ? 'rec' : ''}"
           onclick="pythonMgr.openDownloadPage('${v.num}')"
           title="Открыть страницу загрузки Python ${v.num} в браузере">
        <div class="vt-num">${v.num}</div>
        <div class="vt-label">${v.rec ? '&#9733; Рекомендуется' : 'Стабильная'}</div>
        <div class="vt-action">Скачать &#8599;</div>
      </div>`).join('');
  },

  openDownloadPage(version) {
    api.downloadPython(version);
    toast.show('Открываем python.org в браузере...', 'info');
  },

  toggleGuide(btn) {
    const body = document.getElementById('python-guide-body');
    if (!body) return;
    const collapsed = body.style.display === 'none';
    body.style.display = collapsed ? '' : 'none';
    btn.textContent = collapsed ? 'Свернуть ▲' : 'Развернуть ▼';
  },
};

/**
 * wizard.js — First-run wizard logic
 */
const wizard = {
  _intent: null,
  _selectedPython: null,

  async show() {
    document.getElementById('wizard-overlay').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
    this._checkPython();
  },

  hide() {
    document.getElementById('wizard-overlay').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  },

  goTo(step, intent) {
    if (intent) this._intent = intent;

    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));

    // Show target
    const target = document.querySelector(`.wizard-step[data-step="${step}"]`);
    const dot = document.querySelector(`.dot[data-step="${step}"]`);
    if (target) target.classList.add('active');
    if (dot) dot.classList.add('active');

    // Step-specific init
    if (step === 2) this._checkPython();
    if (step === 3) this._initFolderStep();
    if (step === 4) this._buildSummary();
  },

  async _checkPython() {
    const area = document.getElementById('wizard-python-check');
    area.innerHTML = `<div class="checking-indicator"><div class="spinner"></div><span>Ищем Python на вашем компьютере...</span></div>`;

    const nextBtn = document.getElementById('wizard-next-2');
    if (nextBtn) nextBtn.disabled = true;

    try {
      const versions = await api.getPythonVersions();
      if (!versions || versions.length === 0) {
        area.innerHTML = `
          <div style="text-align:center;padding:10px;display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="font-size:36px;">⚠️</div>
            <div style="font-size:15px;font-weight:700;color:var(--warning)">Python не найден</div>
            <div style="font-size:13px;color:var(--text-secondary)">Нужно установить Python, чтобы запускать программы.</div>
            <button class="btn-primary" onclick="pythonMgr.openDownloadPage('3.11.9')">Установить Python 3.11 (рекомендуется)</button>
          </div>`;
        return;
      }

      // Show found versions
      area.innerHTML = `<div class="python-found" id="pf-list"></div>`;
      const list = document.getElementById('pf-list');
      const recommended = versions.find(v => v.recommended) || versions[0];
      this._selectedPython = recommended.path;

      versions.forEach((v, i) => {
        const selected = v.path === this._selectedPython;
        const row = document.createElement('label');
        row.className = `pf-version-row${selected ? ' selected' : ''}`;
        row.innerHTML = `
          <input type="radio" class="pf-radio" name="py-ver" value="${v.path}" ${selected ? 'checked' : ''}>
          <span class="pf-label">${v.label}</span>
          ${v.recommended ? '<span class="pf-badge">Рекомендуется</span>' : ''}
          ${v.current ? '<span class="pf-badge" style="background:var(--accent-dim);color:var(--accent)">Текущий</span>' : ''}
        `;
        row.addEventListener('change', () => {
          this._selectedPython = v.path;
          document.querySelectorAll('.pf-version-row').forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
        });
        list.appendChild(row);
      });

      if (nextBtn) nextBtn.disabled = false;
    } catch (e) {
      area.innerHTML = `<div style="color:var(--danger);font-size:13px;">Ошибка при поиске Python: ${e}</div>`;
    }
  },

  async _initFolderStep() {
    const settings = await api.getSettings();
    const input = document.getElementById('wizard-folder-path');
    if (input) {
      input.value = settings.projects_dir || '';
    }
  },

  async pickFolder() {
    const path = await api.openFileDialog('folder');
    if (path) {
      document.getElementById('wizard-folder-path').value = path;
    }
  },

  async _buildSummary() {
    const settings = await api.getSettings();
    const folderPath = document.getElementById('wizard-folder-path')?.value || settings.projects_dir;
    const summary = document.getElementById('wizard-summary');
    const pythonLabel = this._selectedPython || settings.python_path || 'Не выбран';

    summary.innerHTML = `
      <div class="sum-row">
        <div class="sum-icon">◈</div>
        <div>
          <div class="sum-text">Python: ${pythonLabel.split('/').pop() || pythonLabel.split('\\').pop()}</div>
          <div class="sum-sub">${pythonLabel}</div>
        </div>
      </div>
      <div class="sum-row">
        <div class="sum-icon">📁</div>
        <div>
          <div class="sum-text">Папка программ</div>
          <div class="sum-sub">${folderPath}</div>
        </div>
      </div>
      <div class="sum-row">
        <div class="sum-icon">✓</div>
        <div>
          <div class="sum-text">Готово к работе</div>
          <div class="sum-sub">Всё настроено и готово</div>
        </div>
      </div>`;
  },

  async finish() {
    const folderPath = document.getElementById('wizard-folder-path')?.value;

    // Save settings
    const updates = {};
    if (folderPath) updates.projects_dir = folderPath;
    if (this._selectedPython) {
      updates.python_path = this._selectedPython;
      await api.setPythonPath(this._selectedPython);
    }
    await api.saveSettings(updates);
    await api.completeFirstRun();

    this.hide();
    await catalog.load();
  },
};

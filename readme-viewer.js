/**
 * settings-page.js — Settings page logic
 */
const settings = {
  async load() {
    const s = await api.getSettings();
    const dirInput = document.getElementById('settings-projects-dir');
    if (dirInput) dirInput.value = s.projects_dir || '';

    themeManager.renderSwatches('theme-grid');
    this._renderAbout();
  },

  async pickProjectsDir() {
    const path = await api.openFileDialog('folder');
    if (!path) return;
    document.getElementById('settings-projects-dir').value = path;
    await api.saveSettings({ projects_dir: path });
    toast.show('Папка программ обновлена', 'success');
  },

  async _renderAbout() {
    const info = await api.getSystemInfo();
    const el = document.getElementById('about-info');
    if (!el) return;
    const rows = [
      ['Версия PyLaunch', '1.0.0'],
      ['Операционная система', `${info.os} ${info.architecture}`],
      ['Python', info.python],
      ['Папка данных', info.app_dir],
    ];
    el.innerHTML = rows.map(([l, v]) => `
      <div class="about-row">
        <span class="about-label">${l}</span>
        <span class="about-val">${v}</span>
      </div>`).join('');
  },
};

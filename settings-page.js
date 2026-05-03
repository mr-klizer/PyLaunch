/**
 * themes.js — Theme switching
 */
const themeManager = {
  themes: [
    { id:'midnight', name:'Ночь',   colors:{ bg:'#0d0f14', surface:'#1a1e2a', accent:'#5b7ef5', dot:'#4ade80' }},
    { id:'aurora',   name:'Аврора', colors:{ bg:'#050e12', surface:'#0e2230', accent:'#00c9a7', dot:'#00c9a7' }},
    { id:'sunset',   name:'Закат',  colors:{ bg:'#110a04', surface:'#251608', accent:'#f97316', dot:'#6ee7b7' }},
    { id:'frost',    name:'Иней',   colors:{ bg:'#eef2f7', surface:'#ffffff', accent:'#2563eb', dot:'#16a34a' }},
    { id:'forest',   name:'Лес',    colors:{ bg:'#060d06', surface:'#111e11', accent:'#4ade80', dot:'#4ade80' }},
    { id:'rose',     name:'Роза',   colors:{ bg:'#0d0509', surface:'#1e0f18', accent:'#e879a0', dot:'#6ee7b7' }},
  ],

  apply(themeId) {
    document.body.setAttribute('data-theme', themeId);
    localStorage.setItem('pylaunch-theme', themeId);
  },

  current() {
    return document.body.getAttribute('data-theme') || 'midnight';
  },

  renderSwatches(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const current = this.current();
    container.innerHTML = this.themes.map(t => `
      <div class="theme-swatch ${t.id === current ? 'active' : ''}"
           onclick="themeManager.selectTheme('${t.id}')"
           title="${t.name}">
        <div class="swatch-preview" style="background:${t.colors.bg}">
          <div class="sw-dot" style="background:${t.colors.surface};width:20px;height:20px;border-radius:4px;"></div>
          <div class="sw-dot" style="background:${t.colors.accent}"></div>
          <div class="sw-dot" style="background:${t.colors.dot}"></div>
        </div>
        <div class="swatch-label">${t.name}</div>
      </div>
    `).join('');
  },

  selectTheme(id) {
    this.apply(id);
    api.saveSettings({ theme: id });
    this.renderSwatches('theme-grid');
    toast.show(`Тема «${this.themes.find(t => t.id === id)?.name}» применена`, 'success');
  },
};

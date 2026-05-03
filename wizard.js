/* ══════════════════════════════════════════════════════════════════
   MAIN CSS  — uses only CSS variables from themes.css
   ══════════════════════════════════════════════════════════════════ */

/* ── Reset ───────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%; font-family: var(--font-ui); font-size: 14px;
  background: var(--bg-base); color: var(--text-primary);
  line-height: 1.6; -webkit-font-smoothing: antialiased;
  overflow: hidden; user-select: none;
}
.hidden { display: none !important; }

/* ── Scrollbar ───────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* ── App shell ───────────────────────────────────────────────────── */
.app-shell { display: flex; height: 100vh; overflow: hidden; }

/* ── Sidebar ─────────────────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 20px 0;
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 0 18px 24px;
}
.sidebar-logo [data-logo],
.wizard-logo [data-logo] {
  display: flex; align-items: center; flex-shrink: 0;
  /* SVG color inherits from theme via CSS vars in logo.js */
}
.logo-text {
  font-size: 18px; font-weight: 700; letter-spacing: -.3px;
  color: var(--text-primary);
}
.nav-items {
  list-style: none; flex: 1; padding: 0 10px;
  display: flex; flex-direction: column; gap: 2px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-md);
  cursor: pointer; color: var(--text-secondary);
  font-size: 13.5px; font-weight: 500;
  transition: background .15s, color .15s;
}
.nav-item:hover { background: var(--bg-card); color: var(--text-primary); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); }

/* Icons: use text characters sized explicitly — never inherit */
.nav-icon {
  width: 20px; height: 20px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; line-height: 1;
}

.sidebar-bottom {
  padding: 16px 18px 0; border-top: 1px solid var(--border); margin-top: auto;
}
.sys-badge {
  font-size: 11px; font-family: var(--font-mono);
  color: var(--text-muted); padding: 6px 10px;
  background: var(--bg-card); border-radius: var(--radius-sm);
  border: 1px solid var(--border); overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}

/* ── Main content ────────────────────────────────────────────────── */
.main-content { flex: 1; overflow-y: auto; background: var(--bg-base); }
.page { display: none; padding: 32px 36px; min-height: 100%; }
.page.active { display: block; }

.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 28px; gap: 16px;
}
.page-header h1 {
  font-size: 22px; font-weight: 700; letter-spacing: -.4px;
  color: var(--text-primary);
}
.page-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* ── Inputs ──────────────────────────────────────────────────────── */
.search-input {
  background: var(--bg-card); border: 1px solid var(--border);
  color: var(--text-primary); font-family: var(--font-ui); font-size: 13px;
  padding: 8px 14px; border-radius: var(--radius-md);
  outline: none; width: 220px; transition: border-color .15s;
}
.search-input:focus { border-color: var(--border-focus); }
.search-input::placeholder { color: var(--text-muted); }

.folder-input {
  flex: 1; background: var(--bg-input); border: 1px solid var(--border);
  color: var(--text-primary); font-family: var(--font-mono); font-size: 12px;
  padding: 9px 14px; border-radius: var(--radius-md); outline: none;
}
.folder-input:focus { border-color: var(--border-focus); }

/* ── Buttons ─────────────────────────────────────────────────────── */
.btn-primary {
  background: var(--accent); color: var(--accent-text);
  border: none; padding: 9px 18px; border-radius: var(--radius-md);
  font-family: var(--font-ui); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background .15s, transform .1s; white-space: nowrap;
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { transform: scale(.98); }
.btn-primary:disabled { opacity: .4; cursor: not-allowed; }
.btn-primary.btn-large { padding: 12px 28px; font-size: 15px; }

.btn-outline {
  background: transparent; color: var(--text-primary);
  border: 1px solid var(--border); padding: 9px 18px;
  border-radius: var(--radius-md); font-family: var(--font-ui);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background .15s, border-color .15s; white-space: nowrap;
}
.btn-outline:hover { background: var(--bg-card); border-color: var(--text-muted); }

.btn-ghost {
  background: transparent; color: var(--text-secondary); border: none;
  padding: 9px 14px; border-radius: var(--radius-md);
  font-family: var(--font-ui); font-size: 13px;
  cursor: pointer; transition: color .15s, background .15s;
}
.btn-ghost:hover { color: var(--text-primary); background: var(--bg-card); }

.btn-danger {
  background: var(--danger-dim); color: var(--danger);
  border: 1px solid transparent; padding: 8px 16px;
  border-radius: var(--radius-md); font-family: var(--font-ui);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
}
.btn-danger:hover { background: var(--danger); color: var(--danger-text); }

.btn-success {
  background: var(--success-dim); color: var(--success);
  border: 1px solid transparent; padding: 8px 16px;
  border-radius: var(--radius-md); font-family: var(--font-ui);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
}
.btn-success:hover { background: var(--success); color: var(--success-text); }

/* ══════════════════════════════════════════════════════════════════
   CATALOG
   ══════════════════════════════════════════════════════════════════ */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); overflow: hidden;
  transition: border-color .2s, box-shadow .2s, transform .15s;
  box-shadow: var(--shadow-card);
}
.project-card:hover {
  border-color: var(--border-focus); transform: translateY(-2px);
  box-shadow: var(--shadow-card), 0 0 0 1px var(--accent-dim);
}

/* ── Banner / screenshot ─────────────────────────────────────────── */
.card-banner {
  width: 100%; height: 148px; overflow: hidden; position: relative;
  background: var(--bg-base); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.card-banner img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.card-banner-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  /* Theme-adaptive: background uses the hue from JS, lightness from theme.
     Dark themes: low lightness. Light theme (frost): higher lightness. */
  background: hsl(var(--ph-hue, 220), 28%, var(--ph-lightness, 18%));
}
.card-banner-placeholder .ph-letter {
  font-size: 52px; font-weight: 900; line-height: 1;
  /* Letter color: accent-colored, readable on both dark and light backgrounds */
  /* Dark themes: light letter (70% lightness). Light theme: dark letter (30%). */
  color: hsl(var(--ph-hue, 220), 55%, clamp(30%, calc(100% - var(--ph-lightness, 18%) * 0.6), 75%));
  opacity: 0.65;
  user-select: none; letter-spacing: -2px;
  text-shadow: 0 2px 12px rgba(0,0,0,.3);
}
/* Banner overlay — edit button shown on hover */
.card-banner-edit {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.5); opacity: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity .2s; cursor: pointer;
}
.project-card:hover .card-banner-edit { opacity: 1; }
.banner-edit-btn {
  background: rgba(255,255,255,.15); color: #fff;
  border: 1px solid rgba(255,255,255,.3);
  padding: 7px 14px; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: var(--font-ui); backdrop-filter: blur(4px);
  transition: background .15s;
}
.banner-edit-btn:hover { background: rgba(255,255,255,.25); }

/* ── Card body ───────────────────────────────────────────────────── */
.card-body { padding: 16px; }
.card-name {
  font-size: 15px; font-weight: 700; color: var(--text-primary);
  margin-bottom: 6px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.card-desc {
  font-size: 12.5px; color: var(--text-secondary); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden; min-height: 38px;
}
.card-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);
}
.card-status { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; }
.status-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.status-dot.installed  { background: var(--success); }
.status-dot.not-installed { background: var(--text-muted); }
.status-dot.running    { background: var(--running); animation: pulse 1.2s infinite; }
.status-dot.error      { background: var(--danger); }
@keyframes pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.5; transform:scale(.85); }
}
.card-actions { display: flex; gap: 6px; }
.card-btn {
  padding: 6px 14px; border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 600; cursor: pointer; border: none;
  transition: all .15s; font-family: var(--font-ui);
}
.card-btn.run     { background: var(--success-dim); color: var(--success); }
.card-btn.run:hover { background: var(--success); color: var(--success-text); }
.card-btn.stop    { background: var(--danger-dim); color: var(--danger); }
.card-btn.stop:hover { background: var(--danger); color: var(--danger-text); }
.card-btn.install { background: var(--accent-dim); color: var(--accent); }
.card-btn.install:hover { background: var(--accent); color: var(--accent-text); }
.card-btn.more {
  background: var(--bg-base); color: var(--text-muted);
  border: 1px solid var(--border); padding: 6px 10px;
}
.card-btn.more:hover { color: var(--text-primary); border-color: var(--text-muted); }

/* Status overlay strip at bottom of card */
.card-status-overlay {
  padding: 10px 16px; background: var(--bg-base);
  border-top: 1px solid var(--border);
  font-size: 12px; display: none; align-items: center; gap: 8px; min-height: 38px;
  color: var(--text-secondary);
}
.card-status-overlay.visible { display: flex; }
.overlay-spinner {
  width: 12px; height: 12px; border: 2px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin .7s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty state ─────────────────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 80px 40px; gap: 16px;
}
.empty-icon { font-size: 56px; opacity: .1; margin-bottom: 8px; line-height: 1; }
.empty-state h2 { font-size: 20px; color: var(--text-primary); }
.empty-state p  { font-size: 14px; color: var(--text-secondary); max-width: 360px; }

/* ══════════════════════════════════════════════════════════════════
   IMPORT PAGE
   ══════════════════════════════════════════════════════════════════ */
.import-options {
  display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 16px; margin-bottom: 28px;
}
.import-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 28px 24px;
  cursor: pointer; transition: border-color .2s, transform .15s;
  display: flex; flex-direction: column; gap: 8px;
}
.import-card:hover { border-color: var(--border-focus); transform: translateY(-2px); }
.import-icon { font-size: 28px; margin-bottom: 4px; line-height: 1; }
.import-card h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.import-card p  { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

.import-progress { padding: 20px; }
.progress-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px;
  display: flex; align-items: center; gap: 20px;
}
.spinner-large {
  width: 32px; height: 32px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin .8s linear infinite; flex-shrink: 0;
}
.progress-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.progress-sub   { font-size: 12.5px; color: var(--text-secondary); margin-top: 4px; }

/* ══════════════════════════════════════════════════════════════════
   PYTHON PAGE
   ══════════════════════════════════════════════════════════════════ */
.info-box {
  background: var(--accent-dim); border: 1px solid var(--border-focus);
  border-radius: var(--radius-md); padding: 14px 16px;
  display: flex; gap: 12px; align-items: flex-start;
  margin-bottom: 24px; font-size: 13.5px; color: var(--text-primary);
}
.info-icon { color: var(--accent); font-size: 16px; flex-shrink: 0; padding-top: 1px; }
.versions-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
.version-item {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 14px 18px;
  display: flex; align-items: center; gap: 14px;
}
.version-label { font-size: 15px; font-weight: 600; font-family: var(--font-mono); color: var(--text-primary); flex: 1; }
.version-badge {
  font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px;
}
.version-badge.recommended { background: var(--success-dim); color: var(--success); }
.version-badge.active      { background: var(--accent-dim);  color: var(--accent);  }
.version-path { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); }

.python-download-section { margin-top: 28px; }
.python-download-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
.python-download-section p  { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
.version-tiles { display: flex; gap: 10px; flex-wrap: wrap; }
.version-tile {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 12px 20px;
  cursor: pointer; transition: border-color .15s; text-align: center;
}
.version-tile:hover { border-color: var(--border-focus); }
.version-tile .vt-num   { font-size: 16px; font-weight: 700; font-family: var(--font-mono); color: var(--text-primary); }
.version-tile .vt-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
.version-tile.rec { border-color: var(--success); }
.version-tile.rec .vt-label { color: var(--success); }

/* ══════════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ══════════════════════════════════════════════════════════════════ */
.settings-sections { display: flex; flex-direction: column; gap: 32px; }
.settings-section {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px;
}
.settings-section h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.settings-desc { font-size: 12.5px; color: var(--text-secondary); margin-bottom: 18px; }

.theme-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(110px,1fr)); gap: 10px; }
.theme-swatch {
  border-radius: var(--radius-md); overflow: hidden; cursor: pointer;
  border: 2px solid transparent; transition: border-color .15s, transform .15s;
}
.theme-swatch:hover { transform: scale(1.04); }
.theme-swatch.active { border-color: var(--accent); }
.swatch-preview {
  height: 56px; display: flex; align-items: flex-end; padding: 8px; gap: 5px;
}
.sw-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.swatch-label {
  padding: 6px 10px; font-size: 12px; font-weight: 600;
  background: var(--bg-surface); color: var(--text-primary);
}

.folder-picker { display: flex; gap: 10px; align-items: center; }
.about-info { font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px; }
.about-row  { display: flex; gap: 12px; }
.about-label { color: var(--text-muted); min-width: 140px; }
.about-val   { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }

/* ══════════════════════════════════════════════════════════════════
   WIZARD
   ══════════════════════════════════════════════════════════════════ */
.wizard-overlay {
  position: fixed; inset: 0; background: var(--bg-base);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.wizard-container {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 20px; padding: 40px 48px; width: 580px;
  max-height: 90vh; overflow-y: auto; position: relative;
}
.wizard-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; font-size: 20px; font-weight: 700; }
.wizard-step { display: none; }
.wizard-step.active { display: block; }
.wizard-step h1 { font-size: 26px; font-weight: 800; letter-spacing: -.5px; margin-bottom: 10px; }
.wizard-subtitle { font-size: 14.5px; color: var(--text-secondary); margin-bottom: 28px; line-height: 1.6; }

.wizard-choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.wizard-choice {
  background: var(--bg-card); border: 2px solid var(--border);
  border-radius: var(--radius-lg); padding: 22px 18px;
  cursor: pointer; text-align: left; transition: border-color .2s, transform .15s; font-family: var(--font-ui);
}
.wizard-choice:hover { border-color: var(--border-focus); transform: translateY(-2px); }
.wc-icon  { font-size: 26px; margin-bottom: 10px; color: var(--accent); line-height: 1; }
.wc-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
.wc-desc  { font-size: 12.5px; color: var(--text-secondary); line-height: 1.4; }

.wizard-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 28px; }
.wizard-dots { display: flex; justify-content: center; gap: 8px; margin-top: 32px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: background .2s, transform .2s; }
.dot.active { background: var(--accent); transform: scale(1.2); }

.python-check-area {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px;
  margin-bottom: 20px; min-height: 120px;
  display: flex; align-items: center; justify-content: center;
}
.checking-indicator { display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-secondary); font-size: 14px; }
.spinner {
  width: 28px; height: 28px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite;
}
.python-found { width: 100%; display: flex; flex-direction: column; gap: 10px; }
.pf-version-row {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  background: var(--bg-base); border-radius: var(--radius-md);
  cursor: pointer; border: 1px solid var(--border); transition: border-color .15s;
}
.pf-version-row:hover, .pf-version-row.selected { border-color: var(--border-focus); }
.pf-radio  { width: 16px; height: 16px; accent-color: var(--accent); }
.pf-label  { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); flex: 1; }
.pf-badge  { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; background: var(--success-dim); color: var(--success); }
.hint-text { font-size: 12px; color: var(--text-muted); margin-top: 8px; }

.setup-summary { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.sum-row  { display: flex; gap: 14px; font-size: 13.5px; }
.sum-icon { font-size: 18px; line-height: 1; }
.sum-text { color: var(--text-primary); }
.sum-sub  { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

/* ══════════════════════════════════════════════════════════════════
   MODALS
   ══════════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 900; backdrop-filter: blur(4px);
}
.modal-box {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 32px; max-width: 480px; width: 90%;
}
.modal-box h2 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--text-primary); }
.modal-box p  { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }

.error-modal { border-color: var(--danger); }
.error-icon {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--danger-dim); color: var(--danger);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 900; margin-bottom: 16px;
}
.error-details { margin-top: 16px; font-size: 12px; }
.error-details summary { cursor: pointer; color: var(--text-muted); padding: 4px 0; }
.error-details pre {
  margin-top: 8px; padding: 12px; background: var(--bg-base);
  border-radius: var(--radius-sm); font-family: var(--font-mono);
  font-size: 11px; color: var(--text-muted); overflow-x: auto;
  white-space: pre-wrap; max-height: 180px; overflow-y: auto;
}

.file-list { display: flex; flex-direction: column; gap: 6px; max-height: 260px; overflow-y: auto; margin-bottom: 16px; }
.file-item {
  padding: 10px 14px; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  cursor: pointer; font-family: var(--font-mono); font-size: 12.5px;
  color: var(--text-primary); transition: border-color .15s;
}
.file-item:hover { border-color: var(--border-focus); color: var(--accent); }

/* ══════════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════════ */
#toast-container { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 8px; z-index: 9999; }
.toast {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 12px 18px;
  font-size: 13.5px; color: var(--text-primary);
  box-shadow: 0 4px 20px rgba(0,0,0,.4); animation: toastIn .25s ease;
  display: flex; align-items: center; gap: 10px; max-width: 320px;
}
.toast.success { border-color: var(--success); }
.toast.error   { border-color: var(--danger);  }
.toast.info    { border-color: var(--accent);   }
@keyframes toastIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes toastOut { to   { opacity:0; transform:translateY(8px);  } }

/* ── Banner upload modal ─────────────────────────────────────────── */
.banner-modal-preview {
  width: 100%; height: 160px; background: var(--bg-base);
  border-radius: var(--radius-md); border: 2px dashed var(--border);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; margin-bottom: 16px; cursor: pointer;
  transition: border-color .15s;
}
.banner-modal-preview:hover { border-color: var(--border-focus); }
.banner-modal-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.banner-modal-placeholder { font-size: 13px; color: var(--text-muted); text-align: center; line-height: 1.8; }

/* ══════════════════════════════════════════════════════════════════
   CARD EXTRAS — entry row, terminal toggle
   ══════════════════════════════════════════════════════════════════ */

/* Entry point row */
.card-entry-row {
  display: flex; align-items: center; gap: 6px;
  margin: 8px 0 4px; padding: 5px 8px;
  background: var(--bg-base); border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.card-entry-label {
  font-family: var(--font-mono); font-size: 11.5px;
  color: var(--text-secondary); flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card-entry-change {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 2px 4px; border-radius: 4px;
  display: flex; align-items: center; transition: color .15s, background .15s;
  flex-shrink: 0;
}
.card-entry-change:hover { color: var(--accent); background: var(--accent-dim); }

/* Terminal toggle */
.card-terminal-toggle {
  display: flex; align-items: center; gap: 8px;
  margin: 8px 0; cursor: pointer; user-select: none;
}
.card-terminal-toggle input[type=checkbox] { display: none; }

.toggle-track {
  width: 32px; height: 18px; border-radius: 9px;
  background: var(--border); flex-shrink: 0; position: relative;
  transition: background .2s;
}
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--text-muted); transition: transform .2s, background .2s;
}
.card-terminal-toggle input:checked ~ .toggle-track { background: var(--accent-dim); border: 1px solid var(--accent); }
.card-terminal-toggle input:checked ~ .toggle-track .toggle-thumb {
  transform: translateX(14px); background: var(--accent);
}
.toggle-label { font-size: 12px; color: var(--text-secondary); }

/* Highlight current entry in picker */
.file-item.current { border-color: var(--accent); color: var(--accent); }

/* Empty state icon — no more text character squares */
.empty-icon { margin-bottom: 8px; opacity: .7; }

/* ══════════════════════════════════════════════════════════════════
   PYTHON INSTALL GUIDE
   ══════════════════════════════════════════════════════════════════ */
.install-guide {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-top: 8px;
}

.ig-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 13.5px; font-weight: 600; color: var(--text-primary);
}
.ig-header svg { flex-shrink: 0; }
.ig-header span { flex: 1; }
.ig-toggle {
  background: none; border: none; cursor: pointer;
  font-size: 12px; color: var(--text-muted);
  font-family: var(--font-ui); padding: 4px 8px;
  border-radius: var(--radius-sm); transition: color .15s, background .15s;
}
.ig-toggle:hover { color: var(--text-primary); background: var(--bg-base); }

.ig-body { padding: 8px 20px 20px; }

.ig-step {
  display: flex; gap: 16px; padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.ig-step:last-child { border-bottom: none; padding-bottom: 0; }

.ig-step-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--accent-dim); color: var(--accent);
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}

.ig-step-content { flex: 1; }
.ig-step-title {
  font-size: 14px; font-weight: 700;
  color: var(--text-primary); margin-bottom: 6px;
}
.ig-step-desc {
  font-size: 13px; color: var(--text-secondary);
  line-height: 1.65;
}
.ig-step-desc code {
  font-family: var(--font-mono); font-size: 11.5px;
  background: var(--bg-base); color: var(--accent);
  padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--border);
}

.ig-tip, .ig-warn {
  display: flex; align-items: flex-start; gap: 8px;
  margin-top: 10px; padding: 10px 12px;
  border-radius: var(--radius-sm); font-size: 12.5px; line-height: 1.5;
}
.ig-tip { background: var(--warning-dim); color: var(--text-primary); }
.ig-warn { background: var(--danger-dim); color: var(--text-primary); }
.ig-tip svg, .ig-warn svg { flex-shrink: 0; margin-top: 1px; }

/* Download tiles — add action label */
.vt-action {
  font-size: 10px; color: var(--accent);
  margin-top: 4px; font-weight: 600; letter-spacing: .3px;
}

/* ══════════════════════════════════════════════════════════════════
   COPY/LINK CHOICE MODAL
   ══════════════════════════════════════════════════════════════════ */
.copy-choice-btn {
  display: flex; align-items: flex-start; gap: 16px;
  background: var(--bg-card); border: 2px solid var(--border);
  border-radius: var(--radius-lg); padding: 18px 20px;
  cursor: pointer; text-align: left; width: 100%;
  font-family: var(--font-ui); transition: border-color .15s, transform .1s;
}
.copy-choice-btn:hover { border-color: var(--border-focus); transform: translateY(-1px); }
.copy-choice-icon { font-size: 26px; flex-shrink: 0; line-height: 1; padding-top: 2px; }
.copy-choice-title {
  font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 5px;
}
.copy-choice-desc { font-size: 12.5px; color: var(--text-secondary); line-height: 1.55; }

/* ══════════════════════════════════════════════════════════════════
   CARD TAGS — link_mode / copy indicator
   ══════════════════════════════════════════════════════════════════ */
.card-tags-row {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin: 6px 0 4px;
}
.card-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 600; padding: 2px 8px;
  border-radius: 100px; letter-spacing: .2px;
}
.tag-copy { background: var(--accent-dim);   color: var(--accent);  }
.tag-link { background: var(--warning-dim);  color: var(--warning); }
.tag-warn { background: var(--danger-dim);   color: var(--danger);  }

/* ══════════════════════════════════════════════════════════════════
   MARKDOWN BODY — README viewer
   ══════════════════════════════════════════════════════════════════ */
.md-body {
  flex: 1; overflow-y: auto;
  background: var(--bg-base); border-radius: var(--radius-md);
  padding: 20px 22px; border: 1px solid var(--border);
  color: var(--text-primary); font-size: 13.5px; line-height: 1.75;
  font-family: var(--font-ui);
}

.md-h  { color: var(--text-primary); font-weight: 700; margin: 18px 0 8px; line-height: 1.3; }
.md-h1 { font-size: 20px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.md-h2 { font-size: 17px; }
.md-h3 { font-size: 15px; }
.md-h4, .md-h5, .md-h6 { font-size: 13.5px; color: var(--text-secondary); }

.md-p  { margin: 6px 0; color: var(--text-secondary); }

.md-ul, .md-ol { padding-left: 20px; margin: 6px 0; }
.md-li { margin: 3px 0; color: var(--text-secondary); }

.md-code {
  display: block; background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  padding: 12px 14px; margin: 10px 0; overflow-x: auto;
  font-family: var(--font-mono); font-size: 12px;
  color: var(--text-primary); white-space: pre; line-height: 1.6;
}
.md-icode {
  font-family: var(--font-mono); font-size: 11.5px;
  background: var(--bg-surface); color: var(--accent);
  padding: 1px 6px; border-radius: 4px; border: 1px solid var(--border);
}

.md-bq {
  border-left: 3px solid var(--border-focus); margin: 8px 0;
  padding: 6px 14px; color: var(--text-muted);
  background: var(--accent-dim); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-style: italic;
}
.md-hr { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
.md-spacer { height: 8px; }
.md-link { color: var(--accent); text-decoration: underline; cursor: pointer; }
.md-link:hover { color: var(--accent-hover); }

/* ══════════════════════════════════════════════════════════════════
   MARKDOWN RENDERER STYLES
   ══════════════════════════════════════════════════════════════════ */
#readme-content { font-family: var(--font-ui) !important; white-space: normal !important; }

.md-h1 {
  font-size: 20px; font-weight: 800; color: var(--text-primary);
  margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
  letter-spacing: -.3px;
}
.md-h2 {
  font-size: 16px; font-weight: 700; color: var(--text-primary);
  margin: 18px 0 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border);
}
.md-h3 {
  font-size: 14px; font-weight: 700; color: var(--text-primary);
  margin: 14px 0 6px;
}
.md-p {
  font-size: 13.5px; color: var(--text-secondary);
  line-height: 1.7; margin: 0 0 8px;
}
.md-spacer { height: 6px; }
.md-hr {
  border: none; border-top: 1px solid var(--border);
  margin: 16px 0;
}
.md-ul, .md-ol {
  margin: 4px 0 10px 20px; padding: 0;
  color: var(--text-secondary); font-size: 13.5px; line-height: 1.7;
}
.md-ul li, .md-ol li { margin: 3px 0; }

.md-code-block {
  background: var(--bg-base); border: 1px solid var(--border);
  border-radius: var(--radius-md); margin: 10px 0; overflow: hidden;
}
.md-code-block pre {
  margin: 0; padding: 14px 16px; overflow-x: auto;
}
.md-code-block code {
  font-family: var(--font-mono); font-size: 12px;
  color: var(--text-secondary); white-space: pre;
}
.md-code {
  font-family: var(--font-mono); font-size: 12px;
  background: var(--bg-base); color: var(--accent);
  padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--border);
}
.md-bq {
  border-left: 3px solid var(--accent); margin: 8px 0;
  padding: 6px 14px; color: var(--text-muted);
  font-style: italic; font-size: 13.5px; background: var(--accent-dim);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

/* ══════════════════════════════════════════════════════════════════
   CARD TAGS
   ══════════════════════════════════════════════════════════════════ */
.card-tags-row {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin: 8px 0 4px;
}
.card-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  border-radius: 100px; white-space: nowrap;
}
.tag-copy  { background: var(--accent-dim);   color: var(--accent);   }
.tag-link  { background: var(--warning-dim);  color: var(--warning);  }
.tag-warn  { background: var(--danger-dim);   color: var(--danger);   }

/* README modal — wider and taller */
#readme-modal .modal-box {
  max-width: 700px; max-height: 82vh;
  display: flex; flex-direction: column;
}
#readme-content {
  flex: 1; overflow-y: auto; min-height: 120px; max-height: 60vh;
  background: var(--bg-base); border-radius: var(--radius-md);
  padding: 18px 20px; border: 1px solid var(--border);
}

/* ── Auto-close / disabled toggle ─────────────────────────────────────────── */
.card-toggles {
  display: flex; flex-direction: column; gap: 2px; margin: 6px 0 4px;
}
.toggle-disabled {
  opacity: .4; pointer-events: none; cursor: not-allowed;
}
.toggle-disabled .toggle-label { color: var(--text-muted); }

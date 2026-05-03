/**
 * app.js — Bootstrap and navigation
 *
 * THREADING MODEL:
 * - pywebview fires 'loaded' when HTML is parsed, but window.pywebview.api
 *   is injected asynchronously by WebView2 AFTER that — can be 1-8s later.
 * - main.py installs a JS poller that detects when api is ready and fires
 *   'pywebview-api-ready'. We wait for that event before touching the API.
 * - We NEVER poll window.pywebview.api in a tight loop — that blocks WebView2.
 * - All Python calls go through async api.xxx() which return Promises.
 *   We never await them on the UI thread without a try/catch.
 */

// ── Navigation ──────────────────────────────────────────────────────────────
const nav = {
  _loadTimer: null,
  _currentPage: null,

  show(pageId) {
    // Update active nav item immediately (visual feedback)
    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.page === pageId));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page-${pageId}`);
    if (page) page.classList.add('active');
    this._currentPage = pageId;

    // Debounce data loading — if user switches tabs quickly, only load
    // the final destination. Prevents parallel API calls and ghost windows
    // from half-initialised processes.
    clearTimeout(this._loadTimer);
    this._loadTimer = setTimeout(() => {
      if (this._currentPage !== pageId) return; // user moved on
      if (pageId === 'catalog')  catalog.load();
      if (pageId === 'python')   pythonMgr.load();
      if (pageId === 'settings') settings.load();
    }, 120); // 120ms — imperceptible to humans, long enough to skip rapid flicks
  },
};

// ── Wait for API ─────────────────────────────────────────────────────────────
// Returns a Promise that resolves only when window.pywebview.api is confirmed
// ready by the JS poller installed in main.py.
function waitForAPI() {
  return new Promise(resolve => {
    // Already ready (second navigation, hot reload, etc.)
    if (window.__pywebviewApiReady &&
        window.pywebview && window.pywebview.api &&
        typeof window.pywebview.api.get_projects === 'function') {
      resolve(); return;
    }
    // Primary: event fired by main.py JS poller
    const handler = () => { window.removeEventListener('pywebview-api-ready', handler); resolve(); };
    window.addEventListener('pywebview-api-ready', handler);
    // Safety net: if event was already dispatched before we subscribed
    setTimeout(() => {
      if (window.__pywebviewApiReady) {
        window.removeEventListener('pywebview-api-ready', handler);
        resolve();
      }
    }, 100);
  });
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  // Apply theme from localStorage immediately — no API call needed
  const savedTheme = localStorage.getItem('pylaunch-theme') || 'midnight';
  document.body.setAttribute('data-theme', savedTheme);

  showLoadingScreen('Запускаем PyLaunch...');

  // Wait for pywebview bridge — can take 1-15s on first cold start on Windows
  await waitForAPI();

  // Load settings — apply theme and update Python badge immediately
  try {
    const s = await api.getSettings();
    if (s && s.theme) {
      themeManager.apply(s.theme);
      localStorage.setItem('pylaunch-theme', s.theme);
    }
    // Show saved python label in sidebar badge right away (before full version scan)
    if (s && s.python_path) {
      const badge = document.getElementById('sys-python-badge');
      if (badge) {
        // Prefer python_label stored in settings (set when user picks a version).
        // Fallback: extract version from path folder name.
        // C:\Users\x\AppData\Local\Programs\Python\Python311\python.exe → Python 3.11
        // C:\Python314\python.exe → Python 3.14
        // /usr/bin/python3.11 → Python 3.11
        let label = s.python_label || '';
        if (!label) {
          const p = s.python_path.replace(/\\/g, '/');
          // Try to find PythonXYZ folder pattern
          const folderMatch = p.match(/[Pp]ython(\d)(\d+)/);
          if (folderMatch) {
            label = 'Python ' + folderMatch[1] + '.' + folderMatch[2];
          } else {
            // Try filename like python3.11
            const fileMatch = p.match(/python(\d+\.\d+)/i);
            label = fileMatch ? 'Python ' + fileMatch[1] : p.split('/').pop();
          }
        }
        badge.textContent = label || 'Python';
      }
    }
  } catch (e) { console.warn('Settings:', e); }

  hideLoadingScreen();

  // Check first run
  let isFirst = false;
  try { isFirst = await api.isFirstRun(); } catch (e) { console.warn('First run:', e); }

  if (isFirst) {
    wizard.show();
  } else {
    document.getElementById('app').classList.remove('hidden');
    nav.show('catalog');
  }
}

// ── Loading / splash screen ───────────────────────────────────────────────────
function showLoadingScreen(msg) {
  if (document.getElementById('startup-screen')) return;
  const el = document.createElement('div');
  el.id = 'startup-screen';
  el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg-base);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;font-family:var(--font-ui)';
  const logoHTML = (typeof Logo !== 'undefined') ? Logo.icon(64) : '';
  el.innerHTML = `
    ${logoHTML}
    <div style="font-size:22px;font-weight:700;color:var(--text-primary);letter-spacing:-.3px">PyLaunch</div>
    <div style="display:flex;align-items:center;gap:10px;color:var(--text-secondary);font-size:13px">
      <div style="width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--accent);
           border-radius:50%;animation:__spin .8s linear infinite"></div>
      <span id="startup-msg">${msg || 'Запускаем...'}</span>
    </div>
    <style>@keyframes __spin{to{transform:rotate(360deg)}}</style>`;
  document.body.appendChild(el);
}

function hideLoadingScreen() {
  const el = document.getElementById('startup-screen');
  if (!el) return;
  el.style.transition = 'opacity .25s';
  el.style.opacity = '0';
  setTimeout(() => el.remove(), 280);
}

document.addEventListener('DOMContentLoaded', bootstrap);

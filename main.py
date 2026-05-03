"""
PyLaunch — Entry point
"""
import sys, os, threading
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

try:
    import webview
except ImportError:
    print("pip install pywebview"); sys.exit(1)

from backend.api import PyLaunchAPI


# ── Single-instance guard ─────────────────────────────────────────────────────
# Uses a named Windows Mutex so only one copy of PyLaunch can run at a time.
# If a second instance starts, it brings the existing window to the foreground
# and exits immediately — no flicker, no ghost window.
def ensure_single_instance():
    """
    Returns a mutex handle that must be kept alive for the lifetime of the process.
    If another instance is already running: focus it and exit.
    Works in both .py and PyInstaller .exe mode.
    """
    if sys.platform != "win32":
        return None  # Linux/macOS: use file-lock fallback below

    import ctypes
    MUTEX_NAME = "PyLaunch_SingleInstance_Mutex_v1"
    ERROR_ALREADY_EXISTS = 183

    mutex = ctypes.windll.kernel32.CreateMutexW(None, False, MUTEX_NAME)
    last_err = ctypes.windll.kernel32.GetLastError()

    if last_err == ERROR_ALREADY_EXISTS:
        # Another instance is running — bring it to the front and quit
        _focus_existing_window()
        sys.exit(0)

    # Return handle so it stays alive (GC would release it otherwise)
    return mutex


def _focus_existing_window():
    """Find the existing PyLaunch window and bring it to the foreground."""
    import ctypes
    hwnd = ctypes.windll.user32.FindWindowW(None, "PyLaunch")
    if not hwnd:
        return
    SW_RESTORE = 9
    # Restore if minimised, then bring to front
    ctypes.windll.user32.ShowWindow(hwnd, SW_RESTORE)
    ctypes.windll.user32.SetForegroundWindow(hwnd)


def _single_instance_file_lock():
    """
    Fallback single-instance guard for Linux/macOS using a lock file.
    Returns the open file handle (must stay alive).
    """
    import tempfile, fcntl
    lock_path = os.path.join(tempfile.gettempdir(), "pylaunch.lock")
    fh = open(lock_path, "w")
    try:
        fcntl.lockf(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        print("[PyLaunch] Already running.")
        sys.exit(0)
    return fh


# ── Accessibility noise suppression ──────────────────────────────────────────
def suppress_accessibility_noise():
    sys.setrecursionlimit(150)
    orig_hook = sys.excepthook
    def hook(t, v, tb):
        s = str(v)
        if t is RecursionError: return
        if "AccessibilityObject" in s or "abstractmethods" in s: return
        orig_hook(t, v, tb)
    sys.excepthook = hook

    def thread_hook(args):
        s = str(args.exc_value)
        if args.exc_type is RecursionError: return
        if "AccessibilityObject" in s or "abstractmethods" in s: return
        sys.__excepthook__(args.exc_type, args.exc_value, args.exc_traceback)
    threading.excepthook = thread_hook


# ── JS bridge setup ───────────────────────────────────────────────────────────
def on_loaded(window_ref, api_instance):
    js = r"""
(function() {
  if (window.__pylaunchInit) return;
  window.__pylaunchInit = true;
  var t = setInterval(function() {
    if (window.pywebview && window.pywebview.api &&
        typeof window.pywebview.api.get_projects === 'function') {
      clearInterval(t);
      setInterval(function() {
        window.pywebview.api.drain_js_queue().then(function(cmds) {
          if (!Array.isArray(cmds)) return;
          cmds.forEach(function(c) { try { eval(c); } catch(e) {} });
        }).catch(function(){});
      }, 100);
      window.__pywebviewApiReady = true;
      window.dispatchEvent(new CustomEvent('pywebview-api-ready'));
    }
  }, 200);
})();
"""
    try:
        window_ref.evaluate_js(js)
    except Exception as e:
        print(f"[PyLaunch] on_loaded failed: {e}")


# ── Taskbar icon (Windows) ────────────────────────────────────────────────────
def _set_win32_icon(ico_path):
    if not os.path.exists(ico_path):
        return
    import ctypes

    def _apply():
        import time; time.sleep(1.5)
        try:
            hicon = ctypes.windll.user32.LoadImageW(
                None, ico_path, 1, 0, 0, 0x0010)
            if not hicon: return
            hwnd = ctypes.windll.user32.FindWindowW(None, "PyLaunch")
            if not hwnd: return
            ctypes.windll.user32.SendMessageW(hwnd, 0x0080, 0, hicon)
            ctypes.windll.user32.SendMessageW(hwnd, 0x0080, 1, hicon)
        except Exception as e:
            print(f"[PyLaunch] icon: {e}")

    threading.Thread(target=_apply, daemon=True).start()


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # Single-instance check FIRST — before any heavy imports or window creation
    if sys.platform == "win32":
        _mutex = ensure_single_instance()   # exits here if duplicate
    else:
        _lock  = _single_instance_file_lock()

    suppress_accessibility_noise()

    api = PyLaunchAPI()

    html_path = os.path.join(os.path.dirname(__file__), "frontend", "index.html")
    if not os.path.exists(html_path):
        print(f"index.html not found: {html_path}"); sys.exit(1)

    window = webview.create_window(
        title="PyLaunch",
        url=f"file://{os.path.abspath(html_path)}",
        js_api=api,
        width=1200, height=780,
        min_size=(900, 600),
        background_color="#0d0f14",
        text_select=True,
    )

    api.set_window(window)
    window.events.loaded += lambda: on_loaded(window, api)

    gui = "edgechromium" if sys.platform == "win32" else None

    if sys.platform == "win32":
        ico = os.path.join(os.path.dirname(__file__), "frontend", "assets", "pylaunch.ico")
        _set_win32_icon(ico)

    webview.start(gui=gui, debug=("--debug" in sys.argv))


if __name__ == "__main__":
    main()

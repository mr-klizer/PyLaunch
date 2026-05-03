"""
PyLaunch Backend API
Exposes Python functionality to the HTML frontend via pywebview JS bridge.
"""

import json
import os
import sys
import subprocess
import threading
import zipfile
import shutil
import platform
import re
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime

# ── Windows console suppression ────────────────────────────────────────────
# CREATE_NO_WINDOW prevents any subprocess from opening a console window.
# This must be passed as creationflags on EVERY subprocess call on Windows.
import sys as _sys
_IS_WIN = _sys.platform == "win32"
_CREATE_NO_WINDOW = 0x08000000 if _IS_WIN else 0

def _win_flags():
    """Return creationflags dict for Windows — empty on other platforms."""
    return {"creationflags": _CREATE_NO_WINDOW} if _IS_WIN else {}

def _run(cmd, **kwargs):
    """
    subprocess.run wrapper that ALWAYS passes CREATE_NO_WINDOW on Windows.
    Use this instead of subprocess.run everywhere in this file.
    """
    if _IS_WIN:
        kwargs.setdefault("creationflags", _CREATE_NO_WINDOW)
    return subprocess.run(cmd, **kwargs)

def _popen(cmd, **kwargs):
    """
    subprocess.Popen wrapper that ALWAYS passes CREATE_NO_WINDOW on Windows.
    Use for fire-and-forget processes (explorer, terminal launchers, etc).
    """
    if _IS_WIN:
        kwargs.setdefault("creationflags", _CREATE_NO_WINDOW)
    return subprocess.Popen(cmd, **kwargs)

# ── Paths ──────────────────────────────────────────────────────────────────
APP_DIR = Path.home() / ".pylaunch"
PROJECTS_FILE = APP_DIR / "projects.json"
SETTINGS_FILE = APP_DIR / "settings.json"
FIRST_RUN_FILE = APP_DIR / "first_run.json"
VENVS_DIR = APP_DIR / "venvs"
LOGS_DIR = APP_DIR / "logs"

BANNERS_DIR = APP_DIR / "banners"
for d in [APP_DIR, VENVS_DIR, LOGS_DIR, BANNERS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Error translations ──────────────────────────────────────────────────────
ERROR_TRANSLATIONS = {
    "ModuleNotFoundError": {
        "title": "Не хватает компонента",
        "pattern": r"ModuleNotFoundError: No module named '(.+?)'",
        "message": "Не найден компонент «{match}». Хотите установить его автоматически?",
        "action": "install_module",
        "action_label": "Установить компонент",
    },
    "FileNotFoundError": {
        "title": "Файл не найден",
        "pattern": r"FileNotFoundError.*?'(.+?)'",
        "message": "Программа не может найти файл «{match}». Проверьте, что все файлы на месте.",
        "action": None,
        "action_label": None,
    },
    "PermissionError": {
        "title": "Нет доступа",
        "pattern": r"PermissionError.*?'(.+?)'",
        "message": "Нет прав для работы с файлом «{match}». Попробуйте запустить от имени администратора.",
        "action": None,
        "action_label": None,
    },
    "ConnectionError": {
        "title": "Нет подключения к интернету",
        "pattern": r"ConnectionError",
        "message": "Программа не может подключиться к интернету. Проверьте соединение.",
        "action": None,
        "action_label": None,
    },
    "SyntaxError": {
        "title": "Ошибка в коде программы",
        "pattern": r"SyntaxError: (.+)",
        "message": "В коде программы ошибка: {match}. Обратитесь к разработчику.",
        "action": None,
        "action_label": None,
    },
    "MemoryError": {
        "title": "Не хватает памяти",
        "pattern": r"MemoryError",
        "message": "На вашем компьютере недостаточно оперативной памяти для этой программы.",
        "action": None,
        "action_label": None,
    },
    "ImportError": {
        "title": "Не удалось загрузить компонент",
        "pattern": r"ImportError: (.+)",
        "message": "Не удалось загрузить компонент: {match}. Попробуйте переустановить программу.",
        "action": "reinstall",
        "action_label": "Переустановить компоненты",
    },
}

def translate_error(traceback_text: str) -> dict:
    """Convert Python traceback to human-readable error."""
    for err_type, info in ERROR_TRANSLATIONS.items():
        if err_type in traceback_text:
            match_text = err_type
            if info["pattern"]:
                m = re.search(info["pattern"], traceback_text)
                if m:
                    match_text = m.group(1)
            return {
                "type": "error",
                "title": info["title"],
                "message": info["message"].format(match=match_text),
                "action": info["action"],
                "action_label": info["action_label"],
                "raw": traceback_text,
            }
    # Generic fallback
    lines = [l.strip() for l in traceback_text.strip().split("\n") if l.strip()]
    last_line = lines[-1] if lines else traceback_text
    return {
        "type": "error",
        "title": "Что-то пошло не так",
        "message": f"Произошла неожиданная ошибка: {last_line}",
        "action": None,
        "action_label": None,
        "raw": traceback_text,
    }


# ── Default settings ────────────────────────────────────────────────────────
DEFAULT_SETTINGS = {
    "theme": "midnight",
    "projects_dir": str(Path.home() / "PyLaunch Projects"),
    "python_path": sys.executable,
    "language": "ru",
    "first_run_done": False,
    "catalog_source": "local",
}

def load_settings() -> dict:
    if SETTINGS_FILE.exists():
        try:
            return json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return DEFAULT_SETTINGS.copy()

def save_settings(settings: dict):
    SETTINGS_FILE.write_text(json.dumps(settings, ensure_ascii=False, indent=2), encoding="utf-8")


def load_projects() -> list:
    if PROJECTS_FILE.exists():
        try:
            return json.loads(PROJECTS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return []

def save_projects(projects: list):
    PROJECTS_FILE.write_text(json.dumps(projects, ensure_ascii=False, indent=2), encoding="utf-8")


# ── Project scanning ────────────────────────────────────────────────────────
def scan_project_folder(folder: Path) -> dict:
    """Read README, requirements, detect entry point."""
    project = {
        "id": str(folder.name),
        "name": folder.name,
        "path": str(folder),
        "description": "",
        "requirements": [],
        "entry_point": None,
        "screenshot": None,
        "installed": False,
        "added": datetime.now().isoformat(),
        "tags": [],
    }

    # README
    for readme_name in ["README.md", "README.txt", "readme.md", "readme.txt", "README"]:
        readme_path = folder / readme_name
        if readme_path.exists():
            content = readme_path.read_text(encoding="utf-8", errors="replace")
            # Strip markdown headers for first paragraph
            lines = [l.strip() for l in content.split("\n") if l.strip() and not l.startswith("#")]
            project["description"] = " ".join(lines[:3])[:400] if lines else ""
            # Get name from first # heading
            for line in content.split("\n"):
                if line.startswith("# "):
                    project["name"] = line[2:].strip()
                    break
            break

    # requirements.txt
    for req_name in ["requirements.txt", "requirements.in", "require.txt"]:
        req_path = folder / req_name
        if req_path.exists():
            lines = req_path.read_text(encoding="utf-8", errors="replace").split("\n")
            project["requirements"] = [
                l.strip() for l in lines
                if l.strip() and not l.strip().startswith("#")
            ]
            break

    # Entry point detection (priority order)
    entry_candidates = ["main.py", "app.py", "run.py", "start.py", "__main__.py",
                        "index.py", "launcher.py", "gui.py"]
    for candidate in entry_candidates:
        if (folder / candidate).exists():
            project["entry_point"] = candidate
            break

    # Fallback: any .py file
    if not project["entry_point"]:
        py_files = list(folder.glob("*.py"))
        if py_files:
            project["entry_point"] = py_files[0].name

    # Banner / screenshot — look for common names AND any image in root
    banner_names = ["banner", "screenshot", "preview", "screen", "demo",
                    "cover", "thumbnail", "thumb", "background"]
    img_exts = [".png", ".jpg", ".jpeg", ".webp", ".gif"]
    found = None
    for name in banner_names:
        for ext in img_exts:
            p_img = folder / f"{name}{ext}"
            if p_img.exists():
                found = str(p_img); break
        if found: break
    # Fallback: first image in root folder
    if not found:
        for ext in img_exts:
            imgs = list(folder.glob(f"*{ext}"))
            if imgs:
                found = str(imgs[0]); break
    project["screenshot"] = found
    project["custom_banner"] = None  # set by user explicitly

    return project


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN API CLASS
# ─────────────────────────────────────────────────────────────────────────────
class PyLaunchAPI:
    """All methods exposed as window.pywebview.api.xxx() in the frontend."""

    def __init__(self, window=None):
        self.window = window
        self._running_processes = {}  # project_id -> subprocess.Popen
        self._stopped_by_user   = set()  # project IDs stopped intentionally
        import queue
        self._js_queue = queue.Queue()  # thread-safe JS command queue

    def set_window(self, window):
        self.window = window

    # ── Settings ────────────────────────────────────────────────────────────
    def get_settings(self):
        return load_settings()

    def save_settings(self, settings_dict):
        try:
            current = load_settings()
            current.update(settings_dict)
            save_settings(current)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def is_first_run(self):
        s = load_settings()
        return not s.get("first_run_done", False)

    def complete_first_run(self):
        s = load_settings()
        s["first_run_done"] = True
        save_settings(s)
        return {"ok": True}

    # ── Projects ─────────────────────────────────────────────────────────────
    def get_projects(self):
        return load_projects()

    def rescan_projects(self):
        """Re-scan all project folders."""
        projects = load_projects()
        updated = []
        for p in projects:
            folder = Path(p["path"])
            if folder.exists():
                scanned = scan_project_folder(folder)
                # Preserve installed status and id
                scanned["id"] = p.get("id", scanned["id"])
                scanned["installed"] = p.get("installed", False)
                updated.append(scanned)
        save_projects(updated)
        return updated

    def import_project(self, source_path: str, copy_mode: bool = True):
        """Import project from path: .zip, folder, or .py file.
        
        copy_mode=True  → copy files into PyLaunch Projects folder (backup).
        copy_mode=False → remember original path, run from there (link mode).
        ZIP archives always use copy_mode=True (they must be extracted).
        """
        source = Path(source_path)
        settings = load_settings()
        projects_dir = Path(settings.get("projects_dir", str(Path.home() / "PyLaunch Projects")))
        projects_dir.mkdir(parents=True, exist_ok=True)

        try:
            if source.suffix.lower() == ".zip":
                # ZIP always copies — must be extracted somewhere
                return self._import_zip(source, projects_dir)
            elif source.suffix.lower() == ".py":
                if copy_mode:
                    return self._import_single_py(source, projects_dir)
                else:
                    return self._import_link_py(source)
            elif source.is_dir():
                if copy_mode:
                    return self._import_folder(source, projects_dir)
                else:
                    return self._import_link_folder(source)
            else:
                return {"ok": False, "error": "Неподдерживаемый тип файла"}
        except Exception as e:
            return {"ok": False, "error": f"Ошибка при импорте: {e}"}

    def _import_zip(self, zip_path: Path, projects_dir: Path):
        dest = projects_dir / zip_path.stem
        if dest.exists():
            dest = projects_dir / f"{zip_path.stem}_{int(datetime.now().timestamp())}"
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(dest)
        # Flatten if single top-level folder
        contents = list(dest.iterdir())
        if len(contents) == 1 and contents[0].is_dir():
            inner = contents[0]
            for item in inner.iterdir():
                shutil.move(str(item), str(dest))
            inner.rmdir()
        return self._register_project(dest)

    def _import_single_py(self, py_path: Path, projects_dir: Path):
        dest = projects_dir / py_path.stem
        dest.mkdir(parents=True, exist_ok=True)
        shutil.copy2(py_path, dest / py_path.name)
        return self._register_project(dest)

    def _import_folder(self, folder: Path, projects_dir: Path):
        dest = projects_dir / folder.name
        if dest.exists():
            dest = projects_dir / f"{folder.name}_{int(datetime.now().timestamp())}"
        shutil.copytree(str(folder), str(dest))
        return self._register_project(dest)

    def _import_link_folder(self, folder: Path):
        """Register an existing folder without copying (link mode)."""
        project = scan_project_folder(folder)
        project["link_mode"] = True
        projects = load_projects()
        projects = [p for p in projects if p["path"] != str(folder)]
        projects.insert(0, project)
        save_projects(projects)
        return {"ok": True, "project": project}

    def _import_link_py(self, py_path: Path):
        """Register a single .py file without copying (link mode)."""
        project = {
            "id": py_path.stem,
            "name": py_path.stem,
            "path": str(py_path.parent),
            "description": f"Одиночный файл: {py_path.name}",
            "requirements": [],
            "entry_point": py_path.name,
            "screenshot": None,
            "custom_banner": None,
            "installed": False,
            "added": datetime.now().isoformat(),
            "tags": [],
            "link_mode": True,
        }
        projects = load_projects()
        projects = [p for p in projects if p["path"] != str(py_path.parent)]
        projects.insert(0, project)
        save_projects(projects)
        return {"ok": True, "project": project}

    def _register_project(self, folder: Path):
        project = scan_project_folder(folder)
        project["link_mode"] = False
        projects = load_projects()
        # Avoid duplicates
        projects = [p for p in projects if p["path"] != str(folder)]
        projects.insert(0, project)
        save_projects(projects)
        return {"ok": True, "project": project}

    def get_readme(self, project_id: str):
        """Return the README content for a project, or None if not found."""
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            return None
        folder = Path(target["path"])
        for name in ["README.md", "README.txt", "readme.md", "readme.txt", "README"]:
            path = folder / name
            if path.exists():
                try:
                    return {"ok": True, "content": path.read_text(encoding="utf-8", errors="replace"),
                            "filename": name}
                except Exception as e:
                    return {"ok": False, "error": str(e)}
        return {"ok": False, "error": "README не найден"}

    def delete_project(self, project_id: str, delete_files: bool = False):
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            return {"ok": False, "error": "Проект не найден"}

        if delete_files:
            folder = Path(target["path"])
            if folder.exists():
                err = self._safe_rmtree(folder)
                if err:
                    return {"ok": False, "error": err}

        # Remove venv (ignore errors — it's our own folder)
        import hashlib as _hl
        _safe_id = _hl.md5(project_id.encode()).hexdigest()[:12]
        _stored = target.get("venv_path")
        venv_path = Path(_stored) if _stored else (VENVS_DIR / _safe_id)
        if venv_path.exists():
            self._safe_rmtree(venv_path)

        projects = [p for p in projects if p["id"] != project_id]
        save_projects(projects)
        return {"ok": True}

    @staticmethod
    def _safe_rmtree(path: Path) -> str | None:
        """
        Delete a directory tree on Windows, handling:
        - Read-only files (.git, .idea, venv)
        - Files locked by another process
        Returns None on success, or a human-readable error string.
        """
        import stat, time

        def on_error(func, fpath, exc_info):
            """Called by shutil.rmtree on error — try to fix permissions."""
            try:
                os.chmod(fpath, stat.S_IWRITE | stat.S_IREAD)
                func(fpath)
            except Exception:
                pass  # Will be caught by the outer try

        try:
            shutil.rmtree(str(path), onerror=on_error)
            return None
        except PermissionError as e:
            # Extract just the offending filename for a friendly message
            bad = str(e).split("'")[1] if "'" in str(e) else str(path)
            bad_name = Path(bad).name
            return (
                f"Нет доступа к файлу «{bad_name}». "
                f"Возможно, файл используется другой программой (например, открыт в IDE). "
                f"Закройте все программы, работающие с этим проектом, и попробуйте снова."
            )
        except Exception as e:
            return f"Не удалось удалить файлы: {e}"

    def update_project_entry(self, project_id: str, entry_point: str):
        projects = load_projects()
        for p in projects:
            if p["id"] == project_id:
                p["entry_point"] = entry_point
                break
        save_projects(projects)
        return {"ok": True}

    def get_py_files(self, project_id: str):
        """
        Return only user-facing .py files from the project root.
        Aggressively skips all library, venv, cache, and tool folders.
        """
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            return []
        folder = Path(target["path"])

        # Any directory whose name matches these → skip the whole subtree
        SKIP_NAMES = {
            # virtualenvs
            "venv", ".venv", "env", ".env", "virtualenv",
            # package internals
            "site-packages", "dist-packages", "dist-info",
            "__pycache__", ".mypy_cache", ".pytest_cache", ".tox",
            # build artefacts
            "build", "dist", "sdist", "bdist", "egg-info", ".eggs", "_build",
            # version control / IDE
            ".git", ".hg", ".svn", ".idea", ".vscode", ".vs",
            # other runtimes
            "node_modules", "Lib", "lib", "lib64", "Scripts", "bin",
            "Include", "include",
        }

        def _is_user_file(py: Path) -> bool:
            rel = py.relative_to(folder)
            parts = rel.parts          # e.g. ('src', 'main.py')
            # Max depth: 2 subdirectory levels (e.g. src/utils/helper.py is ok,
            # but anything under site-packages nests much deeper)
            if len(parts) > 4:
                return False
            # Skip if ANY parent segment is a known system directory
            for part in parts[:-1]:
                low = part.lower()
                if low in SKIP_NAMES:
                    return False
                if low.endswith(".egg-info") or low.endswith(".dist-info"):
                    return False
                # Skip hidden directories (start with dot, e.g. .git, .venv)
                if low.startswith("."):
                    return False
            # Skip test fixtures / migration folders that are rarely entry points
            filename = py.name.lower()
            if filename.startswith("test_") or filename.endswith("_test.py"):
                return False
            return True

        results = []
        for py in folder.rglob("*.py"):
            if _is_user_file(py):
                rel = str(py.relative_to(folder)).replace("\\", "/")
                results.append(rel)

        # Sort: root-level files first, then by depth, then alphabetically
        results.sort(key=lambda p: (p.count("/"), p.lower()))
        return results

    # ── Installation ─────────────────────────────────────────────────────────
    def install_project(self, project_id: str):
        """Create venv and pip install requirements."""
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            return {"ok": False, "error": "Проект не найден"}

        settings = load_settings()
        python_path = settings.get("python_path", sys.executable)

        # ── Sanitize venv path: only ASCII, no spaces ──────────────────────
        # WinError 2 often comes from non-ASCII chars in the venv path.
        # We use a short hex-based id derived from the project path instead.
        import hashlib
        safe_id = hashlib.md5(project_id.encode()).hexdigest()[:12]
        venv_path = VENVS_DIR / safe_id

        def _install():
            try:
                # ── Step 0: Verify Python exists ───────────────────────────
                self._emit("install_status", {"project_id": project_id,
                    "status": "preparing", "message": "Проверяем Python..."})

                python_exe = Path(python_path)
                if not python_exe.exists():
                    # Try to find python in PATH as a fallback
                    found = shutil.which("python") or shutil.which("python3")
                    if found:
                        python_exe = Path(found)
                    else:
                        self._emit("install_status", {"project_id": project_id,
                            "status": "error",
                            "message": "Python не найден. Откройте раздел «Версии Python» и выберите интерпретатор."})
                        return

                # ── Step 1: Create venv ─────────────────────────────────────
                self._emit("install_status", {"project_id": project_id,
                    "status": "preparing", "message": "Подготавливаем рабочую среду..."})

                # Remove stale venv if it exists but is broken
                if venv_path.exists():
                    shutil.rmtree(venv_path, ignore_errors=True)

                result = _run(
                    [str(python_exe), "-m", "venv", str(venv_path)],
                    capture_output=True, text=True,
                    timeout=120
                )
                if result.returncode != 0:
                    detail = result.stderr or result.stdout or "неизвестная ошибка venv"
                    self._emit("install_status", {"project_id": project_id,
                        "status": "error",
                        "message": f"Не удалось создать рабочую среду: {detail[:200]}"})
                    return

                # ── Step 2: Locate python inside venv ──────────────────────
                bin_dir = "Scripts" if platform.system() == "Windows" else "bin"
                exe_name = "python.exe" if platform.system() == "Windows" else "python"
                venv_python = venv_path / bin_dir / exe_name

                if not venv_python.exists():
                    # Some Windows setups use pythonw.exe only
                    alt = venv_path / bin_dir / "python3.exe"
                    if alt.exists():
                        venv_python = alt
                    else:
                        self._emit("install_status", {"project_id": project_id,
                            "status": "error",
                            "message": "Рабочая среда создана, но Python внутри не найден. Попробуйте другую версию Python."})
                        return

                # ── Step 3: pip install via `python -m pip` ─────────────────
                # We NEVER call pip.exe directly — it may not exist on some builds.
                # `python -m pip` always works if pip is installed.
                requirements = target.get("requirements", [])

                if requirements:
                    self._emit("install_status", {"project_id": project_id,
                        "status": "installing",
                        "message": f"Устанавливаем {len(requirements)} компонент(ов)..."})

                    result = _run(
                        [str(venv_python), "-m", "pip", "install", "--upgrade", "pip",
                         "--quiet", "--no-input"],
                        capture_output=True, text=True, timeout=120
                    )

                    result = _run(
                        [str(venv_python), "-m", "pip", "install"] + requirements +
                        ["--quiet", "--no-input"],
                        capture_output=True, text=True,
                        cwd=target["path"],
                        timeout=300
                    )
                    if result.returncode != 0:
                        err = translate_error(result.stderr or result.stdout)
                        self._emit("install_status", {"project_id": project_id,
                            "status": "error", "message": err["message"]})
                        return

                # ── Done: persist venv path and installed flag ───────────────
                for p in projects:
                    if p["id"] == project_id:
                        p["installed"] = True
                        p["venv_path"] = str(venv_path)   # store for runner
                save_projects(projects)
                self._emit("install_status", {"project_id": project_id,
                    "status": "done", "message": "Программа готова к запуску!"})

            except subprocess.TimeoutExpired:
                self._emit("install_status", {"project_id": project_id,
                    "status": "error",
                    "message": "Установка заняла слишком много времени. Проверьте подключение к интернету."})
            except Exception as e:
                self._emit("install_status", {"project_id": project_id,
                    "status": "error",
                    "message": f"Неожиданная ошибка при подготовке: {e}"})

        threading.Thread(target=_install, daemon=True).start()
        return {"ok": True}

    def install_module(self, project_id: str, module_name: str):
        """Install a single missing module into project venv."""
        import hashlib as _hl
        _safe_id = _hl.md5(project_id.encode()).hexdigest()[:12]
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        _stored = target.get("venv_path") if target else None
        venv_path = Path(_stored) if _stored else (VENVS_DIR / _safe_id)
        bin_dir = "Scripts" if platform.system() == "Windows" else "bin"
        exe_name = "python.exe" if platform.system() == "Windows" else "python"
        venv_python = venv_path / bin_dir / exe_name

        def _install():
            self._emit("install_status", {"project_id": project_id, "status": "installing",
                "message": f"Устанавливаем компонент «{module_name}»..."})
            result = _run([str(venv_python), "-m", "pip", "install", module_name,
                "--quiet", "--no-input"],
                capture_output=True, text=True)
            if result.returncode == 0:
                self._emit("install_status", {"project_id": project_id, "status": "done",
                    "message": f"Компонент «{module_name}» установлен!"})
            else:
                self._emit("install_status", {"project_id": project_id, "status": "error",
                    "message": f"Не удалось установить «{module_name}»"})

        threading.Thread(target=_install, daemon=True).start()
        return {"ok": True}

    # ── Running ──────────────────────────────────────────────────────────────
    def run_project(self, project_id: str):
        """Run a project in its venv."""
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            return {"ok": False, "error": "Проект не найден"}
        if not target.get("entry_point"):
            return {"ok": False, "error": "no_entry_point", "project_id": project_id}

        import hashlib as _hl
        _safe_id = _hl.md5(project_id.encode()).hexdigest()[:12]
        _stored = target.get("venv_path")
        venv_path = Path(_stored) if _stored else (VENVS_DIR / _safe_id)
        bin_dir = "Scripts" if platform.system() == "Windows" else "bin"
        exe_name = "python.exe" if platform.system() == "Windows" else "python"
        python_exe = venv_path / bin_dir / exe_name
        if not python_exe.exists():
            _alt = venv_path / bin_dir / "python3.exe"
            if _alt.exists():
                python_exe = _alt
            else:
                _s = load_settings()
                python_exe = Path(_s.get("python_path", sys.executable))
        entry = target.get("entry_point", "")
        with_terminal = target.get("with_terminal", False)

        # ── Launch mode decision ──────────────────────────────────────────────
        # Problem with previous "cmd /c start cmd /k bat" approach:
        # "start" is asynchronous — the outer cmd.exe finishes instantly,
        # communicate() returns, PyLaunch emits "finished" immediately.
        # Then the real window opens. Result: wrong status + double windows.
        #
        # Fix: run the target process DIRECTLY with Windows creation flags.
        #   CREATE_NEW_CONSOLE (0x10)    → new visible console window, 1 process
        #   CREATE_NO_WINDOW (0x8000000) → completely hidden
        # For "keep window open" mode we run a .bat DIRECTLY (no "start"),
        # so communicate() blocks until the user presses any key.

        _err_file = None

        if with_terminal and platform.system() == "Windows":
            # ── Single .bat approach for all with_terminal cases ─────────────
            # Why .bat (not direct Popen with CREATE_NEW_CONSOLE on python.exe):
            #   - Running python.exe directly with CREATE_NEW_CONSOLE opens a
            #     console but stdout/stderr fight with the visible window.
            #   - Using .bat gives us full control: stderr → temp file for error
            #     detection, stdout → visible console, pause optional.
            #   - communicate() blocks on the bat process, so PyLaunch tracks
            #     it correctly and the Stop button works the entire time.
            import tempfile as _tf2, hashlib as _hl2
            auto_close = target.get("auto_close_terminal", False)
            _uid       = _hl2.md5(project_id.encode()).hexdigest()[:8]
            _bat_dir   = Path(_tf2.gettempdir()) / "pylaunch_run"
            _bat_dir.mkdir(exist_ok=True)
            _err_file  = _bat_dir / ("err_" + _uid + ".txt")
            _bat_file  = _bat_dir / ("run_" + _uid + ".bat")

            py_p  = str(python_exe)
            sc_p  = str(Path(target["path"]) / entry)
            er_p  = str(_err_file)
            NL    = chr(13) + chr(10)  # CRLF required for .bat files
            Q     = chr(34)            # double-quote char

            # .bat lines: stdout → console (visible), stderr → temp file
            lines = [
                "@echo off",
                Q + py_p + Q + " -u " + Q + sc_p + Q + " 2>" + Q + er_p + Q,
                "set _RC=%ERRORLEVEL%",
            ]
            if not auto_close:
                # Keep window open so user can read output / error text
                lines += [
                    "echo.",
                    "echo --- Programma zavershila rabotu (kod: %_RC%) ---",
                    "pause",
                ]
            lines.append("exit /b %_RC%")

            _bat_file.write_text(NL.join(lines) + NL, encoding="cp866", errors="replace")

            # Run bat DIRECTLY with CREATE_NEW_CONSOLE so:
            #   • exactly one new visible console window appears
            #   • communicate() blocks until bat exits (auto_close) or
            #     user presses a key (not auto_close)
            #
            # CRITICAL: do NOT set stdin=DEVNULL here.
            # When CREATE_NEW_CONSOLE is used, the new window owns its own
            # stdin/stdout/stderr connected to the new console.
            # If we set stdin=DEVNULL, the `pause` command in the bat reads
            # from /dev/null and returns immediately — window closes at once.
            # Leaving stdin=None lets the new console provide its own keyboard.
            CREATE_NEW_CONSOLE = 0x00000010
            cmd = [str(_bat_file)]
            popen_kwargs = {
                "creationflags": CREATE_NEW_CONSOLE,
                # stdin/stdout/stderr intentionally NOT set — new console owns them
            }

        elif with_terminal and platform.system() == "Darwin":
            cmd = ["open", "-a", "Terminal", "--args", str(python_exe), entry]
            popen_kwargs = {}

        elif with_terminal:
            term = (shutil.which("gnome-terminal") or shutil.which("xterm") or
                    shutil.which("konsole") or shutil.which("x-terminal-emulator"))
            cmd = [term, "--", str(python_exe), entry] if term else [str(python_exe), entry]
            popen_kwargs = {}

        else:
            # Silent — no console window at all, capture all output via PIPE
            cmd = [str(python_exe), entry]
            popen_kwargs = {
                "stdout": subprocess.PIPE,
                "stderr": subprocess.PIPE,
                "stdin":  subprocess.DEVNULL,
                "creationflags": _CREATE_NO_WINDOW,
            }
            if platform.system() != "Windows":
                popen_kwargs.pop("creationflags")

        _err_file_path = _err_file

        def _thread_run():
            # Register proc BEFORE emitting running so stop button works immediately
            proc = None
            try:
                proc = subprocess.Popen(cmd, cwd=target["path"], text=True, **popen_kwargs)
                self._running_processes[project_id] = proc
                # Now signal UI — proc is already in dict so Stop button works
                self._emit("run_status", {"project_id": project_id, "status": "running",
                    "message": "Программа запущена"})

                stdout, stderr = proc.communicate()

                # Close stderr file handle if we used one (terminal mode)
                stderr_handle = popen_kwargs.get("stderr")
                if hasattr(stderr_handle, "close"):
                    try: stderr_handle.close()
                    except Exception: pass

                # Read captured stderr from temp file (terminal-Windows mode)
                if _err_file_path and _err_file_path.exists():
                    try:
                        stderr = _err_file_path.read_text(encoding="utf-8", errors="replace")
                        _err_file_path.unlink(missing_ok=True)
                    except Exception:
                        pass

                rc = proc.returncode
                user_stopped = project_id in self._stopped_by_user
                self._stopped_by_user.discard(project_id)

                if rc == 0 or user_stopped or (rc is not None and rc < 0):
                    self._emit("run_status", {"project_id": project_id, "status": "stopped",
                        "message": "Программа завершила работу"})
                else:
                    combined = ((stderr or "") + (stdout or "")).strip()
                    if combined:
                        err = translate_error(combined)
                    else:
                        err = {
                            "title": "Программа завершилась неожиданно",
                            "message": f"Программа закрылась с кодом {rc}. "
                                       "Возможно, она была закрыта вручную или произошла внутренняя ошибка.",
                            "action": None, "raw": ""
                        }
                    self._emit("run_status", {"project_id": project_id, "status": "error",
                        "error": err})
            except Exception as e:
                self._emit("run_status", {"project_id": project_id, "status": "error",
                    "error": {"title": "Ошибка запуска", "message": str(e), "action": None}})
            finally:
                self._running_processes.pop(project_id, None)

        threading.Thread(target=_thread_run, daemon=True).start()
        return {"ok": True}

    def stop_project(self, project_id: str):
        """Force-stop a running project.
        
        We mark the process as 'stopping' first so _thread_run knows not to
        treat a negative returncode as an error. The actual kill happens in a
        background thread so we return instantly to JS.
        """
        proc = self._running_processes.pop(project_id, None)
        if not proc:
            return {"ok": False, "error": "Процесс не найден"}

        # Mark as intentionally stopped BEFORE terminate so _thread_run sees it
        self._stopped_by_user.add(project_id)

        def _do_kill():
            import time
            try:
                proc.terminate()
                for _ in range(20):
                    if proc.poll() is not None:
                        break
                    time.sleep(0.1)
                if proc.poll() is None:
                    proc.kill()
            except Exception:
                pass
            self._emit("run_status", {
                "project_id": project_id,
                "status": "stopped",
                "message": "Программа остановлена"
            })

        threading.Thread(target=_do_kill, daemon=True).start()
        return {"ok": True}

    def get_running_projects(self):
        """Return project IDs whose processes are still alive."""
        # Clean up any processes that ended without emitting stopped
        dead = [pid for pid, proc in list(self._running_processes.items())
                if proc.poll() is not None]
        for pid in dead:
            proc = self._running_processes.pop(pid)
            rc = proc.returncode
            if rc == 0:
                self._emit("run_status", {"project_id": pid, "status": "stopped",
                    "message": "Программа завершила работу"})
            else:
                self._emit("run_status", {"project_id": pid, "status": "error",
                    "error": {"title": "Программа завершилась с ошибкой",
                              "message": f"Код завершения: {rc}", "action": None}})
        return list(self._running_processes.keys())

    # ── Python versions ──────────────────────────────────────────────────────
    def get_python_versions(self):
        """Detect installed Python versions."""
        versions = []
        # Use the saved python_path as "current", not sys.executable.
        # sys.executable inside a PyInstaller .exe is the bundled interpreter,
        # not the one the user selected.
        saved = load_settings().get("python_path", "")
        current = saved if saved and Path(saved).exists() else sys.executable

        # Check common paths
        candidates = []
        if platform.system() == "Windows":
            # Scan common install paths
            username = os.environ.get("USERNAME", "")
            for major in range(3, 4):
                for minor in range(8, 16):  # 3.8 – 3.15
                    for path in [
                        f"C:\\Python{major}{minor}\\python.exe",
                        f"C:\\Users\\{username}\\AppData\\Local\\Programs\\Python\\Python{major}{minor}\\python.exe",
                        f"C:\\Program Files\\Python{major}{minor}\\python.exe",
                    ]:
                        candidates.append(path)
            # Also scan Windows Registry for any Python installs
            try:
                import winreg
                for hive in [winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER]:
                    for base in [
                        r"SOFTWARE\Python\PythonCore",
                        r"SOFTWARE\WOW6432Node\Python\PythonCore",
                    ]:
                        try:
                            key = winreg.OpenKey(hive, base)
                            i = 0
                            while True:
                                try:
                                    ver_key = winreg.EnumKey(key, i); i += 1
                                    install_key = winreg.OpenKey(key, ver_key + r"\InstallPath")
                                    install_path, _ = winreg.QueryValueEx(install_key, None)
                                    exe = os.path.join(str(install_path).strip(), "python.exe")
                                    candidates.append(exe)
                                except OSError:
                                    break
                        except OSError:
                            pass
            except ImportError:
                pass
        else:
            for ver in ["python3.8", "python3.9", "python3.10", "python3.11", "python3.12", "python3.13", "python3.14"]:
                path = shutil.which(ver)
                if path:
                    candidates.append(path)

        seen = set()
        for path in candidates + [current]:
            if not path or path in seen:
                continue
            p = Path(path)
            if not p.exists():
                continue
            seen.add(path)
            try:
                result = _run([path, "--version"], capture_output=True, text=True, timeout=3)
                ver_str = (result.stdout or result.stderr).strip()
                ver_match = re.search(r"Python (\d+\.\d+\.\d+)", ver_str)
                if ver_match:
                    ver_num = ver_match.group(1)
                    parts = list(map(int, ver_num.split(".")))
                    versions.append({
                        "path": path,
                        "version": ver_num,
                        "label": f"Python {ver_num}",
                        "recommended": parts[1] == 11,  # 3.11 is recommended
                        "current": path == current,
                    })
            except Exception:
                pass

        versions.sort(key=lambda v: v["version"], reverse=True)
        return versions

    def set_python_path(self, path: str, label: str = ""):
        """Save chosen Python path and its human-readable label."""
        s = load_settings()
        s["python_path"] = path
        if label:
            s["python_label"] = label
        else:
            # Derive label from path so badge always shows version, not filename
            import re as _re
            folder_m = _re.search(r"[Pp]ython(\d)(\d+)", path.replace("\\", "/"))
            if folder_m:
                s["python_label"] = "Python {}.{}".format(folder_m.group(1), folder_m.group(2))
            else:
                file_m = _re.search(r"python(\d+\.\d+)", path, _re.IGNORECASE)
                s["python_label"] = "Python " + file_m.group(1) if file_m else path
        save_settings(s)
        return {"ok": True}

    def uninstall_python(self, python_path: str):
        """
        Attempt to uninstall a Python installation.
        On Windows, finds the uninstaller from the registry and runs it.
        On other platforms, informs the user to use their package manager.
        """
        if platform.system() != "Windows":
            return {"ok": False, "error":
                "Автоматическое удаление доступно только на Windows. "
                "Используйте менеджер пакетов вашей системы."}
        try:
            import winreg
            # Find the uninstall string for this Python in registry
            target_dir = str(Path(python_path).parent)
            for hive in [winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER]:
                for base in [
                    r"SOFTWARE\Python\PythonCore",
                    r"SOFTWARE\WOW6432Node\Python\PythonCore",
                ]:
                    try:
                        key = winreg.OpenKey(hive, base)
                        i = 0
                        while True:
                            try:
                                ver_key = winreg.EnumKey(key, i); i += 1
                                try:
                                    install_key = winreg.OpenKey(key, ver_key + r"\InstallPath")
                                    install_path, _ = winreg.QueryValueEx(install_key, None)
                                    if str(install_path).strip().lower() == target_dir.lower():
                                        # Found it — get the uninstall command
                                        uninstall_key = winreg.OpenKey(key, ver_key + r"\Installer")
                                        uninstall_str, _ = winreg.QueryValueEx(uninstall_key, "UninstallString")
                                        # Run the uninstaller (quiet mode)
                                        subprocess.Popen(
                                            uninstall_str.split() + ["/passive"],
                                            creationflags=_CREATE_NO_WINDOW,
                                            close_fds=True,
                                        )
                                        return {"ok": True}
                                except OSError:
                                    pass
                            except OSError:
                                break
                    except OSError:
                        pass
        except ImportError:
            pass

        # Fallback: open Programs and Features
        import webbrowser
        webbrowser.open("ms-settings:appsfeatures")
        return {"ok": True, "fallback": True,
                "message": "Откройте «Установка и удаление программ» и удалите Python вручную."}

    def download_python(self, version: str):
        """Open Python download page in the system browser (not inside the app)."""
        url = f"https://www.python.org/downloads/release/python-{version.replace('.', '')}/"
        import webbrowser
        webbrowser.open(url)
        return {"ok": True, "url": url}

    def open_url_in_browser(self, url: str):
        """Open any URL in the default system browser."""
        import webbrowser
        webbrowser.open(url)
        return {"ok": True}

    # ── Generic project option setter ───────────────────────────────────────
    def set_project_option(self, project_id: str, key: str, value):
        """Set an arbitrary key on a project record and persist."""
        allowed = {'with_terminal', 'auto_close_terminal', 'entry_point', 'custom_banner', 'name', 'description'}
        if key not in allowed:
            return {"ok": False, "error": f"Unknown key: {key}"}
        projects = load_projects()
        for p in projects:
            if p["id"] == project_id:
                p[key] = value
                break
        save_projects(projects)
        return {"ok": True}

    # ── Banner management ────────────────────────────────────────────────────
    def set_banner(self, project_id: str, image_path):
        """Copy an image into the banners dir and record it for the project."""
        projects = load_projects()
        target = next((p for p in projects if p["id"] == project_id), None)
        if not target:
            return {"ok": False, "error": "Проект не найден"}

        if image_path is None:
            # Remove banner
            old_banner = target.get("custom_banner")
            if old_banner and Path(old_banner).exists():
                try: Path(old_banner).unlink()
                except Exception: pass
            target["custom_banner"] = None
            save_projects(projects)
            return {"ok": True, "banner_path": None}

        src = Path(image_path)
        if not src.exists():
            return {"ok": False, "error": "Файл не найден"}

        # Copy image into banners dir with a unique name
        import hashlib as _hl, time as _t
        uid = _hl.md5(f"{project_id}{_t.time()}".encode()).hexdigest()[:10]
        dst = BANNERS_DIR / f"{project_id}_{uid}{src.suffix.lower()}"
        shutil.copy2(str(src), str(dst))

        # Remove old custom banner file if exists
        old_banner = target.get("custom_banner")
        if old_banner and Path(old_banner).exists() and Path(old_banner) != dst:
            try: Path(old_banner).unlink()
            except Exception: pass

        target["custom_banner"] = str(dst)
        save_projects(projects)
        return {"ok": True, "banner_path": str(dst)}

    # ── File dialog helpers ──────────────────────────────────────────────────
    def open_file_dialog(self, dialog_type="folder"):
        """Open native file dialog. Returns selected path."""
        if self.window is None:
            return None
        try:
            if dialog_type == "folder":
                result = self.window.create_file_dialog(
                    dialog_type=20,  # FOLDER_DIALOG
                    allow_multiple=False
                )
            elif dialog_type == "zip":
                result = self.window.create_file_dialog(
                    dialog_type=10,  # OPEN_DIALOG
                    allow_multiple=False,
                    file_types=("ZIP архивы (*.zip)", "Python файлы (*.py)", "Все файлы (*.*)")
                )
            elif dialog_type == "image":
                result = self.window.create_file_dialog(
                    dialog_type=10,
                    allow_multiple=False,
                    file_types=("Изображения (*.png;*.jpg;*.jpeg;*.webp;*.gif)", "Все файлы (*.*)")
                )
            else:
                result = self.window.create_file_dialog(
                    dialog_type=10,
                    allow_multiple=False,
                    file_types=("Python файлы (*.py)", "Все файлы (*.*)")
                )
            if result:
                return result[0] if isinstance(result, (list, tuple)) else result
        except Exception:
            pass
        return None

    def reveal_in_explorer(self, path: str):
        p = Path(path)
        if platform.system() == "Windows":
            # explorer.exe is a GUI app — use DETACHED_PROCESS so it never
            # inherits our console handle (prevents flash on PyInstaller builds)
            DETACHED = 0x00000008
            subprocess.Popen(
                ["explorer", "/select,", str(p)],
                creationflags=_CREATE_NO_WINDOW | DETACHED,
                close_fds=True,
            )
        elif platform.system() == "Darwin":
            _popen(["open", str(p)])
        else:
            _popen(["xdg-open", str(p)])
        return {"ok": True}

    # ── JS queue drain (called from JS setInterval, UI-thread safe) ──────────
    def drain_js_queue(self):
        """Pop and execute all pending JS commands. Called from JS polling loop."""
        if not self.window:
            return []
        cmds = []
        try:
            while True:
                cmds.append(self._js_queue.get_nowait())
        except Exception:
            pass
        return cmds  # JS side executes these

    # ── System info ──────────────────────────────────────────────────────────
    def get_system_info(self):
        return {
            "os": platform.system(),
            "os_version": platform.version(),
            "python": sys.version,
            "python_path": sys.executable,
            "architecture": platform.architecture()[0],
            "app_dir": str(APP_DIR),
        }

    # ── Internal emit helper ─────────────────────────────────────────────────
    def _emit(self, event: str, data: dict):
        """Thread-safe event emit — pushes JS into a queue drained on UI thread."""
        if self.window:
            payload = json.dumps(data, ensure_ascii=False)
            js = f"window.dispatchEvent(new CustomEvent('{event}', {{detail: {payload}}}))"
            self._js_queue.put(js)

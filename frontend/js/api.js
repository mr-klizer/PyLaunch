/**
 * api.js — pywebview bridge wrapper
 */
const api = {
  _call(method, ...args) {
    return new Promise((resolve, reject) => {
      if (window.pywebview && window.pywebview.api) {
        try {
          const result = window.pywebview.api[method](...args);
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      } else {
        console.warn(`[API mock] ${method}(`, args, ')');
        resolve(apiMock[method] ? apiMock[method](...args) : null);
      }
    });
  },

  getSettings:        ()              => api._call('get_settings'),
  saveSettings:       (s)             => api._call('save_settings', s),
  isFirstRun:         ()              => api._call('is_first_run'),
  completeFirstRun:   ()              => api._call('complete_first_run'),

  getProjects:        ()              => api._call('get_projects'),
  rescanProjects:     ()              => api._call('rescan_projects'),
  importProject:      (path, copy)    => api._call('import_project', path, copy !== false),
  // deleteFiles must be explicit boolean — Python receives it as positional arg
  deleteProject:      (id, delFiles)  => api._call('delete_project', id, !!delFiles),
  getReadme:          (id)            => api._call('get_readme', id),
  updateProjectEntry: (id, entry)     => api._call('update_project_entry', id, entry),
  getPyFiles:         (id)            => api._call('get_py_files', id),

  installProject:     (id)            => api._call('install_project', id),
  installModule:      (id, mod)       => api._call('install_module', id, mod),

  runProject:         (id)            => api._call('run_project', id),
  stopProject:        (id)            => api._call('stop_project', id),
  getRunningProjects: ()              => api._call('get_running_projects'),

  getPythonVersions:  ()              => api._call('get_python_versions'),
  setPythonPath:      (path, label)   => api._call('set_python_path', path, label || ''),
  uninstallPython:    (path)          => api._call('uninstall_python', path),
  downloadPython:     (ver)           => api._call('download_python', ver),
  openUrlInBrowser:   (url)           => api._call('open_url_in_browser', url),

  openFileDialog:     (type)          => api._call('open_file_dialog', type),
  setBanner:          (id, path)      => api._call('set_banner', id, path),
  setProjectOption:   (id, k, v)      => api._call('set_project_option', id, k, v),
  revealInExplorer:   (path)          => api._call('reveal_in_explorer', path),
  getSystemInfo:      ()              => api._call('get_system_info'),
};

// ── Mock data (browser dev only) ─────────────────────────────────────────────
const apiMock = {
  get_settings:       () => ({ theme:'midnight', projects_dir:'C:\\PyLaunch', python_path:'C:\\Python311\\python.exe', first_run_done:true }),
  is_first_run:       () => false,
  get_projects:       () => ([
    { id:'demo', name:'Демо', description:'Тестовая программа', path:'C:\\demo', entry_point:'main.py', requirements:[], installed:true, screenshot:null, added: new Date().toISOString() }
  ]),
  get_python_versions: () => ([
    { path:'C:\\Python311\\python.exe', version:'3.11.9', label:'Python 3.11.9', recommended:true, current:true },
    { path:'C:\\Python312\\python.exe', version:'3.12.4', label:'Python 3.12.4', recommended:false, current:false },
  ]),
  set_python_path:    () => ({ ok: true }),
  update_project_entry: () => ({ ok: true }),
  get_py_files:       () => (['main.py', 'app.py', 'utils/helper.py']),
  delete_project:     () => ({ ok: true }),
  get_readme:         () => ({ ok: true, content: '# Demo\n\nTest readme.', filename: 'README.md' }),
  set_banner:         (id, path) => ({ ok:true, banner_path:path }),
  set_project_option: () => ({ ok:true }),
  uninstall_python:   () => ({ ok:true }),
  get_system_info:    () => ({ os:'Windows', python:'3.11.9', python_path:'C:\\Python311\\python.exe', architecture:'64bit', app_dir:'C:\\Users\\user\\.pylaunch' }),
};

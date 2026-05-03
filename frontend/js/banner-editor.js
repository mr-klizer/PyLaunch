/**
 * banner-editor.js — Project banner management
 * Allows picking an image file and saving it as the project banner.
 * Also handles auto-detection of banner images inside the project folder.
 */
const bannerEditor = {
  _currentProjectId: null,
  _selectedPath: null,

  open(projectId) {
    this._currentProjectId = projectId;
    this._selectedPath = null;
    const project = catalog._projects.find(p => p.id === projectId);

    // Build modal content
    const existing = project?.custom_banner || project?.screenshot;
    const preview = document.getElementById('banner-modal-preview');
    if (preview) {
      if (existing) {
        preview.innerHTML = `<img src="file://${existing}" alt="" style="width:100%;height:100%;object-fit:cover">`;
      } else {
        preview.innerHTML = `<div class="banner-modal-placeholder">
          Нажмите, чтобы выбрать изображение<br>
          <span style="font-size:11px;opacity:.6">PNG, JPG, WEBP — рекомендуется 800×450</span>
        </div>`;
      }
    }

    const title = document.getElementById('banner-modal-project');
    if (title) title.textContent = project?.name || '';

    document.getElementById('banner-modal').classList.remove('hidden');
  },

  close() {
    document.getElementById('banner-modal').classList.add('hidden');
    this._currentProjectId = null;
    this._selectedPath = null;
  },

  async pickImage() {
    const path = await api.openFileDialog('image');
    if (!path) return;
    this._selectedPath = path;
    const preview = document.getElementById('banner-modal-preview');
    if (preview) {
      preview.innerHTML = `<img src="file://${path}" alt="" style="width:100%;height:100%;object-fit:cover">`;
    }
  },

  async removeBanner() {
    if (!this._currentProjectId) return;
    const result = await api.setBanner(this._currentProjectId, null);
    if (result?.ok) {
      const p = catalog._projects.find(x => x.id === this._currentProjectId);
      if (p) { p.custom_banner = null; catalog._render(); }
      toast.show('Баннер удалён', 'success');
    }
    this.close();
  },

  async save() {
    if (!this._currentProjectId || !this._selectedPath) {
      this.close(); return;
    }
    const result = await api.setBanner(this._currentProjectId, this._selectedPath);
    if (result?.ok) {
      const p = catalog._projects.find(x => x.id === this._currentProjectId);
      if (p) {
        p.custom_banner = result.banner_path;
        // Re-render this card
        const card = document.getElementById(`card-${this._currentProjectId}`);
        if (card) card.outerHTML = catalog._cardHTML(p);
      }
      toast.show('Баннер сохранён', 'success');
    } else {
      toast.show(result?.error || 'Не удалось сохранить баннер', 'error');
    }
    this.close();
  },
};

/**
 * readme-viewer.js — Show project README with Markdown rendering
 * Pure JS renderer — no external libraries needed.
 */
const readmeViewer = {
  async open(projectId, projectName) {
    const modal   = document.getElementById('readme-modal');
    const titleEl = document.getElementById('readme-modal-title');
    const content = document.getElementById('readme-content');
    if (!modal) return;

    if (titleEl) titleEl.textContent = projectName + ' — описание';
    if (content) {
      content.innerHTML = '<span style="color:var(--text-muted)">Загружаем...</span>';
      content.style.fontFamily = '';
    }
    modal.classList.remove('hidden');

    try {
      const result = await api.getReadme(projectId);
      if (!content) return;
      if (result && result.ok) {
        content.style.fontFamily = 'var(--font-ui)';
        content.innerHTML = this._renderMarkdown(result.content);
      } else {
        content.style.fontFamily = 'var(--font-ui)';
        content.innerHTML = `<span style="color:var(--text-muted);font-style:italic">
          ${result?.error || 'README не найден в папке этой программы.'}</span>`;
      }
    } catch (e) {
      if (content) content.innerHTML = `<span style="color:var(--danger)">Ошибка: ${e}</span>`;
    }
  },

  close() {
    const modal = document.getElementById('readme-modal');
    if (modal) modal.classList.add('hidden');
  },

  // ── Minimal Markdown → HTML renderer ────────────────────────────────────────
  _renderMarkdown(md) {
    // Escape HTML first to prevent XSS
    const esc = s => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = md.split('\n');
    let html = '';
    let inCode = false;
    let inList = false;
    let codeLines = [];
    let codeLang = '';

    const closeList = () => {
      if (inList) { html += '</ul>'; inList = false; }
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw;

      // ── Fenced code block ───────────────────────────────────────────────
      if (line.startsWith('```')) {
        if (!inCode) {
          closeList();
          inCode = true;
          codeLang = esc(line.slice(3).trim());
          codeLines = [];
        } else {
          inCode = false;
          const langLabel = codeLang
            ? `<span style="color:var(--text-muted);font-size:11px;float:right;padding:4px 8px">${codeLang}</span>`
            : '';
          html += `<div class="md-code-block">${langLabel}<pre><code>${codeLines.map(esc).join('\n')}</code></pre></div>`;
          codeLines = [];
          codeLang = '';
        }
        continue;
      }
      if (inCode) { codeLines.push(line); continue; }

      // ── Headings ────────────────────────────────────────────────────────
      const h3 = line.match(/^### (.+)/);
      const h2 = line.match(/^## (.+)/);
      const h1 = line.match(/^# (.+)/);
      if (h1) { closeList(); html += `<h1 class="md-h1">${this._inline(esc(h1[1]))}</h1>`; continue; }
      if (h2) { closeList(); html += `<h2 class="md-h2">${this._inline(esc(h2[1]))}</h2>`; continue; }
      if (h3) { closeList(); html += `<h3 class="md-h3">${this._inline(esc(h3[1]))}</h3>`; continue; }

      // ── Horizontal rule ─────────────────────────────────────────────────
      if (/^[-*_]{3,}$/.test(line.trim())) { closeList(); html += '<hr class="md-hr">'; continue; }

      // ── Unordered list ──────────────────────────────────────────────────
      const li = line.match(/^[-*+] (.+)/);
      if (li) {
        if (!inList) { html += '<ul class="md-ul">'; inList = true; }
        html += `<li>${this._inline(esc(li[1]))}</li>`;
        continue;
      }

      // ── Ordered list ─────────────────────────────────────────────────────
      const oli = line.match(/^\d+\. (.+)/);
      if (oli) {
        if (!inList) { html += '<ol class="md-ol">'; inList = true; }
        html += `<li>${this._inline(esc(oli[1]))}</li>`;
        continue;
      }

      // ── Blockquote ───────────────────────────────────────────────────────
      const bq = line.match(/^> (.+)/);
      if (bq) { closeList(); html += `<blockquote class="md-bq">${this._inline(esc(bq[1]))}</blockquote>`; continue; }

      // ── Blank line ───────────────────────────────────────────────────────
      if (line.trim() === '') { closeList(); html += '<div class="md-spacer"></div>'; continue; }

      // ── Paragraph ────────────────────────────────────────────────────────
      closeList();
      html += `<p class="md-p">${this._inline(esc(line))}</p>`;
    }

    closeList();
    if (inCode && codeLines.length) {
      html += `<div class="md-code-block"><pre><code>${codeLines.map(esc).join('\n')}</code></pre></div>`;
    }

    return html;
  },

  // ── Inline markdown (bold, italic, code, links) ──────────────────────────
  _inline(s) {
    return s
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="#" onclick="api.openUrlInBrowser(\'$2\');return false" ' +
        'style="color:var(--accent)">$1</a>');
  },
};

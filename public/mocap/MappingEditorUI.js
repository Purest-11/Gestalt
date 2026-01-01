/**
 * 🎛️ Performer Mapping Editor UI
 * 
 * UI management for the performer (MediaPipe) mapping editor
 */

import { 
  getPerformerMappingEditor, 
  PERFORMER_AVAILABLE_PARAMS 
} from '../shared/MappingEditorCore.js';

export class MappingEditorUI {
  constructor() {
    this.editor = getPerformerMappingEditor();
    this.overlay = null;
    this.content = null;
    this.toast = null;
    this.fileInput = null;
    this.isZh = window.i18n && window.i18n.getCurrentLanguage() === 'zh';
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDOM());
    } else {
      this.setupDOM();
    }
  }

  setupDOM() {
    this.overlay = document.getElementById('mappingEditorOverlay');
    this.content = document.getElementById('mappingEditorContent');
    this.toast = document.getElementById('mappingToast');
    this.fileInput = document.getElementById('importFileInput');

    // Setup button events
    const openBtn = document.getElementById('openMappingEditorBtn');
    const closeBtn = document.getElementById('closeMappingEditorBtn');
    const exportBtn = document.getElementById('exportConfigBtn');
    const importBtn = document.getElementById('importConfigBtn');
    const resetBtn = document.getElementById('resetConfigBtn');

    if (openBtn) openBtn.addEventListener('click', () => this.open());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportConfig());
    if (importBtn) importBtn.addEventListener('click', () => this.triggerImport());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetConfig());

    // File input change
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
    }

    // Close on overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('visible')) {
        this.close();
      }
    });

    // Update button text based on language
    this.updateTexts();

    console.log('✅ Mapping Editor UI initialized');
  }

  updateTexts() {
    const mappingEditorText = document.getElementById('mappingEditorText');
    const mappingEditorTitle = document.getElementById('mappingEditorTitle');
    
    if (mappingEditorText) {
      mappingEditorText.textContent = this.isZh ? '映射编辑器' : 'Mapping Editor';
    }
    if (mappingEditorTitle) {
      mappingEditorTitle.textContent = this.isZh ? '演员映射编辑器' : 'Performer Mapping Editor';
    }
  }

  open() {
    if (!this.overlay) return;
    this.renderMappings();
    this.overlay.classList.add('visible');
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('visible');
  }

  renderMappings() {
    if (!this.content) return;

    const config = this.editor.config;
    let html = '';

    config.mappings.forEach((mapping, index) => {
      const param = this.editor.getParamInfo(mapping.id);
      const name = this.editor.getParamDisplayName(mapping.id);
      const desc = this.editor.getParamDescription(mapping.id);
      const isEnabled = mapping.enabled;

      html += `
        <div class="mapping-item ${isEnabled ? '' : 'disabled'}" data-index="${index}">
          <div class="mapping-item-header">
            <div>
              <div class="mapping-item-name">
                ${this.getParamIcon(mapping.id)} ${name}
              </div>
              <div class="mapping-item-desc">${desc}</div>
            </div>
            <div class="mapping-toggle ${isEnabled ? 'active' : ''}" 
                 onclick="window.mappingEditorUI.toggleMapping(${index})"></div>
          </div>
          <div class="mapping-item-body">
            <div class="mapping-field full-width">
              <label>${this.isZh ? 'OSC 地址' : 'OSC Address'}</label>
              <input type="text" 
                     value="${mapping.oscAddress || ''}" 
                     placeholder="${this.isZh ? '例如 /pigments/param' : 'e.g. /pigments/param'}"
                     onchange="window.mappingEditorUI.updateAddress(${index}, this.value)"
                     ${!isEnabled ? 'disabled' : ''}>
            </div>
            <div class="mapping-field">
              <label>${this.isZh ? '输入范围' : 'Input Range'}</label>
              <div class="mapping-range-group">
                <input type="number" step="any"
                       value="${mapping.inputRange[0]}" 
                       onchange="window.mappingEditorUI.updateInputRange(${index}, 0, this.value)"
                       ${!isEnabled ? 'disabled' : ''}>
                <span>→</span>
                <input type="number" step="any"
                       value="${mapping.inputRange[1]}" 
                       onchange="window.mappingEditorUI.updateInputRange(${index}, 1, this.value)"
                       ${!isEnabled ? 'disabled' : ''}>
              </div>
            </div>
            <div class="mapping-field">
              <label>${this.isZh ? '输出范围' : 'Output Range'}</label>
              <div class="mapping-range-group">
                <input type="number" step="any"
                       value="${mapping.outputRange[0]}" 
                       onchange="window.mappingEditorUI.updateOutputRange(${index}, 0, this.value)"
                       ${!isEnabled ? 'disabled' : ''}>
                <span>→</span>
                <input type="number" step="any"
                       value="${mapping.outputRange[1]}" 
                       onchange="window.mappingEditorUI.updateOutputRange(${index}, 1, this.value)"
                       ${!isEnabled ? 'disabled' : ''}>
              </div>
            </div>
            <div class="mapping-field">
              <label>${this.isZh ? '平滑处理' : 'Smoothing'}</label>
              <div class="mapping-smooth-group">
                <div class="mapping-smooth-toggle ${mapping.smooth ? 'active' : ''}"
                     onclick="window.mappingEditorUI.toggleSmooth(${index})"></div>
                <input type="number" 
                       class="mapping-smooth-factor"
                       value="${mapping.smoothFactor}" 
                       min="0" max="1" step="0.05"
                       placeholder="0.2"
                       onchange="window.mappingEditorUI.updateSmoothFactor(${index}, this.value)"
                       ${!isEnabled || !mapping.smooth ? 'disabled' : ''}>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    this.content.innerHTML = html;
  }

  getParamIcon(id) {
    const icons = {
      'left_hand_height': '🤚',
      'right_hand_height': '✋',
      'left_hand_x': '👈',
      'right_hand_x': '👉',
      'arm_spread': '🙌',
      'body_tilt': '🧍',
      'motion_speed': '💨',
      'left_hand_openness': '✊',
      'right_hand_openness': '🖐️'
    };
    return icons[id] || '🎛️';
  }

  toggleMapping(index) {
    const mapping = this.editor.config.mappings[index];
    if (mapping) {
      mapping.enabled = !mapping.enabled;
      this.editor.save();
      this.renderMappings();
      this.notifyOSCExporter();
    }
  }

  updateAddress(index, value) {
    const mapping = this.editor.config.mappings[index];
    if (mapping) {
      mapping.oscAddress = value.trim();
      this.editor.save();
      this.notifyOSCExporter();
    }
  }

  updateInputRange(index, pos, value) {
    const mapping = this.editor.config.mappings[index];
    if (mapping) {
      mapping.inputRange[pos] = parseFloat(value) || 0;
      this.editor.save();
      this.notifyOSCExporter();
    }
  }

  updateOutputRange(index, pos, value) {
    const mapping = this.editor.config.mappings[index];
    if (mapping) {
      mapping.outputRange[pos] = parseFloat(value) || 0;
      this.editor.save();
      this.notifyOSCExporter();
    }
  }

  toggleSmooth(index) {
    const mapping = this.editor.config.mappings[index];
    if (mapping) {
      mapping.smooth = !mapping.smooth;
      this.editor.save();
      this.renderMappings();
      this.notifyOSCExporter();
    }
  }

  updateSmoothFactor(index, value) {
    const mapping = this.editor.config.mappings[index];
    if (mapping) {
      mapping.smoothFactor = parseFloat(value) || 0.2;
      this.editor.save();
      this.notifyOSCExporter();
    }
  }

  exportConfig() {
    this.editor.exportToFile();
    this.showToast(this.isZh ? '配置已导出！' : 'Configuration exported!', 'success');
  }

  triggerImport() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  async handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const success = await this.editor.importFromFile(file);
    if (success) {
      this.showToast(this.isZh ? '配置已导入！' : 'Configuration imported!', 'success');
      this.renderMappings();
      this.notifyOSCExporter();
    } else {
      this.showToast(this.isZh ? '导入失败' : 'Import failed', 'error');
    }

    // Reset file input
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  }

  resetConfig() {
    if (confirm(this.isZh ? '确定要重置为默认配置吗？' : 'Reset to default configuration?')) {
      this.editor.resetToDefaults();
      this.showToast(this.isZh ? '配置已重置！' : 'Configuration reset!', 'success');
      this.renderMappings();
      this.notifyOSCExporter();
    }
  }

  showToast(message, type = 'success') {
    if (!this.toast) return;
    
    this.toast.textContent = message;
    this.toast.className = `mapping-toast visible ${type}`;
    
    setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 2500);
  }

  // Notify OSCExporter of config changes
  notifyOSCExporter() {
    // Dispatch event for OSCExporter to update its mapping config
    window.dispatchEvent(new CustomEvent('performerMappingUpdated', {
      detail: this.editor.config
    }));
  }
}

// Make instance available globally
window.mappingEditorUI = null;

export function initMappingEditorUI() {
  if (!window.mappingEditorUI) {
    window.mappingEditorUI = new MappingEditorUI();
  }
  return window.mappingEditorUI;
}




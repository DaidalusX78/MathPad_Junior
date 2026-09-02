/**
 * Accessible On-Screen Numerical Keypad Component
 * Supports touch, mouse, physical keyboard, and assistive switch navigation.
 */

import { audioManager } from '../core/audioManager.js';
import { studentProgress } from '../data/studentProgress.js';

export class NumKeypad {
  /**
   * @param {HTMLElement|string} container - Container element or ID
   * @param {Object} options - Configuration and callbacks
   * @param {Function} options.onSubmit - Callback when check/submit is triggered
   * @param {Function} options.getI18n - Callback to retrieve current i18n object
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = options;
    this.currentValue = '';
    this.maxDigits = 6;
    this.isActive = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  getI18n() {
    return this.options.getI18n ? this.options.getI18n() : {
      keypadPlaceholder: 'Tap or type...',
      keypadDel: 'Del',
      keypadSubmit: 'Check',
      keypadClear: 'Clear',
      keypadAriaNumber: 'Number',
      keypadAriaDelete: 'Backspace: delete last digit',
      keypadAriaSubmit: 'Check answer',
      keypadAriaClear: 'Clear all digits'
    };
  }

  render() {
    const t = this.getI18n();

    this.container.innerHTML = `
      <div class="keypad-card" role="region" aria-label="Numerical Keypad">
        <div class="keypad-display-wrapper">
          <div class="keypad-display-val placeholder" id="keypadDisplay" aria-live="polite" aria-atomic="true">
            ${t.keypadPlaceholder}
          </div>
          <button type="button" class="keypad-display-clear" id="keypadClearBtn" aria-label="${t.keypadAriaClear}">
            ${t.keypadClear}
          </button>
        </div>

        <div class="keypad-grid" role="group" aria-label="Number Keys">
          <button type="button" class="keypad-btn" data-key="1" aria-label="${t.keypadAriaNumber} 1">1</button>
          <button type="button" class="keypad-btn" data-key="2" aria-label="${t.keypadAriaNumber} 2">2</button>
          <button type="button" class="keypad-btn" data-key="3" aria-label="${t.keypadAriaNumber} 3">3</button>

          <button type="button" class="keypad-btn" data-key="4" aria-label="${t.keypadAriaNumber} 4">4</button>
          <button type="button" class="keypad-btn" data-key="5" aria-label="${t.keypadAriaNumber} 5">5</button>
          <button type="button" class="keypad-btn" data-key="6" aria-label="${t.keypadAriaNumber} 6">6</button>

          <button type="button" class="keypad-btn" data-key="7" aria-label="${t.keypadAriaNumber} 7">7</button>
          <button type="button" class="keypad-btn" data-key="8" aria-label="${t.keypadAriaNumber} 8">8</button>
          <button type="button" class="keypad-btn" data-key="9" aria-label="${t.keypadAriaNumber} 9">9</button>

          <button type="button" class="keypad-btn btn-del" data-action="del" aria-label="${t.keypadAriaDelete}">
            ⌫ <span class="btn-text-del">${t.keypadDel}</span>
          </button>
          <button type="button" class="keypad-btn" data-key="0" aria-label="${t.keypadAriaNumber} 0">0</button>
          <button type="button" class="keypad-btn btn-submit" data-action="submit" aria-label="${t.keypadAriaSubmit}">
            ✔ <span class="btn-text-submit">${t.keypadSubmit}</span>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.dataset.key !== undefined) {
        this.appendDigit(btn.dataset.key);
      } else if (btn.dataset.action === 'del') {
        this.backspace();
      } else if (btn.dataset.action === 'submit') {
        this.submit();
      } else if (btn.id === 'keypadClearBtn') {
        this.clear();
      }
    });

    // Keyboard listener on window
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    if (!this.isActive) return;

    // Do not intercept if user is typing into an input field (like name settings)
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
      return;
    }

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      this.appendDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      this.backspace();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.clear();
    }
  }

  appendDigit(digit) {
    if (this.currentValue.length >= this.maxDigits) return;
    this.currentValue += String(digit);
    this.updateDisplay();
    audioManager.playSound('click');
  }

  backspace() {
    if (this.currentValue.length > 0) {
      this.currentValue = this.currentValue.slice(0, -1);
      this.updateDisplay();
      audioManager.playSound('click');
    }
  }

  clear() {
    if (this.currentValue.length > 0) {
      this.currentValue = '';
      this.updateDisplay();
      audioManager.playSound('click');
    }
  }

  updateDisplay() {
    const display = document.getElementById('keypadDisplay');
    if (!display) return;

    const t = this.getI18n();
    if (this.currentValue.length === 0) {
      display.innerText = t.keypadPlaceholder;
      display.classList.add('placeholder');
    } else {
      display.innerText = this.currentValue;
      display.classList.remove('placeholder');
    }

    // Sync with target answer box recognition value if visible
    const recVal = document.getElementById('recognizedVal');
    if (recVal) {
      recVal.innerText = this.currentValue.length > 0 ? this.currentValue : '--';
    }
  }

  submit() {
    if (typeof this.options.onSubmit === 'function') {
      this.options.onSubmit(this.currentValue);
    }
  }

  getValue() {
    return this.currentValue;
  }

  setValue(val) {
    this.currentValue = val ? String(val) : '';
    this.updateDisplay();
  }

  setActive(active) {
    this.isActive = Boolean(active);
  }

  updateI18n() {
    this.render();
    this.updateDisplay();
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}

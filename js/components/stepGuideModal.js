/**
 * Step-by-Step Error Diagnosis & Interactive Guided Solver Modal Component
 */

import { DiagnosisEngine } from '../math/diagnosisEngine.js';
import { audioManager } from '../core/audioManager.js';
import { studentProgress } from '../data/studentProgress.js';

export class StepGuideModal {
  constructor(pageManager) {
    this.pageManager = pageManager;
    this.modalElem = null;
    this.currentBreakdown = null;
    this.currentStepIdx = 0;
    this.currentDiagnosis = null;
  }

  init() {
    this.modalElem = document.getElementById('stepGuideModal');
    if (!this.modalElem) return;

    this.modalElem.addEventListener('click', (e) => {
      if (e.target.id === 'stepGuideModal') {
        this.close();
      }
    });
  }

  getI18n() {
    return this.pageManager ? this.pageManager.getI18n() : {
      stepGuideTitle: 'Step-by-Step Guide',
      stepLabel: 'Step',
      readAloud: 'Read Aloud 🔊',
      prevStep: '← Previous',
      nextStep: 'Next Step →',
      gotIt: 'Got It! Let Me Try 💪',
      noBreakdownAvailable: 'Breakdown not available for this problem type.'
    };
  }

  open(questionItem, diagnosisResult = null) {
    if (!this.modalElem) this.init();
    if (!this.modalElem) return;

    const lang = studentProgress.currentLang || 'en';
    this.currentBreakdown = DiagnosisEngine.generateStepBreakdown(questionItem, lang);
    this.currentDiagnosis = diagnosisResult;
    this.currentStepIdx = 0;

    this.render();
    this.modalElem.classList.add('active');
    audioManager.playSound('click');
  }

  close() {
    if (this.modalElem) {
      this.modalElem.classList.remove('active');
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  render() {
    if (!this.modalElem) return;
    const t = this.getI18n();

    if (!this.currentBreakdown || !this.currentBreakdown.steps || this.currentBreakdown.steps.length === 0) {
      this.modalElem.innerHTML = `
        <div class="step-guide-modal-card" onclick="event.stopPropagation()">
          <div class="step-guide-header">
            <div class="step-guide-title">💡 ${t.stepGuideTitle || 'Step-by-Step Guide'}</div>
            <button class="modal-close" onclick="closeStepGuide()">✕</button>
          </div>
          <div style="padding: 20px; text-align: center; font-weight: 800; color: #64748b;">
            ${t.noBreakdownAvailable || 'Step-by-step guide is not available for this question.'}
          </div>
          <button class="step-finish-btn" onclick="closeStepGuide()">${t.gotIt || 'Close'}</button>
        </div>
      `;
      return;
    }

    const { type, a, b, expectedAns, steps } = this.currentBreakdown;
    const step = steps[this.currentStepIdx];
    const totalSteps = steps.length;
    const isLastStep = this.currentStepIdx === totalSteps - 1;

    // Diagnosis Hint Banner (if triggered by a mistake)
    let diagnosisHtml = '';
    if (this.currentDiagnosis && this.currentDiagnosis.hint) {
      diagnosisHtml = `
        <div class="step-guide-diagnosis-banner">
          <div class="step-guide-diagnosis-icon">💡</div>
          <div>${this.currentDiagnosis.hint}</div>
        </div>
      `;
    }

    // Render Math Visual Display
    let mathDisplayHtml = '';
    if (type === 'addition' || type === 'subtraction') {
      const opSymbol = type === 'addition' ? '+' : '−';
      mathDisplayHtml = `
        <div class="step-guide-math-box">
          <div class="step-guide-column-grid">
            <div class="step-guide-row">
              <span>${a}</span>
            </div>
            <div class="step-guide-row">
              <span class="step-guide-op-sign">${opSymbol}</span>
              <span>${b}</span>
            </div>
            <div class="step-guide-divider"></div>
            <div class="step-guide-answer-row">
              <span>${expectedAns}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      mathDisplayHtml = `
        <div class="step-guide-math-box">
          <div style="font-family: 'Fredoka', cursive, sans-serif; font-size: 2rem; font-weight: 900; color: var(--text-dark);">
            ${a} ${type === 'multiplication' ? '×' : '÷'} ${b} = <span style="color: #047857;">${expectedAns}</span>
          </div>
        </div>
      `;
    }

    this.modalElem.innerHTML = `
      <div class="step-guide-modal-card" onclick="event.stopPropagation()">
        <div class="step-guide-header">
          <div class="step-guide-title">
            <span>💡</span>
            <span>${t.stepGuideTitle || 'Step-by-Step Guide'}</span>
          </div>
          <button class="modal-close" onclick="closeStepGuide()" aria-label="Close">✕</button>
        </div>

        ${diagnosisHtml}

        ${mathDisplayHtml}

        <div class="step-explanation-card">
          <div class="step-explanation-top">
            <span class="step-badge">${t.stepLabel || 'Step'} ${this.currentStepIdx + 1} / ${totalSteps}</span>
            <button type="button" class="step-read-aloud-btn" onclick="readStepGuideAloud()" title="Read Step Aloud">
              🔊 <span>${t.readAloud || 'Read Aloud'}</span>
            </button>
          </div>
          <div class="step-explanation-text" id="stepExplanationText">
            ${step.text || ''}
          </div>
        </div>

        <div class="step-nav-controls">
          <button type="button" class="step-nav-btn" onclick="prevStepGuide()" ${this.currentStepIdx === 0 ? 'disabled' : ''}>
            ${t.prevStep || '← Previous'}
          </button>
          <button type="button" class="step-nav-btn primary" onclick="nextStepGuide()">
            ${isLastStep ? (t.gotIt || 'Got It! Let Me Try 💪') : (t.nextStep || 'Next Step →')}
          </button>
        </div>
      </div>
    `;
  }

  nextStep() {
    audioManager.playSound('click');
    if (!this.currentBreakdown || !this.currentBreakdown.steps) return;
    if (this.currentStepIdx < this.currentBreakdown.steps.length - 1) {
      this.currentStepIdx++;
      this.render();
    } else {
      this.close();
    }
  }

  prevStep() {
    audioManager.playSound('click');
    if (this.currentStepIdx > 0) {
      this.currentStepIdx--;
      this.render();
    }
  }

  readAloud() {
    if (!('speechSynthesis' in window)) return;
    const textElem = document.getElementById('stepExplanationText');
    if (!textElem) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textElem.innerText);
    utterance.lang = (studentProgress.currentLang === 'es') ? 'es-ES' : 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

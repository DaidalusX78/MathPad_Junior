/**
 * Practice Workbook Page Controller
 */

import { studentProgress } from '../data/studentProgress.js';
import { historyManager } from '../core/historyManager.js';
import { audioManager } from '../core/audioManager.js';
import { MathValidator } from '../math/validator.js';
import { OCRHandler } from '../math/ocrHandler.js';
import { ProceduralGenerator } from '../math/proceduralGenerator.js';
import { DiagnosisEngine } from '../math/diagnosisEngine.js';
import { NumKeypad } from '../components/numKeypad.js';
import { StepGuideModal } from '../components/stepGuideModal.js';

export class PracticePage {
  constructor(pageManager, canvasEngine) {
    this.pageManager = pageManager;
    this.canvasEngine = canvasEngine;

    this.activeMode = 'all_seq';
    this.sessionQuestions = [];
    this.currentIndex = 0;
    this.sessionScores = {};
    this.isAnswerRevealed = false;
    this.isShieldActive = true;
    this.inputMode = studentProgress.inputMode || 'draw';
    this.lastDiagnosis = null;

    this.numKeypad = new NumKeypad('keypadContainer', {
      onSubmit: (val) => this.submitKeypadAnswer(val),
      getI18n: () => this.pageManager.getI18n()
    });

    this.stepGuideModal = new StepGuideModal(this.pageManager);
  }

  startPractice(mode) {
    this.activeMode = mode;
    this.sessionScores = {};
    this.isAnswerRevealed = false;
    this.currentIndex = 0;
    this.lastDiagnosis = null;
    historyManager.clearSession();
    this.canvasEngine.inkStrokes = [];
    this.canvasEngine.currentStroke = null;
    if (this.numKeypad) this.numKeypad.clear();

    // Generate 10 fresh, unique procedural questions
    this.sessionQuestions = ProceduralGenerator.generateQuiz(mode, 10);

    this.pageManager.showScreen('screenPractice');
    this.setInputMode(studentProgress.inputMode || 'draw', false);
    this.updateLiveScoreDisplay();

    setTimeout(() => {
      this.canvasEngine.resize();
      this.canvasEngine.ctx.clearRect(0, 0, this.canvasEngine.canvas.width, this.canvasEngine.canvas.height);
      this.loadQuestion(0);
    }, 40);

    audioManager.playSound('click');
  }

  loadQuestion(index) {
    if (!this.sessionQuestions || this.sessionQuestions.length === 0) return;
    this.currentIndex = index;
    this.isAnswerRevealed = false;
    this.lastDiagnosis = null;

    if (this.numKeypad) {
      this.numKeypad.clear();
      this.numKeypad.setActive(this.inputMode === 'keypad');
    }

    const qItem = this.sessionQuestions[index];
    const t = this.pageManager.getI18n();

    document.getElementById('qNumber').innerText = `${t.categories[qItem.cat] || qItem.cat} (${index + 1}/10)`;
    document.getElementById('qCatTag').innerText = t.categories[qItem.cat] || qItem.cat;
    document.getElementById('qText').innerText = (studentProgress.currentLang === 'es') ? qItem.q_es : qItem.q_en;

    const guideBtn = document.getElementById('stepGuideBtn');
    if (guideBtn) guideBtn.style.display = 'none';

    document.getElementById('recognizedVal').innerText = '--';
    
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
      nextBtn.innerHTML = `<span>${(index === this.totalQuestions - 1) ? ('🏁 ' + t.finish) : (t.next + ' →')}</span>`;
    }

    historyManager.restoreQuestionState(index, this.canvasEngine.canvas, this.canvasEngine.ctx, (strokes) => {
      this.canvasEngine.inkStrokes = strokes;
    });
  }

  setInputMode(mode, save = true) {
    this.inputMode = mode;
    if (save) {
      studentProgress.setInputMode(mode);
    }

    const workspace = document.getElementById('mainWorkspace');
    if (workspace) {
      workspace.classList.toggle('mode-keypad', mode === 'keypad');
    }

    const btnDraw = document.getElementById('btnModeDraw');
    const btnKeypad = document.getElementById('btnModeKeypad');
    if (btnDraw && btnKeypad) {
      const isKeypad = mode === 'keypad';
      btnDraw.classList.toggle('active', !isKeypad);
      btnDraw.setAttribute('aria-checked', (!isKeypad).toString());
      btnKeypad.classList.toggle('active', isKeypad);
      btnKeypad.setAttribute('aria-checked', isKeypad.toString());
    }

    // Toggle check handwriting button label if in keypad vs draw
    const checkBtn = document.getElementById('checkHandwritingBtn');
    if (checkBtn) {
      checkBtn.style.display = (mode === 'keypad') ? 'none' : 'block';
    }

    // Toggle ink toolbar controls visibility
    const inkTools = document.querySelectorAll('.drawing-tools');
    inkTools.forEach((group) => {
      group.style.opacity = (mode === 'keypad') ? '0.4' : '1';
      group.style.pointerEvents = (mode === 'keypad') ? 'none' : 'auto';
    });

    if (this.numKeypad) {
      this.numKeypad.setActive(mode === 'keypad');
    }
  }

  submitKeypadAnswer(val) {
    const t = this.pageManager.getI18n();
    const qItem = this.sessionQuestions[this.currentIndex];

    if (!val || val.trim() === '') {
      this.showToast(t.keypadPlaceholder || 'Tap numbers first!', 'try-again');
      return;
    }

    const trimmed = val.trim();
    const isMatch = MathValidator.checkCandidates([trimmed], qItem);

    if (isMatch) {
      this.sessionScores[this.currentIndex] = true;
      const coinReward = (qItem.cat === 'word' || qItem.cat === 'geo' || qItem.cat === 'add' || qItem.cat === 'sub') ? 10 : 5;
      studentProgress.addCoins(coinReward);
      this.updateLiveScoreDisplay();
      audioManager.playSound('success');
      this.triggerFlyingCoinAnimation(coinReward);
      this.showToast(`🎉 ${t.correctMsg} (+${coinReward} 🪙)`, 'correct');

      const guideBtn = document.getElementById('stepGuideBtn');
      if (guideBtn) guideBtn.style.display = 'none';
    } else {
      audioManager.playSound('error');
      const lang = studentProgress.currentLang || 'en';
      const diagnosis = DiagnosisEngine.diagnose(trimmed, qItem, lang);
      this.lastDiagnosis = diagnosis;

      const guideBtn = document.getElementById('stepGuideBtn');
      if (guideBtn) guideBtn.style.display = 'block';

      if (diagnosis && diagnosis.hint) {
        this.showToast(`💡 ${diagnosis.hint}`, 'try-again');
      } else {
        this.showToast(`Detected "${trimmed}". Keep going!`, 'try-again');
      }
    }
  }

  saveCurrentCanvas() {
    historyManager.saveQuestionState(this.currentIndex, this.canvasEngine.canvas, this.canvasEngine.inkStrokes);
  }

  nextQuestion() {
    this.saveCurrentCanvas();
    if (this.currentIndex < this.totalQuestions - 1) {
      this.loadQuestion(this.currentIndex + 1);
    } else {
      this.showGradeScreen();
    }
    audioManager.playSound('click');
  }

  prevQuestion() {
    this.saveCurrentCanvas();
    if (this.currentIndex > 0) {
      this.loadQuestion(this.currentIndex - 1);
    }
    audioManager.playSound('click');
  }

  openStepGuide() {
    if (!this.sessionQuestions || this.sessionQuestions.length === 0) return;
    const qItem = this.sessionQuestions[this.currentIndex];
    this.stepGuideModal.open(qItem, this.lastDiagnosis);
  }

  async recognizeHandwriting() {
    const t = this.pageManager.getI18n();
    const qItem = this.sessionQuestions[this.currentIndex];
    const btn = document.getElementById('checkHandwritingBtn');

    if (this.canvasEngine.inkStrokes.length === 0) {
      this.showToast(t.noInkMsg, 'try-again');
      return;
    }

    const { boxStrokes, scratchStrokes } = OCRHandler.extractTargetBoxStrokes(this.canvasEngine.inkStrokes, this.canvasEngine.canvas);

    if (!boxStrokes || boxStrokes.length === 0) {
      const promptMsg = (studentProgress.currentLang === 'es')
        ? '✏️ ¡Escribe tu respuesta en el Recuadro!'
        : '✏️ Please write your answer in the Answer Box!';
      this.showToast(promptMsg, 'try-again');
      return;
    }

    btn.innerHTML = `<span>${t.checking}</span>`;
    btn.disabled = true;

    try {
      const candidates = await OCRHandler.recognizeStrokes(
        boxStrokes,
        this.canvasEngine.canvas.width,
        this.canvasEngine.canvas.height,
        studentProgress.currentLang
      );

      btn.innerHTML = `<span>${t.checkAnswer}</span>`;
      btn.disabled = false;

      if (candidates.length > 0) {
        const topDetected = candidates[0].trim();
        document.getElementById('recognizedVal').innerText = topDetected;

        const isMatch = MathValidator.checkCandidates(candidates, qItem);

        if (isMatch) {
          this.sessionScores[this.currentIndex] = true;
          const coinReward = (qItem.cat === 'word' || qItem.cat === 'geo' || qItem.cat === 'add' || qItem.cat === 'sub') ? 10 : 5;
          studentProgress.addCoins(coinReward);
          this.updateLiveScoreDisplay();
          audioManager.playSound('success');
          this.triggerFlyingCoinAnimation(coinReward);
          this.showToast(`🎉 ${t.correctMsg} (+${coinReward} 🪙)`, 'correct');

          const guideBtn = document.getElementById('stepGuideBtn');
          if (guideBtn) guideBtn.style.display = 'none';
        } else {
          audioManager.playSound('error');
          const lang = studentProgress.currentLang || 'en';
          const diagnosis = DiagnosisEngine.diagnose(topDetected, qItem, lang);
          this.lastDiagnosis = diagnosis;

          const guideBtn = document.getElementById('stepGuideBtn');
          if (guideBtn) guideBtn.style.display = 'block';

          if (diagnosis && diagnosis.hint) {
            this.showToast(`💡 ${diagnosis.hint}`, 'try-again');
          } else {
            this.showToast(`Detected "${topDetected}". Keep going!`, 'try-again');
          }
        }
      } else {
        this.showToast(t.couldNotReadMsg, 'try-again');
      }
    } catch (err) {
      console.warn('Handwriting recognition unavailable:', err);
      btn.innerHTML = `<span>${t.checkAnswer}</span>`;
      btn.disabled = false;
      const isOfflineMsg = !navigator.onLine
        ? (studentProgress.currentLang === 'es' ? 'Sin conexión para leer escritura. ¡Prueba el modo Teclado 🔢!' : 'Offline: switch to 🔢 Keypad Mode anytime!')
        : t.couldNotReadMsg;
      this.showToast(isOfflineMsg, 'try-again');
    }
  }

  triggerFlyingCoinAnimation(amount) {
    const targetBadge = document.getElementById('coinBadgePractice') || document.getElementById('coinBadgeHome');
    const sourceElem = document.getElementById('targetAnswerBox') || document.getElementById('paintCanvas');

    if (!targetBadge || !sourceElem) {
      this.updateCoinDisplays();
      return;
    }

    const sourceRect = sourceElem.getBoundingClientRect();
    const targetRect = targetBadge.getBoundingClientRect();

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;

    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const coin = document.createElement('div');
    coin.className = 'flying-coin-reward';
    coin.innerText = `🪙 +${amount}`;
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;
    coin.style.transform = 'translate(-50%, -50%) scale(1.35)';
    document.body.appendChild(coin);

    requestAnimationFrame(() => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      coin.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0.55)`;
      coin.style.opacity = '0.9';
    });

    setTimeout(() => {
      coin.remove();
      targetBadge.classList.remove('coin-badge-bounce');
      void targetBadge.offsetWidth;
      targetBadge.classList.add('coin-badge-bounce');
      this.updateCoinDisplays();
      audioManager.playSound('click');
      setTimeout(() => targetBadge.classList.remove('coin-badge-bounce'), 450);
    }, 650);
  }

  showToast(msg, type = 'correct') {
    const toast = document.getElementById('feedbackToast');
    if (!toast) return;
    toast.innerText = msg;
    toast.className = `feedback-toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3200);
  }

  updateCoinDisplays() {
    const coins = studentProgress.coins || 0;
    ['coinCountPractice', 'coinCountHome', 'coinCountDev', 'palmCoinCount'].forEach((id) => {
      const elem = document.getElementById(id);
      if (elem) elem.innerText = coins.toString();
    });
  }

  updateLiveScoreDisplay() {
    const score = Object.keys(this.sessionScores).length;
    const elem = document.getElementById('liveScoreCount');
    if (elem) elem.innerText = `${score}/10`;
    this.updateCoinDisplays();
  }

  showGradeScreen() {
    this.saveCurrentCanvas();
    this.pageManager.showScreen('screenGrade');

    const score = Object.keys(this.sessionScores).length;
    document.getElementById('gradeScoreVal').innerText = score;

    const coinsEarned = score * 5;
    const coinsElem = document.getElementById('gradeCoinsAwarded');
    if (coinsElem) {
      coinsElem.innerText = `+${coinsEarned} 🪙 Math Coins Earned!`;
    }

    const t = this.pageManager.getI18n();
    let title = t.gradeTitles[0];
    let icon = '🌱';

    if (score >= 8) {
      title = t.gradeTitles[2];
      icon = '🌟';
      audioManager.playSound('success');
    } else if (score >= 5) {
      title = t.gradeTitles[1];
      icon = '👏';
    }

    document.getElementById('gradeBadgeIcon').innerText = icon;
    document.getElementById('gradeTitle').innerText = title;
    document.getElementById('gradeSummaryMsg').innerText = `You scored ${score} out of 10! Keep up the amazing work!`;
  }

  togglePalmShield() {
    this.isShieldActive = !this.isShieldActive;
    const palmElem = document.getElementById('palmShield');
    if (palmElem) {
      palmElem.style.display = this.isShieldActive ? 'flex' : 'none';
    }
    const t = this.pageManager.getI18n();
    document.getElementById('palmModalBtn')?.classList.toggle('active', this.isShieldActive);
    const statusElem = document.getElementById('lblPalmStatus');
    if (statusElem) {
      statusElem.innerText = this.isShieldActive ? t.palmActive : t.palmOff;
    }
    audioManager.playSound('click');
  }

  updateI18n() {
    if (this.numKeypad) {
      this.numKeypad.updateI18n();
    }
    const t = this.pageManager.getI18n();
    const guideBtnText = document.getElementById('lblStepGuideBtn');
    if (guideBtnText) {
      guideBtnText.innerText = t.stepGuideBtn || '💡 Step Guide';
    }
  }
}

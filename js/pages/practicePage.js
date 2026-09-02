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

  startPractice(mode, totalQuestions = 10, difficulty = 'medium', format = 'lesson') {
    this.activeMode = mode;
    this.sessionFormat = format || 'lesson'; // 'lesson' | 'breaktime' | 'detention'
    this.difficulty = difficulty || 'medium';
    this.baseStarReward = (this.difficulty === 'easy') ? 5 : (this.difficulty === 'medium' ? 8 : 12);

    // Breaktime Dash grants 2x Star Multiplier for high-speed mental math!
    if (this.sessionFormat === 'breaktime') {
      this.baseStarReward *= 2;
    }

    this.sessionScores = {};
    this.sessionCoinsEarned = 0;
    this.isAnswerRevealed = false;
    this.currentIndex = 0;
    this.lastDiagnosis = null;
    historyManager.clearSession();
    this.canvasEngine.inkStrokes = [];
    this.canvasEngine.currentStroke = null;
    if (this.numKeypad) this.numKeypad.clear();

    // Clear any previous speed dash timer
    this.stopDashTimer();

    // Configure questions based on school period
    if (this.sessionFormat === 'detention') {
      const mistakes = studentProgress.getMistakes();
      if (mistakes.length > 0) {
        this.sessionQuestions = [...mistakes.slice(0, 10)];
        this.totalQuestions = this.sessionQuestions.length;
      } else {
        // Clean record bonus challenge
        this.totalQuestions = 3;
        this.sessionQuestions = ProceduralGenerator.generateQuiz(mode, 3, this.difficulty);
      }
    } else if (this.sessionFormat === 'breaktime') {
      // 60-second dash: provide a large queue of 30 rapid-fire questions
      this.totalQuestions = 30;
      this.sessionQuestions = ProceduralGenerator.generateQuiz(mode, 30, this.difficulty);
    } else {
      // Standard Class Lesson
      this.totalQuestions = parseInt(totalQuestions, 10) || 10;
      this.sessionQuestions = ProceduralGenerator.generateQuiz(mode, this.totalQuestions, this.difficulty);
    }

    this.pageManager.showScreen('screenPractice');
    this.setInputMode(studentProgress.inputMode || 'draw', false);
    this.updateLiveScoreDisplay();

    const palmShield = document.getElementById('palmShield');
    if (palmShield) {
      const mat = studentProgress.userPalmMat || 'mat_slate';
      palmShield.classList.remove('mat_slate', 'mat_woodcraft', 'mat_space', 'mat_neon_cyber');
      palmShield.classList.add(mat);
    }

    this.canvasEngine.setColor(studentProgress.getEquippedInkHex());

    setTimeout(() => {
      this.canvasEngine.resize();
      this.canvasEngine.ctx.clearRect(0, 0, this.canvasEngine.canvas.width, this.canvasEngine.canvas.height);
      this.loadQuestion(0);

      // Start 60-second dash timer if Breaktime Dash
      if (this.sessionFormat === 'breaktime') {
        this.startDashTimer();
      }
    }, 40);

    audioManager.playSound('click');
  }

  startDashTimer() {
    this.stopDashTimer();
    this.dashTimeLeft = 60;
    const timerBadge = document.getElementById('dashTimerBadge');
    const timerText = document.getElementById('dashTimerText');
    if (!timerBadge || !timerText) return;

    timerBadge.style.display = 'inline-flex';
    timerBadge.classList.remove('warning');
    timerText.innerText = '0:60';

    this.dashInterval = setInterval(() => {
      this.dashTimeLeft--;
      const sec = this.dashTimeLeft;
      const formatted = sec < 10 ? `0:0${sec}` : `0:${sec}`;
      timerText.innerText = formatted;

      if (sec <= 10) {
        timerBadge.classList.add('warning');
        audioManager.playSound('click');
      }

      if (sec <= 0) {
        this.stopDashTimer();
        audioManager.playSound('bell');
        this.showGradeScreen();
      }
    }, 1000);
  }

  stopDashTimer() {
    if (this.dashInterval) {
      clearInterval(this.dashInterval);
      this.dashInterval = null;
    }
    const timerBadge = document.getElementById('dashTimerBadge');
    if (timerBadge) {
      timerBadge.style.display = 'none';
      timerBadge.classList.remove('warning');
    }
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

    const pill = document.getElementById('qProgressPill');
    if (pill) pill.innerText = `${index + 1} / ${this.totalQuestions}`;

    const qNum = document.getElementById('qNumber');
    if (qNum) qNum.innerText = `${t.categories[qItem.cat] || qItem.cat} (${index + 1}/10)`;

    const catTag = document.getElementById('qCatTag');
    if (catTag) catTag.innerText = t.categories[qItem.cat] || qItem.cat;

    const qText = document.getElementById('qText');
    if (qText) qText.innerText = (studentProgress.currentLang === 'es') ? qItem.q_es : qItem.q_en;

    const guideBtn = document.getElementById('stepGuideBtn');
    if (guideBtn) guideBtn.style.display = 'none';

    const recognizedVal = document.getElementById('recognizedVal');
    if (recognizedVal) recognizedVal.innerText = '--';
    
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
      nextBtn.innerHTML = `<span>${(index === this.totalQuestions - 1) ? ('🏁 ' + t.finish) : (t.next + ' →')}</span>`;
    }

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
      prevBtn.disabled = (index === 0);
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

    // Keep check button visible in both keypad and draw modes
    const checkBtn = document.getElementById('checkHandwritingBtn');
    if (checkBtn) {
      checkBtn.style.display = 'block';
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

  checkAnswer() {
    if (this.inputMode === 'keypad') {
      const val = this.numKeypad ? this.numKeypad.getValue() : '';
      this.submitKeypadAnswer(val);
    } else {
      this.recognizeHandwriting();
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
      const wasAlreadyScored = !!this.sessionScores[this.currentIndex];
      const isSpecialCat = (qItem.cat === 'word' || qItem.cat === 'geo');
      const starReward = (this.baseStarReward || 8) + (isSpecialCat ? 4 : 0);
      if (!wasAlreadyScored) {
        this.sessionScores[this.currentIndex] = true;
        this.sessionCoinsEarned = (this.sessionCoinsEarned || 0) + starReward;
        this.triggerFlyingCoinAnimation(starReward, 'targetAnswerBox', 'scoreBadgePractice');
        const unlocked = studentProgress.recordQuestionAttempt(true, qItem.cat);
        if (unlocked && unlocked.length > 0) {
          setTimeout(() => {
            unlocked.forEach((b) => this.showToast(`🏅 Milestone: ${b.title} (+${b.stars} ⭐)!`, 'correct'));
          }, 1200);
        }
        studentProgress.resolveMistake(qItem.id);
      }
      this.updateLiveScoreDisplay();
      audioManager.playSound('success');
      this.showToast(`🎉 ${t.correctMsg} (+${starReward} ⭐)`, 'correct');

      const guideBtn = document.getElementById('stepGuideBtn');
      if (guideBtn) guideBtn.style.display = 'none';

      // Auto-advance in Breaktime Dash!
      if (this.sessionFormat === 'breaktime') {
        setTimeout(() => {
          if (this.dashTimeLeft > 0) this.nextQuestion();
        }, 400);
      }
    } else {
      studentProgress.recordQuestionAttempt(false, qItem.cat);
      studentProgress.addMistake(qItem);
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
          const wasAlreadyScored = !!this.sessionScores[this.currentIndex];
          const isSpecialCat = (qItem.cat === 'word' || qItem.cat === 'geo');
          const starReward = (this.baseStarReward || 8) + (isSpecialCat ? 4 : 0);
          if (!wasAlreadyScored) {
            this.sessionScores[this.currentIndex] = true;
            this.sessionCoinsEarned = (this.sessionCoinsEarned || 0) + starReward;
            this.triggerFlyingCoinAnimation(starReward, 'targetAnswerBox', 'scoreBadgePractice');
            const unlocked = studentProgress.recordQuestionAttempt(true, qItem.cat);
            if (unlocked && unlocked.length > 0) {
              setTimeout(() => {
                unlocked.forEach((b) => this.showToast(`🏅 Milestone: ${b.title} (+${b.stars} ⭐)!`, 'correct'));
              }, 1200);
            }
            studentProgress.resolveMistake(qItem.id);
          }
          this.updateLiveScoreDisplay();
          audioManager.playSound('success');
          this.showToast(`🎉 ${t.correctMsg} (+${starReward} ⭐)`, 'correct');

          const guideBtn = document.getElementById('stepGuideBtn');
          if (guideBtn) guideBtn.style.display = 'none';

          // Auto-advance in Breaktime Dash!
          if (this.sessionFormat === 'breaktime') {
            setTimeout(() => {
              if (this.dashTimeLeft > 0) this.nextQuestion();
            }, 400);
          }
        } else {
          studentProgress.recordQuestionAttempt(false, qItem.cat);
          studentProgress.addMistake(qItem);
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

  triggerFlyingCoinAnimation(amount, sourceId = 'targetAnswerBox', targetId = 'coinBadgePractice') {
    const targetBadge = document.getElementById(targetId) || document.getElementById('coinBadgePractice') || document.getElementById('coinBadgeHome');
    const sourceElem = document.getElementById(sourceId) || document.getElementById('targetAnswerBox') || document.getElementById('paintCanvas');

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
    coin.className = 'flying-star-reward';
    coin.innerText = `⭐ +${amount}`;
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
      targetBadge.classList.remove('star-badge-bounce');
      targetBadge.classList.remove('coin-badge-bounce');
      void targetBadge.offsetWidth;
      targetBadge.classList.add('star-badge-bounce');
      this.updateCoinDisplays();
      this.updateLiveScoreDisplay();
      audioManager.playSound('click');
      setTimeout(() => targetBadge.classList.remove('star-badge-bounce'), 450);
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
    const roundStars = this.sessionCoinsEarned || 0;
    const elem = document.getElementById('liveScoreCount');
    if (elem) elem.innerText = `${roundStars}`;
    this.updateCoinDisplays();
  }

  showGradeScreen() {
    this.stopDashTimer();
    this.saveCurrentCanvas();
    this.pageManager.showScreen('screenGrade');

    const score = Object.keys(this.sessionScores).length;
    const scoreValElem = document.getElementById('gradeScoreVal');
    const scoreSubtitleElem = document.getElementById('lblGradeScoreSubtitle');

    if (this.sessionFormat === 'breaktime') {
      if (scoreValElem) scoreValElem.innerText = `${score} Solved!`;
      if (scoreSubtitleElem) scoreSubtitleElem.innerText = 'Speed Sprint in 60s';
    } else if (this.sessionFormat === 'detention') {
      if (scoreValElem) scoreValElem.innerText = `${score} / ${this.totalQuestions}`;
      if (scoreSubtitleElem) scoreSubtitleElem.innerText = 'Mistakes Corrected';
    } else {
      if (scoreValElem) scoreValElem.innerText = `${score} / ${this.totalQuestions}`;
      if (scoreSubtitleElem) scoreSubtitleElem.innerText = 'Questions Correct';
    }

    // Bonus for high scores
    const effectiveTotal = (this.sessionFormat === 'breaktime') ? Math.max(score, 5) : (this.totalQuestions || 10);
    const ratio = score / effectiveTotal;
    const roundBonus = Math.round((ratio === 1.0) ? (effectiveTotal * 3) : (ratio >= 0.8 ? (effectiveTotal * 1.5) : 0));
    const totalStarsEarned = (this.sessionCoinsEarned || 0) + roundBonus;
    studentProgress.addStars(totalStarsEarned);

    const coinsElem = document.getElementById('gradeCoinsAwarded');
    if (coinsElem) {
      coinsElem.innerText = `+${totalStarsEarned} ⭐ Math Stars Banked!`;
    }

    // Transfer stars from round score badge to main bank!
    this.triggerFlyingCoinAnimation(totalStarsEarned, 'scoreBadgePractice', 'coinBadgePractice');

    // Record quiz completion for stats & score milestones
    const quizMilestones = studentProgress.recordQuizCompletion(score, this.totalQuestions);
    if (quizMilestones && quizMilestones.length > 0) {
      setTimeout(() => {
        quizMilestones.forEach((b) => this.showToast(`🏅 Milestone: ${b.title} (+${b.stars} ⭐)!`, 'correct'));
      }, 1500);
    }

    const t = this.pageManager.getI18n();
    let title = t.gradeTitles[0];
    let icon = '🌱';
    let summary = `You scored ${score} out of ${this.totalQuestions}! Keep up the amazing work!`;

    if (this.sessionFormat === 'breaktime') {
      icon = '🏃💨';
      title = (score >= 8) ? '⚡ Breaktime Champion!' : '🏃 Great Speed Sprint!';
      summary = `You answered ${score} questions in 60 seconds with double speed stars banked!`;
      audioManager.playSound('bell');
    } else if (this.sessionFormat === 'detention') {
      icon = '🛡️';
      title = '🎉 Detention Cleared!';
      summary = 'Outstanding resilience! You conquered your tricky questions and cleared your error record!';
      audioManager.playSound('success');
    } else {
      if (ratio >= 0.8) {
        title = t.gradeTitles[2];
        icon = '🌟';
        audioManager.playSound('success');
      } else if (ratio >= 0.5) {
        title = t.gradeTitles[1];
        icon = '👏';
      }
    }

    document.getElementById('gradeBadgeIcon').innerText = icon;
    document.getElementById('gradeTitle').innerText = title;
    document.getElementById('gradeSummaryMsg').innerText = summary;
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

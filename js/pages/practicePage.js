/**
 * Practice Workbook Page Controller
 */

import { studentProgress } from '../data/studentProgress.js';
import { historyManager } from '../core/historyManager.js';
import { audioManager } from '../core/audioManager.js';
import { MathValidator } from '../math/validator.js';
import { OCRHandler } from '../math/ocrHandler.js';

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
  }

  startPractice(mode) {
    this.activeMode = mode;
    this.sessionScores = {};
    this.isAnswerRevealed = false;
    this.currentIndex = 0;
    historyManager.clearSession();
    this.canvasEngine.inkStrokes = [];
    this.canvasEngine.currentStroke = null;

    const allQuestions = this.pageManager.curriculaData.questions || [];
    let pool = [];

    if (mode === 'all_seq') {
      const order = ['tables', 'mult', 'div', 'add', 'sub', 'word', 'geo'];
      pool = [...allQuestions].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));
    } else if (mode === 'random') {
      pool = [...allQuestions].sort(() => Math.random() - 0.5);
    } else {
      pool = allQuestions.filter((q) => q.cat === mode);
      pool.sort(() => Math.random() - 0.5);
    }

    this.sessionQuestions = [];
    for (let i = 0; i < 10; i++) {
      this.sessionQuestions.push(pool[i % pool.length]);
    }

    this.pageManager.showScreen('screenPractice');
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
    const qItem = this.sessionQuestions[index];
    const t = this.pageManager.getI18n();

    document.getElementById('qNumber').innerText = `${t.categories[qItem.cat] || qItem.cat} (${index + 1}/10)`;
    document.getElementById('qCatTag').innerText = t.categories[qItem.cat] || qItem.cat;
    document.getElementById('qText').innerText = (studentProgress.currentLang === 'es') ? qItem.q_es : qItem.q_en;

    const revealBtn = document.getElementById('revealBtn');
    revealBtn.innerText = t.showAnswer;
    revealBtn.classList.remove('revealed');

    document.getElementById('recognizedVal').innerText = '--';
    document.getElementById('prevBtn').disabled = (index === 0);
    document.getElementById('nextBtn').innerText = (index === 9) ? t.finish : (t.next + ' →');

    historyManager.restoreQuestionState(index, this.canvasEngine.canvas, this.canvasEngine.ctx, (strokes) => {
      this.canvasEngine.inkStrokes = strokes;
    });
  }

  saveCurrentCanvas() {
    historyManager.saveQuestionState(this.currentIndex, this.canvasEngine.canvas, this.canvasEngine.inkStrokes);
  }

  nextQuestion() {
    audioManager.playSound('click');
    this.saveCurrentCanvas();
    if (this.currentIndex < 9) {
      this.loadQuestion(this.currentIndex + 1);
    } else {
      this.showGradeScreen();
    }
  }

  prevQuestion() {
    audioManager.playSound('click');
    this.saveCurrentCanvas();
    if (this.currentIndex > 0) {
      this.loadQuestion(this.currentIndex - 1);
    }
  }

  toggleAnswer() {
    const btn = document.getElementById('revealBtn');
    const qItem = this.sessionQuestions[this.currentIndex];
    const t = this.pageManager.getI18n();
    const ans = (studentProgress.currentLang === 'es') ? qItem.a_es : qItem.a_en;

    this.isAnswerRevealed = !this.isAnswerRevealed;
    if (this.isAnswerRevealed) {
      btn.innerText = `💡 ${ans}`;
      btn.classList.add('revealed');
    } else {
      btn.innerText = t.showAnswer;
      btn.classList.remove('revealed');
    }
    audioManager.playSound('click');
  }

  async recognizeHandwriting() {
    const t = this.pageManager.getI18n();
    const qItem = this.sessionQuestions[this.currentIndex];
    const btn = document.getElementById('checkHandwritingBtn');

    if (this.canvasEngine.inkStrokes.length === 0) {
      this.showToast(t.noInkMsg, 'try-again');
      return;
    }

    const strokesToSend = OCRHandler.extractTargetBoxStrokes(this.canvasEngine.inkStrokes, this.canvasEngine.canvas);

    btn.innerHTML = `<span>${t.checking}</span>`;
    btn.disabled = true;

    try {
      const candidates = await OCRHandler.recognizeStrokes(
        strokesToSend,
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
          this.updateLiveScoreDisplay();
          audioManager.playSound('success');
          this.showToast(t.correctMsg, 'correct');

          const revealBtn = document.getElementById('revealBtn');
          revealBtn.innerText = `✅ ${(studentProgress.currentLang === 'es') ? qItem.a_es : qItem.a_en}`;
          revealBtn.classList.add('revealed');
          this.isAnswerRevealed = true;
        } else {
          this.showToast(`Detected "${topDetected}". Keep going!`, 'try-again');
        }
      } else {
        this.showToast(t.couldNotReadMsg, 'try-again');
      }
    } catch (err) {
      console.warn('Handwriting recognition unavailable:', err);
      btn.innerHTML = `<span>${t.checkAnswer}</span>`;
      btn.disabled = false;
      this.showToast(t.couldNotReadMsg, 'try-again');
    }
  }

  showToast(msg, type = 'correct') {
    const toast = document.getElementById('feedbackToast');
    if (!toast) return;
    toast.innerText = msg;
    toast.className = `feedback-toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2600);
  }

  updateLiveScoreDisplay() {
    const score = Object.keys(this.sessionScores).length;
    const elem = document.getElementById('liveScoreCount');
    if (elem) elem.innerText = `${score}/10`;
  }

  showGradeScreen() {
    this.saveCurrentCanvas();
    this.pageManager.showScreen('screenGrade');

    const score = Object.keys(this.sessionScores).length;
    document.getElementById('gradeScoreVal').innerText = score;

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
}

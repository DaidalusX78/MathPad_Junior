/**
 * MathPad Junior - Main Application Bootstrap (ES6 Modules)
 */

import { curriculaData } from './data/curricula.js';
import { studentProgress } from './data/studentProgress.js';
import { audioManager } from './core/audioManager.js';
import { CanvasEngine } from './core/canvasEngine.js';
import { historyManager } from './core/historyManager.js';
import { PageManager } from './pages/pageManager.js';
import { CoverPage } from './pages/coverPage.js';
import { PracticePage } from './pages/practicePage.js';

class App {
  constructor() {
    this.pageManager = new PageManager(curriculaData);
    this.canvasEngine = new CanvasEngine('paintCanvas', 'canvasContainer');
    this.coverPage = new CoverPage(this.pageManager);
    this.practicePage = new PracticePage(this.pageManager, this.canvasEngine);
    this.pageManager.practicePage = this.practicePage;

    // Bind window globals immediately so inline onclick handlers never fail
    this.bindWindowGlobals();
  }

  init() {
    studentProgress.applyStoredStyles();
    this.coverPage.init();
    this.pageManager.updateAllStaticText();

    // Initial paper texture & ink
    this.coverPage.selectPaper(studentProgress.userPaper);
    this.canvasEngine.setColor(studentProgress.getEquippedInkHex());

    // Initial screen check
    if (studentProgress.playerName) {
      this.pageManager.showScreen('screenHome');
    } else {
      this.pageManager.showScreen('screenWelcome');
    }

    this.initSplashScreen();

    // Check URL parameters for PWA app shortcuts (e.g. ?mode=tables or ?mode=random)
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam) {
      setTimeout(() => {
        this.practicePage.startPractice(modeParam);
      }, 100);
    }

    // Attach global listeners
    window.addEventListener('resize', () => {
      if (this.pageManager.currentScreen === 'screenPractice') {
        this.practicePage.saveCurrentCanvas();
        this.canvasEngine.resize();
        historyManager.restoreQuestionState(
          this.practicePage.currentIndex,
          this.canvasEngine.canvas,
          this.canvasEngine.ctx,
          (strokes) => {
            this.canvasEngine.inkStrokes = strokes;
          }
        );
      }
    });

    this.registerServiceWorker();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((reg) => {
            console.log('MathPad Junior PWA ServiceWorker registered successfully with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration failed:', err);
          });
      });
    }
  }

  initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    // Fast bypass if user has already seen splash screen in this session or has a hash/query
    const hasSeenSplash = sessionStorage.getItem('mathpad_splash_seen');
    const hasHash = !!window.location.hash;

    if (hasSeenSplash || hasHash) {
      splash.style.display = 'none';
      return;
    }

    sessionStorage.setItem('mathpad_splash_seen', 'true');
    const bar = document.getElementById('splashProgressBar');
    const status = document.getElementById('splashStatusText');

    setTimeout(() => {
      if (bar) bar.style.width = '45%';
      if (status) status.textContent = 'Setting up stylus canvas...';
    }, 200);

    setTimeout(() => {
      if (bar) bar.style.width = '90%';
      if (status) status.textContent = 'Restoring math progress...';
    }, 500);

    setTimeout(() => {
      if (bar) bar.style.width = '100%';
      if (status) status.textContent = 'Ready!';
      splash.classList.add('splash-screen-hide');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 450);
    }, 850);
  }

  bindWindowGlobals() {
    // Expose handlers cleanly to window for inline onclick bindings
    window.selectAvatar = (av, el) => this.coverPage.selectAvatar(av);
    window.selectTheme = (accent, subtle, border, el) => this.coverPage.selectTheme(accent, subtle, border);
    window.selectFont = (font, el) => this.coverPage.selectFont(font);
    window.selectPaper = (paper, el) => this.coverPage.selectPaper(paper);
    window.setWelcomeLang = (lang) => this.coverPage.setWelcomeLang(lang);
    window.saveProfileAndProceed = () => this.coverPage.proceedToHome();

    window.openStandardHomeScreen = () => {
      this.pageManager.showScreen('screenHome');
      audioManager.playSound('click');
    };
    window.openDevShapeScreen = () => {
      this.pageManager.showScreen('screenDevShapes');
      audioManager.playSound('click');
    };
    window.goToHome = () => {
      this.practicePage.saveCurrentCanvas();
      this.pageManager.showScreen('screenHome');
      audioManager.playSound('click');
    };

    window.openSettingsModal = () => this.pageManager.openSettingsModal();
    window.closeSettingsModal = () => this.pageManager.closeSettingsModal();
    window.saveSettingsModal = () => this.pageManager.saveSettingsModal();
    window.cancelSettingsModal = () => this.pageManager.cancelSettingsModal();
    window.switchSettingsSection = (sec) => this.pageManager.switchSettingsSection(sec);
    window.stagePlayerName = (v) => this.pageManager.stagePlayerName(v);
    window.stageAvatar = (av, el) => this.pageManager.stageAvatar(av);
    window.stageTheme = (acc, sub, bor, el) => this.pageManager.stageTheme(acc, sub, bor);
    window.stagePaper = (p, el) => this.pageManager.stagePaper(p);
    window.stageLanguage = (l) => this.pageManager.stageLanguage(l);
    window.stagePalmToggle = () => this.pageManager.stagePalmToggle();
    window.stageSoundToggle = () => this.pageManager.stageSoundToggle();

    window.openStatsModal = () => this.pageManager.openStatsModal();
    window.closeStatsModal = () => this.pageManager.closeStatsModal();

    window.openCoinGuideModal = () => this.pageManager.openCoinGuideModal();
    window.closeCoinGuideModal = () => this.pageManager.closeCoinGuideModal();

    window.openStepGuide = () => this.practicePage.openStepGuide();
    window.closeStepGuide = () => this.practicePage.stepGuideModal.close();
    window.nextStepGuide = () => this.practicePage.stepGuideModal.nextStep();
    window.prevStepGuide = () => this.practicePage.stepGuideModal.prevStep();
    window.readStepGuideAloud = () => this.practicePage.stepGuideModal.readAloud();

    window.handleOverlayClick = (e) => {
      if (e.target.id === 'settingsModal') {
        this.pageManager.cancelSettingsModal();
      } else if (e.target.id === 'statsModal') {
        this.pageManager.closeStatsModal();
      } else if (e.target.id === 'stepGuideModal') {
        this.practicePage.stepGuideModal.close();
      } else if (e.target.id === 'coinGuideModal') {
        this.pageManager.closeCoinGuideModal();
      }
    };

    window.changeLanguage = (lang) => {
      this.pageManager.updateLanguage(lang);
      this.practicePage.updateI18n();
    };
    window.setInputMode = (mode) => this.practicePage.setInputMode(mode);
    window.toggleSoundFx = () => {
      const enabled = studentProgress.toggleSound();
      const t = this.pageManager.getI18n();
      document.getElementById('soundModalBtn')?.classList.toggle('active', enabled);
      const statusElem = document.getElementById('lblSoundStatus');
      if (statusElem) statusElem.innerText = enabled ? t.soundOn : t.soundOff;
      audioManager.playSound('click');
    };
    window.togglePalmShield = () => this.practicePage.togglePalmShield();
    window.logoutPlayer = () => {
      studentProgress.logout();
      this.pageManager.closeSettingsModal();
      this.pageManager.showScreen('screenWelcome');
    };

    let stagedPracticeMode = 'mult';
    let stagedQuestionCount = 10;
    let stagedDifficulty = 'medium';
    let stagedPeriod = 'lesson'; // 'lesson' | 'breaktime' | 'detention'

    const topicTitles = {
      tables: 'Times Tables',
      mult: 'Multiplication',
      div: 'Division',
      add: 'Addition',
      sub: 'Subtraction',
      word: 'Word Problems',
      geo: 'Geometry & Measure',
      all_seq: 'All in Sequence',
      random: 'Random Mix'
    };

    const updateDetentionBadges = () => {
      const mistakes = studentProgress.getMistakes();
      const count = mistakes.length;
      const homeBadge = document.getElementById('detentionBadgeCount');
      if (homeBadge) homeBadge.innerText = count.toString();
      const setupBadge = document.getElementById('setupDetentionCount');
      if (setupBadge) setupBadge.innerText = count.toString();
    };

    const updateForecast = () => {
      updateDetentionBadges();
      const base = stagedDifficulty === 'easy' ? 5 : (stagedDifficulty === 'medium' ? 8 : 12);
      const isSpecial = stagedPracticeMode === 'word' || stagedPracticeMode === 'geo';
      let perQ = base + (isSpecial ? 4 : 0);
      const forecastDetail = document.getElementById('forecastStarDetail');
      const countRow = document.getElementById('setupCountBtnGroup');
      const countNotice = document.getElementById('periodSpecialNotice');
      const countLabel = document.getElementById('lblSetupQuestionCount');

      if (stagedPeriod === 'breaktime') {
        perQ *= 2;
        if (countRow) countRow.style.display = 'none';
        if (countNotice) {
          countNotice.style.display = 'block';
          countNotice.innerHTML = '⚡ <strong>60-Second Speed Run:</strong> Answer as many questions as you can before the recess bell rings! Auto-advances on correct answers.';
        }
        if (countLabel) countLabel.innerText = 'Session Format: 60s Speed Sprint';
        if (forecastDetail) {
          forecastDetail.innerHTML = `Earn <strong>${perQ} ⭐ (2x Multiplier)</strong> per question answered in 60 seconds!`;
        }
      } else if (stagedPeriod === 'detention') {
        const mistakes = studentProgress.getMistakes();
        const mCount = mistakes.length;
        if (countRow) countRow.style.display = 'none';
        if (countNotice) {
          countNotice.style.display = 'block';
          if (mCount > 0) {
            countNotice.innerHTML = `🚨 <strong>Mistake Buster:</strong> ${mCount} question${mCount === 1 ? '' : 's'} waiting for correction. Solve them to clear your detention record and earn redemption stars!`;
          } else {
            countNotice.innerHTML = '🎉 <strong>Clean Record!</strong> You have 0 mistakes! Solving 3 quick refresher questions for bonus stars.';
          }
        }
        if (countLabel) countLabel.innerText = 'Session Format: Mistake Buster Clinic';
        if (forecastDetail) {
          forecastDetail.innerHTML = `Earn <strong>${perQ} ⭐</strong> per corrected question + record redemption star bonus!`;
        }
      } else {
        if (countRow) countRow.style.display = 'flex';
        if (countNotice) countNotice.style.display = 'none';
        if (countLabel) countLabel.innerText = 'Number of Questions';
        const maxBase = perQ * stagedQuestionCount;
        const maxBonus = stagedQuestionCount * 3;
        if (forecastDetail) {
          forecastDetail.innerHTML = `Earn <strong>${perQ} ⭐</strong> per question (up to <strong>${maxBase} ⭐</strong> + up to <strong>${maxBonus} ⭐</strong> bonus)!`;
        }
      }
    };

    window.setSchoolPeriod = (period) => {
      stagedPeriod = period || 'lesson';
      document.querySelectorAll('.school-period-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.period === stagedPeriod);
      });
      document.querySelectorAll('.school-period-pill').forEach((pill) => {
        pill.classList.toggle('active', pill.id === `homePeriod${period.charAt(0).toUpperCase() + period.slice(1)}`);
      });
      updateForecast();
      audioManager.playSound('click');
    };

    window.setGlobalSchoolPeriod = (period) => {
      stagedPeriod = period || 'lesson';
      document.querySelectorAll('.school-period-pill').forEach((pill) => {
        pill.classList.toggle('active', pill.id === `homePeriod${period.charAt(0).toUpperCase() + period.slice(1)}`);
      });
      document.querySelectorAll('.school-period-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.period === stagedPeriod);
      });

      if (period === 'detention') {
        const mistakes = studentProgress.getMistakes();
        if (mistakes.length === 0) {
          this.practicePage.showToast('🎉 Clean Record! No mistakes in detention. Try a Class Lesson!', 'correct');
        }
        window.openPracticeSetupModal('random');
      } else {
        audioManager.playSound('click');
      }
    };

    window.openPracticeSetupModal = (mode) => {
      stagedPracticeMode = mode || 'mult';
      const titleElem = document.getElementById('setupModalTitle');
      if (titleElem) {
        titleElem.innerText = `${topicTitles[stagedPracticeMode] || 'Math'} Quiz Setup`;
      }
      document.querySelectorAll('.school-period-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.period === stagedPeriod);
      });
      updateForecast();
      const modal = document.getElementById('practiceSetupModal');
      if (modal) modal.classList.add('active');
      audioManager.playSound('click');
    };

    window.closePracticeSetupModal = () => {
      const modal = document.getElementById('practiceSetupModal');
      if (modal) modal.classList.remove('active');
    };

    window.setSetupQuestionCount = (count) => {
      stagedQuestionCount = parseInt(count, 10) || 10;
      document.querySelectorAll('.q-count-btn').forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === stagedQuestionCount);
      });
      updateForecast();
      audioManager.playSound('click');
    };

    window.setSetupDifficulty = (diff) => {
      stagedDifficulty = diff || 'medium';
      document.querySelectorAll('.diff-pill-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.diff === stagedDifficulty);
      });
      updateForecast();
      audioManager.playSound('click');
    };

    window.confirmStartPractice = () => {
      window.closePracticeSetupModal();
      this.practicePage.startPractice(stagedPracticeMode, stagedQuestionCount, stagedDifficulty, stagedPeriod);
    };

    window.startPractice = (mode, count, diff, format) => this.practicePage.startPractice(mode, count, diff, format);
    window.nextQuestion = () => this.practicePage.nextQuestion();
    window.prevQuestion = () => this.practicePage.prevQuestion();
    window.recognizeHandwriting = () => this.practicePage.checkAnswer();
    window.checkAnswer = () => this.practicePage.checkAnswer();
    window.retryQuiz = () => this.practicePage.startPractice(this.practicePage.activeMode, this.practicePage.totalQuestions, this.practicePage.difficulty, this.practicePage.sessionFormat);

    // Initial sync of detention badges
    updateDetentionBadges();

    window.toggleInkColorMenu = (e) => {
      if (e) e.stopPropagation();
      const popover = document.getElementById('inkColorPopover');
      const other = document.getElementById('strokeSizePopover');
      if (other) other.classList.remove('active');
      if (popover) popover.classList.toggle('active');
    };

    window.toggleStrokeSizeMenu = (e) => {
      if (e) e.stopPropagation();
      const popover = document.getElementById('strokeSizePopover');
      const other = document.getElementById('inkColorPopover');
      if (other) other.classList.remove('active');
      if (popover) popover.classList.toggle('active');
    };

    document.addEventListener('pointerdown', (e) => {
      const inkPop = document.getElementById('inkColorPopover');
      const strokePop = document.getElementById('strokeSizePopover');
      const inkBtn = document.getElementById('inkColorDropdownBtn');
      const strokeBtn = document.getElementById('strokeSizeDropdownBtn');

      if (inkPop && inkPop.classList.contains('active')) {
        if (!inkPop.contains(e.target) && !inkBtn?.contains(e.target)) {
          inkPop.classList.remove('active');
        }
      }

      if (strokePop && strokePop.classList.contains('active')) {
        if (!strokePop.contains(e.target) && !strokeBtn?.contains(e.target)) {
          strokePop.classList.remove('active');
        }
      }
    });

    window.setTool = (tool) => this.canvasEngine.setTool(tool);
    window.setColor = (val) => {
      this.canvasEngine.setColor(val);
      document.getElementById('inkColorPopover')?.classList.remove('active');
    };
    window.setColorFromDropdown = (val) => this.canvasEngine.setColor(val);
    window.setStrokeSize = (size) => {
      this.canvasEngine.setStrokeSize(size);
      document.getElementById('strokeSizePopover')?.classList.remove('active');
    };
    window.undoCanvas = () => {
      historyManager.undo(this.canvasEngine.canvas, this.canvasEngine.ctx, this.canvasEngine.inkStrokes, () => {
        this.practicePage.saveCurrentCanvas();
      });
    };
    window.clearCanvas = () => {
      this.canvasEngine.clear();
      this.practicePage.saveCurrentCanvas();
    };
  }
}

// Bootstrap immediately and on DOM Ready
if (typeof window !== 'undefined') {
  const app = new App();
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      app.init();
    });
  } else {
    app.init();
  }
}

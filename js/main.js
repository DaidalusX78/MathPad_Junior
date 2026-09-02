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

    // Initial paper texture
    this.coverPage.selectPaper(studentProgress.userPaper);

    // Initial screen check
    if (studentProgress.playerName) {
      this.pageManager.showScreen('screenHome');
    } else {
      this.pageManager.showScreen('screenWelcome');
    }

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
    window.stagePlayerName = (v) => this.pageManager.stagePlayerName(v);
    window.stageAvatar = (av, el) => this.pageManager.stageAvatar(av);
    window.stageTheme = (acc, sub, bor, el) => this.pageManager.stageTheme(acc, sub, bor);
    window.stagePaper = (p, el) => this.pageManager.stagePaper(p);
    window.stageLanguage = (l) => this.pageManager.stageLanguage(l);
    window.stagePalmToggle = () => this.pageManager.stagePalmToggle();
    window.stageSoundToggle = () => this.pageManager.stageSoundToggle();

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

    window.startPractice = (mode) => this.practicePage.startPractice(mode);
    window.nextQuestion = () => this.practicePage.nextQuestion();
    window.prevQuestion = () => this.practicePage.prevQuestion();
    window.recognizeHandwriting = () => this.practicePage.checkAnswer();
    window.checkAnswer = () => this.practicePage.checkAnswer();
    window.retryQuiz = () => this.practicePage.startPractice(this.practicePage.activeMode);

    window.togglePenSettingsMenu = (e) => {
      if (e) e.stopPropagation();
      const popover = document.getElementById('penSettingsPopover');
      if (popover) {
        popover.classList.toggle('active');
      }
    };

    document.addEventListener('pointerdown', (e) => {
      const popover = document.getElementById('penSettingsPopover');
      const btn = document.getElementById('penDropdownBtn');
      if (popover && popover.classList.contains('active')) {
        if (!popover.contains(e.target) && !btn?.contains(e.target)) {
          popover.classList.remove('active');
        }
      }
    });

    window.setTool = (tool) => this.canvasEngine.setTool(tool);
    window.setColor = (val) => {
      this.canvasEngine.setColor(val);
      document.getElementById('penSettingsPopover')?.classList.remove('active');
    };
    window.setColorFromDropdown = (val) => this.canvasEngine.setColor(val);
    window.setStrokeSize = (size) => {
      this.canvasEngine.setStrokeSize(size);
      document.getElementById('penSettingsPopover')?.classList.remove('active');
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

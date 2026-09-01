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

    this.bindWindowGlobals();
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
    window.handleOverlayClick = (e) => {
      if (e.target.id === 'settingsModal') {
        this.pageManager.closeSettingsModal();
      }
    };

    window.changeLanguage = (lang) => this.pageManager.updateLanguage(lang);
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
    window.toggleAnswer = () => this.practicePage.toggleAnswer();
    window.recognizeHandwriting = () => this.practicePage.recognizeHandwriting();
    window.retryQuiz = () => this.practicePage.startPractice(this.practicePage.activeMode);

    window.setTool = (tool) => this.canvasEngine.setTool(tool);
    window.setColorFromDropdown = (val) => this.canvasEngine.setColor(val);
    window.setStrokeSize = (size) => this.canvasEngine.setStrokeSize(size);
    window.undoCanvas = () => {
      historyManager.undo(this.canvasEngine.canvas, this.canvasEngine.ctx, this.canvasEngine.inkStrokes, () => {
        this.practicePage.saveCurrentCanvas();
      });
    };
    window.clearCanvas = () => {
      this.canvasEngine.clear();
      this.practicePage.saveCurrentCanvas();
    };

    window.handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          let list = [];
          if (file.name.endsWith('.json')) {
            list = JSON.parse(content);
          }
          if (list.length > 0) {
            this.pageManager.curriculaData.questions = list;
            this.pageManager.closeSettingsModal();
            this.practicePage.startPractice('all_seq');
          }
        } catch (err) {
          console.error('File parsing error:', err);
        }
      };
      reader.readAsText(file);
    };
  }
}

// Bootstrap on DOM Ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
}

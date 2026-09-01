/**
 * Page Navigation & Modal Coordinator
 */

import { studentProgress } from '../data/studentProgress.js';
import { audioManager } from '../core/audioManager.js';

export class PageManager {
  constructor(curriculaData) {
    this.curriculaData = curriculaData;
    this.currentScreen = 'screenWelcome';
  }

  getI18n() {
    return this.curriculaData.i18n[studentProgress.currentLang] || this.curriculaData.i18n.en;
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
    }
  }

  updateLanguage(lang) {
    studentProgress.setLang(lang);
    this.updateAllStaticText();
    audioManager.playSound('click');
  }

  openSettingsModal() {
    const nameInput = document.getElementById('modalPlayerNameInput');
    if (nameInput) nameInput.value = studentProgress.playerName || 'Eli';

    // Sync avatar highlights
    document.querySelectorAll('#settingsModal .avatar-btn').forEach((b) => {
      b.classList.toggle('active', b.innerText.trim() === studentProgress.userAvatar);
    });

    // Sync theme swatch highlights
    document.querySelectorAll('#settingsModal .theme-swatch').forEach((s) => {
      const bg = s.style.backgroundColor || s.getAttribute('style') || '';
      s.classList.toggle('active', bg.includes(studentProgress.userThemeAccent));
    });

    // Sync paper button highlights
    document.querySelectorAll('#settingsModal .paper-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('onclick')?.includes(studentProgress.userPaper));
    });

    // Sync flags
    document.getElementById('flagEN')?.classList.toggle('active', studentProgress.currentLang === 'en');
    document.getElementById('flagES')?.classList.toggle('active', studentProgress.currentLang === 'es');

    // Status indicators
    const t = this.getI18n();
    document.getElementById('soundModalBtn')?.classList.toggle('active', studentProgress.soundFxEnabled);
    const soundStatus = document.getElementById('lblSoundStatus');
    if (soundStatus) {
      soundStatus.innerText = studentProgress.soundFxEnabled ? t.soundOn : t.soundOff;
    }

    document.getElementById('settingsModal')?.classList.add('active');
    audioManager.playSound('click');
  }

  closeSettingsModal() {
    document.getElementById('settingsModal')?.classList.remove('active');
  }

  updateAllStaticText() {
    const t = this.getI18n();

    // Welcome Screen
    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    setElemText('welTitle', t.welcome);
    setElemText('welByline', t.byline || 'Interactive Stylus Workbook for Kids');
    setElemText('lblPlayerName', t.playerName);
    setElemText('lblMascot', t.mascot);
    setElemText('lblFavColor', t.favColor);
    setElemText('lblFontFamily', t.fontFamily);
    setElemText('lblPaperStyle', t.paperStyle);
    setElemText('lblPrefLang', t.prefLang);
    setElemText('btnLetsGo', t.letsGo);
    setElemText('btnPaperSquares', t.paperSquares);
    setElemText('btnPaperDots', t.paperDots);
    setElemText('btnPaperLines', t.paperLines);
    setElemText('btnPaperBlank', t.paperBlank);

    // Home Screen
    setElemText('tTables', t.categories.tables);
    setElemText('tMult', t.categories.mult);
    setElemText('tDiv', t.categories.div);
    setElemText('tAdd', t.categories.add);
    setElemText('tSub', t.categories.sub);
    setElemText('tWord', t.categories.word);
    setElemText('tGeo', t.categories.geo);
    setElemText('tAllSeq', t.categories.all_seq);
    setElemText('tRandom', t.categories.random);

    setElemText('cTables', t.countLabel);
    setElemText('cMult', t.countLabel);
    setElemText('cDiv', t.countLabel);
    setElemText('cAdd', t.countLabel);
    setElemText('cSub', t.countLabel);
    setElemText('cWord', t.countLabel);
    setElemText('cGeo', t.countLabel);
    setElemText('cAllSeq', t.countLabel);
    setElemText('cRandom', t.countLabel);

    // Header Badges
    const displayName = studentProgress.playerName || 'Eli';
    ['Home', 'Dev', 'Practice'].forEach((key) => {
      setElemText(`badgeAvatar${key}`, studentProgress.userAvatar);
      setElemText(`badgeName${key}`, displayName);
    });

    // Practice UI
    setElemText('lblCheckHandwriting', t.checkAnswer);
    setElemText('lblWritten', t.written);
    setElemText('lblPen', t.pen);
    setElemText('lblEraser', t.eraser);
    setElemText('lblUndo', t.undo);
    setElemText('lblClear', t.clear);
    setElemText('lblInk', t.ink);
    setElemText('optThin', t.thin);
    setElemText('optMed', t.med);
    setElemText('optThick', t.thick);
    setElemText('optMarker', t.marker);
    setElemText('lblPrev', t.prev);
    setElemText('lblHomeCenter', t.home);
    setElemText('shieldLabel', t.shieldText);
    setElemText('lblLiveScoreText', t.liveScoreLabel);
    setElemText('lblAnswerBoxGuide', t.answerBoxGuide);

    // Settings Modal
    setElemText('modalTitle', t.settings);
    setElemText('lblModalPlayerName', t.playerName);
    setElemText('lblModalMascot', t.mascot);
    setElemText('lblModalTheme', t.favColor);
    setElemText('lblLangSetting', t.langSetting);
    setElemText('lblPalmSetting', t.palmSetting);
    setElemText('lblSoundSetting', t.soundSetting);
    setElemText('lblImportSetting', t.customSetting);
    setElemText('lblUploadBtn', t.loadSheet);
    setElemText('lblPlayerSwitch', t.profileSetting);
    setElemText('lblLogout', t.changePlayer);
    setElemText('lblModalPaper', t.modalPaper);
    setElemText('modalBtnPaperSquares', t.paperSquares);
    setElemText('modalBtnPaperDots', t.paperDots);
    setElemText('modalBtnPaperLines', t.paperLines);
    setElemText('modalBtnPaperBlank', t.paperBlank);
    setElemText('btnGradeHome', t.homeMenu);
    setElemText('btnGradeRetry', t.playAnother);
  }
}

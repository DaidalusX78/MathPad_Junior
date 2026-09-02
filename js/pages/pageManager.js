/**
 * Page Navigation & Modal Coordinator
 */

import { studentProgress, MILESTONES_CONFIG } from '../data/studentProgress.js';
import { audioManager } from '../core/audioManager.js';

export class PageManager {
  constructor(curriculaData) {
    this.curriculaData = curriculaData;
    this.currentScreen = 'screenWelcome';
  }

  getI18n() {
    const lang = (this.draftSettings && this.draftSettings.lang) || studentProgress.currentLang || 'en';
    return this.curriculaData.i18n[lang] || this.curriculaData.i18n.en;
  }

  updatePaperDisplay(isFullBackgroundPreview = false) {
    const paperClasses = ['paper-squares', 'paper-dots', 'paper-lines', 'paper-blank'];
    paperClasses.forEach((cls) => document.body.classList.remove(cls));

    const activePaper = (this.draftSettings && isFullBackgroundPreview) ? this.draftSettings.paper : studentProgress.userPaper;

    document.body.classList.remove(...paperClasses);
    if (isFullBackgroundPreview) {
      document.body.classList.add(activePaper);
    }

    const canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
      canvasContainer.className = `canvas-container ${activePaper}`;
    }
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
    }
    this.updatePaperDisplay(screenId === 'screenWelcome');
  }

  updateLanguage(lang) {
    studentProgress.setLang(lang);
    this.updateAllStaticText();
    if (this.practicePage) {
      this.practicePage.updateI18n();
    }
    audioManager.playSound('click');
  }

  openSettingsModal() {
    this.draftSettings = {
      playerName: studentProgress.playerName || 'Eli',
      avatar: studentProgress.userAvatar || '🦄',
      themeAccent: studentProgress.userThemeAccent || '#a855f7',
      themeSubtle: studentProgress.userThemeSubtle || '#fdf4ff',
      themeBorder: studentProgress.userThemeBorder || '#f0abfc',
      paper: studentProgress.userPaper || 'paper-blank',
      lang: studentProgress.currentLang || 'en',
      sound: studentProgress.soundFxEnabled
    };

    const nameInput = document.getElementById('modalPlayerNameInput');
    if (nameInput) nameInput.value = this.draftSettings.playerName;

    this.syncDraftHighlights();
    this.updatePaperDisplay(true);
    this.switchSettingsSection('profile');

    document.getElementById('settingsModal')?.classList.add('active');
    audioManager.playSound('click');
  }

  syncDraftHighlights() {
    if (!this.draftSettings) return;

    // Sync avatar highlights
    document.querySelectorAll('#settingsModal .avatar-btn').forEach((b) => {
      const av = b.dataset.avatar || b.innerText.trim();
      b.classList.toggle('active', av === this.draftSettings.avatar);
    });

    // Sync theme swatch highlights
    document.querySelectorAll('#settingsModal .theme-swatch').forEach((s) => {
      const accent = s.dataset.accent || '';
      s.classList.toggle('active', accent.toLowerCase() === this.draftSettings.themeAccent.toLowerCase());
    });

    // Sync paper button highlights
    document.querySelectorAll('#settingsModal .paper-btn').forEach((b) => {
      const paper = b.dataset.paper || '';
      b.classList.toggle('active', paper === this.draftSettings.paper);
    });

    // Sync flags
    document.getElementById('flagEN')?.classList.toggle('active', this.draftSettings.lang === 'en');
    document.getElementById('flagES')?.classList.toggle('active', this.draftSettings.lang === 'es');

    // Status indicators
    const t = this.getI18n();
    document.getElementById('soundModalBtn')?.classList.toggle('active', this.draftSettings.sound);
    const soundStatus = document.getElementById('lblSoundStatus');
    if (soundStatus) {
      soundStatus.innerText = this.draftSettings.sound ? t.soundOn : t.soundOff;
    }
  }

  stagePlayerName(val) {
    if (this.draftSettings) {
      this.draftSettings.playerName = val.trim() || 'Eli';
    }
  }

  stageAvatar(avatar) {
    if (!this.draftSettings) return;
    this.draftSettings.avatar = avatar;
    this.syncDraftHighlights();
    audioManager.playSound('click');
  }

  stageTheme(accent, subtle, border) {
    if (!this.draftSettings) return;
    this.draftSettings.themeAccent = accent;
    this.draftSettings.themeSubtle = subtle;
    this.draftSettings.themeBorder = border;

    document.documentElement.style.setProperty('--theme-accent', accent);
    document.documentElement.style.setProperty('--theme-subtle', subtle);
    document.documentElement.style.setProperty('--theme-border', border);

    this.syncDraftHighlights();
    audioManager.playSound('click');
  }

  stagePaper(paperClass) {
    if (!this.draftSettings) return;
    this.draftSettings.paper = paperClass;
    this.syncDraftHighlights();
    this.updatePaperDisplay(true);
    audioManager.playSound('click');
  }

  stageLanguage(lang) {
    if (!this.draftSettings) return;
    this.draftSettings.lang = lang;
    this.syncDraftHighlights();
    this.updateAllStaticText();
    audioManager.playSound('click');
  }

  stagePalmToggle() {
    this.practicePage?.togglePalmShield();
  }

  stageSoundToggle() {
    if (!this.draftSettings) return;
    this.draftSettings.sound = !this.draftSettings.sound;
    this.syncDraftHighlights();
    audioManager.playSound('click');
  }

  saveSettingsModal() {
    if (this.draftSettings) {
      studentProgress.setPlayerName(this.draftSettings.playerName);
      studentProgress.setAvatar(this.draftSettings.avatar);
      studentProgress.setTheme(this.draftSettings.themeAccent, this.draftSettings.themeSubtle, this.draftSettings.themeBorder);
      studentProgress.setPaper(this.draftSettings.paper);
      studentProgress.setLang(this.draftSettings.lang);
      if (studentProgress.soundFxEnabled !== this.draftSettings.sound) {
        studentProgress.toggleSound();
      }
    }

    this.draftSettings = null;
    this.updateAllStaticText();
    this.closeSettingsModal();
    audioManager.playSound('success');
  }

  cancelSettingsModal() {
    studentProgress.applyStoredStyles();
    this.draftSettings = null;
    this.updateAllStaticText();
    this.closeSettingsModal();
  }

  closeSettingsModal() {
    document.getElementById('settingsModal')?.classList.remove('active');
    this.updatePaperDisplay(this.currentScreen === 'screenWelcome');
  }

  switchSettingsSection(section) {
    const tabs = ['profile', 'settings', 'shop'];
    tabs.forEach((tab) => {
      const isMatch = tab === section;
      const btn = document.getElementById(`tabBtn${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
      const sec = document.getElementById(`sec${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
      if (btn) {
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      }
      if (sec) sec.style.display = isMatch ? 'flex' : 'none';
    });

    const shopWallet = document.getElementById('shopTabStarsCount');
    if (shopWallet) {
      shopWallet.innerText = (studentProgress.coins || 0).toString();
    }
    audioManager.playSound('click');
  }

  openStatsModal() {
    const stats = studentProgress.getStats();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };
    set('statQuestionsAttempted', stats.totalAttempted);
    set('statQuestionsCorrect', stats.totalCorrect);
    set('statAccuracy', `${stats.accuracy}%`);
    set('statBestScore', `${stats.bestScore}`);
    set('statDaysPlayed', `${stats.totalDaysPlayed}`);
    set('statBestStreak', `${stats.bestStreak} 🔥`);
    set('statLifetimeStars', `${stats.lifetimeStars} ⭐`);

    const container = document.getElementById('milestonesScrollList');
    if (container) {
      container.innerHTML = '';
      let unlockedCount = 0;
      MILESTONES_CONFIG.forEach((m) => {
        const isUnlocked = !!(studentProgress.milestones && studentProgress.milestones[m.id]?.unlocked);
        if (isUnlocked) unlockedCount++;
        const card = document.createElement('div');
        card.className = `milestone-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="milestone-badge-icon">${m.icon}</div>
          <div class="milestone-badge-info">
            <div class="milestone-badge-title">
              <span>${m.title}</span>
              ${isUnlocked ? '<span style="font-size:0.75rem; color:#16a34a;">✓</span>' : ''}
            </div>
            <div class="milestone-badge-desc">${m.desc}</div>
          </div>
          <div class="milestone-reward-pill">
            ${isUnlocked ? `✅ +${m.stars} ⭐` : `🔒 +${m.stars} ⭐`}
          </div>
        `;
        container.appendChild(card);
      });
      const countElem = document.getElementById('statMilestonesCount');
      if (countElem) countElem.innerText = `${unlockedCount} / ${MILESTONES_CONFIG.length} Unlocked`;
    }

    document.getElementById('statsModal')?.classList.add('active');
    audioManager.playSound('click');
  }

  closeStatsModal() {
    document.getElementById('statsModal')?.classList.remove('active');
  }

  openCoinGuideModal() {
    const modal = document.getElementById('coinGuideModal');
    if (modal) {
      modal.classList.add('active');
      audioManager.playSound('click');
    }
  }

  closeCoinGuideModal() {
    const modal = document.getElementById('coinGuideModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  updateAllStaticText() {
    const t = this.getI18n();

    // Welcome Screen
    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

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

    // Flags in Welcome
    document.getElementById('welFlagEN')?.classList.toggle('active', studentProgress.currentLang === 'en');
    document.getElementById('welFlagES')?.classList.toggle('active', studentProgress.currentLang === 'es');

    // Home Screen
    setElemText('tTables', t.categories.tables);
    setElemText('tMult', t.categories.mult);
    setElemText('tDiv', t.categories.div);
    setElemText('tAdd', t.categories.add);
    setElemText('tSub', t.categories.sub);
    setElemText('tWord', t.categories.word);
    setElemText('tGeo', t.categories.geo);
    setElemText('tAll', t.categories.all_seq);
    setElemText('tRandom', t.categories.random);

    setElemText('cTables', t.countLabel);
    setElemText('cMult', t.countLabel);
    setElemText('cDiv', t.countLabel);
    setElemText('cAdd', t.countLabel);
    setElemText('cSub', t.countLabel);
    setElemText('cWord', t.countLabel);
    setElemText('cGeo', t.countLabel);
    setElemText('cAll', t.countLabel);
    setElemText('cRandom', t.countLabel);

    // Header Badges
    const displayName = studentProgress.playerName || 'Eli';
    ['Home', 'Dev', 'Practice'].forEach((key) => {
      setElemText(`badgeAvatar${key}`, studentProgress.userAvatar);
      setElemText(`badgeName${key}`, displayName);
    });

    // Practice UI
    setElemText('lblModeDraw', t.modeDraw || 'Draw');
    setElemText('lblModeKeypad', t.modeKeypad || 'Keypad');
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
    setElemText('lblPlayerSwitch', t.profileSetting);
    setElemText('lblLogout', t.changePlayer);
    setElemText('lblModalPaper', t.modalPaper);
    setElemText('modalBtnPaperSquares', t.paperSquares);
    setElemText('modalBtnPaperDots', t.paperDots);
    setElemText('modalBtnPaperLines', t.paperLines);
    setElemText('modalBtnPaperBlank', t.paperBlank);
    setElemText('btnCancelSettings', t.cancel || 'Cancel');
    setElemText('btnSaveSettings', t.saveChanges || 'Save Changes');
    setElemText('btnGradeHome', t.homeMenu);
    setElemText('btnGradeRetry', t.playAnother);

    const coins = studentProgress.coins || 0;
    ['coinCountHome', 'coinCountDev', 'coinCountPractice', 'palmCoinCount'].forEach((id) => {
      setElemText(id, coins.toString());
    });
  }
}

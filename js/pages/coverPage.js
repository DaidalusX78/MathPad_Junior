/**
 * Cover / Welcome Page Controller
 */

import { studentProgress } from '../data/studentProgress.js';
import { audioManager } from '../core/audioManager.js';

export class CoverPage {
  constructor(pageManager) {
    this.pageManager = pageManager;
  }

  init() {
    const welInput = document.getElementById('playerNameInput');
    if (welInput) {
      welInput.value = studentProgress.playerName || '';
      welInput.addEventListener('input', (e) => {
        studentProgress.setPlayerName(e.target.value);
        this.pageManager.updateAllStaticText();
      });
    }

    this.syncWelcomeUI();
  }

  syncWelcomeUI() {
    document.querySelectorAll('#screenWelcome .avatar-btn').forEach((b) => {
      b.classList.toggle('active', b.innerText.trim() === studentProgress.userAvatar);
    });

    document.querySelectorAll('#screenWelcome .theme-swatch').forEach((s) => {
      const bg = s.style.backgroundColor || s.getAttribute('style') || '';
      s.classList.toggle('active', bg.includes(studentProgress.userThemeAccent));
    });

    document.querySelectorAll('#screenWelcome .font-btn').forEach((b) => {
      b.classList.toggle('active', b.innerText.trim() === studentProgress.userFont);
    });

    document.querySelectorAll('#screenWelcome .paper-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('onclick')?.includes(studentProgress.userPaper));
    });

    document.getElementById('welFlagEN')?.classList.toggle('active', studentProgress.currentLang === 'en');
    document.getElementById('welFlagES')?.classList.toggle('active', studentProgress.currentLang === 'es');
  }

  selectAvatar(av) {
    studentProgress.setAvatar(av);
    this.syncWelcomeUI();
    this.pageManager.updateAllStaticText();
    audioManager.playSound('click');
  }

  selectTheme(accent, subtle, border) {
    studentProgress.setTheme(accent, subtle, border);
    this.syncWelcomeUI();
    this.pageManager.updateAllStaticText();
    audioManager.playSound('click');
  }

  selectFont(fontName) {
    studentProgress.setFont(fontName);
    this.syncWelcomeUI();
    audioManager.playSound('click');
  }

  selectPaper(paperClass) {
    studentProgress.setPaper(paperClass);
    const isModalOpen = document.getElementById('settingsModal')?.classList.contains('active');
    const isWelcome = this.pageManager.currentScreen === 'screenWelcome';
    this.pageManager.updatePaperDisplay(isModalOpen || isWelcome);
    this.syncWelcomeUI();
    audioManager.playSound('click');
  }

  setWelcomeLang(lang) {
    studentProgress.setLang(lang);
    this.pageManager.updateLanguage(lang);
    this.syncWelcomeUI();
    audioManager.playSound('click');
  }

  proceedToHome() {
    const input = document.getElementById('playerNameInput');
    studentProgress.setPlayerName(input ? input.value : 'Eli');
    this.pageManager.showScreen('screenHome');
    this.pageManager.updateAllStaticText();
    audioManager.playSound('click');
  }
}

/**
 * Student Progress & LocalStorage Persistence Manager
 */

export class StudentProgress {
  constructor() {
    this.STORAGE_KEYS = {
      PLAYER: 'elismark_player',
      LANG: 'elismark_lang',
      AVATAR: 'elismark_avatar',
      THEME_ACCENT: 'elismark_theme_accent',
      THEME_SUBTLE: 'elismark_theme_subtle',
      THEME_BORDER: 'elismark_theme_border',
      FONT: 'elismark_font',
      PAPER: 'elismark_paper',
      SOUND: 'elismark_sound',
      INPUT_MODE: 'elismark_input_mode',
      COINS: 'elismark_coins',
      PALM_HEIGHT: 'elismark_palm_height'
    };

    const hasStorage = typeof localStorage !== 'undefined';
    this.playerName = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.PLAYER) || '') : '';
    this.currentLang = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.LANG) || 'en') : 'en';
    this.userAvatar = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.AVATAR) || '🦄') : '🦄';
    this.userThemeAccent = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.THEME_ACCENT) || '#a855f7') : '#a855f7';
    this.userThemeSubtle = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.THEME_SUBTLE) || '#fdf4ff') : '#fdf4ff';
    this.userThemeBorder = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.THEME_BORDER) || '#f0abfc') : '#f0abfc';
    this.userFont = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.FONT) || 'Fredoka') : 'Fredoka';
    this.userPaper = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.PAPER) || 'paper-blank') : 'paper-blank';
    this.soundFxEnabled = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.SOUND) !== 'false') : true;
    this.inputMode = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.INPUT_MODE) || 'draw') : 'draw';
    this.coins = hasStorage ? parseInt(localStorage.getItem(this.STORAGE_KEYS.COINS) || '0', 10) : 0;
    this.palmHeight = hasStorage ? parseInt(localStorage.getItem(this.STORAGE_KEYS.PALM_HEIGHT) || '140', 10) : 140;
  }

  setPlayerName(name) {
    this.playerName = name.trim() || 'Eli';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.PLAYER, this.playerName);
    }
  }

  setLang(lang) {
    this.currentLang = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.LANG, this.currentLang);
    }
  }

  setAvatar(avatar) {
    this.userAvatar = avatar;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.AVATAR, this.userAvatar);
    }
  }

  setTheme(accent, subtle, border) {
    this.userThemeAccent = accent;
    this.userThemeSubtle = subtle;
    this.userThemeBorder = border;

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--theme-accent', accent);
      document.documentElement.style.setProperty('--theme-subtle', subtle);
      document.documentElement.style.setProperty('--theme-border', border);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.THEME_ACCENT, accent);
      localStorage.setItem(this.STORAGE_KEYS.THEME_SUBTLE, subtle);
      localStorage.setItem(this.STORAGE_KEYS.THEME_BORDER, border);
    }
  }

  setFont(fontName) {
    this.userFont = fontName;
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font', `'${fontName}', sans-serif`);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.FONT, fontName);
    }
  }

  setPaper(paperClass) {
    this.userPaper = paperClass;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.PAPER, paperClass);
    }
  }

  setInputMode(mode) {
    this.inputMode = mode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.INPUT_MODE, mode);
    }
  }

  toggleSound() {
    this.soundFxEnabled = !this.soundFxEnabled;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.SOUND, this.soundFxEnabled);
    }
    return this.soundFxEnabled;
  }

  addCoins(amount) {
    this.coins = Math.max(0, (this.coins || 0) + amount);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.COINS, this.coins.toString());
    }
    return this.coins;
  }

  addStars(amount) {
    return this.addCoins(amount);
  }

  setPalmHeight(height) {
    this.palmHeight = Math.max(80, Math.min(380, height));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.PALM_HEIGHT, this.palmHeight.toString());
    }
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEYS.PLAYER);
    }
    this.playerName = '';
  }

  applyStoredStyles() {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--theme-accent', this.userThemeAccent);
      document.documentElement.style.setProperty('--theme-subtle', this.userThemeSubtle);
      document.documentElement.style.setProperty('--theme-border', this.userThemeBorder);
      document.documentElement.style.setProperty('--app-font', `'${this.userFont}', sans-serif`);
    }
  }
}

export const studentProgress = new StudentProgress();

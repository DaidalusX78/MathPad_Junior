/**
 * Student Progress, Stats, Milestones & LocalStorage Persistence Manager
 */

export const MILESTONES_CONFIG = [
  { id: 'first_correct', title: 'First Step', icon: '🌱', desc: 'Answer your very first math question correctly', stars: 15 },
  { id: 'topic_tables', title: 'Times Table Titan', icon: '🔢', desc: 'Answer your first Times Tables question correctly', stars: 15 },
  { id: 'topic_mult', title: 'Multiplier Master', icon: '✖️', desc: 'Answer your first Multiplication question correctly', stars: 15 },
  { id: 'topic_div', title: 'Division Dynamo', icon: '➗', desc: 'Answer your first Division question correctly', stars: 15 },
  { id: 'topic_add', title: 'Addition Ace', icon: '➕', desc: 'Answer your first Addition question correctly', stars: 15 },
  { id: 'topic_sub', title: 'Subtraction Star', icon: '➖', desc: 'Answer your first Subtraction question correctly', stars: 15 },
  { id: 'topic_word', title: 'Story Solver', icon: '📖', desc: 'Answer your first Word Problem correctly', stars: 20 },
  { id: 'topic_geo', title: 'Shape Shifter', icon: '📐', desc: 'Answer your first Geometry question correctly', stars: 20 },
  { id: 'count_10', title: 'Double Digits', icon: '🔟', desc: 'Answer 10 total questions correctly', stars: 25 },
  { id: 'count_50', title: 'Half Century', icon: '🎖️', desc: 'Answer 50 total questions correctly', stars: 50 },
  { id: 'count_100', title: 'Math Century', icon: '💯', desc: 'Answer 100 total questions correctly', stars: 100 },
  { id: 'score_8', title: 'Great Effort', icon: '🌟', desc: 'Score 8 or more in a single quiz round', stars: 25 },
  { id: 'score_9', title: 'High Flyer', icon: '🚀', desc: 'Score 9 or more in a single quiz round', stars: 35 },
  { id: 'score_10', title: 'Perfection', icon: '👑', desc: 'Score a perfect 10/10 in a quiz round', stars: 50 },
  { id: 'streak_3', title: 'On Fire', icon: '🔥', desc: 'Practice for 3 days in a row', stars: 30 },
  { id: 'streak_7', title: 'Weekly Champion', icon: '🏆', desc: 'Practice for 7 days in a row', stars: 75 }
];

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
      PALM_HEIGHT: 'elismark_palm_height',
      PALM_MAT: 'elismark_palm_mat',
      STATS: 'elismark_stats',
      MILESTONES: 'elismark_milestones',
      LIFETIME_STARS: 'elismark_lifetime_stars',
      DATES_PLAYED: 'elismark_dates_played',
      STREAK_INFO: 'elismark_streak_info'
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
    this.userPalmMat = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.PALM_MAT) || 'mat_slate') : 'mat_slate';
    this.soundFxEnabled = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.SOUND) !== 'false') : true;
    this.inputMode = hasStorage ? (localStorage.getItem(this.STORAGE_KEYS.INPUT_MODE) || 'draw') : 'draw';
    this.coins = hasStorage ? parseInt(localStorage.getItem(this.STORAGE_KEYS.COINS) || '0', 10) : 0;
    this.palmHeight = hasStorage ? parseInt(localStorage.getItem(this.STORAGE_KEYS.PALM_HEIGHT) || '140', 10) : 140;

    // Stats & Milestones
    this.stats = this.loadStats();
    this.milestones = this.loadMilestones();
    this.lifetimeStars = hasStorage ? parseInt(localStorage.getItem(this.STORAGE_KEYS.LIFETIME_STARS) || this.coins.toString(), 10) : 0;
    this.datesPlayed = this.loadDatesPlayed();
    this.streakInfo = this.loadStreakInfo();

    // Ensure today is tracked
    this.recordDailyLogin();
  }

  loadStats() {
    if (typeof localStorage === 'undefined') return { totalAttempted: 0, totalCorrect: 0, bestScore: 0 };
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STATS)) || { totalAttempted: 0, totalCorrect: 0, bestScore: 0 };
    } catch {
      return { totalAttempted: 0, totalCorrect: 0, bestScore: 0 };
    }
  }

  saveStats() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.STATS, JSON.stringify(this.stats));
      localStorage.setItem(this.STORAGE_KEYS.LIFETIME_STARS, this.lifetimeStars.toString());
    }
  }

  loadMilestones() {
    if (typeof localStorage === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MILESTONES)) || {};
    } catch {
      return {};
    }
  }

  saveMilestones() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(this.milestones));
    }
  }

  loadDatesPlayed() {
    if (typeof localStorage === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DATES_PLAYED)) || [];
    } catch {
      return [];
    }
  }

  saveDatesPlayed() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.DATES_PLAYED, JSON.stringify(this.datesPlayed));
    }
  }

  loadStreakInfo() {
    if (typeof localStorage === 'undefined') return { currentStreak: 1, bestStreak: 1, lastActiveDate: '' };
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STREAK_INFO)) || { currentStreak: 1, bestStreak: 1, lastActiveDate: '' };
    } catch {
      return { currentStreak: 1, bestStreak: 1, lastActiveDate: '' };
    }
  }

  saveStreakInfo() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.STREAK_INFO, JSON.stringify(this.streakInfo));
    }
  }

  recordDailyLogin() {
    const today = new Date().toISOString().slice(0, 10);
    if (!this.datesPlayed.includes(today)) {
      this.datesPlayed.push(today);
      this.saveDatesPlayed();
    }

    if (!this.streakInfo.lastActiveDate) {
      this.streakInfo.currentStreak = 1;
      this.streakInfo.bestStreak = 1;
      this.streakInfo.lastActiveDate = today;
      this.saveStreakInfo();
      return;
    }

    if (this.streakInfo.lastActiveDate !== today) {
      const lastDate = new Date(this.streakInfo.lastActiveDate);
      const curDate = new Date(today);
      const diffDays = Math.round((curDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.streakInfo.currentStreak += 1;
        if (this.streakInfo.currentStreak > this.streakInfo.bestStreak) {
          this.streakInfo.bestStreak = this.streakInfo.currentStreak;
        }
      } else if (diffDays > 1) {
        this.streakInfo.currentStreak = 1;
      }
      this.streakInfo.lastActiveDate = today;
      this.saveStreakInfo();
    }

    // Check streak milestones
    this.checkStreakMilestones();
  }

  checkStreakMilestones() {
    const streak = this.streakInfo.currentStreak || 1;
    const unlocked = [];
    if (streak >= 3) {
      const m = this.unlockMilestone('streak_3');
      if (m) unlocked.push(m);
    }
    if (streak >= 7) {
      const m = this.unlockMilestone('streak_7');
      if (m) unlocked.push(m);
    }
    return unlocked;
  }

  unlockMilestone(id) {
    if (this.milestones[id] && this.milestones[id].unlocked) return null;
    const config = MILESTONES_CONFIG.find((item) => item.id === id);
    if (!config) return null;

    this.milestones[id] = {
      unlocked: true,
      unlockedAt: Date.now()
    };
    this.saveMilestones();

    // Award bonus stars for milestone
    this.addStars(config.stars);

    return config;
  }

  recordQuestionAttempt(isCorrect, category) {
    this.stats.totalAttempted = (this.stats.totalAttempted || 0) + 1;
    const unlocked = [];

    if (isCorrect) {
      this.stats.totalCorrect = (this.stats.totalCorrect || 0) + 1;

      // 1. First question overall
      const m1 = this.unlockMilestone('first_correct');
      if (m1) unlocked.push(m1);

      // 2. Topic milestone
      const topicKey = `topic_${category}`;
      const mTopic = this.unlockMilestone(topicKey);
      if (mTopic) unlocked.push(mTopic);

      // 3. Count milestones
      const correct = this.stats.totalCorrect;
      if (correct >= 10) {
        const m = this.unlockMilestone('count_10');
        if (m) unlocked.push(m);
      }
      if (correct >= 50) {
        const m = this.unlockMilestone('count_50');
        if (m) unlocked.push(m);
      }
      if (correct >= 100) {
        const m = this.unlockMilestone('count_100');
        if (m) unlocked.push(m);
      }
    }

    this.saveStats();
    return unlocked;
  }

  recordQuizCompletion(score, totalQuestions) {
    const unlocked = [];
    if (score > (this.stats.bestScore || 0)) {
      this.stats.bestScore = score;
    }
    this.saveStats();

    // Check score milestones
    if (score >= 8) {
      const m = this.unlockMilestone('score_8');
      if (m) unlocked.push(m);
    }
    if (score >= 9) {
      const m = this.unlockMilestone('score_9');
      if (m) unlocked.push(m);
    }
    if (score >= 10 || (totalQuestions > 0 && score === totalQuestions)) {
      const m = this.unlockMilestone('score_10');
      if (m) unlocked.push(m);
    }

    // Refresh streak checks
    this.recordDailyLogin();
    const streakBadges = this.checkStreakMilestones();
    unlocked.push(...streakBadges);

    return unlocked;
  }

  getStats() {
    const attempted = this.stats.totalAttempted || 0;
    const correct = this.stats.totalCorrect || 0;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    return {
      totalAttempted: attempted,
      totalCorrect: correct,
      accuracy,
      bestScore: this.stats.bestScore || 0,
      totalDaysPlayed: Math.max(1, this.datesPlayed.length),
      currentStreak: this.streakInfo.currentStreak || 1,
      bestStreak: this.streakInfo.bestStreak || 1,
      lifetimeStars: Math.max(this.coins, this.lifetimeStars || 0)
    };
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
    if (amount > 0) {
      this.lifetimeStars = (this.lifetimeStars || 0) + amount;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.COINS, this.coins.toString());
      localStorage.setItem(this.STORAGE_KEYS.LIFETIME_STARS, this.lifetimeStars.toString());
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

  setPalmMat(matId) {
    this.userPalmMat = matId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.PALM_MAT, matId);
    }
    this.applyPalmMatStyle();
  }

  applyPalmMatStyle() {
    if (typeof document === 'undefined') return;
    const palmMat = document.getElementById('palmRestMat');
    if (!palmMat) return;
    const allMats = ['mat_slate', 'mat_woodcraft', 'mat_space', 'mat_neon_cyber'];
    allMats.forEach((m) => palmMat.classList.remove(m));
    palmMat.classList.add(this.userPalmMat || 'mat_slate');
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


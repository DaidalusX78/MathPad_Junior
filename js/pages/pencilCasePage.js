/**
 * MathPad Junior - The Pencil Case Page Controller
 * Handles shop catalog display, equipment, star wallet, and settings/stats modals
 */

import { studentProgress, MILESTONES_CONFIG } from '../data/studentProgress.js';
import { pencilCaseCatalog } from '../data/pencilCaseData.js';
import { audioManager } from '../core/audioManager.js';

export class PencilCasePage {
  constructor() {
    this.userState = {
      coins: studentProgress.coins || 0,
      streak: studentProgress.streakInfo?.currentStreak || 1,
      perfectQuizzes: studentProgress.stats?.bestScore === 10 ? 3 : 1,
      ownedItems: JSON.parse(
        localStorage.getItem('elismark_owned_items') ||
          '["ink_lilac", "ink_red", "ink_green", "ink_blue", "ink_black", "paper_blank", "paper_squares", "paper_dots", "paper_lines", "mat_slate"]'
      ),
      equippedItems: {
        inks: localStorage.getItem('elismark_active_ink') || 'ink_lilac',
        papers: studentProgress.userPaper || 'paper-blank',
        deskMats: studentProgress.userPalmMat || 'mat_slate',
        accessories: localStorage.getItem('elismark_active_acc') || 'acc_none',
        stickers: 'stk_star'
      }
    };

    this.categoryMeta = {
      inks: { title: '🖊️ Magic Inks Catalogue', countId: 'badgeCountInks' },
      papers: { title: '📐 Paper Textures Catalogue', countId: 'badgeCountPapers' },
      deskMats: { title: '🖼️ Palm Rest Mats Catalogue', countId: 'badgeCountMats' },
      accessories: { title: '👑 Mascot Gear Catalogue', countId: 'badgeCountGear' },
      stickers: { title: '⭐ Reward Stickers Catalogue', countId: 'badgeCountStickers' }
    };

    this.activeCat = 'inks';
    this.draftSettings = null;
  }

  init() {
    studentProgress.applyStoredStyles();
    this.renderWallet();
    this.switchCategory('inks');
    this.bindWindowGlobals();
  }

  showToast(msg) {
    const toast = document.getElementById('shopToast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  renderWallet() {
    this.userState.coins = studentProgress.coins || 0;
    const el = document.getElementById('userCoins');
    if (el) el.innerText = this.userState.coins;

    const nameEl = document.getElementById('badgeName');
    if (nameEl) nameEl.innerText = studentProgress.playerName || 'Eli';

    const avatarEl = document.getElementById('badgeAvatar');
    if (avatarEl) avatarEl.innerText = studentProgress.userAvatar || '🦄';

    const shopStars = document.getElementById('shopTabStarsCount');
    if (shopStars) shopStars.innerText = this.userState.coins;
  }

  switchCategory(catId) {
    this.activeCat = catId;

    const squares = document.querySelectorAll('.category-square-btn');
    squares.forEach((btn) => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      btn.classList.toggle('active', onclickAttr.includes(`'${catId}'`));
    });

    const titleEl = document.getElementById('activeCategoryTitle');
    if (titleEl && this.categoryMeta[catId]) {
      titleEl.innerText = this.categoryMeta[catId].title;
    }

    this.renderCategoryItems(catId);
    audioManager.playSound('click');
  }

  renderCategoryItems(catId) {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const items = pencilCaseCatalog.items[catId] || [];

    items.forEach((item) => {
      const card = document.createElement('div');
      const isOwned = this.userState.ownedItems.includes(item.id) || item.unlockedByDefault;
      const isEquipped = this.userState.equippedItems[catId] === item.id;

      let isLocked = false;
      let lockReason = '';

      if (item.unlockReq) {
        if (item.unlockReq.type === 'streak' && this.userState.streak < item.unlockReq.value) {
          isLocked = true;
          lockReason = `🔒 ${item.unlockReq.label}`;
        } else if (item.unlockReq.type === 'perfectQuiz' && this.userState.perfectQuizzes < item.unlockReq.value) {
          isLocked = true;
          lockReason = `🔒 ${item.unlockReq.label}`;
        }
      }

      card.className = `item-card ${isEquipped ? 'is-equipped' : ''}`;

      let previewHtml = '';
      if (item.previewHtml) {
        previewHtml = item.previewHtml;
      } else if (item.icon) {
        previewHtml = `<span style="font-size: 2.8rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1));">${item.icon}</span>`;
      }

      let actionButtonHtml = '';
      if (isEquipped) {
        actionButtonHtml = `<button class="action-btn equipped">✓ Equipped</button>`;
      } else if (isOwned) {
        actionButtonHtml = `<button class="action-btn equip" onclick="equipItem('${catId}', '${item.id}', '${item.name}')">Equip</button>`;
      } else if (isLocked) {
        actionButtonHtml = `<button class="action-btn locked" disabled>${lockReason}</button>`;
      } else {
        actionButtonHtml = `<button class="action-btn buy" onclick="buyItem('${catId}', '${item.id}', ${item.price}, '${item.name}')">⭐ ${item.price} Stars</button>`;
      }

      card.innerHTML = `
        ${isEquipped ? '<div class="equipped-ribbon">ACTIVE</div>' : ''}
        <div class="preview-box">
          ${previewHtml}
        </div>
        <div class="item-meta">
          <h3>${item.name}</h3>
          <p>${item.desc || ''}</p>
        </div>
        <div class="item-actions">
          ${actionButtonHtml}
        </div>
      `;

      grid.appendChild(card);
    });
  }

  buyItem(catId, itemId, price, itemName) {
    if (this.userState.coins >= price) {
      studentProgress.addStars(-price);
      this.userState.coins = studentProgress.coins;
      this.userState.ownedItems.push(itemId);
      localStorage.setItem('elismark_owned_items', JSON.stringify(this.userState.ownedItems));
      this.equipItem(catId, itemId, itemName, false);
      this.renderWallet();
      this.renderCategoryItems(catId);
      audioManager.playSound('success');
      this.showToast(`🎉 Bought & equipped "${itemName}"!`);
    } else {
      audioManager.playSound('error');
      alert(`Not enough Math Stars! You need ⭐ ${price} Stars to buy this item.`);
    }
  }

  equipItem(catId, itemId, itemName, showFeedback = true) {
    this.userState.equippedItems[catId] = itemId;

    if (catId === 'papers') {
      studentProgress.setPaper(itemId);
    } else if (catId === 'deskMats') {
      studentProgress.setPalmMat(itemId);
    } else if (catId === 'inks') {
      studentProgress.setInk(itemId);
    }

    localStorage.setItem(`elismark_active_${catId}`, itemId);
    this.renderCategoryItems(catId);
    if (showFeedback) {
      audioManager.playSound('click');
      this.showToast(`✨ Equipped "${itemName}"!`);
    }
  }

  // ------------------- Settings Modal Handling -------------------
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
    this.switchSettingsSection('profile');

    document.getElementById('settingsModal')?.classList.add('active');
    audioManager.playSound('click');
  }

  syncDraftHighlights() {
    if (!this.draftSettings) return;

    document.querySelectorAll('#settingsModal .avatar-btn').forEach((b) => {
      const av = b.dataset.avatar || b.innerText.trim();
      b.classList.toggle('active', av === this.draftSettings.avatar);
    });

    document.querySelectorAll('#settingsModal .theme-swatch').forEach((s) => {
      const accent = s.dataset.accent || '';
      s.classList.toggle('active', accent.toLowerCase() === this.draftSettings.themeAccent.toLowerCase());
    });

    document.querySelectorAll('#settingsModal .paper-btn').forEach((b) => {
      const paper = b.dataset.paper || '';
      b.classList.toggle('active', paper === this.draftSettings.paper);
    });

    document.getElementById('flagEN')?.classList.toggle('active', this.draftSettings.lang === 'en');
    document.getElementById('flagES')?.classList.toggle('active', this.draftSettings.lang === 'es');

    document.getElementById('soundModalBtn')?.classList.toggle('active', this.draftSettings.sound);
    const soundStatus = document.getElementById('lblSoundStatus');
    if (soundStatus) {
      soundStatus.innerText = this.draftSettings.sound ? 'On' : 'Off';
    }
  }

  switchSettingsSection(section) {
    const tabs = ['profile', 'settings', 'shop', 'about'];
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
    audioManager.playSound('click');
  }

  stageLanguage(lang) {
    if (!this.draftSettings) return;
    this.draftSettings.lang = lang;
    this.syncDraftHighlights();
    audioManager.playSound('click');
  }

  stagePalmToggle() {
    // In shop, palm rest toggle is decorative or status
    audioManager.playSound('click');
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
    this.renderWallet();
    this.closeSettingsModal();
    audioManager.playSound('success');
  }

  cancelSettingsModal() {
    studentProgress.applyStoredStyles();
    this.draftSettings = null;
    this.renderWallet();
    this.closeSettingsModal();
  }

  closeSettingsModal() {
    document.getElementById('settingsModal')?.classList.remove('active');
  }

  // ------------------- Stats Modal Handling -------------------
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

  bindWindowGlobals() {
    window.switchCategory = (catId) => this.switchCategory(catId);
    window.buyItem = (catId, itemId, price, itemName) => this.buyItem(catId, itemId, price, itemName);
    window.equipItem = (catId, itemId, itemName) => this.equipItem(catId, itemId, itemName);

    window.openSettingsModal = () => this.openSettingsModal();
    window.closeSettingsModal = () => this.closeSettingsModal();
    window.saveSettingsModal = () => this.saveSettingsModal();
    window.cancelSettingsModal = () => this.cancelSettingsModal();
    window.switchSettingsSection = (sec) => this.switchSettingsSection(sec);
    window.stagePlayerName = (v) => this.stagePlayerName(v);
    window.stageAvatar = (av) => this.stageAvatar(av);
    window.stageTheme = (acc, sub, bor) => this.stageTheme(acc, sub, bor);
    window.stagePaper = (p) => this.stagePaper(p);
    window.stageLanguage = (l) => this.stageLanguage(l);
    window.stagePalmToggle = () => this.stagePalmToggle();
    window.stageSoundToggle = () => this.stageSoundToggle();

    window.openStatsModal = () => this.openStatsModal();
    window.closeStatsModal = () => this.closeStatsModal();

    window.logoutPlayer = () => {
      studentProgress.logout();
      window.location.href = 'index.html';
    };

    window.handleOverlayClick = (e) => {
      if (e.target.id === 'settingsModal') {
        this.cancelSettingsModal();
      } else if (e.target.id === 'statsModal') {
        this.closeStatsModal();
      }
    };
  }
}

// Instantiate and start on page load
if (typeof window !== 'undefined') {
  const page = new PencilCasePage();
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => page.init());
  } else {
    page.init();
  }
}

export const app = {};

const tg = window.Telegram?.WebApp;

const STORAGE_KEYS = {
  theme: 'couples_theme',
  history: 'couples_history',
  premium: 'premium_unlocked',
  adult: 'adult_ok',
  customQuestions: 'custom_questions',
  questionsCache: 'couples_questions_v4',
  settings: 'couples_settings_v1',
  onboardingSeen: 'couples_onboarding_seen_v1',
  favorites: 'couples_favorites_v1',
  challenge: 'couples_challenge_v1',
  achievements: 'couples_achievements_v1'
};

const DEFAULT_SETTINGS = {
  vibration: true,
  animations: true,
  roundSize: 8
};

const CATEGORY_META = [
  { id: '18+', icon: 'spark', desc: 'Откровенные вопросы', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', badge: '18+', cover: 'images/bg_intimate_card.jpg' },
  { id: 'На расстоянии', icon: 'distance', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)', cover: 'images/bg_distance_card.jpg' },
  { id: 'Будущее', icon: 'future', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)', cover: 'images/bg_future_card.jpg' },
  { id: 'Финансы', icon: 'finance', desc: 'Деньги, цели и бюджет', color: 'linear-gradient(180deg,#f59e0b,#f97316)', cover: 'images/bg_finance_card.jpg' },
  { id: 'Психология', icon: 'mind', desc: 'Эмоции и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)', cover: 'images/bg_psychology_card.jpg' },
  { id: 'Воспоминания', icon: 'memory', desc: 'Лучшие моменты вместе', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)', cover: 'images/bg_memory_card.png' },
  { id: 'Блиц', icon: 'bolt', desc: 'Проверка знаний (30 сек)', color: 'linear-gradient(180deg,#eab308,#ef4444)', cover: 'images/bg_blitz_card.png' },
  { id: 'Своя игра', icon: 'edit', desc: 'Создай свои вопросы', color: 'linear-gradient(180deg,#10b981,#3b82f6)', isPremium: true, cover: 'images/bg_custom_card.png' }
];

const CATEGORY_BACKGROUNDS = {};

const DUO_PLAYERS = ['Игрок 1', 'Игрок 2'];
const ROOT_SCREENS = ['home', 'categories', 'onboarding', 'error'];
const SWIPE_HELP = 'Свайп: влево — не совпало, вправо — совпало, вверх — пропуск';

const screens = {
  home: document.getElementById('homeScreen'),
  onboarding: document.getElementById('onboardingScreen'),
  error: document.getElementById('errorScreen'),
  categories: document.getElementById('categoriesScreen'),
  intro: document.getElementById('categoryIntroScreen'),
  game: document.getElementById('gameScreen'),
  blitz: document.getElementById('blitzScreen'),
  results: document.getElementById('resultsScreen'),
  history: document.getElementById('historyScreen'),
  customGame: document.getElementById('customGameScreen'),
  settings: document.getElementById('settingsScreen'),
  favorites: document.getElementById('favoritesScreen'),
  achievements: document.getElementById('achievementsScreen')
};

const ui = {
  loadingScreen: document.getElementById('loadingScreen'),
  loadingText: document.getElementById('loadingText'),
  backBtn: document.getElementById('backBtn'),
  themeBtn: document.getElementById('themeBtn'),
  themeBtnIcon: document.getElementById('themeBtnIcon'),
  settingsBtn: document.getElementById('settingsBtn'),
  startBtn: document.getElementById('startBtn'),
  historyBtn: document.getElementById('historyBtn'),
  openSettingsBtn: document.getElementById('openSettingsBtn'),
  dailyQuestionCategory: document.getElementById('dailyQuestionCategory'),
  dailyQuestionText: document.getElementById('dailyQuestionText'),
  dailyQuestionBtn: document.getElementById('dailyQuestionBtn'),
  favoritesBtn: document.getElementById('favoritesBtn'),
  favoritesCountText: document.getElementById('favoritesCountText'),
  challengeProgressText: document.getElementById('challengeProgressText'),
  challengeHintText: document.getElementById('challengeHintText'),
  achievementCountText: document.getElementById('achievementCountText'),
  achievementHintText: document.getElementById('achievementHintText'),
  achievementsBtn: document.getElementById('achievementsBtn'),
  achievementsList: document.getElementById('achievementsList'),
  achievementLegend: document.getElementById('achievementLegend'),
  achievementUnlock: document.getElementById('achievementUnlock'),
  achievementUnlockCard: document.getElementById('achievementUnlockCard'),
  inviteBtn: document.getElementById('inviteBtn'),
  onboardingTitle: document.getElementById('onboardingTitle'),
  onboardingText: document.getElementById('onboardingText'),
  onboardingVisual: document.getElementById('onboardingVisual'),
  onboardingProgress: document.getElementById('onboardingProgress'),
  onboardingPoints: document.getElementById('onboardingPoints'),
  onboardingNextBtn: document.getElementById('onboardingNextBtn'),
  onboardingSkipBtn: document.getElementById('onboardingSkipBtn'),
  retryLoadBtn: document.getElementById('retryLoadBtn'),
  goHomeFromErrorBtn: document.getElementById('goHomeFromErrorBtn'),
  errorText: document.getElementById('errorText'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  introCard: document.getElementById('categoryIntroCard'),

  gameCategory: document.getElementById('gameCategory'),
  gameTitle: document.getElementById('gameTitle'),
  progressLabel: document.getElementById('progressLabel'),
  progressFill: document.getElementById('progressFill'),
  remainingQuestionsLabel: document.getElementById('remainingQuestionsLabel'),
  streakLabel: document.getElementById('streakLabel'),
  favoriteQuestionBtn: document.getElementById('favoriteQuestionBtn'),
  questionText: document.getElementById('questionText'),
  questionCard: document.getElementById('questionCard'),
  swipeHelp: document.getElementById('swipeHelp'),
  matchBtn: document.getElementById('matchBtn'),
  mismatchBtn: document.getElementById('mismatchBtn'),
  skipBtn: document.getElementById('skipBtn'),
  turnBadge: document.getElementById('turnBadge'),

  blitzTimerDisplay: document.getElementById('blitzTimerDisplay'),
  blitzCorrectScore: document.getElementById('blitzCorrectScore'),
  blitzTotalScore: document.getElementById('blitzTotalScore'),
  blitzQuestionText: document.getElementById('blitzQuestionText'),
  blitzCorrectBtn: document.getElementById('blitzCorrectBtn'),
  blitzIncorrectBtn: document.getElementById('blitzIncorrectBtn'),

  resultsCategory: document.getElementById('resultsCategory'),
  resultsScore: document.getElementById('resultsScore'),
  resultsMessage: document.getElementById('resultsMessage'),
  statMatch: document.getElementById('statMatch'),
  statMismatch: document.getElementById('statMismatch'),
  statSkip: document.getElementById('statSkip'),
  statLabelMatch: document.getElementById('statLabelMatch'),
  statLabelMismatch: document.getElementById('statLabelMismatch'),
  restartBtn: document.getElementById('restartBtn'),
  resultsVibe: document.getElementById('resultsVibe'),
  resultsBreakdown: document.getElementById('resultsBreakdown'),
  resultsAchievements: document.getElementById('resultsAchievements'),
  changeCategoryBtn: document.getElementById('changeCategoryBtn'),
  shareBtn: document.getElementById('shareBtn'),
  historyList: document.getElementById('historyList'),
  historySearchInput: document.getElementById('historySearchInput'),
  favoritesList: document.getElementById('favoritesList'),
  startFavoritesBtn: document.getElementById('startFavoritesBtn'),
  categoryCardTemplate: document.getElementById('categoryCardTemplate'),
  historyItemTemplate: document.getElementById('historyItemTemplate'),
  emptyStateTemplate: document.getElementById('emptyStateTemplate'),
  favoriteItemTemplate: document.getElementById('favoriteItemTemplate'),

  adultModal: document.getElementById('adultModal'),
  adultConfirmBtn: document.getElementById('adultConfirmBtn'),
  adultCancelBtn: document.getElementById('adultCancelBtn'),
  customQuestionsList: document.getElementById('customQuestionsList'),
  addCustomQuestionBtn: document.getElementById('addCustomQuestionBtn'),
  saveCustomGameBtn: document.getElementById('saveCustomGameBtn'),
  premiumModal: document.getElementById('premiumModal'),
  buyPremiumBtn: document.getElementById('buyPremiumBtn'),
  closePremiumBtn: document.getElementById('closePremiumBtn'),
  passModal: document.getElementById('passModal'),
  passModalTitle: document.getElementById('passModalTitle'),
  passModalText: document.getElementById('passModalText'),
  passModalBtn: document.getElementById('passModalBtn'),

  vibrationToggle: document.getElementById('vibrationToggle'),
  animationsToggle: document.getElementById('animationsToggle'),
  roundSizeSelect: document.getElementById('roundSizeSelect'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  resetCustomBtn: document.getElementById('resetCustomBtn'),
  resetFlagsBtn: document.getElementById('resetFlagsBtn'),
  toastStack: document.getElementById('toastStack')
};

const bgLayers = [document.querySelector('.bg-layer-a'), document.querySelector('.bg-layer-b')];

const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getRaw(key, fallback = null) {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  },
  setRaw(key, value) {
    localStorage.setItem(key, value);
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

const state = {
  questionsData: {},
  currentCategory: null,
  currentQuestions: [],
  currentIndex: 0,
  stats: { match: 0, mismatch: 0, skip: 0 },
  gameMode: 'solo',
  duoRoundAnswers: [null, null],
  duoActivePlayer: 0,
  pendingAdultCategory: null,
  navStack: ['home'],
  blitzTimer: null,
  blitzTimeLeft: 30,
  activeBgLayerIndex: 0,
  activeModal: null,
  loadError: null,
  historyFilter: '',
  onboardingStep: 0,
  settings: { ...DEFAULT_SETTINGS },
  favorites: storage.get(STORAGE_KEYS.favorites, []),
  lastRoundAchievements: [],
  shareAchievement: null,
  questionStreak: 0,
  swipe: {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dragging: false,
    pointerId: null,
    isAnimating: false
  }
};

const helpers = {
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },
  resultMessage(score, isBlitz = false) {
    if (isBlitz) {
      if (score >= 100) return 'Идеальное знание партнера! Ты помнишь каждую мелочь.';
      if (score >= 80) return 'Отличный результат! Вы очень хорошо знаете друг друга.';
      if (score >= 50) return 'Хороший результат, но есть что вспомнить и обсудить.';
      return 'Кажется, стоит почаще задавать друг другу вопросы и слушать внимательнее!';
    }
    if (score >= 100) return 'Идеальное совпадение! Вы мыслите как одна команда.';
    if (score >= 85) return 'Очень сильное совпадение — вы отлично чувствуете друг друга.';
    if (score >= 60) return 'Хороший результат. Есть много общего, но и повод для разговора.';
    return 'У вас разные взгляды — отличный повод поговорить откровенно и без давления.';
  },
  getCurrentCategoryQuestions(categoryId) {
    return state.questionsData[categoryId] || [];
  },
  getPremiumUnlocked() {
    return storage.getRaw(STORAGE_KEYS.premium) === 'true';
  },
  todayKey() {
    return new Date().toISOString().slice(0, 10);
  },
  allPlayableQuestions() {
    const items = [];
    Object.entries(state.questionsData || {}).forEach(([category, questions]) => {
      if (category === 'Блиц') return;
      if (category === '18+' && !helpers.isAdultConfirmed()) return;
      if (!Array.isArray(questions)) return;
      questions.forEach((question) => items.push({ category, question }));
    });
    return items;
  },
  dailyQuestion() {
    const pool = this.allPlayableQuestions();
    if (!pool.length) return null;
    const key = this.todayKey();
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
    return pool[hash % pool.length];
  },
  isFavorite(question, category) {
    return state.favorites.some((item) => item.question === question && item.category === category);
  },
  vibeByScore(score) {
    if (score >= 90) return 'Космический мэтч';
    if (score >= 75) return 'Тёплый и очень близкий вайб';
    if (score >= 55) return 'Живой вайб с поводом для разговора';
    return 'Контрастный вайб — обсудить будет интересно';
  },
  categoryIconSvg(iconId = 'spark') {
    const icons = {
      spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3z"></path><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"></path><path d="M5 13l1 2.6L8.5 17 6 18l-1 2.5L4 18l-2.5-1.4L4 15.6 5 13z"></path></svg>`,
      distance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20s-4.5-2.9-6-5.3A3.7 3.7 0 0 1 8 10.4a3.7 3.7 0 0 1 6 4.3C12.5 17.1 8 20 8 20z"></path><path d="M16 4v6"></path><path d="M13 7h6"></path><path d="M18.5 20H22"></path><path d="M15.5 17h6"></path></svg>`,
      future: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.7 5.5 6.1.9-4.4 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.2 6.1-.9L12 2z"></path><circle cx="12" cy="12" r="1.5"></circle></svg>`,
      finance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="3"></rect><path d="M7 12h10"></path><path d="M9 9.5h6"></path><path d="M9 14.5h4"></path></svg>`,
      mind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M8.7 14.6A6.5 6.5 0 1 1 15.3 14.6c-.7.7-1.1 1.5-1.3 2.4h-4c-.2-.9-.6-1.7-1.3-2.4z"></path><path d="M10 9.2c.4-.8 1.2-1.2 2-1.2 1.1 0 2 .8 2 1.9 0 1.4-2 1.8-2 3.1"></path></svg>`,
      memory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5.2-5.2a1.2 1.2 0 0 0-1.7 0L8 17"></path></svg>`,
      bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"></path></svg>`,
      edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>`
    };
    return icons[iconId] || icons.spark;
  },
  achievementRarityMeta(rarity = 'common') {
    const rarities = {
      common: { label: 'Обычная', className: 'rarity-common' },
      rare: { label: 'Редкая', className: 'rarity-rare' },
      epic: { label: 'Эпическая', className: 'rarity-epic' },
      legendary: { label: 'Легендарная', className: 'rarity-legendary' }
    };
    return rarities[rarity] || rarities.common;
  },
  achievementCatalog() {
    return [
      { id: 'first_game', title: 'Первый раунд', description: 'Заверши свою первую игру до конца.', rarity: 'common', art: 'spark', check: (stats) => stats.games >= 1 },
      { id: 'ten_games', title: 'На одной волне', description: 'Сыграй 10 полных раундов.', rarity: 'rare', art: 'rings', check: (stats) => stats.games >= 10 },
      { id: 'hundred_questions', title: 'Сотня откровений', description: 'Пройди 100 вопросов во всех режимах.', rarity: 'epic', art: 'crown', check: (stats) => stats.questions >= 100 },
      { id: 'five_day_streak', title: 'Серия 5 дней', description: 'Возвращайся в игру 5 дней подряд.', rarity: 'rare', art: 'flame', check: (stats) => stats.streak >= 5 },
      { id: 'romantic_master', title: 'Идеальный мэтч', description: 'Набери 80%+ совместимости в категории.', rarity: 'legendary', art: 'gem', check: (stats, ctx) => ctx.score >= 80 }
    ];
  },
  achievementArtSvg(art = 'spark') {
    const icons = {
      spark: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8l4.2 11.8L48 24l-11.8 4.2L32 40l-4.2-11.8L16 24l11.8-4.2L32 8z"></path><path d="M49 40l2.2 6.1L57 48l-5.8 1.9L49 56l-2.2-6.1L41 48l5.8-1.9L49 40z"></path></svg>`,
      rings: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="36" r="12"></circle><circle cx="40" cy="36" r="12"></circle><path d="M32 24l4-8"></path><path d="M36 16h8"></path></svg>`,
      crown: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 46l4-22 16 12 16-12 4 22H12z"></path><path d="M18 46v8h28v-8"></path><circle cx="16" cy="20" r="3"></circle><circle cx="32" cy="12" r="3"></circle><circle cx="48" cy="20" r="3"></circle></svg>`,
      flame: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M35 10c2 9-8 11-8 20 0 4 2.6 7 5 7 3.6 0 6-2.8 6-6 0-5-4-7-3-13 8 5 12 12 12 20 0 10-6.8 18-15 18S17 48 17 39c0-10 6-16 18-29z"></path></svg>`,
      gem: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 24l8-10h16l8 10-16 26-16-26z"></path><path d="M24 14l8 10 8-10"></path><path d="M16 24h32"></path></svg>`
    };
    return icons[art] || icons.spark;
  },
  achievementById(id) {
    return this.achievementCatalog().find((item) => item.id === id) || null;
  },
  isAdultConfirmed() {
    return storage.getRaw(STORAGE_KEYS.adult) === 'yes';
  },
  formatHistoryDate(date = new Date()) {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  getRoundSize(sourceLength) {
    const preferred = Number(state.settings.roundSize) || DEFAULT_SETTINGS.roundSize;
    if (!sourceLength) return 0;
    return Math.min(preferred, sourceLength);
  }
};



const templates = {
  clone(templateEl) {
    if (!templateEl?.content?.firstElementChild) return null;
    return templateEl.content.firstElementChild.cloneNode(true);
  },
  empty(message) {
    const node = this.clone(ui.emptyStateTemplate) || document.createElement('div');
    node.className = node.className || 'history-empty';
    const target = node.querySelector('[data-role="message"]') || node;
    target.textContent = message;
    return node;
  }
};
const notify = {
  show(message, type = 'info', timeout = 2400) {
    const stack = ui.toastStack;
    if (!stack || !message) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `<span class="toast-dot" aria-hidden="true"></span><div class="toast-copy">${helpers.escapeHtml(message)}</div>`;
    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    const remove = () => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 220);
    };
    setTimeout(remove, timeout);
    toast.addEventListener('click', remove, { once: true });
  },
  success(message, timeout) { this.show(message, 'success', timeout); },
  info(message, timeout) { this.show(message, 'info', timeout); },
  error(message, timeout) { this.show(message, 'error', timeout); }
};

const loading = {
  show(text = 'Загрузка...') {
    if (ui.loadingText) ui.loadingText.textContent = text;
    ui.loadingScreen?.classList.remove('hidden');
    document.body.classList.add('app-loading');
  },
  hide() {
    ui.loadingScreen?.classList.add('hidden');
    document.body.classList.remove('app-loading');
  },
  setText(text) {
    if (ui.loadingText) ui.loadingText.textContent = text;
  }
};

const background = {
  clearBodyClasses() {
    document.body.classList.remove('has-category-bg', 'category-future', 'category-distance', 'category-finance');
  },
  reset() {
    this.clearBodyClasses();
    bgLayers.forEach((layer, index) => {
      if (!layer) return;
      layer.style.background = 'var(--bg)';
      layer.style.backgroundImage = '';
      layer.classList.remove('prep', 'reveal');
      layer.classList.toggle('active', index === state.activeBgLayerIndex);
    });
  },
  apply(categoryId = '') {
    const config = CATEGORY_BACKGROUNDS[categoryId];
    const currentLayer = bgLayers[state.activeBgLayerIndex];
    const nextLayer = bgLayers[(state.activeBgLayerIndex + 1) % bgLayers.length];
    if (!config) return this.reset();
    this.clearBodyClasses();
    document.body.classList.add('has-category-bg', config.bodyClass);
    if (!currentLayer || !nextLayer) return;
    nextLayer.style.background = '';
    nextLayer.style.backgroundImage = `url("${config.file}")`;
    nextLayer.style.backgroundSize = 'cover';
    nextLayer.style.backgroundPosition = 'center center';
    nextLayer.classList.remove('active', 'reveal');
    nextLayer.classList.add('prep');
    requestAnimationFrame(() => {
      nextLayer.classList.add('reveal');
      nextLayer.classList.remove('prep');
      currentLayer.classList.remove('active');
      nextLayer.classList.add('active');
      state.activeBgLayerIndex = (state.activeBgLayerIndex + 1) % bgLayers.length;
    });
  }
};

const fx = {
  canAnimate() {
    return !!state.settings.animations;
  },
  vibrate(type = 'medium') {
    if (!state.settings.vibration) return;
    if (tg?.HapticFeedback) {
      if (['success', 'warning', 'error'].includes(type)) tg.HapticFeedback.notificationOccurred(type);
      else tg.HapticFeedback.impactOccurred(type);
      return;
    }
    if (navigator.vibrate) navigator.vibrate(type === 'light' ? 12 : 24);
  },
  pulseAnswerButton(type) {
    const btn = { match: ui.matchBtn, mismatch: ui.mismatchBtn, skip: ui.skipBtn }[type];
    const cls = { match: 'btn-pulse-match', mismatch: 'btn-pulse-mismatch', skip: 'btn-pulse-skip' }[type];
    if (!btn || !cls || !this.canAnimate()) return;
    btn.classList.remove(cls);
    void btn.offsetWidth;
    btn.classList.add(cls);
    setTimeout(() => btn.classList.remove(cls), 500);
  },
  launchReactionBurst(type, sourceEl = null) {
    if (!this.canAnimate()) return;
    const wrap = document.createElement('div');
    wrap.className = 'reaction-burst';
    const palette = {
      match: ['#34d399', '#86efac', '#dcfce7', '#ffffff'],
      mismatch: ['#fb7185', '#fda4af', '#ffe4e6', '#ffffff'],
      skip: ['#fbbf24', '#fde68a', '#fef3c7', '#ffffff']
    }[type] || ['#ffffff'];
    const rect = sourceEl?.getBoundingClientRect?.() || { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    for (let i = 0; i < 18; i += 1) {
      const particle = document.createElement('span');
      const angle = (Math.PI * 2 * i) / 18;
      const distance = 30 + Math.random() * 90;
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      particle.style.background = palette[Math.floor(Math.random() * palette.length)];
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      particle.style.animationDelay = `${Math.random() * 0.05}s`;
      wrap.appendChild(particle);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 900);
  },
  launchConfetti() {
    if (!this.canAnimate()) return;
    const wrap = document.createElement('div');
    const colors = ['#f59e0b', '#f472b6', '#22c55e', '#60a5fa', '#ffffff', '#fde047'];
    wrap.className = 'confetti-wrap';
    document.body.appendChild(wrap);
    for (let i = 0; i < 120; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.top = `${-10 - Math.random() * 20}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.transform = `translate3d(0,0,0) rotate(${Math.random() * 360}deg)`;
      piece.style.animationDuration = `${2.6 + Math.random() * 1.8}s`;
      piece.style.animationDelay = `${Math.random() * 0.18}s`;
      piece.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
      wrap.appendChild(piece);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 4600);
  }
};

const historyStore = {
  load() {
    return storage.get(STORAGE_KEYS.history, []);
  },
  save(entry) {
    const history = this.load();
    history.unshift(entry);
    storage.set(STORAGE_KEYS.history, history.slice(0, 12));
  },
  clear() {
    storage.set(STORAGE_KEYS.history, []);
  }
};

const modals = {
  open(element) {
    if (!element) return;
    state.activeModal = element;
    element.classList.remove('hidden');
    element.setAttribute('aria-hidden', 'false');
  },
  close(element) {
    if (!element) return;
    if (state.activeModal === element) state.activeModal = null;
    element.classList.add('hidden');
    element.setAttribute('aria-hidden', 'true');
  },
  closeAll() {
    [ui.adultModal, ui.premiumModal, ui.passModal].forEach((modal) => this.close(modal));
  }
};

const router = {
  syncBackButton(screenName) {
    const showBack = !ROOT_SCREENS.includes(screenName) || !!state.activeModal;
    ui.backBtn?.classList.toggle('hidden', !showBack);
    if (tg?.BackButton) {
      if (showBack) tg.BackButton.show();
      else tg.BackButton.hide();
    }
  },
  show(name, options = {}) {
    const { reset = false, replace = false } = options;
    Object.entries(screens).forEach(([screenName, screenEl]) => {
      screenEl?.classList.toggle('screen-active', screenName === name);
    });
    if (reset) state.navStack = [name];
    else if (replace) state.navStack[state.navStack.length - 1] = name;
    else if (state.navStack[state.navStack.length - 1] !== name) state.navStack.push(name);
    if (ROOT_SCREENS.includes(name)) background.apply('');
    else if (state.currentCategory) background.apply(state.currentCategory.id);
    this.syncBackButton(name);
  },
  current() {
    return state.navStack[state.navStack.length - 1] || 'home';
  },
  back() {
    if (state.activeModal) {
      modals.close(state.activeModal);
      this.syncBackButton(this.current());
      return;
    }
    if (this.current() === 'blitz') app.game?.clearBlitzTimer();
    if (state.navStack.length <= 1) {
      this.show('home', { reset: true });
      return;
    }
    state.navStack.pop();
    const prev = this.current();
    Object.entries(screens).forEach(([screenName, screenEl]) => {
      screenEl?.classList.toggle('screen-active', screenName === prev);
    });
    if (ROOT_SCREENS.includes(prev)) background.apply('');
    else if (state.currentCategory) background.apply(state.currentCategory.id);
    this.syncBackButton(prev);
  }
};

const theme = {
  icon(mode) {
    if (mode === 'light') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2.2"></path><path d="M12 18.8V21"></path><path d="M3 12h2.2"></path><path d="M18.8 12H21"></path><path d="M5.64 5.64l1.55 1.55"></path><path d="M16.81 16.81l1.55 1.55"></path><path d="M5.64 18.36l1.55-1.55"></path><path d="M16.81 7.19l1.55-1.55"></path><circle cx="12" cy="12" r="4"></circle></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"></path></svg>`;
  },
  apply(next) {
    const resolved = next === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('light', resolved === 'light');
    document.body.dataset.theme = resolved;
    storage.setRaw(STORAGE_KEYS.theme, resolved);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'light' ? '#efe7ff' : '#8b5cf6');
    if (ui.themeBtn) {
      ui.themeBtn.dataset.mode = resolved;
      ui.themeBtn.title = resolved === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему';
      ui.themeBtn.setAttribute('aria-label', ui.themeBtn.title);
    }
    if (ui.themeBtnIcon) ui.themeBtnIcon.innerHTML = this.icon(resolved === 'light' ? 'dark' : 'light');
    if (tg?.setHeaderColor) tg.setHeaderColor(resolved === 'light' ? '#efe7ff' : '#9f7aea');
  },
  init() {
    const saved = storage.getRaw(STORAGE_KEYS.theme);
    if (tg?.colorScheme) this.apply(saved || tg.colorScheme);
    else this.apply(saved === 'light' ? 'light' : 'dark');
  },
  toggle() {
    this.apply(document.body.classList.contains('light') ? 'dark' : 'light');
    fx.vibrate('light');
  }
};

const data = {
  loadSettings() {
    state.settings = { ...DEFAULT_SETTINGS, ...storage.get(STORAGE_KEYS.settings, {}) };
  },
  saveSettings() {
    storage.set(STORAGE_KEYS.settings, state.settings);
  },
  async loadQuestions() {
    let loadedFromNetwork = false;
    state.loadError = null;
    loading.setText('Загружаем вопросы...');
    try {
      const response = await fetch('questions.json', { cache: 'default' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const freshData = await response.json();
      if (freshData && typeof freshData === 'object' && Object.keys(freshData).length > 0) {
        state.questionsData = freshData;
        storage.set(STORAGE_KEYS.questionsCache, state.questionsData);
        loadedFromNetwork = true;
      }
    } catch (error) {
      console.error('Ошибка загрузки вопросов по сети', error);
      state.loadError = 'Не удалось загрузить свежие вопросы из файла questions.json.';
    }
    if (!loadedFromNetwork) {
      try {
        state.questionsData = storage.get(STORAGE_KEYS.questionsCache, {});
      } catch (error) {
        console.error('Ошибка чтения кэша вопросов', error);
        state.questionsData = {};
      }
    }
    if (!state.questionsData || typeof state.questionsData !== 'object') state.questionsData = {};
    const savedCustom = storage.get(STORAGE_KEYS.customQuestions, null);
    if (Array.isArray(savedCustom) && savedCustom.length) state.questionsData['Своя игра'] = savedCustom;
    if (Object.keys(state.questionsData).length === 0) {
      state.loadError = state.loadError || 'Не найден ни свежий файл вопросов, ни кэш на устройстве.';
      return false;
    }
    return true;
  }
};


const meta = {
  loadChallenge() {
    return storage.get(STORAGE_KEYS.challenge, { daysCompleted: 0, streak: 0, lastDate: null, games: 0, questions: 0 });
  },
  saveChallenge(data) {
    storage.set(STORAGE_KEYS.challenge, data);
  },
  loadAchievements() {
    return storage.get(STORAGE_KEYS.achievements, []);
  },
  saveAchievements(items) {
    storage.set(STORAGE_KEYS.achievements, items);
  },
  toggleFavorite() {
    const question = state.currentQuestions[state.currentIndex];
    const category = state.currentCategory?.id;
    if (!question || !category) return false;
    const idx = state.favorites.findIndex((item) => item.question === question && item.category === category);
    if (idx >= 0) state.favorites.splice(idx, 1);
    else state.favorites.unshift({ category, question, date: helpers.formatHistoryDate(new Date()) });
    state.favorites = state.favorites.slice(0, 120);
    storage.set(STORAGE_KEYS.favorites, state.favorites);
    return idx < 0;
  },
  recordRound(context) {
    const data = this.loadChallenge();
    const today = helpers.todayKey();
    if (data.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);
      data.streak = data.lastDate === yKey ? (data.streak || 0) + 1 : 1;
      data.daysCompleted = Math.min(7, (data.daysCompleted || 0) + 1);
      data.lastDate = today;
    }
    data.games = (data.games || 0) + 1;
    data.questions = (data.questions || 0) + (context.totalQuestions || 0);
    this.saveChallenge(data);
    const unlocked = new Set(this.loadAchievements());
    const newly = [];
    helpers.achievementCatalog().forEach((achievement) => {
      if (!unlocked.has(achievement.id) && achievement.check(data, context)) {
        unlocked.add(achievement.id);
        newly.push(achievement);
      }
    });
    this.saveAchievements(Array.from(unlocked));
    return { challenge: data, newly, unlocked: Array.from(unlocked).map((id) => helpers.achievementById(id)).filter(Boolean) };
  }
};

const premium = {
  purchase() {
    const originalText = ui.buyPremiumBtn.textContent;
    ui.buyPremiumBtn.textContent = 'Оплата...';
    ui.buyPremiumBtn.disabled = true;
    setTimeout(() => {
      storage.setRaw(STORAGE_KEYS.premium, 'true');
      modals.close(ui.premiumModal);
      ui.buyPremiumBtn.textContent = originalText;
      ui.buyPremiumBtn.disabled = false;
      fx.vibrate('success');
      fx.launchConfetti();
      app.render?.categories();
    }, 1200);
  }
};

async function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (typeof tg.disableVerticalSwipes === 'function') {
    try { tg.disableVerticalSwipes(); } catch {}
  }
  if (tg.BackButton) tg.BackButton.onClick(() => router.back());
}

Object.assign(app, {
  tg,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  CATEGORY_META,
  CATEGORY_BACKGROUNDS,
  DUO_PLAYERS,
  ROOT_SCREENS,
  SWIPE_HELP,
  screens,
  ui,
  bgLayers,
  storage,
  state,
  helpers,
  templates,
  notify,
  loading,
  background,
  fx,
  historyStore,
  modals,
  router,
  theme,
  data,
  premium,
  meta,
  initTelegram
});

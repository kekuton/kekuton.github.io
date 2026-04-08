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
  onboardingSeen: 'couples_onboarding_seen_v1'
};

const DEFAULT_SETTINGS = {
  vibration: true,
  animations: true,
  roundSize: 8
};

const CATEGORY_META = [
  { id: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', badge: '18+' },
  { id: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)' },
  { id: 'Будущее', icon: '🔮', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)' },
  { id: 'Финансы', icon: '💰', desc: 'Деньги, цели и бюджет', color: 'linear-gradient(180deg,#f59e0b,#f97316)' },
  { id: 'Психология', icon: '🧠', desc: 'Эмоции и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)' },
  { id: 'Воспоминания', icon: '📸', desc: 'Лучшие моменты вместе', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)' },
  { id: 'Блиц', icon: '⚡', desc: 'Проверка знаний (30 сек)', color: 'linear-gradient(180deg,#eab308,#ef4444)' },
  { id: 'Своя игра', icon: '✍️', desc: 'Создай свои вопросы', color: 'linear-gradient(180deg,#10b981,#3b82f6)', isPremium: true }
];

const CATEGORY_BACKGROUNDS = {
  'Будущее': { file: 'images/bg_future.webp', bodyClass: 'category-future' },
  'На расстоянии': { file: 'images/bg_distance.webp', bodyClass: 'category-distance' },
  'Финансы': { file: 'images/bg_finance.webp', bodyClass: 'category-finance' }
};

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
  settings: document.getElementById('settingsScreen')
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
  changeCategoryBtn: document.getElementById('changeCategoryBtn'),
  shareBtn: document.getElementById('shareBtn'),
  historyList: document.getElementById('historyList'),
  historySearchInput: document.getElementById('historySearchInput'),
  categoryCardTemplate: document.getElementById('categoryCardTemplate'),
  historyItemTemplate: document.getElementById('historyItemTemplate'),
  emptyStateTemplate: document.getElementById('emptyStateTemplate'),

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
  resetFlagsBtn: document.getElementById('resetFlagsBtn')
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
  loading,
  background,
  fx,
  historyStore,
  modals,
  router,
  theme,
  data,
  premium,
  initTelegram
});

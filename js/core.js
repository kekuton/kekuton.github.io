export const app = {};

const tg = window.Telegram?.WebApp;

const STORAGE_KEYS = {
  theme: 'couples_theme',
  adult: 'adult_ok',
  questionsCache: 'couples_questions_v4',
};

const DEFAULT_SETTINGS = {
  vibration: true,
  animations: true,
  roundSize: 25
};

const CATEGORY_META = [
  { id: 'Вечер для двоих', icon: 'heart', desc: 'Готовый тёплый сценарий на вечер', color: 'linear-gradient(180deg,#c084fc,#7c3aed)', badge: 'Сценарий', isScenario: true, cover: 'images/bg_evening_card.jpg' },
  { id: 'После ссоры', icon: 'peace', desc: 'Спокойные вопросы для примирения', color: 'linear-gradient(180deg,#7dd3fc,#2563eb)', badge: 'Мягко', cover: 'images/bg_after_fight_card.jpg' },
  { id: '18+', icon: 'spark', desc: 'Откровенные вопросы', color: 'linear-gradient(180deg,#7f1d1d,#3b0710)', badge: '18+', cover: 'images/bg_intimate_card.jpg' },
  { id: 'На расстоянии', icon: 'distance', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)', cover: 'images/bg_distance_card.jpg' },
  { id: 'Будущее', icon: 'future', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#38bdf8,#1d4ed8)', cover: 'images/bg_future_card.jpg' },
  { id: 'Финансы', icon: 'finance', desc: 'Деньги, цели и бюджет', color: 'linear-gradient(180deg,#22c55e,#166534)', cover: 'images/bg_finance_card.jpg' },
  { id: 'Психология', icon: 'mind', desc: 'Эмоции и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)', cover: 'images/bg_psychology_card.jpg' },
  { id: 'Воспоминания', icon: 'memory', desc: 'Лучшие моменты вместе', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)', cover: 'images/bg_memory_card.png' },
  { id: 'Блиц', icon: 'bolt', desc: 'Проверка знаний (30 сек)', color: 'linear-gradient(180deg,#fb923c,#ea580c)', cover: 'images/bg_blitz_card.png' }
];

const CATEGORY_BACKGROUNDS = {};

const ROOT_SCREENS = ['categories', 'error'];
const SWIPE_HELP = '';

const screens = {
  error: document.getElementById('errorScreen'),
  categories: document.getElementById('categoriesScreen'),
  game: document.getElementById('gameScreen'),
  completion: document.getElementById('completionScreen'),
};

const ui = {
  loadingScreen: document.getElementById('loadingScreen'),
  loadingText: document.getElementById('loadingText'),
  backBtn: document.getElementById('backBtn'),
  retryLoadBtn: document.getElementById('retryLoadBtn'),
  goHomeFromErrorBtn: document.getElementById('goHomeFromErrorBtn'),
  errorText: document.getElementById('errorText'),
  categoriesGrid: document.getElementById('categoriesGrid'),

  gameCategory: document.getElementById('gameCategory'),
  gameTitle: document.getElementById('gameTitle'),
  progressLabel: document.getElementById('progressLabel'),
  questionText: document.getElementById('questionText'),
  questionCard: document.getElementById('questionCard'),
  swipeHelp: document.getElementById('swipeHelp'),
  categoryCardTemplate: document.getElementById('categoryCardTemplate'),
  emptyStateTemplate: document.getElementById('emptyStateTemplate'),

  adultModal: document.getElementById('adultModal'),
  adultConfirmBtn: document.getElementById('adultConfirmBtn'),
  adultCancelBtn: document.getElementById('adultCancelBtn'),
  completionCard: document.getElementById('completionCard'),
  completionCategory: document.getElementById('completionCategory'),
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
  pendingAdultCategory: null,
  navStack: ['categories'],
  blitzTimer: null,
  blitzTimeLeft: 30,
  activeBgLayerIndex: 0,
  activeModal: null,
  loadError: null,
  onboardingStep: 0,
  settings: { ...DEFAULT_SETTINGS },
  questionStreak: 0,
  questionTransitionLocked: false,
  touchFallbackStartX: 0,
  touchFallbackStartY: 0,
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
    const questions = state.questionsData[categoryId] || [];
    return Array.isArray(questions) ? questions.slice(0, 25) : [];
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
      edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>`,
      heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"></path></svg>`,
      peace: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11.5V7a2 2 0 0 1 4 0v5"></path><path d="M12 12V6a2 2 0 0 1 4 0v7"></path><path d="M16 13V9a2 2 0 0 1 4 0v4.5c0 4.1-3.1 7.5-7.5 7.5H11a7 7 0 0 1-7-7v-2.5a2 2 0 0 1 4 0V14"></path></svg>`
    };
    return icons[iconId] || icons.spark;
  },
  isAdultConfirmed() {
    return storage.getRaw(STORAGE_KEYS.adult) === 'yes';
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
    if (!sourceLength) return 0;
    return Math.min(25, sourceLength);
  }
};



const templates = {
  clone(templateEl) {
    if (!templateEl?.content?.firstElementChild) return null;
    return templateEl.content.firstElementChild.cloneNode(true);
  },
  empty(message) {
    const node = this.clone(ui.emptyStateTemplate) || document.createElement('div');
    node.className = node.className || 'empty-state';
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
    // Конфетти отключено.
    return;
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
    [ui.adultModal].forEach((modal) => this.close(modal));
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
    document.body.dataset.screen = name;
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
      this.show('categories', { reset: true });
      return;
    }
    state.navStack.pop();
    const prev = this.current();
    document.body.dataset.screen = prev;
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
    // Смена режима/темы отключена: всегда используем основной тёмный стиль.
    storage.remove(STORAGE_KEYS.theme);
    this.apply('dark');
  },
  toggle() {
    this.apply(document.body.classList.contains('light') ? 'dark' : 'light');
    fx.vibrate('light');
  }
};

const data = {
  loadSettings() {
    state.settings = { ...DEFAULT_SETTINGS, animations: true, vibration: true, roundSize: 25 };
  },
  saveSettings() {},
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
    if (Object.keys(state.questionsData).length === 0) {
      state.loadError = state.loadError || 'Не найден ни свежий файл вопросов, ни кэш на устройстве.';
      return false;
    }
    return true;
  }
};


const meta = {};

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
  modals,
  router,
  theme,
  data,
  meta,
  initTelegram
});

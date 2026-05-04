export const app = {};

const tg = window.Telegram?.WebApp;

const VERSION = 'random-order-swipe-down-1';
const STORAGE_KEYS = {
  adult: 'adult_ok',
  questionsCache: `couples_questions_${VERSION}`,
  progressPrefix: 'couples_progress_',
  easterUnlocked: 'couples_easter_unlocked',
};

const ROUND_SIZE = 25;

const CATEGORY_META = [
  { id: 'Вечер для двоих', icon: '💜', desc: 'Тёплый вечер', color: 'linear-gradient(180deg,#c084fc,#7c3aed)', glow: 'rgba(192,132,252,.30)', bgStart: '#22113f', bgMid: '#160a2c', bgEnd: '#070611', isScenario: true, cover: 'images/bg_evening_card.jpg' },
  { id: 'После ссоры', icon: '🕊️', desc: 'Спокойный разговор', color: 'linear-gradient(180deg,#7dd3fc,#2563eb)', glow: 'rgba(125,211,252,.28)', bgStart: '#0e3448', bgMid: '#0b1d36', bgEnd: '#050811', cover: 'images/bg_after_fight_card.jpg' },
  { id: 'Перед сном', icon: '🌙', desc: 'Перед сном', color: 'linear-gradient(180deg,#a78bfa,#4338ca)', glow: 'rgba(167,139,250,.30)', bgStart: '#25164a', bgMid: '#15113a', bgEnd: '#070611', cover: 'images/bg_evening_card.jpg' },
  { id: '18+', icon: '✦', desc: 'Откровенно', color: 'linear-gradient(180deg,#991b1b,#3b0710)', glow: 'rgba(185,28,28,.30)', bgStart: '#3a0710', bgMid: '#1b0710', bgEnd: '#070307', cover: 'images/bg_intimate_card.jpg' },
  { id: 'На расстоянии', icon: '💌', desc: 'Когда далеко', color: 'linear-gradient(180deg,#38bdf8,#6366f1)', glow: 'rgba(56,189,248,.26)', bgStart: '#0d2f50', bgMid: '#111941', bgEnd: '#060713', cover: 'images/bg_distance_card.jpg' },
  { id: 'Будущее', icon: '✨', desc: 'Планы и мечты', color: 'linear-gradient(180deg,#38bdf8,#1d4ed8)', glow: 'rgba(59,130,246,.28)', bgStart: '#0b315f', bgMid: '#0a1f45', bgEnd: '#050811', cover: 'images/bg_future_card.jpg' },
  { id: 'Финансы', icon: '◈', desc: 'Деньги и цели', color: 'linear-gradient(180deg,#22c55e,#166534)', glow: 'rgba(34,197,94,.26)', bgStart: '#0a3d25', bgMid: '#092817', bgEnd: '#040a08', cover: 'images/bg_finance_card.jpg' },
  { id: 'Психология', icon: '☯', desc: 'Эмоции', color: 'linear-gradient(180deg,#22c55e,#14b8a6)', glow: 'rgba(20,184,166,.25)', bgStart: '#0b3d3a', bgMid: '#0a2a2c', bgEnd: '#050b0d', cover: 'images/bg_psychology_card.jpg' },
  { id: 'Воспоминания', icon: '☾', desc: 'Моменты', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)', glow: 'rgba(139,92,246,.28)', bgStart: '#152f58', bgMid: '#211440', bgEnd: '#070611', cover: 'images/bg_memory_card.png' },
  { id: 'Только для своих', icon: '◆', desc: 'Скрытая тема', color: 'linear-gradient(180deg,#f97316,#7f1d1d)', glow: 'rgba(249,115,22,.30)', bgStart: '#3b1607', bgMid: '#251006', bgEnd: '#070307', cover: 'images/bg_intimate_card.jpg', hidden: true },
];

const ROOT_SCREENS = ['categories', 'error'];

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
  gameBackBtn: document.getElementById('gameBackBtn'),
  retryLoadBtn: document.getElementById('retryLoadBtn'),
  goHomeFromErrorBtn: document.getElementById('goHomeFromErrorBtn'),
  errorText: document.getElementById('errorText'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  gameCategory: document.getElementById('gameCategory'),
  gameTitle: document.getElementById('gameTitle'),
  progressLabel: document.getElementById('progressLabel'),
  questionText: document.getElementById('questionText'),
  questionCard: document.getElementById('questionCard'),
  categoryCardTemplate: document.getElementById('categoryCardTemplate'),
  adultModal: document.getElementById('adultModal'),
  adultConfirmBtn: document.getElementById('adultConfirmBtn'),
  adultCancelBtn: document.getElementById('adultCancelBtn'),
  completionCard: document.getElementById('completionCard'),
  completionCategory: document.getElementById('completionCategory'),
  completionSummary: document.getElementById('completionSummary'),
  completionPhrase: document.getElementById('completionPhrase'),
  toastStack: document.getElementById('toastStack'),
};

const bgLayers = [document.querySelector('.bg-layer-a'), document.querySelector('.bg-layer-b')];

const storage = {
  get(key, fallback = null) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  getRaw(key, fallback = null) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  setRaw(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};

const state = {
  questionsData: {},
  currentCategory: null,
  currentQuestions: [],
  currentIndex: 0,
  pendingAdultCategory: null,
  navStack: ['categories'],
  activeModal: null,
  loadError: null,
  questionTransitionLocked: false,
  touchFallbackStartX: 0,
  touchFallbackStartY: 0,
  globalTouchStartX: 0,
  globalTouchStartY: 0,
  activeBgLayerIndex: 0,
  easterUnlocked: storage.getRaw(STORAGE_KEYS.easterUnlocked) === 'yes',
  swipe: { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, pointerId: null, isAnimating: false },
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
  getCurrentCategoryQuestions(categoryId) {
    const questions = state.questionsData[categoryId] || [];
    return Array.isArray(questions) ? questions.filter(Boolean).slice(0, ROUND_SIZE) : [];
  },
  getRoundSize(total = ROUND_SIZE) { return Math.min(ROUND_SIZE, Math.max(0, total)); },
  isAdultConfirmed() { return storage.getRaw(STORAGE_KEYS.adult) === 'yes'; },
  categoryIconSvg(icon = '✦') { return `<span aria-hidden="true">${icon}</span>`; },
  progressKey(categoryId) { return `${STORAGE_KEYS.progressPrefix}${categoryId}`; },
  plural(number, one, few, many) {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
  },
};

const notify = {
  show(message) {
    if (!ui.toastStack) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    ui.toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  },
  info(message) { this.show(message); },
};

const loading = {
  show(text = 'Загружаем...') { if (ui.loadingText) ui.loadingText.textContent = text; ui.loadingScreen?.classList.remove('hidden'); },
  hide() { ui.loadingScreen?.classList.add('hidden'); },
  setText(text) { if (ui.loadingText) ui.loadingText.textContent = text; },
};

const background = {
  reset() {
    document.body.style.removeProperty('--screen-glow');
    document.body.style.removeProperty('--screen-bg-start');
    document.body.style.removeProperty('--screen-bg-mid');
    document.body.style.removeProperty('--screen-bg-end');
    bgLayers.forEach((layer, index) => {
      if (!layer) return;
      layer.style.backgroundImage = '';
      layer.classList.toggle('active', index === state.activeBgLayerIndex);
    });
  },
  apply(categoryId = '') {
    const category = CATEGORY_META.find((item) => item.id === categoryId);
    document.body.style.setProperty('--screen-glow', category?.glow || 'rgba(168,85,247,.24)');
    document.body.style.setProperty('--screen-bg-start', category?.bgStart || '#070611');
    document.body.style.setProperty('--screen-bg-mid', category?.bgMid || '#090713');
    document.body.style.setProperty('--screen-bg-end', category?.bgEnd || '#05050a');
    const currentLayer = bgLayers[state.activeBgLayerIndex];
    const nextLayer = bgLayers[(state.activeBgLayerIndex + 1) % bgLayers.length];
    if (!category?.cover || !currentLayer || !nextLayer) return this.reset();
    nextLayer.style.backgroundImage = `linear-gradient(180deg,rgba(5,5,12,.60),rgba(5,5,12,.88)), url("${category.cover}")`;
    nextLayer.style.backgroundSize = 'cover';
    nextLayer.style.backgroundPosition = 'center';
    nextLayer.classList.add('active');
    currentLayer.classList.remove('active');
    state.activeBgLayerIndex = (state.activeBgLayerIndex + 1) % bgLayers.length;
  },
};

const fx = {
  vibrate(type = 'light') {
    try {
      if (tg?.HapticFeedback) {
        if (['success', 'warning', 'error'].includes(type)) tg.HapticFeedback.notificationOccurred(type);
        else tg.HapticFeedback.impactOccurred(type);
      } else if (navigator.vibrate) navigator.vibrate(type === 'light' ? 10 : 18);
    } catch {}
  },
};

const modals = {
  open(element) { if (!element) return; state.activeModal = element; element.classList.remove('hidden'); element.setAttribute('aria-hidden', 'false'); },
  close(element) { if (!element) return; if (state.activeModal === element) state.activeModal = null; element.classList.add('hidden'); element.setAttribute('aria-hidden', 'true'); },
};

const router = {
  syncBackButton(screenName) {
    const showBack = !ROOT_SCREENS.includes(screenName) || !!state.activeModal;
    ui.backBtn?.classList.toggle('hidden', !showBack);
    try { if (tg?.BackButton) showBack ? tg.BackButton.show() : tg.BackButton.hide(); } catch {}
  },
  show(name, options = {}) {
    document.body.dataset.screen = name;
    Object.entries(screens).forEach(([screenName, screenEl]) => screenEl?.classList.toggle('screen-active', screenName === name));
    if (options.reset) state.navStack = [name];
    else if (options.replace) state.navStack[state.navStack.length - 1] = name;
    else if (state.navStack[state.navStack.length - 1] !== name) state.navStack.push(name);
    if (ROOT_SCREENS.includes(name)) background.apply('');
    else if (state.currentCategory) background.apply(state.currentCategory.id);
    this.syncBackButton(name);
  },
  current() { return state.navStack[state.navStack.length - 1] || 'categories'; },
  back() {
    if (state.activeModal) { modals.close(state.activeModal); this.syncBackButton(this.current()); return; }
    if (this.current() === 'game' || this.current() === 'completion') { this.show('categories', { reset: true }); return; }
    this.show('categories', { reset: true });
  },
};

const data = {
  async loadQuestions() {
    let loaded = false;
    state.loadError = null;
    loading.setText('Загружаем вопросы...');
    try {
      const response = await fetch(`questions.json?v=${VERSION}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (json && typeof json === 'object' && Object.keys(json).length) {
        state.questionsData = json;
        storage.set(STORAGE_KEYS.questionsCache, json);
        loaded = true;
      }
    } catch (error) {
      console.error('Ошибка загрузки questions.json', error);
      state.loadError = 'Не удалось загрузить questions.json.';
    }
    if (!loaded) state.questionsData = storage.get(STORAGE_KEYS.questionsCache, {});
    return !!(state.questionsData && Object.keys(state.questionsData).length);
  },
};

async function initTelegram() {
  if (!tg) return;
  try { tg.ready(); tg.expand(); } catch {}
  try { if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes(); } catch {}
  try { tg.BackButton?.onClick(() => router.back()); } catch {}
}

Object.assign(app, { tg, VERSION, STORAGE_KEYS, ROUND_SIZE, CATEGORY_META, ROOT_SCREENS, screens, ui, bgLayers, storage, state, helpers, notify, loading, background, fx, modals, router, data, initTelegram });

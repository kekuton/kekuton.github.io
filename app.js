const screens = {
  home: document.getElementById('homeScreen'),
  categories: document.getElementById('categoriesScreen'),
  intro: document.getElementById('categoryIntroScreen'),
  game: document.getElementById('gameScreen'),
  blitz: document.getElementById('blitzScreen'), // Новый экран
  results: document.getElementById('resultsScreen'),
  history: document.getElementById('historyScreen'),
  customGame: document.getElementById('customGameScreen')
};

const ui = {
  backBtn: document.getElementById('backBtn'),
  themeBtn: document.getElementById('themeBtn'),
  startBtn: document.getElementById('startBtn'),
  historyBtn: document.getElementById('historyBtn'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  introCard: document.getElementById('categoryIntroCard'),
  
  // Game UI
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
  
  // Blitz UI
  blitzTimerDisplay: document.getElementById('blitzTimerDisplay'),
  blitzCorrectScore: document.getElementById('blitzCorrectScore'),
  blitzTotalScore: document.getElementById('blitzTotalScore'),
  blitzQuestionText: document.getElementById('blitzQuestionText'),
  blitzCorrectBtn: document.getElementById('blitzCorrectBtn'),
  blitzIncorrectBtn: document.getElementById('blitzIncorrectBtn'),

  // Results UI
  resultsCategory: document.getElementById('resultsCategory'),
  resultsScore: document.getElementById('resultsScore'),
  resultsMessage: document.getElementById('resultsMessage'),
  statMatch: document.getElementById('statMatch'),
  statMismatch: document.getElementById('statMismatch'),
  statSkip: document.getElementById('statSkip'),
  statLabelMatch: document.getElementById('statLabelMatch'), // Для смены текста в Блице
  statLabelMismatch: document.getElementById('statLabelMismatch'), // Для смены текста в Блице
  restartBtn: document.getElementById('restartBtn'),
  changeCategoryBtn: document.getElementById('changeCategoryBtn'),
  shareBtn: document.getElementById('shareBtn'),
  historyList: document.getElementById('historyList'),
  
  // Modals
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
  passModalBtn: document.getElementById('passModalBtn')
};

const categoryMeta = [
  { id: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', badge: '18+' },
  { id: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)' },
  { id: 'Будущее', icon: '🔮', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)' },
  { id: 'Финансы', icon: '💰', desc: 'Деньги, цели и бюджет', color: 'linear-gradient(180deg,#f59e0b,#f97316)' },
  { id: 'Психология', icon: '🧠', desc: 'Эмоции и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)' },
  { id: 'Воспоминания', icon: '📸', desc: 'Лучшие моменты вместе', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)' },
  { id: 'Блиц', icon: '⚡', desc: 'Проверка знаний (30 сек)', color: 'linear-gradient(180deg,#eab308,#ef4444)' }, // Добавили Блиц
  { id: 'Своя игра', icon: '✍️', desc: 'Создай свои вопросы', color: 'linear-gradient(180deg,#10b981,#3b82f6)', isPremium: true }
];


const QUESTIONS_CACHE_KEY = 'couples_questions_v4';

const categoryBackgrounds = {
  'Будущее': { file: 'images/bg_future.webp', bodyClass: 'category-future' },
  'На расстоянии': { file: 'images/bg_distance.webp', bodyClass: 'category-distance' },
  'Финансы': { file: 'images/bg_finance.webp', bodyClass: 'category-finance' }
};

const bgLayers = [document.querySelector('.bg-layer-a'), document.querySelector('.bg-layer-b')];
let activeBgLayerIndex = 0;

function clearCategoryBodyClasses() {
  document.body.classList.remove('has-category-bg', 'category-future', 'category-distance', 'category-finance');
}

function resetBaseBackground() {
  clearCategoryBodyClasses();
  bgLayers.forEach((layer, index) => {
    if (!layer) return;
    layer.style.background = 'var(--bg)';
    layer.style.backgroundImage = '';
    layer.classList.remove('prep', 'reveal');
    layer.classList.toggle('active', index === activeBgLayerIndex);
  });
}

function applyCategoryBackground(categoryId = '') {
  const config = categoryBackgrounds[categoryId];
  const currentLayer = bgLayers[activeBgLayerIndex];
  const nextLayer = bgLayers[(activeBgLayerIndex + 1) % bgLayers.length];
  if (!config) { resetBaseBackground(); return; }
  clearCategoryBodyClasses();
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
    activeBgLayerIndex = (activeBgLayerIndex + 1) % bgLayers.length;
  });
}

let questionsData = {};
let currentCategory = null;
let currentQuestions = [];
let currentIndex = 0;
let stats = { match: 0, mismatch: 0, skip: 0 };
let gameMode = 'solo';
let duoRoundAnswers = [null, null];
let duoActivePlayer = 0;
const duoPlayers = ['Игрок 1', 'Игрок 2'];
let pendingAdultCategory = null;
let navStack = ['home'];

// Blitz state
let blitzTimer = null;
let blitzTimeLeft = 30;

const swipeState = {
  active: false,
  startX: 0, startY: 0, currentX: 0, currentY: 0,
  dragging: false, pointerId: null, isAnimating: false
};

const tg = window.Telegram?.WebApp;

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
  }
};

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
  const rootScreens = ['home', 'categories'];
  if (rootScreens.includes(name)) {
    applyCategoryBackground('');
  } else if (currentCategory) {
    applyCategoryBackground(currentCategory.id);
  }
  ui.backBtn.classList.toggle('hidden', rootScreens.includes(name));
  if (navStack[navStack.length - 1] !== name) navStack.push(name);
}

function goBack() {
  if (navStack.length <= 1) return;
  
  // Очищаем таймер блица при выходе назад
  if (blitzTimer) {
      clearInterval(blitzTimer);
      blitzTimer = null;
  }

  navStack.pop();
  const prev = navStack[navStack.length - 1];
  Object.values(screens).forEach(screen => screen.classList.remove('screen-active'));
  screens[prev].classList.add('screen-active');
  if (['home', 'categories'].includes(prev)) {
    applyCategoryBackground('');
  } else if (currentCategory) {
    applyCategoryBackground(currentCategory.id);
  }
  ui.backBtn.classList.toggle('hidden', ['home', 'categories'].includes(prev));
}

function applyTheme(next) {
  document.body.classList.toggle('light', next === 'light');
  localStorage.setItem('couples_theme', next);
  if (tg) tg.setHeaderColor(next === 'light' ? '#efe7ff' : '#9f7aea');
}

function initTheme() {
  const saved = localStorage.getItem('couples_theme');
  if (tg && tg.colorScheme) {
    applyTheme(saved || tg.colorScheme);
  } else {
    applyTheme(saved === 'light' ? 'light' : 'dark');
  }
}

function loadHistory() {
  return storage.get('couples_history', []);
}

function saveHistory(entry) {
  const history = loadHistory();
  history.unshift(entry);
  storage.set('couples_history', history.slice(0, 12));
}


function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    ui.historyList.innerHTML = '<div class="history-empty">Здесь будут появляться результаты после прохождения категорий.</div>';
    return;
  }
  ui.historyList.innerHTML = history.map(item => `
    <article class="history-item">
      <strong>${item.category}</strong>
      <div>${item.score}% ${item.category === 'Блиц' ? 'правильных ответов' : 'совместимости'}</div>
      <div class="history-meta">
        <span class="history-pill">${item.mode || 'Обычная игра'}</span>
        <span class="history-detail">Совпало: ${item.match ?? 0} · Не совпало: ${item.mismatch ?? 0} · Пропуск: ${item.skip ?? 0}</span>
      </div>
      <small>${item.date}</small>
    </article>
  `).join('');
}

function resultMessage(score, isBlitz = false) {
  if (isBlitz) {
      if (score >= 100) return 'Идеальное знание партнера! Ты помнишь каждую мелочь.';
      if (score >= 80) return 'Отличный результат! Вы очень хорошо знаете друг друга.';
      if (score >= 50) return 'Хороший результат, но есть что вспомнить и обсудить.';
      return 'Кажется, стоит почаще задавать друг другу вопросы и слушать внимательнее!';
  } else {
      if (score >= 100) return 'Идеальное совпадение! Вы мыслите как одна команда.';
      if (score >= 85) return 'Очень сильное совпадение — вы отлично чувствуете друг друга.';
      if (score >= 60) return 'Хороший результат. Есть много общего, но и повод для разговора.';
      return 'У вас разные взгляды — отличный повод поговорить откровенно и без давления.';
  }
}

function renderLoadWarning(message) {
  if (!ui.categoriesGrid) return;
  ui.categoriesGrid.innerHTML = `<div class="history-empty">${message}</div>`;
}

function renderCategories() {
  const isPremiumUnlocked = localStorage.getItem('premium_unlocked') === 'true';

  if (!ui.categoriesGrid) return;
  ui.categoriesGrid.innerHTML = categoryMeta.map(cat => {
    let count = (questionsData[cat.id] || []).length;
    let lockedClass = (cat.isPremium && !isPremiumUnlocked) ? 'premium-locked' : '';

    if (cat.id === 'Своя игра' && isPremiumUnlocked) {
      count = storage.get('custom_questions', []).length;
    }

    // Для блица в UI пишем время вместо кол-ва вопросов
    const countLabel = cat.id === 'Блиц' ? '30 секунд' : (count > 0 ? count + ' вопросов' : 'Создать');

    return `
      <button class="category-card ${lockedClass}" data-id="${cat.id}" style="background:${cat.color}">
        <div class="category-card-top">
          <div class="category-icon">${cat.icon}</div>
          ${cat.badge ? `<span class="category-badge">${cat.badge}</span>` : ''}
        </div>
        <div>
          <h3>${cat.id}</h3>
          <p>${cat.desc}</p>
        </div>
        <div class="category-count">${countLabel}</div>
      </button>
    `;
  }).join('');
}

ui.categoriesGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.category-card');
  if (card) openCategory(card.dataset.id);
});

function openCategory(categoryId) {
  const isPremiumUnlocked = localStorage.getItem('premium_unlocked') === 'true';
  currentCategory = categoryMeta.find(c => c.id === categoryId);

  if (categoryId === 'Интимные вопросы' && localStorage.getItem('adult_ok') !== 'yes') {
    pendingAdultCategory = categoryId;
    ui.adultModal.classList.remove('hidden');
    return;
  }

  if (currentCategory.isPremium && !isPremiumUnlocked) {
    ui.premiumModal.classList.remove('hidden');
    return;
  }

  if (categoryId === 'Своя игра') {
    renderCustomGameEditor();
    showScreen('customGame');
    return;
  }

  const total = (questionsData[categoryId] || []).length;
  applyCategoryBackground(categoryId);
  const introText = categoryId === 'Блиц' 
        ? `Вам дается ровно 30 секунд. Ответьте правильно на как можно больше вопросов о вашем партнере.`
        : `${total} вопросов в колоде. Нажмите ниже, чтобы начать новую игру.`;

  ui.introCard.innerHTML = `
    <div class="intro-illu">${currentCategory.icon}</div>
    <span class="eyebrow">${currentCategory.badge || 'Категория'}</span>
    <h2>${currentCategory.id}</h2>
    <p class="intro-subtext">${currentCategory.desc}</p>
    <p class="intro-subtext">${introText}</p>
    <div class="hero-actions stacked">
      <button class="primary-btn" id="playCategoryBtn">${categoryId === 'Блиц' ? 'Начать блиц' : 'Новая игра'}</button>
      ${categoryId !== 'Блиц' ? '<button class="secondary-btn" id="duoCategoryBtn">Играть вдвоём</button>' : ''}
      <button class="secondary-btn" id="backToCategoriesBtn">Назад</button>
    </div>
  `;
  showScreen('intro');
  document.getElementById('playCategoryBtn').addEventListener('click', () => startGame('solo'));
  document.getElementById('duoCategoryBtn')?.addEventListener('click', () => startGame('duo'));
  document.getElementById('backToCategoriesBtn').addEventListener('click', goBack);
}


function updateModeUI() {
  const duo = gameMode === 'duo';
  if (ui.turnBadge) {
    ui.turnBadge.classList.toggle('hidden', !duo);
    ui.turnBadge.textContent = duo ? duoPlayers[duoActivePlayer] : '';
  }
  if (ui.gameCategory && currentCategory) {
    ui.gameCategory.textContent = duo ? `${currentCategory.id} · Игра вдвоём` : currentCategory.id;
  }
}

function showPassModal(playerIndex, onReady) {
  if (!ui.passModal) {
    if (typeof onReady === 'function') onReady();
    return;
  }
  const playerName = duoPlayers[playerIndex] || `Игрок ${playerIndex + 1}`;
  ui.passModalTitle.textContent = 'Передайте телефон';
  ui.passModalText.textContent = `Сейчас отвечает ${playerName}`;
  ui.passModalBtn.textContent = 'Готово';
  ui.passModal.classList.remove('hidden');

  const handleReady = () => {
    ui.passModal.classList.add('hidden');
    ui.passModalBtn.removeEventListener('click', handleReady);
    if (typeof onReady === 'function') onReady();
  };

  ui.passModalBtn.addEventListener('click', handleReady);
}

function buildShareText() {
  const modeText = gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра';
  return `Вопросы для двоих
Категория: ${currentCategory?.id || '—'}
Результат: ${ui.resultsScore?.textContent || '0%'}
Совпало: ${stats.match} · Не совпало: ${stats.mismatch} · Пропуск: ${stats.skip}
Режим: ${modeText}`;
}

async function createShareCardBlob() {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#7c3aed');
  grad.addColorStop(1, '#ec4899');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, 70, 120, width - 140, height - 240, 42, true, false);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 42px Arial';
  ctx.fillText('Вопросы для двоих', 110, 200);

  ctx.font = '700 84px Arial';
  ctx.fillText(ui.resultsScore?.textContent || '0%', 110, 360);

  ctx.font = '600 44px Arial';
  wrapText(ctx, currentCategory?.id || 'Категория', 110, 450, width - 220, 56);

  ctx.font = '500 34px Arial';
  wrapText(ctx, resultMessage(parseInt((ui.resultsScore?.textContent || '0').replace('%','')) || 0, currentCategory?.id === 'Блиц'), 110, 560, width - 220, 48);

  ctx.font = '600 32px Arial';
  ctx.fillText(`Совпало: ${stats.match}`, 110, 760);
  ctx.fillText(`Не совпало: ${stats.mismatch}`, 110, 820);
  ctx.fillText(`Пропуск: ${stats.skip}`, 110, 880);
  ctx.fillText(`Режим: ${gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра'}`, 110, 940);

  ctx.font = '500 28px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText('Сделано в Telegram Mini App', 110, 1160);

  return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  for (let n = 0; n < words.length; n += 1) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

// ПРЕМИУМ И СВОЯ ИГРА
ui.buyPremiumBtn.addEventListener('click', () => {
  const originalText = ui.buyPremiumBtn.textContent;
  ui.buyPremiumBtn.textContent = 'Оплата...';
  ui.buyPremiumBtn.disabled = true;

  setTimeout(() => {
    localStorage.setItem('premium_unlocked', 'true');
    ui.premiumModal.classList.add('hidden');
    ui.buyPremiumBtn.textContent = originalText;
    ui.buyPremiumBtn.disabled = false;
    
    if (tg) tg.HapticFeedback.notificationOccurred('success');
    launchConfetti();
    renderCategories();
  }, 1200);
});

ui.closePremiumBtn.addEventListener('click', () => {
  ui.premiumModal.classList.add('hidden');
});

function renderCustomGameEditor() {
  const customQ = storage.get('custom_questions', ['', '']);
  ui.customQuestionsList.innerHTML = '';
  customQ.forEach(q => addCustomQuestionInput(q));
}

function addCustomQuestionInput(value = '') {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'custom-question-input';
  input.placeholder = 'Например: Какой мой любимый цвет?';
  input.value = value;
  ui.customQuestionsList.appendChild(input);
}

ui.addCustomQuestionBtn.addEventListener('click', () => {
  addCustomQuestionInput();
  if (tg) tg.HapticFeedback.impactOccurred('light');
});

ui.saveCustomGameBtn.addEventListener('click', () => {
  const inputs = Array.from(document.querySelectorAll('.custom-question-input'));
  const questions = inputs.map(i => i.value.trim()).filter(v => v !== '');
  
  if (questions.length < 3) {
    alert('Напишите хотя бы 3 вопроса, чтобы начать игру!');
    return;
  }

  storage.set('custom_questions', questions);
  questionsData['Своя игра'] = questions;
  renderCategories();
  startGame(); 
});

// УТИЛИТЫ И АНИМАЦИИ
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function vibrate(type = 'medium') {
  if (tg && tg.HapticFeedback) {
    if (type === 'success' || type === 'warning' || type === 'error') {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  } else if (navigator.vibrate) {
    navigator.vibrate(type === 'warning' ? [8, 30, 8] : 12);
  }
}


function launchReactionBurst(type, sourceEl = null) {
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
    const p = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 18;
    const distance = 30 + Math.random() * 90;
    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    p.style.background = palette[Math.floor(Math.random() * palette.length)];
    p.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    p.style.animationDelay = `${Math.random() * 0.05}s`;
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 900);
}

function pulseAnswerButton(type) {
  const buttonMap = { match: ui.matchBtn, mismatch: ui.mismatchBtn, skip: ui.skipBtn };
  const classMap = { match: 'pulse-match', mismatch: 'pulse-mismatch', skip: 'pulse-skip' };
  const btn = buttonMap[type];
  const cls = classMap[type];
  if (!btn || !cls) return;
  btn.classList.remove(cls);
  void btn.offsetWidth;
  btn.classList.add(cls);
  setTimeout(() => btn.classList.remove(cls), 500);
}

function launchConfetti() {
  const count = 120;
  const colors = ['#f59e0b', '#f472b6', '#22c55e', '#60a5fa', '#ffffff', '#fde047'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti-wrap';
  document.body.appendChild(wrap);

  for (let i = 0; i < count; i += 1) {
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
  setTimeout(() => wrap.remove(), 4600);
}

// ----------------------------------------------------
// ЛОГИКА ИГРЫ (ОБЫЧНАЯ)
// ----------------------------------------------------

function startGame(mode = 'solo') {
  gameMode = mode;
  if (currentCategory.id === 'Блиц') {
      startBlitzGame();
      return;
  }

  const sourceQuestions = questionsData[currentCategory.id] || [];
  const maxQ = sourceQuestions.length;
  if (!maxQ) {
    alert('В этой категории пока нет вопросов.');
    showScreen('categories');
    return;
  }
  const limit = maxQ < 8 ? maxQ : 8;
  currentQuestions = shuffle(sourceQuestions).slice(0, limit);
  currentIndex = 0;
  stats = { match: 0, mismatch: 0, skip: 0 };
  duoRoundAnswers = [null, null];
  duoActivePlayer = 0;
  resetQuestionCard();
  updateModeUI();
  showScreen('game');
  const renderFirst = () => {
    duoActivePlayer = 0;
    updateModeUI();
    renderQuestion(true);
  };
  if (gameMode === 'duo') {
    showPassModal(0, renderFirst);
  } else {
    renderFirst();
  }
}

function renderQuestion(isInitial = false) {
  const total = currentQuestions.length;
  const q = currentQuestions[currentIndex];
  ui.gameCategory.textContent = gameMode === 'duo' ? `${currentCategory.id} · Игра вдвоём` : currentCategory.id;
  ui.gameTitle.textContent = gameMode === 'duo' ? `Ход: ${duoPlayers[duoActivePlayer]}` : 'Вопрос';
  updateModeUI();
  ui.questionText.textContent = q;
  ui.progressLabel.textContent = `${currentIndex + 1} / ${total}`;
  ui.progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;

  ui.questionCard.classList.remove('card-fly-left', 'card-fly-right', 'card-fly-up', 'card-return');
  if (!isInitial) ui.questionCard.classList.add('card-enter');
  ui.questionCard.style.transition = 'none';
  ui.questionCard.style.transform = isInitial ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.98)';
  ui.questionCard.style.opacity = isInitial ? '1' : '0';
  updateSwipeHint(0, 0);

  requestAnimationFrame(() => {
    ui.questionCard.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
    ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    ui.questionCard.style.opacity = '1';
  });
}

function updateSwipeHint(offsetX, offsetY = 0) {
  const intensity = Math.min(Math.max(Math.abs(offsetX), Math.abs(offsetY)) / 120, 1);
  let direction = 'none';
  if (offsetY < -70 && Math.abs(offsetX) < 100) direction = 'up';
  else if (offsetX > 0) direction = 'right';
  else if (offsetX < 0) direction = 'left';
  ui.questionCard.dataset.swipe = direction;
  ui.questionCard.style.setProperty('--swipe-opacity', intensity.toFixed(2));
  if (ui.swipeHelp) {
    const map = {
      none: 'Свайп: влево — не совпало, вправо — совпало, вверх — пропуск',
      left: 'Отпускай — отметим «Не совпало»',
      right: 'Отпускай — отметим «Совпало»',
      up: 'Отпускай — это «Пропуск»'
    };
    ui.swipeHelp.textContent = map[direction];
  }
}

function resetQuestionCard() {
  swipeState.active = false;
  swipeState.dragging = false;
  swipeState.pointerId = null;
  swipeState.isAnimating = false;
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.style.removeProperty('--swipe-opacity');
  ui.questionCard.style.transition = '';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
  ui.questionCard.style.opacity = '1';
  if (ui.swipeHelp) ui.swipeHelp.textContent = 'Свайп: влево — не совпало, вправо — совпало, вверх — пропуск';
}

function animateSwipeOut(type, callback) {
  const card = ui.questionCard;
  const map = {
    match: { className: 'card-fly-right', x: 420, y: -20, rotate: 16 },
    mismatch: { className: 'card-fly-left', x: -420, y: -20, rotate: -16 },
    skip: { className: 'card-fly-up', x: 0, y: -360, rotate: 0 }
  };
  const cfg = map[type];
  if (!cfg) return;

  card.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
  card.style.opacity = '0';
  card.style.transform = `translate3d(${cfg.x}px, ${cfg.y}px, 0) rotate(${cfg.rotate}deg) scale(0.96)`;
  setTimeout(() => {
    card.classList.remove('card-fly-right', 'card-fly-left', 'card-fly-up');
    callback();
  }, 280);
}


function answer(type) {
  if (!['match', 'mismatch', 'skip'].includes(type)) return;
  pulseAnswerButton(type);
  launchReactionBurst(type, type === 'match' ? ui.matchBtn : type === 'mismatch' ? ui.mismatchBtn : ui.skipBtn);
  if (type === 'match') {
    vibrate('success');
  } else if (type === 'mismatch') {
    vibrate('error');
  } else {
    vibrate('warning');
  }
  if (type === 'match' && gameMode !== 'duo') {
    setTimeout(() => launchConfetti(), 40);
  }

  if (gameMode === 'duo') {
    animateSwipeOut(type, () => {
      duoRoundAnswers[duoActivePlayer] = type;
      resetQuestionCard();
      if (duoActivePlayer === 0) {
        duoActivePlayer = 1;
        updateModeUI();
        showPassModal(1, () => renderQuestion(true));
        return;
      }

      const [first, second] = duoRoundAnswers;
      if (first === 'skip' || second === 'skip') {
        stats.skip += 1;
      } else if (first === second) {
        stats.match += 1;
        setTimeout(() => launchConfetti(), 50);
      } else {
        stats.mismatch += 1;
      }
      currentIndex += 1;
      duoRoundAnswers = [null, null];
      duoActivePlayer = 0;
      resetQuestionCard();
      if (currentIndex >= currentQuestions.length) {
        finishGame();
      } else {
        showPassModal(0, () => renderQuestion());
      }
    });
    return;
  }

  animateSwipeOut(type, () => {
    stats[type] += 1;
    currentIndex += 1;
    resetQuestionCard();
    if (currentIndex >= currentQuestions.length) {
      finishGame();
    } else {
      renderQuestion();
    }
  });
}

// ----------------------------------------------------
// ЛОГИКА РЕЖИМА БЛИЦ
// ----------------------------------------------------
function startBlitzGame() {
    gameMode = 'solo';
    updateModeUI();
    if (blitzTimer) clearInterval(blitzTimer);
    
    // Перемешиваем все вопросы блица
    currentQuestions = shuffle(questionsData['Блиц']);
    currentIndex = 0;
    stats = { match: 0, mismatch: 0, skip: 0 }; // match = correct, mismatch = incorrect
    blitzTimeLeft = 30;
    
    updateBlitzUI();
    renderBlitzQuestion();
    
    showScreen('blitz');
    
    blitzTimer = setInterval(() => {
        blitzTimeLeft--;
        ui.blitzTimerDisplay.textContent = blitzTimeLeft;
        
        if (blitzTimeLeft <= 3 && blitzTimeLeft > 0) {
            vibrate('light'); // Предупреждающая вибрация перед концом
        }
        
        if (blitzTimeLeft <= 0) {
            finishGame(true);
        }
    }, 1000);
}

function updateBlitzUI() {
    ui.blitzTimerDisplay.textContent = blitzTimeLeft;
    ui.blitzCorrectScore.textContent = stats.match;
    ui.blitzTotalScore.textContent = stats.match + stats.mismatch;
}

function renderBlitzQuestion() {
    if (currentIndex >= currentQuestions.length) {
        finishGame(true);
        return;
    }
    
    const card = document.querySelector('.blitz-card');
    card.style.transition = 'none';
    card.style.transform = 'scale(0.98)';
    card.style.opacity = '0.5';
    
    ui.blitzQuestionText.textContent = currentQuestions[currentIndex];
    
    requestAnimationFrame(() => {
      card.style.transition = 'transform 150ms ease, opacity 150ms ease';
      card.style.transform = 'scale(1)';
      card.style.opacity = '1';
    });
}

function answerBlitz(isCorrect) {
    vibrate('light');
    if (isCorrect) {
        stats.match++;
    } else {
        stats.mismatch++;
    }
    currentIndex++;
    updateBlitzUI();
    renderBlitzQuestion();
}

ui.blitzCorrectBtn.addEventListener('click', () => answerBlitz(true));
ui.blitzIncorrectBtn.addEventListener('click', () => answerBlitz(false));


// ----------------------------------------------------
// ФИНИШ И РЕЗУЛЬТАТЫ (ОБЩЕЕ)
// ----------------------------------------------------
function finishGame(isBlitz = false) {
  if (blitzTimer) {
      clearInterval(blitzTimer);
      blitzTimer = null;
  }

  const answered = stats.match + stats.mismatch;
  const score = answered ? Math.round((stats.match / answered) * 100) : 0;

  ui.resultsCategory.textContent = currentCategory.id;
  ui.resultsScore.textContent = `${score}%`;
  document.getElementById('resultModeNote')?.remove();
  ui.resultsMessage.textContent = resultMessage(score, isBlitz);
  ui.resultsMessage.insertAdjacentHTML('afterend', `<div class="result-mini-note" id="resultModeNote">${isBlitz ? 'Режим: Блиц' : (gameMode === 'duo' ? 'Режим: Играть вдвоём' : 'Режим: Обычная игра')}</div>`);
  ui.statMatch.textContent = stats.match;
  ui.statMismatch.textContent = stats.mismatch;
  ui.statSkip.textContent = stats.skip;

  // Меняем лэйблы в зависимости от режима
  if (isBlitz) {
      ui.statLabelMatch.textContent = 'Правильно';
      ui.statLabelMismatch.textContent = 'Ошибка';
  } else if (gameMode === 'duo') {
      ui.statLabelMatch.textContent = 'Одинаковые ответы';
      ui.statLabelMismatch.textContent = 'Разные ответы';
  } else {
      ui.statLabelMatch.textContent = 'Совпало';
      ui.statLabelMismatch.textContent = 'Не совпало';
  }

  if (score >= 80 && stats.match > 0) {
    vibrate('success');
    launchConfetti();
  }

  saveHistory({
    category: currentCategory.id,
    score,
    match: stats.match,
    mismatch: stats.mismatch,
    skip: stats.skip,
    mode: isBlitz ? 'Блиц' : (gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра'),
    date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  });
  
  renderHistory();
  showScreen('results');
}


async function shareResult() {
  const text = buildShareText();
  const blob = await createShareCardBlob();
  const file = blob ? new File([blob], 'result-card.png', { type: 'image/png' }) : null;
  if (navigator.share && file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: 'Вопросы для двоих', text, files: [file] });
      return;
    } catch {}
  }
  if (file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result-card.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  try {
    await navigator.clipboard.writeText(text);
    vibrate('success');
    alert('Картинка сохранена, текст результата скопирован.');
  } catch {
    alert(text);
  }
}

// ----------------------------------------------------
// СВАЙПЫ (Только для обычного режима)
// ----------------------------------------------------
function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

function onPointerDown(e) {
  if (!screens.game.classList.contains('screen-active')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  swipeState.active = true;
  swipeState.dragging = true;
  swipeState.pointerId = e.pointerId;
  swipeState.startX = e.clientX;
  swipeState.startY = e.clientY;
  swipeState.currentX = e.clientX;
  swipeState.currentY = e.clientY;
  ui.questionCard.setPointerCapture?.(e.pointerId);
  ui.questionCard.style.transition = 'none';
}

function onPointerMove(e) {
  if (!swipeState.active || swipeState.pointerId !== e.pointerId) return;
  if (e.cancelable) e.preventDefault();
  swipeState.currentX = e.clientX;
  swipeState.currentY = e.clientY;

  if (!swipeState.isAnimating) {
    requestAnimationFrame(() => {
      const deltaX = swipeState.currentX - swipeState.startX;
      const deltaY = swipeState.currentY - swipeState.startY;

      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && Math.abs(deltaY) < 50) {
        swipeState.isAnimating = false;
        return;
      }

      const rotate = deltaX / 18;
      const stretch = 1 - Math.min(Math.abs(deltaX) / 1200, 0.03);
      ui.questionCard.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.18}px, 0) rotate(${rotate}deg) scale(${stretch})`;
      updateSwipeHint(deltaX, deltaY);
      
      swipeState.isAnimating = false;
    });
    swipeState.isAnimating = true;
  }
}

function onPointerUp(e) {
  if (!swipeState.active || swipeState.pointerId !== e.pointerId) return;
  swipeState.active = false;
  swipeState.dragging = false;

  const deltaX = swipeState.currentX - swipeState.startX;
  const deltaY = swipeState.currentY - swipeState.startY;
  const velocity = Math.abs(deltaX) / Math.max(1, Math.abs(deltaY) + 1);
  const threshold = window.innerWidth < 480 ? 70 : 90;

  ui.questionCard.releasePointerCapture?.(e.pointerId);
  swipeState.pointerId = null;

  if (deltaX > threshold || (deltaX > 45 && velocity > 2.4)) {
    answer('match');
    return;
  }
  if (deltaX < -threshold || (deltaX < -45 && velocity > 2.4)) {
    answer('mismatch');
    return;
  }

  if (deltaY < -110 && Math.abs(deltaX) < 100) {
    answer('skip');
    return;
  }

  ui.questionCard.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1)';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
  updateSwipeHint(0, 0);
}

function attachSwipeHandlers() {
  ui.questionCard.addEventListener('pointerdown', onPointerDown);
  ui.questionCard.addEventListener('pointermove', onPointerMove);
  ui.questionCard.addEventListener('pointerup', onPointerUp);
  ui.questionCard.addEventListener('pointercancel', onPointerUp);
  ui.questionCard.addEventListener('touchmove', (e) => {
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
}

// ----------------------------------------------------
// ИНИЦИАЛИЗАЦИЯ
// ----------------------------------------------------
async function initTelegramAPI() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (typeof tg.disableVerticalSwipes === 'function') {
    try { tg.disableVerticalSwipes(); } catch {}
  }
}

async function init() {
  let loadedFromNetwork = false;
  try {
    const response = await fetch('questions.json', { cache: 'default' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const freshData = await response.json();
    if (freshData && typeof freshData === 'object' && Object.keys(freshData).length > 0) {
      questionsData = freshData;
      storage.set(QUESTIONS_CACHE_KEY, questionsData);
      loadedFromNetwork = true;
    }
  } catch (e) {
    console.error('Ошибка загрузки вопросов по сети', e);
  }

  if (!loadedFromNetwork) {
    try {
      questionsData = storage.get(QUESTIONS_CACHE_KEY, {});
    } catch (e) {
      console.error('Ошибка чтения кэша вопросов', e);
      questionsData = {};
    }
  }

  if (!questionsData || typeof questionsData !== 'object') {
    questionsData = {};
  }

  const savedCustom = storage.get('custom_questions', null);
  if (Array.isArray(savedCustom) && savedCustom.length) {
    questionsData['Своя игра'] = savedCustom;
  }

  initTheme();
  resetBaseBackground();
  renderCategories();
  renderHistory();
  if (Object.keys(questionsData).length === 0) {
    console.warn('Вопросы не загружены');
    renderLoadWarning('Не удалось загрузить вопросы. Проверь подключение и обнови страницу.');
  }
  preventDoubleTapZoom();
  initTelegramAPI();
  attachSwipeHandlers();

  // Основная навигация
  ui.startBtn.addEventListener('click', () => showScreen('categories'));
  ui.historyBtn.addEventListener('click', () => showScreen('history'));
  ui.backBtn.addEventListener('click', goBack);
  ui.themeBtn.addEventListener('click', () => {
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
    vibrate('light');
  });

  // Действия в игре
  ui.matchBtn.addEventListener('click', () => answer('match'));
  ui.mismatchBtn.addEventListener('click', () => answer('mismatch'));
  ui.skipBtn.addEventListener('click', () => answer('skip'));
  
  // Результаты
  ui.restartBtn.addEventListener('click', () => startGame(gameMode));
  ui.changeCategoryBtn.addEventListener('click', () => showScreen('categories'));
  ui.shareBtn.addEventListener('click', shareResult);
  
  // 18+ модалка
  ui.adultConfirmBtn.addEventListener('click', () => {
    localStorage.setItem('adult_ok', 'yes');
    ui.adultModal.classList.add('hidden');
    if (pendingAdultCategory) openCategory(pendingAdultCategory);
  });
  ui.adultCancelBtn.addEventListener('click', () => {
    pendingAdultCategory = null;
    ui.adultModal.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', init);

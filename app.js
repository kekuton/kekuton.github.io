const screens = {
  home: document.getElementById('homeScreen'),
  categories: document.getElementById('categoriesScreen'),
  intro: document.getElementById('categoryIntroScreen'),
  game: document.getElementById('gameScreen'),
  results: document.getElementById('resultsScreen'),
  history: document.getElementById('historyScreen')
};

const ui = {
  backBtn: document.getElementById('backBtn'),
  themeBtn: document.getElementById('themeBtn'),
  startBtn: document.getElementById('startBtn'),
  historyBtn: document.getElementById('historyBtn'),
  categoriesGrid: document.getElementById('categoriesGrid'),
  introCard: document.getElementById('categoryIntroCard'),
  gameCategory: document.getElementById('gameCategory'),
  gameTitle: document.getElementById('gameTitle'),
  progressLabel: document.getElementById('progressLabel'),
  progressFill: document.getElementById('progressFill'),
  questionText: document.getElementById('questionText'),
  questionCard: document.getElementById('questionCard'),
  matchBtn: document.getElementById('matchBtn'),
  mismatchBtn: document.getElementById('mismatchBtn'),
  skipBtn: document.getElementById('skipBtn'),
  resultsCategory: document.getElementById('resultsCategory'),
  resultsScore: document.getElementById('resultsScore'),
  resultsMessage: document.getElementById('resultsMessage'),
  statMatch: document.getElementById('statMatch'),
  statMismatch: document.getElementById('statMismatch'),
  statSkip: document.getElementById('statSkip'),
  restartBtn: document.getElementById('restartBtn'),
  changeCategoryBtn: document.getElementById('changeCategoryBtn'),
  shareBtn: document.getElementById('shareBtn'),
  historyList: document.getElementById('historyList'),
  adultModal: document.getElementById('adultModal'),
  adultConfirmBtn: document.getElementById('adultConfirmBtn'),
  adultCancelBtn: document.getElementById('adultCancelBtn')
};

const categoryMeta = [
  { id: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы для близости', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', badge: '18+' },
  { id: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)' },
  { id: 'Будущее', icon: '🔮', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)' },
  { id: 'Финансы', icon: '💰', desc: 'Деньги, цели и бюджет пары', color: 'linear-gradient(180deg,#f59e0b,#f97316)' },
  { id: 'Психология', icon: '🧠', desc: 'Эмоции, доверие и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)' },
  { id: 'Воспоминания', icon: '📸', desc: 'Лучшие моменты ваших отношений', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)' }
];

let questionsData = {};
let currentCategory = null;
let currentQuestions = [];
let currentIndex = 0;
let stats = { match: 0, mismatch: 0, skip: 0 };
let pendingAdultCategory = null;
let navStack = ['home'];

const swipeState = {
  active: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  dragging: false,
  pointerId: null,
  isAnimating: false
};

const tg = window.Telegram?.WebApp;

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
  const rootScreens = ['home', 'categories'];
  ui.backBtn.classList.toggle('hidden', rootScreens.includes(name));
  if (navStack[navStack.length - 1] !== name) navStack.push(name);
}

function goBack() {
  if (navStack.length <= 1) return;
  navStack.pop();
  const prev = navStack[navStack.length - 1];
  Object.values(screens).forEach(screen => screen.classList.remove('screen-active'));
  screens[prev].classList.add('screen-active');
  ui.backBtn.classList.toggle('hidden', ['home', 'categories'].includes(prev));
}

function applyTheme(next) {
  document.body.classList.toggle('light', next === 'light');
  localStorage.setItem('couples_theme', next);
  if (tg) {
    tg.setHeaderColor(next === 'light' ? '#efe7ff' : '#9f7aea');
  }
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
  try { return JSON.parse(localStorage.getItem('couples_history') || '[]'); } 
  catch { return []; }
}

function saveHistory(entry) {
  const history = loadHistory();
  history.unshift(entry);
  localStorage.setItem('couples_history', JSON.stringify(history.slice(0, 12)));
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
      <div>${item.score}% совместимости</div>
      <small>${item.date}</small>
    </article>
  `).join('');
}

function resultMessage(score) {
  if (score >= 100) return 'Идеальное совпадение. Похоже, на эту тему вы мыслите как одна команда.';
  if (score >= 85) return 'У вас очень сильное совпадение — похоже, вы отлично чувствуете друг друга.';
  if (score >= 60) return 'Хороший результат. У вас много общего, но есть темы, которые стоит обсудить глубже.';
  if (score >= 35) return 'Есть заметные различия. Это хороший повод поговорить откровенно.';
  return 'У вас разные взгляды на тему категории — начните с честного разговора без давления.';
}

function renderCategories() {
  ui.categoriesGrid.innerHTML = categoryMeta.map(cat => {
    const count = (questionsData[cat.id] || []).length;
    return `
      <button class="category-card" data-id="${cat.id}" style="background:${cat.color}">
        <div class="category-card-top">
          <div class="category-icon">${cat.icon}</div>
          ${cat.badge ? `<span class="category-badge">${cat.badge}</span>` : ''}
        </div>
        <div>
          <h3>${cat.id}</h3>
          <p>${cat.desc}</p>
        </div>
        <div class="category-count">${count} вопросов</div>
      </button>
    `;
  }).join('');
}

ui.categoriesGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.category-card');
  if (card) openCategory(card.dataset.id);
});

function openCategory(categoryId) {
  if (categoryId === 'Интимные вопросы' && localStorage.getItem('adult_ok') !== 'yes') {
    pendingAdultCategory = categoryId;
    ui.adultModal.classList.remove('hidden');
    return;
  }

  currentCategory = categoryMeta.find(c => c.id === categoryId);
  const total = (questionsData[categoryId] || []).length;
  ui.introCard.innerHTML = `
    <div class="intro-illu">${currentCategory.icon}</div>
    <span class="eyebrow">${currentCategory.badge || 'Категория'}</span>
    <h2>${currentCategory.id}</h2>
    <p class="intro-subtext">${currentCategory.desc}</p>
    <p class="intro-subtext">${total} вопросов в колоде. Нажмите ниже, чтобы начать новую игру.</p>
    <div class="hero-actions stacked">
      <button class="primary-btn" id="playCategoryBtn">Новая игра</button>
      <button class="secondary-btn" id="backToCategoriesBtn">Назад</button>
    </div>
  `;
  showScreen('intro');
  document.getElementById('playCategoryBtn').addEventListener('click', startGame);
  document.getElementById('backToCategoriesBtn').addEventListener('click', goBack);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function startGame() {
  currentQuestions = shuffle(questionsData[currentCategory.id]).slice(0, 8);
  currentIndex = 0;
  stats = { match: 0, mismatch: 0, skip: 0 };
  resetQuestionCard();
  renderQuestion(true);
  showScreen('game');
}

function renderQuestion(isInitial = false) {
  const total = currentQuestions.length;
  const q = currentQuestions[currentIndex];
  ui.gameCategory.textContent = currentCategory.id;
  ui.gameTitle.textContent = 'Вопрос';
  ui.questionText.textContent = q;
  ui.progressLabel.textContent = `${currentIndex + 1} / ${total}`;
  ui.progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;

  ui.questionCard.classList.remove('card-fly-left', 'card-fly-right', 'card-fly-up', 'card-return');
  if (!isInitial) ui.questionCard.classList.add('card-enter');
  ui.questionCard.style.transition = 'none';
  ui.questionCard.style.transform = isInitial ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.98)';
  ui.questionCard.style.opacity = isInitial ? '1' : '0';
  updateSwipeHint(0);

  requestAnimationFrame(() => {
    ui.questionCard.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
    ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    ui.questionCard.style.opacity = '1';
  });
}

function updateSwipeHint(offsetX) {
  const intensity = Math.min(Math.abs(offsetX) / 120, 1);
  const direction = offsetX > 0 ? 'right' : offsetX < 0 ? 'left' : 'none';
  ui.questionCard.dataset.swipe = direction;
  ui.questionCard.style.setProperty('--swipe-opacity', intensity.toFixed(2));
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

function completeAnswer(type) {
  stats[type] += 1;
  currentIndex += 1;
  resetQuestionCard();
  if (currentIndex >= currentQuestions.length) {
    finishGame();
  } else {
    renderQuestion();
  }
}

function answer(type) {
  if (!['match', 'mismatch', 'skip'].includes(type)) return;
  vibrate(type === 'skip' ? 'warning' : 'medium');
  animateSwipeOut(type, () => completeAnswer(type));
}

function finishGame() {
  const answered = stats.match + stats.mismatch;
  const score = answered ? Math.round((stats.match / answered) * 100) : 0;

  ui.resultsCategory.textContent = currentCategory.id;
  ui.resultsScore.textContent = `${score}%`;
  ui.resultsMessage.textContent = resultMessage(score);
  ui.statMatch.textContent = stats.match;
  ui.statMismatch.textContent = stats.mismatch;
  ui.statSkip.textContent = stats.skip;

  if (score === 100 && stats.match > 0) {
    vibrate('success');
    launchConfetti();
  }

  saveHistory({
    category: currentCategory.id,
    score,
    date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  });
  renderHistory();
  showScreen('results');
}

async function shareResult() {
  const text = `${currentCategory.id}: ${ui.resultsScore.textContent} совместимости. Совпало: ${stats.match}, не совпало: ${stats.mismatch}.`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Вопросы для двоих', text });
      return;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(text);
    vibrate('success');
    alert('Результат скопирован.');
  } catch {
    alert(text);
  }
}

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
      updateSwipeHint(deltaX);
      
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
  updateSwipeHint(0);
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

async function initTelegramAPI() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  if (typeof tg.disableVerticalSwipes === 'function') {
    try { tg.disableVerticalSwipes(); } catch {}
  }
}

async function init() {
  const cachedData = localStorage.getItem('couples_questions');
  if (cachedData) {
    questionsData = JSON.parse(cachedData);
  } else {
    try {
      questionsData = await fetch('questions.json').then(r => r.json());
      localStorage.setItem('couples_questions', JSON.stringify(questionsData));
    } catch (e) {
      console.error("Ошибка загрузки вопросов", e);
    }
  }

  initTheme();
  renderCategories();
  renderHistory();
  preventDoubleTapZoom();
  initTelegramAPI();
  attachSwipeHandlers();

  ui.startBtn.addEventListener('click', () => showScreen('categories'));
  ui.historyBtn.addEventListener('click', () => showScreen('history'));
  ui.backBtn.addEventListener('click', goBack);
  ui.themeBtn.addEventListener('click', () => {
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
    vibrate('light');
  });
  ui.matchBtn.addEventListener('click', () => answer('match'));
  ui.mismatchBtn.addEventListener('click', () => answer('mismatch'));
  ui.skipBtn.addEventListener('click', () => answer('skip'));
  ui.restartBtn.addEventListener('click', startGame);
  ui.changeCategoryBtn.addEventListener('click', () => showScreen('categories'));
  ui.shareBtn.addEventListener('click', shareResult);
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

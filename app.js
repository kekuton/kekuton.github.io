const $ = (id) => document.getElementById(id);

const screens = {
  onboarding: $('onboardingScreen'),
  categories: $('categoriesScreen'),
  intro: $('introScreen'),
  game: $('gameScreen'),
  results: $('resultsScreen')
};

const ui = {
  backBtn: $('backBtn'),
  themeBtn: $('themeBtn'),
  anonymousToggle: $('anonymousToggle'),
  namesBlock: $('namesBlock'),
  playerOneInput: $('playerOneInput'),
  playerTwoInput: $('playerTwoInput'),
  continueBtn: $('continueBtn'),
  playerLabel: $('playerLabel'),
  categoriesGrid: $('categoriesGrid'),
  introCard: $('introCard'),
  gameCategory: $('gameCategory'),
  progressLabel: $('progressLabel'),
  progressFill: $('progressFill'),
  questionCard: $('questionCard'),
  questionText: $('questionText'),
  matchBtn: $('matchBtn'),
  mismatchBtn: $('mismatchBtn'),
  skipBtn: $('skipBtn'),
  resultsCategory: $('resultsCategory'),
  resultsScore: $('resultsScore'),
  resultsMessage: $('resultsMessage'),
  statMatch: $('statMatch'),
  statMismatch: $('statMismatch'),
  statSkip: $('statSkip'),
  restartBtn: $('restartBtn'),
  changeCategoryBtn: $('changeCategoryBtn'),
  shareBtn: $('shareBtn'),
  adultModal: $('adultModal'),
  adultConfirmBtn: $('adultConfirmBtn'),
  adultCancelBtn: $('adultCancelBtn')
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
let state = {
  anonymous: false,
  playerOne: '',
  playerTwo: ''
};
const navStack = ['onboarding'];
const swipe = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, id: null };

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
  if (navStack[navStack.length - 1] !== name) navStack.push(name);
  ui.backBtn.classList.toggle('hidden', ['onboarding', 'categories'].includes(name));
}

function goBack() {
  if (navStack.length <= 1) return;
  navStack.pop();
  const prev = navStack[navStack.length - 1];
  Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
  screens[prev].classList.add('screen-active');
  ui.backBtn.classList.toggle('hidden', ['onboarding', 'categories'].includes(prev));
}

function applyTheme(mode) {
  document.body.classList.toggle('light', mode === 'light');
  localStorage.setItem('couples_theme', mode);
}

function initTheme() {
  applyTheme(localStorage.getItem('couples_theme') === 'light' ? 'light' : 'dark');
}

function getDisplayNames() {
  if (state.anonymous) return 'Анонимный режим';
  const a = state.playerOne || 'Игрок 1';
  const b = state.playerTwo || 'Игрок 2';
  return `${a} + ${b}`;
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderCategories() {
  ui.categoriesGrid.innerHTML = categoryMeta.map((cat) => {
    const count = (questionsData[cat.id] || []).length;
    return `
      <button class="category-card" data-id="${cat.id}" style="background:${cat.color}">
        <div class="category-top">
          <div class="category-icon">${cat.icon}</div>
          ${cat.badge ? `<span class="category-badge">${cat.badge}</span>` : ''}
        </div>
        <div>
          <h3>${cat.id}</h3>
          <p>${cat.desc}</p>
        </div>
        <div class="category-count">${count} вопросов</div>
      </button>`;
  }).join('');

  ui.categoriesGrid.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => openCategory(card.dataset.id));
  });
}

function openCategory(categoryId) {
  if (categoryId === 'Интимные вопросы' && localStorage.getItem('adult_ok') !== 'yes') {
    pendingAdultCategory = categoryId;
    ui.adultModal.classList.remove('hidden');
    return;
  }
  currentCategory = categoryMeta.find((cat) => cat.id === categoryId);
  const total = (questionsData[categoryId] || []).length;
  ui.introCard.innerHTML = `
    <div class="intro-illu">${currentCategory.icon}</div>
    <span class="eyebrow">${currentCategory.badge || 'Категория'}</span>
    <h2>${currentCategory.id}</h2>
    <p class="muted">${currentCategory.desc}</p>
    <p class="muted">${total} вопросов в колоде. Игра возьмёт 8 случайных вопросов.</p>
    <div class="stacked-actions">
      <button class="primary-btn full" id="playCategoryBtn">Новая игра</button>
      <button class="secondary-btn full" id="backToCategoriesBtn">Назад</button>
    </div>`;
  showScreen('intro');
  $('playCategoryBtn').addEventListener('click', startGame);
  $('backToCategoriesBtn').addEventListener('click', goBack);
}

function startGame() {
  currentQuestions = shuffle(questionsData[currentCategory.id] || []).slice(0, 8);
  currentIndex = 0;
  stats = { match: 0, mismatch: 0, skip: 0 };
  renderQuestion(true);
  showScreen('game');
}

function renderQuestion(initial = false) {
  const total = currentQuestions.length;
  const q = currentQuestions[currentIndex] || '';
  ui.gameCategory.textContent = currentCategory.id;
  ui.progressLabel.textContent = `${currentIndex + 1} / ${total}`;
  ui.progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;
  ui.questionText.textContent = q;
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.style.transition = 'none';
  ui.questionCard.style.transform = initial ? 'translate3d(0,0,0) rotate(0deg) scale(1)' : 'translate3d(0,20px,0) rotate(0deg) scale(.98)';
  ui.questionCard.style.opacity = initial ? '1' : '0';
  requestAnimationFrame(() => {
    ui.questionCard.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
    ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    ui.questionCard.style.opacity = '1';
  });
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function launchConfetti() {
  const wrap = document.createElement('div');
  wrap.className = 'confetti-wrap';
  document.body.appendChild(wrap);
  const colors = ['#f59e0b', '#fb7185', '#60a5fa', '#22c55e', '#fff'];
  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-10 - Math.random() * 20}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    wrap.appendChild(piece);
  }
  setTimeout(() => wrap.remove(), 4200);
}

function resultMessage(score) {
  if (score === 100) return 'Идеальное совпадение. На эту тему вы реально на одной волне.';
  if (score >= 80) return 'Сильный результат. Вы очень хорошо чувствуете друг друга.';
  if (score >= 55) return 'Хорошо, но есть темы, которые можно обсудить глубже.';
  if (score >= 35) return 'Различия заметны. Это хороший повод для честного разговора.';
  return 'Похоже, взгляды отличаются. Попробуйте обсудить ответы спокойно и без давления.';
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
    vibrate([30, 30, 60]);
    launchConfetti();
  }
  showScreen('results');
}

function completeAnswer(type) {
  stats[type] += 1;
  currentIndex += 1;
  if (currentIndex >= currentQuestions.length) finishGame();
  else renderQuestion();
}

function animateOut(type, callback) {
  const map = {
    match: 'translate3d(420px,-20px,0) rotate(16deg) scale(.96)',
    mismatch: 'translate3d(-420px,-20px,0) rotate(-16deg) scale(.96)',
    skip: 'translate3d(0,-320px,0) rotate(0) scale(.96)'
  };
  ui.questionCard.style.transition = 'transform 280ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
  ui.questionCard.style.opacity = '0';
  ui.questionCard.style.transform = map[type];
  setTimeout(callback, 250);
}

function answer(type) {
  if (!currentQuestions.length) return;
  vibrate(type === 'skip' ? [10, 30, 10] : 12);
  animateOut(type, () => completeAnswer(type));
}

function shareResult() {
  const text = `${getDisplayNames()} — ${currentCategory.id}: ${ui.resultsScore.textContent} совместимости.`;
  if (navigator.share) {
    navigator.share({ title: 'Вопросы для двоих', text }).catch(() => {});
    return;
  }
  navigator.clipboard?.writeText(text).then(() => alert('Результат скопирован.')).catch(() => alert(text));
}

function onPointerDown(e) {
  if (!screens.game.classList.contains('screen-active')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  swipe.active = true;
  swipe.id = e.pointerId;
  swipe.startX = e.clientX;
  swipe.startY = e.clientY;
  swipe.currentX = e.clientX;
  swipe.currentY = e.clientY;
  ui.questionCard.setPointerCapture?.(e.pointerId);
  ui.questionCard.style.transition = 'none';
}

function onPointerMove(e) {
  if (!swipe.active || swipe.id !== e.pointerId) return;
  swipe.currentX = e.clientX;
  swipe.currentY = e.clientY;
  const dx = swipe.currentX - swipe.startX;
  const dy = swipe.currentY - swipe.startY;
  const rotate = dx / 18;
  ui.questionCard.style.transform = `translate3d(${dx}px, ${dy * 0.18}px, 0) rotate(${rotate}deg)`;
  ui.questionCard.dataset.swipe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy < -70 ? 'up' : 'none');
}

function onPointerUp(e) {
  if (!swipe.active || swipe.id !== e.pointerId) return;
  swipe.active = false;
  ui.questionCard.releasePointerCapture?.(e.pointerId);
  const dx = swipe.currentX - swipe.startX;
  const dy = swipe.currentY - swipe.startY;
  swipe.id = null;
  if (dx > 90) return answer('match');
  if (dx < -90) return answer('mismatch');
  if (dy < -120 && Math.abs(dx) < 90) return answer('skip');
  ui.questionCard.style.transition = 'transform 200ms ease';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg)';
  ui.questionCard.dataset.swipe = 'none';
}

function attachEvents() {
  ui.anonymousToggle.addEventListener('change', () => {
    ui.namesBlock.style.display = ui.anonymousToggle.checked ? 'none' : 'grid';
  });

  ui.continueBtn.addEventListener('click', () => {
    state.anonymous = ui.anonymousToggle.checked;
    state.playerOne = ui.playerOneInput.value.trim();
    state.playerTwo = ui.playerTwoInput.value.trim();
    if (!state.anonymous && (!state.playerOne || !state.playerTwo)) {
      alert('Введите оба имени или включите анонимный режим.');
      return;
    }
    localStorage.setItem('couples_onboarding', JSON.stringify(state));
    ui.playerLabel.textContent = getDisplayNames();
    showScreen('categories');
  });

  ui.backBtn.addEventListener('click', goBack);
  ui.themeBtn.addEventListener('click', () => applyTheme(document.body.classList.contains('light') ? 'dark' : 'light'));
  ui.matchBtn.addEventListener('click', () => answer('match'));
  ui.mismatchBtn.addEventListener('click', () => answer('mismatch'));
  ui.skipBtn.addEventListener('click', () => answer('skip'));
  ui.restartBtn.addEventListener('click', startGame);
  ui.changeCategoryBtn.addEventListener('click', () => showScreen('categories'));
  ui.shareBtn.addEventListener('click', shareResult);

  ui.adultConfirmBtn.addEventListener('click', () => {
    localStorage.setItem('adult_ok', 'yes');
    ui.adultModal.classList.add('hidden');
    if (pendingAdultCategory) {
      const next = pendingAdultCategory;
      pendingAdultCategory = null;
      openCategory(next);
    }
  });
  ui.adultCancelBtn.addEventListener('click', () => {
    pendingAdultCategory = null;
    ui.adultModal.classList.add('hidden');
  });

  ui.questionCard.addEventListener('pointerdown', onPointerDown);
  ui.questionCard.addEventListener('pointermove', onPointerMove);
  ui.questionCard.addEventListener('pointerup', onPointerUp);
  ui.questionCard.addEventListener('pointercancel', onPointerUp);
}

function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

async function initTelegram() {
  if (!(window.Telegram && window.Telegram.WebApp)) return;
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

async function init() {
  try {
    const res = await fetch('questions.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    questionsData = await res.json();
  } catch (err) {
    alert(`Не удалось загрузить questions.json: ${err.message}`);
    return;
  }

  initTheme();
  renderCategories();
  attachEvents();
  preventDoubleTapZoom();
  initTelegram();

  const saved = localStorage.getItem('couples_onboarding');
  if (saved) {
    try {
      state = JSON.parse(saved);
      ui.anonymousToggle.checked = !!state.anonymous;
      ui.namesBlock.style.display = state.anonymous ? 'none' : 'grid';
      ui.playerOneInput.value = state.playerOne || '';
      ui.playerTwoInput.value = state.playerTwo || '';
    } catch {}
  }
}

document.addEventListener('DOMContentLoaded', init);

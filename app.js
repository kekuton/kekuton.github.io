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
}

function initTheme() {
  const saved = localStorage.getItem('couples_theme');
  applyTheme(saved === 'light' ? 'light' : 'dark');
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('couples_history') || '[]');
  } catch {
    return [];
  }
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

  ui.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => openCategory(card.dataset.id));
  });
}

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
  renderQuestion();
  showScreen('game');
}

function renderQuestion() {
  const total = currentQuestions.length;
  const q = currentQuestions[currentIndex];
  ui.gameCategory.textContent = currentCategory.id;
  ui.gameTitle.textContent = 'Вопрос';
  ui.questionText.textContent = q;
  ui.progressLabel.textContent = `${currentIndex + 1} / ${total}`;
  ui.progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;

  ui.questionCard.animate([
    { transform: 'translateY(12px)', opacity: 0.1 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration: 220, easing: 'ease-out' });
}

function answer(type) {
  stats[type] += 1;
  currentIndex += 1;
  if (currentIndex >= currentQuestions.length) {
    finishGame();
  } else {
    renderQuestion();
  }
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

async function initTelegram() {
  if (!(window.Telegram && window.Telegram.WebApp)) return;
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
}

async function init() {
  questionsData = await fetch('questions.json').then(r => r.json());
  initTheme();
  renderCategories();
  renderHistory();
  preventDoubleTapZoom();
  initTelegram();

  ui.startBtn.addEventListener('click', () => showScreen('categories'));
  ui.historyBtn.addEventListener('click', () => showScreen('history'));
  ui.backBtn.addEventListener('click', goBack);
  ui.themeBtn.addEventListener('click', () => {
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
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

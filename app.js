const $ = (id) => document.getElementById(id);

const screens = {
  home: $('homeScreen'),
  categories: $('categoriesScreen'),
  intro: $('introScreen'),
  game: $('gameScreen'),
  results: $('resultsScreen'),
  daily: $('dailyScreen'),
  premium: $('premiumScreen')
};

const ui = {
  backBtn: $('backBtn'),
  themeBtn: $('themeBtn'),
  anonymousToggle: $('anonymousToggle'),
  namesBlock: $('namesBlock'),
  playerOneInput: $('playerOneInput'),
  playerTwoInput: $('playerTwoInput'),
  homeForm: $('homeForm'),
  continueBtn: $('continueBtn'),
  dailyBtn: $('dailyBtn'),
  premiumBtn: $('premiumBtn'),
  premiumStatusLabel: $('premiumStatusLabel'),
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
  analysisText: $('analysisText'),
  statMatch: $('statMatch'),
  statMismatch: $('statMismatch'),
  statSkip: $('statSkip'),
  restartBtn: $('restartBtn'),
  changeCategoryBtn: $('changeCategoryBtn'),
  shareBtn: $('shareBtn'),
  shareCardBtn: $('shareCardBtn'),
  dailyQuestionText: $('dailyQuestionText'),
  dailyPlayBtn: $('dailyPlayBtn'),
  dailyArchiveBtn: $('dailyArchiveBtn'),
  premiumStatusBig: $('premiumStatusBig'),
  startTrialBtn: $('startTrialBtn'),
  buySubscriptionBtn: $('buySubscriptionBtn'),
  adultModal: $('adultModal'),
  adultConfirmBtn: $('adultConfirmBtn'),
  adultCancelBtn: $('adultCancelBtn')
};

const navStack = ['home'];
const swipe = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, id: null };

const categoryMeta = [
  { id: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)', premium: false },
  { id: 'Будущее', icon: '🔮', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)', premium: false },
  { id: 'Финансы', icon: '💰', desc: 'Деньги, цели и бюджет пары', color: 'linear-gradient(180deg,#f59e0b,#f97316)', premium: false },
  { id: 'Воспоминания', icon: '📸', desc: 'Лучшие моменты ваших отношений', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)', premium: false },
  { id: 'Hard Talk', sourceId: 'Флаги', icon: '🔥', desc: 'Сложные и прямые разговоры', color: 'linear-gradient(180deg,#ef4444,#7c2d12)', premium: true, pack: 'hard' },
  { id: '18+', sourceId: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы для близости', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', premium: true, pack: 'adult', ageRestricted: true },
  { id: 'Психология+', sourceId: 'Психология', icon: '🧠', desc: 'Глубокие темы про эмоции и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)', premium: true, pack: 'psyplus' },
];

const premiumState = {
  isPremium: false,
  trialStartedAt: null,
  purchasedPacks: []
};

let state = { anonymous: false, playerOne: '', playerTwo: '' };
let questionsData = {};
let currentCategory = null;
let currentQuestions = [];
let currentIndex = 0;
let stats = { match: 0, mismatch: 0, skip: 0 };
let pendingAdultCategory = null;
let dailyCategory = null;

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function loadPremium() {
  Object.assign(premiumState, loadJSON('premium_state', premiumState));
}
function savePremium() { saveJSON('premium_state', premiumState); updatePremiumUI(); }
function startTrial() {
  if (premiumState.trialStartedAt) return;
  premiumState.trialStartedAt = Date.now();
  premiumState.isPremium = true;
  savePremium();
  alert('Пробный доступ на 3 дня активирован.');
}
function checkTrial() {
  if (!premiumState.trialStartedAt) return;
  const days = (Date.now() - premiumState.trialStartedAt) / 86400000;
  if (days > 3) {
    premiumState.isPremium = false;
    savePremium();
  }
}
function buySubscription() {
  premiumState.isPremium = true;
  savePremium();
  alert('Premium активирован. В Mini App это место можно связать с оплатой.');
}
function buyPack(pack) {
  if (!premiumState.purchasedPacks.includes(pack)) premiumState.purchasedPacks.push(pack);
  savePremium();
  alert('Пакет открыт.');
}
function hasPack(pack) { return premiumState.purchasedPacks.includes(pack); }
function canAccessCategory(cat) {
  if (!cat.premium) return true;
  if (premiumState.isPremium) return true;
  return hasPack(cat.pack);
}
function updatePremiumUI() {
  let status = 'Не активирован';
  if (premiumState.isPremium && premiumState.trialStartedAt) {
    const left = Math.max(0, 3 - Math.floor((Date.now() - premiumState.trialStartedAt) / 86400000));
    status = `Trial / Premium · ${left} дн.`;
  } else if (premiumState.isPremium) {
    status = 'Premium активен';
  }
  ui.premiumStatusLabel.textContent = status;
  ui.premiumStatusBig.textContent = `${status}${premiumState.purchasedPacks.length ? ` · Пакеты: ${premiumState.purchasedPacks.join(', ')}` : ''}`;
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
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }
function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function showScreen(name) {
  Object.values(screens).forEach((screen) => { screen.classList.remove('screen-active'); screen.scrollTop = 0; });
  screens[name].classList.add('screen-active');
  if (navStack[navStack.length - 1] !== name) navStack.push(name);
  ui.backBtn.classList.toggle('hidden', ['home', 'categories'].includes(name));
}
function goBack() {
  if (navStack.length <= 1) return;
  navStack.pop();
  const prev = navStack[navStack.length - 1];
  Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
  screens[prev].classList.add('screen-active');
  ui.backBtn.classList.toggle('hidden', ['home', 'categories'].includes(prev));
}

function getQuestionPool(cat) {
  const sourceId = cat.sourceId || cat.id;
  return questionsData[sourceId] || [];
}

function renderCategories() {
  ui.categoriesGrid.innerHTML = categoryMeta.map((cat) => {
    const count = getQuestionPool(cat).length;
    const locked = !canAccessCategory(cat);
    return `
      <button class="category-card" data-id="${cat.id}" style="background:${cat.color}">
        <div class="category-top">
          <div class="category-icon">${cat.icon}</div>
          ${cat.premium ? `<span class="category-badge">Premium</span>` : ''}
        </div>
        <div>
          <h3>${cat.id}</h3>
          <p>${cat.desc}</p>
        </div>
        <div class="category-count">${count} вопросов${locked ? ' · 🔒' : ''}</div>
      </button>`;
  }).join('');
  ui.categoriesGrid.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => openCategory(card.dataset.id));
  });
}

function openCategory(categoryId) {
  const category = categoryMeta.find((cat) => cat.id === categoryId);
  if (!category) return;
  if (!canAccessCategory(category)) {
    showScreen('premium');
    return;
  }
  if (category.ageRestricted && localStorage.getItem('adult_ok') !== 'yes') {
    pendingAdultCategory = categoryId;
    ui.adultModal.classList.remove('hidden');
    return;
  }
  currentCategory = category;
  const total = getQuestionPool(category).length;
  ui.introCard.innerHTML = `
    <div class="intro-illu">${category.icon}</div>
    <span class="eyebrow">${category.premium ? 'Premium' : 'Категория'}</span>
    <h2>${category.id}</h2>
    <p class="muted">${category.desc}</p>
    <p class="muted">${total} вопросов в архиве. В игру пойдут 8 случайных карточек.</p>
    <div class="stacked-actions">
      <button class="primary-btn full" type="button" id="startCategoryBtn">Начать игру</button>
      ${premiumState.isPremium ? '<button class="secondary-btn full" type="button" id="openArchiveBtn">Открыть архив вопросов</button>' : ''}
    </div>`;
  ui.introCard.querySelector('#startCategoryBtn').addEventListener('click', startCategoryGame);
  if (premiumState.isPremium && ui.introCard.querySelector('#openArchiveBtn')) {
    ui.introCard.querySelector('#openArchiveBtn').addEventListener('click', showArchive);
  }
  showScreen('intro');
}

function showArchive() {
  if (!premiumState.isPremium) {
    showScreen('premium');
    return;
  }
  const list = getQuestionPool(currentCategory).slice(0, 30).map((q) => `<li>${q}</li>`).join('');
  ui.introCard.innerHTML = `
    <span class="eyebrow">Premium архив</span>
    <h2>${currentCategory.id}</h2>
    <div class="panel" style="padding:14px;background:rgba(255,255,255,.08)"><ol style="margin:0;padding-left:20px;display:grid;gap:10px">${list}</ol></div>
    <button class="primary-btn full" id="backToIntroBtn">Назад</button>`;
  ui.introCard.querySelector('#backToIntroBtn').addEventListener('click', () => openCategory(currentCategory.id));
}

function startCategoryGame() {
  const pool = getQuestionPool(currentCategory);
  currentQuestions = shuffle(pool).slice(0, Math.min(8, pool.length));
  currentIndex = 0;
  stats = { match: 0, mismatch: 0, skip: 0 };
  ui.gameCategory.textContent = currentCategory.id;
  ui.gameTitle.textContent = 'Ответьте честно';
  renderQuestion(true);
  showScreen('game');
}

function renderQuestion(initial = false) {
  const q = currentQuestions[currentIndex];
  ui.questionText.textContent = q || 'Нет вопроса';
  ui.progressLabel.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
  ui.progressFill.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.classList.remove('glow-match', 'glow-mismatch');
  ui.questionCard.style.transition = 'none';
  ui.questionCard.style.transform = initial ? 'translate3d(0,0,0) rotate(0deg) scale(1)' : 'translate3d(0,20px,0) rotate(0deg) scale(.98)';
  ui.questionCard.style.opacity = initial ? '1' : '0';
  requestAnimationFrame(() => {
    ui.questionCard.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
    ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    ui.questionCard.style.opacity = '1';
  });
}

function animateOut(type, callback) {
  const map = {
    match: 'translate3d(420px,-20px,0) rotate(16deg) scale(.96)',
    mismatch: 'translate3d(-420px,-20px,0) rotate(-16deg) scale(.96)',
    skip: 'translate3d(0,-320px,0) rotate(0) scale(.96)'
  };
  ui.questionCard.classList.toggle('glow-match', type === 'match');
  ui.questionCard.classList.toggle('glow-mismatch', type === 'mismatch');
  ui.questionCard.style.transition = 'transform 280ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
  ui.questionCard.style.opacity = '0';
  ui.questionCard.style.transform = map[type];
  setTimeout(callback, 250);
}

function completeAnswer(type) {
  stats[type] += 1;
  currentIndex += 1;
  if (currentIndex >= currentQuestions.length) finishGame();
  else renderQuestion();
}

function answer(type) {
  if (!currentQuestions.length) return;
  vibrate(type === 'skip' ? [10, 30, 10] : 12);
  animateOut(type, () => completeAnswer(type));
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

function generateAIAnalysis(score) {
  if (!premiumState.isPremium) return 'Premium AI-анализ доступен только по подписке.';
  const insights = [];
  if (score >= 80) insights.push('У вас высокий уровень совпадения по этой теме. Вы обычно быстро понимаете позицию партнёра.');
  if (score >= 50 && score < 80) insights.push('Вы во многом совпадаете, но часть ответов указывает на разные ожидания.');
  if (score < 50) insights.push('Есть заметные расхождения. Это не плохо, но лучше обсудить причины без давления.');
  if (stats.skip >= 2) insights.push('Вы часто пропускали вопросы — возможно, внутри темы есть зоны неловкости или сопротивления.');
  if (currentCategory.id === 'Финансы') insights.push('Денежные вопросы лучше переводить в конкретные договорённости, а не общие обещания.');
  if (currentCategory.id === 'Психология+') insights.push('В этой категории важно не только совпадение, но и способность слышать ответы друг друга до конца.');
  if (currentCategory.id === 'Hard Talk') insights.push('Hard Talk хорошо проходить короткими блоками, чтобы разговор не превращался в спор.');
  return insights.join(' ');
}

function saveHistory(entry) {
  const history = loadJSON('game_history', []);
  history.unshift(entry);
  saveJSON('game_history', history.slice(0, 30));
}

function finishGame() {
  const answered = stats.match + stats.mismatch;
  const score = answered ? Math.round((stats.match / answered) * 100) : 0;
  ui.resultsCategory.textContent = currentCategory.id;
  ui.resultsScore.textContent = `${score}%`;
  ui.resultsMessage.textContent = resultMessage(score);
  ui.analysisText.textContent = generateAIAnalysis(score);
  ui.statMatch.textContent = stats.match;
  ui.statMismatch.textContent = stats.mismatch;
  ui.statSkip.textContent = stats.skip;
  saveHistory({ category: currentCategory.id, score, stats, at: Date.now() });
  if (score === 100 && stats.match > 0) {
    vibrate([30, 30, 60]);
    launchConfetti();
  }
  showScreen('results');
}

async function shareResult() {
  const text = `${getDisplayNames()} — ${currentCategory.id}: ${ui.resultsScore.textContent} совместимости.`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Вопросы для двоих', text }); return; } catch {}
  }
  try { await navigator.clipboard.writeText(text); alert('Результат скопирован.'); }
  catch { alert(text); }
}

function generateShareCard() {
  if (!premiumState.isPremium) {
    alert('Красивые share-card доступны только в Premium.');
    showScreen('premium');
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1200, 630);
  grad.addColorStop(0, '#8b5cf6');
  grad.addColorStop(1, '#ec4899');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.fillRoundRect?.(52, 52, 1096, 526, 28);
  if (!ctx.roundRect) {
    ctx.fillRect(52, 52, 1096, 526);
  }
  ctx.fillStyle = '#fff';
  ctx.font = '700 34px Arial';
  ctx.fillText('Вопросы для двоих', 92, 120);
  ctx.font = '800 94px Arial';
  ctx.fillText(ui.resultsScore.textContent, 92, 270);
  ctx.font = '700 54px Arial';
  ctx.fillText(currentCategory.id, 92, 360);
  ctx.font = '400 34px Arial';
  const lines = wrapText(ctx, generateAIAnalysis(parseInt(ui.resultsScore.textContent, 10)), 760);
  lines.slice(0, 4).forEach((line, idx) => ctx.fillText(line, 92, 430 + idx * 44));
  ctx.font = '600 28px Arial';
  ctx.fillText(getDisplayNames(), 92, 555);
  const link = document.createElement('a');
  link.download = 'share-card.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function computeDailyQuestion() {
  const freeCategories = categoryMeta.filter((c) => !c.premium);
  const day = Math.floor(Date.now() / 86400000);
  dailyCategory = freeCategories[day % freeCategories.length];
  const pool = getQuestionPool(dailyCategory);
  const q = pool[day % pool.length];
  ui.dailyQuestionText.textContent = q;
}

function onPointerDown(e) {
  if (!screens.game.classList.contains('screen-active')) return;
  swipe.active = true;
  swipe.id = e.pointerId;
  swipe.startX = e.clientX;
  swipe.startY = e.clientY;
  swipe.currentX = e.clientX;
  swipe.currentY = e.clientY;
  ui.questionCard.setPointerCapture?.(e.pointerId);
}
function onPointerMove(e) {
  if (!swipe.active || e.pointerId !== swipe.id) return;
  swipe.currentX = e.clientX;
  swipe.currentY = e.clientY;
  const dx = swipe.currentX - swipe.startX;
  const dy = swipe.currentY - swipe.startY;
  ui.questionCard.style.transition = 'none';
  ui.questionCard.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${dx / 18}deg)`;
  if (Math.abs(dx) > Math.abs(dy)) {
    ui.questionCard.dataset.swipe = dx > 0 ? 'right' : 'left';
  } else if (dy < -20) {
    ui.questionCard.dataset.swipe = 'up';
  } else {
    ui.questionCard.dataset.swipe = 'none';
  }
}
function onPointerUp(e) {
  if (!swipe.active || e.pointerId !== swipe.id) return;
  const dx = swipe.currentX - swipe.startX;
  const dy = swipe.currentY - swipe.startY;
  swipe.active = false;
  if (Math.abs(dx) > 110 && Math.abs(dx) > Math.abs(dy)) {
    answer(dx > 0 ? 'match' : 'mismatch');
    return;
  }
  if (dy < -110 && Math.abs(dy) > Math.abs(dx)) {
    answer('skip');
    return;
  }
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.style.transition = 'transform 180ms ease';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg)';
}

function continueFromHome(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();
  state.anonymous = !!ui.anonymousToggle.checked;
  state.playerOne = (ui.playerOneInput.value || '').trim();
  state.playerTwo = (ui.playerTwoInput.value || '').trim();

  if (!state.anonymous && (!state.playerOne || !state.playerTwo)) {
    alert('Заполни оба имени или включи анонимный режим.');
    return false;
  }

  ui.playerLabel.textContent = getDisplayNames();
  renderCategories();
  showScreen('categories');
  return false;
}
window.__continueFromHome = continueFromHome;

async function init() {
  initTheme();
  loadPremium();
  checkTrial();
  updatePremiumUI();

  const res = await fetch('questions.json');
  questionsData = await res.json();
  computeDailyQuestion();

  ui.anonymousToggle.addEventListener('change', () => {
    ui.namesBlock.style.display = ui.anonymousToggle.checked ? 'none' : 'grid';
  });
  if (ui.homeForm) ui.homeForm.addEventListener('submit', continueFromHome);
  if (ui.continueBtn) ui.continueBtn.addEventListener('click', continueFromHome);
  ui.dailyBtn.addEventListener('click', () => showScreen('daily'));
  ui.premiumBtn.addEventListener('click', () => showScreen('premium'));
  ui.themeBtn.addEventListener('click', () => applyTheme(document.body.classList.contains('light') ? 'dark' : 'light'));
  ui.backBtn.addEventListener('click', goBack);
  ui.matchBtn.addEventListener('click', () => answer('match'));
  ui.mismatchBtn.addEventListener('click', () => answer('mismatch'));
  ui.skipBtn.addEventListener('click', () => answer('skip'));
  ui.restartBtn.addEventListener('click', startCategoryGame);
  ui.changeCategoryBtn.addEventListener('click', () => showScreen('categories'));
  ui.shareBtn.addEventListener('click', shareResult);
  ui.shareCardBtn.addEventListener('click', generateShareCard);
  ui.dailyPlayBtn.addEventListener('click', () => openCategory(dailyCategory.id));
  ui.dailyArchiveBtn.addEventListener('click', () => showScreen('premium'));
  ui.startTrialBtn.addEventListener('click', startTrial);
  ui.buySubscriptionBtn.addEventListener('click', buySubscription);
  document.querySelectorAll('.pack-card').forEach((card) => card.addEventListener('click', () => buyPack(card.dataset.pack)));

  ui.adultConfirmBtn.addEventListener('click', () => {
    localStorage.setItem('adult_ok', 'yes');
    ui.adultModal.classList.add('hidden');
    if (pendingAdultCategory) openCategory(pendingAdultCategory);
  });
  ui.adultCancelBtn.addEventListener('click', () => {
    pendingAdultCategory = null;
    ui.adultModal.classList.add('hidden');
  });

  ui.questionCard.addEventListener('pointerdown', onPointerDown);
  ui.questionCard.addEventListener('pointermove', onPointerMove);
  ui.questionCard.addEventListener('pointerup', onPointerUp);
  ui.questionCard.addEventListener('pointercancel', onPointerUp);

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}



// Резервная делегация кликов для динамических кнопок, чтобы они работали и в Telegram WebView
document.addEventListener('click', (e) => {
  const startBtn = e.target.closest('#startCategoryBtn');
  if (startBtn) {
    e.preventDefault();
    e.stopPropagation();
    startCategoryGame();
    return;
  }
  const archiveBtn = e.target.closest('#openArchiveBtn');
  if (archiveBtn) {
    e.preventDefault();
    e.stopPropagation();
    showArchive();
  }
});

document.addEventListener('DOMContentLoaded', init);

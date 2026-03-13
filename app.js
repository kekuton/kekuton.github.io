
const $ = (id) => document.getElementById(id);
const screens = {
  onboarding: $('onboardingScreen'),
  home: $('homeScreen'),
  categories: $('categoriesScreen'),
  intro: $('categoryIntroScreen'),
  game: $('gameScreen'),
  results: $('resultsScreen'),
  history: $('historyScreen'),
  favorites: $('favoritesScreen'),
  premium: $('premiumScreen'),
  rooms: $('roomsScreen')
};

const ui = {
  backBtn: $('backBtn'), themeBtn: $('themeBtn'), langBtn: $('langBtn'), brandPill: $('brandPill'),
  onboardingStartBtn: $('onboardingStartBtn'), anonymousModeToggle: $('anonymousModeToggle'),
  startBtn: $('startBtn'), roomsBtn: $('roomsBtn'), dailyBtn: $('dailyBtn'), historyBtn: $('historyBtn'), favoritesBtn: $('favoritesBtn'), premiumBtn: $('premiumBtn'),
  categoriesGrid: $('categoriesGrid'), introCard: $('categoryIntroCard'),
  gameCategory: $('gameCategory'), gameTitle: $('gameTitle'), progressLabel: $('progressLabel'), progressFill: $('progressFill'),
  questionCard: $('questionCard'), questionText: $('questionText'), favoriteQuestionBtn: $('favoriteQuestionBtn'),
  matchBtn: $('matchBtn'), mismatchBtn: $('mismatchBtn'), skipBtn: $('skipBtn'), discussBtn: $('discussBtn'), showRoomStatusBtn: $('showRoomStatusBtn'),
  resultsCategory: $('resultsCategory'), resultsScore: $('resultsScore'), resultsMessage: $('resultsMessage'),
  statMatch: $('statMatch'), statMismatch: $('statMismatch'), statSkip: $('statSkip'), analysisList: $('analysisList'),
  restartBtn: $('restartBtn'), shareBtn: $('shareBtn'), shareImageBtn: $('shareImageBtn'), changeCategoryBtn: $('changeCategoryBtn'),
  historyList: $('historyList'), achievementsList: $('achievementsList'), favoritesList: $('favoritesList'),
  adultModal: $('adultModal'), adultConfirmBtn: $('adultConfirmBtn'), adultCancelBtn: $('adultCancelBtn'),
  discussionModal: $('discussionModal'), closeDiscussionBtn: $('closeDiscussionBtn'), discussionTimer: $('discussionTimer'),
  premiumBackBtn: $('premiumBackBtn'), unlockPremiumBtn: $('unlockPremiumBtn'),
  createRoomBtn: $('createRoomBtn'), joinRoomBtn: $('joinRoomBtn'), joinRoomInput: $('joinRoomInput'), invitePartnerBtn: $('invitePartnerBtn'), roomStatusBox: $('roomStatusBox'),
  shareCanvas: $('shareCanvas')
};

const translations = {
  ru: {
    appName: 'Вопросы для двоих', continue: 'Продолжить', anonymousMode: 'Анонимный режим',
    onboardEyebrow: 'Добро пожаловать', onboardTitle: 'Игра, которая помогает говорить честно', onboardText: 'Выберите категорию, отвечайте вместе и смотрите, где вы совпадаете сильнее всего.', onboardStep1: 'Выберите настроение', onboardStep2: 'Отвечайте свайпами или кнопками', onboardStep3: 'Получите анализ пары',
    heroEyebrow: 'Mini App для пары', heroTitle: 'Поговорим откровенно?', heroText: 'Проходите категории, отвечайте свайпами, обсуждайте важные темы и сохраняйте историю пары.',
    startGame: 'Начать игру', rooms: 'Комнаты', compatibility: 'Совместимость', compatibilityDesc: 'AI-анализ по результатам', hardTalkDesc: 'Сложные, честные разговоры', dailyQuestion: 'Вопрос дня', dailyQuestionDesc: 'Один вопрос каждый день', history: 'История', historyDesc: 'Последние игры и достижения', favorites: 'Любимые', favoritesDesc: 'Сохраняйте лучшие вопросы', premiumDesc: 'Премиум категории и функции',
    categoryEyebrow: 'Выбор категории', categoryTitle: 'Выберите настроение игры', categoryText: 'Можно пройти обычную категорию, Hard Talk или ритуалы.',
    match: 'Совпало', mismatch: 'Не совпало', skip: 'Пропуск', discuss: 'Обсудить этот вопрос', roomStatus: 'Статус комнаты',
    results: 'Результат', analysis: 'AI-анализ пары', playAgain: 'Пройти ещё раз', share: 'Поделиться результатом', shareImage: 'Сохранить картинку', changeCategory: 'Другая категория',
    historyTitle: 'Последние игры', achievements: 'Достижения', favoritesTitle: 'Избранные вопросы', premiumTitle: 'Глубже, честнее, ярче', premiumText: 'Открывайте премиум-категории, расширенный AI-анализ, красивые share-card и облачную историю пары.', unlockPremium: 'Разблокировать демо Premium', back: 'Назад',
    roomsTitle: 'Совместная игра', roomsText: 'Создай комнату, скопируй код или ссылку и пригласи партнёра прямо из Mini App.', createRoom: 'Создать комнату', join: 'Войти', invitePartner: 'Пригласить партнёра',
    adultTitle: 'Подтвердите возраст', adultText: 'Эта категория содержит откровенные вопросы.', adultConfirm: 'Мне есть 18', discussionText: 'Поговорите 2 минуты, а потом продолжайте.'
  },
  en: {
    appName: 'Couples Questions', continue: 'Continue', anonymousMode: 'Anonymous mode',
    onboardEyebrow: 'Welcome', onboardTitle: 'A game that helps you talk honestly', onboardText: 'Pick a category, answer together, and see where you match the most.', onboardStep1: 'Choose a mood', onboardStep2: 'Answer with swipes or buttons', onboardStep3: 'Get a couple analysis',
    heroEyebrow: 'Mini App for couples', heroTitle: 'Ready for an honest talk?', heroText: 'Play categories, answer with swipes, discuss important topics, and save your couple history.',
    startGame: 'Start game', rooms: 'Rooms', compatibility: 'Compatibility', compatibilityDesc: 'AI analysis from your results', hardTalkDesc: 'Hard, honest conversations', dailyQuestion: 'Question of the day', dailyQuestionDesc: 'One question every day', history: 'History', historyDesc: 'Recent games and achievements', favorites: 'Favorites', favoritesDesc: 'Save your best questions', premiumDesc: 'Premium categories and features',
    categoryEyebrow: 'Category pick', categoryTitle: 'Choose the game mood', categoryText: 'Play a classic category, Hard Talk or rituals.',
    match: 'Match', mismatch: 'No match', skip: 'Skip', discuss: 'Discuss this question', roomStatus: 'Room status',
    results: 'Results', analysis: 'AI couple analysis', playAgain: 'Play again', share: 'Share result', shareImage: 'Save image', changeCategory: 'Change category',
    historyTitle: 'Recent games', achievements: 'Achievements', favoritesTitle: 'Favorite questions', premiumTitle: 'Deeper, more honest, brighter', premiumText: 'Unlock premium categories, extended AI analysis, beautiful share cards and couple cloud history.', unlockPremium: 'Unlock demo Premium', back: 'Back',
    roomsTitle: 'Play together', roomsText: 'Create a room, copy the code or link, and invite your partner directly from the Mini App.', createRoom: 'Create room', join: 'Join', invitePartner: 'Invite partner',
    adultTitle: 'Confirm your age', adultText: 'This category contains explicit questions.', adultConfirm: 'I am 18+', discussionText: 'Talk for 2 minutes, then continue.'
  }
};

const categoryMeta = [
  { id: 'Психология', key: 'psychology', icon: '🧠', desc: 'Эмоции, доверие и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)', premium: false },
  { id: 'Воспоминания', key: 'memories', icon: '📸', desc: 'Лучшие моменты ваших отношений', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)', premium: false },
  { id: 'Будущее', key: 'future', icon: '🔮', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)', premium: false },
  { id: 'Финансы', key: 'finance', icon: '💰', desc: 'Деньги, цели и бюджет пары', color: 'linear-gradient(180deg,#f59e0b,#f97316)', premium: false },
  { id: 'На расстоянии', key: 'distance', icon: '✈️', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)', premium: false },
  { id: 'Ритуалы', key: 'rituals', icon: '🫶', desc: 'Короткие задания и тёплые практики', color: 'linear-gradient(180deg,#fb7185,#f43f5e)', premium: false },
  { id: 'Hard Talk', key: 'hardtalk', icon: '🔥', desc: 'Сложные и честные разговоры', color: 'linear-gradient(180deg,#f97316,#ef4444)', premium: true },
  { id: 'Интимные вопросы', key: 'intimate', icon: '🔞', desc: 'Откровенные вопросы для близости', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', premium: true, adult: true }
];

const appState = {
  lang: localStorage.getItem('couples_lang') || 'ru',
  theme: localStorage.getItem('couples_theme') || 'dark',
  onboardingDone: localStorage.getItem('couples_onboarding_done') === 'yes',
  anonymousMode: localStorage.getItem('couples_anon') === 'yes',
  premium: localStorage.getItem('couples_premium_demo') === 'yes',
  questions: {},
  currentCategory: null,
  currentQuestions: [],
  currentIndex: 0,
  stats: { match: 0, mismatch: 0, skip: 0 },
  currentQuestion: '',
  pendingAdultCategory: null,
  navStack: [],
  room: { id: null, playerId: `p_${Math.random().toString(36).slice(2,8)}`, bc: null, answers: {} },
  discussionInterval: null
};

const swipeState = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0, pointerId: null, lastAxis: null };

function t(key) { return (translations[appState.lang] || translations.ru)[key] || key; }
function saveLS(key, val) { localStorage.setItem(key, val); }
function loadJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function vibrate(pattern = 10) { if (navigator.vibrate) navigator.vibrate(pattern); }

function applyTheme(theme) {
  appState.theme = theme;
  document.body.classList.toggle('light', theme === 'light');
  saveLS('couples_theme', theme);
}

function applyTranslations() {
  document.documentElement.lang = appState.lang === 'ru' ? 'ru' : 'en';
  ui.brandPill.textContent = t('appName');
  ui.langBtn.textContent = appState.lang === 'ru' ? 'EN' : 'RU';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
}

function pushScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
  if (appState.navStack[appState.navStack.length - 1] !== name) appState.navStack.push(name);
  ui.backBtn.classList.toggle('hidden', ['home', 'onboarding'].includes(name));
}

function goBack() {
  if (appState.navStack.length <= 1) return;
  appState.navStack.pop();
  const prev = appState.navStack[appState.navStack.length - 1];
  Object.values(screens).forEach(s => s.classList.remove('screen-active'));
  screens[prev].classList.add('screen-active');
  ui.backBtn.classList.toggle('hidden', ['home', 'onboarding'].includes(prev));
}

function getHistory() { return loadJSON('couples_history_v3', []); }
function setHistory(history) { setJSON('couples_history_v3', history.slice(0, 20)); }
function getFavorites() { return loadJSON('couples_favorites_v3', []); }
function setFavorites(favs) { setJSON('couples_favorites_v3', favs.slice(0, 60)); }
function getRatings() { return loadJSON('couples_ratings_v3', {}); }
function getAchievements() { return loadJSON('couples_achievements_v3', []); }
function setAchievements(items) { setJSON('couples_achievements_v3', items); }

function updateAnonymousMode() {
  appState.anonymousMode = ui.anonymousModeToggle.checked;
  saveLS('couples_anon', appState.anonymousMode ? 'yes' : 'no');
}

function renderCategories() {
  const ratings = getRatings();
  ui.categoriesGrid.innerHTML = categoryMeta.map(cat => {
    const count = (appState.questions[cat.id] || []).length;
    const rating = ratings[cat.id] ? `★ ${ratings[cat.id].toFixed(1)}` : '☆ New';
    const badge = cat.premium ? 'Premium' : (cat.adult ? '18+' : rating);
    return `
      <button class="category-card" data-id="${cat.id}" style="background:${cat.color}">
        <div class="category-card-top"><div class="category-icon">${cat.icon}</div><span class="category-badge">${badge}</span></div>
        <div><h3>${cat.id}</h3><p>${cat.desc}</p></div>
        <div class="category-count">${count} • ${rating}</div>
      </button>`;
  }).join('');
  ui.categoriesGrid.querySelectorAll('.category-card').forEach(btn => btn.addEventListener('click', () => openCategory(btn.dataset.id)));
}

function openCategory(categoryId) {
  const cat = categoryMeta.find(c => c.id === categoryId);
  if (!cat) return;
  if (cat.adult && localStorage.getItem('adult_ok') !== 'yes') {
    appState.pendingAdultCategory = categoryId;
    ui.adultModal.classList.remove('hidden');
    return;
  }
  if (cat.premium && !appState.premium) {
    pushScreen('premium');
    return;
  }
  appState.currentCategory = cat;
  const total = (appState.questions[categoryId] || []).length;
  ui.introCard.innerHTML = `
    <div class="intro-illu">${cat.icon}</div>
    <span class="eyebrow">${cat.premium ? 'Premium' : 'Category'}</span>
    <h2>${cat.id}</h2>
    <p class="intro-subtext">${cat.desc}</p>
    <p class="intro-subtext">${total} questions. ${cat.id === 'Hard Talk' ? 'Move carefully and honestly.' : 'Start a new game when you are ready.'}</p>
    <div class="hero-actions stacked">
      <button class="primary-btn" id="playCategoryBtn">${t('startGame')}</button>
      <button class="secondary-btn" id="rateCategoryBtn">⭐ Rate category</button>
      <button class="secondary-btn" id="backToCategoriesBtn">${t('back')}</button>
    </div>`;
  document.getElementById('playCategoryBtn').onclick = startGame;
  document.getElementById('backToCategoriesBtn').onclick = goBack;
  document.getElementById('rateCategoryBtn').onclick = () => rateCurrentCategory();
  pushScreen('intro');
}

function rateCurrentCategory() {
  const value = prompt(appState.lang === 'ru' ? 'Оцени категорию от 1 до 5' : 'Rate this category from 1 to 5', '5');
  const num = Number(value);
  if (!num || num < 1 || num > 5 || !appState.currentCategory) return;
  const ratings = getRatings();
  ratings[appState.currentCategory.id] = num;
  setJSON('couples_ratings_v3', ratings);
  renderCategories();
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startGame() {
  if (!appState.currentCategory) return;
  appState.currentQuestions = shuffle(appState.questions[appState.currentCategory.id] || []).slice(0, 8);
  appState.currentIndex = 0;
  appState.stats = { match: 0, mismatch: 0, skip: 0 };
  renderQuestion(true);
  pushScreen('game');
  syncRoomState({ type: 'start', category: appState.currentCategory.id, index: 0, question: appState.currentQuestions[0] });
}

function renderQuestion(initial = false) {
  const q = appState.currentQuestions[appState.currentIndex];
  appState.currentQuestion = q;
  ui.gameCategory.textContent = appState.currentCategory.id;
  ui.gameTitle.textContent = appState.currentCategory.id === 'Ритуалы' ? 'Задание' : 'Вопрос';
  ui.questionText.textContent = q || '';
  ui.progressLabel.textContent = `${appState.currentIndex + 1} / ${appState.currentQuestions.length}`;
  ui.progressFill.style.width = `${((appState.currentIndex + 1) / appState.currentQuestions.length) * 100}%`;
  resetQuestionCard();
  if (!initial) ui.questionCard.classList.add('card-enter');
  updateFavoriteButton();
}

function updateFavoriteButton() {
  const favs = getFavorites();
  const found = favs.find(item => item.question === appState.currentQuestion);
  ui.favoriteQuestionBtn.textContent = found ? '★' : '☆';
}

function toggleFavoriteQuestion() {
  if (!appState.currentQuestion) return;
  const favs = getFavorites();
  const idx = favs.findIndex(item => item.question === appState.currentQuestion);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.unshift({ category: appState.currentCategory?.id || 'Unknown', question: appState.currentQuestion, date: new Date().toLocaleDateString() });
  setFavorites(favs);
  updateFavoriteButton();
  renderFavorites();
}

function renderFavorites() {
  const favs = getFavorites();
  ui.favoritesList.innerHTML = favs.length ? favs.map(item => `<article class="favorite-item"><strong>${item.category}</strong><div>${item.question}</div><small>${item.date}</small></article>`).join('') : `<div class="history-empty">${appState.lang === 'ru' ? 'Здесь будут избранные вопросы.' : 'Your favorite questions will appear here.'}</div>`;
}

function applyAnswer(kind) {
  if (!appState.currentQuestions.length) return;
  appState.stats[kind] += 1;
  if (kind === 'match') vibrate([10, 30, 10]);
  else vibrate(12);
  syncRoomState({ type: 'answer', playerId: appState.room.playerId, answer: kind, index: appState.currentIndex, question: appState.currentQuestion });
  if (appState.currentIndex >= appState.currentQuestions.length - 1) finishGame();
  else {
    appState.currentIndex += 1;
    renderQuestion();
    syncRoomState({ type: 'next', index: appState.currentIndex, question: appState.currentQuestions[appState.currentIndex] });
  }
}

function finishGame() {
  const answered = appState.stats.match + appState.stats.mismatch;
  const score = answered ? Math.round((appState.stats.match / answered) * 100) : 0;
  ui.resultsCategory.textContent = appState.currentCategory.id;
  ui.resultsScore.textContent = `${score}%`;
  ui.resultsMessage.textContent = resultMessage(score);
  ui.statMatch.textContent = appState.stats.match;
  ui.statMismatch.textContent = appState.stats.mismatch;
  ui.statSkip.textContent = appState.stats.skip;
  renderAnalysis(score);
  saveHistoryEntry(score);
  updateAchievements(score);
  if (score === 100) launchConfetti();
  pushScreen('results');
  syncRoomState({ type: 'finish', score });
}

function resultMessage(score) {
  if (score >= 85) return appState.lang === 'ru' ? 'Вы очень тонко чувствуете друг друга.' : 'You understand each other deeply.';
  if (score >= 65) return appState.lang === 'ru' ? 'У вас много общего, но есть темы для разговора.' : 'You have a lot in common, with a few topics to discuss.';
  if (score >= 40) return appState.lang === 'ru' ? 'Есть заметные различия — честный разговор поможет.' : 'There are visible differences — an honest talk will help.';
  return appState.lang === 'ru' ? 'Пора спокойно обсудить ваши взгляды.' : 'It is time for a calm and honest conversation.';
}

function renderAnalysis(score) {
  const items = [];
  if (score >= 80) items.push(appState.lang === 'ru' ? 'У вас сильная эмоциональная синхронизация.' : 'You have a strong emotional sync.');
  if (score < 60) items.push(appState.lang === 'ru' ? 'Есть темы, которые вы проживаете по-разному.' : 'There are topics you experience differently.');
  if (appState.currentCategory.id === 'Hard Talk') items.push(appState.lang === 'ru' ? 'Вы готовы говорить о сложном — это признак зрелости.' : 'You are ready to discuss difficult things — that is mature.');
  if (appState.stats.skip >= 2) items.push(appState.lang === 'ru' ? 'Часть вопросов вы пропустили — возможно, к ним стоит вернуться позже.' : 'You skipped several questions — maybe return to them later.');
  if (appState.stats.match > appState.stats.mismatch) items.push(appState.lang === 'ru' ? 'Сильнее всего вы совпадаете в ценностях и эмоциональной реакции.' : 'Your strongest overlap is in values and emotional response.');
  if (!items.length) items.push(appState.lang === 'ru' ? 'Ваши ответы нейтральны — попробуйте ещё одну категорию.' : 'Your answers are neutral — try another category.');
  ui.analysisList.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function saveHistoryEntry(score) {
  const history = getHistory();
  history.unshift({ category: appState.currentCategory.id, score, date: new Date().toLocaleString(), anonymous: appState.anonymousMode });
  setHistory(history);
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  ui.historyList.innerHTML = history.length ? history.map(item => `<article class="history-item"><strong>${item.anonymous ? 'Anonymous' : item.category}</strong><div>${item.score}% ${appState.lang === 'ru' ? 'совместимости' : 'compatibility'}</div><small>${item.date}</small></article>`).join('') : `<div class="history-empty">${appState.lang === 'ru' ? 'Здесь появятся ваши результаты.' : 'Your results will appear here.'}</div>`;
  renderAchievements();
}

function updateAchievements(score) {
  const current = new Set(getAchievements());
  current.add('first_game');
  const history = getHistory();
  if (score === 100) current.add('perfect_match');
  if (history.length >= 5) current.add('five_games');
  if (getFavorites().length >= 3) current.add('favorite_collector');
  setAchievements([...current]);
  renderAchievements();
}

function renderAchievements() {
  const map = {
    first_game: appState.lang === 'ru' ? '🏁 Первая игра' : '🏁 First game',
    perfect_match: appState.lang === 'ru' ? '💯 Идеальное совпадение' : '💯 Perfect match',
    five_games: appState.lang === 'ru' ? '🗂 Пять игр' : '🗂 Five games',
    favorite_collector: appState.lang === 'ru' ? '⭐ Коллекционер любимых вопросов' : '⭐ Favorite collector'
  };
  const items = getAchievements();
  ui.achievementsList.innerHTML = items.length ? items.map(id => `<article class="achievement-item"><strong>${map[id] || id}</strong></article>`).join('') : `<div class="history-empty">${appState.lang === 'ru' ? 'Пока достижений нет.' : 'No achievements yet.'}</div>`;
}

function openDiscussion() {
  ui.discussionModal.classList.remove('hidden');
  let left = 120;
  ui.discussionTimer.textContent = '02:00';
  clearInterval(appState.discussionInterval);
  appState.discussionInterval = setInterval(() => {
    left -= 1;
    const min = String(Math.floor(left / 60)).padStart(2, '0');
    const sec = String(left % 60).padStart(2, '0');
    ui.discussionTimer.textContent = `${min}:${sec}`;
    if (left <= 0) {
      clearInterval(appState.discussionInterval);
      vibrate([30, 40, 30]);
    }
  }, 1000);
}

function closeDiscussion() {
  clearInterval(appState.discussionInterval);
  ui.discussionModal.classList.add('hidden');
}

function launchConfetti() {
  const wrap = document.createElement('div');
  wrap.className = 'confetti-wrap';
  document.body.appendChild(wrap);
  const colors = ['#f59e0b', '#f472b6', '#22c55e', '#60a5fa', '#ffffff', '#fde047'];
  for (let i = 0; i < 120; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-10 - Math.random() * 20}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2.4 + Math.random() * 1.6}s`;
    piece.style.animationDelay = `${Math.random() * .2}s`;
    piece.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);
    wrap.appendChild(piece);
  }
  setTimeout(() => wrap.remove(), 4500);
}

function createShareImage() {
  const canvas = ui.shareCanvas;
  const ctx = canvas.getContext('2d');
  const score = ui.resultsScore.textContent;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0, '#9f7aea');
  grad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.roundRect(80,120,920,1110,48); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 44px Inter, sans-serif';
  ctx.fillText(appState.lang === 'ru' ? 'Вопросы для двоих' : 'Couples Questions', 130, 210);
  ctx.font = '900 150px Inter, sans-serif';
  ctx.fillText(score, 130, 440);
  ctx.font = '700 54px Inter, sans-serif';
  ctx.fillText(ui.resultsCategory.textContent, 130, 540);
  ctx.font = '400 38px Inter, sans-serif';
  wrapText(ctx, ui.resultsMessage.textContent, 130, 640, 820, 54);
  const analysis = [...ui.analysisList.querySelectorAll('li')].map(li => `• ${li.textContent}`);
  ctx.font = '600 40px Inter, sans-serif';
  ctx.fillText(appState.lang === 'ru' ? 'AI-анализ пары' : 'AI couple analysis', 130, 820);
  ctx.font = '400 34px Inter, sans-serif';
  wrapText(ctx, analysis.join('\n'), 130, 890, 820, 48);
  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const paragraphs = String(text).split('\n');
  let yy = y;
  paragraphs.forEach(par => {
    const words = par.split(' ');
    let line = '';
    words.forEach(word => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, x, yy);
        yy += lineHeight;
        line = word;
      } else line = test;
    });
    if (line) { ctx.fillText(line, x, yy); yy += lineHeight; }
  });
}

async function downloadShareImage() {
  const dataUrl = createShareImage();
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'couples-result.png';
  a.click();
}

async function shareTextResult() {
  const text = `${ui.resultsCategory.textContent} — ${ui.resultsScore.textContent}\n${ui.resultsMessage.textContent}`;
  if (navigator.share) {
    try { await navigator.share({ title: t('appName'), text }); return; } catch {}
  }
  try {
    await navigator.clipboard.writeText(text);
    alert(appState.lang === 'ru' ? 'Результат скопирован.' : 'Result copied.');
  } catch { alert(text); }
}

function renderDailyQuestion() {
  const all = Object.entries(appState.questions).flatMap(([cat, arr]) => arr.map(q => ({cat, q})));
  const seed = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const index = Number(seed) % all.length;
  const item = all[index];
  alert(`${appState.lang === 'ru' ? 'Вопрос дня' : 'Question of the day'}\n\n${item.cat}\n${item.q}`);
}

function setupRoomsFromUrl() {
  const url = new URL(window.location.href);
  const room = url.searchParams.get('room');
  if (room) joinRoom(room, false);
}

function createRoom() {
  const roomId = `ROOM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  joinRoom(roomId, true);
}

function closeRoomChannel() {
  if (appState.room.bc) appState.room.bc.close();
  appState.room.bc = null;
}

function joinRoom(roomId, created = false) {
  closeRoomChannel();
  appState.room.id = roomId;
  appState.room.answers = {};
  appState.room.bc = new BroadcastChannel(`couples_room_${roomId}`);
  appState.room.bc.onmessage = (event) => handleRoomMessage(event.data);
  ui.roomStatusBox.innerHTML = `${appState.lang === 'ru' ? 'Комната' : 'Room'}: <strong>${roomId}</strong><br>${created ? (appState.lang === 'ru' ? 'Комната создана.' : 'Room created.') : (appState.lang === 'ru' ? 'Вы подключились к комнате.' : 'You joined the room.')}`;
  ui.joinRoomInput.value = roomId;
  const url = new URL(window.location.href); url.searchParams.set('room', roomId); history.replaceState({}, '', url);
  syncRoomState({ type: created ? 'created' : 'joined', playerId: appState.room.playerId });
}

function syncRoomState(payload) {
  if (!appState.room.bc || !appState.room.id) return;
  appState.room.bc.postMessage({ roomId: appState.room.id, ...payload, at: Date.now() });
}

function handleRoomMessage(msg) {
  if (!msg || msg.playerId === appState.room.playerId) return;
  const textMap = {
    created: appState.lang === 'ru' ? 'Партнёр создал комнату.' : 'Partner created the room.',
    joined: appState.lang === 'ru' ? 'Партнёр вошёл в комнату.' : 'Partner joined the room.',
    start: appState.lang === 'ru' ? `Партнёр начал категорию: ${msg.category}` : `Partner started: ${msg.category}`,
    answer: appState.lang === 'ru' ? `Партнёр ответил: ${msg.answer}` : `Partner answered: ${msg.answer}`,
    next: appState.lang === 'ru' ? 'Партнёр перешёл к следующему вопросу.' : 'Partner moved to the next question.',
    finish: appState.lang === 'ru' ? `Партнёр закончил игру. Итог: ${msg.score}%` : `Partner finished the game. Result: ${msg.score}%`
  };
  ui.roomStatusBox.innerHTML = `${appState.lang === 'ru' ? 'Комната' : 'Room'}: <strong>${appState.room.id}</strong><br>${textMap[msg.type] || '...'}<br><small>${new Date(msg.at).toLocaleTimeString()}</small>`;
}

function invitePartner() {
  if (!appState.room.id) { alert(appState.lang === 'ru' ? 'Сначала создай комнату.' : 'Create a room first.'); return; }
  const url = new URL(window.location.href); url.searchParams.set('room', appState.room.id);
  const text = `${appState.lang === 'ru' ? 'Присоединяйся к нашей комнате' : 'Join our room'}: ${appState.room.id}\n${url.toString()}`;
  if (window.Telegram?.WebApp?.switchInlineQuery) {
    try { window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url.toString())}&text=${encodeURIComponent(text)}`); return; } catch {}
  }
  if (navigator.share) { navigator.share({ title: t('appName'), text, url: url.toString() }).catch(() => {}); return; }
  navigator.clipboard.writeText(text).then(() => alert(appState.lang === 'ru' ? 'Ссылка приглашения скопирована.' : 'Invite link copied.'));
}

function showRoomStatusPopup() {
  alert(ui.roomStatusBox.textContent || (appState.lang === 'ru' ? 'Вы пока не в комнате.' : 'You are not in a room yet.'));
}

function resetQuestionCard() {
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.style.removeProperty('--swipe-opacity');
  ui.questionCard.style.transition = 'transform .25s ease, opacity .25s ease';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg)';
  ui.questionCard.style.opacity = '1';
  ui.questionCard.classList.remove('card-enter');
}

function updateSwipeHint(dx, dy = 0) {
  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : dx < 0 ? 'left' : 'none')
    : (dy < 0 ? 'up' : 'none');
  const intensity = Math.min(Math.max(Math.abs(Math.abs(dx) > Math.abs(dy) ? dx : dy) / 130, 0), 1);
  ui.questionCard.dataset.swipe = direction;
  ui.questionCard.style.setProperty('--swipe-opacity', intensity.toFixed(2));
}

function setupSwipePhysics() {
  const el = ui.questionCard;
  el.addEventListener('pointerdown', (e) => {
    if (!screens.game.classList.contains('screen-active')) return;
    swipeState.active = true;
    swipeState.pointerId = e.pointerId;
    swipeState.startX = e.clientX;
    swipeState.startY = e.clientY;
    swipeState.currentX = e.clientX;
    swipeState.currentY = e.clientY;
    el.setPointerCapture(e.pointerId);
    el.style.transition = 'none';
  });
  el.addEventListener('pointermove', (e) => {
    if (!swipeState.active || e.pointerId !== swipeState.pointerId) return;
    swipeState.currentX = e.clientX;
    swipeState.currentY = e.clientY;
    const dx = e.clientX - swipeState.startX;
    const dy = e.clientY - swipeState.startY;
    const rot = dx / 18;
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`;
    updateSwipeHint(dx, dy);
  });
  const release = (e) => {
    if (!swipeState.active || e.pointerId !== swipeState.pointerId) return;
    swipeState.active = false;
    const dx = swipeState.currentX - swipeState.startX;
    const dy = swipeState.currentY - swipeState.startY;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    el.style.transition = 'transform .22s cubic-bezier(.22,.9,.25,1), opacity .22s ease';
    if (dx > 120 && absX > absY) {
      el.style.transform = 'translate3d(140vw, 0, 0) rotate(22deg)'; el.style.opacity = '0'; updateSwipeHint(160, 0); setTimeout(() => { applyAnswer('match'); }, 180);
    } else if (dx < -120 && absX > absY) {
      el.style.transform = 'translate3d(-140vw, 0, 0) rotate(-22deg)'; el.style.opacity = '0'; updateSwipeHint(-160, 0); setTimeout(() => { applyAnswer('mismatch'); }, 180);
    } else if (dy < -120 && absY > absX) {
      el.style.transform = 'translate3d(0, -120vh, 0) rotate(0deg)'; el.style.opacity = '0'; updateSwipeHint(0, -160); setTimeout(() => { applyAnswer('skip'); }, 180);
    } else {
      resetQuestionCard();
    }
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
}

function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

async function init() {
  applyTheme(appState.theme);
  applyTranslations();
  ui.anonymousModeToggle.checked = appState.anonymousMode;
  try { appState.questions = await fetch('questions.json').then(r => r.json()); } catch (e) { alert('questions.json not found'); return; }
  renderCategories(); renderHistory(); renderFavorites(); renderAchievements();
  setupSwipePhysics(); preventDoubleTapZoom(); setupRoomsFromUrl();

  if (window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    } catch {}
  }

  appState.navStack = [appState.onboardingDone ? 'home' : 'onboarding'];
  pushScreen(appState.onboardingDone ? 'home' : 'onboarding');

  ui.backBtn.onclick = goBack;
  ui.themeBtn.onclick = () => applyTheme(appState.theme === 'light' ? 'dark' : 'light');
  ui.langBtn.onclick = () => { appState.lang = appState.lang === 'ru' ? 'en' : 'ru'; saveLS('couples_lang', appState.lang); applyTranslations(); renderHistory(); renderFavorites(); renderAchievements(); renderCategories(); };
  ui.onboardingStartBtn.onclick = () => { appState.onboardingDone = true; saveLS('couples_onboarding_done', 'yes'); pushScreen('home'); };
  ui.anonymousModeToggle.onchange = updateAnonymousMode;
  ui.startBtn.onclick = () => pushScreen('categories');
  ui.roomsBtn.onclick = () => pushScreen('rooms');
  ui.dailyBtn.onclick = renderDailyQuestion;
  ui.historyBtn.onclick = () => pushScreen('history');
  ui.favoritesBtn.onclick = () => pushScreen('favorites');
  ui.premiumBtn.onclick = () => pushScreen('premium');
  ui.matchBtn.onclick = () => applyAnswer('match');
  ui.mismatchBtn.onclick = () => applyAnswer('mismatch');
  ui.skipBtn.onclick = () => applyAnswer('skip');
  ui.discussBtn.onclick = openDiscussion;
  ui.closeDiscussionBtn.onclick = closeDiscussion;
  ui.showRoomStatusBtn.onclick = showRoomStatusPopup;
  ui.favoriteQuestionBtn.onclick = toggleFavoriteQuestion;
  ui.restartBtn.onclick = startGame;
  ui.changeCategoryBtn.onclick = () => pushScreen('categories');
  ui.shareBtn.onclick = shareTextResult;
  ui.shareImageBtn.onclick = downloadShareImage;
  ui.premiumBackBtn.onclick = goBack;
  ui.unlockPremiumBtn.onclick = () => { appState.premium = true; saveLS('couples_premium_demo', 'yes'); renderCategories(); alert(appState.lang === 'ru' ? 'Демо Premium разблокировано.' : 'Demo Premium unlocked.'); goBack(); };
  ui.createRoomBtn.onclick = createRoom;
  ui.joinRoomBtn.onclick = () => ui.joinRoomInput.value && joinRoom(ui.joinRoomInput.value.trim().toUpperCase(), false);
  ui.invitePartnerBtn.onclick = invitePartner;
  ui.adultConfirmBtn.onclick = () => { localStorage.setItem('adult_ok', 'yes'); ui.adultModal.classList.add('hidden'); const next = appState.pendingAdultCategory; appState.pendingAdultCategory = null; if (next) openCategory(next); };
  ui.adultCancelBtn.onclick = () => { appState.pendingAdultCategory = null; ui.adultModal.classList.add('hidden'); };
}

document.addEventListener('DOMContentLoaded', init);

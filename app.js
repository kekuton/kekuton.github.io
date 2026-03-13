const $ = (id) => document.getElementById(id);

const screens = {
  onboarding: $('onboardingScreen'),
  home: $('homeScreen'),
  categories: $('categoriesScreen'),
  intro: $('categoryIntroScreen'),
  game: $('gameScreen'),
  results: $('resultsScreen'),
  history: $('historyScreen'),
  room: $('roomScreen'),
  favorites: $('favoritesScreen'),
  achievements: $('achievementsScreen'),
  premium: $('premiumScreen')
};

const ui = {
  backBtn: $('backBtn'),
  langBtn: $('langBtn'),
  themeBtn: $('themeBtn'),
  brandTitle: $('brandTitle'),

  onboardingContent: $('onboardingContent'),
  onboardingSkipBtn: $('onboardingSkipBtn'),
  onboardingNextBtn: $('onboardingNextBtn'),

  homeEyebrow: $('homeEyebrow'),
  homeTitle: $('homeTitle'),
  homeSubtitle: $('homeSubtitle'),
  dailyQuestionLabel: $('dailyQuestionLabel'),
  dailyQuestionText: $('dailyQuestionText'),
  dailyOpenBtn: $('dailyOpenBtn'),
  startBtn: $('startBtn'),
  historyBtn: $('historyBtn'),
  anonymousLabel: $('anonymousLabel'),
  anonymousModeToggle: $('anonymousModeToggle'),

  roomCard: $('roomCard'),
  favoritesCard: $('favoritesCard'),
  achievementsCard: $('achievementsCard'),
  premiumCard: $('premiumCard'),
  roomTitle: $('roomTitle'),
  roomSubtitle: $('roomSubtitle'),
  favoritesTitle: $('favoritesTitle'),
  favoritesSubtitle: $('favoritesSubtitle'),
  achievementsTitle: $('achievementsTitle'),
  achievementsSubtitle: $('achievementsSubtitle'),
  premiumTitle: $('premiumTitle'),
  premiumSubtitle: $('premiumSubtitle'),

  categoriesEyebrow: $('categoriesEyebrow'),
  categoriesTitle: $('categoriesTitle'),
  categoriesSubtitle: $('categoriesSubtitle'),
  categoriesGrid: $('categoriesGrid'),
  introCard: $('categoryIntroCard'),

  gameCategory: $('gameCategory'),
  gameTitle: $('gameTitle'),
  progressLabel: $('progressLabel'),
  progressFill: $('progressFill'),
  questionCard: $('questionCard'),
  questionText: $('questionText'),
  matchBtn: $('matchBtn'),
  mismatchBtn: $('mismatchBtn'),
  skipBtn: $('skipBtn'),
  favoriteQuestionBtn: $('favoriteQuestionBtn'),
  rateCategoryBtn: $('rateCategoryBtn'),
  roomStatusPill: $('roomStatusPill'),

  resultsEyebrow: $('resultsEyebrow'),
  resultsCategory: $('resultsCategory'),
  resultsScore: $('resultsScore'),
  resultsMessage: $('resultsMessage'),
  analysisBox: $('analysisBox'),
  statMatchLabel: $('statMatchLabel'),
  statMismatchLabel: $('statMismatchLabel'),
  statSkipLabel: $('statSkipLabel'),
  statMatch: $('statMatch'),
  statMismatch: $('statMismatch'),
  statSkip: $('statSkip'),
  restartBtn: $('restartBtn'),
  changeCategoryBtn: $('changeCategoryBtn'),
  shareBtn: $('shareBtn'),
  saveCardBtn: $('saveCardBtn'),

  historyEyebrow: $('historyEyebrow'),
  historyTitle: $('historyTitle'),
  historySubtitle: $('historySubtitle'),
  historyList: $('historyList'),

  roomEyebrow: $('roomEyebrow'),
  roomScreenTitle: $('roomScreenTitle'),
  roomScreenSubtitle: $('roomScreenSubtitle'),
  roomCodeLabel: $('roomCodeLabel'),
  roomCodeValue: $('roomCodeValue'),
  createRoomBtn: $('createRoomBtn'),
  joinRoomBtn: $('joinRoomBtn'),
  invitePartnerBtn: $('invitePartnerBtn'),
  leaveRoomBtn: $('leaveRoomBtn'),
  roomMembers: $('roomMembers'),

  favoritesEyebrow: $('favoritesEyebrow'),
  favoritesScreenTitle: $('favoritesScreenTitle'),
  favoritesScreenSubtitle: $('favoritesScreenSubtitle'),
  favoritesList: $('favoritesList'),

  achievementsEyebrow: $('achievementsEyebrow'),
  achievementsScreenTitle: $('achievementsScreenTitle'),
  achievementsScreenSubtitle: $('achievementsScreenSubtitle'),
  achievementsList: $('achievementsList'),

  premiumEyebrow: $('premiumEyebrow'),
  premiumScreenTitle: $('premiumScreenTitle'),
  premiumScreenSubtitle: $('premiumScreenSubtitle'),
  premiumFeatures: $('premiumFeatures'),
  activatePremiumBtn: $('activatePremiumBtn'),
  restorePremiumBtn: $('restorePremiumBtn'),

  adultModal: $('adultModal'),
  adultTitle: $('adultTitle'),
  adultText: $('adultText'),
  adultConfirmBtn: $('adultConfirmBtn'),
  adultCancelBtn: $('adultCancelBtn'),

  promptModal: $('promptModal'),
  promptEyebrow: $('promptEyebrow'),
  promptTitle: $('promptTitle'),
  promptText: $('promptText'),
  promptInput: $('promptInput'),
  promptConfirmBtn: $('promptConfirmBtn'),
  promptCancelBtn: $('promptCancelBtn'),

  confettiCanvas: $('confettiCanvas')
};

const STORAGE_KEYS = {
  theme: 'cf_theme',
  lang: 'cf_lang',
  history: 'cf_history',
  favorites: 'cf_favorites',
  ratings: 'cf_ratings',
  premium: 'cf_premium',
  anonymous: 'cf_anonymous',
  adult: 'cf_adult_ok',
  onboarded: 'cf_onboarded',
  achievements: 'cf_achievements',
  daily: 'cf_daily_opened',
  profileName: 'cf_profile_name',
  roomCode: 'cf_room_code',
  cloudHistory: 'cf_cloud_history'
};

const CLOUD_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};

const i18n = {
  ru: {
    brand: 'Couple Flow',
    homeEyebrow: 'Mini app для двоих',
    homeTitle: 'Красиво обсуждайте важные темы и смотрите совместимость.',
    homeSubtitle: 'Категории, синхронная игра по комнате, избранное, достижения и умный анализ ваших ответов.',
    dailyQuestionLabel: 'Вопрос дня',
    dailyOpenBtn: 'Открыть',
    startBtn: 'Начать игру',
    historyBtn: 'История',
    anonymousLabel: 'Анонимный режим',
    roomTitle: 'Комната',
    roomSubtitle: 'Играть вдвоём синхронно',
    favoritesTitle: 'Любимые',
    favoritesSubtitle: 'Сохранять лучшие вопросы',
    achievementsTitle: 'Достижения',
    achievementsSubtitle: 'Парные ачивки и прогресс',
    premiumTitle: 'Premium',
    premiumSubtitle: 'Эксклюзивные категории и фишки',
    categoriesEyebrow: 'Выбор категории',
    categoriesTitle: 'Что хотите обсудить сегодня?',
    categoriesSubtitle: 'Обычные, премиум и 18+ категории. Можно играть соло или в комнате.',
    gameTitle: 'Вопрос',
    matchBtn: 'Совпало',
    mismatchBtn: 'Не совпало',
    skipBtn: 'Пропуск',
    roomStatusSolo: 'Локально',
    roomStatusConnected: 'Комната активна',
    resultsEyebrow: 'Результат',
    statMatchLabel: 'Совпало',
    statMismatchLabel: 'Не совпало',
    statSkipLabel: 'Пропуск',
    restartBtn: 'Пройти ещё раз',
    changeCategoryBtn: 'Выбрать другую',
    shareBtn: 'Поделиться',
    saveCardBtn: 'Сохранить карточку',
    historyEyebrow: 'История',
    historyTitle: 'Облачная и локальная история',
    historySubtitle: 'Результаты сохраняются локально, а при подключении backend могут храниться в облаке.',
    roomEyebrow: 'Синхронная игра',
    roomScreenTitle: 'Комната для пары',
    roomScreenSubtitle: 'Ссылка-приглашение, код комнаты и синхронизация состояния.',
    roomCodeLabel: 'Код комнаты',
    createRoomBtn: 'Создать комнату',
    joinRoomBtn: 'Войти по коду',
    invitePartnerBtn: 'Пригласить партнёра',
    leaveRoomBtn: 'Выйти из комнаты',
    favoritesEyebrow: 'Избранное',
    favoritesScreenTitle: 'Любимые вопросы',
    favoritesScreenSubtitle: 'Сюда попадают отмеченные вопросы.',
    achievementsEyebrow: 'Прогресс пары',
    achievementsScreenTitle: 'Парные достижения',
    achievementsScreenSubtitle: 'Открывайте ачивки за прохождения, room-игры и идеальные совпадения.',
    premiumEyebrow: 'Premium',
    premiumScreenTitle: 'Расширенный доступ',
    premiumScreenSubtitle: 'Демо-подписка для premium категорий и дополнительных фич.',
    activatePremiumBtn: 'Активировать демо Premium',
    restorePremiumBtn: 'Восстановить доступ',
    adultTitle: 'Подтверждение 18+',
    adultText: 'Эта категория содержит более откровенные вопросы. Продолжайте только если вам 18+.',
    adultConfirmBtn: 'Мне есть 18',
    adultCancelBtn: 'Назад',
    onboardingSkipBtn: 'Пропустить',
    onboardingNextBtn: 'Дальше',
    promptJoinTitle: 'Вход в комнату',
    promptJoinText: 'Введите код комнаты, который отправил вам партнёр.',
    promptJoinPlaceholder: 'Например: A7K2Q',
    promptConfirmJoin: 'Подключиться',
    promptCancel: 'Отмена',
    promptRateTitle: 'Оценка категории',
    promptRateText: 'Поставьте оценку категории от 1 до 5.',
    promptRatePlaceholder: '1-5',
    promptConfirmRate: 'Сохранить оценку',
    promptNameTitle: 'Ваше имя',
    promptNameText: 'Как подписывать вас в комнате? Можно ввести ник.',
    promptNamePlaceholder: 'Ваш ник',
    promptConfirmName: 'Сохранить',
    premiumRequired: 'Нужен Premium',
    premiumRequiredText: 'Эта категория доступна только в Premium-версии.',
    buyPremium: 'Открыть Premium',
    back: 'Назад',
    categoryLabel: 'Категория',
    dailyOpened: 'Сегодня уже открыт',
    saveDone: 'Сохранено',
    copied: 'Ссылка скопирована',
    roomPartnerWaiting: 'Ожидаем второго игрока',
    roomPartnerReady: 'Партнёр в комнате',
    roomAnonymous: 'Аноним',
    roomYou: 'Вы',
    roomPartner: 'Партнёр',
    roomEmpty: 'Комната пока не создана.',
    favoriteAdded: 'Вопрос добавлен в любимые',
    favoriteRemoved: 'Вопрос удалён из любимых',
    shareTitle: 'Наш результат в Couple Flow',
    scoreMessagePerfect: 'Идеальный матч — вы на одной волне.',
    scoreMessageHigh: 'Очень сильное совпадение. Вы хорошо чувствуете друг друга.',
    scoreMessageMid: 'Вы в диалоге и это хорошо. Есть темы для обсуждения.',
    scoreMessageLow: 'У вас разный взгляд на тему — это повод лучше узнать друг друга.',
    analysisTitle: 'AI-анализ пары',
    analysisA: 'Вы легко совпадаете в ключевых вопросах и быстро принимаете общие решения.',
    analysisB: 'У вас хорошая база, но видно несколько зон, которые стоит обсудить глубже.',
    analysisC: 'Пара активно исследует друг друга — отличная точка для новых разговоров.',
    analysisD: 'Сейчас ваши ответы расходятся сильнее обычного. Это шанс понять границы и желания.',
    emptyHistory: 'Пока нет сохранённых игр.',
    emptyFavorites: 'Пока нет любимых вопросов.',
    premiumActive: 'Premium уже активирован',
    cloudNote: 'Для реальной синхронизации между устройствами подключите Supabase в app.js. Сейчас работает локальная синхронизация между вкладками и браузерами одного устройства.',
    inviteText: 'Пойдём играть в Couple Flow. Подключайся в комнату',
    shareCardFooter: 'Mini app for couples',
    achievementsUnlocked: 'Достижение открыто',
    ratingSaved: 'Оценка сохранена',
    roomJoined: 'Комната подключена',
    roomCreated: 'Комната создана',
    roomLeft: 'Вы вышли из комнаты',
    networkLocal: 'Локальная синхронизация',
    networkCloud: 'Облако подключено',
    categoryScoreSuffix: 'оценка',
    premiumBadge: 'Premium',
    adultBadge: '18+',
    freeBadge: 'Free',
    playBtn: 'Новая игра',
    categoryQuestionsCount: 'вопросов',
    onboardingSlides: [
      {
        eyebrow: 'Добро пожаловать',
        title: 'Красивый mini app для двоих',
        text: 'Проходите категории вопросов, отмечайте совпадения и открывайте достижения как пара.'
      },
      {
        eyebrow: 'Комната',
        title: 'Играть можно вдвоём в реальном времени',
        text: 'Создайте комнату, отправьте ссылку партнёру и проходите категории с синхронизацией состояния.'
      },
      {
        eyebrow: 'Персонализация',
        title: 'Любимые вопросы, рейтинг и AI-анализ',
        text: 'Сохраняйте лучшие вопросы, ставьте оценки категориям и смотрите краткий анализ после игры.'
      }
    ]
  },
  en: {
    brand: 'Couple Flow',
    homeEyebrow: 'Mini app for two',
    homeTitle: 'Talk beautifully about what matters and see your compatibility.',
    homeSubtitle: 'Categories, synced room play, favorites, achievements, and smart result analysis.',
    dailyQuestionLabel: 'Question of the day',
    dailyOpenBtn: 'Open',
    startBtn: 'Start game',
    historyBtn: 'History',
    anonymousLabel: 'Anonymous mode',
    roomTitle: 'Room',
    roomSubtitle: 'Play together in sync',
    favoritesTitle: 'Favorites',
    favoritesSubtitle: 'Save the best prompts',
    achievementsTitle: 'Achievements',
    achievementsSubtitle: 'Couple milestones and progress',
    premiumTitle: 'Premium',
    premiumSubtitle: 'Exclusive categories and extras',
    categoriesEyebrow: 'Choose category',
    categoriesTitle: 'What do you want to talk about today?',
    categoriesSubtitle: 'Free, premium and 18+ categories. Play solo or inside a room.',
    gameTitle: 'Question',
    matchBtn: 'Match',
    mismatchBtn: 'Nope',
    skipBtn: 'Skip',
    roomStatusSolo: 'Local',
    roomStatusConnected: 'Room active',
    resultsEyebrow: 'Result',
    statMatchLabel: 'Match',
    statMismatchLabel: 'Mismatch',
    statSkipLabel: 'Skip',
    restartBtn: 'Play again',
    changeCategoryBtn: 'Change category',
    shareBtn: 'Share',
    saveCardBtn: 'Save card',
    historyEyebrow: 'History',
    historyTitle: 'Local and cloud history',
    historySubtitle: 'Results are stored locally and can be synced to the cloud when backend is connected.',
    roomEyebrow: 'Synchronous play',
    roomScreenTitle: 'Couple room',
    roomScreenSubtitle: 'Invite link, room code and shared state sync.',
    roomCodeLabel: 'Room code',
    createRoomBtn: 'Create room',
    joinRoomBtn: 'Join by code',
    invitePartnerBtn: 'Invite partner',
    leaveRoomBtn: 'Leave room',
    favoritesEyebrow: 'Favorites',
    favoritesScreenTitle: 'Favorite questions',
    favoritesScreenSubtitle: 'Starred questions appear here.',
    achievementsEyebrow: 'Couple progress',
    achievementsScreenTitle: 'Pair achievements',
    achievementsScreenSubtitle: 'Unlock badges for sessions, room play and perfect scores.',
    premiumEyebrow: 'Premium',
    premiumScreenTitle: 'Extended access',
    premiumScreenSubtitle: 'Demo subscription for premium categories and extra features.',
    activatePremiumBtn: 'Enable demo Premium',
    restorePremiumBtn: 'Restore access',
    adultTitle: '18+ confirmation',
    adultText: 'This category contains explicit prompts. Continue only if you are 18+.',
    adultConfirmBtn: 'I am 18+',
    adultCancelBtn: 'Back',
    onboardingSkipBtn: 'Skip',
    onboardingNextBtn: 'Next',
    promptJoinTitle: 'Join room',
    promptJoinText: 'Enter the room code sent by your partner.',
    promptJoinPlaceholder: 'Example: A7K2Q',
    promptConfirmJoin: 'Connect',
    promptCancel: 'Cancel',
    promptRateTitle: 'Rate this category',
    promptRateText: 'Give this category a rating from 1 to 5.',
    promptRatePlaceholder: '1-5',
    promptConfirmRate: 'Save rating',
    promptNameTitle: 'Your name',
    promptNameText: 'How should you appear inside the room?',
    promptNamePlaceholder: 'Your nickname',
    promptConfirmName: 'Save',
    premiumRequired: 'Premium required',
    premiumRequiredText: 'This category is available in Premium only.',
    buyPremium: 'Open Premium',
    back: 'Back',
    categoryLabel: 'Category',
    dailyOpened: 'Already opened today',
    saveDone: 'Saved',
    copied: 'Link copied',
    roomPartnerWaiting: 'Waiting for second player',
    roomPartnerReady: 'Partner is in the room',
    roomAnonymous: 'Anonymous',
    roomYou: 'You',
    roomPartner: 'Partner',
    roomEmpty: 'No room created yet.',
    favoriteAdded: 'Question added to favorites',
    favoriteRemoved: 'Question removed from favorites',
    shareTitle: 'Our Couple Flow result',
    scoreMessagePerfect: 'Perfect match — you are fully in sync.',
    scoreMessageHigh: 'Strong match. You really understand each other.',
    scoreMessageMid: 'You have a good base, with some areas to explore more.',
    scoreMessageLow: 'Different views here — a great chance to learn more about each other.',
    analysisTitle: 'AI couple analysis',
    analysisA: 'You align easily on core topics and move toward shared decisions quickly.',
    analysisB: 'There is a strong foundation, with a few areas worth discussing deeper.',
    analysisC: 'You are actively exploring each other — a good place for fresh conversations.',
    analysisD: 'Your answers diverge more than usual. This is a chance to define boundaries and desires.',
    emptyHistory: 'No saved sessions yet.',
    emptyFavorites: 'No favorite questions yet.',
    premiumActive: 'Premium is already enabled',
    cloudNote: 'For true cross-device sync, connect Supabase inside app.js. Right now local sync works between tabs and browsers on the same device.',
    inviteText: 'Let’s play Couple Flow. Join my room',
    shareCardFooter: 'Mini app for couples',
    achievementsUnlocked: 'Achievement unlocked',
    ratingSaved: 'Rating saved',
    roomJoined: 'Room connected',
    roomCreated: 'Room created',
    roomLeft: 'You left the room',
    networkLocal: 'Local sync',
    networkCloud: 'Cloud connected',
    categoryScoreSuffix: 'rating',
    premiumBadge: 'Premium',
    adultBadge: '18+',
    freeBadge: 'Free',
    playBtn: 'New game',
    categoryQuestionsCount: 'questions',
    onboardingSlides: [
      {
        eyebrow: 'Welcome',
        title: 'A polished mini app for couples',
        text: 'Play beautiful question categories, mark matches and unlock milestones together.'
      },
      {
        eyebrow: 'Room mode',
        title: 'Play together with live room sync',
        text: 'Create a room, send a link to your partner and explore categories in sync.'
      },
      {
        eyebrow: 'Personalized',
        title: 'Favorites, ratings and smart analysis',
        text: 'Save the best prompts, rate categories and read a concise analysis after each run.'
      }
    ]
  }
};

const categoryMeta = [
  { id: 'Интимные вопросы', icon: '🔞', desc: { ru: 'Откровенные вопросы для близости', en: 'Explicit prompts for closeness' }, color: 'linear-gradient(180deg,#f59e0b,#fb7185)', adult: true, premium: true },
  { id: 'На расстоянии', icon: '✈️', desc: { ru: 'Для пар в разлуке', en: 'For long-distance couples' }, color: 'linear-gradient(180deg,#38bdf8,#6366f1)' },
  { id: 'Будущее', icon: '🔮', desc: { ru: 'Планы, мечты и семья', en: 'Plans, dreams and family' }, color: 'linear-gradient(180deg,#c084fc,#ec4899)' },
  { id: 'Финансы', icon: '💰', desc: { ru: 'Деньги, цели и бюджет пары', en: 'Money, goals and budget' }, color: 'linear-gradient(180deg,#f59e0b,#f97316)' },
  { id: 'Психология', icon: '🧠', desc: { ru: 'Эмоции, доверие и границы', en: 'Emotions, trust and boundaries' }, color: 'linear-gradient(180deg,#22c55e,#14b8a6)' },
  { id: 'Воспоминания', icon: '📸', desc: { ru: 'Лучшие моменты ваших отношений', en: 'Memories from your relationship' }, color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)' },
  { id: 'Flirty Premium', icon: '💎', desc: { ru: 'Эксклюзивная колода для premium', en: 'Exclusive premium-only deck' }, color: 'linear-gradient(180deg,#111827,#4f46e5)', premium: true, custom: true }
];

const premiumQuestions = {
  'Flirty Premium': [
    'Какой идеальный романтический вечер ты бы устроил(а) для нас?',
    'Что в нашей паре делает тебя особенно уверенным(ой)?',
    'Какой новый ритуал близости ты бы хотел(а) добавить в отношения?',
    'Если бы нам подарили weekend в любой стране, куда бы ты полетел(а)?',
    'Что делает разговор между нами по-настоящему особенным?',
    'Какую мечту ты бы хотел(а) реализовать вместе в ближайший год?',
    'Какой комплимент от меня ты хотел(а) бы слышать чаще?',
    'Что ты считаешь нашей самой сильной стороной как пары?',
    'Какой совместный опыт помог бы нам стать ещё ближе?',
    'Как бы выглядел ваш идеальный день без телефонов и суеты?'
  ]
};

const achievementsMeta = [
  { id: 'first_game', icon: '🌱', title: { ru: 'Первая игра', en: 'First game' }, text: { ru: 'Завершите первую категорию', en: 'Complete your first category' } },
  { id: 'perfect_score', icon: '💯', title: { ru: 'Идеальное совпадение', en: 'Perfect score' }, text: { ru: 'Получите 100% в категории', en: 'Get 100% in a category' } },
  { id: 'room_player', icon: '🫶', title: { ru: 'Игра в комнате', en: 'Room player' }, text: { ru: 'Создайте или подключите комнату', en: 'Create or join a room' } },
  { id: 'favorite_3', icon: '⭐', title: { ru: 'Коллекционер вопросов', en: 'Question collector' }, text: { ru: 'Сохраните 3 любимых вопроса', en: 'Save 3 favorite questions' } },
  { id: 'daily_open', icon: '☀️', title: { ru: 'Вопрос дня', en: 'Daily question' }, text: { ru: 'Откройте ежедневный вопрос', en: 'Open the question of the day' } },
  { id: 'premium_open', icon: '💎', title: { ru: 'Premium inside', en: 'Premium inside' }, text: { ru: 'Активируйте Premium-режим', en: 'Activate Premium mode' } }
];

let questionsData = {};
let currentCategory = null;
let currentQuestions = [];
let currentIndex = 0;
let stats = { match: 0, mismatch: 0, skip: 0 };
let pendingAdultCategory = null;
let navStack = [];
let currentLang = 'ru';
let currentTheme = 'dark';
let currentOnboardingIndex = 0;
let currentQuestionKey = '';
let promptResolver = null;

const swipeState = {
  active: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  pointerId: null,
  lastTime: 0,
  velocityX: 0,
  velocityY: 0
};

const roomState = {
  code: null,
  userId: `u_${Math.random().toString(36).slice(2, 9)}`,
  channel: null,
  members: [],
  role: 'host',
  lastBroadcast: 0,
  cloudEnabled: Boolean(CLOUD_CONFIG.supabaseUrl && CLOUD_CONFIG.supabaseAnonKey)
};

function t(key) {
  return i18n[currentLang][key] ?? i18n.ru[key] ?? key;
}

function getText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[currentLang] ?? value.ru ?? '';
}

function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 240);
  }, 2200);
}

function showScreen(name, push = true) {
  Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
  if (push) {
    if (!navStack.length || navStack[navStack.length - 1] !== name) navStack.push(name);
  }
  ui.backBtn.classList.toggle('hidden', ['home', 'onboarding'].includes(name));
}

function goBack() {
  if (navStack.length <= 1) return;
  navStack.pop();
  const prev = navStack[navStack.length - 1];
  showScreen(prev, false);
}

function applyTheme(next) {
  currentTheme = next;
  document.body.classList.toggle('light', next === 'light');
  localStorage.setItem(STORAGE_KEYS.theme, next);
  ui.themeBtn.textContent = next === 'light' ? '☾' : '☼';
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  applyTheme(saved);
}

function applyLang(next) {
  currentLang = next;
  localStorage.setItem(STORAGE_KEYS.lang, next);
  ui.langBtn.textContent = next === 'ru' ? 'EN' : 'RU';
  renderStaticText();
  renderCategories();
  renderHistory();
  renderFavorites();
  renderAchievements();
  renderRoomScreen();
  renderPremium();
  renderDailyCard();
  if (currentCategory && screens.intro.classList.contains('screen-active')) openCategory(currentCategory.id, true);
  if (screens.results.classList.contains('screen-active')) finishGame(true);
}

function initLang() {
  const saved = localStorage.getItem(STORAGE_KEYS.lang) || 'ru';
  applyLang(saved);
}

function resultMessage(score) {
  if (score === 100) return t('scoreMessagePerfect');
  if (score >= 75) return t('scoreMessageHigh');
  if (score >= 45) return t('scoreMessageMid');
  return t('scoreMessageLow');
}

function analysisText(score) {
  if (score >= 85) return t('analysisA');
  if (score >= 65) return t('analysisB');
  if (score >= 40) return t('analysisC');
  return t('analysisD');
}

function getQuestions(categoryId) {
  return questionsData[categoryId] || [];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getHistory() {
  return loadLS(STORAGE_KEYS.history, []);
}

function saveHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  saveLS(STORAGE_KEYS.history, history.slice(0, 40));
}

function getCloudHistory() {
  return loadLS(STORAGE_KEYS.cloudHistory, []);
}

function saveCloudHistory(entry) {
  const cloud = getCloudHistory();
  cloud.unshift(entry);
  saveLS(STORAGE_KEYS.cloudHistory, cloud.slice(0, 80));
}

function getFavorites() {
  return loadLS(STORAGE_KEYS.favorites, []);
}

function setFavorites(next) {
  saveLS(STORAGE_KEYS.favorites, next);
}

function getRatings() {
  return loadLS(STORAGE_KEYS.ratings, {});
}

function setRatings(next) {
  saveLS(STORAGE_KEYS.ratings, next);
}

function isPremium() {
  return loadLS(STORAGE_KEYS.premium, false);
}

function setPremium(value) {
  saveLS(STORAGE_KEYS.premium, value);
}

function isAnonymous() {
  return loadLS(STORAGE_KEYS.anonymous, false);
}

function setAnonymous(value) {
  saveLS(STORAGE_KEYS.anonymous, value);
}

function getAchievements() {
  return loadLS(STORAGE_KEYS.achievements, []);
}

function unlockAchievement(id) {
  const unlocked = getAchievements();
  if (unlocked.includes(id)) return;
  unlocked.push(id);
  saveLS(STORAGE_KEYS.achievements, unlocked);
  const meta = achievementsMeta.find((a) => a.id === id);
  toast(`${t('achievementsUnlocked')}: ${getText(meta?.title)}`);
  renderAchievements();
}

function markDailyOpened() {
  localStorage.setItem(STORAGE_KEYS.daily, new Date().toDateString());
}

function isDailyOpened() {
  return localStorage.getItem(STORAGE_KEYS.daily) === new Date().toDateString();
}

function categoryRating(categoryId) {
  return getRatings()[categoryId] || 0;
}

function categoryBadge(meta) {
  if (meta.premium) return t('premiumBadge');
  if (meta.adult) return t('adultBadge');
  return t('freeBadge');
}

function openPrompt({ eyebrow = '', title = '', text = '', placeholder = '', confirmText = '', defaultValue = '' }) {
  ui.promptEyebrow.textContent = eyebrow;
  ui.promptTitle.textContent = title;
  ui.promptText.textContent = text;
  ui.promptInput.placeholder = placeholder;
  ui.promptInput.value = defaultValue;
  ui.promptConfirmBtn.textContent = confirmText;
  ui.promptCancelBtn.textContent = t('promptCancel');
  ui.promptModal.classList.remove('hidden');
  ui.promptInput.focus();
  return new Promise((resolve) => {
    promptResolver = resolve;
  });
}

function closePrompt(value = null) {
  ui.promptModal.classList.add('hidden');
  if (promptResolver) promptResolver(value);
  promptResolver = null;
}

function renderStaticText() {
  ui.brandTitle.textContent = t('brand');
  ui.homeEyebrow.textContent = t('homeEyebrow');
  ui.homeTitle.textContent = t('homeTitle');
  ui.homeSubtitle.textContent = t('homeSubtitle');
  ui.dailyQuestionLabel.textContent = t('dailyQuestionLabel');
  ui.dailyOpenBtn.textContent = t('dailyOpenBtn');
  ui.startBtn.textContent = t('startBtn');
  ui.historyBtn.textContent = t('historyBtn');
  ui.anonymousLabel.textContent = t('anonymousLabel');
  ui.roomTitle.textContent = t('roomTitle');
  ui.roomSubtitle.textContent = t('roomSubtitle');
  ui.favoritesTitle.textContent = t('favoritesTitle');
  ui.favoritesSubtitle.textContent = t('favoritesSubtitle');
  ui.achievementsTitle.textContent = t('achievementsTitle');
  ui.achievementsSubtitle.textContent = t('achievementsSubtitle');
  ui.premiumTitle.textContent = t('premiumTitle');
  ui.premiumSubtitle.textContent = t('premiumSubtitle');
  ui.categoriesEyebrow.textContent = t('categoriesEyebrow');
  ui.categoriesTitle.textContent = t('categoriesTitle');
  ui.categoriesSubtitle.textContent = t('categoriesSubtitle');
  ui.gameTitle.textContent = t('gameTitle');
  ui.matchBtn.textContent = t('matchBtn');
  ui.mismatchBtn.textContent = t('mismatchBtn');
  ui.skipBtn.textContent = t('skipBtn');
  ui.resultsEyebrow.textContent = t('resultsEyebrow');
  ui.statMatchLabel.textContent = t('statMatchLabel');
  ui.statMismatchLabel.textContent = t('statMismatchLabel');
  ui.statSkipLabel.textContent = t('statSkipLabel');
  ui.restartBtn.textContent = t('restartBtn');
  ui.changeCategoryBtn.textContent = t('changeCategoryBtn');
  ui.shareBtn.textContent = t('shareBtn');
  ui.saveCardBtn.textContent = t('saveCardBtn');
  ui.historyEyebrow.textContent = t('historyEyebrow');
  ui.historyTitle.textContent = t('historyTitle');
  ui.historySubtitle.textContent = t('historySubtitle');
  ui.roomEyebrow.textContent = t('roomEyebrow');
  ui.roomScreenTitle.textContent = t('roomScreenTitle');
  ui.roomScreenSubtitle.textContent = `${t('roomScreenSubtitle')} ${t('cloudNote')}`;
  ui.roomCodeLabel.textContent = t('roomCodeLabel');
  ui.createRoomBtn.textContent = t('createRoomBtn');
  ui.joinRoomBtn.textContent = t('joinRoomBtn');
  ui.invitePartnerBtn.textContent = t('invitePartnerBtn');
  ui.leaveRoomBtn.textContent = t('leaveRoomBtn');
  ui.favoritesEyebrow.textContent = t('favoritesEyebrow');
  ui.favoritesScreenTitle.textContent = t('favoritesScreenTitle');
  ui.favoritesScreenSubtitle.textContent = t('favoritesScreenSubtitle');
  ui.achievementsEyebrow.textContent = t('achievementsEyebrow');
  ui.achievementsScreenTitle.textContent = t('achievementsScreenTitle');
  ui.achievementsScreenSubtitle.textContent = t('achievementsScreenSubtitle');
  ui.premiumEyebrow.textContent = t('premiumEyebrow');
  ui.premiumScreenTitle.textContent = t('premiumScreenTitle');
  ui.premiumScreenSubtitle.textContent = t('premiumScreenSubtitle');
  ui.activatePremiumBtn.textContent = t('activatePremiumBtn');
  ui.restorePremiumBtn.textContent = t('restorePremiumBtn');
  ui.adultTitle.textContent = t('adultTitle');
  ui.adultText.textContent = t('adultText');
  ui.adultConfirmBtn.textContent = t('adultConfirmBtn');
  ui.adultCancelBtn.textContent = t('adultCancelBtn');
  renderOnboarding();
}

function renderOnboarding() {
  const slides = i18n[currentLang].onboardingSlides;
  const slide = slides[currentOnboardingIndex];
  ui.onboardingContent.innerHTML = `
    <span class="eyebrow">${slide.eyebrow}</span>
    <h1>${slide.title}</h1>
    <p>${slide.text}</p>
  `;
  const dots = screens.onboarding.querySelectorAll('.onboarding-progress span');
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentOnboardingIndex));
  ui.onboardingSkipBtn.textContent = currentOnboardingIndex === slides.length - 1 ? t('startBtn') : t('onboardingSkipBtn');
  ui.onboardingNextBtn.textContent = currentOnboardingIndex === slides.length - 1 ? t('startBtn') : t('onboardingNextBtn');
}

function finishOnboarding() {
  localStorage.setItem(STORAGE_KEYS.onboarded, 'yes');
  navStack = ['home'];
  showScreen('home', false);
}

function initOnboarding() {
  if (localStorage.getItem(STORAGE_KEYS.onboarded) === 'yes') {
    navStack = ['home'];
    showScreen('home', false);
  } else {
    navStack = ['onboarding'];
    showScreen('onboarding', false);
  }
}

function renderCategories() {
  ui.categoriesGrid.innerHTML = categoryMeta.map((meta) => {
    const count = getQuestions(meta.id).length;
    const rating = categoryRating(meta.id);
    return `
      <button class="category-card" data-id="${meta.id}" style="background:${meta.color}">
        <div class="category-card-top">
          <div class="category-icon">${meta.icon}</div>
          <span class="category-badge">${categoryBadge(meta)}</span>
        </div>
        <div>
          <h3>${meta.id}</h3>
          <p>${getText(meta.desc)}</p>
        </div>
        <div class="category-foot">
          <span class="category-count">${count} ${t('categoryQuestionsCount')}</span>
          <span class="category-rating">★ ${rating || '—'}</span>
        </div>
      </button>
    `;
  }).join('');

  ui.categoriesGrid.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => openCategory(card.dataset.id));
  });
}

function renderDailyCard() {
  const pool = Object.entries(questionsData).flatMap(([cat, items]) => items.slice(0, 5).map((q) => ({ cat, q })));
  if (!pool.length) return;
  const dayIndex = Math.abs(Math.floor((Date.now() / 86400000))) % pool.length;
  const daily = pool[dayIndex];
  ui.dailyQuestionText.textContent = daily.q;
  ui.dailyCard.dataset.categoryId = daily.cat;
  ui.dailyOpenBtn.disabled = false;
  if (isDailyOpened()) ui.dailyOpenBtn.textContent = t('dailyOpened');
  else ui.dailyOpenBtn.textContent = t('dailyOpenBtn');
}

function currentProfileName() {
  const saved = localStorage.getItem(STORAGE_KEYS.profileName);
  if (saved) return saved;
  return isAnonymous() ? t('roomAnonymous') : t('roomYou');
}

async function ensureProfileName() {
  if (localStorage.getItem(STORAGE_KEYS.profileName)) return localStorage.getItem(STORAGE_KEYS.profileName);
  const value = await openPrompt({
    eyebrow: t('roomTitle'),
    title: t('promptNameTitle'),
    text: t('promptNameText'),
    placeholder: t('promptNamePlaceholder'),
    confirmText: t('promptConfirmName'),
    defaultValue: isAnonymous() ? t('roomAnonymous') : ''
  });
  const name = (value || '').trim() || (isAnonymous() ? t('roomAnonymous') : t('roomYou'));
  localStorage.setItem(STORAGE_KEYS.profileName, name);
  return name;
}

function openCategory(categoryId, skipScreenPush = false) {
  const meta = categoryMeta.find((c) => c.id === categoryId);
  if (!meta) return;
  if (meta.premium && !isPremium()) {
    toast(t('premiumRequired'));
    showScreen('premium');
    return;
  }
  if (meta.adult && localStorage.getItem(STORAGE_KEYS.adult) !== 'yes') {
    pendingAdultCategory = categoryId;
    ui.adultModal.classList.remove('hidden');
    return;
  }

  currentCategory = meta;
  const total = getQuestions(meta.id).length;
  ui.introCard.innerHTML = `
    <div class="intro-illu">${meta.icon}</div>
    <span class="eyebrow">${categoryBadge(meta)}</span>
    <h2>${meta.id}</h2>
    <p class="intro-subtext">${getText(meta.desc)}</p>
    <p class="intro-subtext">${total} ${t('categoryQuestionsCount')} · ★ ${categoryRating(meta.id) || '—'} ${t('categoryScoreSuffix')}</p>
    <div class="hero-actions stacked">
      <button class="primary-btn" id="playCategoryBtn">${t('playBtn')}</button>
      <button class="secondary-btn" id="backToCategoriesBtn">${t('back')}</button>
    </div>
  `;
  showScreen('intro', !skipScreenPush);
  $('playCategoryBtn').addEventListener('click', startGame);
  $('backToCategoriesBtn').addEventListener('click', goBack);
}

function buildQuestionKey(categoryId, question) {
  return `${categoryId}::${question}`;
}

function renderFavoriteState() {
  const favorites = getFavorites();
  const isFav = favorites.some((f) => f.key === currentQuestionKey);
  ui.favoriteQuestionBtn.textContent = isFav ? '★' : '☆';
}

function updateRoomStatusPill() {
  ui.roomStatusPill.textContent = roomState.code ? t('roomStatusConnected') : t('roomStatusSolo');
}

function startGame() {
  const all = shuffle(getQuestions(currentCategory.id));
  currentQuestions = all.slice(0, Math.min(8, all.length));
  currentIndex = 0;
  stats = { match: 0, mismatch: 0, skip: 0 };
  resetQuestionCard();
  renderQuestion(true);
  broadcastRoomState();
  showScreen('game');
}

function renderQuestion(isInitial = false) {
  const total = currentQuestions.length;
  const q = currentQuestions[currentIndex];
  currentQuestionKey = buildQuestionKey(currentCategory.id, q);
  ui.gameCategory.textContent = currentCategory.id;
  ui.questionText.textContent = q;
  ui.progressLabel.textContent = `${currentIndex + 1} / ${total}`;
  ui.progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.style.setProperty('--swipe-opacity', '0');
  ui.questionCard.style.transition = 'none';
  ui.questionCard.style.transform = isInitial ? 'translate3d(0,0,0) scale(1)' : 'translate3d(0,26px,0) scale(.96)';
  ui.questionCard.style.opacity = isInitial ? '1' : '0';
  renderFavoriteState();
  updateRoomStatusPill();
  requestAnimationFrame(() => {
    ui.questionCard.style.transition = 'transform 320ms cubic-bezier(.18,.9,.2,1), opacity 260ms ease';
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
  swipeState.pointerId = null;
  ui.questionCard.dataset.swipe = 'none';
  ui.questionCard.style.setProperty('--swipe-opacity', '0');
  ui.questionCard.style.transition = '';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
  ui.questionCard.style.opacity = '1';
}

function vibrate(pattern = 10) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function animateSwipeOut(type, callback) {
  const map = {
    match: { x: window.innerWidth * 1.15, y: -18, r: 18 },
    mismatch: { x: -window.innerWidth * 1.15, y: -18, r: -18 },
    skip: { x: 0, y: -window.innerHeight * 0.75, r: 0 }
  };
  const cfg = map[type];
  ui.questionCard.style.transition = 'transform 340ms cubic-bezier(.18,.9,.2,1), opacity 260ms ease';
  ui.questionCard.style.opacity = '0';
  ui.questionCard.style.transform = `translate3d(${cfg.x}px, ${cfg.y}px, 0) rotate(${cfg.r}deg) scale(.95)`;
  setTimeout(callback, 280);
}

function completeAnswer(type) {
  stats[type] += 1;
  currentIndex += 1;
  resetQuestionCard();
  broadcastRoomState();
  if (currentIndex >= currentQuestions.length) finishGame();
  else renderQuestion();
}

function answer(type) {
  if (!['match', 'mismatch', 'skip'].includes(type)) return;
  vibrate(type === 'skip' ? [6, 30, 6] : 12);
  animateSwipeOut(type, () => completeAnswer(type));
}

function finishGame(refreshOnly = false) {
  const answered = stats.match + stats.mismatch;
  const score = answered ? Math.round((stats.match / answered) * 100) : 0;
  ui.resultsCategory.textContent = currentCategory.id;
  ui.resultsScore.textContent = `${score}%`;
  ui.resultsMessage.textContent = resultMessage(score);
  ui.analysisBox.innerHTML = `<strong>${t('analysisTitle')}</strong><p>${analysisText(score)}</p>`;
  ui.statMatch.textContent = stats.match;
  ui.statMismatch.textContent = stats.mismatch;
  ui.statSkip.textContent = stats.skip;

  if (!refreshOnly) {
    const entry = {
      category: currentCategory.id,
      score,
      match: stats.match,
      mismatch: stats.mismatch,
      skip: stats.skip,
      roomCode: roomState.code,
      date: new Date().toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      })
    };
    saveHistory(entry);
    saveCloudHistory(entry);
    if (score === 100 && stats.match > 0) {
      vibrate([40, 40, 60]);
      launchConfetti();
      unlockAchievement('perfect_score');
    }
    unlockAchievement('first_game');
    renderHistory();
    broadcastRoomState({ finished: true, score });
  }
  showScreen('results', !refreshOnly);
}

function generateShareText() {
  return `${t('shareTitle')}\n${currentCategory.id}: ${ui.resultsScore.textContent}\n${t('statMatchLabel')}: ${stats.match} · ${t('statMismatchLabel')}: ${stats.mismatch}`;
}

async function shareResult() {
  const text = generateShareText();
  const roomNote = roomState.code ? `\nRoom: ${roomState.code}` : '';
  const finalText = `${text}${roomNote}`;
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(finalText)}`);
      return;
    }
  } catch {}
  if (navigator.share) {
    try {
      await navigator.share({ title: t('shareTitle'), text: finalText });
      return;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(finalText);
    toast(t('copied'));
  } catch {
    alert(finalText);
  }
}

async function saveShareCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 1080, 1350);
  grd.addColorStop(0, '#8b5cf6');
  grd.addColorStop(1, '#4f46e5');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, 70, 90, 940, 1170, 48, true);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 42px Inter';
  ctx.fillText(t('shareTitle'), 120, 180);
  ctx.font = '900 150px Inter';
  ctx.fillText(ui.resultsScore.textContent, 120, 410);
  ctx.font = '700 54px Inter';
  wrapText(ctx, currentCategory.id, 120, 500, 840, 68);
  ctx.font = '500 36px Inter';
  wrapText(ctx, ui.resultsMessage.textContent, 120, 650, 820, 50);
  ctx.font = '700 34px Inter';
  ctx.fillText(`${t('statMatchLabel')}: ${stats.match}`, 120, 840);
  ctx.fillText(`${t('statMismatchLabel')}: ${stats.mismatch}`, 120, 900);
  ctx.fillText(`${t('statSkipLabel')}: ${stats.skip}`, 120, 960);
  ctx.font = '500 28px Inter';
  ctx.fillText(t('shareCardFooter'), 120, 1160);

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'couple-flow-card.png';
  link.click();
  toast(t('saveDone'));
}

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n += 1) {
    const testLine = `${line}${words[n]} `;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = `${words[n]} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function renderHistory() {
  const merged = [...getCloudHistory(), ...getHistory()].slice(0, 20);
  if (!merged.length) {
    ui.historyList.innerHTML = `<div class="history-empty">${t('emptyHistory')}</div>`;
    return;
  }
  ui.historyList.innerHTML = merged.map((item) => `
    <article class="history-item">
      <div class="history-item-head">
        <strong>${item.category}</strong>
        <span>${item.score}%</span>
      </div>
      <div class="history-meta">${item.date}${item.roomCode ? ` · room ${item.roomCode}` : ''}</div>
      <div class="history-badges">
        <span>${t('statMatchLabel')}: ${item.match ?? '—'}</span>
        <span>${t('statMismatchLabel')}: ${item.mismatch ?? '—'}</span>
      </div>
    </article>
  `).join('');
}

function toggleFavoriteQuestion() {
  if (!currentQuestionKey) return;
  let favorites = getFavorites();
  const exists = favorites.find((f) => f.key === currentQuestionKey);
  if (exists) {
    favorites = favorites.filter((f) => f.key !== currentQuestionKey);
    toast(t('favoriteRemoved'));
  } else {
    favorites.unshift({ key: currentQuestionKey, category: currentCategory.id, question: currentQuestions[currentIndex] });
    toast(t('favoriteAdded'));
  }
  setFavorites(favorites.slice(0, 80));
  renderFavoriteState();
  renderFavorites();
  if (getFavorites().length >= 3) unlockAchievement('favorite_3');
}

function renderFavorites() {
  const favorites = getFavorites();
  if (!favorites.length) {
    ui.favoritesList.innerHTML = `<div class="history-empty">${t('emptyFavorites')}</div>`;
    return;
  }
  ui.favoritesList.innerHTML = favorites.map((item) => `
    <article class="list-card">
      <small>${item.category}</small>
      <strong>${item.question}</strong>
    </article>
  `).join('');
}

async function rateCurrentCategory() {
  if (!currentCategory) return;
  const value = await openPrompt({
    eyebrow: currentCategory.id,
    title: t('promptRateTitle'),
    text: t('promptRateText'),
    placeholder: t('promptRatePlaceholder'),
    confirmText: t('promptConfirmRate'),
    defaultValue: categoryRating(currentCategory.id) ? String(categoryRating(currentCategory.id)) : ''
  });
  if (value == null) return;
  const parsed = Math.max(1, Math.min(5, Number(value) || 0));
  if (!parsed) return;
  const ratings = getRatings();
  ratings[currentCategory.id] = parsed;
  setRatings(ratings);
  renderCategories();
  toast(t('ratingSaved'));
}

function renderAchievements() {
  const unlocked = getAchievements();
  ui.achievementsList.innerHTML = achievementsMeta.map((item) => {
    const open = unlocked.includes(item.id);
    return `
      <article class="achievement-card ${open ? 'open' : ''}">
        <div class="achievement-icon">${item.icon}</div>
        <strong>${getText(item.title)}</strong>
        <small>${getText(item.text)}</small>
      </article>
    `;
  }).join('');
}

function renderPremium() {
  const active = isPremium();
  ui.premiumFeatures.innerHTML = `
    <article class="list-card"><strong>Premium categories</strong><small>18+ и эксклюзивные колоды</small></article>
    <article class="list-card"><strong>Beautiful share-card</strong><small>Сохранение результата в PNG</small></article>
    <article class="list-card"><strong>Room extras</strong><small>Приоритетные фичи для комнаты и будущей cloud-sync</small></article>
    <article class="list-card"><strong>${active ? t('premiumActive') : t('cloudNote')}</strong></article>
  `;
}

function launchConfetti() {
  const canvas = ui.confettiCanvas;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.3,
    size: 6 + Math.random() * 8,
    vx: -3 + Math.random() * 6,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI * 2,
    vr: -0.2 + Math.random() * 0.4,
    color: ['#fde047', '#f472b6', '#60a5fa', '#34d399', '#ffffff'][Math.floor(Math.random() * 5)]
  }));

  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  canvas.classList.add('show');

  let frame = 0;
  function tick() {
    frame += 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.2);
      ctx.restore();
    });
    if (frame < 240) requestAnimationFrame(tick);
    else {
      canvas.classList.remove('show');
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
  tick();
}

function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

function onPointerDown(e) {
  if (!screens.game.classList.contains('screen-active')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  swipeState.active = true;
  swipeState.pointerId = e.pointerId;
  swipeState.startX = e.clientX;
  swipeState.startY = e.clientY;
  swipeState.currentX = e.clientX;
  swipeState.currentY = e.clientY;
  swipeState.lastTime = performance.now();
  swipeState.velocityX = 0;
  swipeState.velocityY = 0;
  ui.questionCard.setPointerCapture?.(e.pointerId);
  ui.questionCard.style.transition = 'none';
}

function onPointerMove(e) {
  if (!swipeState.active || swipeState.pointerId !== e.pointerId) return;
  const now = performance.now();
  const dt = Math.max(8, now - swipeState.lastTime);
  swipeState.velocityX = (e.clientX - swipeState.currentX) / dt;
  swipeState.velocityY = (e.clientY - swipeState.currentY) / dt;
  swipeState.lastTime = now;
  swipeState.currentX = e.clientX;
  swipeState.currentY = e.clientY;

  const deltaX = swipeState.currentX - swipeState.startX;
  const deltaY = swipeState.currentY - swipeState.startY;
  const rotate = deltaX / 16;
  const scale = 1 - Math.min(Math.abs(deltaX) / 1400, 0.04);
  ui.questionCard.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.16}px, 0) rotate(${rotate}deg) scale(${scale})`;
  updateSwipeHint(deltaX);
}

function onPointerUp(e) {
  if (!swipeState.active || swipeState.pointerId !== e.pointerId) return;
  swipeState.active = false;
  ui.questionCard.releasePointerCapture?.(e.pointerId);
  const deltaX = swipeState.currentX - swipeState.startX;
  const deltaY = swipeState.currentY - swipeState.startY;
  const flingX = deltaX + swipeState.velocityX * 220;
  const flingY = deltaY + swipeState.velocityY * 220;
  const threshold = Math.min(110, window.innerWidth * 0.24);

  if (flingX > threshold) return answer('match');
  if (flingX < -threshold) return answer('mismatch');
  if (flingY < -130 && Math.abs(flingX) < 120) return answer('skip');

  ui.questionCard.style.transition = 'transform 220ms cubic-bezier(.18,.9,.2,1)';
  ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
  updateSwipeHint(0);
}

function attachSwipeHandlers() {
  ui.questionCard.addEventListener('pointerdown', onPointerDown);
  ui.questionCard.addEventListener('pointermove', onPointerMove);
  ui.questionCard.addEventListener('pointerup', onPointerUp);
  ui.questionCard.addEventListener('pointercancel', onPointerUp);
}

function roomStorageKey(code) {
  return `cf_room_${code}`;
}

function readRoomData(code) {
  return loadLS(roomStorageKey(code), null);
}

function writeRoomData(code, data) {
  saveLS(roomStorageKey(code), data);
}

function randomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

function currentMemberPayload() {
  return {
    id: roomState.userId,
    name: currentProfileName(),
    joinedAt: Date.now(),
    anonymous: isAnonymous()
  };
}

function openRoomChannel(code) {
  roomState.channel?.close?.();
  roomState.channel = new BroadcastChannel(`cf_room_channel_${code}`);
  roomState.channel.onmessage = (event) => {
    if (event.data?.type === 'room-sync') syncRoomFromPayload(event.data.payload, false);
  };
}

function createRoomData(code) {
  return {
    code,
    createdAt: Date.now(),
    hostId: roomState.userId,
    members: [currentMemberPayload()],
    game: null,
    syncSource: roomState.cloudEnabled ? t('networkCloud') : t('networkLocal')
  };
}

function syncRoomFromPayload(payload, shouldPersist = true) {
  if (!payload) return;
  roomState.members = payload.members || [];
  roomState.code = payload.code;
  if (shouldPersist) writeRoomData(payload.code, payload);
  localStorage.setItem(STORAGE_KEYS.roomCode, payload.code);
  updateRoomMembers(payload);
  updateRoomStatusPill();
  renderRoomScreen();

  if (payload.game && payload.game.categoryId && screens.game.classList.contains('screen-active') === false && screens.results.classList.contains('screen-active') === false) {
    const meta = categoryMeta.find((c) => c.id === payload.game.categoryId);
    if (meta) {
      currentCategory = meta;
      currentQuestions = payload.game.questions;
      currentIndex = payload.game.index;
      stats = payload.game.stats;
      if (payload.game.finished) finishGame(true);
      else {
        renderQuestion(true);
        showScreen('game');
      }
    }
  }
}

function broadcastRoomState(extra = {}) {
  if (!roomState.code) return;
  const room = readRoomData(roomState.code) || createRoomData(roomState.code);
  room.members = mergeMembers(room.members || [], currentMemberPayload());
  room.game = currentCategory ? {
    categoryId: currentCategory.id,
    questions: currentQuestions,
    index: currentIndex,
    stats,
    finished: Boolean(extra.finished),
    score: extra.score ?? null
  } : room.game;
  writeRoomData(roomState.code, room);
  roomState.channel?.postMessage({ type: 'room-sync', payload: room });
  syncRoomFromPayload(room, false);
}

function mergeMembers(existing, me) {
  const next = existing.filter((m) => m.id !== me.id);
  next.push(me);
  return next.slice(0, 2);
}

function updateRoomMembers(room) {
  const members = room?.members || [];
  if (!members.length) {
    ui.roomMembers.innerHTML = `<div class="history-empty">${t('roomEmpty')}</div>`;
    return;
  }
  ui.roomMembers.innerHTML = members.map((member) => `
    <div class="room-member">
      <span class="room-avatar">${member.name?.[0]?.toUpperCase() || '•'}</span>
      <div>
        <strong>${member.id === roomState.userId ? `${member.name} (${t('roomYou')})` : member.name}</strong>
        <small>${member.id === roomState.userId ? t('networkLocal') : t('roomPartnerReady')}</small>
      </div>
    </div>
  `).join('');
}

function renderRoomScreen() {
  ui.roomCodeValue.textContent = roomState.code || '—';
  ui.leaveRoomBtn.classList.toggle('hidden', !roomState.code);
  const room = roomState.code ? readRoomData(roomState.code) : null;
  updateRoomMembers(room);
}

async function createRoom() {
  await ensureProfileName();
  const code = randomCode();
  roomState.code = code;
  const payload = createRoomData(code);
  writeRoomData(code, payload);
  openRoomChannel(code);
  syncRoomFromPayload(payload, false);
  unlockAchievement('room_player');
  toast(t('roomCreated'));
}

async function joinRoom() {
  await ensureProfileName();
  const code = await openPrompt({
    eyebrow: t('roomTitle'),
    title: t('promptJoinTitle'),
    text: t('promptJoinText'),
    placeholder: t('promptJoinPlaceholder'),
    confirmText: t('promptConfirmJoin'),
    defaultValue: ''
  });
  if (!code) return;
  const clean = String(code).trim().toUpperCase();
  let room = readRoomData(clean);
  if (!room) {
    room = createRoomData(clean);
  }
  room.members = mergeMembers(room.members || [], currentMemberPayload());
  writeRoomData(clean, room);
  roomState.code = clean;
  openRoomChannel(clean);
  syncRoomFromPayload(room, false);
  unlockAchievement('room_player');
  toast(t('roomJoined'));
}

async function invitePartner() {
  if (!roomState.code) {
    toast(t('roomEmpty'));
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomState.code);
  const text = `${t('inviteText')} ${roomState.code}\n${url.toString()}`;
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url.toString())}&text=${encodeURIComponent(text)}`);
      return;
    }
  } catch {}
  if (navigator.share) {
    try {
      await navigator.share({ title: t('roomTitle'), text, url: url.toString() });
      return;
    } catch {}
  }
  await navigator.clipboard.writeText(url.toString());
  toast(t('copied'));
}

function leaveRoom() {
  if (!roomState.code) return;
  const room = readRoomData(roomState.code);
  if (room) {
    room.members = (room.members || []).filter((m) => m.id !== roomState.userId);
    writeRoomData(roomState.code, room);
    roomState.channel?.postMessage({ type: 'room-sync', payload: room });
  }
  roomState.channel?.close?.();
  roomState.channel = null;
  roomState.code = null;
  roomState.members = [];
  localStorage.removeItem(STORAGE_KEYS.roomCode);
  renderRoomScreen();
  updateRoomStatusPill();
  toast(t('roomLeft'));
}

function attachStorageSync() {
  window.addEventListener('storage', (event) => {
    if (!roomState.code) return;
    if (event.key === roomStorageKey(roomState.code) && event.newValue) {
      syncRoomFromPayload(JSON.parse(event.newValue), false);
    }
  });
}

function parseRoomFromUrl() {
  const room = new URLSearchParams(window.location.search).get('room');
  if (room) {
    roomState.code = room.toUpperCase();
    openRoomChannel(roomState.code);
    const data = readRoomData(roomState.code) || createRoomData(roomState.code);
    data.members = mergeMembers(data.members || [], currentMemberPayload());
    writeRoomData(roomState.code, data);
    syncRoomFromPayload(data, false);
  } else {
    const saved = localStorage.getItem(STORAGE_KEYS.roomCode);
    if (saved) {
      roomState.code = saved;
      openRoomChannel(saved);
      const data = readRoomData(saved);
      if (data) syncRoomFromPayload(data, false);
    }
  }
}

function initTelegram() {
  if (!(window.Telegram && window.Telegram.WebApp)) return;
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  try {
    if (tg.initDataUnsafe?.user && !localStorage.getItem(STORAGE_KEYS.profileName)) {
      const user = tg.initDataUnsafe.user;
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || currentProfileName();
      localStorage.setItem(STORAGE_KEYS.profileName, name);
    }
  } catch {}
}

async function loadQuestions() {
  questionsData = await fetch('questions.json').then((r) => r.json());
  Object.assign(questionsData, premiumQuestions);
}

function checkAchievementsFromState() {
  if (getFavorites().length >= 3) unlockAchievement('favorite_3');
  if (isDailyOpened()) unlockAchievement('daily_open');
  if (isPremium()) unlockAchievement('premium_open');
}

function openDailyQuestion() {
  const categoryId = ui.dailyCard.dataset.categoryId;
  if (!categoryId) return;
  markDailyOpened();
  unlockAchievement('daily_open');
  renderDailyCard();
  openCategory(categoryId);
}

function bindEvents() {
  ui.backBtn.addEventListener('click', goBack);
  ui.langBtn.addEventListener('click', () => applyLang(currentLang === 'ru' ? 'en' : 'ru'));
  ui.themeBtn.addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));
  ui.startBtn.addEventListener('click', () => showScreen('categories'));
  ui.historyBtn.addEventListener('click', () => showScreen('history'));
  ui.dailyOpenBtn.addEventListener('click', openDailyQuestion);
  ui.roomCard.addEventListener('click', () => showScreen('room'));
  ui.favoritesCard.addEventListener('click', () => showScreen('favorites'));
  ui.achievementsCard.addEventListener('click', () => showScreen('achievements'));
  ui.premiumCard.addEventListener('click', () => showScreen('premium'));
  ui.anonymousModeToggle.addEventListener('change', (e) => setAnonymous(e.target.checked));

  ui.matchBtn.addEventListener('click', () => answer('match'));
  ui.mismatchBtn.addEventListener('click', () => answer('mismatch'));
  ui.skipBtn.addEventListener('click', () => answer('skip'));
  ui.favoriteQuestionBtn.addEventListener('click', toggleFavoriteQuestion);
  ui.rateCategoryBtn.addEventListener('click', rateCurrentCategory);

  ui.restartBtn.addEventListener('click', startGame);
  ui.changeCategoryBtn.addEventListener('click', () => showScreen('categories'));
  ui.shareBtn.addEventListener('click', shareResult);
  ui.saveCardBtn.addEventListener('click', saveShareCard);

  ui.createRoomBtn.addEventListener('click', createRoom);
  ui.joinRoomBtn.addEventListener('click', joinRoom);
  ui.invitePartnerBtn.addEventListener('click', invitePartner);
  ui.leaveRoomBtn.addEventListener('click', leaveRoom);

  ui.activatePremiumBtn.addEventListener('click', () => {
    setPremium(true);
    renderPremium();
    renderCategories();
    unlockAchievement('premium_open');
    toast(t('premiumActive'));
  });
  ui.restorePremiumBtn.addEventListener('click', () => {
    renderPremium();
    toast(isPremium() ? t('premiumActive') : t('cloudNote'));
  });

  ui.adultConfirmBtn.addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEYS.adult, 'yes');
    ui.adultModal.classList.add('hidden');
    if (pendingAdultCategory) openCategory(pendingAdultCategory);
  });
  ui.adultCancelBtn.addEventListener('click', () => {
    ui.adultModal.classList.add('hidden');
    pendingAdultCategory = null;
  });

  ui.promptConfirmBtn.addEventListener('click', () => closePrompt(ui.promptInput.value));
  ui.promptCancelBtn.addEventListener('click', () => closePrompt(null));
  ui.promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') closePrompt(ui.promptInput.value);
  });

  ui.onboardingSkipBtn.addEventListener('click', finishOnboarding);
  ui.onboardingNextBtn.addEventListener('click', () => {
    const slides = i18n[currentLang].onboardingSlides;
    if (currentOnboardingIndex >= slides.length - 1) finishOnboarding();
    else {
      currentOnboardingIndex += 1;
      renderOnboarding();
    }
  });
}

async function init() {
  await loadQuestions();
  initTheme();
  initLang();
  initTelegram();
  preventDoubleTapZoom();
  bindEvents();
  attachSwipeHandlers();
  attachStorageSync();
  parseRoomFromUrl();
  ui.anonymousModeToggle.checked = isAnonymous();
  renderCategories();
  renderHistory();
  renderFavorites();
  renderAchievements();
  renderPremium();
  renderDailyCard();
  renderRoomScreen();
  checkAchievementsFromState();
  initOnboarding();
}

document.addEventListener('DOMContentLoaded', init);

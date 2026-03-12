// script.js — полностью исправленная версия

const DEBUG = false;
const debug = (...args) => {
    if (DEBUG) console.log('[DEBUG]', ...args);
};

// ===== Безопасный звук / вибрация =====
function playSound(type = 'click') {
    try {
        if (navigator.vibrate) {
            if (type === 'swipe') navigator.vibrate(10);
            else navigator.vibrate(16);
        }
    } catch (e) {
        // ignore
    }
}

// ===== Telegram Mini App integration =====
function initTelegramWebApp() {
    try {
        if (!window.Telegram || !window.Telegram.WebApp) return;

        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        if (tg.setHeaderColor) tg.setHeaderColor('#667eea');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#0f172a');

        if (tg.BackButton) {
            tg.BackButton.hide();
            tg.BackButton.onClick(() => {
                if (resultsScreen?.classList.contains('show') || questionsScreen?.classList.contains('active')) {
                    backToMain();
                }
            });
        }

        debug('Telegram WebApp initialized');
    } catch (e) {
        console.error('Telegram WebApp init error:', e);
    }
}

function syncTelegramBackButton() {
    try {
        if (!window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.BackButton) return;
        const backButton = window.Telegram.WebApp.BackButton;
        const shouldShow = (questionsScreen?.classList.contains('active')) || (resultsScreen?.classList.contains('show'));
        if (shouldShow) backButton.show();
        else backButton.hide();
    } catch (e) {
        // ignore
    }
}

// ===== Загрузка вопросов =====
async function loadQuestions() {
    try {
        const res = await fetch('questions.json', { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        window.questionsData = await res.json();
        return true;
    } catch (err) {
        console.error('Не удалось загрузить questions.json:', err);
        alert('Ошибка загрузки вопросов (questions.json). Открой проект через сервер или Telegram Mini App.');
        return false;
    }
}

// ===== Конфигурация категорий =====
const categories = [
    { id: 'Интимные вопросы', name: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы для близости' },
    { id: 'На расстоянии', name: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке' },
    { id: 'Будущее', name: 'Будущее', icon: '🔮', desc: 'Планы и мечты' },
    { id: 'Финансы', name: 'Финансы', icon: '💰', desc: 'Вопросы о деньгах' },
    { id: 'Психология', name: 'Психология', icon: '🧠', desc: 'Глубокие вопросы' },
    { id: 'Воспоминания', name: 'Воспоминания', icon: '📸', desc: 'О вашем прошлом' },
    { id: 'Флаги', name: 'Флаги', icon: '🚩', desc: 'Здоровые отношения' },
    { id: 'Тимбилдинг', name: 'Тимбилдинг', icon: '👥', desc: 'Веселые вопросы' },
    { id: 'Блиц', name: 'Блиц', icon: '⚡', desc: 'Быстрые вопросы на время' }
];

function buildRandomPool() {
    randomPool = [];
    for (const cat of categories.filter(c => c.id !== 'Блиц')) {
        const qs = getQuestions(cat.id);
        if (!qs?.length) continue;
        for (const q of qs) {
            randomPool.push({ categoryId: cat.id, categoryName: cat.name, question: q });
        }
    }
    debug('Random pool size:', randomPool.length);
}

function getQuestions(categoryId) {
    return (window.questionsData && window.questionsData[categoryId]) ? window.questionsData[categoryId] : [];
}

const MAX_PROGRESS_DOTS = 12;

// ===== Состояние приложения =====
let currentCategoryIndex = 0;
let currentQuestionIndex = 0;
let selectedCategory = null;
let mode = 'category'; // category | random | blitz
let sessionStats = null;
let randomPool = [];
let randomStats = { matches: 0, mismatches: 0, skipped: 0, totalShown: 0 };
let lastRandomItem = null;

// blitz
let blitzTimer = null;
let timeLeft = 30;
let blitzCorrectAnswers = 0;
let blitzTotalAnswered = 0;
let blitzCurrentIndex = 0;

// ===== DOM =====
const categoriesScreen = document.getElementById('categoriesScreen');
const questionsScreen = document.getElementById('questionsScreen');
const resultsScreen = document.getElementById('resultsScreen');

const categoriesTrack = document.getElementById('categoriesTrack');
const categoriesProgress = document.getElementById('categoriesProgress');

const questionsSlider = document.getElementById('questionsSlider');
const questionsProgress = document.getElementById('questionsProgress');

const currentCategoryName = document.getElementById('currentCategoryName');
const questionCounter = document.getElementById('questionCounter');
const modeBadge = document.getElementById('modeBadge');

const themeToggle = document.getElementById('themeToggle');
const randomModeBtn = document.getElementById('randomModeBtn');
const finishBtn = document.getElementById('finishBtn');
const backFromQuestions = document.getElementById('backFromQuestions');

const resultsTitle = document.getElementById('resultsTitle');
const resultsSubtitle = document.getElementById('resultsSubtitle');
const resultsPercent = document.getElementById('resultsPercent');
const resultsMatches = document.getElementById('resultsMatches');
const resultsMismatches = document.getElementById('resultsMismatches');
const resultsSkipped = document.getElementById('resultsSkipped');
const shareResultsBtn = document.getElementById('shareResultsBtn');
const restartCategoryBtn = document.getElementById('restartCategoryBtn');
const backToCategoriesBtn = document.getElementById('backToCategoriesBtn');

const resultsNote = document.getElementById('resultsNote');

// ===== Theme =====
function applyTheme(theme) {
    if (!theme) return;
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    if (themeToggle) themeToggle.textContent = isLight ? '☀️' : '🌙';
    try { localStorage.setItem('dating_theme', theme); } catch (e) {}

    try {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.setBackgroundColor(isLight ? '#f8fafc' : '#0f172a');
            window.Telegram.WebApp.setHeaderColor(isLight ? '#eef2ff' : '#667eea');
        }
    } catch (e) {}
}

function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('dating_theme'); } catch (e) {}
    applyTheme(saved === 'light' || saved === 'dark' ? saved : 'dark');
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    applyTheme(isLight ? 'dark' : 'light');
}

// ===== Категории =====
function renderCategories() {
    if (!categoriesTrack || !categoriesProgress) return;

    categoriesTrack.innerHTML = '';
    categoriesProgress.innerHTML = '';

    const fragSlides = document.createDocumentFragment();
    const fragDots = document.createDocumentFragment();

    categories.forEach((category, index) => {
        const slide = document.createElement('div');
        slide.className = 'category-slide';
        slide.dataset.index = String(index);
        slide.innerHTML = `
            <div class="category-card ${index === currentCategoryIndex ? 'active' : ''}" tabindex="0" role="button" aria-label="Открыть категорию ${category.name}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-desc">${category.desc}</div>
                <div class="category-counter">${index + 1} / ${categories.length}</div>
                <div class="category-open-hint">Нажми, чтобы открыть</div>
            </div>
        `;

        const card = slide.querySelector('.category-card');
        card?.addEventListener('click', () => {
            playSound('click');
            if (category.id === 'Блиц') startBlitzMode();
            else selectCategory(category);
        });
        card?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (category.id === 'Блиц') startBlitzMode();
                else selectCategory(category);
            }
        });

        fragSlides.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === currentCategoryIndex ? 'active' : ''}`;
        fragDots.appendChild(dot);
    });

    categoriesTrack.appendChild(fragSlides);
    categoriesProgress.appendChild(fragDots);
    updateCategoriesPosition();
}

function updateCategoriesPosition() {
    if (!categoriesTrack) return;
    const translateX = -currentCategoryIndex * 100;
    categoriesTrack.style.transform = `translateX(${translateX}%)`;

    Array.from(categoriesTrack.children).forEach((slide, index) => {
        slide.firstElementChild?.classList.toggle('active', index === currentCategoryIndex);
    });

    Array.from(categoriesProgress.children).forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCategoryIndex);
    });
}

// ===== Свайпы =====
function setupSimpleSwipeGestures() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (categoriesContainer) {
        setupTouchSwipe(categoriesContainer,
            () => {
                if (currentCategoryIndex < categories.length - 1) {
                    currentCategoryIndex++;
                    updateCategoriesPosition();
                    showSwipeFeedback('right', 'category');
                    playSound('swipe');
                }
            },
            () => {
                if (currentCategoryIndex > 0) {
                    currentCategoryIndex--;
                    updateCategoriesPosition();
                    showSwipeFeedback('left', 'category');
                    playSound('swipe');
                }
            }
        );
    }

    const questionsTrackEl = document.getElementById('questionsTrack');
    if (questionsTrackEl) {
        setupTouchSwipe(questionsTrackEl,
            () => {
                if (mode === 'category') {
                    applyDecision('mismatch', 'left');
                } else if (mode === 'random') {
                    applyDecision('mismatch', 'left');
                }
                playSound('swipe');
            },
            () => {
                if (mode === 'category') {
                    applyDecision('match', 'right');
                } else if (mode === 'random') {
                    applyDecision('match', 'right');
                }
                playSound('swipe');
            }
        );
    }
}

function setupTouchSwipe(element, onSwipeLeft, onSwipeRight) {
    let startX = 0;
    let startY = 0;

    element.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', function(e) {
        if (!startX) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        if (Math.abs(diffY) > Math.abs(diffX)) {
            startX = 0; startY = 0;
            return;
        }

        if (Math.abs(diffX) > 50) {
            if (diffX > 0) onSwipeLeft?.();
            else onSwipeRight?.();
        }

        startX = 0;
        startY = 0;
    }, { passive: true });

    element.addEventListener('mousedown', function(e) {
        startX = e.clientX;
        startY = e.clientY;
    });

    element.addEventListener('mouseup', function(e) {
        if (!startX) return;

        const endX = e.clientX;
        const endY = e.clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        if (Math.abs(diffY) > Math.abs(diffX)) {
            startX = 0; startY = 0;
            return;
        }

        if (Math.abs(diffX) > 50) {
            if (diffX > 0) onSwipeLeft?.();
            else onSwipeRight?.();
        }

        startX = 0;
        startY = 0;
    });
}

function showSwipeFeedback(direction, type) {
    const feedbackId = type === 'category'
        ? (direction === 'left' ? 'swipeLeftFeedback' : 'swipeRightFeedback')
        : (direction === 'left' ? 'questionSwipeLeftFeedback' : 'questionSwipeRightFeedback');

    const feedback = document.getElementById(feedbackId);
    if (!feedback) return;

    feedback.classList.remove('show');
    setTimeout(() => {
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 260);
    }, 10);
}

// ===== Навигация =====
function selectCategory(category) {
    mode = 'category';
    selectedCategory = category;
    currentQuestionIndex = 0;
    sessionStats = null;

    const list = getQuestions(category.id);
    if (!list?.length) {
        alert(`В категории "${category.name}" пока нет вопросов.`);
        return;
    }

    showQuestionsScreen();
}

function showQuestionsScreen() {
    if (mode === 'random') {
        startRandomMode();
        return;
    }
    if (!selectedCategory) return;

    hideResults();
    categoriesScreen.style.display = 'none';
    questionsScreen.style.display = 'block';
    questionsScreen.classList.add('active');

    currentCategoryName.textContent = selectedCategory.name;
    modeBadge.textContent = 'Совместимость';
    finishBtn.style.display = 'inline-flex';

    renderQuestions();
    updateQuestionCounter();
    syncTelegramBackButton();
}

function renderQuestions() {
    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (!questions?.length) {
        alert('Нет вопросов в этой категории');
        backToMain();
        return;
    }

    questionsSlider.innerHTML = `
        <div class="question-slide">
            <div class="question-card tinder-card" id="activeQuestionCard">
                <div class="tinder-badge tinder-like">Совпало</div>
                <div class="tinder-badge tinder-nope">Не совпало</div>
                <div class="question-text" id="activeQuestionText"></div>
                <div class="answer-controls" id="answerControls">
                    <button class="answer-btn mismatch" id="mismatchBtn">❌ Не совпало</button>
                    <button class="answer-btn skip" id="skipBtn">⏭ Пропуск</button>
                    <button class="answer-btn match" id="matchBtn">✅ Совпало</button>
                </div>
                <div class="secondary-row" id="secondaryRow">
                    <button class="small-btn" id="prevBtn">← Предыдущий</button>
                    <button class="small-btn" id="nextBtn">Следующий →</button>
                </div>
                <div class="swipe-tip">Свайп вправо = совпало, свайп влево = не совпало</div>
            </div>
        </div>
    `;

    renderQuestionsProgress(questions.length);
    updateQuestionsPosition();
    bindQuestionControls();
}

function renderQuestionsProgress(total) {
    questionsProgress.innerHTML = '';
    if (!total || total <= 1) return;

    const dotsCount = Math.min(total, MAX_PROGRESS_DOTS);
    const frag = document.createDocumentFragment();

    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        const mappedIndex = (dotsCount === 1) ? 0 : Math.round(i * (total - 1) / (dotsCount - 1));
        dot.dataset.qIndex = String(mappedIndex);
        frag.appendChild(dot);
    }

    questionsProgress.appendChild(frag);
}

function ensureSessionStats(totalQuestions) {
    if (mode === 'random') return;
    if (!selectedCategory) return;
    if (!sessionStats || sessionStats.id !== selectedCategory.id || sessionStats.decisions.length !== totalQuestions) {
        sessionStats = {
            id: selectedCategory.id,
            name: selectedCategory.name,
            decisions: Array.from({ length: totalQuestions }, () => null),
            matches: 0,
            mismatches: 0,
            skipped: 0
        };
    }
}

function animateQuestionDecision(direction) {
    const card = document.getElementById('activeQuestionCard');
    if (!card) return Promise.resolve();

    card.classList.remove('animate-like', 'animate-nope', 'animate-skip');
    void card.offsetWidth;

    if (direction === 'right') card.classList.add('animate-like');
    else if (direction === 'left') card.classList.add('animate-nope');
    else card.classList.add('animate-skip');

    return new Promise(resolve => {
        setTimeout(() => {
            card.classList.remove('animate-like', 'animate-nope', 'animate-skip');
            resolve();
        }, 240);
    });
}

async function applyDecision(decision, directionHint = null) {
    const direction = directionHint || (decision === 'match' ? 'right' : decision === 'mismatch' ? 'left' : 'skip');
    await animateQuestionDecision(direction);

    if (mode === 'random') {
        if (decision === 'match') randomStats.matches++;
        else if (decision === 'mismatch') randomStats.mismatches++;
        else if (decision === 'skip') randomStats.skipped++;
        randomStats.totalShown++;
        nextRandomQuestion();
        return;
    }

    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (!questions?.length) return;

    ensureSessionStats(questions.length);

    const prev = sessionStats.decisions[currentQuestionIndex];
    if (prev !== decision) {
        if (prev === 'match') sessionStats.matches--;
        if (prev === 'mismatch') sessionStats.mismatches--;
        if (prev === 'skip') sessionStats.skipped--;

        sessionStats.decisions[currentQuestionIndex] = decision;
        if (decision === 'match') sessionStats.matches++;
        if (decision === 'mismatch') sessionStats.mismatches++;
        if (decision === 'skip') sessionStats.skipped++;
    }

    if (currentQuestionIndex >= questions.length - 1) {
        showResults();
    } else {
        currentQuestionIndex++;
        updateQuestionsPosition();
        updateQuestionCounter();
        showSwipeFeedback(direction === 'left' ? 'left' : 'right', 'question');
    }
}

function bindQuestionControls() {
    const matchBtn = document.getElementById('matchBtn');
    const mismatchBtn = document.getElementById('mismatchBtn');
    const skipBtn = document.getElementById('skipBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (matchBtn && !matchBtn.dataset.bound) {
        matchBtn.dataset.bound = '1';
        matchBtn.addEventListener('click', () => applyDecision('match', 'right'));
    }
    if (mismatchBtn && !mismatchBtn.dataset.bound) {
        mismatchBtn.dataset.bound = '1';
        mismatchBtn.addEventListener('click', () => applyDecision('mismatch', 'left'));
    }
    if (skipBtn && !skipBtn.dataset.bound) {
        skipBtn.dataset.bound = '1';
        skipBtn.addEventListener('click', () => applyDecision('skip', 'skip'));
    }
    if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.dataset.bound = '1';
        prevBtn.addEventListener('click', prevQuestion);
    }
    if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.dataset.bound = '1';
        nextBtn.addEventListener('click', nextQuestion);
    }
}

function computeCompatibilityPercent(stats) {
    const answered = (stats.matches || 0) + (stats.mismatches || 0);
    if (!answered) return 0;
    return Math.round((stats.matches / answered) * 100);
}

function showResults() {
    let stats;
    let title = 'Результаты';
    let subtitle = '';

    if (mode === 'random') {
        stats = randomStats;
        title = 'Рандом-режим';
        subtitle = 'Случайные вопросы';
    } else if (mode === 'blitz') {
        stats = {
            matches: blitzCorrectAnswers,
            mismatches: Math.max(0, blitzTotalAnswered - blitzCorrectAnswers),
            skipped: 0
        };
        title = 'Блиц завершён';
        subtitle = 'Режим на время';
    } else {
        if (!selectedCategory) return;
        ensureSessionStats(getQuestions(selectedCategory.id).length);
        stats = sessionStats;
        subtitle = selectedCategory.name;
    }

    const percent = computeCompatibilityPercent(stats);

    resultsTitle.textContent = title;
    resultsSubtitle.textContent = subtitle;
    resultsPercent.textContent = `${percent}%`;
    resultsMatches.textContent = String(stats.matches || 0);
    resultsMismatches.textContent = String(stats.mismatches || 0);
    resultsSkipped.textContent = String(stats.skipped || 0);
    if (resultsNote) {
        resultsNote.textContent = mode === 'blitz'
            ? `Правильных ответов: ${blitzCorrectAnswers} из ${blitzTotalAnswered}`
            : 'Подсказка: отвечайте вместе и отмечайте “Совпало/Не совпало” — так считается процент.';
    }

    questionsScreen.style.display = 'none';
    questionsScreen.classList.remove('active');
    categoriesScreen.style.display = 'none';
    resultsScreen.classList.add('show');
    resultsScreen.setAttribute('aria-hidden', 'false');
    syncTelegramBackButton();
}

function hideResults() {
    resultsScreen?.classList.remove('show');
    resultsScreen?.setAttribute('aria-hidden', 'true');
    syncTelegramBackButton();
}

async function shareResults() {
    let stats;
    let subtitle = '';

    if (mode === 'random') {
        stats = randomStats;
        subtitle = 'Рандом-режим';
    } else if (mode === 'blitz') {
        stats = {
            matches: blitzCorrectAnswers,
            mismatches: Math.max(0, blitzTotalAnswered - blitzCorrectAnswers),
            skipped: 0
        };
        subtitle = 'Блиц';
    } else {
        stats = sessionStats;
        subtitle = selectedCategory ? selectedCategory.name : 'Категория';
    }

    const percent = computeCompatibilityPercent(stats);
    const text = `Мы прошли: ${subtitle}\nСовместимость: ${percent}%\nСовпало: ${stats.matches || 0}, Не совпало: ${stats.mismatches || 0}, Пропуск: ${stats.skipped || 0}`;

    try {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
            return;
        }
    } catch (e) {}

    try {
        await navigator.clipboard.writeText(text);
        alert('Результаты скопированы в буфер обмена');
    } catch (e) {
        prompt('Скопируй текст:', text);
    }
}

// ===== Random =====
function startRandomMode() {
    mode = 'random';
    randomStats = { matches: 0, mismatches: 0, skipped: 0, totalShown: 0 };
    lastRandomItem = null;

    hideResults();
    categoriesScreen.style.display = 'none';
    questionsScreen.style.display = 'block';
    questionsScreen.classList.add('active');

    modeBadge.textContent = 'Рандом';
    currentCategoryName.textContent = '🎲 Рандом';
    currentQuestionIndex = 0;
    nextRandomQuestion(true);
    syncTelegramBackButton();
}

function nextRandomQuestion(initial = false) {
    if (!randomPool?.length) {
        alert('Список вопросов пуст. Проверь questions.json');
        backToMain();
        return;
    }

    let item = null;
    for (let i = 0; i < 6; i++) {
        const candidate = randomPool[Math.floor(Math.random() * randomPool.length)];
        if (!lastRandomItem || candidate.question !== lastRandomItem.question) {
            item = candidate;
            break;
        }
    }
    item = item || randomPool[Math.floor(Math.random() * randomPool.length)];
    lastRandomItem = item;

    questionsSlider.innerHTML = `
        <div class="question-slide">
            <div class="question-card tinder-card" id="activeQuestionCard">
                <div class="tinder-badge tinder-like">Совпало</div>
                <div class="tinder-badge tinder-nope">Не совпало</div>
                <div class="question-text" id="activeQuestionText"></div>
                <div class="answer-controls" id="answerControls">
                    <button class="answer-btn mismatch" id="mismatchBtn">❌ Не совпало</button>
                    <button class="answer-btn skip" id="skipBtn">⏭ Пропуск</button>
                    <button class="answer-btn match" id="matchBtn">✅ Совпало</button>
                </div>
                <div class="secondary-row" id="secondaryRow">
                    <button class="small-btn" id="randomNextBtn">🎲 Следующий случайный</button>
                    <button class="small-btn" id="finishRandomBtn">🏁 Результаты</button>
                </div>
                <div class="results-note" style="margin-top:12px; text-align:left;">Категория: <b>${item.categoryName}</b></div>
            </div>
        </div>
    `;

    document.getElementById('activeQuestionText').textContent = item.question;
    questionCounter.textContent = `Случайный вопрос № ${randomStats.totalShown + 1}`;
    questionsProgress.innerHTML = '';

    bindQuestionControls();

    const randomNextBtn = document.getElementById('randomNextBtn');
    const finishRandomBtn = document.getElementById('finishRandomBtn');
    if (randomNextBtn && !randomNextBtn.dataset.bound) {
        randomNextBtn.dataset.bound = '1';
        randomNextBtn.addEventListener('click', nextRandomQuestion);
    }
    if (finishRandomBtn && !finishRandomBtn.dataset.bound) {
        finishRandomBtn.dataset.bound = '1';
        finishRandomBtn.addEventListener('click', showResults);
    }

    finishBtn.style.display = 'none';
    if (initial) finishBtn.style.display = 'none';
}

// ===== Основные переходы по вопросам =====
function updateQuestionsPosition() {
    if (!questionsSlider || !selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (!questions?.length) return;

    const textEl = document.getElementById('activeQuestionText');
    if (textEl) textEl.textContent = questions[currentQuestionIndex] ?? '';

    const dots = Array.from(questionsProgress.children);
    if (dots.length) {
        let activeDotIdx = 0;
        if (questions.length <= MAX_PROGRESS_DOTS) {
            activeDotIdx = currentQuestionIndex;
        } else {
            let bestDiff = Infinity;
            dots.forEach((dot, idx) => {
                const qIdx = Number(dot.dataset.qIndex || 0);
                const diff = Math.abs(qIdx - currentQuestionIndex);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    activeDotIdx = idx;
                }
            });
        }
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === activeDotIdx));
    }
}

function updateQuestionCounter() {
    if (mode === 'random') {
        questionCounter.textContent = `Случайный вопрос № ${randomStats.totalShown + 1}`;
        return;
    }
    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    questionCounter.textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}`;
}

function nextQuestion() {
    if (mode === 'random') return nextRandomQuestion();
    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (!questions?.length) return;

    if (currentQuestionIndex >= questions.length - 1) return showResults();
    currentQuestionIndex++;
    updateQuestionsPosition();
    updateQuestionCounter();
}

function prevQuestion() {
    if (mode === 'random') return nextRandomQuestion();
    if (currentQuestionIndex <= 0) return;
    currentQuestionIndex--;
    updateQuestionsPosition();
    updateQuestionCounter();
}

// ===== Blitz =====
function startBlitzMode() {
    const questions = getQuestions('Блиц');
    if (!questions?.length) {
        alert('Для блиц-режима нет вопросов');
        return;
    }

    mode = 'blitz';
    timeLeft = 30;
    blitzCorrectAnswers = 0;
    blitzTotalAnswered = 0;
    blitzCurrentIndex = 0;

    categoriesScreen.style.display = 'none';
    questionsScreen.style.display = 'block';
    questionsScreen.classList.add('active');

    currentCategoryName.textContent = '⚡ Блиц';
    modeBadge.textContent = '30 секунд';
    finishBtn.style.display = 'inline-flex';

    questionsSlider.innerHTML = `
        <div class="question-slide">
            <div class="question-card blitz-card-mode">
                <div class="blitz-timer-inline">⏱ <span id="inlineTimer">30</span> сек</div>
                <div class="question-text" id="blitzQuestionText"></div>
                <div class="answer-controls">
                    <button class="answer-btn match" id="blitzCorrectBtn">✅ Знаю</button>
                    <button class="answer-btn mismatch" id="blitzWrongBtn">❌ Не знаю</button>
                </div>
                <div class="results-note" style="margin-top:12px;">Правильных: <b id="blitzScoreInline">0</b></div>
            </div>
        </div>
    `;

    questionsProgress.innerHTML = '';
    showNextBlitzQuestion();
    startBlitzTimer();

    document.getElementById('blitzCorrectBtn')?.addEventListener('click', () => {
        blitzCorrectAnswers++;
        blitzTotalAnswered++;
        blitzCurrentIndex++;
        showNextBlitzQuestion();
    });
    document.getElementById('blitzWrongBtn')?.addEventListener('click', () => {
        blitzTotalAnswered++;
        blitzCurrentIndex++;
        showNextBlitzQuestion();
    });

    syncTelegramBackButton();
}

function showNextBlitzQuestion() {
    const questions = getQuestions('Блиц');
    const blitzQuestionText = document.getElementById('blitzQuestionText');
    const blitzScoreInline = document.getElementById('blitzScoreInline');

    if (blitzScoreInline) blitzScoreInline.textContent = String(blitzCorrectAnswers);
    questionCounter.textContent = `Вопрос ${Math.min(blitzCurrentIndex + 1, questions.length)} из ${questions.length}`;

    if (blitzCurrentIndex < questions.length) {
        if (blitzQuestionText) blitzQuestionText.textContent = questions[blitzCurrentIndex];
    } else {
        endBlitzMode();
    }
}

function startBlitzTimer() {
    if (blitzTimer) clearInterval(blitzTimer);
    const inlineTimer = document.getElementById('inlineTimer');

    blitzTimer = setInterval(() => {
        timeLeft--;
        if (inlineTimer) inlineTimer.textContent = String(timeLeft);
        if (timeLeft <= 0) endBlitzMode();
    }, 1000);
}

function endBlitzMode() {
    clearInterval(blitzTimer);
    blitzTimer = null;
    showResults();
}

// ===== Возврат =====
function backToMain() {
    hideResults();
    clearInterval(blitzTimer);
    blitzTimer = null;

    mode = 'category';
    selectedCategory = null;
    currentQuestionIndex = 0;

    questionsScreen.classList.remove('active');
    questionsScreen.style.display = 'none';
    categoriesScreen.style.display = 'flex';
    updateCategoriesPosition();
    syncTelegramBackButton();
}

// ===== События =====
function setupEventListeners() {
    backFromQuestions?.addEventListener('click', () => {
        playSound('click');
        backToMain();
    });

    themeToggle?.addEventListener('click', toggleTheme);

    randomModeBtn?.addEventListener('click', () => {
        playSound('click');
        startRandomMode();
    });

    finishBtn?.addEventListener('click', () => {
        playSound('click');
        showResults();
    });

    shareResultsBtn?.addEventListener('click', () => {
        playSound('click');
        shareResults();
    });

    restartCategoryBtn?.addEventListener('click', () => {
        playSound('click');
        if (mode === 'random') return startRandomMode();
        if (mode === 'blitz') return startBlitzMode();
        if (!selectedCategory) return backToMain();
        currentQuestionIndex = 0;
        sessionStats = null;
        showQuestionsScreen();
    });

    backToCategoriesBtn?.addEventListener('click', () => {
        playSound('click');
        backToMain();
    });

    document.addEventListener('keydown', (e) => {
        if (resultsScreen?.classList.contains('show')) return;

        const inQuestions = questionsScreen && (questionsScreen.classList.contains('active') || questionsScreen.style.display === 'block');
        if (!inQuestions) return;

        if (mode === 'blitz') {
            if (e.key === 'ArrowRight') {
                blitzCorrectAnswers++; blitzTotalAnswered++; blitzCurrentIndex++; showNextBlitzQuestion();
            }
            if (e.key === 'ArrowLeft') {
                blitzTotalAnswered++; blitzCurrentIndex++; showNextBlitzQuestion();
            }
            return;
        }

        if (e.key === 'ArrowRight') applyDecision('match', 'right');
        if (e.key === 'ArrowLeft') applyDecision('mismatch', 'left');
        if (e.key === 'ArrowUp') prevQuestion();
        if (e.key === 'ArrowDown') nextQuestion();
        if (e.key === 'Backspace') applyDecision('skip', 'skip');
    });
}

async function init() {
    const ok = await loadQuestions();
    if (!ok) return;

    initTelegramWebApp();
    buildRandomPool();
    renderCategories();
    updateCategoriesPosition();
    setupSimpleSwipeGestures();
    setupEventListeners();
    initTheme();

    questionsScreen.style.display = 'none';
    resultsScreen.classList.remove('show');
    categoriesScreen.style.display = 'flex';
    syncTelegramBackButton();
}

document.addEventListener('DOMContentLoaded', init);

// script.js - УПРОЩЕННЫЙ КОД С РАБОЧИМИ СВАЙПАМИ ДЛЯ ТЕЛЕФОНА

const DEBUG = false;
const debug = (...args) => {
    if (DEBUG) console.log(...args);
};

// Загрузка вопросов из questions.json (облегчает фронт и ускоряет старт)
async function loadQuestions() {
    try {
        const res = await fetch('questions.json', { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        window.questionsData = await res.json();
        return true;
    } catch (err) {
        console.error('Не удалось загрузить questions.json:', err);
        alert('Ошибка загрузки вопросов (questions.json). Проверьте, что проект открыт через сервер/Telegram WebApp, а файл questions.json рядом с index.html.');
        return false;
    }
}

// Конфигурация категорий
const categories = [
    { id: "Интимные вопросы", name: "Интимные вопросы", icon: "🔞", desc: "Откровенные вопросы для близости" },
    { id: "На расстоянии", name: "На расстоянии", icon: "✈️", desc: "Для пар в разлуке" },
    { id: "Будущее", name: "Будущее", icon: "🔮", desc: "Планы и мечты" },
    { id: "Финансы", name: "Финансы", icon: "💰", desc: "Вопросы о деньгах" },
    { id: "Психология", name: "Психология", icon: "🧠", desc: "Глубокие вопросы" },
    { id: "Воспоминания", name: "Воспоминания", icon: "📸", desc: "О вашем прошлом" }
    { id: "Флаги", name: "Флаги", icon: "🚩", desc: "Здоровые отношения" },
    { id: "Тимбилдинг", name: "Тимбилдинг", icon: "👥", desc: "Веселые вопросы" }
];

function buildRandomPool() {
    randomPool = [];
    for (const cat of categories) {
        const qs = getQuestions(cat.id);
        if (!qs || !qs.length) continue;
        for (const q of qs) {
            randomPool.push({ categoryId: cat.id, categoryName: cat.name, question: q });
        }
    }
    debug('Random pool size:', randomPool.length);
}




// Утилита: безопасно получить массив вопросов по id категории
function getQuestions(categoryId) {
    return (window.questionsData && window.questionsData[categoryId]) ? window.questionsData[categoryId] : [];
}

// Максимум точек прогресса (чтобы не лагало на больших категориях)
const MAX_PROGRESS_DOTS = 12;

// ===== Состояние приложения =====
let currentCategoryIndex = 0;
let currentQuestionIndex = 0;
let selectedCategory = null;

// mode: 'category' | 'random'
let mode = 'category';

// Данные текущей "сессии" для подсчёта совместимости
let sessionStats = null; // { id, name, decisions: Array<'match'|'mismatch'|'skip'|null>, matches, mismatches, skipped }

// Пул для рандом-режима (плоский список вопросов)
let randomPool = [];
let randomStats = { matches: 0, mismatches: 0, skipped: 0, totalShown: 0 };
let lastRandomItem = null;

// ===== DOM элементы =====

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

// Results UI
const resultsTitle = document.getElementById('resultsTitle');
const resultsSubtitle = document.getElementById('resultsSubtitle');
const resultsPercent = document.getElementById('resultsPercent');
const resultsMatches = document.getElementById('resultsMatches');
const resultsMismatches = document.getElementById('resultsMismatches');
const resultsSkipped = document.getElementById('resultsSkipped');
const shareResultsBtn = document.getElementById('shareResultsBtn');
const restartCategoryBtn = document.getElementById('restartCategoryBtn');
const backToCategoriesBtn = document.getElementById('backToCategoriesBtn');

// ===== Theme =====
function applyTheme(theme) {
    if (!theme) return;
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);

    if (themeToggle) themeToggle.textContent = isLight ? '☀️' : '🌙';
    try { localStorage.setItem('dating_theme', theme); } catch (e) {}
}

function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('dating_theme'); } catch (e) {}

    if (saved === 'light' || saved === 'dark') {
        applyTheme(saved);
        return;
    }

    // по умолчанию — тёмная
    applyTheme('dark');
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    applyTheme(isLight ? 'dark' : 'light');
}

function renderCategories() {
    categoriesTrack.innerHTML = '';
    categoriesProgress.innerHTML = '';

    const fragSlides = document.createDocumentFragment();
    const fragDots = document.createDocumentFragment();

    categories.forEach((category, index) => {
        const slide = document.createElement('div');
        slide.className = 'category-slide';
        slide.dataset.index = String(index);
        slide.style.setProperty('--index', index);
        slide.innerHTML = `
            <div class="category-card ${index === currentCategoryIndex ? 'active' : ''}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-desc">${category.desc}</div>
                <div class="category-counter">${index + 1} / ${categories.length}</div>
            </div>
        `;
        fragSlides.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === currentCategoryIndex ? 'active' : ''}`;
        fragDots.appendChild(dot);
    });

    categoriesTrack.appendChild(fragSlides);
    categoriesProgress.appendChild(fragDots);

    updateCategoriesPosition();
}

// Обновление позиции категорий
function updateCategoriesPosition() {
    const translateX = -currentCategoryIndex * 100;
    categoriesTrack.style.transform = `translateX(${translateX}%)`;
    
    Array.from(categoriesTrack.children).forEach((slide, index) => {
        slide.firstElementChild?.classList.toggle('active', index === currentCategoryIndex);
    });

    Array.from(categoriesProgress.children).forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCategoryIndex);
    });
}

// САМЫЕ ПРОСТЫЕ СВАЙПЫ ДЛЯ ТЕЛЕФОНА
function setupSimpleSwipeGestures() {
    debug('Настройка простых свайпов для телефона');

    // Свайпы для категорий
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (categoriesContainer) {
        setupTouchSwipe(categoriesContainer,
            // Свайп влево
            () => {
                debug('Свайп влево по категориям');
                if (currentCategoryIndex < categories.length - 1) {
                    currentCategoryIndex++;
                    updateCategoriesPosition();
                    showSwipeFeedback('right', 'category');
                    playSound('swipe');
                }
            },
            // Свайп вправо
            () => {
                debug('Свайп вправо по категориям');
                if (currentCategoryIndex > 0) {
                    currentCategoryIndex--;
                    updateCategoriesPosition();
                    showSwipeFeedback('left', 'category');
                    playSound('swipe');
                }
            }
        );
    }

    // Свайпы для вопросов
    const questionsTrackEl = document.getElementById('questionsTrack');
    if (questionsTrackEl) {
        setupTouchSwipe(questionsTrackEl,
            () => {
                debug('Свайп влево по вопросам');
                nextQuestion();
                showSwipeFeedback('right', 'question');
                playSound('swipe');
            },
            () => {
                debug('Свайп вправо по вопросам');
                prevQuestion();
                showSwipeFeedback('left', 'question');
                playSound('swipe');
            }
        );
    }
}


// ОЧЕНЬ ПРОСТАЯ ФУНКЦИЯ СВАЙПА ДЛЯ ТЕЛЕФОНА
function setupTouchSwipe(element, onSwipeLeft, onSwipeRight) {
    let startX = 0;
    let startY = 0;
    
    element.addEventListener('touchstart', function(e) {
        debug('touchstart на элементе');
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
        debug('touchend на элементе');
        if (!startX) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        // Вычисляем разницу
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Игнорируем вертикальные свайпы (скролл)
        if (Math.abs(diffY) > Math.abs(diffX)) {
            debug('Вертикальный свайп, игнорируем');
            return;
        }
        
        // Минимальное расстояние для свайпа
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                debug('Определен свайп влево, diffX:', diffX);
                if (onSwipeLeft) onSwipeLeft();
            } else {
                debug('Определен свайп вправо, diffX:', diffX);
                if (onSwipeRight) onSwipeRight();
            }
        }
        
        // Сбрасываем начальные координаты
        startX = 0;
        startY = 0;
    }, { passive: true });
    
    // Для тестирования на компьютере (мышь)
    element.addEventListener('mousedown', function(e) {
        debug('mousedown на элементе');
        startX = e.clientX;
        startY = e.clientY;
    });
    
    element.addEventListener('mouseup', function(e) {
        debug('mouseup на элементе');
        if (!startX) return;
        
        const endX = e.clientX;
        const endY = e.clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        if (Math.abs(diffY) > Math.abs(diffX)) {
            return;
        }
        
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                debug('Мышь: свайп влево');
                if (onSwipeLeft) onSwipeLeft();
            } else {
                debug('Мышь: свайп вправо');
                if (onSwipeRight) onSwipeRight();
            }
        }
        
        startX = 0;
        startY = 0;
    });
}

// Показать анимацию свайпа
function showSwipeFeedback(direction, type) {
    const feedbackId = type === 'category' 
        ? (direction === 'left' ? 'swipeLeftFeedback' : 'swipeRightFeedback')
        : (direction === 'left' ? 'questionSwipeLeftFeedback' : 'questionSwipeRightFeedback');
    
    const feedback = document.getElementById(feedbackId);
    
    if (!feedback) {
        console.error('Элемент feedback не найден:', feedbackId);
        return;
    }
    
    feedback.classList.remove('show');
    setTimeout(() => {
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 500);
    }, 10);
}

// Выбор категории
function selectCategory(category) {
    mode = 'category';
    selectedCategory = category;
    currentQuestionIndex = 0;
    sessionStats = null;

    debug(`Выбрана категория: ${category.id}`);

    if (!getQuestions(category.id) || getQuestions(category.id).length === 0) {
        alert(`В категории "${category.name}" пока нет вопросов!`);
        return;
    }

    showQuestionsScreen();
}


// Показать экран вопросов
function showQuestionsScreen() {
    if (mode === 'random') {
        startRandomMode();
        return;
    }
    if (!selectedCategory) return;

    hideResults();

    if (categoriesScreen) categoriesScreen.style.display = 'none';
    if (resultsScreen) resultsScreen.classList.remove('show');
    if (questionsScreen) {
        questionsScreen.style.display = 'block';
        questionsScreen.classList.add('active');
    }

    if (currentCategoryName) currentCategoryName.textContent = selectedCategory.name;
    if (modeBadge) modeBadge.textContent = 'Совместимость';
    if (finishBtn) finishBtn.style.display = 'inline-flex';

    renderQuestions();
    updateQuestionCounter();
}


// Рендеринг вопросов
function renderQuestions() {
    if (!selectedCategory) return;

    const questions = getQuestions(selectedCategory.id);

    if (!questions || questions.length === 0) {
        console.error('Нет вопросов в категории:', selectedCategory.id);
        alert('Нет вопросов в этой категории!');
        backToMain();
        return;
    }

    // Виртуализация: держим в DOM только 1 карточку (без сотен элементов)
        questionsSlider.innerHTML = `
        <div class="question-slide">
            <div class="question-card">
                <div class="question-text" id="activeQuestionText"></div>
                <div class="answer-controls" id="answerControls">
                    <button class="answer-btn match" id="matchBtn">✅ Совпало</button>
                    <button class="answer-btn mismatch" id="mismatchBtn">❌ Не совпало</button>
                    <button class="answer-btn skip" id="skipBtn">⏭ Пропуск</button>
                </div>
                <div class="secondary-row" id="secondaryRow">
                    <button class="small-btn" id="prevBtn">← Предыдущий</button>
                    <button class="small-btn" id="nextBtn">Следующий →</button>
                </div>
            </div>
        </div>
    `;

    // Рендерим ограниченное число точек прогресса (или все, если мало)
    renderQuestionsProgress(questions.length);

    // Обновляем контент
    updateQuestionsPosition();

    // Привязываем кнопки управления (один раз после рендера)
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
        // Свяжем точку с реальным индексом вопроса (для длинных списков это "сэмпл")
        const mappedIndex = (dotsCount === 1) ? 0 : Math.round(i * (total - 1) / (dotsCount - 1));
        dot.dataset.qIndex = String(mappedIndex);
        frag.appendChild(dot);
    }

    questionsProgress.appendChild(frag);
}


function ensureSessionStats(totalQuestions) {
    if (mode === 'random') return; // random uses randomStats
    if (!selectedCategory) return;
    if (!sessionStats || sessionStats.id !== selectedCategory.id || !sessionStats.decisions || sessionStats.decisions.length !== totalQuestions) {
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

function applyDecision(decision) {
    if (mode === 'random') {
        // decision just increments counters and shows next random
        if (decision === 'match') randomStats.matches++;
        else if (decision === 'mismatch') randomStats.mismatches++;
        else if (decision === 'skip') randomStats.skipped++;
        randomStats.totalShown++;
        nextRandomQuestion();
        return;
    }

    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (!questions || !questions.length) return;

    ensureSessionStats(questions.length);

    const prev = sessionStats.decisions[currentQuestionIndex];
    if (prev === decision) {
        // повторно нажали — просто двигаемся дальше
    } else {
        // откатываем прошлое
        if (prev === 'match') sessionStats.matches--;
        if (prev === 'mismatch') sessionStats.mismatches--;
        if (prev === 'skip') sessionStats.skipped--;

        // применяем новое
        sessionStats.decisions[currentQuestionIndex] = decision;
        if (decision === 'match') sessionStats.matches++;
        if (decision === 'mismatch') sessionStats.mismatches++;
        if (decision === 'skip') sessionStats.skipped++;
    }

    // Автопереход вперёд или результаты
    if (currentQuestionIndex >= questions.length - 1) {
        showResults();
    } else {
        currentQuestionIndex++;
        updateQuestionsPosition();
        updateQuestionCounter();
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
        matchBtn.addEventListener('click', () => applyDecision('match'));
    }
    if (mismatchBtn && !mismatchBtn.dataset.bound) {
        mismatchBtn.dataset.bound = '1';
        mismatchBtn.addEventListener('click', () => applyDecision('mismatch'));
    }
    if (skipBtn && !skipBtn.dataset.bound) {
        skipBtn.dataset.bound = '1';
        skipBtn.addEventListener('click', () => applyDecision('skip'));
    }
    if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.dataset.bound = '1';
        prevBtn.addEventListener('click', () => prevQuestion());
    }
    if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.dataset.bound = '1';
        nextBtn.addEventListener('click', () => nextQuestion());
    }
}

function computeCompatibilityPercent(stats) {
    const answered = (stats.matches || 0) + (stats.mismatches || 0);
    if (!answered) return 0;
    return Math.round((stats.matches / answered) * 100);
}

function showResults() {
    // Считаем и рисуем
    let stats;
    let title = 'Результаты';
    let subtitle = '';

    if (mode === 'random') {
        stats = randomStats;
        title = 'Рандом-режим';
        subtitle = 'Случайные вопросы';
    } else {
        if (!selectedCategory) return;
        const questions = getQuestions(selectedCategory.id);
        ensureSessionStats(questions.length);
        stats = sessionStats;
        subtitle = selectedCategory.name;
    }

    const percent = computeCompatibilityPercent(stats);

    if (resultsTitle) resultsTitle.textContent = title;
    if (resultsSubtitle) resultsSubtitle.textContent = subtitle;
    if (resultsPercent) resultsPercent.textContent = `${percent}%`;
    if (resultsMatches) resultsMatches.textContent = String(stats.matches || 0);
    if (resultsMismatches) resultsMismatches.textContent = String(stats.mismatches || 0);
    if (resultsSkipped) resultsSkipped.textContent = String(stats.skipped || 0);

    // Показ/скрытие экранов
    if (questionsScreen) questionsScreen.style.display = 'none';
    if (categoriesScreen) categoriesScreen.style.display = 'none';
    if (resultsScreen) {
        resultsScreen.classList.add('show');
        resultsScreen.setAttribute('aria-hidden', 'false');
    }
}

function hideResults() {
    if (resultsScreen) {
        resultsScreen.classList.remove('show');
        resultsScreen.setAttribute('aria-hidden', 'true');
    }
}

async function shareResults() {
    let stats;
    let subtitle = '';

    if (mode === 'random') {
        stats = randomStats;
        subtitle = 'Рандом-режим';
    } else {
        stats = sessionStats;
        subtitle = selectedCategory ? selectedCategory.name : 'Категория';
    }

    const percent = computeCompatibilityPercent(stats);
    const text = `Мы прошли: ${subtitle}\nСовместимость: ${percent}%\nСовпало: ${stats.matches || 0}, Не совпало: ${stats.mismatches || 0}, Пропуск: ${stats.skipped || 0}`;

    // Telegram WebApp (если доступен)
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
            return;
        }
    } catch (e) {}

    // Clipboard fallback
    try {
        await navigator.clipboard.writeText(text);
        alert('Результаты скопированы в буфер обмена!');
    } catch (e) {
        prompt('Скопируй текст:', text);
    }
}

function startRandomMode() {
    mode = 'random';
    randomStats = { matches: 0, mismatches: 0, skipped: 0, totalShown: 0 };
    lastRandomItem = null;

    hideResults();
    if (resultsScreen) resultsScreen.classList.remove('show');

    if (categoriesScreen) categoriesScreen.style.display = 'none';
    if (questionsScreen) questionsScreen.style.display = 'block';

    if (modeBadge) modeBadge.textContent = 'Рандом';
    if (currentCategoryName) currentCategoryName.textContent = '🎲 Рандом';
    currentQuestionIndex = 0;

    nextRandomQuestion(true);
}

function nextRandomQuestion(initial = false) {
    if (!randomPool || !randomPool.length) {
        alert('Список вопросов пуст. Проверь questions.json');
        backToMain();
        return;
    }

    let item = null;
    // попытаемся не повторяться подряд
    for (let i = 0; i < 6; i++) {
        const candidate = randomPool[Math.floor(Math.random() * randomPool.length)];
        if (!lastRandomItem || candidate.question !== lastRandomItem.question) {
            item = candidate;
            break;
        }
    }
    item = item || randomPool[Math.floor(Math.random() * randomPool.length)];
    lastRandomItem = item;

    // Рисуем один вопрос
    questionsSlider.innerHTML = `
        <div class="question-slide">
            <div class="question-card">
                <div class="question-text" id="activeQuestionText"></div>
                <div class="answer-controls" id="answerControls">
                    <button class="answer-btn match" id="matchBtn">✅ Совпало</button>
                    <button class="answer-btn mismatch" id="mismatchBtn">❌ Не совпало</button>
                    <button class="answer-btn skip" id="skipBtn">⏭ Пропуск</button>
                </div>
                <div class="secondary-row" id="secondaryRow">
                    <button class="small-btn" id="randomNextBtn">🎲 Следующий случайный</button>
                    <button class="small-btn" id="finishRandomBtn">🏁 Результаты</button>
                </div>
                <div class="results-note" style="margin-top:12px; text-align:left;">
                    Категория: <b>${item.categoryName}</b>
                </div>
            </div>
        </div>
    `;

    const textEl = document.getElementById('activeQuestionText');
    if (textEl) textEl.textContent = item.question;

    // counter
    if (questionCounter) questionCounter.textContent = `Случайный вопрос № ${randomStats.totalShown + 1}`;
    if (questionsProgress) questionsProgress.innerHTML = '';

    bindQuestionControls();

    const randomNextBtn = document.getElementById('randomNextBtn');
    const finishRandomBtn = document.getElementById('finishRandomBtn');
    if (randomNextBtn && !randomNextBtn.dataset.bound) {
        randomNextBtn.dataset.bound = '1';
        randomNextBtn.addEventListener('click', () => nextRandomQuestion());
    }
    if (finishRandomBtn && !finishRandomBtn.dataset.bound) {
        finishRandomBtn.dataset.bound = '1';
        finishRandomBtn.addEventListener('click', () => showResults());
    }

    if (finishBtn) finishBtn.style.display = 'none';
    if (initial && finishBtn) finishBtn.style.display = 'none';
}


// Обновление позиции вопросов
function updateQuestionsPosition() {
    if (!questionsSlider || !selectedCategory) return;

    const questions = getQuestions(selectedCategory.id);
    if (!questions || questions.length === 0) return;

    // Обновляем текст вопроса
    const textEl = document.getElementById('activeQuestionText');
    if (textEl) textEl.textContent = questions[currentQuestionIndex] ?? '';

    debug(`Вопрос ${currentQuestionIndex + 1}`);

    // Подсветка прогресс-точек (для длинных списков — ближайшая точка)
    const dots = Array.from(questionsProgress.children);
    if (dots.length) {
        let activeDotIdx = 0;

        if (questions.length <= MAX_PROGRESS_DOTS) {
            activeDotIdx = currentQuestionIndex;
        } else {
            // Находим точку с ближайшим dataset.qIndex
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
        if (questionCounter) questionCounter.textContent = `Случайный вопрос № ${randomStats.totalShown + 1}`;
        return;
    }
    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (questionCounter) questionCounter.textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}`;
}


function nextQuestion() {
    if (mode === 'random') {
        nextRandomQuestion();
        return;
    }
    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    if (!questions || !questions.length) return;

    if (currentQuestionIndex >= questions.length - 1) {
        showResults();
        return;
    }
    currentQuestionIndex++;
    updateQuestionsPosition();
    updateQuestionCounter();
}

function prevQuestion() {
    if (mode === 'random') {
        // в рандоме предыдущего нет — просто ещё один случайный
        nextRandomQuestion();
        return;
    }
    if (currentQuestionIndex <= 0) return;
    currentQuestionIndex--;
    updateQuestionsPosition();
    updateQuestionCounter();
}



// Запуск режима блиц
function startBlitzMode() {
    timeLeft = 30;
    blitzCorrectAnswers = 0;
    blitzTotalAnswered = 0;
    blitzCurrentIndex = 0;
    
    categoriesScreen.style.display = 'none';
    
    updateBlitzUI();
    showNextBlitzQuestion();
    startBlitzTimer();
    
    setTimeout(() => {
        blitzScreen.classList.add('active');
    }, 50);
}

// Обновление UI блица
function updateBlitzUI() {
    timerElement.textContent = timeLeft;
    correctScore.textContent = blitzCorrectAnswers;
    totalScore.textContent = blitzCurrentIndex + 1;
}

// Показать следующий вопрос блица
function showNextBlitzQuestion() {
    const questions = window.questionsData['Блиц'] || [];
    if (blitzCurrentIndex < questions.length) {
        blitzQuestionText.textContent = questions[blitzCurrentIndex];
        totalScore.textContent = blitzCurrentIndex + 1;
    } else {
        endBlitzMode();
    }
}

// Запуск таймера блица
function startBlitzTimer() {
    if (blitzTimer) clearInterval(blitzTimer);
    
    timerElement.style.color = '';
    timerElement.style.textShadow = '';
    
    blitzTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerElement.style.color = '#ff4d4d';
            timerElement.style.textShadow = '0 0 15px rgba(255, 77, 77, 0.7)';
        }
        
        if (timeLeft <= 0) {
            endBlitzMode();
        }
    }, 1000);
}

// Завершение режима блиц
function endBlitzMode() {
    clearInterval(blitzTimer);
    blitzTimer = null;
    
    const percentage = blitzTotalAnswered > 0 
        ? Math.round((blitzCorrectAnswers / blitzTotalAnswered) * 100) 
        : 0;
    
    setTimeout(() => {
        const resultMessage = `Блиц завершен!\n\nПравильных ответов: ${blitzCorrectAnswers} из ${blitzTotalAnswered}\n\nРезультат: ${percentage}%`;
        alert(resultMessage);
        backToMain();
    }, 500);
}

// Возврат на главный экран
function backToMain() {
    // Скрываем всё, показываем категории
    hideResults();

    mode = 'category';
    selectedCategory = null;
    currentQuestionIndex = 0;

    if (questionsScreen) {
        questionsScreen.classList.remove('active');
        questionsScreen.style.display = 'none';
    }
    if (resultsScreen) resultsScreen.classList.remove('show');

    if (categoriesScreen) {
        categoriesScreen.style.display = 'flex';
    }

    // Вернём позицию категорий
    if (categoriesTrack) {
        const translateX = -currentCategoryIndex * 100;
        categoriesTrack.style.transform = `translateX(${translateX}%)`;
    }
}


// Настройка обработчиков событий
function setupEventListeners() {
    if (backFromQuestions) {
        backFromQuestions.addEventListener('click', () => {
            playSound('click');
            backToMain();
        });
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    if (randomModeBtn) {
        randomModeBtn.addEventListener('click', () => {
            playSound('click');
            startRandomMode();
        });
    }

    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            playSound('click');
            showResults();
        });
    }

    if (shareResultsBtn) {
        shareResultsBtn.addEventListener('click', () => {
            playSound('click');
            shareResults();
        });
    }

    if (restartCategoryBtn) {
        restartCategoryBtn.addEventListener('click', () => {
            playSound('click');
            if (mode === 'random') {
                startRandomMode();
                return;
            }
            // перезапуск категории
            if (!selectedCategory) {
                backToMain();
                return;
            }
            currentQuestionIndex = 0;
            sessionStats = null;
            showQuestionsScreen();
        });
    }

    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', () => {
            playSound('click');
            backToMain();
        });
    }

    // Клавиатурная навигация (удобно на ПК)
    document.addEventListener('keydown', (e) => {
        if (resultsScreen && resultsScreen.classList.contains('show')) return;

        if (questionsScreen && (questionsScreen.classList.contains('active') || questionsScreen.style.display === 'block')) {
            if (e.key === 'ArrowRight') nextQuestion();
            if (e.key === 'ArrowLeft') prevQuestion();
            if (e.key === 'Enter') applyDecision('match');
            if (e.key === 'Backspace') applyDecision('skip');
        }
    });
}


// Добавляем кнопки для тестирования свайпов на ПК
function addTestButtons() {
    if (window.innerWidth > 768) { // Только для десктопа
        const testDiv = document.createElement('div');
        testDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        `;
        
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Предыдущий';
        prevBtn.style.cssText = `
            padding: 10px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        prevBtn.onclick = () => {
            if (questionsScreen.classList.contains('active')) {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    updateQuestionsPosition();
                    updateQuestionCounter();
                    showSwipeFeedback('left', 'question');
                }
            } else if (categoriesScreen.style.display !== 'none') {
                if (currentCategoryIndex > 0) {
                    currentCategoryIndex--;
                    updateCategoriesPosition();
                    showSwipeFeedback('left', 'category');
                }
            }
        };
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Следующий →';
        nextBtn.style.cssText = `
            padding: 10px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        nextBtn.onclick = () => {
            if (questionsScreen.classList.contains('active')) {
                if (!selectedCategory) return;
                const questions = getQuestions(selectedCategory.id);
                if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    updateQuestionsPosition();
                    updateQuestionCounter();
                    showSwipeFeedback('right', 'question');
                }
            } else if (categoriesScreen.style.display !== 'none') {
                if (currentCategoryIndex < categories.length - 1) {
                    currentCategoryIndex++;
                    updateCategoriesPosition();
                    showSwipeFeedback('right', 'category');
                }
            }
        };
        
        testDiv.appendChild(prevBtn);
        testDiv.appendChild(nextBtn);
        document.body.appendChild(testDiv);
    }
}


async function init() {
    const ok = await loadQuestions();
    if (!ok) return;

    // Пул для рандома
    buildRandomPool();

    // Рендер категорий
    renderCategories();
    updateCategoriesPosition();

    // Свайпы
    setupSimpleSwipeGestures();

    // Слушатели
    setupEventListeners();

    // Тема
    initTheme();

    // Экран старта
    if (questionsScreen) questionsScreen.style.display = 'none';
    if (resultsScreen) resultsScreen.classList.remove('show');
    if (categoriesScreen) categoriesScreen.style.display = 'flex';
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);
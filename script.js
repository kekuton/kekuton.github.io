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
    { id: "Воспоминания", name: "Воспоминания", icon: "📸", desc: "О вашем прошлом" },
    { id: "Блиц", name: "Блиц", icon: "⚡", desc: "Вопросы на время" },
    { id: "Флаги", name: "Флаги", icon: "🚩", desc: "Здоровые отношения" },
    { id: "Тимбилдинг", name: "Тимбилдинг", icon: "👥", desc: "Веселые вопросы" }
];


// Утилита: безопасно получить массив вопросов по id категории
function getQuestions(categoryId) {
    return (window.questionsData && window.questionsData[categoryId]) ? window.questionsData[categoryId] : [];
}

// Максимум точек прогресса (чтобы не лагало на больших категориях)
const MAX_PROGRESS_DOTS = 12;
// Глобальные переменные
let currentCategoryIndex = 0;
let currentQuestionIndex = 0;
let selectedCategory = null;
let blitzTimer = null;
let timeLeft = 30;
let blitzCorrectAnswers = 0;
let blitzTotalAnswered = 0;
let blitzCurrentIndex = 0;

// DOM элементы
const categoriesScreen = document.getElementById('categoriesScreen');
const questionsScreen = document.getElementById('questionsScreen');
const blitzScreen = document.getElementById('blitzScreen');
const categoriesTrack = document.getElementById('categoriesTrack');
const categoriesProgress = document.getElementById('categoriesProgress');
const questionsSlider = document.getElementById('questionsSlider');
const questionsProgress = document.getElementById('questionsProgress');
const currentCategoryName = document.getElementById('currentCategoryName');
const questionCounter = document.getElementById('questionCounter');
const timerElement = document.getElementById('timer');
const correctScore = document.getElementById('correctScore');
const totalScore = document.getElementById('totalScore');
const blitzQuestionText = document.getElementById('blitzQuestionText');
const themeToggle = document.getElementById('themeToggle');


function setAppHeight(heightPx) {
    const safeHeight = Math.max(320, Math.floor(heightPx || window.innerHeight));
    document.documentElement.style.setProperty('--app-height', `${safeHeight}px`);
}

function initTelegramFullscreen() {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
        setAppHeight(window.innerHeight);
        window.addEventListener('resize', () => setAppHeight(window.innerHeight));
        return;
    }

    tg.ready();
    tg.expand();

    if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
    }

    const applyTelegramHeight = () => {
        const telegramHeight = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
        setAppHeight(telegramHeight);
    };

    applyTelegramHeight();

    if (typeof tg.onEvent === 'function') {
        tg.onEvent('viewportChanged', applyTelegramHeight);
    }

    window.addEventListener('resize', applyTelegramHeight);
}

// Простая функция звука
function playSound(type) {
    debug(`Sound: ${type}`);
}

// Функция переключения темы
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-theme');
    
    if (isLight) {
        body.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Переключить на светлую тему');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Переключить на темную тему');
        localStorage.setItem('theme', 'light');
    }
    playSound('click');
}

// Загрузка сохраненной темы
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Переключить на темную тему');
    } else {
        document.body.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Переключить на светлую тему');
    }
}

// Проверяем, что questionsData загружен
function checkQuestionsData() {
    if (typeof window.questionsData === 'undefined') {
        console.error('questionsData не загружен! Проверьте файл questions.js');
        alert('Ошибка загрузки вопросов. Проверьте наличие файла questions.js');
        return false;
    }
    debug('questionsData загружен успешно, категорий:', Object.keys(window.questionsData).length);
    return true;
}

// Функция инициализации
async function init() {
    const loaded = await loadQuestions();
    if (!loaded) return;
    if (!checkQuestionsData()) return;
    initTelegramFullscreen();
    loadTheme();
    renderCategories();

    // Делегирование клика по категориям (не создаём сотни обработчиков)
    categoriesTrack.addEventListener('click', (e) => {
        const slide = e.target.closest('.category-slide');
        if (!slide) return;
        const idx = Number(slide.dataset.index);
        if (Number.isNaN(idx)) return;
        currentCategoryIndex = idx;
        updateCategoriesPosition();
        selectCategory(categories[idx]);
        playSound('tap');
    });

    setupSimpleSwipeGestures();
    setupEventListeners();
    debug('Приложение инициализировано');
}

// Рендеринг категорий
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
    
    // Свайпы для вопросов
    const questionsTrack = document.getElementById('questionsTrack');
    setupTouchSwipe(questionsTrack,
        // Свайп влево
        () => {
            debug('Свайп влево по вопросам');
            if (!selectedCategory) return;
            const questions = getQuestions(selectedCategory.id);
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                updateQuestionsPosition();
                showSwipeFeedback('right', 'question');
                updateQuestionCounter();
                playSound('swipe');
            }
        },
        // Свайп вправо
        () => {
            debug('Свайп вправо по вопросам');
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                updateQuestionsPosition();
                showSwipeFeedback('left', 'question');
                updateQuestionCounter();
                playSound('swipe');
            }
        }
    );
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
    selectedCategory = category;
    currentQuestionIndex = 0;
    
    debug(`Выбрана категория: ${category.id}`);
    
    if (category.id === 'Блиц') {
        startBlitzMode();
    } else {
        if (!getQuestions(category.id) || getQuestions(category.id).length === 0) {
            alert(`В категории "${category.name}" пока нет вопросов!`);
            return;
        }
        showQuestionsScreen();
    }
}

// Показать экран вопросов
function showQuestionsScreen() {
    if (!selectedCategory) return;
    
    categoriesScreen.style.display = 'none';
    currentCategoryName.textContent = selectedCategory.name;
    renderQuestions();
    updateQuestionCounter();
    
    setTimeout(() => {
        questionsScreen.classList.add('active');
    }, 50);
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
            </div>
        </div>
    `;

    // Рендерим ограниченное число точек прогресса (или все, если мало)
    renderQuestionsProgress(questions.length);

    // Обновляем контент
    updateQuestionsPosition();
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
    if (!selectedCategory) return;
    const questions = getQuestions(selectedCategory.id);
    questionCounter.textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}`;
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
    questionsScreen.classList.remove('active');
    blitzScreen.classList.remove('active');
    
    if (blitzTimer) {
        clearInterval(blitzTimer);
        blitzTimer = null;
    }
    
    setTimeout(() => {
        categoriesScreen.style.display = 'flex';
        
        const translateX = -currentCategoryIndex * 100;
        categoriesTrack.style.transform = `translateX(${translateX}%)`;
        
        currentQuestionIndex = 0;
        selectedCategory = null;
        
        Array.from(categoriesTrack.children).forEach((slide, index) => {
            slide.firstElementChild?.classList.toggle('active', index === currentCategoryIndex);
        });
        
        timerElement.textContent = '30';
        timerElement.style.color = '';
        timerElement.style.textShadow = '';
        
        debug('Вернулись на главный экран');
    }, 450);
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('backFromQuestions').addEventListener('click', () => {
        playSound('click');
        backToMain();
    });
    
    document.getElementById('backFromBlitz').addEventListener('click', () => {
        playSound('click');
        if (blitzTimer) clearInterval(blitzTimer);
        backToMain();
    });
    
    document.getElementById('correctBtn').addEventListener('click', () => {
        playSound('correct');
        const questions = window.questionsData['Блиц'] || [];
        if (blitzCurrentIndex >= questions.length) return;
        
        blitzCorrectAnswers++;
        blitzTotalAnswered++;
        blitzCurrentIndex++;
        
        correctScore.textContent = blitzCorrectAnswers;
        showNextBlitzQuestion();
    });
    
    document.getElementById('incorrectBtn').addEventListener('click', () => {
        playSound('click');
        const questions = window.questionsData['Блиц'] || [];
        if (blitzCurrentIndex >= questions.length) return;
        
        blitzTotalAnswered++;
        blitzCurrentIndex++;
        
        showNextBlitzQuestion();
    });
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Клавиатурная навигация для тестирования
    document.addEventListener('keydown', (e) => {
        if (questionsScreen.classList.contains('active')) {
            const questions = getQuestions(selectedCategory.id);
            
            if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
                playSound('swipe');
                currentQuestionIndex--;
                updateQuestionsPosition();
                updateQuestionCounter();
                showSwipeFeedback('left', 'question');
                debug('Клавиша влево');
            } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
                playSound('swipe');
                currentQuestionIndex++;
                updateQuestionsPosition();
                updateQuestionCounter();
                showSwipeFeedback('right', 'question');
                debug('Клавиша вправо');
            } else if (e.key === 'Escape') {
                backToMain();
            }
        }
        
        if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleTheme();
        }
    });
    
    // Добавим кнопки для тестирования на ПК
    addTestButtons();
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

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);
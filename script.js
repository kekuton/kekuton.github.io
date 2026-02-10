// script.js - УПРОЩЕННЫЙ КОД С РАБОЧИМИ СВАЙПАМИ ДЛЯ ТЕЛЕФОНА

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

// Простая функция звука
function playSound(type) {
    console.log(`Sound: ${type}`);
}

// Функция переключения темы
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-theme');
    
    if (isLight) {
        body.classList.remove('light-theme');
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('aria-label', 'Переключить на светлую тему');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeToggle.innerHTML = '☀️';
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
        themeToggle.innerHTML = '☀️';
        themeToggle.setAttribute('aria-label', 'Переключить на темную тему');
    } else {
        document.body.classList.remove('light-theme');
        themeToggle.innerHTML = '🌙';
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
    console.log('questionsData загружен успешно, категорий:', Object.keys(window.questionsData).length);
    return true;
}

// Функция инициализации
function init() {
    if (!checkQuestionsData()) return;
    
    loadTheme();
    renderCategories();
    setupSimpleSwipeGestures();
    setupEventListeners();
    console.log('Приложение инициализировано');
}

// Рендеринг категорий
function renderCategories() {
    categoriesTrack.innerHTML = '';
    categoriesProgress.innerHTML = '';
    
    categories.forEach((category, index) => {
        const slide = document.createElement('div');
        slide.className = 'category-slide';
        slide.style.setProperty('--index', index);
        slide.innerHTML = `
            <div class="category-card ${index === currentCategoryIndex ? 'active' : ''}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-desc">${category.desc}</div>
                <div class="category-counter">${index + 1} / ${categories.length}</div>
            </div>
        `;
        
        slide.addEventListener('click', () => {
            playSound('click');
            selectCategory(category);
        });
        
        categoriesTrack.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === currentCategoryIndex ? 'active' : ''}`;
        categoriesProgress.appendChild(dot);
    });
    
    updateCategoriesPosition();
}

// Обновление позиции категорий
function updateCategoriesPosition() {
    const translateX = -currentCategoryIndex * 100;
    categoriesTrack.style.transform = `translateX(${translateX}%)`;
    
    document.querySelectorAll('.category-card').forEach((card, index) => {
        card.classList.toggle('active', index === currentCategoryIndex);
    });
    
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCategoryIndex);
    });
}

// САМЫЕ ПРОСТЫЕ СВАЙПЫ ДЛЯ ТЕЛЕФОНА
function setupSimpleSwipeGestures() {
    console.log('Настройка простых свайпов для телефона');
    
    // Свайпы для категорий
    const categoriesContainer = document.getElementById('categoriesContainer');
    setupTouchSwipe(categoriesContainer, 
        // Свайп влево
        () => {
            console.log('Свайп влево по категориям');
            if (currentCategoryIndex < categories.length - 1) {
                currentCategoryIndex++;
                updateCategoriesPosition();
                showSwipeFeedback('right', 'category');
                playSound('swipe');
            }
        },
        // Свайп вправо
        () => {
            console.log('Свайп вправо по категориям');
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
            console.log('Свайп влево по вопросам');
            if (!selectedCategory) return;
            const questions = window.questionsData[selectedCategory.id] || [];
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
            console.log('Свайп вправо по вопросам');
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
        console.log('touchstart на элементе');
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
        console.log('touchend на элементе');
        if (!startX) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        // Вычисляем разницу
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Игнорируем вертикальные свайпы (скролл)
        if (Math.abs(diffY) > Math.abs(diffX)) {
            console.log('Вертикальный свайп, игнорируем');
            return;
        }
        
        // Минимальное расстояние для свайпа
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                console.log('Определен свайп влево, diffX:', diffX);
                if (onSwipeLeft) onSwipeLeft();
            } else {
                console.log('Определен свайп вправо, diffX:', diffX);
                if (onSwipeRight) onSwipeRight();
            }
        }
        
        // Сбрасываем начальные координаты
        startX = 0;
        startY = 0;
    }, { passive: true });
    
    // Для тестирования на компьютере (мышь)
    element.addEventListener('mousedown', function(e) {
        console.log('mousedown на элементе');
        startX = e.clientX;
        startY = e.clientY;
    });
    
    element.addEventListener('mouseup', function(e) {
        console.log('mouseup на элементе');
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
                console.log('Мышь: свайп влево');
                if (onSwipeLeft) onSwipeLeft();
            } else {
                console.log('Мышь: свайп вправо');
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
    
    console.log(`Выбрана категория: ${category.id}`);
    
    if (category.id === 'Блиц') {
        startBlitzMode();
    } else {
        if (!window.questionsData[category.id] || window.questionsData[category.id].length === 0) {
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
    
    questionsSlider.innerHTML = '';
    questionsProgress.innerHTML = '';
    
    const questions = window.questionsData[selectedCategory.id] || [];
    
    if (questions.length === 0) {
        console.error('Нет вопросов в категории:', selectedCategory.id);
        alert('Нет вопросов в этой категории!');
        backToMain();
        return;
    }
    
    questions.forEach((question, index) => {
        const slide = document.createElement('div');
        slide.className = 'question-slide';
        slide.style.setProperty('--index', index);
        slide.innerHTML = `
            <div class="question-card">
                <div class="question-text">${question}</div>
            </div>
        `;
        questionsSlider.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === currentQuestionIndex ? 'active' : ''}`;
        questionsProgress.appendChild(dot);
    });
    
    updateQuestionsPosition();
}

// Обновление позиции вопросов
function updateQuestionsPosition() {
    if (!questionsSlider || !selectedCategory) return;
    
    const translateX = -currentQuestionIndex * 100;
    questionsSlider.style.transform = `translateX(${translateX}%)`;
    
    console.log(`Вопрос ${currentQuestionIndex + 1}, translateX: ${translateX}%`);
    
    const dots = document.querySelectorAll('#questionsProgress .progress-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentQuestionIndex);
    });
}

// Обновление счетчика вопросов
function updateQuestionCounter() {
    if (!selectedCategory) return;
    const questions = window.questionsData[selectedCategory.id] || [];
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
        
        document.querySelectorAll('.category-card').forEach((card, index) => {
            card.classList.toggle('active', index === currentCategoryIndex);
        });
        
        timerElement.textContent = '30';
        timerElement.style.color = '';
        timerElement.style.textShadow = '';
        
        console.log('Вернулись на главный экран');
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
            const questions = window.questionsData[selectedCategory.id] || [];
            
            if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
                playSound('swipe');
                currentQuestionIndex--;
                updateQuestionsPosition();
                updateQuestionCounter();
                showSwipeFeedback('left', 'question');
                console.log('Клавиша влево');
            } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
                playSound('swipe');
                currentQuestionIndex++;
                updateQuestionsPosition();
                updateQuestionCounter();
                showSwipeFeedback('right', 'question');
                console.log('Клавиша вправо');
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
                const questions = window.questionsData[selectedCategory.id] || [];
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

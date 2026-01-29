// script.js - Исправленная версия с рабочими свайпами

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

// Упрощенная функция звука (без AudioContext проблем)
function playSound(type) {
    // Просто консольный лог для отладки
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
    if (typeof questionsData === 'undefined') {
        console.error('questionsData не загружен! Проверьте файл questions.js');
        alert('Ошибка загрузки вопросов. Проверьте наличие файла questions.js');
        return false;
    }
    console.log('questionsData загружен успешно, категорий:', Object.keys(questionsData).length);
    return true;
}

// Функция инициализации
function init() {
    if (!checkQuestionsData()) return;
    
    loadTheme();
    renderCategories();
    setupSwipeGestures();
    setupEventListeners();
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

// НАСТРОЙКА СВАЙПОВ - ИСПРАВЛЕННАЯ ВЕРСИЯ
function setupSwipeGestures() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    const questionsTrack = document.getElementById('questionsTrack');
    
    // Простая функция для обработки свайпов
    function setupSwipe(element, onSwipeLeft, onSwipeRight) {
        let startX = 0;
        let isSwiping = false;
        
        // Touch events для мобильных
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            // Просто позволяем скроллить, движение обработаем в touchend
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            const threshold = 50; // Минимальное расстояние для свайпа
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0 && onSwipeLeft) {
                    // Свайп влево
                    onSwipeLeft();
                } else if (diff < 0 && onSwipeRight) {
                    // Свайп вправо
                    onSwipeRight();
                }
            }
        });
        
        // Mouse events для десктопа
        element.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isSwiping = true;
            
            const onMouseMove = (moveEvent) => {
                if (!isSwiping) return;
                // Просто следим за движением
            };
            
            const onMouseUp = (upEvent) => {
                if (!isSwiping) return;
                isSwiping = false;
                
                const endX = upEvent.clientX;
                const diff = startX - endX;
                const threshold = 50;
                
                if (Math.abs(diff) > threshold) {
                    if (diff > 0 && onSwipeLeft) {
                        onSwipeLeft();
                    } else if (diff < 0 && onSwipeRight) {
                        onSwipeRight();
                    }
                }
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
    
    // Свайпы для категорий
    setupSwipe(
        categoriesContainer,
        // onSwipeLeft
        () => {
            if (currentCategoryIndex < categories.length - 1) {
                currentCategoryIndex++;
                updateCategoriesPosition();
                showSwipeFeedback('right', 'category');
                playSound('swipe');
                console.log('Свайп влево по категориям');
            }
        },
        // onSwipeRight
        () => {
            if (currentCategoryIndex > 0) {
                currentCategoryIndex--;
                updateCategoriesPosition();
                showSwipeFeedback('left', 'category');
                playSound('swipe');
                console.log('Свайп вправо по категориям');
            }
        }
    );
    
    // Свайпы для вопросов
    setupSwipe(
        questionsTrack,
        // onSwipeLeft
        () => {
            if (!selectedCategory) return;
            const questions = questionsData[selectedCategory.id] || [];
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                updateQuestionsPosition();
                showSwipeFeedback('right', 'question');
                updateQuestionCounter();
                playSound('swipe');
                console.log('Свайп влево по вопросам');
            }
        },
        // onSwipeRight
        () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                updateQuestionsPosition();
                showSwipeFeedback('left', 'question');
                updateQuestionCounter();
                playSound('swipe');
                console.log('Свайп вправо по вопросам');
            }
        }
    );
}

// Показать анимацию свайпа
function showSwipeFeedback(direction, type) {
    const feedbackId = type === 'category' 
        ? (direction === 'left' ? 'swipeLeftFeedback' : 'swipeRightFeedback')
        : (direction === 'left' ? 'questionSwipeLeftFeedback' : 'questionSwipeRightFeedback');
    
    const feedback = document.getElementById(feedbackId);
    
    feedback.classList.remove('show');
    // Принудительный reflow для перезапуска анимации
    void feedback.offsetWidth;
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 500);
}

// Выбор категории
function selectCategory(category) {
    selectedCategory = category;
    currentQuestionIndex = 0;
    
    console.log(`Выбрана категория: ${category.id}`);
    
    // Проверяем, есть ли категория в questionsData
    if (!questionsData[category.id] || questionsData[category.id].length === 0) {
        if (category.id === 'Блиц') {
            // Для блица создаем вопросы по умолчанию
            if (!questionsData['Блиц'] || questionsData['Блиц'].length === 0) {
                questionsData['Блиц'] = [
                    "Твой любимый цвет?",
                    "Кофе или чай?",
                    "Утро или вечер?",
                    "Горы или море?",
                    "Кино или сериал?",
                    "Соленое или сладкое?",
                    "Книга или фильм?",
                    "Лето или зима?",
                    "Собака или кошка?",
                    "Пицца или суши?"
                ];
            }
            startBlitzMode();
        } else {
            alert(`В категории "${category.name}" пока нет вопросов!\n\nДобавьте вопросы в файл questions.js`);
            return;
        }
    } else if (category.id === 'Блиц') {
        startBlitzMode();
    } else {
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
    
    const questions = questionsData[selectedCategory.id] || [];
    
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
    const questions = questionsData[selectedCategory.id] || [];
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
    const questions = questionsData['Блиц'] || [];
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
    
    // Сброс стилей таймера
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
        const questions = questionsData['Блиц'] || [];
        if (blitzCurrentIndex >= questions.length) return;
        
        blitzCorrectAnswers++;
        blitzTotalAnswered++;
        blitzCurrentIndex++;
        
        correctScore.textContent = blitzCorrectAnswers;
        showNextBlitzQuestion();
    });
    
    document.getElementById('incorrectBtn').addEventListener('click', () => {
        playSound('click');
        const questions = questionsData['Блиц'] || [];
        if (blitzCurrentIndex >= questions.length) return;
        
        blitzTotalAnswered++;
        blitzCurrentIndex++;
        
        showNextBlitzQuestion();
    });
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Клавиатурная навигация
    document.addEventListener('keydown', (e) => {
        if (questionsScreen.classList.contains('active')) {
            const questions = questionsData[selectedCategory.id] || [];
            
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
        
        // Быстрое переключение темы Ctrl+T
        if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            toggleTheme();
        }
    });
    
    // Предотвращаем поведение по умолчанию для свайпов по вертикали
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.categories-container') || e.target.closest('.questions-track')) {
            // Разрешаем вертикальный скролл, но предотвращаем горизонтальный
            if (Math.abs(e.touches[0].clientX - e.touches[0].screenX) > 10) {
                e.preventDefault();
            }
        }
    }, { passive: false });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

// Предотвращаем масштабирование жестом
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

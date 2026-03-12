const categories = [
  { id: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы для близости' },
  { id: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке' },
  { id: 'Будущее', icon: '🔮', desc: 'Планы и мечты' },
  { id: 'Финансы', icon: '💰', desc: 'Вопросы о деньгах' },
  { id: 'Психология', icon: '🧠', desc: 'Глубокие вопросы' },
  { id: 'Воспоминания', icon: '📸', desc: 'О вашем прошлом' },
  { id: 'Блиц', icon: '⚡', desc: 'Быстрые вопросы' },
  { id: 'Флаги', icon: '🚩', desc: 'Красные и зелёные флаги' },
  { id: 'Тимбилдинг', icon: '👥', desc: 'Весёлые вопросы для пары' },
];

const state = {
  questionsData: {},
  mode: 'category',
  selectedCategory: null,
  pool: [],
  index: 0,
  stats: { match: 0, mismatch: 0, skip: 0 },
};

const el = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindElements();
  initTelegram();
  bindEvents();
  initTheme();
  try {
    await loadQuestions();
    renderCategories();
  } catch (e) {
    console.error(e);
    alert('Не удалось загрузить questions.json. Открой проект через сервер: python -m http.server');
  }
}

function bindElements() {
  [
    'categoriesScreen','questionsScreen','resultsScreen','categoriesGrid','themeToggle','randomBtn','backBtn','finishBtn',
    'categoryTitle','questionCounter','modeChip','questionText','questionSubhint','progressText','progressFill','tinderCard',
    'likeStamp','nopeStamp','prevBtn','skipBtn','mismatchBtn','matchBtn','resultsSubtitle','resultsPercent','resultsMatches',
    'resultsMismatches','resultsSkipped','shareBtn','restartBtn','backToCategoriesBtn','backToCategoriesTop'
  ].forEach(id => el[id] = document.getElementById(id));
}

async function loadQuestions() {
  const res = await fetch('./questions.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  state.questionsData = await res.json();
}

function bindEvents() {
  el.themeToggle.addEventListener('click', toggleTheme);
  el.randomBtn.addEventListener('click', startRandomMode);
  el.backBtn.addEventListener('click', showCategories);
  el.finishBtn.addEventListener('click', showResults);
  el.prevBtn.addEventListener('click', prevQuestion);
  el.skipBtn.addEventListener('click', () => answer('skip'));
  el.mismatchBtn.addEventListener('click', () => animateAnswer('mismatch'));
  el.matchBtn.addEventListener('click', () => animateAnswer('match'));
  el.restartBtn.addEventListener('click', restartCurrent);
  el.backToCategoriesBtn.addEventListener('click', showCategories);
  el.backToCategoriesTop.addEventListener('click', showCategories);
  el.shareBtn.addEventListener('click', shareResults);
  setupSwipeCard();
}

function initTheme() {
  const theme = localStorage.getItem('couple_theme');
  if (theme === 'light') document.body.classList.add('light');
  updateThemeBtn();
}

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('couple_theme', document.body.classList.contains('light') ? 'light' : 'dark');
  updateThemeBtn();
}

function updateThemeBtn() {
  el.themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
}

function renderCategories() {
  el.categoriesGrid.innerHTML = '';
  categories.forEach(cat => {
    const count = Array.isArray(state.questionsData[cat.id]) ? state.questionsData[cat.id].length : 0;
    const btn = document.createElement('button');
    btn.className = 'category-card';
    btn.innerHTML = `
      <div class="emoji">${cat.icon}</div>
      <div class="name">${cat.id}</div>
      <div class="desc">${cat.desc}</div>
      <div class="desc">${count} вопросов</div>
    `;
    btn.addEventListener('click', () => startCategory(cat.id));
    el.categoriesGrid.appendChild(btn);
  });
}

function getQuestions(categoryId) {
  return Array.isArray(state.questionsData[categoryId]) ? state.questionsData[categoryId] : [];
}

function startCategory(categoryId) {
  const questions = getQuestions(categoryId);
  if (!questions.length) {
    alert(`В категории «${categoryId}» пока нет вопросов.`);
    return;
  }
  state.mode = 'category';
  state.selectedCategory = categoryId;
  state.pool = questions.slice();
  resetRun();
  el.modeChip.textContent = 'Категория';
  el.categoryTitle.textContent = categoryId;
  showQuestionScreen();
}

function startRandomMode() {
  const pool = [];
  categories.forEach(cat => {
    getQuestions(cat.id).forEach(q => pool.push({ category: cat.id, text: q }));
  });
  if (!pool.length) {
    alert('Нет вопросов для рандом-режима.');
    return;
  }
  shuffle(pool);
  state.mode = 'random';
  state.selectedCategory = 'Рандом';
  state.pool = pool;
  resetRun();
  el.modeChip.textContent = 'Рандом';
  el.categoryTitle.textContent = '🎲 Рандом';
  showQuestionScreen();
}

function resetRun() {
  state.index = 0;
  state.stats = { match: 0, mismatch: 0, skip: 0 };
}

function showQuestionScreen() {
  el.categoriesScreen.classList.add('hidden');
  el.resultsScreen.classList.add('hidden');
  el.questionsScreen.classList.remove('hidden');
  renderQuestion();
}

function showCategories() {
  el.questionsScreen.classList.add('hidden');
  el.resultsScreen.classList.add('hidden');
  el.categoriesScreen.classList.remove('hidden');
  if (window.Telegram?.WebApp?.BackButton) window.Telegram.WebApp.BackButton.hide();
}

function currentItem() {
  return state.pool[state.index];
}

function renderQuestion() {
  const item = currentItem();
  if (!item) {
    showResults();
    return;
  }

  let text = item;
  let sub = 'Свайп влево/вправо или кнопки ниже';
  if (state.mode === 'random') {
    text = item.text;
    sub = `Категория: ${item.category}`;
  }

  el.questionText.textContent = text;
  el.questionSubhint.textContent = sub;
  el.questionCounter.textContent = `Вопрос ${state.index + 1} из ${state.pool.length}`;
  el.progressText.textContent = `${state.index + 1} / ${state.pool.length}`;
  el.progressFill.style.width = `${((state.index + 1) / state.pool.length) * 100}%`;
  resetCardVisuals();

  if (window.Telegram?.WebApp?.BackButton) {
    window.Telegram.WebApp.BackButton.show();
    window.Telegram.WebApp.BackButton.offClick(showCategories);
    window.Telegram.WebApp.BackButton.onClick(showCategories);
  }
}

function prevQuestion() {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
}

function answer(type) {
  state.stats[type] += 1;
  state.index += 1;
  renderQuestion();
}

function animateAnswer(type) {
  const card = el.tinderCard;
  const x = type === 'match' ? 420 : -420;
  card.style.transition = 'transform .28s ease, opacity .28s ease';
  card.style.transform = `translateX(${x}px) rotate(${type === 'match' ? 18 : -18}deg)`;
  card.style.opacity = '0';
  setTimeout(() => answer(type), 220);
}

function resetCardVisuals() {
  const card = el.tinderCard;
  card.style.transition = 'none';
  card.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
  card.style.opacity = '1';
  el.likeStamp.style.opacity = '0';
  el.nopeStamp.style.opacity = '0';
  requestAnimationFrame(() => card.style.transition = 'transform .18s ease, opacity .18s ease');
}

function setupSwipeCard() {
  const card = el.tinderCard;
  let startX = 0, startY = 0, dragging = false;

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    card.style.transform = `translateX(${dx}px) translateY(${dy * 0.08}px) rotate(${dx * 0.05}deg)`;
    const likeOpacity = Math.max(0, Math.min(1, dx / 120));
    const nopeOpacity = Math.max(0, Math.min(1, -dx / 120));
    el.likeStamp.style.opacity = String(likeOpacity);
    el.nopeStamp.style.opacity = String(nopeOpacity);
  };

  const onEnd = (clientX, clientY) => {
    if (!dragging) return;
    dragging = false;
    const dx = clientX - startX;
    const dy = Math.abs(clientY - startY);
    if (Math.abs(dx) > 110 && dy < 180) {
      animateAnswer(dx > 0 ? 'match' : 'mismatch');
    } else {
      resetCardVisuals();
    }
  };

  card.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY; dragging = true;
  }, { passive: true });
  card.addEventListener('touchmove', e => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });
  card.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    onEnd(t.clientX, t.clientY);
  }, { passive: true });

  card.addEventListener('mousedown', e => {
    startX = e.clientX; startY = e.clientY; dragging = true;
  });
  window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', e => onEnd(e.clientX, e.clientY));
}

function showResults() {
  const answered = state.stats.match + state.stats.mismatch;
  const percent = answered ? Math.round((state.stats.match / answered) * 100) : 0;
  el.resultsSubtitle.textContent = state.selectedCategory || 'Результаты';
  el.resultsPercent.textContent = `${percent}%`;
  el.resultsMatches.textContent = state.stats.match;
  el.resultsMismatches.textContent = state.stats.mismatch;
  el.resultsSkipped.textContent = state.stats.skip;
  el.questionsScreen.classList.add('hidden');
  el.categoriesScreen.classList.add('hidden');
  el.resultsScreen.classList.remove('hidden');
}

function restartCurrent() {
  if (state.mode === 'random') startRandomMode();
  else if (state.selectedCategory) startCategory(state.selectedCategory);
  else showCategories();
}

async function shareResults() {
  const answered = state.stats.match + state.stats.mismatch;
  const percent = answered ? Math.round((state.stats.match / answered) * 100) : 0;
  const text = `Категория: ${state.selectedCategory}\nСовместимость: ${percent}%\nСовпало: ${state.stats.match}\nНе совпало: ${state.stats.mismatch}\nПропущено: ${state.stats.skip}`;
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch {}
  }
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    alert('Результаты скопированы в буфер обмена');
  } catch {
    alert(text);
  }
}

function initTelegram() {
  if (!window.Telegram || !window.Telegram.WebApp) return;
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

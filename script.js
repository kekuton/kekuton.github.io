const categories = [
  { id: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы для близости', adult: true },
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
  room: null,
  pendingAdultCategory: null,
  deferredPrompt: null,
};

const el = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindElements();
  initTelegram();
  bindEvents();
  initTheme();
  initStandaloneMode();
  try {
    await loadQuestions();
    renderCategories();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(console.error);
    }
    restoreRoomFromUrl();
  } catch (e) {
    console.error(e);
    alert('Не удалось загрузить questions.json. Открой проект через сервер или GitHub Pages.');
  }
}

function bindElements() {
  [
    'categoriesScreen','questionsScreen','resultsScreen','categoriesGrid','themeToggle','randomBtn','backBtn','finishBtn',
    'categoryTitle','questionCounter','modeChip','questionText','questionSubhint','progressText','progressFill','tinderCard',
    'likeStamp','nopeStamp','prevBtn','skipBtn','mismatchBtn','matchBtn','resultsSubtitle','resultsPercent','resultsMatches',
    'resultsMismatches','resultsSkipped','resultsCopy','shareBtn','saveImageBtn','restartBtn','backToCategoriesBtn','backToCategoriesTop',
    'fullscreenBtn','installBtn','createRoomBtn','joinRoomBtn','roomBanner','roomChip','ageModal','ageConfirmBtn','ageDeclineBtn',
    'roomModal','roomCodeText','copyRoomBtn','joinRoomInput','joinRoomConfirmBtn','closeRoomModalBtn','createCategoryRoomBtn',
    'roomQr','shareCanvas'
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
  el.saveImageBtn.addEventListener('click', downloadResultsImage);
  el.fullscreenBtn.addEventListener('click', enterFullscreen);
  el.createRoomBtn.addEventListener('click', openRoomModalForCreate);
  el.joinRoomBtn.addEventListener('click', openRoomModalForJoin);
  el.copyRoomBtn.addEventListener('click', copyRoomCode);
  el.joinRoomConfirmBtn.addEventListener('click', joinRoomFromInput);
  el.closeRoomModalBtn.addEventListener('click', closeRoomModal);
  el.createCategoryRoomBtn.addEventListener('click', createRoomFromCurrentSelection);
  el.ageConfirmBtn.addEventListener('click', confirmAdultCategory);
  el.ageDeclineBtn.addEventListener('click', closeAgeModal);
  el.installBtn.addEventListener('click', installPwa);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
    el.installBtn.classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    el.installBtn.classList.add('hidden');
    state.deferredPrompt = null;
  });

  window.addEventListener('keydown', (e) => {
    if (!el.questionsScreen.classList.contains('hidden')) {
      if (e.key === 'ArrowRight') animateAnswer('match');
      if (e.key === 'ArrowLeft') animateAnswer('mismatch');
      if (e.key === 'ArrowUp') prevQuestion();
      if (e.key === ' ') { e.preventDefault(); answer('skip'); }
    }
  });

  [el.ageModal, el.roomModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

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
    btn.dataset.slug = cat.id.toLowerCase().replace(/[^а-яa-z0-9]+/g, '-');
    btn.dataset.icon = cat.icon;
    btn.innerHTML = `
      <div class="card-topline">
        <div class="emoji">${cat.icon}</div>
        ${cat.adult ? '<span class="adult-badge">18+</span>' : ''}
      </div>
      <div class="category-art" aria-hidden="true">${cat.icon}</div>
      <div class="name">${cat.id}</div>
      <div class="desc">${cat.desc}</div>
      <div class="desc count">${count} вопросов</div>
    `;
    btn.addEventListener('click', () => handleCategoryClick(cat));
    el.categoriesGrid.appendChild(btn);
  });
}

function handleCategoryClick(cat) {
  if (cat.adult && !localStorage.getItem('adult_confirmed')) {
    state.pendingAdultCategory = cat.id;
    el.ageModal.classList.remove('hidden');
    return;
  }
  startCategory(cat.id);
}

function confirmAdultCategory() {
  localStorage.setItem('adult_confirmed', '1');
  const categoryId = state.pendingAdultCategory;
  state.pendingAdultCategory = null;
  closeAgeModal();
  if (categoryId) startCategory(categoryId);
}

function closeAgeModal() {
  el.ageModal.classList.add('hidden');
}

function getQuestions(categoryId) {
  return Array.isArray(state.questionsData[categoryId]) ? state.questionsData[categoryId] : [];
}

function startCategory(categoryId, fromRoom = false) {
  const questions = getQuestions(categoryId);
  if (!questions.length) {
    alert(`В категории «${categoryId}» пока нет вопросов.`);
    return;
  }
  state.mode = fromRoom ? 'room' : 'category';
  state.selectedCategory = categoryId;
  state.pool = questions.slice();
  if (state.mode === 'room' && state.room?.seed) {
    shuffleWithSeed(state.pool, state.room.seed);
  }
  resetRun();
  el.modeChip.textContent = state.mode === 'room' ? 'Комната' : 'Категория';
  el.categoryTitle.textContent = categoryId;
  updateRoomBanner();
  showQuestionScreen();
}

function startRandomMode(seed = null, fromRoom = false) {
  const pool = [];
  categories.forEach(cat => {
    getQuestions(cat.id).forEach(q => pool.push({ category: cat.id, text: q }));
  });
  if (!pool.length) {
    alert('Нет вопросов для рандом-режима.');
    return;
  }
  if (seed) shuffleWithSeed(pool, seed);
  else shuffle(pool);
  state.mode = fromRoom ? 'room-random' : 'random';
  state.selectedCategory = 'Рандом';
  state.pool = pool;
  resetRun();
  el.modeChip.textContent = fromRoom ? 'Комната' : 'Рандом';
  el.categoryTitle.textContent = '🎲 Рандом';
  updateRoomBanner();
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
  if (state.mode.includes('random')) {
    text = item.text;
    sub = `Категория: ${item.category}`;
  }

  el.questionText.textContent = text;
  el.questionSubhint.textContent = sub;
  el.questionCounter.textContent = `Вопрос ${state.index + 1} из ${state.pool.length}`;
  el.progressText.textContent = `${state.index + 1} / ${state.pool.length}`;
  el.progressFill.style.width = `${((state.index + 1) / state.pool.length) * 100}%`;
  el.roomChip.classList.toggle('hidden', !state.room);
  if (state.room) el.roomChip.textContent = `Код: ${state.room.code}`;
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
    el.likeStamp.style.opacity = String(Math.max(0, Math.min(1, dx / 120)));
    el.nopeStamp.style.opacity = String(Math.max(0, Math.min(1, -dx / 120)));
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
    const t = e.touches[0]; onMove(t.clientX, t.clientY);
  }, { passive: true });
  card.addEventListener('touchend', e => {
    const t = e.changedTouches[0]; onEnd(t.clientX, t.clientY);
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
  el.resultsSubtitle.textContent = state.room ? `${state.selectedCategory} • комната ${state.room.code}` : (state.selectedCategory || 'Результаты');
  el.resultsPercent.textContent = `${percent}%`;
  el.resultsMatches.textContent = state.stats.match;
  el.resultsMismatches.textContent = state.stats.mismatch;
  el.resultsSkipped.textContent = state.stats.skip;
  el.resultsCopy.textContent = getResultsCopy(percent);
  el.questionsScreen.classList.add('hidden');
  el.categoriesScreen.classList.add('hidden');
  el.resultsScreen.classList.remove('hidden');
}

function getResultsCopy(percent) {
  if (percent >= 90) return 'Очень сильный мэтч. Вы почти на одной волне.';
  if (percent >= 70) return 'Классная совместимость. Есть хорошее понимание друг друга.';
  if (percent >= 50) return 'Неплохо. Есть и совпадения, и пространство для новых разговоров.';
  return 'Разные взгляды — это тоже интересно. Вас ждёт много разговоров.';
}

function restartCurrent() {
  if (state.mode === 'random') startRandomMode();
  else if (state.mode === 'room-random' && state.room) startRandomMode(state.room.seed, true);
  else if (state.mode === 'room' && state.selectedCategory) startCategory(state.selectedCategory, true);
  else if (state.selectedCategory) startCategory(state.selectedCategory);
  else showCategories();
}

async function shareResults() {
  const blob = await generateResultsImageBlob();
  const answered = state.stats.match + state.stats.mismatch;
  const percent = answered ? Math.round((state.stats.match / answered) * 100) : 0;
  const text = `Категория: ${state.selectedCategory}\nСовместимость: ${percent}%\nСовпало: ${state.stats.match}\nНе совпало: ${state.stats.mismatch}\nПропущено: ${state.stats.skip}`;
  const file = new File([blob], 'result.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ text, files: [file], title: 'Результаты пары' });
      return;
    } catch {}
  }
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=&text=${encodeURIComponent(text)}`);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    alert('Текст результатов скопирован. Картинку можно сохранить отдельно.');
  } catch {
    alert(text);
  }
}

async function downloadResultsImage() {
  const blob = await generateResultsImageBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'couple-results.png';
  a.click();
  URL.revokeObjectURL(url);
}

function generateResultsImageBlob() {
  return new Promise((resolve) => {
    const canvas = el.shareCanvas;
    const ctx = canvas.getContext('2d');
    const answered = state.stats.match + state.stats.mismatch;
    const percent = answered ? Math.round((state.stats.match / answered) * 100) : 0;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#111827');
    gradient.addColorStop(0.55, '#312e81');
    gradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(140, 250, 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(940, 350, 240, 0, Math.PI * 2); ctx.fill();

    roundRect(ctx, 70, 180, 940, 1460, 42, 'rgba(255,255,255,0.12)');

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px Inter, Arial';
    ctx.fillText('Вопросы для двоих', 540, 310);

    ctx.font = '32px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.84)';
    ctx.fillText(state.selectedCategory || 'Результаты', 540, 365);

    ctx.font = 'bold 210px Inter, Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${percent}%`, 540, 690);

    ctx.font = '36px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(getResultsCopy(percent), 540, 770);

    drawMetric(ctx, 145, 920, 250, 230, 'Совпало', String(state.stats.match), '#22c55e');
    drawMetric(ctx, 415, 920, 250, 230, 'Не совпало', String(state.stats.mismatch), '#ef4444');
    drawMetric(ctx, 685, 920, 250, 230, 'Пропущено', String(state.stats.skip), '#f59e0b');

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 42px Inter, Arial';
    ctx.fillText('Поделитесь результатом с партнёром', 540, 1290);
    ctx.font = '28px Inter, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText('GitHub Pages • Telegram Mini App • Multiplayer room', 540, 1350);

    if (state.room?.code) {
      ctx.font = 'bold 34px Inter, Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Код комнаты: ${state.room.code}`, 540, 1470);
    }

    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function drawMetric(ctx, x, y, w, h, label, value, color) {
  roundRect(ctx, x, y, w, h, 30, 'rgba(255,255,255,0.11)');
  ctx.fillStyle = 'rgba(255,255,255,0.74)';
  ctx.font = '28px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 72);
  ctx.fillStyle = color;
  ctx.font = 'bold 82px Inter, Arial';
  ctx.fillText(value, x + w / 2, y + 155);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function initTelegram() {
  if (!window.Telegram || !window.Telegram.WebApp) return;
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  try {
    tg.requestFullscreen?.();
  } catch {}
  document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px');
}

function initStandaloneMode() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (standalone) document.body.classList.add('standalone');
}

async function enterFullscreen() {
  const root = document.documentElement;
  try {
    if (window.Telegram?.WebApp?.requestFullscreen) {
      window.Telegram.WebApp.requestFullscreen();
      return;
    }
    if (!document.fullscreenElement) await root.requestFullscreen();
    else await document.exitFullscreen();
  } catch (e) {
    console.warn('Fullscreen unavailable', e);
  }
}

async function installPwa() {
  if (!state.deferredPrompt) return;
  state.deferredPrompt.prompt();
  await state.deferredPrompt.userChoice;
  state.deferredPrompt = null;
  el.installBtn.classList.add('hidden');
}

function openRoomModalForCreate() {
  el.roomModal.classList.remove('hidden');
  el.roomCodeText.textContent = '------';
  el.joinRoomInput.value = '';
  el.roomQr.classList.add('hidden');
}

function openRoomModalForJoin() {
  el.roomModal.classList.remove('hidden');
  el.joinRoomInput.focus();
}

function closeRoomModal() {
  el.roomModal.classList.add('hidden');
}

function createRoomFromCurrentSelection() {
  let payload;
  const seed = Math.floor(Math.random() * 9999999) + 1000;
  if (state.selectedCategory) {
    payload = { t: state.mode.includes('random') ? 'random' : 'category', v: state.selectedCategory, s: seed };
  } else {
    payload = { t: 'random', v: 'Рандом', s: seed };
  }
  const code = encodeRoomPayload(payload);
  state.room = { code, ...payload };
  el.roomCodeText.textContent = code;
  el.joinRoomInput.value = code;
  renderRoomQr(code);
  updateRoomBanner();
  navigator.clipboard?.writeText(code).catch(() => {});
}

function joinRoomFromInput() {
  const code = el.joinRoomInput.value.trim();
  if (!code) return;
  const payload = decodeRoomPayload(code);
  if (!payload) {
    alert('Неверный код комнаты');
    return;
  }
  state.room = { code, ...payload };
  history.replaceState(null, '', `${location.pathname}#room=${encodeURIComponent(code)}`);
  updateRoomBanner();
  closeRoomModal();
  if (payload.t === 'random') startRandomMode(payload.s, true);
  else startCategory(payload.v, true);
}

function encodeRoomPayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeRoomPayload(code) {
  try {
    const normalized = code.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(normalized)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function renderRoomQr(code) {
  const roomUrl = `${location.origin}${location.pathname}#room=${encodeURIComponent(code)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(roomUrl)}`;
  el.roomQr.src = qrUrl;
  el.roomQr.classList.remove('hidden');
}

function copyRoomCode() {
  const code = el.roomCodeText.textContent.trim();
  if (!code || code === '------') return;
  navigator.clipboard?.writeText(code).then(() => {
    el.copyRoomBtn.textContent = 'Скопировано';
    setTimeout(() => el.copyRoomBtn.textContent = 'Скопировать код', 1200);
  }).catch(() => {});
}

function restoreRoomFromUrl() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const code = hash.get('room');
  if (!code) return;
  const payload = decodeRoomPayload(code);
  if (!payload) return;
  state.room = { code, ...payload };
  updateRoomBanner();
  if (payload.t === 'random') startRandomMode(payload.s, true);
  else startCategory(payload.v, true);
}

function updateRoomBanner() {
  if (!state.room) {
    el.roomBanner.classList.add('hidden');
    return;
  }
  el.roomBanner.classList.remove('hidden');
  el.roomBanner.innerHTML = `Комната активна: <b>${state.room.code}</b><br><span>Открой ссылку с этим кодом у второго игрока, чтобы пройти одинаковый набор вопросов.</span>`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleWithSeed(arr, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

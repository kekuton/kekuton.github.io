(() => {
  'use strict';

  const tg = window.Telegram?.WebApp;

  const STORAGE_KEYS = {
    theme: 'couples_theme',
    history: 'couples_history',
    premium: 'premium_unlocked',
    adult: 'adult_ok',
    customQuestions: 'custom_questions',
    questionsCache: 'couples_questions_v4'
  };

  const CATEGORY_META = [
    { id: 'Интимные вопросы', icon: '🔞', desc: 'Откровенные вопросы', color: 'linear-gradient(180deg,#f59e0b,#fb7185)', badge: '18+' },
    { id: 'На расстоянии', icon: '✈️', desc: 'Для пар в разлуке', color: 'linear-gradient(180deg,#38bdf8,#6366f1)' },
    { id: 'Будущее', icon: '🔮', desc: 'Планы, мечты и семья', color: 'linear-gradient(180deg,#c084fc,#ec4899)' },
    { id: 'Финансы', icon: '💰', desc: 'Деньги, цели и бюджет', color: 'linear-gradient(180deg,#f59e0b,#f97316)' },
    { id: 'Психология', icon: '🧠', desc: 'Эмоции и границы', color: 'linear-gradient(180deg,#22c55e,#14b8a6)' },
    { id: 'Воспоминания', icon: '📸', desc: 'Лучшие моменты вместе', color: 'linear-gradient(180deg,#60a5fa,#8b5cf6)' },
    { id: 'Блиц', icon: '⚡', desc: 'Проверка знаний (30 сек)', color: 'linear-gradient(180deg,#eab308,#ef4444)' },
    { id: 'Своя игра', icon: '✍️', desc: 'Создай свои вопросы', color: 'linear-gradient(180deg,#10b981,#3b82f6)', isPremium: true }
  ];

  const CATEGORY_BACKGROUNDS = {
    'Будущее': { file: 'images/bg_future.webp', bodyClass: 'category-future' },
    'На расстоянии': { file: 'images/bg_distance.webp', bodyClass: 'category-distance' },
    'Финансы': { file: 'images/bg_finance.webp', bodyClass: 'category-finance' }
  };

  const DUO_PLAYERS = ['Игрок 1', 'Игрок 2'];
  const ROOT_SCREENS = ['home', 'categories'];
  const SWIPE_HELP = 'Свайп: влево — не совпало, вправо — совпало, вверх — пропуск';

  const screens = {
    home: document.getElementById('homeScreen'),
    categories: document.getElementById('categoriesScreen'),
    intro: document.getElementById('categoryIntroScreen'),
    game: document.getElementById('gameScreen'),
    blitz: document.getElementById('blitzScreen'),
    results: document.getElementById('resultsScreen'),
    history: document.getElementById('historyScreen'),
    customGame: document.getElementById('customGameScreen')
  };

  const ui = {
    backBtn: document.getElementById('backBtn'),
    themeBtn: document.getElementById('themeBtn'),
    startBtn: document.getElementById('startBtn'),
    historyBtn: document.getElementById('historyBtn'),
    categoriesGrid: document.getElementById('categoriesGrid'),
    introCard: document.getElementById('categoryIntroCard'),

    gameCategory: document.getElementById('gameCategory'),
    gameTitle: document.getElementById('gameTitle'),
    progressLabel: document.getElementById('progressLabel'),
    progressFill: document.getElementById('progressFill'),
    questionText: document.getElementById('questionText'),
    questionCard: document.getElementById('questionCard'),
    swipeHelp: document.getElementById('swipeHelp'),
    matchBtn: document.getElementById('matchBtn'),
    mismatchBtn: document.getElementById('mismatchBtn'),
    skipBtn: document.getElementById('skipBtn'),
    turnBadge: document.getElementById('turnBadge'),

    blitzTimerDisplay: document.getElementById('blitzTimerDisplay'),
    blitzCorrectScore: document.getElementById('blitzCorrectScore'),
    blitzTotalScore: document.getElementById('blitzTotalScore'),
    blitzQuestionText: document.getElementById('blitzQuestionText'),
    blitzCorrectBtn: document.getElementById('blitzCorrectBtn'),
    blitzIncorrectBtn: document.getElementById('blitzIncorrectBtn'),

    resultsCategory: document.getElementById('resultsCategory'),
    resultsScore: document.getElementById('resultsScore'),
    resultsMessage: document.getElementById('resultsMessage'),
    statMatch: document.getElementById('statMatch'),
    statMismatch: document.getElementById('statMismatch'),
    statSkip: document.getElementById('statSkip'),
    statLabelMatch: document.getElementById('statLabelMatch'),
    statLabelMismatch: document.getElementById('statLabelMismatch'),
    restartBtn: document.getElementById('restartBtn'),
    changeCategoryBtn: document.getElementById('changeCategoryBtn'),
    shareBtn: document.getElementById('shareBtn'),
    historyList: document.getElementById('historyList'),

    adultModal: document.getElementById('adultModal'),
    adultConfirmBtn: document.getElementById('adultConfirmBtn'),
    adultCancelBtn: document.getElementById('adultCancelBtn'),
    customQuestionsList: document.getElementById('customQuestionsList'),
    addCustomQuestionBtn: document.getElementById('addCustomQuestionBtn'),
    saveCustomGameBtn: document.getElementById('saveCustomGameBtn'),
    premiumModal: document.getElementById('premiumModal'),
    buyPremiumBtn: document.getElementById('buyPremiumBtn'),
    closePremiumBtn: document.getElementById('closePremiumBtn'),
    passModal: document.getElementById('passModal'),
    passModalTitle: document.getElementById('passModalTitle'),
    passModalText: document.getElementById('passModalText'),
    passModalBtn: document.getElementById('passModalBtn')
  };

  const bgLayers = [document.querySelector('.bg-layer-a'), document.querySelector('.bg-layer-b')];

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    getRaw(key, fallback = null) {
      const value = localStorage.getItem(key);
      return value ?? fallback;
    },
    setRaw(key, value) {
      localStorage.setItem(key, value);
    }
  };

  const state = {
    questionsData: {},
    currentCategory: null,
    currentQuestions: [],
    currentIndex: 0,
    stats: { match: 0, mismatch: 0, skip: 0 },
    gameMode: 'solo',
    duoRoundAnswers: [null, null],
    duoActivePlayer: 0,
    pendingAdultCategory: null,
    navStack: ['home'],
    blitzTimer: null,
    blitzTimeLeft: 30,
    activeBgLayerIndex: 0,
    swipe: {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      dragging: false,
      pointerId: null,
      isAnimating: false
    }
  };

  const helpers = {
    shuffle(array) {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
    resultMessage(score, isBlitz = false) {
      if (isBlitz) {
        if (score >= 100) return 'Идеальное знание партнера! Ты помнишь каждую мелочь.';
        if (score >= 80) return 'Отличный результат! Вы очень хорошо знаете друг друга.';
        if (score >= 50) return 'Хороший результат, но есть что вспомнить и обсудить.';
        return 'Кажется, стоит почаще задавать друг другу вопросы и слушать внимательнее!';
      }
      if (score >= 100) return 'Идеальное совпадение! Вы мыслите как одна команда.';
      if (score >= 85) return 'Очень сильное совпадение — вы отлично чувствуете друг друга.';
      if (score >= 60) return 'Хороший результат. Есть много общего, но и повод для разговора.';
      return 'У вас разные взгляды — отличный повод поговорить откровенно и без давления.';
    },
    getCurrentCategoryQuestions(categoryId) {
      return state.questionsData[categoryId] || [];
    },
    getPremiumUnlocked() {
      return storage.getRaw(STORAGE_KEYS.premium) === 'true';
    },
    isAdultConfirmed() {
      return storage.getRaw(STORAGE_KEYS.adult) === 'yes';
    },
    formatHistoryDate(date = new Date()) {
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  };

  const background = {
    clearBodyClasses() {
      document.body.classList.remove('has-category-bg', 'category-future', 'category-distance', 'category-finance');
    },
    reset() {
      this.clearBodyClasses();
      bgLayers.forEach((layer, index) => {
        if (!layer) return;
        layer.style.background = 'var(--bg)';
        layer.style.backgroundImage = '';
        layer.classList.remove('prep', 'reveal');
        layer.classList.toggle('active', index === state.activeBgLayerIndex);
      });
    },
    apply(categoryId = '') {
      const config = CATEGORY_BACKGROUNDS[categoryId];
      const currentLayer = bgLayers[state.activeBgLayerIndex];
      const nextLayer = bgLayers[(state.activeBgLayerIndex + 1) % bgLayers.length];

      if (!config) {
        this.reset();
        return;
      }

      this.clearBodyClasses();
      document.body.classList.add('has-category-bg', config.bodyClass);
      if (!currentLayer || !nextLayer) return;

      nextLayer.style.background = '';
      nextLayer.style.backgroundImage = `url("${config.file}")`;
      nextLayer.style.backgroundSize = 'cover';
      nextLayer.style.backgroundPosition = 'center center';
      nextLayer.classList.remove('active', 'reveal');
      nextLayer.classList.add('prep');

      requestAnimationFrame(() => {
        nextLayer.classList.add('reveal');
        nextLayer.classList.remove('prep');
        currentLayer.classList.remove('active');
        nextLayer.classList.add('active');
        state.activeBgLayerIndex = (state.activeBgLayerIndex + 1) % bgLayers.length;
      });
    }
  };

  const fx = {
    vibrate(type = 'medium') {
      if (tg?.HapticFeedback) {
        if (['success', 'warning', 'error'].includes(type)) tg.HapticFeedback.notificationOccurred(type);
        else tg.HapticFeedback.impactOccurred(type);
        return;
      }
      if (navigator.vibrate) navigator.vibrate(type === 'warning' ? [8, 30, 8] : 12);
    },
    pulseAnswerButton(type) {
      const buttonMap = { match: ui.matchBtn, mismatch: ui.mismatchBtn, skip: ui.skipBtn };
      const classMap = { match: 'pulse-match', mismatch: 'pulse-mismatch', skip: 'pulse-skip' };
      const btn = buttonMap[type];
      const cls = classMap[type];
      if (!btn || !cls) return;
      btn.classList.remove(cls);
      void btn.offsetWidth;
      btn.classList.add(cls);
      setTimeout(() => btn.classList.remove(cls), 500);
    },
    launchReactionBurst(type, sourceEl = null) {
      const wrap = document.createElement('div');
      wrap.className = 'reaction-burst';
      const palette = {
        match: ['#34d399', '#86efac', '#dcfce7', '#ffffff'],
        mismatch: ['#fb7185', '#fda4af', '#ffe4e6', '#ffffff'],
        skip: ['#fbbf24', '#fde68a', '#fef3c7', '#ffffff']
      }[type] || ['#ffffff'];

      const rect = sourceEl?.getBoundingClientRect?.() || {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        width: 0,
        height: 0
      };
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      for (let i = 0; i < 18; i += 1) {
        const particle = document.createElement('span');
        const angle = (Math.PI * 2 * i) / 18;
        const distance = 30 + Math.random() * 90;
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.background = palette[Math.floor(Math.random() * palette.length)];
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        particle.style.animationDelay = `${Math.random() * 0.05}s`;
        wrap.appendChild(particle);
      }
      document.body.appendChild(wrap);
      setTimeout(() => wrap.remove(), 900);
    },
    launchConfetti() {
      const wrap = document.createElement('div');
      const colors = ['#f59e0b', '#f472b6', '#22c55e', '#60a5fa', '#ffffff', '#fde047'];
      wrap.className = 'confetti-wrap';
      document.body.appendChild(wrap);

      for (let i = 0; i < 120; i += 1) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.top = `${-10 - Math.random() * 20}%`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.transform = `translate3d(0,0,0) rotate(${Math.random() * 360}deg)`;
        piece.style.animationDuration = `${2.6 + Math.random() * 1.8}s`;
        piece.style.animationDelay = `${Math.random() * 0.18}s`;
        piece.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
        wrap.appendChild(piece);
      }
      setTimeout(() => wrap.remove(), 4600);
    }
  };

  const historyStore = {
    load() {
      return storage.get(STORAGE_KEYS.history, []);
    },
    save(entry) {
      const history = this.load();
      history.unshift(entry);
      storage.set(STORAGE_KEYS.history, history.slice(0, 12));
    }
  };

  const modals = {
    open(element) {
      if (!element) return;
      element.classList.remove('hidden');
      element.setAttribute('aria-hidden', 'false');
    },
    close(element) {
      if (!element) return;
      element.classList.add('hidden');
      element.setAttribute('aria-hidden', 'true');
    },
    closeAll() {
      [ui.adultModal, ui.premiumModal, ui.passModal].forEach((modal) => this.close(modal));
    }
  };

  const router = {
    show(name) {
      Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
      screens[name]?.classList.add('screen-active');

      if (ROOT_SCREENS.includes(name)) background.apply('');
      else if (state.currentCategory) background.apply(state.currentCategory.id);

      ui.backBtn.classList.toggle('hidden', ROOT_SCREENS.includes(name));
      if (state.navStack[state.navStack.length - 1] !== name) state.navStack.push(name);
    },
    back() {
      if (state.navStack.length <= 1) return;
      game.clearBlitzTimer();
      state.navStack.pop();
      const prev = state.navStack[state.navStack.length - 1];
      Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
      screens[prev]?.classList.add('screen-active');
      if (ROOT_SCREENS.includes(prev)) background.apply('');
      else if (state.currentCategory) background.apply(state.currentCategory.id);
      ui.backBtn.classList.toggle('hidden', ROOT_SCREENS.includes(prev));
    }
  };

  const theme = {
    apply(next) {
      document.body.classList.toggle('light', next === 'light');
      storage.setRaw(STORAGE_KEYS.theme, next);
      if (tg) tg.setHeaderColor(next === 'light' ? '#efe7ff' : '#9f7aea');
    },
    init() {
      const saved = storage.getRaw(STORAGE_KEYS.theme);
      if (tg?.colorScheme) this.apply(saved || tg.colorScheme);
      else this.apply(saved === 'light' ? 'light' : 'dark');
    },
    toggle() {
      this.apply(document.body.classList.contains('light') ? 'dark' : 'light');
      fx.vibrate('light');
    }
  };

  const results = {
    buildShareText() {
      const modeText = state.gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра';
      return `Вопросы для двоих\nКатегория: ${state.currentCategory?.id || '—'}\nРезультат: ${ui.resultsScore?.textContent || '0%'}\nСовпало: ${state.stats.match} · Не совпало: ${state.stats.mismatch} · Пропуск: ${state.stats.skip}\nРежим: ${modeText}`;
    },
    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      const r = typeof radius === 'number' ? { tl: radius, tr: radius, br: radius, bl: radius } : radius;
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + width - r.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
      ctx.lineTo(x + width, y + height - r.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
      ctx.lineTo(x + r.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    },
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = String(text).split(' ');
      let line = '';
      for (let i = 0; i < words.length; i += 1) {
        const testLine = line + words[i] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && i > 0) {
          ctx.fillText(line.trim(), x, y);
          line = `${words[i]} `;
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, y);
    },
    async createShareCardBlob() {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      this.roundRect(ctx, 70, 120, 940, 1110, 42, true, false);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 42px Arial';
      ctx.fillText('Вопросы для двоих', 110, 200);

      ctx.font = '700 84px Arial';
      ctx.fillText(ui.resultsScore?.textContent || '0%', 110, 360);

      ctx.font = '600 44px Arial';
      this.wrapText(ctx, state.currentCategory?.id || 'Категория', 110, 450, 860, 56);

      ctx.font = '500 34px Arial';
      const scoreValue = parseInt((ui.resultsScore?.textContent || '0').replace('%', ''), 10) || 0;
      this.wrapText(ctx, helpers.resultMessage(scoreValue, state.currentCategory?.id === 'Блиц'), 110, 560, 860, 48);

      ctx.font = '600 32px Arial';
      ctx.fillText(`Совпало: ${state.stats.match}`, 110, 760);
      ctx.fillText(`Не совпало: ${state.stats.mismatch}`, 110, 820);
      ctx.fillText(`Пропуск: ${state.stats.skip}`, 110, 880);
      ctx.fillText(`Режим: ${state.gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра'}`, 110, 940);

      ctx.font = '500 28px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText('Сделано в Telegram Mini App', 110, 1160);

      return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    },
    async share() {
      const text = this.buildShareText();
      const blob = await this.createShareCardBlob();
      const file = blob ? new File([blob], 'result-card.png', { type: 'image/png' }) : null;

      if (navigator.share && file && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: 'Вопросы для двоих', text, files: [file] });
          return;
        } catch {}
      }

      if (file) {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'result-card.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }

      try {
        await navigator.clipboard.writeText(text);
        fx.vibrate('success');
        alert('Картинка сохранена, текст результата скопирован.');
      } catch {
        alert(text);
      }
    },
    render(isBlitz = false) {
      const answered = state.stats.match + state.stats.mismatch;
      const score = answered ? Math.round((state.stats.match / answered) * 100) : 0;

      ui.resultsCategory.textContent = state.currentCategory.id;
      ui.resultsScore.textContent = `${score}%`;
      document.getElementById('resultModeNote')?.remove();
      ui.resultsMessage.textContent = helpers.resultMessage(score, isBlitz);
      ui.resultsMessage.insertAdjacentHTML(
        'afterend',
        `<div class="result-mini-note" id="resultModeNote">${isBlitz ? 'Режим: Блиц' : (state.gameMode === 'duo' ? 'Режим: Играть вдвоём' : 'Режим: Обычная игра')}</div>`
      );

      ui.statMatch.textContent = state.stats.match;
      ui.statMismatch.textContent = state.stats.mismatch;
      ui.statSkip.textContent = state.stats.skip;

      if (isBlitz) {
        ui.statLabelMatch.textContent = 'Правильно';
        ui.statLabelMismatch.textContent = 'Ошибка';
      } else if (state.gameMode === 'duo') {
        ui.statLabelMatch.textContent = 'Одинаковые ответы';
        ui.statLabelMismatch.textContent = 'Разные ответы';
      } else {
        ui.statLabelMatch.textContent = 'Совпало';
        ui.statLabelMismatch.textContent = 'Не совпало';
      }

      if (score >= 80 && state.stats.match > 0) {
        fx.vibrate('success');
        fx.launchConfetti();
      }

      historyStore.save({
        category: state.currentCategory.id,
        score,
        match: state.stats.match,
        mismatch: state.stats.mismatch,
        skip: state.stats.skip,
        mode: isBlitz ? 'Блиц' : (state.gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра'),
        date: helpers.formatHistoryDate(new Date())
      });

      render.history();
      router.show('results');
    }
  };

  const render = {
    loadWarning(message) {
      if (!ui.categoriesGrid) return;
      ui.categoriesGrid.innerHTML = `<div class="history-empty">${helpers.escapeHtml(message)}</div>`;
    },
    history() {
      const history = historyStore.load();
      if (!history.length) {
        ui.historyList.innerHTML = '<div class="history-empty">Здесь будут появляться результаты после прохождения категорий.</div>';
        return;
      }
      ui.historyList.innerHTML = history.map((item) => `
        <article class="history-item">
          <strong>${helpers.escapeHtml(item.category)}</strong>
          <div>${item.score}% ${item.category === 'Блиц' ? 'правильных ответов' : 'совместимости'}</div>
          <div class="history-meta">
            <span class="history-pill">${helpers.escapeHtml(item.mode || 'Обычная игра')}</span>
            <span class="history-detail">Совпало: ${item.match ?? 0} · Не совпало: ${item.mismatch ?? 0} · Пропуск: ${item.skip ?? 0}</span>
          </div>
          <small>${helpers.escapeHtml(item.date || '')}</small>
        </article>
      `).join('');
    },
    categories() {
      const premiumUnlocked = helpers.getPremiumUnlocked();
      ui.categoriesGrid.innerHTML = CATEGORY_META.map((category) => {
        let count = helpers.getCurrentCategoryQuestions(category.id).length;
        const isLocked = category.isPremium && !premiumUnlocked;

        if (category.id === 'Своя игра' && premiumUnlocked) {
          count = storage.get(STORAGE_KEYS.customQuestions, []).length;
        }

        const countLabel = category.id === 'Блиц'
          ? '30 секунд'
          : (count > 0 ? `${count} вопросов` : 'Создать');

        return `
          <button class="category-card ${isLocked ? 'premium-locked' : ''}" data-id="${helpers.escapeHtml(category.id)}" style="background:${category.color}">
            <div class="category-card-top">
              <div class="category-icon">${category.icon}</div>
              ${category.badge ? `<span class="category-badge">${category.badge}</span>` : ''}
            </div>
            <div>
              <h3>${helpers.escapeHtml(category.id)}</h3>
              <p>${helpers.escapeHtml(category.desc)}</p>
            </div>
            <div class="category-count">${countLabel}</div>
          </button>
        `;
      }).join('');
    },
    customGameEditor() {
      const customQuestions = storage.get(STORAGE_KEYS.customQuestions, ['', '']);
      ui.customQuestionsList.innerHTML = '';
      customQuestions.forEach((question) => this.addCustomQuestionInput(question));
    },
    addCustomQuestionInput(value = '') {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'custom-question-input';
      input.placeholder = 'Например: Какой мой любимый цвет?';
      input.value = value;
      ui.customQuestionsList.appendChild(input);
    },
    intro(categoryId) {
      const total = helpers.getCurrentCategoryQuestions(categoryId).length;
      const introText = categoryId === 'Блиц'
        ? 'Вам дается ровно 30 секунд. Ответьте правильно на как можно больше вопросов о вашем партнере.'
        : `${total} вопросов в колоде. Нажмите ниже, чтобы начать новую игру.`;

      ui.introCard.innerHTML = `
        <div class="intro-illu">${state.currentCategory.icon}</div>
        <span class="eyebrow">${state.currentCategory.badge || 'Категория'}</span>
        <h2>${helpers.escapeHtml(state.currentCategory.id)}</h2>
        <p class="intro-subtext">${helpers.escapeHtml(state.currentCategory.desc)}</p>
        <p class="intro-subtext">${helpers.escapeHtml(introText)}</p>
        <div class="hero-actions stacked">
          <button class="primary-btn" id="playCategoryBtn">${categoryId === 'Блиц' ? 'Начать блиц' : 'Новая игра'}</button>
          ${categoryId !== 'Блиц' ? '<button class="secondary-btn" id="duoCategoryBtn">Играть вдвоём</button>' : ''}
          <button class="secondary-btn" id="backToCategoriesBtn">Назад</button>
        </div>
      `;

      router.show('intro');
      document.getElementById('playCategoryBtn')?.addEventListener('click', () => game.start('solo'));
      document.getElementById('duoCategoryBtn')?.addEventListener('click', () => game.start('duo'));
      document.getElementById('backToCategoriesBtn')?.addEventListener('click', () => router.back());
    },
    updateModeUI() {
      const duoMode = state.gameMode === 'duo';
      ui.turnBadge.classList.toggle('hidden', !duoMode);
      ui.turnBadge.textContent = duoMode ? DUO_PLAYERS[state.duoActivePlayer] : '';
      if (ui.gameCategory && state.currentCategory) {
        ui.gameCategory.textContent = duoMode
          ? `${state.currentCategory.id} · Игра вдвоём`
          : state.currentCategory.id;
      }
    },
    gameQuestion(isInitial = false) {
      const question = state.currentQuestions[state.currentIndex];
      const total = state.currentQuestions.length;

      ui.gameCategory.textContent = state.gameMode === 'duo'
        ? `${state.currentCategory.id} · Игра вдвоём`
        : state.currentCategory.id;
      ui.gameTitle.textContent = state.gameMode === 'duo' ? `Ход: ${DUO_PLAYERS[state.duoActivePlayer]}` : 'Вопрос';
      this.updateModeUI();
      ui.questionText.textContent = question;
      ui.progressLabel.textContent = `${state.currentIndex + 1} / ${total}`;
      ui.progressFill.style.width = `${((state.currentIndex + 1) / total) * 100}%`;

      ui.questionCard.classList.remove('card-fly-left', 'card-fly-right', 'card-fly-up', 'card-return');
      if (!isInitial) ui.questionCard.classList.add('card-enter');
      ui.questionCard.style.transition = 'none';
      ui.questionCard.style.transform = isInitial ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.98)';
      ui.questionCard.style.opacity = isInitial ? '1' : '0';
      swipe.updateHint(0, 0);

      requestAnimationFrame(() => {
        ui.questionCard.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
        ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
        ui.questionCard.style.opacity = '1';
      });
    },
    blitzUI() {
      ui.blitzTimerDisplay.textContent = state.blitzTimeLeft;
      ui.blitzCorrectScore.textContent = state.stats.match;
      ui.blitzTotalScore.textContent = state.stats.match + state.stats.mismatch;
    },
    blitzQuestion() {
      if (state.currentIndex >= state.currentQuestions.length) {
        game.finish(true);
        return;
      }

      const card = document.querySelector('.blitz-card');
      card.style.transition = 'none';
      card.style.transform = 'scale(0.98)';
      card.style.opacity = '0.5';
      ui.blitzQuestionText.textContent = state.currentQuestions[state.currentIndex];

      requestAnimationFrame(() => {
        card.style.transition = 'transform 150ms ease, opacity 150ms ease';
        card.style.transform = 'scale(1)';
        card.style.opacity = '1';
      });
    },
    resetQuestionCard() {
      state.swipe.active = false;
      state.swipe.dragging = false;
      state.swipe.pointerId = null;
      state.swipe.isAnimating = false;
      ui.questionCard.dataset.swipe = 'none';
      ui.questionCard.style.removeProperty('--swipe-opacity');
      ui.questionCard.style.transition = '';
      ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
      ui.questionCard.style.opacity = '1';
      if (ui.swipeHelp) ui.swipeHelp.textContent = SWIPE_HELP;
    }
  };

  const modalFlows = {
    showPass(playerIndex, onReady) {
      const playerName = DUO_PLAYERS[playerIndex] || `Игрок ${playerIndex + 1}`;
      ui.passModalTitle.textContent = 'Передайте телефон';
      ui.passModalText.textContent = `Сейчас отвечает ${playerName}`;
      ui.passModalBtn.textContent = 'Готово';
      modals.open(ui.passModal);

      const handleReady = () => {
        modals.close(ui.passModal);
        ui.passModalBtn.removeEventListener('click', handleReady);
        if (typeof onReady === 'function') onReady();
      };

      ui.passModalBtn.addEventListener('click', handleReady);
    }
  };

  const game = {
    clearBlitzTimer() {
      if (state.blitzTimer) {
        clearInterval(state.blitzTimer);
        state.blitzTimer = null;
      }
    },
    resetRound(mode) {
      state.gameMode = mode;
      state.currentIndex = 0;
      state.stats = { match: 0, mismatch: 0, skip: 0 };
      state.duoRoundAnswers = [null, null];
      state.duoActivePlayer = 0;
      render.resetQuestionCard();
      render.updateModeUI();
    },
    openCategory(categoryId) {
      state.currentCategory = CATEGORY_META.find((category) => category.id === categoryId) || null;
      if (!state.currentCategory) return;

      if (categoryId === 'Интимные вопросы' && !helpers.isAdultConfirmed()) {
        state.pendingAdultCategory = categoryId;
        modals.open(ui.adultModal);
        return;
      }

      if (state.currentCategory.isPremium && !helpers.getPremiumUnlocked()) {
        modals.open(ui.premiumModal);
        return;
      }

      if (categoryId === 'Своя игра') {
        render.customGameEditor();
        router.show('customGame');
        return;
      }

      background.apply(categoryId);
      render.intro(categoryId);
    },
    start(mode = 'solo') {
      state.gameMode = mode;

      if (state.currentCategory?.id === 'Блиц') {
        this.startBlitz();
        return;
      }

      const sourceQuestions = helpers.getCurrentCategoryQuestions(state.currentCategory.id);
      if (!sourceQuestions.length) {
        alert('В этой категории пока нет вопросов.');
        router.show('categories');
        return;
      }

      const limit = sourceQuestions.length < 8 ? sourceQuestions.length : 8;
      state.currentQuestions = helpers.shuffle(sourceQuestions).slice(0, limit);
      this.resetRound(mode);
      router.show('game');

      const renderFirst = () => {
        state.duoActivePlayer = 0;
        render.updateModeUI();
        render.gameQuestion(true);
      };

      if (state.gameMode === 'duo') modalFlows.showPass(0, renderFirst);
      else renderFirst();
    },
    startBlitz() {
      state.gameMode = 'solo';
      render.updateModeUI();
      this.clearBlitzTimer();

      state.currentQuestions = helpers.shuffle(helpers.getCurrentCategoryQuestions('Блиц'));
      state.currentIndex = 0;
      state.stats = { match: 0, mismatch: 0, skip: 0 };
      state.blitzTimeLeft = 30;

      render.blitzUI();
      render.blitzQuestion();
      router.show('blitz');

      state.blitzTimer = setInterval(() => {
        state.blitzTimeLeft -= 1;
        ui.blitzTimerDisplay.textContent = state.blitzTimeLeft;
        if (state.blitzTimeLeft <= 3 && state.blitzTimeLeft > 0) fx.vibrate('light');
        if (state.blitzTimeLeft <= 0) this.finish(true);
      }, 1000);
    },
    answer(type) {
      if (!['match', 'mismatch', 'skip'].includes(type)) return;

      fx.pulseAnswerButton(type);
      fx.launchReactionBurst(type, type === 'match' ? ui.matchBtn : type === 'mismatch' ? ui.mismatchBtn : ui.skipBtn);
      if (type === 'match') fx.vibrate('success');
      else if (type === 'mismatch') fx.vibrate('error');
      else fx.vibrate('warning');

      if (type === 'match' && state.gameMode !== 'duo') {
        setTimeout(() => fx.launchConfetti(), 40);
      }

      if (state.gameMode === 'duo') {
        swipe.animateOut(type, () => {
          state.duoRoundAnswers[state.duoActivePlayer] = type;
          render.resetQuestionCard();

          if (state.duoActivePlayer === 0) {
            state.duoActivePlayer = 1;
            render.updateModeUI();
            modalFlows.showPass(1, () => render.gameQuestion(true));
            return;
          }

          const [first, second] = state.duoRoundAnswers;
          if (first === 'skip' || second === 'skip') state.stats.skip += 1;
          else if (first === second) {
            state.stats.match += 1;
            setTimeout(() => fx.launchConfetti(), 50);
          } else {
            state.stats.mismatch += 1;
          }

          state.currentIndex += 1;
          state.duoRoundAnswers = [null, null];
          state.duoActivePlayer = 0;
          render.resetQuestionCard();

          if (state.currentIndex >= state.currentQuestions.length) this.finish();
          else modalFlows.showPass(0, () => render.gameQuestion());
        });
        return;
      }

      swipe.animateOut(type, () => {
        state.stats[type] += 1;
        state.currentIndex += 1;
        render.resetQuestionCard();
        if (state.currentIndex >= state.currentQuestions.length) this.finish();
        else render.gameQuestion();
      });
    },
    answerBlitz(isCorrect) {
      fx.vibrate('light');
      if (isCorrect) state.stats.match += 1;
      else state.stats.mismatch += 1;
      state.currentIndex += 1;
      render.blitzUI();
      render.blitzQuestion();
    },
    finish(isBlitz = false) {
      this.clearBlitzTimer();
      results.render(isBlitz);
    }
  };

  const swipe = {
    updateHint(offsetX, offsetY = 0) {
      const intensity = Math.min(Math.max(Math.abs(offsetX), Math.abs(offsetY)) / 120, 1);
      let direction = 'none';
      if (offsetY < -70 && Math.abs(offsetX) < 100) direction = 'up';
      else if (offsetX > 0) direction = 'right';
      else if (offsetX < 0) direction = 'left';

      ui.questionCard.dataset.swipe = direction;
      ui.questionCard.style.setProperty('--swipe-opacity', intensity.toFixed(2));
      if (!ui.swipeHelp) return;
      ui.swipeHelp.textContent = {
        none: SWIPE_HELP,
        left: 'Отпускай — отметим «Не совпало»',
        right: 'Отпускай — отметим «Совпало»',
        up: 'Отпускай — это «Пропуск»'
      }[direction];
    },
    animateOut(type, callback) {
      const card = ui.questionCard;
      const map = {
        match: { x: 420, y: -20, rotate: 16 },
        mismatch: { x: -420, y: -20, rotate: -16 },
        skip: { x: 0, y: -360, rotate: 0 }
      };
      const config = map[type];
      if (!config) return;
      card.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
      card.style.opacity = '0';
      card.style.transform = `translate3d(${config.x}px, ${config.y}px, 0) rotate(${config.rotate}deg) scale(0.96)`;
      setTimeout(callback, 280);
    },
    onPointerDown(event) {
      if (!screens.game.classList.contains('screen-active')) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      state.swipe.active = true;
      state.swipe.dragging = true;
      state.swipe.pointerId = event.pointerId;
      state.swipe.startX = event.clientX;
      state.swipe.startY = event.clientY;
      state.swipe.currentX = event.clientX;
      state.swipe.currentY = event.clientY;
      ui.questionCard.setPointerCapture?.(event.pointerId);
      ui.questionCard.style.transition = 'none';
    },
    onPointerMove(event) {
      if (!state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
      if (event.cancelable) event.preventDefault();

      state.swipe.currentX = event.clientX;
      state.swipe.currentY = event.clientY;

      if (!state.swipe.isAnimating) {
        requestAnimationFrame(() => {
          const deltaX = state.swipe.currentX - state.swipe.startX;
          const deltaY = state.swipe.currentY - state.swipe.startY;
          if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && Math.abs(deltaY) < 50) {
            state.swipe.isAnimating = false;
            return;
          }
          const rotate = deltaX / 18;
          const stretch = 1 - Math.min(Math.abs(deltaX) / 1200, 0.03);
          ui.questionCard.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.18}px, 0) rotate(${rotate}deg) scale(${stretch})`;
          this.updateHint(deltaX, deltaY);
          state.swipe.isAnimating = false;
        });
        state.swipe.isAnimating = true;
      }
    },
    onPointerUp(event) {
      if (!state.swipe.active || state.swipe.pointerId !== event.pointerId) return;

      state.swipe.active = false;
      state.swipe.dragging = false;
      const deltaX = state.swipe.currentX - state.swipe.startX;
      const deltaY = state.swipe.currentY - state.swipe.startY;
      const velocity = Math.abs(deltaX) / Math.max(1, Math.abs(deltaY) + 1);
      const threshold = window.innerWidth < 480 ? 70 : 90;

      ui.questionCard.releasePointerCapture?.(event.pointerId);
      state.swipe.pointerId = null;

      if (deltaX > threshold || (deltaX > 45 && velocity > 2.4)) return game.answer('match');
      if (deltaX < -threshold || (deltaX < -45 && velocity > 2.4)) return game.answer('mismatch');
      if (deltaY < -110 && Math.abs(deltaX) < 100) return game.answer('skip');

      ui.questionCard.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1)';
      ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
      this.updateHint(0, 0);
    },
    attachHandlers() {
      ui.questionCard.addEventListener('pointerdown', this.onPointerDown.bind(this));
      ui.questionCard.addEventListener('pointermove', this.onPointerMove.bind(this));
      ui.questionCard.addEventListener('pointerup', this.onPointerUp.bind(this));
      ui.questionCard.addEventListener('pointercancel', this.onPointerUp.bind(this));
      ui.questionCard.addEventListener('touchmove', (event) => {
        if (event.cancelable) event.preventDefault();
      }, { passive: false });
    },
    preventDoubleTapZoom() {
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) event.preventDefault();
        lastTouchEnd = now;
      }, { passive: false });
    }
  };

  const data = {
    async loadQuestions() {
      let loadedFromNetwork = false;
      try {
        const response = await fetch('questions.json', { cache: 'default' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const freshData = await response.json();
        if (freshData && typeof freshData === 'object' && Object.keys(freshData).length > 0) {
          state.questionsData = freshData;
          storage.set(STORAGE_KEYS.questionsCache, state.questionsData);
          loadedFromNetwork = true;
        }
      } catch (error) {
        console.error('Ошибка загрузки вопросов по сети', error);
      }

      if (!loadedFromNetwork) {
        try {
          state.questionsData = storage.get(STORAGE_KEYS.questionsCache, {});
        } catch (error) {
          console.error('Ошибка чтения кэша вопросов', error);
          state.questionsData = {};
        }
      }

      if (!state.questionsData || typeof state.questionsData !== 'object') {
        state.questionsData = {};
      }

      const savedCustom = storage.get(STORAGE_KEYS.customQuestions, null);
      if (Array.isArray(savedCustom) && savedCustom.length) {
        state.questionsData['Своя игра'] = savedCustom;
      }
    }
  };

  const premium = {
    purchase() {
      const originalText = ui.buyPremiumBtn.textContent;
      ui.buyPremiumBtn.textContent = 'Оплата...';
      ui.buyPremiumBtn.disabled = true;

      setTimeout(() => {
        storage.setRaw(STORAGE_KEYS.premium, 'true');
        modals.close(ui.premiumModal);
        ui.buyPremiumBtn.textContent = originalText;
        ui.buyPremiumBtn.disabled = false;
        fx.vibrate('success');
        fx.launchConfetti();
        render.categories();
      }, 1200);
    }
  };

  async function initTelegram() {
    if (!tg) return;
    tg.ready();
    tg.expand();
    if (typeof tg.disableVerticalSwipes === 'function') {
      try { tg.disableVerticalSwipes(); } catch {}
    }
  }

  function bindEvents() {
    ui.categoriesGrid.addEventListener('click', (event) => {
      const card = event.target.closest('.category-card');
      if (card?.dataset.id) game.openCategory(card.dataset.id);
    });

    ui.startBtn.addEventListener('click', () => router.show('categories'));
    ui.historyBtn.addEventListener('click', () => router.show('history'));
    ui.backBtn.addEventListener('click', () => router.back());
    ui.themeBtn.addEventListener('click', () => theme.toggle());

    ui.matchBtn.addEventListener('click', () => game.answer('match'));
    ui.mismatchBtn.addEventListener('click', () => game.answer('mismatch'));
    ui.skipBtn.addEventListener('click', () => game.answer('skip'));
    ui.blitzCorrectBtn.addEventListener('click', () => game.answerBlitz(true));
    ui.blitzIncorrectBtn.addEventListener('click', () => game.answerBlitz(false));

    ui.restartBtn.addEventListener('click', () => game.start(state.gameMode));
    ui.changeCategoryBtn.addEventListener('click', () => router.show('categories'));
    ui.shareBtn.addEventListener('click', () => results.share());

    ui.addCustomQuestionBtn.addEventListener('click', () => {
      render.addCustomQuestionInput();
      fx.vibrate('light');
    });

    ui.saveCustomGameBtn.addEventListener('click', () => {
      const questions = Array.from(document.querySelectorAll('.custom-question-input'))
        .map((input) => input.value.trim())
        .filter(Boolean);

      if (questions.length < 3) {
        alert('Напишите хотя бы 3 вопроса, чтобы начать игру!');
        return;
      }

      storage.set(STORAGE_KEYS.customQuestions, questions);
      state.questionsData['Своя игра'] = questions;
      render.categories();
      game.start();
    });

    ui.buyPremiumBtn.addEventListener('click', () => premium.purchase());
    ui.closePremiumBtn.addEventListener('click', () => modals.close(ui.premiumModal));

    ui.adultConfirmBtn.addEventListener('click', () => {
      storage.setRaw(STORAGE_KEYS.adult, 'yes');
      modals.close(ui.adultModal);
      const pending = state.pendingAdultCategory;
      state.pendingAdultCategory = null;
      if (pending) game.openCategory(pending);
    });

    ui.adultCancelBtn.addEventListener('click', () => {
      state.pendingAdultCategory = null;
      modals.close(ui.adultModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') modals.closeAll();
    });
  }

  async function init() {
    await data.loadQuestions();
    theme.init();
    background.reset();
    render.categories();
    render.history();

    if (Object.keys(state.questionsData).length === 0) {
      console.warn('Вопросы не загружены');
      render.loadWarning('Не удалось загрузить вопросы. Проверь подключение и обнови страницу.');
    }

    swipe.preventDoubleTapZoom();
    await initTelegram();
    swipe.attachHandlers();
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

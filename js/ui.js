import { app } from './core.js';

const { state, ui, storage, helpers, historyStore, router, fx, CATEGORY_META, STORAGE_KEYS, DUO_PLAYERS, SWIPE_HELP, templates, meta, notify } = app;

const ONBOARDING_STEPS = [
  {
    title: 'Начать разговор станет проще',
    text: 'Выбирай категорию под настроение и проходи игру в обычном режиме или вдвоём по очереди.',
    visual: '💞',
    points: ['Красивые категории', 'Процент совместимости', 'Быстрый старт без регистрации']
  },
  {
    title: 'Свайпы работают как в карточках',
    text: 'Вправо — совпало, влево — не совпало, вверх — пропуск. Можно отвечать и кнопками внизу.',
    visual: '↔',
    points: ['Живые анимации', 'Вибрация при ответе', 'Удобно одной рукой']
  },
  {
    title: 'Настрой всё под себя',
    text: 'Открой настройки, чтобы изменить вибрацию, анимации, число вопросов и очистить лишние данные.',
    visual: '⚙',
    points: ['История результатов', 'Своя игра и премиум', 'Тёмная и светлая тема']
  }
];

function emptyState(message) {
  return templates.empty(message);
}

export const render = {
  loadWarning(message) {
    if (!ui.categoriesGrid) return;
    ui.categoriesGrid.replaceChildren(emptyState(message));
  },
  errorScreen(message) {
    if (ui.errorText) ui.errorText.textContent = message;
    router.show('error', { reset: true });
  },
  homeDashboard() {
    const daily = helpers.dailyQuestion();
    if (ui.dailyQuestionCategory) ui.dailyQuestionCategory.textContent = daily?.category || 'Сегодня';
    if (ui.dailyQuestionText) ui.dailyQuestionText.textContent = daily?.question || 'Пока нет вопроса дня.';
    if (ui.favoritesCountText) ui.favoritesCountText.textContent = `${state.favorites.length} избранных вопросов`;
    const challenge = meta.loadChallenge();
    if (ui.challengeProgressText) ui.challengeProgressText.textContent = `${challenge.daysCompleted || 0} / 7 дней`;
    if (ui.challengeHintText) ui.challengeHintText.textContent = challenge.streak ? `Текущая серия: ${challenge.streak} дн.` : 'Каждый день отвечайте хотя бы на один вопрос, чтобы собрать серию.';
    const achievements = meta.loadAchievements();
    if (ui.achievementCountText) ui.achievementCountText.textContent = `${achievements.length} достижений`;
    if (ui.achievementHintText) {
      if (achievements.length) {
        const latest = helpers.achievementById(achievements[achievements.length - 1]);
        const rarity = latest ? helpers.achievementRarityMeta(latest.rarity).label : 'Награда';
        ui.achievementHintText.textContent = latest ? `${rarity}: ${latest.title}` : 'Новые награды появляются после ярких серий и длинных игр.';
      } else {
        ui.achievementHintText.textContent = 'Начни игру, чтобы открыть первую награду.';
      }
    }
  },
  favorites() {
    const favorites = state.favorites || [];
    if (!favorites.length) {
      ui.favoritesList?.replaceChildren(emptyState('Пока нет избранных вопросов. Нажми на ★ во время игры, чтобы сохранить карточку.'));
      ui.startFavoritesBtn?.classList.add('hidden');
      return;
    }
    ui.startFavoritesBtn?.classList.remove('hidden');
    const fragment = document.createDocumentFragment();
    favorites.forEach((item) => {
      const card = templates.clone(ui.favoriteItemTemplate);
      if (!card) return;
      card.querySelector('[data-role="category"]').textContent = item.category;
      card.querySelector('[data-role="question"]').textContent = item.question;
      card.querySelector('[data-role="date"]').textContent = item.date || '';
      fragment.appendChild(card);
    });
    ui.favoritesList?.replaceChildren(fragment);
  },
  history() {
    const history = historyStore.load();
    const query = (state.historyFilter || '').trim().toLowerCase();
    const filtered = query
      ? history.filter((item) => `${item.category} ${item.mode || ''}`.toLowerCase().includes(query))
      : history;
    if (!filtered.length) {
      const message = history.length
        ? 'По этому запросу ничего не найдено.'
        : 'Здесь будут появляться результаты после прохождения категорий.';
      ui.historyList.replaceChildren(emptyState(message));
      return;
    }
    const fragment = document.createDocumentFragment();
    filtered.forEach((item) => {
      const card = templates.clone(ui.historyItemTemplate);
      if (!card) return;
      card.querySelector('[data-role="category"]').textContent = item.category;
      card.querySelector('[data-role="score"]').textContent = `${item.score}% ${item.category === 'Блиц' ? 'правильных ответов' : 'совместимости'}`;
      card.querySelector('[data-role="mode"]').textContent = item.mode || 'Обычная игра';
      card.querySelector('[data-role="details"]').textContent = `Совпало: ${item.match ?? 0} · Не совпало: ${item.mismatch ?? 0} · Пропуск: ${item.skip ?? 0}`;
      card.querySelector('[data-role="date"]').textContent = item.date || '';
      fragment.appendChild(card);
    });
    ui.historyList.replaceChildren(fragment);
  },

  achievements() {
    const unlockedIds = new Set(meta.loadAchievements());
    const list = helpers.achievementCatalog();
    if (ui.achievementLegend) {
      ui.achievementLegend.innerHTML = ['common','rare','epic','legendary'].map((key) => {
        const rarity = helpers.achievementRarityMeta(key);
        return `<span class="achievement-legend-pill ${rarity.className}">${rarity.label}</span>`;
      }).join('');
    }
    if (!ui.achievementsList) return;
    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
      const rarity = helpers.achievementRarityMeta(item.rarity);
      const unlocked = unlockedIds.has(item.id);
      const card = document.createElement('article');
      card.className = `achievement-card achievement-card-showcase ${rarity.className}${unlocked ? ' is-unlocked' : ' is-locked'}`;
      card.innerHTML = `
        <div class="achievement-art" aria-hidden="true">${helpers.achievementArtSvg(item.art)}</div>
        <div class="achievement-copy">
          <div class="achievement-topline"><span class="achievement-rarity">${rarity.label}</span><span class="achievement-status">${unlocked ? 'Открыто' : 'Закрыто'}</span></div>
          <strong>${helpers.escapeHtml(item.title)}</strong>
          <p>${helpers.escapeHtml(item.description)}</p>
        </div>
      `;
      fragment.appendChild(card);
    });
    ui.achievementsList.replaceChildren(fragment);
  },
  showAchievementUnlock(achievement) {
    if (!achievement || !ui.achievementUnlockCard || !ui.achievementUnlock) return;
    const rarity = helpers.achievementRarityMeta(achievement.rarity);
    ui.achievementUnlockCard.className = `achievement-unlock-card ${rarity.className}`;
    ui.achievementUnlockCard.innerHTML = `
      <div class="achievement-unlock-kicker">Новая награда</div>
      <div class="achievement-art" aria-hidden="true">${helpers.achievementArtSvg(achievement.art)}</div>
      <div class="achievement-copy">
        <div class="achievement-topline"><span class="achievement-rarity">${rarity.label}</span></div>
        <strong>${helpers.escapeHtml(achievement.title)}</strong>
        <p>${helpers.escapeHtml(achievement.description)}</p>
      </div>
    `;
    ui.achievementUnlock.classList.remove('hidden');
    ui.achievementUnlock.classList.remove('is-visible');
    requestAnimationFrame(() => ui.achievementUnlock.classList.add('is-visible'));
    clearTimeout(this._achievementUnlockTimer);
    this._achievementUnlockTimer = setTimeout(() => {
      ui.achievementUnlock.classList.remove('is-visible');
      setTimeout(() => ui.achievementUnlock.classList.add('hidden'), 280);
    }, 2600);
  },
  categories() {
    const premiumUnlocked = helpers.getPremiumUnlocked();
    const fragment = document.createDocumentFragment();
    CATEGORY_META.forEach((category) => {
      let count = helpers.getCurrentCategoryQuestions(category.id).length;
      const isLocked = category.isPremium && !premiumUnlocked;
      if (category.id === 'Своя игра' && premiumUnlocked) count = storage.get(STORAGE_KEYS.customQuestions, []).length;
      const card = templates.clone(ui.categoryCardTemplate);
      if (!card) return;
      card.dataset.id = category.id;
      card.style.background = '#FFFFF0';
      if (category.cover) {
        card.style.backgroundImage = `url(${category.cover})`;
        card.style.backgroundSize = '74% auto';
        card.style.backgroundPosition = 'center 34%';
        card.style.backgroundRepeat = 'no-repeat';
        card.classList.add('category-card-cover');
      }
      card.classList.toggle('premium-locked', isLocked);
      card.querySelector('[data-role="icon"]').innerHTML = helpers.categoryIconSvg(category.icon);
      const badge = card.querySelector('[data-role="badge"]');
      if (category.badge) {
        badge.textContent = category.badge;
        badge.classList.remove('hidden');
      }
      card.querySelector('[data-role="title"]').textContent = category.id;
      card.querySelector('[data-role="desc"]').textContent = category.desc;
      fragment.appendChild(card);
    });
    ui.categoriesGrid.replaceChildren(fragment);
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
      : `${total} вопросов в колоде. Нажми ниже, чтобы начать новую игру.`;
    ui.introCard.innerHTML = `
      <div class="intro-illu intro-illu-icon">${helpers.categoryIconSvg(state.currentCategory.icon)}</div>
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
    document.getElementById('playCategoryBtn')?.addEventListener('click', () => app.game.start('solo'));
    document.getElementById('duoCategoryBtn')?.addEventListener('click', () => app.game.start('duo'));
    document.getElementById('backToCategoriesBtn')?.addEventListener('click', () => router.back());
  },
  onboarding() {
    const step = ONBOARDING_STEPS[state.onboardingStep] || ONBOARDING_STEPS[0];
    ui.onboardingTitle.textContent = step.title;
    ui.onboardingText.textContent = step.text;
    ui.onboardingVisual.textContent = step.visual;
    ui.onboardingPoints.innerHTML = step.points.map((point) => `<span class="onboarding-point">${helpers.escapeHtml(point)}</span>`).join('');
    ui.onboardingProgress.innerHTML = ONBOARDING_STEPS.map((_, index) => `<span class="onboarding-dot ${index === state.onboardingStep ? 'active' : ''}"></span>`).join('');
    ui.onboardingNextBtn.textContent = state.onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Начать' : 'Дальше';
  },
  updateModeUI() {
    const duoMode = state.gameMode === 'duo';
    ui.turnBadge.classList.toggle('hidden', !duoMode);
    ui.turnBadge.textContent = duoMode ? DUO_PLAYERS[state.duoActivePlayer] : '';
    if (ui.gameCategory && state.currentCategory) {
      ui.gameCategory.textContent = duoMode ? `${state.currentCategory.id} · Игра вдвоём` : state.currentCategory.id;
    }
  },
  gameQuestion(isInitial = false) {
    const question = state.currentQuestions[state.currentIndex];
    const total = state.currentQuestions.length;
    ui.gameCategory.textContent = state.gameMode === 'duo' ? `${state.currentCategory.id} · Игра вдвоём` : state.currentCategory.id;
    ui.gameTitle.textContent = state.gameMode === 'duo' ? `Ход: ${DUO_PLAYERS[state.duoActivePlayer]}` : 'Вопрос';
    this.updateModeUI();
    ui.questionText.textContent = question;
    ui.progressLabel.textContent = `${state.currentIndex + 1} / ${total}`;
    ui.progressFill.style.width = `${((state.currentIndex + 1) / total) * 100}%`;
    if (ui.remainingQuestionsLabel) ui.remainingQuestionsLabel.textContent = `Осталось ${Math.max(total - state.currentIndex - 1, 0)} вопросов`;
    if (ui.streakLabel) ui.streakLabel.textContent = `Серия: ${state.questionStreak || 0}`;
    if (ui.favoriteQuestionBtn) {
      ui.favoriteQuestionBtn.classList.remove('hidden');
      const active = helpers.isFavorite(question, state.currentCategory?.id);
      ui.favoriteQuestionBtn.classList.toggle('is-active', active);
      ui.favoriteQuestionBtn.textContent = active ? '★' : '☆';
    }
    ui.questionCard.classList.remove('card-fly-left', 'card-fly-right', 'card-fly-up', 'card-return');
    if (!isInitial && state.settings.animations) ui.questionCard.classList.add('card-enter');
    ui.questionCard.style.transition = 'none';
    ui.questionCard.style.transform = isInitial || !state.settings.animations ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.98)';
    ui.questionCard.style.opacity = isInitial || !state.settings.animations ? '1' : '0';
    app.swipe.updateHint(0, 0);
    requestAnimationFrame(() => {
      ui.questionCard.style.transition = state.settings.animations
        ? 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease'
        : 'none';
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
    if (state.currentIndex >= state.currentQuestions.length) return app.game.finish(true);
    const card = document.querySelector('.blitz-card');
    card.style.transition = 'none';
    card.style.transform = state.settings.animations ? 'scale(0.98)' : 'scale(1)';
    card.style.opacity = state.settings.animations ? '0.5' : '1';
    ui.blitzQuestionText.textContent = state.currentQuestions[state.currentIndex];
    requestAnimationFrame(() => {
      card.style.transition = state.settings.animations ? 'transform 150ms ease, opacity 150ms ease' : 'none';
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
  },
  syncSettingsUI() {
    if (ui.vibrationToggle) ui.vibrationToggle.checked = !!state.settings.vibration;
    if (ui.animationsToggle) ui.animationsToggle.checked = !!state.settings.animations;
    if (ui.roundSizeSelect) ui.roundSizeSelect.value = String(state.settings.roundSize || 8);
  }
};

export const results = {
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
      } else line = testLine;
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
    if (state.shareAchievement) {
      const rarity = helpers.achievementRarityMeta(state.shareAchievement.rarity);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      this.roundRect(ctx, 110, 1010, 860, 150, 28, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 28px Arial';
      ctx.fillText('Новая награда', 150, 1060);
      ctx.font = '700 34px Arial';
      ctx.fillText(`${rarity.label}: ${state.shareAchievement.title}`, 150, 1110);
      ctx.font = '500 26px Arial';
      this.wrapText(ctx, state.shareAchievement.description, 150, 1150, 760, 34);
    }
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
      notify.success('Карточка сохранена, текст результата скопирован.');
    } catch {
      notify.info('Не удалось открыть системный шаринг. Текст результата скопируй вручную.');
    }
  },
  render(isBlitz = false) {
    const answered = state.stats.match + state.stats.mismatch;
    const score = answered ? Math.round((state.stats.match / answered) * 100) : 0;
    ui.resultsCategory.textContent = state.currentCategory.id;
    ui.resultsScore.textContent = '0%';
    document.getElementById('resultModeNote')?.remove();
    ui.resultsMessage.textContent = helpers.resultMessage(score, isBlitz);
    ui.resultsMessage.insertAdjacentHTML('afterend', `<div class="result-mini-note" id="resultModeNote">${isBlitz ? 'Режим: Блиц' : (state.gameMode === 'duo' ? 'Режим: Играть вдвоём' : 'Режим: Обычная игра')}</div>`);
    if (ui.resultsVibe) ui.resultsVibe.textContent = `Ваш вайб: ${helpers.vibeByScore(score)}`;
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
    const modeText = isBlitz ? 'Блиц' : (state.gameMode === 'duo' ? 'Игра вдвоём' : 'Обычная игра');
    historyStore.save({
      category: state.currentCategory.id,
      score,
      match: state.stats.match,
      mismatch: state.stats.mismatch,
      skip: state.stats.skip,
      mode: modeText,
      date: helpers.formatHistoryDate(new Date())
    });
    const progress = meta.recordRound({ score, totalQuestions: state.currentQuestions.length, category: state.currentCategory.id });
    if (ui.resultsBreakdown) {
      ui.resultsBreakdown.innerHTML = `<div class="result-panel"><strong>Совместимость по категории</strong><p>${state.currentCategory.id}: <b>${score}%</b> · ${helpers.vibeByScore(score)}</p></div><div class="result-panel"><strong>Челлендж 7 дней</strong><p>${progress.challenge.daysCompleted}/7 дней · серия ${progress.challenge.streak} дн.</p></div>`;
    }
    if (ui.resultsAchievements) {
      ui.resultsAchievements.innerHTML = progress.newly.length ? `<div class="result-panel"><strong>Новые достижения</strong><div class="achievement-grid">${progress.newly.map((item) => {
        const rarity = helpers.achievementRarityMeta(item.rarity);
        return `<article class="achievement-card ${rarity.className}"><div class="achievement-art" aria-hidden="true">${helpers.achievementArtSvg(item.art)}</div><div class="achievement-copy"><div class="achievement-topline"><span class="achievement-rarity">${rarity.label}</span></div><strong>${helpers.escapeHtml(item.title)}</strong><p>${helpers.escapeHtml(item.description)}</p></div></article>`;
      }).join('')}</div></div>` : '';
    }
    render.history();
    render.homeDashboard();
    render.favorites();
    let current = 0;
    const tick = () => {
      current += Math.max(1, Math.ceil((score - current) * 0.18));
      if (current >= score) current = score;
      ui.resultsScore.textContent = `${current}%`;
      if (current < score) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    router.show('results');
  }
};

Object.assign(app, { render, results, ONBOARDING_STEPS });

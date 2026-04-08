(() => {
  'use strict';
  const app = window.CouplesApp;
  const { state, ui, storage, helpers, historyStore, router, background, fx, CATEGORY_META, STORAGE_KEYS, DUO_PLAYERS, SWIPE_HELP } = app;

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
        if (category.id === 'Своя игра' && premiumUnlocked) count = storage.get(STORAGE_KEYS.customQuestions, []).length;
        const countLabel = category.id === 'Блиц' ? '30 секунд' : (count > 0 ? `${count} вопросов` : 'Создать');
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
      document.getElementById('playCategoryBtn')?.addEventListener('click', () => app.game.start('solo'));
      document.getElementById('duoCategoryBtn')?.addEventListener('click', () => app.game.start('duo'));
      document.getElementById('backToCategoriesBtn')?.addEventListener('click', () => router.back());
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
      ui.resultsMessage.insertAdjacentHTML('afterend', `<div class="result-mini-note" id="resultModeNote">${isBlitz ? 'Режим: Блиц' : (state.gameMode === 'duo' ? 'Режим: Играть вдвоём' : 'Режим: Обычная игра')}</div>`);
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

  Object.assign(app, { render, results });
})();

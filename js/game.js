import { app } from './core.js';
import { render, results } from './ui.js';

const { ui, state, helpers, router, modals, premium, fx, CATEGORY_META, SWIPE_HELP, DUO_PLAYERS, background } = app;

const modalFlows = {
  showPass(playerIndex, onReady) {
    const label = DUO_PLAYERS[playerIndex] || 'Игрок';
    ui.passModalTitle.textContent = 'Передайте телефон';
    ui.passModalText.textContent = `Сейчас отвечает ${label}`;
    modals.open(ui.passModal);
    router.syncBackButton(router.current());
    const handleReady = () => {
      modals.close(ui.passModal);
      router.syncBackButton(router.current());
      ui.passModalBtn.removeEventListener('click', handleReady);
      if (typeof onReady === 'function') onReady();
    };
    ui.passModalBtn.addEventListener('click', handleReady);
  }
};

export const game = {
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
    state.questionStreak = 0;
    state.duoRoundAnswers = [null, null];
    state.duoActivePlayer = 0;
    render.resetQuestionCard();
    render.updateModeUI();
  },
  openCategory(categoryId) {
    state.currentCategory = CATEGORY_META.find((category) => category.id === categoryId) || null;
    if (!state.currentCategory) return;
    if (categoryId === '18+' && !helpers.isAdultConfirmed()) {
      state.pendingAdultCategory = categoryId;
      modals.open(ui.adultModal);
      router.syncBackButton(router.current());
      return;
    }
    if (state.currentCategory.isPremium && !helpers.getPremiumUnlocked()) {
      modals.open(ui.premiumModal);
      router.syncBackButton(router.current());
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
    if (state.currentCategory?.id === 'Блиц') return this.startBlitz();
    let sourceQuestions = helpers.getCurrentCategoryQuestions(state.currentCategory.id);
    if ((!sourceQuestions || !sourceQuestions.length) && state.currentCategory?.id === 'Избранное') sourceQuestions = state.favorites.map((item) => item.question);
    if ((!sourceQuestions || !sourceQuestions.length) && state.currentQuestions.length) sourceQuestions = state.currentQuestions;
    if (!sourceQuestions.length) {
      app.notify.info('В этой категории пока нет вопросов.');
      router.show('categories');
      return;
    }
    const limit = helpers.getRoundSize(sourceQuestions.length);
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
    state.questionStreak = 0;
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
    if (type === 'match' && state.gameMode !== 'duo') setTimeout(() => fx.launchConfetti(), 40);
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
          state.questionStreak += 1;
          setTimeout(() => fx.launchConfetti(), 50);
        } else { state.stats.mismatch += 1; state.questionStreak = 0; }
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
      if (type === 'match') state.questionStreak += 1;
      else if (type === 'mismatch') state.questionStreak = 0;
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

export const swipe = {
  getActiveContext() {
    if (app.screens.blitz.classList.contains('screen-active')) {
      return {
        mode: 'blitz',
        card: ui.blitzCard,
        allowUp: false
      };
    }
    if (app.screens.game.classList.contains('screen-active')) {
      return {
        mode: 'game',
        card: ui.questionCard,
        allowUp: true
      };
    }
    return null;
  },
  updateHint(offsetX, offsetY = 0) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card) return;
    const intensity = Math.min(Math.max(Math.abs(offsetX), Math.abs(offsetY)) / 120, 1);
    let direction = 'none';
    if (context.allowUp && offsetY < -70 && Math.abs(offsetX) < 100) direction = 'up';
    else if (offsetX > 0) direction = 'right';
    else if (offsetX < 0) direction = 'left';
    card.dataset.swipe = direction;
    card.style.setProperty('--swipe-opacity', intensity.toFixed(2));
    if (!ui.swipeHelp || context.mode !== 'game') return;
    ui.swipeHelp.textContent = {
      none: SWIPE_HELP,
      left: 'Отпускай — отметим «Не совпало»',
      right: 'Отпускай — отметим «Совпало»',
      up: 'Отпускай — это «Пропуск»'
    }[direction];
  },
  animateOut(type, callback) {
    const context = this.getActiveContext();
    const card = context?.card || ui.questionCard;
    const map = {
      match: { x: 420, y: -20, rotate: 16 },
      mismatch: { x: -420, y: -20, rotate: -16 },
      skip: { x: 0, y: -360, rotate: 0 }
    };
    const config = map[type];
    if (!config || !card) return callback?.();
    if (!state.settings.animations) return callback();
    card.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1), opacity 260ms ease';
    card.style.opacity = '0';
    card.style.transform = `translate3d(${config.x}px, ${config.y}px, 0) rotate(${config.rotate}deg) scale(0.96)`;
    setTimeout(callback, 280);
  },
  onPointerDown(event) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card || event.currentTarget !== card) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    state.swipe.active = true;
    state.swipe.dragging = true;
    state.swipe.pointerId = event.pointerId;
    state.swipe.startX = event.clientX;
    state.swipe.startY = event.clientY;
    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;
    card.setPointerCapture?.(event.pointerId);
    card.style.transition = 'none';
  },
  onPointerMove(event) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card || !state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
    if (event.cancelable) event.preventDefault();
    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;
    if (!state.swipe.isAnimating) {
      requestAnimationFrame(() => {
        const deltaX = state.swipe.currentX - state.swipe.startX;
        const deltaY = state.swipe.currentY - state.swipe.startY;
        if (context.allowUp && Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && Math.abs(deltaY) < 50) {
          state.swipe.isAnimating = false;
          return;
        }
        const rotate = deltaX / 18;
        const visualY = context.allowUp ? deltaY * 0.18 : 0;
        const stretch = 1 - Math.min(Math.abs(deltaX) / 1200, 0.03);
        card.style.transform = `translate3d(${deltaX}px, ${visualY}px, 0) rotate(${rotate}deg) scale(${stretch})`;
        this.updateHint(deltaX, deltaY);
        state.swipe.isAnimating = false;
      });
      state.swipe.isAnimating = true;
    }
  },
  onPointerUp(event) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card || !state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
    state.swipe.active = false;
    state.swipe.dragging = false;
    const deltaX = state.swipe.currentX - state.swipe.startX;
    const deltaY = state.swipe.currentY - state.swipe.startY;
    const velocity = Math.abs(deltaX) / Math.max(1, Math.abs(deltaY) + 1);
    const threshold = window.innerWidth < 480 ? 70 : 90;
    card.releasePointerCapture?.(event.pointerId);
    state.swipe.pointerId = null;
    if (context.mode === 'blitz') {
      if (deltaX > threshold || (deltaX > 45 && velocity > 2.4)) return game.answerBlitz(true);
      if (deltaX < -threshold || (deltaX < -45 && velocity > 2.4)) return game.answerBlitz(false);
    } else {
      if (deltaX > threshold || (deltaX > 45 && velocity > 2.4)) return game.answer('match');
      if (deltaX < -threshold || (deltaX < -45 && velocity > 2.4)) return game.answer('mismatch');
      if (context.allowUp && deltaY < -110 && Math.abs(deltaX) < 100) return game.answer('skip');
    }
    card.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1)';
    card.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    this.updateHint(0, 0);
  },
  attachHandlers() {
    [ui.questionCard, ui.blitzCard].filter(Boolean).forEach((card) => {
      card.addEventListener('pointerdown', this.onPointerDown.bind(this));
      card.addEventListener('pointermove', this.onPointerMove.bind(this));
      card.addEventListener('pointerup', this.onPointerUp.bind(this));
      card.addEventListener('pointercancel', this.onPointerUp.bind(this));
      card.addEventListener('touchmove', (event) => {
        if (event.cancelable) event.preventDefault();
      }, { passive: false });
    });
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

Object.assign(app, { modalFlows, game, swipe, premium });

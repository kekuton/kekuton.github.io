import { app } from './core.js?v=20260416b';
import { render, results } from './ui.js';

const { ui, state, helpers, router, modals, premium, fx, CATEGORY_META, SWIPE_HELP, DUO_PLAYERS, background } = app;
const SWIPE_THRESHOLD = {
  tapDistance: 18,
  horizontalMobile: 70,
  horizontalDesktop: 90,
  horizontalFast: 45,
  horizontalVelocity: 2.4,
  verticalSkip: 110,
  verticalHorizontalLimit: 100
};

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
    if (state.swipe.locked) return;
    state.swipe.locked = true;
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
          modalFlows.showPass(1, () => {
            render.gameQuestion(true);
            state.swipe.locked = false;
          });
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
        if (state.currentIndex >= state.currentQuestions.length) {
          state.swipe.locked = false;
          this.finish();
        } else {
          modalFlows.showPass(0, () => {
            render.gameQuestion();
            state.swipe.locked = false;
          });
        }
      });
      return;
    }
    swipe.animateOut(type, () => {
      state.stats[type] += 1;
      if (type === 'match') state.questionStreak += 1;
      else if (type === 'mismatch') state.questionStreak = 0;
      state.currentIndex += 1;
      render.resetQuestionCard();
      if (state.currentIndex >= state.currentQuestions.length) {
        state.swipe.locked = false;
        this.finish();
      } else {
        render.gameQuestion();
        state.swipe.locked = false;
      }
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
  updateHint(offsetX, offsetY = 0) {
    const deadZone = 12;
    const intensity = Math.min(Math.max(Math.abs(offsetX), Math.abs(offsetY)) / 120, 1);
    let direction = 'none';
    if (Math.abs(offsetX) < deadZone && Math.abs(offsetY) < deadZone) direction = 'none';
    else if (offsetY < -70 && Math.abs(offsetX) < 100) direction = 'up';
    else if (offsetX > deadZone) direction = 'right';
    else if (offsetX < -deadZone) direction = 'left';
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
      match: { x: 380, y: -18, rotate: 10, scale: 0.97 },
      mismatch: { x: -380, y: -18, rotate: -10, scale: 0.97 },
      skip: { x: 0, y: -300, rotate: 0, scale: 0.96 }
    };
    const config = map[type];
    if (!config) return;
    if (!state.settings.animations) { callback(); return; }
    document.body.classList.remove('is-swiping');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      card.removeEventListener('transitionend', finish);
      callback();
    };
    card.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1), opacity 180ms ease';
    card.style.opacity = '0';
    card.style.filter = 'none';
    card.style.transform = `translate3d(${config.x}px, ${config.y}px, 0) rotate(${config.rotate}deg) scale(${config.scale})`;
    card.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 260);
  },
  onPointerDown(event) {
    if (!app.screens.game.classList.contains('screen-active')) return;
    if (state.swipe.locked) return;
    if (typeof event.isPrimary === 'boolean' && !event.isPrimary) return;
    if (event.pointerType === 'mouse' && typeof event.button === 'number' && event.button !== 0) return;
    state.swipe.active = true;
    state.swipe.dragging = false;
    state.swipe.pointerId = event.pointerId;
    state.swipe.startX = event.clientX;
    state.swipe.startY = event.clientY;
    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;
    ui.questionCard.style.opacity = '1';
    ui.questionCard.style.filter = 'none';
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
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < 18) {
          this.updateHint(0, 0);
          state.swipe.isAnimating = false;
          return;
        }
        if (!state.swipe.dragging) {
          state.swipe.dragging = true;
          ui.questionCard.setPointerCapture?.(event.pointerId);
          ui.questionCard.style.transition = 'none';
          document.body.classList.add('is-swiping');
        }
        if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && Math.abs(deltaY) < 50) {
          state.swipe.isAnimating = false;
          return;
        }
        const rotate = deltaX / 24;
        const stretch = 1 - Math.min(Math.abs(deltaX) / 1600, 0.018);
        ui.questionCard.style.filter = 'none';
        ui.questionCard.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.12}px, 0) rotate(${rotate}deg) scale(${stretch})`;
        this.updateHint(deltaX, deltaY);
        state.swipe.isAnimating = false;
      });
      state.swipe.isAnimating = true;
    }
  },
  onPointerUp(event) {
    if (!state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
    state.swipe.active = false;
    const wasDragging = state.swipe.dragging;
    state.swipe.dragging = false;
    const deltaX = state.swipe.currentX - state.swipe.startX;
    const deltaY = state.swipe.currentY - state.swipe.startY;
    const velocity = Math.abs(deltaX) / Math.max(1, Math.abs(deltaY) + 1);
    const threshold = window.innerWidth < 480 ? SWIPE_THRESHOLD.horizontalMobile : SWIPE_THRESHOLD.horizontalDesktop;
    if (wasDragging) ui.questionCard.releasePointerCapture?.(event.pointerId);
    state.swipe.pointerId = null;
    if (!wasDragging || (Math.abs(deltaX) < SWIPE_THRESHOLD.tapDistance && Math.abs(deltaY) < SWIPE_THRESHOLD.tapDistance)) {
      ui.questionCard.style.transition = 'transform 140ms ease, opacity 140ms ease';
      ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
      ui.questionCard.style.opacity = '1';
      ui.questionCard.style.filter = 'none';
      document.body.classList.remove('is-swiping');
      this.updateHint(0, 0);
      return;
    }
    if (deltaX > threshold || (deltaX > SWIPE_THRESHOLD.horizontalFast && velocity > SWIPE_THRESHOLD.horizontalVelocity)) return game.answer('match');
    if (deltaX < -threshold || (deltaX < -SWIPE_THRESHOLD.horizontalFast && velocity > SWIPE_THRESHOLD.horizontalVelocity)) return game.answer('mismatch');
    if (deltaY < -SWIPE_THRESHOLD.verticalSkip && Math.abs(deltaX) < SWIPE_THRESHOLD.verticalHorizontalLimit) return game.answer('skip');
    ui.questionCard.style.transition = 'transform 180ms cubic-bezier(.2,.9,.2,1), opacity 140ms ease';
    ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    ui.questionCard.style.opacity = '1';
    ui.questionCard.style.filter = 'none';
    document.body.classList.remove('is-swiping');
    this.updateHint(0, 0);
  },
  attachHandlers() {
    const onDown = this.onPointerDown.bind(this);
    const onMove = this.onPointerMove.bind(this);
    const onUp = this.onPointerUp.bind(this);
    const toPseudoPointerEvent = (touch, originalEvent, phase = 'move') => ({
      pointerId: 'touch',
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      clientX: touch?.clientX ?? state.swipe.currentX,
      clientY: touch?.clientY ?? state.swipe.currentY,
      cancelable: !!originalEvent?.cancelable,
      preventDefault: () => originalEvent?.preventDefault?.(),
      type: `touch${phase}`
    });
    const onLostCapture = () => {
      state.swipe.active = false;
      state.swipe.dragging = false;
      state.swipe.pointerId = null;
      state.swipe.isAnimating = false;
      ui.questionCard.style.transition = 'transform 140ms ease, opacity 140ms ease';
      ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
      ui.questionCard.style.opacity = '1';
      ui.questionCard.style.filter = 'none';
      document.body.classList.remove('is-swiping');
      this.updateHint(0, 0);
    };
    ui.questionCard.addEventListener('pointerdown', onDown);
    ui.questionCard.addEventListener('pointermove', onMove);
    ui.questionCard.addEventListener('pointerup', onUp);
    ui.questionCard.addEventListener('pointercancel', onUp);
    ui.questionCard.addEventListener('lostpointercapture', onLostCapture);
    ui.questionCard.addEventListener('touchmove', (event) => {
      if (state.swipe.dragging && event.cancelable) event.preventDefault();
    }, { passive: false });
    ui.questionCard.addEventListener('touchstart', (event) => {
      if (state.swipe.active && state.swipe.pointerId !== 'touch') return;
      const touch = event.touches?.[0];
      if (!touch) return;
      onDown(toPseudoPointerEvent(touch, event, 'start'));
    }, { passive: true });
    ui.questionCard.addEventListener('touchmove', (event) => {
      if (!state.swipe.active || state.swipe.pointerId !== 'touch') return;
      const touch = event.touches?.[0];
      if (!touch) return;
      onMove(toPseudoPointerEvent(touch, event));
    }, { passive: false });
    ui.questionCard.addEventListener('touchend', (event) => {
      if (!state.swipe.active || state.swipe.pointerId !== 'touch') return;
      const touch = event.changedTouches?.[0] || event.touches?.[0];
      onUp(toPseudoPointerEvent(touch, event, 'end'));
    }, { passive: true });
    ui.questionCard.addEventListener('touchcancel', (event) => {
      if (!state.swipe.active || state.swipe.pointerId !== 'touch') return;
      const touch = event.changedTouches?.[0] || event.touches?.[0];
      onUp(toPseudoPointerEvent(touch, event, 'cancel'));
    }, { passive: true });
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

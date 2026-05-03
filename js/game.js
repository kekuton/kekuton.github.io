import { app } from './core.js';
import { render } from './ui.js';

const { ui, state, helpers, router, modals, fx, CATEGORY_META, background, storage, STORAGE_KEYS } = app;

function saveProgress() {
  if (!state.currentCategory) return;
  storage.set(helpers.progressKey(state.currentCategory.id), {
    index: state.currentIndex,
    questions: state.currentQuestions,
  });
}

function clearProgress(categoryId = state.currentCategory?.id) {
  if (categoryId) storage.remove(helpers.progressKey(categoryId));
}

export const game = {
  openCategory(categoryId) {
    state.currentCategory = CATEGORY_META.find((category) => category.id === categoryId) || null;
    if (!state.currentCategory) return;
    if (categoryId === '18+' && !helpers.isAdultConfirmed()) {
      state.pendingAdultCategory = categoryId;
      modals.open(ui.adultModal);
      router.syncBackButton(router.current());
      return;
    }
    background.apply(categoryId);
    this.start();
  },

  start() {
    const sourceQuestions = helpers.getCurrentCategoryQuestions(state.currentCategory.id);
    if (!sourceQuestions.length) {
      app.notify.info('В этой категории пока нет вопросов.');
      router.show('categories', { reset: true });
      return;
    }

    const saved = storage.get(helpers.progressKey(state.currentCategory.id), null);
    if (saved?.questions?.length && Number.isInteger(saved.index) && saved.index > 0 && saved.index < saved.questions.length) {
      state.currentQuestions = saved.questions.slice(0, helpers.getRoundSize(saved.questions.length));
      state.currentIndex = saved.index;
    } else {
      const limit = helpers.getRoundSize(sourceQuestions.length);
      state.currentQuestions = state.currentCategory?.isScenario ? sourceQuestions.slice(0, limit) : helpers.shuffle(sourceQuestions).slice(0, limit);
      state.currentIndex = 0;
      saveProgress();
    }

    state.questionTransitionLocked = false;
    router.show('game');
    render.updateModeUI();
    render.gameQuestion(true);
  },

  answer() {
    if (state.questionTransitionLocked) return;
    state.questionTransitionLocked = true;
    fx.vibrate('light');
    swipe.animateOut(() => {
      state.currentIndex += 1;
      if (state.currentIndex >= state.currentQuestions.length) {
        clearProgress();
        render.resetQuestionCard();
        render.completion();
        state.questionTransitionLocked = false;
        return;
      }
      saveProgress();
      render.resetQuestionCard();
      render.gameQuestion(false);
      window.setTimeout(() => { state.questionTransitionLocked = false; }, 120);
    });
  },
};

export const swipe = {
  getActiveContext() {
    if (app.screens.game?.classList.contains('screen-active')) return { card: ui.questionCard };
    return null;
  },

  animateOut(callback) {
    const card = ui.questionCard;
    if (!card) return callback?.();
    card.classList.remove('is-swiping');
    card.style.willChange = 'transform, opacity';
    card.style.setProperty('transition', 'transform 260ms cubic-bezier(.2,.82,.2,1), opacity 220ms ease', 'important');
    card.style.setProperty('transform', 'translate3d(0,-150px,0) scale(.985)', 'important');
    card.style.setProperty('opacity', '0', 'important');
    window.setTimeout(() => {
      card.style.willChange = '';
      callback?.();
    }, 260);
  },

  onPointerDown(event) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card || event.currentTarget !== card) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    state.swipe.active = true;
    state.swipe.pointerId = event.pointerId;
    state.swipe.startX = event.clientX;
    state.swipe.startY = event.clientY;
    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;
    card.setPointerCapture?.(event.pointerId);
    card.classList.add('is-swiping');
    card.style.setProperty('transition', 'none', 'important');
  },

  onPointerMove(event) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card || !state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
    if (event.cancelable) event.preventDefault();
    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;
    if (state.swipe.isAnimating) return;
    state.swipe.isAnimating = true;
    requestAnimationFrame(() => {
      const dx = state.swipe.currentX - state.swipe.startX;
      const dy = state.swipe.currentY - state.swipe.startY;
      const x = Math.max(-22, Math.min(22, dx * 0.16));
      const y = dy < 0 ? Math.max(-100, dy * 0.38) : Math.min(24, dy * 0.14);
      const rotate = Math.max(-2.5, Math.min(2.5, dx / 80));
      const scale = 1 - Math.min(Math.abs(y) / 3000, 0.018);
      card.style.setProperty('transform', `translate3d(${x}px,${y}px,0) rotate(${rotate}deg) scale(${scale})`, 'important');
      state.swipe.isAnimating = false;
    });
  },

  onPointerUp(event) {
    const context = this.getActiveContext();
    const card = context?.card;
    if (!card || !state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
    state.swipe.active = false;
    state.swipe.pointerId = null;
    card.releasePointerCapture?.(event.pointerId);
    card.classList.remove('is-swiping');
    const dx = state.swipe.currentX - state.swipe.startX;
    const dy = state.swipe.currentY - state.swipe.startY;
    const isUpSwipe = dy < -58 && Math.abs(dy) > Math.abs(dx) * 0.72;
    if (isUpSwipe) return game.answer();
    state.swipe.isAnimating = false;
    card.style.setProperty('transition', 'transform 220ms cubic-bezier(.2,.9,.2,1)', 'important');
    card.style.setProperty('transform', 'translate3d(0,0,0) rotate(0deg) scale(1)', 'important');
  },

  attachHandlers() {
    const card = ui.questionCard;
    if (!card || card.dataset.swipeBound === '1') return;
    card.dataset.swipeBound = '1';
    card.addEventListener('pointerdown', this.onPointerDown.bind(this));
    card.addEventListener('pointermove', this.onPointerMove.bind(this));
    card.addEventListener('pointerup', this.onPointerUp.bind(this));
    card.addEventListener('pointercancel', this.onPointerUp.bind(this));

    card.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      state.touchFallbackStartX = touch.clientX;
      state.touchFallbackStartY = touch.clientY;
    }, { passive: true });

    card.addEventListener('touchend', (event) => {
      if (!app.screens.game?.classList.contains('screen-active') || state.questionTransitionLocked) return;
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      const dx = touch.clientX - (state.touchFallbackStartX || touch.clientX);
      const dy = touch.clientY - (state.touchFallbackStartY || touch.clientY);
      if (dy < -62 && Math.abs(dy) > Math.abs(dx) * 0.72) {
        if (event.cancelable) event.preventDefault();
        game.answer();
      }
    }, { passive: false });

    document.addEventListener('touchstart', (event) => {
      if (!app.screens.game?.classList.contains('screen-active')) return;
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      state.globalTouchStartX = touch.clientX;
      state.globalTouchStartY = touch.clientY;
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      if (!app.screens.game?.classList.contains('screen-active') || state.questionTransitionLocked) return;
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      const dx = touch.clientX - (state.globalTouchStartX || touch.clientX);
      const dy = touch.clientY - (state.globalTouchStartY || touch.clientY);
      if (dy < -72 && Math.abs(dy) > Math.abs(dx) * 0.82) {
        if (event.cancelable) event.preventDefault();
        game.answer();
      }
    }, { passive: false });
  },

  preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) event.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  },
};

Object.assign(app, { game, swipe });

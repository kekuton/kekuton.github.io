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
    app.render.intro();
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
      // Каждый новый раунд получает свой случайный порядок без повторов.
      // Если пользователь вышел и вернулся, сохранённый порядок продолжится.
      state.currentQuestions = helpers.shuffle(sourceQuestions).slice(0, limit);
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
        fx.vibrate('success');
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

  exitToCategories() {
    if (state.questionTransitionLocked) return;
    swipe.resetSwipeState();
    swipe.clearCardRuntimeStyles();
    fx.vibrate('light');
    router.show('categories', { reset: true });
  },
};

export const swipe = {
  activeCard() {
    if (!app.screens.game?.classList.contains('screen-active')) return null;
    return ui.questionCard || null;
  },

  clearCardRuntimeStyles() {
    const card = ui.questionCard;
    if (!card) return;
    card.style.removeProperty('transition');
    card.style.removeProperty('transform');
    card.style.removeProperty('opacity');
    card.style.removeProperty('will-change');
    card.classList.remove('is-swiping');
  },

  animateOut(callback) {
    const card = ui.questionCard;
    if (!card) {
      callback?.();
      return;
    }

    card.classList.remove('is-swiping');
    card.classList.remove('question-card-enter');
    card.style.willChange = 'transform, opacity';
    card.style.transition = 'transform 240ms cubic-bezier(.22,.72,.18,1), opacity 220ms ease';
    card.style.transform = 'translate3d(0,-132px,0) scale(.985)';
    card.style.opacity = '0';

    window.setTimeout(() => {
      callback?.();
    }, 245);
  },

  resetSwipeState() {
    state.swipe.active = false;
    state.swipe.pointerId = null;
    state.swipe.isAnimating = false;
    state.swipe.startX = 0;
    state.swipe.startY = 0;
    state.swipe.currentX = 0;
    state.swipe.currentY = 0;
  },

  onPointerDown(event) {
    const card = this.activeCard();
    if (!card || event.currentTarget !== card || state.questionTransitionLocked) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    this.resetSwipeState();
    state.swipe.active = true;
    state.swipe.pointerId = event.pointerId;
    state.swipe.startX = event.clientX;
    state.swipe.startY = event.clientY;
    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;

    card.setPointerCapture?.(event.pointerId);
    card.classList.add('is-swiping');
    card.classList.remove('question-card-enter');
    card.style.transition = 'none';
    card.style.willChange = 'transform';
  },

  onPointerMove(event) {
    const card = this.activeCard();
    if (!card || !state.swipe.active || state.swipe.pointerId !== event.pointerId) return;
    if (event.cancelable) event.preventDefault();

    state.swipe.currentX = event.clientX;
    state.swipe.currentY = event.clientY;

    if (state.swipe.isAnimating) return;
    state.swipe.isAnimating = true;

    requestAnimationFrame(() => {
      const dx = state.swipe.currentX - state.swipe.startX;
      const dy = state.swipe.currentY - state.swipe.startY;
      const x = Math.max(-18, Math.min(18, dx * 0.12));
      const y = dy < 0 ? Math.max(-86, dy * 0.34) : Math.min(54, dy * 0.24);
      const rotate = Math.max(-1.8, Math.min(1.8, dx / 120));
      const scale = 1 - Math.min(Math.abs(y) / 3600, 0.016);

      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
      state.swipe.isAnimating = false;
    });
  },

  onPointerUp(event) {
    const card = this.activeCard();
    if (!card || !state.swipe.active || state.swipe.pointerId !== event.pointerId) return;

    const dx = state.swipe.currentX - state.swipe.startX;
    const dy = state.swipe.currentY - state.swipe.startY;
    const isUpSwipe = dy < -70 && Math.abs(dy) > Math.abs(dx) * 0.7;
    const isDownSwipe = dy > 82 && Math.abs(dy) > Math.abs(dx) * 0.75;

    state.swipe.active = false;
    state.swipe.pointerId = null;
    state.swipe.isAnimating = false;
    card.releasePointerCapture?.(event.pointerId);
    card.classList.remove('is-swiping');

    if (isUpSwipe) {
      game.answer();
      return;
    }

    if (isDownSwipe) {
      card.style.transition = 'transform 180ms cubic-bezier(.22,.9,.2,1), opacity 160ms ease';
      card.style.transform = 'translate3d(0,48px,0) scale(.99)';
      card.style.opacity = '0';
      window.setTimeout(() => game.exitToCategories(), 165);
      return;
    }

    card.style.transition = 'transform 220ms cubic-bezier(.22,.9,.2,1)';
    card.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    window.setTimeout(() => {
      if (!state.swipe.active && !state.questionTransitionLocked) card.style.removeProperty('transition');
    }, 230);
  },

  attachHandlers() {
    const card = ui.questionCard;
    if (!card || card.dataset.swipeBound === '1') return;
    card.dataset.swipeBound = '1';

    card.addEventListener('pointerdown', this.onPointerDown.bind(this));
    card.addEventListener('pointermove', this.onPointerMove.bind(this));
    card.addEventListener('pointerup', this.onPointerUp.bind(this));
    card.addEventListener('pointercancel', this.onPointerUp.bind(this));
    card.addEventListener('lostpointercapture', () => {
      if (!state.swipe.active || state.questionTransitionLocked) return;
      this.resetSwipeState();
      card.classList.remove('is-swiping');
      card.style.transition = 'transform 180ms ease';
      card.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    });
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

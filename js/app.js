import { app } from './core.js';
import './ui.js';
import './game.js';
import './settings.js';

const { ui, state, router, theme, data, background, render, loading, swipe, initTelegram, modals, settings, game, fx, storage, STORAGE_KEYS, ONBOARDING_STEPS, helpers, CATEGORY_META, meta, notify } = app;

function finishOnboarding() {
  storage.setRaw(STORAGE_KEYS.onboardingSeen, 'yes');
  state.onboardingStep = 0;
  router.show('home', { reset: true });
}

function bindEvents() {
  let categoryTouchY = 0;
  let categorySwipeMoved = false;

  ui.categoriesGrid.addEventListener('touchstart', (event) => {
    categoryTouchY = event.touches?.[0]?.clientY || 0;
    categorySwipeMoved = false;
  }, { passive: true });

  ui.categoriesGrid.addEventListener('touchmove', (event) => {
    const currentY = event.touches?.[0]?.clientY || 0;
    if (Math.abs(currentY - categoryTouchY) > 18) categorySwipeMoved = true;
  }, { passive: true });

  const updateActiveCategoryCard = () => {
    const cards = [...ui.categoriesGrid.querySelectorAll('.category-card')];
    if (!cards.length) return;
    const viewportCenter = window.innerHeight / 2;
    let active = cards[0];
    let minDistance = Infinity;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        active = card;
      }
    });
    cards.forEach((card) => card.classList.toggle('is-feed-active', card === active));
  };

  let categoryScrollRaf = 0;
  ui.categoriesGrid.addEventListener('scroll', () => {
    if (categoryScrollRaf) return;
    categoryScrollRaf = requestAnimationFrame(() => {
      categoryScrollRaf = 0;
      updateActiveCategoryCard();
    });
  }, { passive: true });

  ui.categoriesGrid.addEventListener('click', (event) => {
    if (categorySwipeMoved) {
      event.preventDefault();
      categorySwipeMoved = false;
      return;
    }
    const card = event.target.closest('.category-card');
    if (card?.dataset.id) game.openCategory(card.dataset.id);
  });

  ui.categoriesGrid.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.category-card');
    if (card?.dataset.id) {
      event.preventDefault();
      game.openCategory(card.dataset.id);
    }
  });

  ui.startBtn?.addEventListener('click', () => router.show('categories'));
  ui.historyBtn?.addEventListener('click', () => router.show('history'));
  ui.settingsBtn?.addEventListener('click', () => settings.open());
  ui.openSettingsBtn?.addEventListener('click', () => settings.open());
  ui.backBtn?.addEventListener('click', () => router.back());
  ui.themeBtn?.addEventListener('click', () => theme.toggle());

  ui.dailyQuestionBtn?.addEventListener('click', () => {
    const daily = helpers.dailyQuestion();
    if (!daily) return;
    state.currentCategory = CATEGORY_META.find((item) => item.id === daily.category) || { id: daily.category };
    state.currentQuestions = [daily.question];
    game.resetRound('solo');
    router.show('game');
    render.gameQuestion(true);
  });
  const openFavorites = () => {
    render.favorites();
    router.show('favorites');
  };
  ui.favoritesBtn?.addEventListener('click', openFavorites);
  ui.openFavoritesBtn?.addEventListener('click', openFavorites);
  ui.achievementsBtn?.addEventListener('click', () => {
    render.achievements();
    router.show('achievements');
  });
  ui.startFavoritesBtn?.addEventListener('click', () => {
    if (!state.favorites.length) return;
    state.currentCategory = { id: 'Избранное' };
    state.currentQuestions = state.favorites.map((item) => item.question).slice(0, Math.max(5, Math.min(12, state.favorites.length)));
    game.resetRound('solo');
    router.show('game');
    render.gameQuestion(true);
  });
  ui.questionNextBtn?.addEventListener('click', () => game.answer('skip'));
  ui.gameNavCategories?.addEventListener('click', () => router.show('categories'));
  ui.gameNavFavorites?.addEventListener('click', openFavorites);

  ui.favoriteQuestionBtn?.addEventListener('click', () => {
    const added = meta.toggleFavorite();
    render.favorites();
    render.homeDashboard();
    ui.favoriteQuestionBtn.classList.toggle('is-active', added);
    ui.favoriteQuestionBtn.textContent = added ? '★' : '☆';
    fx.vibrate('light');
  });
  ui.onboardingNextBtn?.addEventListener('click', () => {
    if (state.onboardingStep >= ONBOARDING_STEPS.length - 1) {
      finishOnboarding();
      return;
    }
    state.onboardingStep += 1;
    render.onboarding();
    fx.vibrate('light');
  });
  ui.onboardingSkipBtn?.addEventListener('click', () => finishOnboarding());

  ui.retryLoadBtn?.addEventListener('click', async () => {
    loading.show('Повторяем загрузку...');
    const ok = await data.loadQuestions();
    render.categories();
    loading.hide();
    if (ok) router.show('home', { reset: true });
    else render.errorScreen(state.loadError || 'Не удалось загрузить вопросы.');
  });
  ui.goHomeFromErrorBtn?.addEventListener('click', () => router.show('home', { reset: true }));

  ui.matchBtn?.addEventListener('click', () => game.answer('match'));
  ui.mismatchBtn?.addEventListener('click', () => game.answer('mismatch'));
  ui.skipBtn?.addEventListener('click', () => game.answer('skip'));
  ui.blitzCorrectBtn?.addEventListener('click', () => game.answerBlitz(true));
  ui.blitzIncorrectBtn?.addEventListener('click', () => game.answerBlitz(false));

  ui.restartBtn?.addEventListener('click', () => game.start(state.gameMode));
  ui.changeCategoryBtn?.addEventListener('click', () => router.show('categories'));
  ui.shareBtn?.addEventListener('click', () => app.results.share());

  ui.historySearchInput?.addEventListener('input', (event) => {
    state.historyFilter = event.target.value || '';
    render.history();
  });

  ui.addCustomQuestionBtn?.addEventListener('click', () => {
    render.addCustomQuestionInput();
    fx.vibrate('light');
  });

  ui.saveCustomGameBtn?.addEventListener('click', () => {
    const questions = Array.from(document.querySelectorAll('.custom-question-input'))
      .map((input) => input.value.trim())
      .filter(Boolean);
    if (questions.length < 3) {
      notify.error('Напишите хотя бы 3 вопроса, чтобы начать игру.');
      return;
    }
    app.storage.set(app.STORAGE_KEYS.customQuestions, questions);
    state.questionsData['Своя игра'] = questions;
    render.categories();
    game.start();
  });



  ui.adultConfirmBtn?.addEventListener('click', () => {
    app.storage.setRaw(app.STORAGE_KEYS.adult, 'yes');
    modals.close(ui.adultModal);
    router.syncBackButton(router.current());
    const pending = state.pendingAdultCategory;
    state.pendingAdultCategory = null;
    if (pending) game.openCategory(pending);
  });

  ui.adultCancelBtn?.addEventListener('click', () => {
    state.pendingAdultCategory = null;
    modals.close(ui.adultModal);
    router.syncBackButton(router.current());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') router.back();
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modals.close(modal);
        router.syncBackButton(router.current());
      }
    });
  });
}

async function init() {
  loading.show('Подготавливаем приложение...');
  data.loadSettings();
  theme.init();
  background.reset();
  render.syncSettingsUI();
  const questionsLoaded = await data.loadQuestions();
  render.categories();
  render.history();
  render.favorites();
  render.achievements();
  render.homeDashboard();
  render.onboarding();
  swipe.preventDoubleTapZoom();
  await initTelegram();
  swipe.attachHandlers();
  settings.bind();
  bindEvents();

  if (!questionsLoaded) {
    render.errorScreen(state.loadError || 'Не удалось загрузить вопросы.');
    loading.hide();
    return;
  }

  const onboardingSeen = storage.getRaw(STORAGE_KEYS.onboardingSeen) === 'yes';
  if (!onboardingSeen) router.show('onboarding', { reset: true });
  else router.show('home', { reset: true });
  loading.hide();
}

document.addEventListener('DOMContentLoaded', init);

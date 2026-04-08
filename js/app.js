import { app } from './core.js';
import './ui.js';
import './game.js';
import './settings.js';

const { ui, state, router, theme, data, background, render, loading, swipe, initTelegram, modals, premium, settings, game, fx, storage, STORAGE_KEYS, ONBOARDING_STEPS } = app;

function finishOnboarding() {
  storage.setRaw(STORAGE_KEYS.onboardingSeen, 'yes');
  state.onboardingStep = 0;
  router.show('home', { reset: true });
}

function bindEvents() {
  ui.categoriesGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.category-card');
    if (card?.dataset.id) game.openCategory(card.dataset.id);
  });

  ui.startBtn?.addEventListener('click', () => router.show('categories'));
  ui.historyBtn?.addEventListener('click', () => router.show('history'));
  ui.settingsBtn?.addEventListener('click', () => settings.open());
  ui.openSettingsBtn?.addEventListener('click', () => settings.open());
  ui.backBtn?.addEventListener('click', () => router.back());
  ui.themeBtn?.addEventListener('click', () => theme.toggle());

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
      alert('Напишите хотя бы 3 вопроса, чтобы начать игру!');
      return;
    }
    app.storage.set(app.STORAGE_KEYS.customQuestions, questions);
    state.questionsData['Своя игра'] = questions;
    render.categories();
    game.start();
  });

  ui.buyPremiumBtn?.addEventListener('click', () => premium.purchase());
  ui.closePremiumBtn?.addEventListener('click', () => {
    modals.close(ui.premiumModal);
    router.syncBackButton(router.current());
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

(() => {
  'use strict';
  const app = window.CouplesApp;
  const { ui, state, router, theme, data, background, render, loading, swipe, initTelegram, modals, premium, settings, game, fx } = app;

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

    ui.matchBtn?.addEventListener('click', () => game.answer('match'));
    ui.mismatchBtn?.addEventListener('click', () => game.answer('mismatch'));
    ui.skipBtn?.addEventListener('click', () => game.answer('skip'));
    ui.blitzCorrectBtn?.addEventListener('click', () => game.answerBlitz(true));
    ui.blitzIncorrectBtn?.addEventListener('click', () => game.answerBlitz(false));

    ui.restartBtn?.addEventListener('click', () => game.start(state.gameMode));
    ui.changeCategoryBtn?.addEventListener('click', () => router.show('categories'));
    ui.shareBtn?.addEventListener('click', () => app.results.share());

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
    await data.loadQuestions();
    render.categories();
    render.history();
    if (Object.keys(state.questionsData).length === 0) {
      console.warn('Вопросы не загружены');
      render.loadWarning('Не удалось загрузить вопросы. Проверь подключение и обнови страницу.');
    }
    swipe.preventDoubleTapZoom();
    await initTelegram();
    swipe.attachHandlers();
    settings.bind();
    bindEvents();
    router.show('home', { reset: true });
    loading.hide();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

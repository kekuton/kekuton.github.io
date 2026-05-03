import { app } from './core.js';
import './ui.js';
import './game.js';

const { ui, state, router, theme, data, background, render, loading, swipe, initTelegram, modals, game, helpers, CATEGORY_META } = app;

function updateActiveCategoryCard() {
  const cards = [...ui.categoriesGrid.querySelectorAll('.category-card')];
  if (!cards.length) return;
  const viewportCenter = window.innerHeight / 2;
  let active = cards[0];
  let minDistance = Infinity;
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
    if (distance < minDistance) {
      minDistance = distance;
      active = card;
    }
  });
  cards.forEach((card) => card.classList.toggle('is-feed-active', card === active));
}

function bindEvents() {
  let categoryTouchY = 0;
  let categorySwipeMoved = false;

  ui.categoriesGrid?.addEventListener('touchstart', (event) => {
    categoryTouchY = event.touches?.[0]?.clientY || 0;
    categorySwipeMoved = false;
  }, { passive: true });

  ui.categoriesGrid?.addEventListener('touchmove', (event) => {
    const currentY = event.touches?.[0]?.clientY || 0;
    if (Math.abs(currentY - categoryTouchY) > 18) categorySwipeMoved = true;
  }, { passive: true });

  let categoryScrollRaf = 0;
  ui.categoriesGrid?.addEventListener('scroll', () => {
    if (categoryScrollRaf) return;
    categoryScrollRaf = requestAnimationFrame(() => {
      categoryScrollRaf = 0;
      updateActiveCategoryCard();
    });
  }, { passive: true });

  ui.categoriesGrid?.addEventListener('click', (event) => {
    if (categorySwipeMoved) {
      event.preventDefault();
      categorySwipeMoved = false;
      return;
    }
    const card = event.target.closest('.category-card');
    if (card?.dataset.id) game.openCategory(card.dataset.id);
  });

  ui.categoriesGrid?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.category-card');
    if (!card?.dataset.id) return;
    event.preventDefault();
    game.openCategory(card.dataset.id);
  });

  ui.backBtn?.addEventListener('click', () => router.back());

  ui.retryLoadBtn?.addEventListener('click', async () => {
    loading.show('Повторяем загрузку...');
    const ok = await data.loadQuestions();
    render.categories();
    loading.hide();
    if (ok) router.show('categories', { reset: true });
    else render.errorScreen(state.loadError || 'Не удалось загрузить вопросы.');
  });

  ui.goHomeFromErrorBtn?.addEventListener('click', () => router.show('categories', { reset: true }));

  ui.adultConfirmBtn?.addEventListener('click', () => {
    app.storage.setRaw(app.STORAGE_KEYS.adult, 'yes');
    modals.close(ui.adultModal);
    const pending = state.pendingAdultCategory;
    state.pendingAdultCategory = null;
    if (pending) game.openCategory(pending);
  });

  ui.adultCancelBtn?.addEventListener('click', () => {
    state.pendingAdultCategory = null;
    modals.close(ui.adultModal);
    router.syncBackButton(router.current());
  });

  ui.completionCard?.addEventListener('click', () => router.show('categories', { reset: true }));
  app.screens.completion?.addEventListener('click', () => router.show('categories', { reset: true }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') router.back();
  });
}

async function clearOldPwaCache() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {}
}

async function init() {
  await clearOldPwaCache();
  loading.show('Подготавливаем приложение...');
  data.loadSettings();
  theme.init();
  background.reset();
  const questionsLoaded = await data.loadQuestions();
  render.categories();
  await initTelegram();
  swipe.attachHandlers();
  bindEvents();

  if (!questionsLoaded) {
    render.errorScreen(state.loadError || 'Не удалось загрузить вопросы.');
    loading.hide();
    return;
  }

  router.show('categories', { reset: true });
  loading.hide();
}

document.addEventListener('DOMContentLoaded', init);

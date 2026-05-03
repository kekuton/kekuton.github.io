import { app } from './core.js';

const { state, ui, helpers, router, CATEGORY_META } = app;

function makeEmpty(message) {
  const node = document.createElement('div');
  node.className = 'empty-state';
  node.textContent = message;
  return node;
}

export const render = {
  loadWarning(message) {
    if (!ui.categoriesGrid) return;
    ui.categoriesGrid.replaceChildren(makeEmpty(message));
  },

  errorScreen(message) {
    if (ui.errorText) ui.errorText.textContent = message;
    router.show('error', { reset: true });
  },

  categories() {
    if (!ui.categoriesGrid || !ui.categoryCardTemplate) return;
    const fragment = document.createDocumentFragment();

    CATEGORY_META.forEach((category, index) => {
      const questions = helpers.getCurrentCategoryQuestions(category.id);
      if (!questions.length) return;

      const card = ui.categoryCardTemplate.content.firstElementChild.cloneNode(true);
      card.dataset.id = category.id;
      card.dataset.index = String(index + 1);
      card.style.setProperty('--category-theme', category.color || 'linear-gradient(180deg,#c084fc,#7c3aed)');
      card.setAttribute('aria-label', `${category.id}. ${category.desc}. Нажмите, чтобы открыть категорию.`);

      const poster = card.querySelector('[data-role="poster"]');
      if (poster && category.cover) {
        poster.src = category.cover;
        poster.alt = category.id;
        poster.classList.remove('hidden');
      }

      const icon = card.querySelector('[data-role="icon"]');
      if (icon) icon.innerHTML = helpers.categoryIconSvg(category.icon);

      const badge = card.querySelector('[data-role="badge"]');
      if (badge) {
        badge.textContent = `${questions.length} вопросов`;
        badge.classList.remove('hidden');
      }

      const title = card.querySelector('[data-role="title"]');
      if (title) title.textContent = category.id;

      const desc = card.querySelector('[data-role="desc"]');
      if (desc) desc.textContent = category.desc;

      const counter = card.querySelector('[data-role="counter"]');
      if (counter) counter.textContent = `${index + 1} / ${CATEGORY_META.length}`;

      fragment.appendChild(card);
    });

    ui.categoriesGrid.replaceChildren(fragment);
    ui.categoriesGrid.querySelector('.category-card')?.classList.add('is-feed-active');
  },

  updateModeUI() {
    if (ui.gameCategory && state.currentCategory) ui.gameCategory.textContent = state.currentCategory.id;
  },

  gameQuestion(isInitial = false) {
    const question = state.currentQuestions[state.currentIndex] || '';
    const total = state.currentQuestions.length || 1;

    if (ui.gameCategory && state.currentCategory) ui.gameCategory.textContent = state.currentCategory.id;
    if (ui.gameTitle) ui.gameTitle.textContent = `Вопрос ${state.currentIndex + 1} из ${total}`;
    if (ui.progressLabel) ui.progressLabel.textContent = `${state.currentIndex + 1} / ${total}`;
    if (ui.questionText) ui.questionText.textContent = question;

    if (ui.questionCard) {
      ui.questionCard.dataset.swipe = 'none';
      ui.questionCard.style.removeProperty('--swipe-opacity');
      ui.questionCard.style.transition = 'none';
      ui.questionCard.style.opacity = '1';
      ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
      ui.questionCard.classList.remove('is-swiping', 'question-card-enter');

      if (!isInitial) {
        ui.questionCard.style.opacity = '0';
        ui.questionCard.style.transform = 'translate3d(0,28px,0) scale(.985)';
        requestAnimationFrame(() => {
          ui.questionCard.classList.add('question-card-enter');
          ui.questionCard.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease';
          ui.questionCard.style.opacity = '1';
          ui.questionCard.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
        });
      }
    }

    state.swipe.active = false;
    state.swipe.dragging = false;
    state.swipe.pointerId = null;
    state.swipe.isAnimating = false;
  },

  resetQuestionCard() {
    const card = ui.questionCard;
    if (!card) return;
    card.dataset.swipe = 'none';
    card.style.removeProperty('--swipe-opacity');
    card.style.transition = '';
    card.style.opacity = '1';
    card.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
    card.classList.remove('is-swiping', 'question-card-enter');
  },

  completion() {
    if (ui.completionCategory) ui.completionCategory.textContent = state.currentCategory?.id || 'категорию';
    router.show('completion');
  },

  syncSettingsUI() {},
};

Object.assign(app, { render });

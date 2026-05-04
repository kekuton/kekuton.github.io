import { app } from './core.js';

const { state, ui, helpers, router, CATEGORY_META, ROUND_SIZE } = app;

function makeEmpty(message) {
  const node = document.createElement('div');
  node.className = 'empty-state';
  node.textContent = message;
  return node;
}

export const render = {
  errorScreen(message) {
    if (ui.errorText) ui.errorText.textContent = message;
    router.show('error', { reset: true });
  },

  categories() {
    if (!ui.categoriesGrid || !ui.categoryCardTemplate) return;
    const playable = CATEGORY_META.filter((category) => (!category.hidden || state.easterUnlocked) && helpers.getCurrentCategoryQuestions(category.id).length);
    const fragment = document.createDocumentFragment();

    playable.forEach((category, index) => {
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

      const title = card.querySelector('[data-role="title"]');
      if (title) title.textContent = category.id;

      const desc = card.querySelector('[data-role="desc"]');
      if (desc) desc.textContent = category.desc;

      const counter = card.querySelector('[data-role="counter"]');
      if (counter) counter.textContent = `${index + 1} / ${playable.length}`;

      fragment.appendChild(card);
    });

    if (!fragment.childNodes.length) ui.categoriesGrid.replaceChildren(makeEmpty('Категории пока не найдены.'));
    else ui.categoriesGrid.replaceChildren(fragment);
    ui.categoriesGrid.querySelector('.category-card')?.classList.add('is-feed-active');
  },

  updateModeUI() {
    if (ui.gameCategory && state.currentCategory) ui.gameCategory.textContent = state.currentCategory.id;
  },

  gameQuestion(isInitial = false) {
    const question = state.currentQuestions[state.currentIndex] || '';
    const total = state.currentQuestions.length || ROUND_SIZE;
    if (ui.gameCategory && state.currentCategory) ui.gameCategory.textContent = state.currentCategory.id;
    if (ui.gameTitle) ui.gameTitle.textContent = 'Вопрос';
    if (ui.progressLabel) ui.progressLabel.textContent = `${state.currentIndex + 1} / ${total}`;
    if (ui.questionText) ui.questionText.textContent = question;

    const card = ui.questionCard;
    if (card) {
      card.dataset.swipe = 'none';
      card.style.removeProperty('--swipe-opacity');
      card.style.setProperty('opacity', '1', 'important');
      card.style.setProperty('transform', 'translate3d(0,0,0) rotate(0deg) scale(1)', 'important');
      card.classList.remove('is-swiping', 'question-card-enter');
      if (!isInitial) {
        card.classList.add('question-card-enter');
      }
    }

    state.swipe.active = false;
    state.swipe.pointerId = null;
    state.swipe.isAnimating = false;
  },

  resetQuestionCard() {
    const card = ui.questionCard;
    if (!card) return;
    card.dataset.swipe = 'none';
    card.style.removeProperty('--swipe-opacity');
    card.style.removeProperty('transition');
    card.style.setProperty('opacity', '1', 'important');
    card.style.setProperty('transform', 'translate3d(0,0,0) rotate(0deg) scale(1)', 'important');
    card.classList.remove('is-swiping', 'question-card-enter');
  },

  completion() {
    const total = state.currentQuestions.length || ROUND_SIZE;
    const categoryId = state.currentCategory?.id || 'категорию';
    const finalPhrases = {
      'После ссоры': 'Спасибо, что выбрали разговор вместо молчания.',
      'Перед сном': 'Пусть вечер закончится теплее.',
      '18+': 'Иногда честность начинается с желания.',
      'Будущее': 'Планы становятся ближе, когда о них говорят.',
      'Вечер для двоих': 'Хороший вечер — это когда вы услышали друг друга.',
      'На расстоянии': 'Даже далеко можно оставаться ближе.',
      'Финансы': 'Спокойные разговоры о деньгах делают планы честнее.',
      'Психология': 'Понимание начинается там, где есть внимание.',
      'Воспоминания': 'Тёплые моменты становятся сильнее, когда о них вспоминают вместе.',
      'Только для своих': 'Некоторые разговоры существуют только между вами.',
    };

    if (ui.completionCategory) ui.completionCategory.textContent = categoryId;
    if (ui.completionSummary) ui.completionSummary.textContent = `Вы прошли ${total} ${helpers.plural(total, 'вопрос', 'вопроса', 'вопросов')}.`;
    if (ui.completionPhrase) ui.completionPhrase.textContent = finalPhrases[categoryId] || 'Спасибо, что прошли эту тему вместе.';
    router.show('completion');
  },
};

Object.assign(app, { render });

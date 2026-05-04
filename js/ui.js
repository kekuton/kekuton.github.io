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


      const title = card.querySelector('[data-role="title"]');
      if (title) title.textContent = category.id;

      const desc = card.querySelector('[data-role="desc"]');
      if (desc) desc.textContent = category.desc;

      const counter = card.querySelector('[data-role="counter"]');
      if (counter) counter.textContent = `${index + 1} / ${playable.length}`;

      const continueLabel = card.querySelector('[data-role="continue"]');
      const saved = app.storage.get(helpers.progressKey(category.id), null);
      if (continueLabel && saved?.questions?.length && Number.isInteger(saved.index) && saved.index > 0 && saved.index < saved.questions.length) {
        continueLabel.textContent = `Продолжить ${saved.index + 1} / ${saved.questions.length}`;
        continueLabel.classList.remove('hidden');
      }

      fragment.appendChild(card);
    });

    if (!fragment.childNodes.length) ui.categoriesGrid.replaceChildren(makeEmpty('Категории пока не найдены.'));
    else ui.categoriesGrid.replaceChildren(fragment);
    ui.categoriesGrid.querySelector('.category-card')?.classList.add('is-feed-active');
  },

  intro() {
    const categoryId = state.currentCategory?.id || 'Категория';
    if (ui.introCategory) ui.introCategory.textContent = categoryId;
    if (ui.introText) ui.introText.textContent = helpers.getIntroText(categoryId);
    router.show('intro');
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
      'После ссоры': [
        'Спасибо, что выбрали разговор вместо молчания.',
        'Иногда шаг навстречу важнее правоты.',
        'Мягкий разговор может вернуть тепло быстрее слов “забудь”.',
        'Вы уже сделали главное — не закрылись друг от друга.',
      ],
      'Перед сном': [
        'Пусть вечер закончится теплее.',
        'Хорошие слова перед сном остаются с нами до утра.',
        'Пусть ночь будет спокойнее после этого разговора.',
        'Иногда близость начинается с пары честных вопросов.',
      ],
      '18+': [
        'Иногда честность начинается с желания.',
        'Откровенность работает лучше, когда в ней есть доверие.',
        'Желание звучит смелее, когда рядом безопасно.',
        'Главное — слышать друг друга даже в самых откровенных темах.',
      ],
      'Будущее': [
        'Планы становятся ближе, когда о них говорят.',
        'Будущее легче строить, когда вы смотрите в одну сторону.',
        'Мечты становятся реальнее после спокойного разговора.',
        'Вы уже сделали маленький шаг к общим планам.',
      ],
      'Вечер для двоих': [
        'Хороший вечер — это когда вы услышали друг друга.',
        'Пусть этот разговор останется между вами тёплым воспоминанием.',
        'Иногда один вечер может сблизить сильнее недели.',
      ],
      'На расстоянии': [
        'Даже далеко можно оставаться ближе.',
        'Расстояние меньше, когда есть честный разговор.',
        'Близость держится не на километрах, а на внимании.',
      ],
      'Финансы': [
        'Спокойные разговоры о деньгах делают планы честнее.',
        'Деньги обсуждать проще, когда вы на одной стороне.',
        'Общие цели начинаются с честных вопросов.',
      ],
      'Психология': [
        'Понимание начинается там, где есть внимание.',
        'Чувства становятся яснее, когда их не прячут.',
        'Иногда самый важный ответ — просто быть услышанным.',
      ],
      'Воспоминания': [
        'Тёплые моменты становятся сильнее, когда о них вспоминают вместе.',
        'Ваши воспоминания — это тихий фундамент близости.',
        'Иногда прошлое напоминает, почему вы выбрали друг друга.',
      ],
      'Только для своих': [
        'Некоторые разговоры существуют только между вами.',
        'У каждой пары есть темы, которые понимают только двое.',
        'Пусть это останется вашей маленькой тайной.',
      ],
    };

    if (ui.completionCategory) ui.completionCategory.textContent = categoryId;
    if (ui.completionSummary) ui.completionSummary.textContent = `Вы прошли ${total} ${helpers.plural(total, 'вопрос', 'вопроса', 'вопросов')}.`;
    const phraseList = finalPhrases[categoryId] || ['Спасибо, что прошли эту тему вместе.'];
    if (ui.completionPhrase) ui.completionPhrase.textContent = phraseList[Math.floor(Math.random() * phraseList.length)];
    router.show('completion');
  },
};

Object.assign(app, { render });

import { app } from './core.js';
import { render } from './ui.js';

const { ui, state, data, router, storage, historyStore, fx, STORAGE_KEYS, notify } = app;

export const settings = {
  open() {
    render.syncSettingsUI();
    router.show('settings');
  },
  applyFromControls() {
    state.settings.vibration = !!ui.vibrationToggle?.checked;
    state.settings.animations = !!ui.animationsToggle?.checked;
    state.settings.roundSize = Number(ui.roundSizeSelect?.value || 8);
    data.saveSettings();
  },
  bind() {
    ui.vibrationToggle?.addEventListener('change', () => this.applyFromControls());
    ui.animationsToggle?.addEventListener('change', () => this.applyFromControls());
    ui.roundSizeSelect?.addEventListener('change', () => this.applyFromControls());
    ui.clearHistoryBtn?.addEventListener('click', () => {
      historyStore.clear();
      render.history();
      fx.vibrate('light');
      notify.success('История очищена.');
    });
    ui.resetCustomBtn?.addEventListener('click', () => {
      storage.remove(STORAGE_KEYS.customQuestions);
      delete state.questionsData['Своя игра'];
      render.categories();
      fx.vibrate('light');
      notify.success('Свои вопросы удалены.');
    });
    ui.resetFlagsBtn?.addEventListener('click', () => {
      storage.remove(STORAGE_KEYS.adult);
      storage.remove(STORAGE_KEYS.premium);
      render.categories();
      fx.vibrate('light');
      notify.success('18+ и premium сброшены.');
    });
  }
};

Object.assign(app, { settings });

import { app } from './core.js?v=20260416b';
import { render } from './ui.js';

const { ui, state, data, router, storage, historyStore, fx, audio, motionFx, STORAGE_KEYS, notify } = app;

export const settings = {
  open() {
    render.syncSettingsUI();
    router.show('settings');
  },
  applyFromControls() {
    state.settings.vibration = !!ui.vibrationToggle?.checked;
    state.settings.animations = !!ui.animationsToggle?.checked;
    state.settings.sound = !!ui.soundToggle?.checked;
    state.settings.motionFx = !!ui.motionToggle?.checked;
    state.settings.roundSize = Number(ui.roundSizeSelect?.value || 8);
    data.saveSettings();
    audio?.setEnabled?.(state.settings.sound);
    motionFx?.setEnabled?.(state.settings.motionFx);
  },
  bind() {
    const settingsControls = [
      ui.vibrationToggle,
      ui.animationsToggle,
      ui.soundToggle,
      ui.motionToggle,
      ui.roundSizeSelect
    ];
    settingsControls.forEach((control) => {
      control?.addEventListener('change', () => this.applyFromControls());
    });

    const afterReset = (message) => {
      render.categories();
      fx.vibrate('light');
      notify.success(message);
    };

    ui.clearHistoryBtn?.addEventListener('click', () => {
      historyStore.clear();
      render.history();
      fx.vibrate('light');
      notify.success('История очищена.');
    });
    ui.resetCustomBtn?.addEventListener('click', () => {
      storage.remove(STORAGE_KEYS.customQuestions);
      delete state.questionsData['Своя игра'];
      afterReset('Свои вопросы удалены.');
    });
    ui.resetFlagsBtn?.addEventListener('click', () => {
      storage.remove(STORAGE_KEYS.adult);
      storage.remove(STORAGE_KEYS.premium);
      afterReset('18+ и premium сброшены.');
    });
  }
};

Object.assign(app, { settings });

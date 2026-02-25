import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { STORAGE_KEYS, SESSION_AWAY_MS } from './app/core/constants/storage-keys';

// Al cargar: si la sesión expiró por estar fuera 10+ min, limpiar
const lastHidden = localStorage.getItem(STORAGE_KEYS.LAST_HIDDEN_AT);
const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
if (token && lastHidden) {
  const elapsed = Date.now() - parseInt(lastHidden, 10);
  if (elapsed >= SESSION_AWAY_MS) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_HIDDEN_AT);
  }
}

// Registrar cuándo el usuario deja la pestaña (para caducar sesión al volver tras 10 min)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
      localStorage.setItem(STORAGE_KEYS.LAST_HIDDEN_AT, String(Date.now()));
    }
  }
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

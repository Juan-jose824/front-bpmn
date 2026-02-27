/** Claves de localStorage para autenticación JWT */
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'usuario',
  /** Timestamp (ms) cuando el usuario dejó la pestaña (visibility hidden) */
  LAST_HIDDEN_AT: 'auth_last_hidden_at',
} as const;

// 8 horas * 60 minutos * 60 segundos * 1000 milisegundos
export const SESSION_AWAY_MS = 8 * 60 * 60 * 1000;
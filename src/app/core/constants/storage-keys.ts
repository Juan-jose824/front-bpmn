/** Claves de localStorage para autenticación JWT */
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'usuario',
  /** Timestamp (ms) cuando el usuario dejó la pestaña (visibility hidden) */
  LAST_HIDDEN_AT: 'auth_last_hidden_at',
} as const;

export const SESSION_AWAY_MS = 10 * 60 * 1000; // 10 minutos fuera → caduca sesión

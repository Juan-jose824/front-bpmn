import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './authservice';

/** Tiempo de inactividad en ms antes de cerrar sesión (10 min). */
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos de inactividad → cierra sesión

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private listeners: (() => void)[] = [];

  constructor(
    private auth: AuthService,
    private ngZone: NgZone
  ) {}

  start(): void {
    this.stop(); // idempotente: evita listeners duplicados si se llama varias veces
    this.resetTimer();
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    const handler = () => this.ngZone.run(() => this.resetTimer());
    events.forEach((ev) => {
      document.addEventListener(ev, handler);
      this.listeners.push(() => document.removeEventListener(ev, handler));
    });
  }

  stop(): void {
    if (this.timerId != null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.listeners.forEach((off) => off());
    this.listeners = [];
  }

  private resetTimer(): void {
    if (this.timerId != null) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.timerId = null;
      this.ngZone.run(() => {
        if (this.auth.isLoggedIn()) this.auth.logout();
      });
    }, IDLE_TIMEOUT_MS);
  }
}

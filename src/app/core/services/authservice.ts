import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../constants/storage-keys';

const HTTP_OPTIONS = { withCredentials: true };

/** Respuesta típica del backend al hacer login con JWT */
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: {
    id?: number | string;
    username?: string;
    user_name?: string;
    name?: string;
    email?: string;
    rol?: string;
    profile_image?: string | null;
    [key: string]: unknown;
  };
  /** Compatibilidad: si el backend devuelve datos de usuario en la raíz */
  name?: string;
  user_name?: string;
  email?: string;
  rol?: string;
  profile_image?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(data: { email: string; pass: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data, HTTP_OPTIONS);
  }

  /** Renueva el accessToken usando la cookie refreshToken. Devuelve el nuevo token o falla con error. */
  refreshToken(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {}, HTTP_OPTIONS)
      .pipe(
        tap((res) => {
          if (res?.accessToken) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, res.accessToken);
            const user = this.getCurrentUser();
            if (user) {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            }
          }
        }),
        tap((res) => {
          if (!res?.accessToken) throw new Error('No token in refresh response');
        })
      )
      .pipe(
        tap(),
        (o: Observable<{ accessToken: string }>) =>
          new Observable<string>((sub) => {
            o.subscribe({
              next: (r) => {
                if (r?.accessToken) sub.next(r.accessToken);
                sub.complete();
              },
              error: (e) => sub.error(e),
            });
          })
      );
  }

  /** Cierra sesión en el backend (borra cookie) y localmente. */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_HIDDEN_AT);
    this.router.navigate(['/login']);
    this.http.post(`${this.apiUrl}/logout`, {}, HTTP_OPTIONS).subscribe();
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, HTTP_OPTIONS);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, HTTP_OPTIONS);
  }

  deleteUser(username: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${username}`, HTTP_OPTIONS);
  }

  updateUser(username: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${username}`, data, HTTP_OPTIONS);
  }

  updateProfileImage(username: string, imageBase64: string) {
    return this.http.put(
      `${this.apiUrl}/users/profile-image/${username}`,
      { imageBase64 },
      HTTP_OPTIONS
    );
  }

  /** Guarda token y usuario tras login (respuesta JWT) */
  setAuth(token: string, user: Record<string, unknown>): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /** Actualiza el usuario guardado (ej. profile_image) */
  updateStoredUser(updates: Record<string, unknown>): void {
    const user = this.getCurrentUser();
    if (user) {
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getCurrentUser(): Record<string, unknown> | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

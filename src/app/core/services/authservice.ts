import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../constants/storage-keys';

const HTTP_OPTIONS = { withCredentials: true };

// 1. Interfaz extendida para evitar errores de "Property does not exist"
export interface LoginResponse {
  accessToken?: string;
  token?: string;         // Agregado por error TS2339
  user?: any;
  name?: string;          // Agregado por error TS7053
  user_name?: string;     // Agregado por error TS7053
  email?: string;         // Agregado por error TS7053
  rol?: string;           // Agregado por error TS7053
  profile_image?: string; // Agregado por error TS7053
  [key: string]: any;     // Permite indexación por strings res['key']
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data, HTTP_OPTIONS).pipe(
      tap(res => {
        if (res && (res.accessToken || res.token)) {
          const token = res.accessToken || res.token || '';
          this.setAuth(token, res.user || res);
        }
      })
    );
  }

  // --- MÉTODOS QUE FALTABAN Y CAUSABAN ERROR TS2339 ---

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, HTTP_OPTIONS);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data, HTTP_OPTIONS);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, HTTP_OPTIONS);
  }

  getUsers(): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any[]>(`${this.apiUrl}/users`, { ...HTTP_OPTIONS, headers });
  }

  // --- RESTO DE MÉTODOS DE APOYO ---

  getUserHistory(): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any[]>(`${this.apiUrl}/my-history`, { ...HTTP_OPTIONS, headers });
  }

  saveAnalysis(data: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.apiUrl}/save-analysis`, data, { ...HTTP_OPTIONS, headers });
  }

  deleteAnalysis(ids: number[]): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.apiUrl}/delete-analysis`, { ids }, { ...HTTP_OPTIONS, headers });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, HTTP_OPTIONS).pipe(
      tap(res => {
        if (res && res.accessToken) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.accessToken);
        }
      })
    );
  }

  setAuth(token: string, user: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  updateStoredUser(updates: Record<string, any>): void {
    const userString = localStorage.getItem(STORAGE_KEYS.USER);
    if (userString) {
      const user = JSON.parse(userString);
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }

  getToken(): string | null { return localStorage.getItem(STORAGE_KEYS.TOKEN); }
  
  getCurrentUser(): any {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  updateProfileImage(username: string, image: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.put(`${this.apiUrl}/users/${username}/profile-image`, { image }, { ...HTTP_OPTIONS, headers });
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, HTTP_OPTIONS).subscribe();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
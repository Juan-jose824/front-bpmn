import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; // 1. IMPORTANTE: Agregamos 'tap'
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../constants/storage-keys';

const HTTP_OPTIONS = { withCredentials: true };

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: any;
  name?: string;
  user_name?: string;
  email?: string;
  rol?: string;
  profile_image?: string;
  [key: string]: any; 
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data, HTTP_OPTIONS);
  }

  getUserHistory(): Observable<any[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/my-history`, { ...HTTP_OPTIONS, headers });
  }

  saveAnalysis(data: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/save-analysis`, data, { ...HTTP_OPTIONS, headers });
  }

  deleteAnalysis(ids: number[]): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/delete-analysis`, { ids }, { ...HTTP_OPTIONS, headers });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // CORREGIDO: Ahora guarda el token de 8 horas en el LocalStorage automáticamente
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, HTTP_OPTIONS).pipe(
      tap(res => {
        if (res && res.accessToken) {
          // Guardamos el nuevo token para que la siguiente petición sea exitosa
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.accessToken);
          console.log('Token de acceso renovado por 8 horas');
        }
      })
    );
  }

  setAuth(token: string, user: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  updateStoredUser(updates: Record<string, any>): void {
    const user = this.getCurrentUser();
    if (user) {
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
    return this.http.put(`${this.apiUrl}/users/${username}/profile-image`, { image }, HTTP_OPTIONS);
  }

  getUsers(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/users`, HTTP_OPTIONS); }
  register(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/register`, data, HTTP_OPTIONS); }
  updateUser(id: string, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/users/${id}`, data, HTTP_OPTIONS); }
  deleteUser(id: string): Observable<any> { return this.http.delete(`${this.apiUrl}/users/${id}`, HTTP_OPTIONS); }
  
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
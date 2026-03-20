import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../constants/storage-keys';

const HTTP_OPTIONS = { withCredentials: true };

// 1. Interfaz extendida para evitar errores de "Property does not exist"
export interface LoginResponse {
  accessToken?: string;
  token?: string;         
  user?: any;
  name?: string;          
  user_name?: string;     
  email?: string;         
  rol?: string;           
  profile_image?: string;
  [key: string]: any;     // Permite indexación por strings res['key']
}

// 2. Servicio de autenticación que maneja login, registro, gestión de usuarios y almacenamiento de tokens
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


// Función para registrar nuevos usuarios (solo para admin)
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, HTTP_OPTIONS);
  }

  // Función para actualizar los datos de un usuario existente (solo para admin)
  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data, HTTP_OPTIONS);
  }

  // Función para eliminar un usuario existente (solo para admin)
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, HTTP_OPTIONS);
  }

  // Función para obtener la lista de usuarios registrados (solo para admin)
  getUsers(): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any[]>(`${this.apiUrl}/users`, { ...HTTP_OPTIONS, headers });
  }

  // Función para obtener el historial de análisis del usuario actual
  getUserHistory(): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<any[]>(`${this.apiUrl}/my-history`, { ...HTTP_OPTIONS, headers });
  }

  // Función para guardar un nuevo análisis en el historial del usuario
  saveAnalysis(data: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.apiUrl}/save-analysis`, data, { ...HTTP_OPTIONS, headers });
  }

  // Función para eliminar análisis específicos del historial del usuario
  deleteAnalysis(ids: number[]): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.apiUrl}/delete-analysis`, { ids }, { ...HTTP_OPTIONS, headers });
  }

  // Función para cerrar sesión, limpiando el almacenamiento local y redirigiendo al login
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Función para refrescar el token de sesión antes de que expire
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, HTTP_OPTIONS).pipe(
      tap(res => {
        if (res && res.accessToken) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, res.accessToken);
        }
      })
    );
  }

  // Función para establecer el token y los datos del usuario en el almacenamiento local
  setAuth(token: string, user: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Función para actualizar los datos del usuario almacenados localmente sin afectar el token
  updateStoredUser(updates: Record<string, any>): void {
    const userString = localStorage.getItem(STORAGE_KEYS.USER);
    if (userString) {
      const user = JSON.parse(userString);
      const updated = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }

  // Función para obtener el token de sesión almacenado
  getToken(): string | null { return localStorage.getItem(STORAGE_KEYS.TOKEN); }
  
  // Función para obtener los datos del usuario almacenados
  getCurrentUser(): any {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  // Función para actualizar la imagen de perfil del usuario
  updateProfileImage(username: string, image: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.put(`${this.apiUrl}/users/${username}/profile-image`, { image }, { ...HTTP_OPTIONS, headers });
  }

  // Función para eliminar la imagen de perfil del usuario
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, HTTP_OPTIONS).subscribe();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
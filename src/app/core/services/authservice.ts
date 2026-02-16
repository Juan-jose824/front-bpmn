import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // NUEVO: Método para eliminar un usuario por su email
  deleteUser(username: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/users/${username}`);
}

  // NUEVO: Método para actualizar datos de un usuario
  updateUser(username: string, data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/users/${username}`, data);
}
}
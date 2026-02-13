import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importante para peticiones
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // La URL del servidor de Node.js
  private apiUrl = 'http://localhost:3000/api/login';

  constructor(private http: HttpClient) {}

  // Función que busca el componente Login
  login(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
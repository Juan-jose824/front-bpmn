import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  // Ruta relativa: El navegador la enviará al mismo dominio/puerto 80
  private apiUrl = '/api/ai/analyze'; 

  constructor(private http: HttpClient) {}

  analizarDocumento(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // No hace falta configurar withCredentials aquí, 
    // se hereda la configuración global de tu app.
    return this.http.post(this.apiUrl, formData);
  }
}
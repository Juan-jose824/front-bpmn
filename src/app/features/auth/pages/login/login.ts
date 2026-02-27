import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginResponse } from '../../../../core/services/authservice';
import { IdleService } from '../../../../core/services/idle.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  //variable para manejar el form del inicio de sesión
  loginForm: FormGroup;

  hide = true;

  togglePassword() {
    this.hide = !this.hide;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private idleService: IdleService,
    private router: Router
  ) {
    // se describen los campos y validadores
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  

  //Función para el manejo de inicio de sesión con JWT
  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: LoginResponse) => {
          const token = res.token ?? res.accessToken;

          // Accedemos de forma segura para que TypeScript no chille
          const raw = res.user ?? {
            name: res['name'],
            user_name: res['user_name'],
            username: (res as any).username,
            email: res['email'],
            rol: res['rol'],
            profile_image: res['profile_image'],
          };
          
          const user = {
            ...raw,
            user_name: raw.user_name ?? raw.username,
            name: raw.name ?? raw.user_name ?? raw.username,
            rol: raw.rol ?? res['rol'] ?? (raw as any).role ?? (res as any).role,
          };

          if (token) {
            this.authService.setAuth(token, user as Record<string, unknown>);
            this.idleService.start();
            this.router.navigate(['/analisis']);
          } else {
            alert('El servidor no devolvió un token de sesión.');
          }
        }, 
        error: (err: any) => {
          alert('Error al iniciar sesión: ' + (err.error?.error || 'Error desconocido'));
        }
      });
    }
  }
}
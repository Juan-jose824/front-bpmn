import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/authservice'; 
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

    //Se inyectan los servicios para manejar el formulario, autenticación y navegación
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // se describen los campos y validadores
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  

  //Función para el manejo de inicio de sesión
  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          localStorage.setItem('usuario', JSON.stringify(res));
          console.log('Bienvenido', res);
          this.router.navigate(['/analisis']);
        },
        error: (err: any) => {
          alert('Error al iniciar sesión: ' + (err.error?.error || 'Error desconocido'));
        }
      });
    }
  }
}
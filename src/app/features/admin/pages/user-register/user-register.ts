import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../../core/services/authservice'; 

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], 
  templateUrl: './user-register.html',
  styleUrl: './user-register.scss', 
})
export class UserRegister implements OnInit {
  registerForm: FormGroup;
  registeredUsers: any[] = [];
  isEditing = false;
  usernameOriginal = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {
    this.registerForm = this.initForm();
  }

  private initForm() {
    return this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['Usuario', Validators.required]
    });
  }

  ngOnInit(): void {
    const data = localStorage.getItem('usuario');
    const user = data ? JSON.parse(data) : null;

    if (!user || user.rol !== 'Admin') {
      this.router.navigate(['/analisis']);
    } else {
      this.cargarUsuarios(); 
    }
  }

  cargarUsuarios() {
    this.authService.getUsers().subscribe({
      next: (res) => {
        this.registeredUsers = [...res];
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }
  
  onRegister() {
    if (this.registerForm.invalid) return;
    
    if (this.isEditing) {
      const formValues = this.registerForm.getRawValue();
      const updateData = {
        new_username: formValues.username,
        role: formValues.role
      };
      
      this.authService.updateUser(this.usernameOriginal, updateData).subscribe({
        next: () => {
          alert('Actualizado');
          this.cancelarEdicion();
          this.cargarUsuarios();
        }
      });
    } else {
      // Lógica de registro...
    }
  }

  editarUsuario(user: any) {
    this.isEditing = true;
    this.usernameOriginal = user.user_name;
    
    this.registerForm.patchValue({
      username: user.user_name,
      email: user.email,
      role: user.rol
    });
    
    this.registerForm.get('email')?.disable();
    this.registerForm.get('password')?.clearValidators();
    this.registerForm.get('confirmPassword')?.clearValidators();
    this.registerForm.get('password')?.updateValueAndValidity();
    this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.usernameOriginal = '';
    this.registerForm.reset({ role: 'Usuario' });
    this.registerForm.get('email')?.enable();
    this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.registerForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.registerForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  eliminarUsuario(username: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?`)) {
      this.authService.deleteUser(username).subscribe({
        next: () => {
          alert('Usuario eliminado');
          this.cargarUsuarios();
        },
        error: (err) => alert('Error al eliminar')
      });
    }
  }

  goBack() {
    this.router.navigate(['/analisis']);
  }
}
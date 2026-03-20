import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/authservice'; 

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-register.html',
  styleUrls: ['./user-register.scss'],
})

// Componente para la gestión de usuarios (registro, edición, eliminación) accesible solo para admin
export class UserRegister implements OnInit {
  registerForm: FormGroup;
  registeredUsers: any[] = [];
  isEditing = false;
  usernameOriginal = '';

  // Inyección de dependencias para formularios, navegación, autenticación y detección de cambios
  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef 
  ) {
    this.registerForm = this.initForm();
  }

  // Inicialización del formulario con validadores
  private initForm() {
    return this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['Usuario', Validators.required]
    });
  }

  // Verificar que el usuario es admin al cargar la página, si no redirigir a análisis y si es admin cargar la lista de usuarios registrados
  ngOnInit(): void {
    const data = this.authService.getCurrentUser() as any;
    const user = data?.user || data;
    const rol = user?.rol || user?.role;

    if (!user || rol !== 'Admin') {
      this.router.navigate(['/analisis']);
    } else {
      this.cargarUsuarios(); 
    }
  }

  // Función para cargar la lista de usuarios registrados desde el backend
  cargarUsuarios() {
    this.authService.getUsers().subscribe({
      next: (res: any[]) => {
        this.registeredUsers = [...res];
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.error('Error al obtener usuarios:', err)
    });
  }
  
  // Función para manejar el registro de nuevos usuarios y la actualización de usuarios existentes
  onRegister() {
    const formValues = this.registerForm.getRawValue();

    if (formValues.password || formValues.confirmPassword) {
      if (formValues.password !== formValues.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
    }

    if (this.isEditing) {
      const updateData: any = {
        new_username: formValues.username,
        email: formValues.email,
        role: formValues.role
      };

      if (formValues.password && formValues.password.trim() !== '') {
        updateData.password = formValues.password;
      }
      
      // Cambiamos a usernameOriginal para que el backend lo encuentre
      this.authService.updateUser(this.usernameOriginal, updateData).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: (err: any) => alert('Error al actualizar') // Tipado :any corregido
      });
    } else {
      if (this.registerForm.invalid) {
        alert('Por favor rellene todos los campos correctamente');
        return;
      }

      const newUser = {
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        role: formValues.role
      };

      this.authService.register(newUser).subscribe({
        next: () => {
          alert('Usuario registrado con éxito');
          this.registerForm.reset({ role: 'Usuario'});
          this.cargarUsuarios();
        },
        error: (err: any) => alert('Error al registrar usuario') // Tipado :any corregido
      });
    }
  }

// Función para manejar la edición de un usuario existente, rellenando el formulario con los datos del usuario seleccionado
  editarUsuario(user: any) {
    this.isEditing = true;
    this.usernameOriginal = user.user_name || user.username;
    
    this.registerForm.get('password')?.clearValidators();
    this.registerForm.get('confirmPassword')?.clearValidators();
    
    this.registerForm.patchValue({
      username: user.user_name || user.username,
      email: user.email,
      role: user.rol || user.role,
      password: '', 
      confirmPassword: ''
    });
    
    this.registerForm.get('password')?.updateValueAndValidity();
    this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }
  
  // Función para cancelar la edición, limpiando el formulario y restableciendo el estado
  cancelarEdicion() {
    this.isEditing = false;
    this.usernameOriginal = '';
    this.registerForm.reset({ role: 'Usuario' });
    
    this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.registerForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.registerForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  // Corregido para evitar el 404 enviando el parámetro correcto
  eliminarUsuario(username: string) {
    if (!username) return;

    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?`)) {
      this.authService.deleteUser(username).subscribe({
        next: () => {
          alert('Usuario eliminado');
          this.cargarUsuarios();
        },
        error: (err: any) => { // Tipado :any corregido
          console.error(err);
          alert('No se pudo eliminar al usuario. Verifique la conexión con el servidor.');
        }
      });
    }
  }

  // Función para volver a la página de análisis
  goBack() {
    this.router.navigate(['/analisis']);
  }
}
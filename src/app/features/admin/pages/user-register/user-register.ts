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

  // Método para inicializar el formulario de registro
  private initForm() {
    return this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['Usuario', Validators.required]
    });
  }

  // Método para verificar si el usuario es admin al cargar la página
  ngOnInit(): void {
    const data = localStorage.getItem('usuario');
    const stored = data ? JSON.parse(data) : null;
    const user = stored?.user || stored;

    if (!user || user.rol !== 'Admin') {
      this.router.navigate(['/analisis']);
    } else {
      this.cargarUsuarios(); 
    }
  }

  // Método para cargar usuarios registrados
  cargarUsuarios() {
    this.authService.getUsers().subscribe({
      next: (res) => {
        this.registeredUsers = [...res];
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }
  
  // Método para registrar o actualizar usuario
  onRegister() {
    // Obtenemos los valores actuales
    const formValues = this.registerForm.getRawValue();

    // Si el admin escribió algo en password, validamos que coincidan antes de seguir
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

      // Solo incluimos la contraseña si el admin escribió una nueva
      if (formValues.password && formValues.password.trim() !== '') {
        updateData.password = formValues.password;
      }
      
      this.authService.updateUser(this.usernameOriginal, updateData).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: (err) => alert('Error al actualizar')
      });
    } else {
      // Lógica de registro (aquí sí es obligatorio todo)
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
        }
      });
    }
  }

  // Método para editar un usuario existente
  editarUsuario(user: any) {
    this.isEditing = true;
    this.usernameOriginal = user.user_name;
    
    // 1. Limpiamos validaciones de password para que el formulario sea VÁLIDO aunque estén vacíos
    this.registerForm.get('password')?.clearValidators();
    this.registerForm.get('confirmPassword')?.clearValidators();
    
    // 2. Cargamos los datos
    this.registerForm.patchValue({
      username: user.user_name,
      email: user.email,
      role: user.rol,
      password: '', 
      confirmPassword: ''
    });
    
    // 3. Actualizamos estado
    this.registerForm.get('password')?.updateValueAndValidity();
    this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }
  
  // Método para cancelar edicion
  cancelarEdicion() {
    this.isEditing = false;
    this.usernameOriginal = '';
    this.registerForm.reset({ role: 'Usuario' });
    
    // Al cancelar, volvemos a poner los validadores obligatorios para nuevos registros
    this.registerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.registerForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.registerForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  // Método para eliminar usuario
  eliminarUsuario(username: string) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?`)) {
      this.authService.deleteUser(username).subscribe({
        next: () => {
          alert('Usuario eliminado');
          this.cargarUsuarios();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/analisis']);
  }
}
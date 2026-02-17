import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterModule, Router } from "@angular/router";
import { CommonModule } from '@angular/common'
import { HostListener } from '@angular/core';
import { NgZone } from '@angular/core';
import { AuthService } from '../../core/services/authservice';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  userName: string = '';
  userRole: string = '';
  isMenuOpen = false;
  isProfileOpen = false;
  refreshKey = 0;
  isDarkMode = false;
  profileImage: string | null = null;
  showToast = false;

  // URL del servidor para cargar archivos
  private readonly serverUrl = 'http://localhost:3000/uploads/';

  // Inyectar servicios necesarios
  constructor(
    private router: Router,
    private zone: NgZone,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // Verificar autenticación y cargar preferencias al iniciar
  ngOnInit() {
    const data = localStorage.getItem('usuario');

    if (data) {
      const user = JSON.parse(data);
      this.userName = user.name || user.user_name;
      this.userRole = user.rol;
      
      this.setProfileImage(user.profile_image);

      const userThemeKey = `theme_${this.userName}`;
      const savedTheme = localStorage.getItem(userThemeKey);

      if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        this.isDarkMode = true;
      } else {
        document.body.classList.remove('dark-theme');
        this.isDarkMode = false;
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Método para construir la URL final
  private setProfileImage(imagePath: string | null) {
    if (!imagePath) {
      this.profileImage = null;
      return;
    }
    // Si ya es una URL completa o Base64, se deja. Si es nombre, se concatena el servidor.
    this.profileImage = imagePath.includes('://') || imagePath.startsWith('data:') 
      ? imagePath 
      : this.serverUrl + imagePath;
  }

  // Método para cambiar entre modo claro/oscuro
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const userThemeKey = `theme_${this.userName}`;

    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem(userThemeKey, 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem(userThemeKey, 'light');
    }
  }

  // Método para cerrar sesión
  logout() {
    document.body.classList.remove('dark-theme');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  // Método para abrir/cerrar el menú lateral
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Método para navegar a la página de registro de usuarios (solo si es admin)
  toggleRegister() {
    this.router.navigate(['/user-register']);
    this.isMenuOpen = false;
  }

  // Método para abrir/cerrar el perfil
  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  // Método para manejar la selección de imagen de perfil
  onImageSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes.');
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('La imagen no debe superar los 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imageBase64 = reader.result as string;

    this.authService.updateProfileImage(this.userName, imageBase64).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.setProfileImage(res.fileName); 
          this.refreshKey++;
          
          this.triggerNotification();

          const data = localStorage.getItem('usuario');
          if (data) {
            const user = JSON.parse(data);
            user.profile_image = res.fileName; 
            localStorage.setItem('usuario', JSON.stringify(user));
          }

          this.cdr.detectChanges(); 
        });
      },
      error: (err) => {
        console.error('Error al guardar en el servidor:', err);
        alert('Hubo un error al guardar la imagen en el servidor.');
      }
    });

    event.target.value = '';
  };
  reader.readAsDataURL(file);
}

  // Método para mostrar la notificación temporal
  triggerNotification() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 300);
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    this.isProfileOpen = false;
    this.isMenuOpen = false;
  }
}
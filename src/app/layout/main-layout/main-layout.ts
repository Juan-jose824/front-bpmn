import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterModule, Router } from "@angular/router";
import { CommonModule } from '@angular/common'
import { HostListener } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  //Variables para manejar el nombre de usuario, rol y estado del menpu
  userName: string = '';
  userRole: string = '';
  isMenuOpen = false;
  isProfileOpen = false;
  refreshKey = 0;
  isDarkMode = false;

  profileImage: string |null = null;

  // Inyectamos el router en el constructor
  constructor(private router: Router, private zone:NgZone) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    const saveTheme = localStorage.getItem('theme');

    if (data) {
      const user = JSON.parse(data);
      this.userName = user.name || user.user_name;
      this.userRole = user.rol;
      this.profileImage = user.profileImage || null;
    } else {
      this.router.navigate(['/login']);
    }

    if (saveTheme === 'dark') {
      document.body.classList.add('dark-theme');
      this.isDarkMode = true;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // navegar a la página de registro
  toggleRegister() {
    this.router.navigate(['/user-register']);
    this.isMenuOpen = false;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    //Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes.');
      return;
    }

    //Validar tamaño (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageBase64 = reader.result as string;

      this.profileImage = null;

      setTimeout(() => {
        this.profileImage = imageBase64;
        this.refreshKey++;
        //Guardar en localStorage
        const data = localStorage.getItem('usuario');
        if (data) {
          const user = JSON.parse(data);
          user.profileImage = imageBase64;
          localStorage.setItem('usuario',JSON.stringify(user));
        }
      });
      
      event.target.value = '';
    };

    reader.readAsDataURL(file);
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isProfileOpen) {
      this.isProfileOpen = false;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterModule, Router } from "@angular/router";
import { CommonModule } from '@angular/common'

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

  profileImage: string |null = null;

  // Inyectamos el router en el constructor
  constructor(private router: Router) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const user = JSON.parse(data);
      this.userName = user.name || user.user_name;
      this.userRole = user.rol;
      this.profileImage = user.profileImage || null;
    } else {
      this.router.navigate(['/login']);
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

    const reader = new FileReader();

    reader.onload = () => {
      this.profileImage = reader.result as string;

      //Guardar en localStorage
      const data = localStorage.getItem('usuario');
      if (data) {
        const user = JSON.parse(data);
        user.profileImage = this.profileImage;
        localStorage.setItem('usuario',JSON.stringify(user));
      }
    };

    reader.readAsDataURL(file);
  }
}
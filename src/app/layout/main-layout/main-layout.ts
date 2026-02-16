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

  // Inyectamos el router en el constructor
  constructor(private router: Router) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const user = JSON.parse(data);
      this.userName = user.name || user.user_name;
      this.userRole = user.rol;
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

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
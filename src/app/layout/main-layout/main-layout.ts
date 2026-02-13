import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [ RouterLink, CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  userName: string = '';
  isMenuOpen = false;

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const user = JSON.parse(data);
      this.userName = user.name;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}

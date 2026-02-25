import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/authservice';

@Component({
  selector: 'app-analisis-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analisis-main.html',
  styleUrl: './analisis-main.scss',
})
export class AnalysisMain implements OnInit {

  //Variables para manejar la sesión, menú, archivo a analizar y el historia
  userName: string = '';
  isMenuOpen: boolean = false;
  selectedFile: File | null = null;
  history: any[] =[];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  //Verificar autenticación al cargar la página
  ngOnInit() {
    const user = this.authService.getCurrentUser() as any | null;
    if (user) {
      this.userName = user.name || user.user_name || '';
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Abrir el menú lateral
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  //Seleccionar archivo PDF del dispositivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      console.log('Archivo cargado:', file.name);
    }
  }

  analizarDocuento() {
    console.log('Iniciando análisis de:', this.selectedFile?.name);
  }

  // Cerrar sesión
  logout() {
    this.authService.logout();
  }

}

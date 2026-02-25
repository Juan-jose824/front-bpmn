import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';



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

  //Verificar autenticación al cargar la página
  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const stored = JSON.parse(data);
      const user = stored.user || stored;
      this.userName = user.username || user.user_name || user.name;
    } else {
      window.location.href = '/login';
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
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

}

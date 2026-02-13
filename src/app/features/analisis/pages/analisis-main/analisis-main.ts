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
  userName: string = '';
  isMenuOpen: boolean = false;
  selectedFile: File | null = null;
  history: any[] =[];

  ngOnInit() {
    const data= localStorage.getItem('usuario');
    if (data) {
      const user= JSON.parse(data);
      this.userName = user.name;
    } else {
      window.location.href = '/login';
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

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

  logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

}

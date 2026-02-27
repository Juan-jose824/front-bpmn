import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/authservice';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  documents: any[] = [];

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.authService.getUserHistory().subscribe({
      next: (res) => {
        this.documents = res;
        this.cdr.detectChanges(); // Forzar dibujo de la lista de historial
      },
      error: (err) => console.error(err)
    });
  }

  descargarDesdeHistorial(xml: string, fileName: string) {
    if (!xml) return;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}.bpmn`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
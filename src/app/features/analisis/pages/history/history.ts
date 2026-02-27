import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para el checkbox [ngModel]
import { AuthService } from '../../../../core/services/authservice';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        // Mapeamos los documentos para añadir la propiedad 'selected' localmente
        this.documents = res.map(doc => ({ ...doc, selected: false }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar historial:', err)
    });
  }

  getSelectedCount(): number {
    return this.documents.filter(doc => doc.selected).length;
  }

  // history.ts
eliminarSeleccionados() {
    const seleccionados = this.documents.filter(doc => doc.selected);
    
    // CAMBIO CLAVE: Usa id_analysis (así viene de tu tabla ai_analysis)
    const idsAEliminar = seleccionados.map(doc => doc.id_analysis); 

    console.log('IDs que se enviarán al backend:', idsAEliminar); // Mira esto en la consola de Chrome

    if (idsAEliminar.length === 0) return;

    if (confirm(`¿Eliminar ${idsAEliminar.length} registros?`)) {
        this.authService.deleteAnalysis(idsAEliminar).subscribe({
            next: (res) => {
                console.log('Respuesta del servidor:', res);
                // Filtrar localmente para que desaparezcan de la vista
                this.documents = this.documents.filter(doc => !doc.selected);
                this.cdr.detectChanges();
            }
        });
    }
}

  descargarDesdeHistorial(xml: string, fileName: string) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '') + '.bpmn';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
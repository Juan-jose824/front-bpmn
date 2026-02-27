import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Agregado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/authservice';
import { AiService } from '../../../../core/services/ai.service';

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
  history: any[] = [];

  // Nuevas variables para el estado de la IA y el resultado
  isLoading: boolean = false;
  resultadoBpmn: string | null = null;

  constructor(
    private authService: AuthService,
    private aiService: AiService, // Inyección del servicio de IA
    private router: Router,
    private cdr: ChangeDetectorRef // Inyección para forzar la actualización de la vista
  ) {}

  //Verificar autenticación al cargar la página e inicializar historial
  ngOnInit() {
    const data = this.authService.getCurrentUser() as any | null;
    const user = data?.user || data;
    if (user) {
      this.userName = user.username || user.user_name || user.name || '';
      this.cargarHistorial(); // Cargar datos de la BD al entrar
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Cargar el historial desde la base de datos
  cargarHistorial() {
    this.authService.getUserHistory().subscribe({
      next: (res) => {
        this.history = res;
        this.cdr.detectChanges(); // Forzar refresco al cargar historial
      },
      error: (err) => console.error('Error al obtener historial:', err)
    });
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
      this.resultadoBpmn = null; // Resetear resultado al cambiar de archivo
      console.log('Archivo cargado:', file.name);
      this.cdr.detectChanges(); // Asegurar que el nombre del archivo se vea
    }
  }

  // Enviar el documento al servicio de IA y guardar el resultado en la BD
  analizarDocumento() {
    if (!this.selectedFile) return;

    console.log('Iniciando análisis de:', this.selectedFile?.name);
    this.isLoading = true;
    this.cdr.detectChanges(); // Mostrar spinner/estado de carga inmediatamente

    this.aiService.analizarDocumento(this.selectedFile).subscribe({
      next: (res) => {
        this.resultadoBpmn = res.bpmn; // Guardamos el XML generado
        
        // Guardar automáticamente en el historial de la BD
        const datosParaGuardar = {
          file_name: this.selectedFile?.name,
          markdown_content: res.data, // Coincide con el nuevo ai-service
          bpmn_xml: res.bpmn
        };

        this.authService.saveAnalysis(datosParaGuardar).subscribe({
          next: () => {
            this.isLoading = false;
            this.cargarHistorial(); // Refrescar la lista visual
            console.log('Análisis exitoso y guardado en historial');
            this.cdr.detectChanges(); // ¡CRUCIAL! Hace aparecer el botón de descarga
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error al guardar historial:', err);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en la IA:', err);
        alert('Hubo un error al procesar el PDF con la IA.');
        this.cdr.detectChanges();
      }
    });
  }

  // Crear un Blob con el XML y forzar la descarga del archivo .bpmn
  descargarDiagrama() {
    if (!this.resultadoBpmn) return;

    const blob = new Blob([this.resultadoBpmn], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Usamos el nombre del archivo original pero con extensión .bpmn
    a.download = `${this.selectedFile?.name.replace('.pdf', '')}.bpmn`;
    document.body.appendChild(a); // Agregar al DOM para que funcione en todos los navegadores
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a); // Limpiar
  }
  
  // Nueva función para descargar archivos previos del historial
  descargarDesdeHistorial(xml: string, fileName: string) {
    if (!xml) return;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '') + '.bpmn';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Cerrar sesión
  logout() {
    this.authService.logout();
  }

}
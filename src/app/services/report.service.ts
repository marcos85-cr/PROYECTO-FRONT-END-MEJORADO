import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// npm install jspdf
import { jsPDF } from 'jspdf'; 

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  // ... (Funciones de descarga de statement y receipt se mantienen iguales) ...

  downloadStatement(
    accountId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'csv'
  ): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/statement`,
      {
        accountId,
        startDate,
        endDate,
        format,
      },
      { responseType: 'blob' }
    );
  }

  downloadReceipt(transactionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipt/${transactionId}`, {
      responseType: 'blob',
    });
  }

  /**
   * Genera y descarga reporte en PDF usando jsPDF
   * @param reportData Datos del reporte.
   * @returns El objeto Blob del PDF generado.
   */
  generatePDFReport(reportData: any): Blob {
    // 1. Configuración del documento PDF (jsPDF)
    const doc = new jsPDF('p', 'mm', 'a4');
    const margenX = 15;
    let y = 15;
    const anchoPagina = doc.internal.pageSize.getWidth();

    // Título Principal
    doc.setFontSize(24);
    doc.setFont('Helvetica', 'bold');
    doc.text('REPORTE DE OPERACIONES', margenX, y);
    y += 10;

    // FECHAS DEL PERÍODO (CORREGIDO PARA USAR LAS NUEVAS PROPIEDADES)
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Período: ${reportData.periodoInicio} - ${reportData.periodoFin}`, margenX, y);
    y += 10;

    // Resumen de Operaciones
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('1. Resumen de Operaciones', margenX, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Transacciones Totales: ${reportData.totalTransactions.toLocaleString('es-ES')}`, margenX, y);
    y += 7;
    doc.text(`Volumen Total: ${reportData.totalVolume.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}`, margenX, y);
    y += 15;


    // Top Clientes
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('2. Top Clientes', margenX, y);
    y += 8;

    if (reportData.topClients && reportData.topClients.length > 0) {
        doc.setFontSize(10);
        
        // Encabezados de la tabla
        doc.setFont('Helvetica', 'bold');
        doc.text('Cliente', margenX, y);
        doc.text('Transacciones', anchoPagina - 65, y);
        doc.text('Volumen', anchoPagina - 20, y, { align: 'right' });
        doc.line(margenX, y + 1, anchoPagina - margenX, y + 1); // Línea separadora
        y += 5;
        
        doc.setFont('Helvetica', 'normal');
        reportData.topClients.forEach((client: any) => {
            doc.text(client.nombre, margenX, y);
            doc.text(client.transacciones.toString(), anchoPagina - 65, y);
            doc.text(client.volumen.toLocaleString('es-ES', { style: 'currency', currency: 'USD' }), anchoPagina - 20, y, { align: 'right' });
            y += 6;
        });
        y += 5;
    } else {
        doc.setFontSize(12);
        doc.text('Sin datos de top clientes para este periodo.', margenX, y);
        y += 10;
    }


    // Registro de Auditoría
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('3. Registro de Auditoría', margenX, y);
    y += 8;
    
    // Simulación de auditoría para el PDF
    const auditLogs = reportData.auditLogs || [];

    if (auditLogs.length > 0) {
        doc.setFontSize(10);
        auditLogs.forEach((log: any) => {
            if (y > 280) { // Si llega al final de la página, agrega una nueva
                doc.addPage();
                y = 15;
            }
            doc.setFont('Helvetica', 'bold');
            doc.text(`Acción: ${log.accion} (${log.usuario})`, margenX, y);
            doc.text(`Fecha: ${new Date(log.fecha).toLocaleString('es-ES')}`, anchoPagina - margenX, y, { align: 'right' });
            y += 5;

            doc.setFont('Helvetica', 'normal');
            // Usar doc.splitTextToSize para manejar líneas largas
            const descLines = doc.splitTextToSize(`Descripción: ${log.descripcion}`, anchoPagina - (2 * margenX));
            doc.text(descLines, margenX, y);
            y += (descLines.length * 5) + 2; // Ajustar posición Y por número de líneas
            doc.line(margenX, y, anchoPagina - margenX, y); // Separador
            y += 5;
        });
    } else {
        doc.setFontSize(12);
        doc.text('Sin registros de auditoría para este periodo.', margenX, y);
        y += 10;
    }

    // CORRECCIÓN CLAVE: Convertir ArrayBuffer a Blob
    // El método output('arraybuffer') devuelve un ArrayBuffer, pero necesitamos un Blob para descargarlo.
    const arrayBuffer = doc.output('arraybuffer');
    return new Blob([arrayBuffer], { type: 'application/pdf' });
  }

  // Se asume que la función generateExcelReport está definida o se definirá.
  // ... (generateExcelReport y demás funciones se mantienen sin cambios si ya funcionan) ...

  /**
   * Descarga un archivo a partir de un Blob.
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Simulación de función de Excel para evitar errores
  generateExcelReport(reportData: any): Blob {
    // Aquí puedes incluir tu lógica real de generación de Excel (CSV)
    const csvContent = "data:text/csv;charset=utf-8,ID,Accion\n1,Prueba\n";
    return new Blob([csvContent], { type: 'text/csv' });
  }
}
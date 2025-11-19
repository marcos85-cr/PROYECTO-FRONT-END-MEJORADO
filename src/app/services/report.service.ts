import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
    // 1. Obtener el ArrayBuffer del PDF generado por jsPDF
    const pdfArrayBuffer = this.generatePDFContent(reportData);
    
    // 2. Crear un Blob a partir del ArrayBuffer para la descarga
    return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  }

  /**
   * Genera y descarga reporte en Excel (CSV)
   */
  generateExcelReport(reportData: any): Blob {
    const csvContent = '\uFEFF' + this.generateCSVContent(reportData);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Genera contenido CSV
   */
  private generateCSVContent(reportData: any): string {
    let csv = 'REPORTE DE OPERACIONES BANCARIAS\n';
    csv += `Periodo: ${reportData.startDate} - ${reportData.endDate}\n\n`;

    // Resumen
    csv += 'RESUMEN\n';
    csv += `Total de Transacciones,${reportData.totalTransactions}\n`;
    csv += `Volumen Total,${reportData.totalVolume}\n\n`;

    // Top Clientes
    csv += 'TOP 10 CLIENTES POR VOLUMEN\n';
    csv += 'Posicion,Nombre,Transacciones,Volumen\n';
    reportData.topClients.forEach((client: any, index: number) => {
      csv += `${index + 1},"${client.nombre}",${client.transacciones},${client.volumen}\n`;
    });

    csv += '\n\nVOLUMEN POR DIA\n';
    csv += 'Fecha,Monto\n';
    reportData.dailyVolume.forEach((day: any) => {
      csv += `${new Date(day.fecha).toLocaleDateString('es-ES')},${day.monto}\n`;
    });

    csv += '\n\nREGISTRO DE AUDITORIA\n';
    csv += 'Accion,Usuario,Descripcion,Fecha\n';
    reportData.auditLogs?.forEach((log: any) => {
      csv += `${log.accion},"${log.usuario}","${log.descripcion}",${new Date(log.fecha).toLocaleString('es-ES')}\n`;
    });

    return csv;
  }

  /**
   * Genera el contenido PDF formateado usando jsPDF.
   * La función devuelve un ArrayBuffer, no un string.
   */
  private generatePDFContent(reportData: any): ArrayBuffer {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20; // Posición inicial Y
    const margenX = 15;
    const anchoPagina = 210; // Ancho A4 en mm

    // --- Función de utilería para verificar salto de página ---
    const checkPageBreak = (requiredSpace: number) => {
      // 280 mm es aproximadamente el límite de la página A4.
      if (y + requiredSpace > 280) {
        doc.addPage();
        y = 20; // Resetear Y para la nueva página
        doc.setFontSize(10);
        doc.text(`... Continuación del Reporte - Página ${doc.internal.pages.length - 1}`, anchoPagina - margenX, 10, { align: 'right' });
      }
    };
    // -----------------------------------------------------------

    // --- TÍTULO ---
    doc.setFontSize(22);
    doc.text('RF-G1 REPORTE DE OPERACIONES', anchoPagina / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Periodo: ${reportData.startDate} - ${reportData.endDate}`, margenX, y);
    doc.text(`Fecha de Generación: ${new Date().toLocaleString('es-ES')}`, anchoPagina - margenX, y, { align: 'right' });
    y += 5;
    doc.line(margenX, y, anchoPagina - margenX, y); // Línea separadora
    y += 10;

    // --- 1. TOTALES DE OPERACIONES ---
    doc.setFontSize(16);
    doc.text('1. TOTALES DE OPERACIONES', margenX, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Total de Transacciones: ${reportData.totalTransactions}`, margenX, y);
    doc.text(`Volumen Total: $${reportData.totalVolume.toLocaleString('es-ES')}`, 80, y);
    y += 10;
    
    // --- 2. TOP 10 CLIENTES POR VOLUMEN ---
    checkPageBreak(50); // Verificar espacio para el encabezado de la tabla

    doc.setFontSize(16);
    doc.text('2. TOP 10 CLIENTES POR VOLUMEN', margenX, y);
    y += 8;

    // Simulación de una tabla usando texto
    const colNames = ['#', 'NOMBRE', 'TRANSACCIONES', 'VOLUMEN'];
    const colWidths = [10, 80, 40, 50];
    let x = margenX;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    colNames.forEach((name, index) => {
        doc.text(name, x, y);
        x += colWidths[index];
    });
    doc.setFont('Helvetica', 'normal');
    y += 5;

    reportData.topClients.forEach((client: any, index: number) => {
        checkPageBreak(5); // Verificar si hay espacio para la fila
        x = margenX;
        
        doc.text(`${index + 1}`, x, y);
        x += colWidths[0];
        doc.text(client.nombre, x, y);
        x += colWidths[1];
        doc.text(`${client.transacciones}`, x, y, { align: 'right' });
        x += colWidths[2];
        doc.text(`$${client.volumen.toLocaleString('es-ES')}`, x, y, { align: 'right' });
        y += 5;
    });
    y += 5;

    // --- 3. VOLUMEN POR DÍA ---
    checkPageBreak(30);

    doc.setFontSize(16);
    doc.text('3. VOLUMEN POR DÍA', margenX, y);
    y += 8;

    reportData.dailyVolume.forEach((day: any) => {
        checkPageBreak(5);
        const fecha = new Date(day.fecha).toLocaleDateString('es-ES');
        doc.setFontSize(10);
        doc.text(`Fecha: ${fecha}`, margenX, y);
        doc.text(`Monto: $${day.monto.toLocaleString('es-ES')}`, 60, y);
        y += 5;
    });
    y += 5;


    // --- 4. REGISTRO DE AUDITORÍA ---
    checkPageBreak(30);

    doc.setFontSize(16);
    doc.text('4. REGISTRO DE AUDITORÍA', margenX, y);
    y += 8;

    if (reportData.auditLogs && reportData.auditLogs.length > 0) {
        reportData.auditLogs.forEach((log: any) => {
            checkPageBreak(25); // Espacio necesario para un log
            doc.setFontSize(10);
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

    // Exportar el PDF como ArrayBuffer
    return doc.output('arraybuffer');
  }


  // ... (La función escapePDFText ya no es necesaria y la eliminamos) ...
  // ... (La función convertTextToPDF ya no es necesaria y la eliminamos) ...


  /**
   * Descarga un archivo
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
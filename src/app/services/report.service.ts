import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

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
   * Genera y descarga reporte en PDF
   */
  generatePDFReport(reportData: any): Blob {
    const pdfContent = this.generatePDFContent(reportData);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Genera y descarga reporte en Excel (CSV)
   */
  generateExcelReport(reportData: any): Blob {
    const csvContent = this.generateCSVContent(reportData);
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
   * Genera contenido PDF formateado
   */
  private generatePDFContent(reportData: any): string {
    let pdfText = '';

    pdfText += '========================================\n';
    pdfText += '    RF-G1 REPORTES DE OPERACIONES\n';
    pdfText += '========================================\n\n';

    pdfText += `Periodo: ${reportData.startDate} - ${reportData.endDate}\n`;
    pdfText += `Fecha de Generacion: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}\n\n`;

    // Totales
    pdfText += '• TOTALES DE OPERACIONES POR PERIODO\n';
    pdfText += '----------------------------------------\n';
    pdfText += `  Total de Transacciones: ${reportData.totalTransactions}\n`;
    pdfText += `  Volumen Total: $${reportData.totalVolume.toLocaleString('es-ES')}\n\n`;

    // Top 10 Clientes
    pdfText += '• TOP 10 CLIENTES POR VOLUMEN\n';
    pdfText += '----------------------------------------\n';
    reportData.topClients.forEach((client: any, index: number) => {
      pdfText += `  ${index + 1}. ${client.nombre}\n`;
      pdfText += `     Transacciones: ${client.transacciones}\n`;
      pdfText += `     Volumen: $${client.volumen.toLocaleString('es-ES')}\n\n`;
    });

    // Volumen diario
    pdfText += '• VOLUMEN POR DIA\n';
    pdfText += '----------------------------------------\n';
    reportData.dailyVolume.forEach((day: any) => {
      const fecha = new Date(day.fecha).toLocaleDateString('es-ES');
      pdfText += `  ${fecha}: $${day.monto.toLocaleString('es-ES')}\n`;
    });
    pdfText += '\n';

    // Registro de Auditoria
    pdfText += '• REGISTRO DE AUDITORIA - MOVIMIENTOS\n';
    pdfText += '----------------------------------------\n';
    if (reportData.auditLogs && reportData.auditLogs.length > 0) {
      reportData.auditLogs.forEach((log: any) => {
        pdfText += `  Accion: ${log.accion}\n`;
        pdfText += `  Usuario: ${log.usuario}\n`;
        pdfText += `  Descripcion: ${log.descripcion}\n`;
        pdfText += `  Fecha: ${new Date(log.fecha).toLocaleString('es-ES')}\n`;
        pdfText += '  ---\n';
      });
    } else {
      pdfText += '  Sin registros de auditoria\n';
    }

    pdfText += '\n========================================\n';
    pdfText += 'Fin del Reporte\n';
    pdfText += '========================================\n';

    // Convertir a PDF básico (texto plano)
    return this.convertTextToPDF(pdfText);
  }

  /**
   * Convierte texto a PDF válido
   */
  private convertTextToPDF(text: string): string {
    // Crear un PDF básico con el texto
    const lines = text.split('\n');
    let yPosition = 750;
    let pdfContent = '';

    lines.forEach((line: string) => {
      if (yPosition < 50) {
        // Nueva página
        pdfContent += 'ET\nendstream\nendobj\n';
        yPosition = 750;
      }
      pdfContent += `(${this.escapePDFText(line)}) Tj\n0 -15 Td\n`;
      yPosition -= 15;
    });

    const stream = `BT\n/F1 10 Tf\n50 ${yPosition + 15} Td\n${pdfContent}ET\n`;

    let pdf = '%PDF-1.4\n';
    pdf += '1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n';
    pdf += '2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n';
    pdf += '3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>\nendobj\n';
    pdf += `4 0 obj\n<</Length ${stream.length}>>\nstream\n${stream}endstream\nendobj\n`;
    pdf += '5 0 obj\n<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>\nendobj\n';
    pdf += 'xref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\n0000000273 00000 n\n0000000455 00000 n\n';
    pdf += 'trailer\n<</Size 6/Root 1 0 R>>\n';
    pdf += 'startxref\n580\n%%EOF';

    return pdf;
  }

  /**
   * Escapa caracteres especiales para PDF
   */
  private escapePDFText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
  }

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
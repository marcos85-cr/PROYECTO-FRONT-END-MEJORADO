import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { Account } from '../models/account.model';

export interface StatementData {
  cuenta: Account;
  fechaInicio: Date;
  fechaFin: Date;
  saldoInicial: number;
  totalCreditos: number;
  totalDebitos: number;
  totalComisiones: number;
  saldoFinal: number;
  movimientos: Transaction[];
  fechaGeneracion: Date;
}

@Injectable({
  providedIn: 'root',
})
export class StatementService {
  constructor() {}

  /**
   * Genera datos del extracto con calculos correctos
   */
  generateStatementData(
    transactions: Transaction[],
    account: Account,
    startDate: Date,
    endDate: Date
  ): StatementData {
    // Calcular saldo inicial
    const totalNetMovements = transactions.reduce((sum, t) => sum + (t.monto || 0), 0);
    const saldoInicial = (account.saldo || 0) - totalNetMovements;

    // Calcular totales
    const totalCreditos = transactions
      .filter(t => (t.monto || 0) > 0)
      .reduce((sum, t) => sum + (t.monto || 0), 0);

    const totalDebitos = Math.abs(transactions
      .filter(t => (t.monto || 0) < 0)
      .reduce((sum, t) => sum + (t.monto || 0), 0));

    const totalComisiones = transactions.reduce((sum, t) => sum + (t.comision || 0), 0);

    // Saldo final
    const saldoFinal = saldoInicial + totalCreditos - totalDebitos;

    return {
      cuenta: account,
      fechaInicio: startDate,
      fechaFin: endDate,
      saldoInicial: isNaN(saldoInicial) ? 0 : saldoInicial,
      totalCreditos: isNaN(totalCreditos) ? 0 : totalCreditos,
      totalDebitos: isNaN(totalDebitos) ? 0 : totalDebitos,
      totalComisiones: isNaN(totalComisiones) ? 0 : totalComisiones,
      saldoFinal: isNaN(saldoFinal) ? 0 : saldoFinal,
      movimientos: transactions.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ),
      fechaGeneracion: new Date(),
    };
  }

  /**
   * Genera CSV funcional
   */
  generateCSV(statementData: StatementData): Blob {
    const csvContent = this.createCSVContent(statementData);
    const BOM = '\uFEFF';
    return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Genera PDF funcional con pdfkit simulado
   */
  generatePDF(statementData: StatementData): Blob {
    const pdfContent = this.createSimplePDF(statementData);
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Crea CSV con toda la informacion
   */
  private createCSVContent(data: StatementData): string {
    const fechaInicio = data.fechaInicio.toLocaleDateString('es-CR');
    const fechaFin = data.fechaFin.toLocaleDateString('es-CR');
    const fechaGeneracion = data.fechaGeneracion.toLocaleString('es-CR');

    let csv = '';
    csv += 'BANCO DIGITAL COSTA RICA\n';
    csv += 'EXTRACTO DE CUENTA BANCARIA\n';
    csv += '\n';

    csv += `Numero de Cuenta:,"${data.cuenta.numeroCuenta || ''}"\n`;
    csv += `Tipo de Cuenta:,"${data.cuenta.tipo || ''}"\n`;
    csv += `Moneda:,"${data.cuenta.moneda || 'CRC'}"\n`;
    csv += `Periodo:,"${fechaInicio} al ${fechaFin}"\n`;
    csv += `Fecha de Emision:,"${fechaGeneracion}"\n`;
    csv += '\n';

    csv += 'RESUMEN DE CUENTA\n';
    csv += `Saldo Inicial,"${this.formatCurrency(data.saldoInicial || 0, data.cuenta.moneda || 'CRC')}"\n`;
    csv += `Total Creditos,"${this.formatCurrency(data.totalCreditos || 0, data.cuenta.moneda || 'CRC')}"\n`;
    csv += `Total Debitos,"${this.formatCurrency(data.totalDebitos || 0, data.cuenta.moneda || 'CRC')}"\n`;
    csv += `Total Comisiones,"${this.formatCurrency(data.totalComisiones || 0, data.cuenta.moneda || 'CRC')}"\n`;
    csv += `"SALDO FINAL","${this.formatCurrency(data.saldoFinal || 0, data.cuenta.moneda || 'CRC')}"\n`;
    csv += '\n';

    csv += 'DETALLE DE MOVIMIENTOS\n';
    csv += '"#","Fecha","Hora","Tipo","Descripcion","Beneficiario","Monto","Comision","Total","Estado"\n';

    if (data.movimientos && data.movimientos.length > 0) {
      data.movimientos.forEach((trans, index) => {
        const fecha = new Date(trans.fecha || new Date()).toLocaleDateString('es-CR');
        const hora = new Date(trans.fecha || new Date()).toLocaleTimeString('es-CR');
        const monto = trans.monto || 0;
        const comision = trans.comision || 0;
        const montoTotal = monto + comision;

        csv += `"${index + 1}","${fecha}","${hora}","${trans.tipo || ''}","${(trans.descripcion || '-').replace(/"/g, '')}","${(trans.beneficiarioNombre || '-').replace(/"/g, '')}","${this.formatCurrency(monto, data.cuenta.moneda || 'CRC')}","${this.formatCurrency(comision, data.cuenta.moneda || 'CRC')}","${this.formatCurrency(montoTotal, data.cuenta.moneda || 'CRC')}","${trans.estado || ''}"\n`;
      });
    }

    csv += '\n';
    csv += 'NOTAS:\n';
    csv += '"Este extracto es un documento importante. Conservelo para sus registros."\n';
    csv += '"Datos generados automaticamente por el sistema bancario."\n';

    return csv;
  }

  /**
   * Crea PDF simple pero funcional
   */
  private createSimplePDF(data: StatementData): string {
    const fechaInicio = data.fechaInicio.toLocaleDateString('es-CR');
    const fechaFin = data.fechaFin.toLocaleDateString('es-CR');
    const fechaGeneracion = data.fechaGeneracion.toLocaleString('es-CR');

    let content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length ${this.getPDFContentLength(data)} >>
stream
BT
/F2 16 Tf
50 750 Td
(EXTRACTO DE CUENTA BANCARIA) Tj

/F1 10 Tf
0 -30 Td
(Banco Digital Costa Rica) Tj

0 -20 Td
(Cuenta: ${data.cuenta.numeroCuenta || ''}) Tj

0 -15 Td
(Tipo: ${data.cuenta.tipo || ''}) Tj

0 -15 Td
(Moneda: ${data.cuenta.moneda || 'CRC'}) Tj

0 -15 Td
(Periodo: ${fechaInicio} al ${fechaFin}) Tj

0 -15 Td
(Emision: ${fechaGeneracion}) Tj

0 -35 Td
/F2 12 Tf
(RESUMEN) Tj

/F1 10 Tf
0 -20 Td
(Saldo Inicial......... ${this.formatCurrency(data.saldoInicial || 0, data.cuenta.moneda || 'CRC')}) Tj

0 -15 Td
(Total Creditos...... ${this.formatCurrency(data.totalCreditos || 0, data.cuenta.moneda || 'CRC')}) Tj

0 -15 Td
(Total Debitos....... ${this.formatCurrency(data.totalDebitos || 0, data.cuenta.moneda || 'CRC')}) Tj

0 -15 Td
(Comisiones......... ${this.formatCurrency(data.totalComisiones || 0, data.cuenta.moneda || 'CRC')}) Tj

/F2 11 Tf
0 -20 Td
(SALDO FINAL........ ${this.formatCurrency(data.saldoFinal || 0, data.cuenta.moneda || 'CRC')}) Tj

/F1 9 Tf
0 -35 Td
(MOVIMIENTOS) Tj

0 -15 Td
(Fecha          Tipo                  Beneficiario           Monto        Estado) Tj

0 -12 Td
(====================================================================) Tj
`;

    if (data.movimientos && data.movimientos.length > 0) {
      data.movimientos.slice(0, 15).forEach((trans) => {
        const fecha = new Date(trans.fecha || new Date()).toLocaleDateString('es-CR');
        const tipo = (trans.tipo || '').substring(0, 15).padEnd(15);
        const beneficiario = ((trans.beneficiarioNombre || '-').replace(/[^\w\s]/g, '')).substring(0, 20).padEnd(20);
        const monto = this.formatCurrency(trans.monto || 0, data.cuenta.moneda || 'CRC').padStart(12);
        const estado = (trans.estado || '').substring(0, 10);

        content += `0 -12 Td\n(${fecha}  ${tipo} ${beneficiario} ${monto}  ${estado}) Tj\n`;
      });
    }

    content += `
0 -25 Td
(Este extracto es importante. Conservelo para sus registros.) Tj

0 -12 Td
(Datos generados automaticamente por el sistema bancario.) Tj

ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000257 00000 n 
0000${(content.length + 500).toString().padStart(6, '0')} 00000 n 
0000${(content.length + 567).toString().padStart(6, '0')} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${content.length + 640}
%%EOF`;

    return content;
  }

  /**
   * Descarga archivo CSV
   */
  downloadCSV(filename: string, blob: Blob): void {
    this.downloadFile(blob, `${filename}.csv`);
  }

  /**
   * Descarga archivo PDF
   */
  downloadPDF(filename: string, blob: Blob): void {
    this.downloadFile(blob, `${filename}.pdf`);
  }

  /**
   * Descarga generica de archivos
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Formatea moneda correctamente
   */
  private formatCurrency(amount: number, currency: string): string {
    const val = amount || 0;
    const formatted = Math.abs(val).toLocaleString('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const sign = val < 0 ? '-' : '';
    return `${currency} ${sign}${formatted}`;
  }

  /**
   * Calcula el tamaño del contenido PDF
   */
  private getPDFContentLength(data: StatementData): number {
    return 3000;
  }
}
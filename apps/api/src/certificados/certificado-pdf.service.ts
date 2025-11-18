import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CertificadoPdfService {
  /**
   * Genera un PDF de certificado de participación simple y elegante con logo FTE
   */
  async generarCertificadoPDF(data: {
    nombreParticipante: string;
    temaTaller: string;
    modalidad: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    horasTotales: number;
    codigoVerificacion: string;
    sede?: string | null;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // A4 Landscape: 842 x 595 puntos (ancho x alto)
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 50,
        });

        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        const pageWidth = 842;
        const pageHeight = 595;
        const margin = 50;
        const centerX = pageWidth / 2;
        const contentWidth = pageWidth - margin * 2;

        // ========== BORDES DECORATIVOS ==========
        // Borde exterior dorado elegante
        doc.rect(margin - 10, margin - 10, contentWidth + 20, pageHeight - 2 * margin + 20)
          .lineWidth(3)
          .stroke('#d4af37');

        // Borde interior sutil
        doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin)
          .lineWidth(1)
          .stroke('#e0e0e0');

        // ========== LOGO FTE ==========
        const logoPath = path.join(process.cwd(), 'Logo_FTE_Colores.png');
        const logoY = margin + 20;
        let logoHeight = 0;

        if (fs.existsSync(logoPath)) {
          try {
            const logoBuffer = fs.readFileSync(logoPath);
            const logoWidth = 100;
            logoHeight = 70;
            const logoX = centerX - logoWidth / 2;

            doc.image(logoBuffer, logoX, logoY, {
              width: logoWidth,
              height: logoHeight,
            });
          } catch (error) {
            console.warn('No se pudo cargar el logo:', error);
            logoHeight = 30; // Espacio reservado si falla
          }
        } else {
          logoHeight = 30;
        }

        // ========== NOMBRE DE LA INSTITUCIÓN ==========
        const institucionY = logoY + logoHeight + 15;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333');
        doc.text('FUNDACION TRABAJO EMPRESA', 0, institucionY, {
          align: 'center',
          width: pageWidth,
        });

        // Línea decorativa debajo de la institución
        const lineY = institucionY + 20;
        doc.moveTo(centerX - 150, lineY)
          .lineTo(centerX + 150, lineY)
          .lineWidth(1)
          .stroke('#d4af37');

        // ========== TÍTULO DEL CERTIFICADO ==========
        const titleY = lineY + 25;
        doc.fontSize(32).font('Helvetica-Bold').fillColor('#1a1a1a');
        doc.text('CERTIFICADO', 0, titleY, {
          align: 'center',
          width: pageWidth,
        });

        doc.fontSize(18).font('Helvetica').fillColor('#555555');
        doc.text('de Participacion', 0, titleY + 38, {
          align: 'center',
          width: pageWidth,
        });

        // ========== CONTENIDO ==========
        const contentY = titleY + 75;

        // "Se certifica que"
        doc.fontSize(12).font('Helvetica').fillColor('#666666');
        doc.text('Se certifica que', 0, contentY, {
          align: 'center',
          width: pageWidth,
        });

        // Nombre del participante
        const nombreY = contentY + 25;
        const nombreTruncado = this.truncateText(data.nombreParticipante, 50);
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000');
        doc.text(nombreTruncado.toUpperCase(), 0, nombreY, {
          align: 'center',
          width: pageWidth,
        });

        // Línea debajo del nombre
        const nombreLineY = nombreY + 30;
        doc.moveTo(centerX - 200, nombreLineY)
          .lineTo(centerX + 200, nombreLineY)
          .lineWidth(1)
          .stroke('#cccccc');

        // Texto descriptivo
        const textoY = nombreLineY + 20;
        doc.fontSize(11).font('Helvetica').fillColor('#666666');
        doc.text('ha participado exitosamente en el taller', 0, textoY, {
          align: 'center',
          width: pageWidth,
        });

        // Nombre del taller
        const tallerY = textoY + 20;
        const temaTruncado = this.truncateText(data.temaTaller, 60);
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a1a1a');
        doc.text(`"${temaTruncado}"`, 0, tallerY, {
          align: 'center',
          width: pageWidth,
        });

        // ========== DETALLES ==========
        const detallesY = tallerY + 35;
        doc.fontSize(10).font('Helvetica').fillColor('#666666');
        
        let detallesTexto = '';
        if (data.fechaInicio && data.fechaFin) {
          const fechaInicioStr = this.formatDateShort(data.fechaInicio);
          const fechaFinStr = this.formatDateShort(data.fechaFin);
          detallesTexto += `Realizado del ${fechaInicioStr} al ${fechaFinStr}`;
        }
        if (data.modalidad) {
          if (detallesTexto) detallesTexto += '\n';
          detallesTexto += `Modalidad: ${data.modalidad}`;
        }
        if (data.sede) {
          if (detallesTexto) detallesTexto += ' | ';
          detallesTexto += `Sede: ${this.truncateText(data.sede, 30)}`;
        }
        if (data.horasTotales > 0) {
          if (detallesTexto) detallesTexto += ' | ';
          detallesTexto += `${data.horasTotales} horas`;
        }

        doc.text(detallesTexto, 0, detallesY, {
          align: 'center',
          width: pageWidth,
        });

        // ========== FIRMA ==========
        const firmaY = pageHeight - margin - 80;
        const firmaWidth = 250;
        const firmaX = centerX - firmaWidth / 2;

        // Línea de firma
        doc.moveTo(firmaX, firmaY)
          .lineTo(firmaX + firmaWidth, firmaY)
          .lineWidth(1)
          .stroke('#999999');

        // Nombre de quien firma
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333');
        doc.text('Fundacion Trabajo Empresa', 0, firmaY + 10, {
          align: 'center',
          width: pageWidth,
        });

        // Fecha de emisión
        const fechaEmision = this.formatDateShort(new Date());
        doc.fontSize(9).font('Helvetica').fillColor('#999999');
        doc.text(`Emitido el ${fechaEmision}`, 0, firmaY + 25, {
          align: 'center',
          width: pageWidth,
        });

        // ========== PIE DE PÁGINA ==========
        const footerY = pageHeight - margin - 25;
        doc.fontSize(7).font('Helvetica').fillColor('#999999');
        doc.text(
          `Codigo de verificacion: ${data.codigoVerificacion}`,
          0,
          footerY,
          {
            align: 'center',
            width: pageWidth,
          },
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Trunca texto si es muy largo
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Formatea una fecha en formato corto
   */
  private formatDateShort(date: Date): string {
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  }
}

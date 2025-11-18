"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificadoPdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let CertificadoPdfService = class CertificadoPdfService {
    async generarCertificadoPDF(data) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: 'A4',
                    layout: 'landscape',
                    margin: 50,
                });
                const buffers = [];
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
                doc.rect(margin - 10, margin - 10, contentWidth + 20, pageHeight - 2 * margin + 20)
                    .lineWidth(3)
                    .stroke('#d4af37');
                doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin)
                    .lineWidth(1)
                    .stroke('#e0e0e0');
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
                    }
                    catch (error) {
                        console.warn('No se pudo cargar el logo:', error);
                        logoHeight = 30;
                    }
                }
                else {
                    logoHeight = 30;
                }
                const institucionY = logoY + logoHeight + 15;
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333');
                doc.text('FUNDACION TRABAJO EMPRESA', 0, institucionY, {
                    align: 'center',
                    width: pageWidth,
                });
                const lineY = institucionY + 20;
                doc.moveTo(centerX - 150, lineY)
                    .lineTo(centerX + 150, lineY)
                    .lineWidth(1)
                    .stroke('#d4af37');
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
                const contentY = titleY + 75;
                doc.fontSize(12).font('Helvetica').fillColor('#666666');
                doc.text('Se certifica que', 0, contentY, {
                    align: 'center',
                    width: pageWidth,
                });
                const nombreY = contentY + 25;
                const nombreTruncado = this.truncateText(data.nombreParticipante, 50);
                doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000');
                doc.text(nombreTruncado.toUpperCase(), 0, nombreY, {
                    align: 'center',
                    width: pageWidth,
                });
                const nombreLineY = nombreY + 30;
                doc.moveTo(centerX - 200, nombreLineY)
                    .lineTo(centerX + 200, nombreLineY)
                    .lineWidth(1)
                    .stroke('#cccccc');
                const textoY = nombreLineY + 20;
                doc.fontSize(11).font('Helvetica').fillColor('#666666');
                doc.text('ha participado exitosamente en el taller', 0, textoY, {
                    align: 'center',
                    width: pageWidth,
                });
                const tallerY = textoY + 20;
                const temaTruncado = this.truncateText(data.temaTaller, 60);
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a1a1a');
                doc.text(`"${temaTruncado}"`, 0, tallerY, {
                    align: 'center',
                    width: pageWidth,
                });
                const detallesY = tallerY + 35;
                doc.fontSize(10).font('Helvetica').fillColor('#666666');
                let detallesTexto = '';
                if (data.fechaInicio && data.fechaFin) {
                    const fechaInicioStr = this.formatDateShort(data.fechaInicio);
                    const fechaFinStr = this.formatDateShort(data.fechaFin);
                    detallesTexto += `Realizado del ${fechaInicioStr} al ${fechaFinStr}`;
                }
                if (data.modalidad) {
                    if (detallesTexto)
                        detallesTexto += '\n';
                    detallesTexto += `Modalidad: ${data.modalidad}`;
                }
                if (data.sede) {
                    if (detallesTexto)
                        detallesTexto += ' | ';
                    detallesTexto += `Sede: ${this.truncateText(data.sede, 30)}`;
                }
                if (data.horasTotales > 0) {
                    if (detallesTexto)
                        detallesTexto += ' | ';
                    detallesTexto += `${data.horasTotales} horas`;
                }
                doc.text(detallesTexto, 0, detallesY, {
                    align: 'center',
                    width: pageWidth,
                });
                const firmaY = pageHeight - margin - 80;
                const firmaWidth = 250;
                const firmaX = centerX - firmaWidth / 2;
                doc.moveTo(firmaX, firmaY)
                    .lineTo(firmaX + firmaWidth, firmaY)
                    .lineWidth(1)
                    .stroke('#999999');
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333');
                doc.text('Fundacion Trabajo Empresa', 0, firmaY + 10, {
                    align: 'center',
                    width: pageWidth,
                });
                const fechaEmision = this.formatDateShort(new Date());
                doc.fontSize(9).font('Helvetica').fillColor('#999999');
                doc.text(`Emitido el ${fechaEmision}`, 0, firmaY + 25, {
                    align: 'center',
                    width: pageWidth,
                });
                const footerY = pageHeight - margin - 25;
                doc.fontSize(7).font('Helvetica').fillColor('#999999');
                doc.text(`Codigo de verificacion: ${data.codigoVerificacion}`, 0, footerY, {
                    align: 'center',
                    width: pageWidth,
                });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    truncateText(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    formatDateShort(date) {
        const dia = date.getDate();
        const mes = date.getMonth() + 1;
        const año = date.getFullYear();
        return `${dia}/${mes}/${año}`;
    }
};
exports.CertificadoPdfService = CertificadoPdfService;
exports.CertificadoPdfService = CertificadoPdfService = __decorate([
    (0, common_1.Injectable)()
], CertificadoPdfService);
//# sourceMappingURL=certificado-pdf.service.js.map
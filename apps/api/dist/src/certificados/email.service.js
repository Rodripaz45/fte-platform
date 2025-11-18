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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        if (!smtpHost || !smtpUser || !smtpPass) {
            this.logger.warn('⚠️  Configuración de SMTP no encontrada. El servicio de email no funcionará. ' +
                'Agrega SMTP_HOST, SMTP_USER, SMTP_PASS en tu archivo .env');
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: 'test',
                    pass: 'test',
                },
            });
        }
        else {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: this.configService.get('SMTP_PORT') || 587,
                secure: false,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
            this.logger.log('✅ Servicio de email configurado correctamente');
        }
    }
    async enviarCertificadoPorEmail(emailDestinatario, nombreParticipante, temaTaller, pdfBuffer, codigoVerificacion) {
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        if (!smtpHost || !smtpUser || !smtpPass) {
            this.logger.warn(`⚠️  No se puede enviar email a ${emailDestinatario}: Configuración SMTP faltante. ` +
                'El certificado se generó pero no se envió por email. ' +
                'Configura SMTP_HOST, SMTP_USER, SMTP_PASS en tu archivo .env');
            return;
        }
        try {
            const mailOptions = {
                from: this.configService.get('SMTP_FROM') || smtpUser,
                to: emailDestinatario,
                subject: `Certificado de Participación - ${temaTaller}`,
                html: this.getEmailTemplate(nombreParticipante, temaTaller, codigoVerificacion),
                attachments: [
                    {
                        filename: `Certificado_${temaTaller.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf',
                    },
                ],
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email enviado exitosamente a ${emailDestinatario}: ${info.messageId}`);
        }
        catch (error) {
            this.logger.error(`❌ Error enviando email a ${emailDestinatario}:`, error);
            this.logger.warn('El certificado se generó pero no se pudo enviar por email. El usuario puede descargarlo desde la aplicación.');
        }
    }
    getEmailTemplate(nombreParticipante, temaTaller, codigoVerificacion) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1e40af;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 30px;
            border: 1px solid #e5e7eb;
          }
          .footer {
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 5px 5px;
          }
          .code {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Certificado de Participación</h1>
        </div>
        <div class="content">
          <p>Estimado/a <strong>${nombreParticipante}</strong>,</p>
          
          <p>Nos complace informarte que has completado exitosamente el taller:</p>
          
          <h2 style="color: #1e40af; text-align: center;">"${temaTaller}"</h2>
          
          <p>Tu certificado de participación está adjunto a este correo en formato PDF.</p>
          
          <p>Este certificado es un reconocimiento a tu participación y compromiso con el programa de formación.</p>
          
          <div class="code">
            <strong>Código de verificación:</strong><br>
            ${codigoVerificacion}
          </div>
          
          <p>Puedes usar este código para verificar la autenticidad de tu certificado en nuestro sistema.</p>
          
          <p>¡Felicitaciones por tu logro!</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p>Sistema de Gestión de Talleres</p>
        </div>
      </body>
      </html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
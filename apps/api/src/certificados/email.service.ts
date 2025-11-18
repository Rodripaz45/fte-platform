import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configurar transporter de Nodemailer
    // Si no hay configuración de SMTP, crear un transporter "fake" para desarrollo
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn(
        '⚠️  Configuración de SMTP no encontrada. El servicio de email no funcionará. ' +
        'Agrega SMTP_HOST, SMTP_USER, SMTP_PASS en tu archivo .env',
      );
      // Crear un transporter de prueba (no enviará emails reales)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'test',
          pass: 'test',
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT') || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('✅ Servicio de email configurado correctamente');
    }
  }

  /**
   * Envía un email con el certificado adjunto
   */
  async enviarCertificadoPorEmail(
    emailDestinatario: string,
    nombreParticipante: string,
    temaTaller: string,
    pdfBuffer: Buffer,
    codigoVerificacion: string,
  ): Promise<void> {
    // Verificar si el servicio está configurado
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn(
        `⚠️  No se puede enviar email a ${emailDestinatario}: Configuración SMTP faltante. ` +
        'El certificado se generó pero no se envió por email. ' +
        'Configura SMTP_HOST, SMTP_USER, SMTP_PASS en tu archivo .env',
      );
      // No lanzar error, solo loguear la advertencia
      return;
    }

    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM') || smtpUser,
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
    } catch (error) {
      this.logger.error(`❌ Error enviando email a ${emailDestinatario}:`, error);
      // No lanzar error para que el certificado se guarde aunque falle el email
      this.logger.warn('El certificado se generó pero no se pudo enviar por email. El usuario puede descargarlo desde la aplicación.');
    }
  }

  /**
   * Plantilla HTML para el email del certificado
   */
  private getEmailTemplate(
    nombreParticipante: string,
    temaTaller: string,
    codigoVerificacion: string,
  ): string {
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
}



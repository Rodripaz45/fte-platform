import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    enviarCertificadoPorEmail(emailDestinatario: string, nombreParticipante: string, temaTaller: string, pdfBuffer: Buffer, codigoVerificacion: string): Promise<void>;
    private getEmailTemplate;
}

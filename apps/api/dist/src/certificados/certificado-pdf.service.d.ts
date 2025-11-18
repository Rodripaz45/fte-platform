export declare class CertificadoPdfService {
    generarCertificadoPDF(data: {
        nombreParticipante: string;
        temaTaller: string;
        modalidad: string;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        horasTotales: number;
        codigoVerificacion: string;
        sede?: string | null;
    }): Promise<Buffer>;
    private truncateText;
    private formatDateShort;
}

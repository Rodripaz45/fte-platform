import { PrismaService } from '../../prisma/prisma.service';
import { CertificadoPdfService } from './certificado-pdf.service';
import { EmailService } from './email.service';
export declare class CertificadosService {
    private readonly prisma;
    private readonly certificadoPdfService;
    private readonly emailService;
    private readonly logger;
    private readonly ASISTENCIA_MINIMA;
    constructor(prisma: PrismaService, certificadoPdfService: CertificadoPdfService, emailService: EmailService);
    verificarElegibilidad(tallerId: string, participanteId: string): Promise<{
        elegible: boolean;
        tasaAsistencia: number;
        totalSesiones: number;
        sesionesAsistidas: number;
    }>;
    private calcularHorasTotales;
    private generarCodigoVerificacion;
    emitirCertificado(tallerId: string, participanteId: string, emitidoPor?: string): Promise<any>;
    emitirCertificadosAutomaticos(tallerId: string): Promise<{
        total: number;
        emitidos: number;
        noElegibles: number;
        errores: number;
    }>;
    findByUsuarioId(usuarioId: string): Promise<({
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        codigo: string;
        urlPDF: string | null;
        emitidoEn: Date;
        emitidoPor: string | null;
        enviadoPorEmail: boolean;
        fechaEnvio: Date | null;
    })[]>;
    findByParticipante(participanteId: string): Promise<({
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        codigo: string;
        urlPDF: string | null;
        emitidoEn: Date;
        emitidoPor: string | null;
        enviadoPorEmail: boolean;
        fechaEnvio: Date | null;
    })[]>;
    findAll(): Promise<({
        participante: {
            usuario: {
                id: string;
                nombre: string;
                email: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        codigo: string;
        urlPDF: string | null;
        emitidoEn: Date;
        emitidoPor: string | null;
        enviadoPorEmail: boolean;
        fechaEnvio: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        participante: {
            usuario: {
                id: string;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            tipo: string | null;
            trainerId: string;
            unidadEducativaId: string | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        codigo: string;
        urlPDF: string | null;
        emitidoEn: Date;
        emitidoPor: string | null;
        enviadoPorEmail: boolean;
        fechaEnvio: Date | null;
    }>;
    verificarPorCodigo(codigo: string): Promise<{
        participante: {
            usuario: {
                id: string;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            estado: string | null;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        codigo: string;
        urlPDF: string | null;
        emitidoEn: Date;
        emitidoPor: string | null;
        enviadoPorEmail: boolean;
        fechaEnvio: Date | null;
    }>;
    reenviarPorEmail(certificadoId: string): Promise<void>;
    regenerarYReenviar(certificadoId: string, emitidoPor?: string): Promise<any>;
    private regenerarPDF;
}

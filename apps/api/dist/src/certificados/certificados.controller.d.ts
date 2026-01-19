import { CertificadosService } from './certificados.service';
import type { Request as ExpressRequest } from 'express';
export declare class CertificadosController {
    private readonly certificadosService;
    constructor(certificadosService: CertificadosService);
    getMisCertificados(req: ExpressRequest): Promise<({
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
    emitirCertificado(tallerId: string, participanteId: string, req: ExpressRequest): Promise<any>;
    emitirCertificadosMasivo(tallerId: string): Promise<{
        total: number;
        emitidos: number;
        noElegibles: number;
        errores: number;
    }>;
    getAllCertificados(): Promise<({
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
    getCertificado(id: string): Promise<{
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
            capacidades: string | null;
            trainerId: string;
            directorId: string | null;
            unidadEducativaId: string | null;
            estadoAprobacion: string | null;
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
    verificarCertificado(codigo: string): Promise<{
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
    reenviarEmail(id: string): Promise<{
        message: string;
    }>;
    regenerarCertificado(id: string, req: ExpressRequest): Promise<{
        message: string;
        certificado: any;
    }>;
}

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
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
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
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            estado: string | null;
            tipo: string | null;
            trainerId: string;
            unidadEducativaId: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
        };
        participante: {
            usuario: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
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
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            estado: string | null;
        };
        participante: {
            usuario: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
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

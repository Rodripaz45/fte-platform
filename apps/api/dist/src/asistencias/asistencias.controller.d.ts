import { AsistenciasService } from './asistencias.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { RegistrarAsistenciaQRDto } from './dto/registrar-asistencia-qr.dto';
import { TomarAsistenciaUEDto } from './dto/tomar-asistencia-ue.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import type { Request as ExpressRequest } from 'express';
export declare class AsistenciasController {
    private readonly asistenciasService;
    constructor(asistenciasService: AsistenciasService);
    tomar(dto: TomarAsistenciaDto): Promise<{
        sesionId: string;
        total: number;
        items: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string | null;
            sesionId: string;
            participanteId: string;
            tomadoEn: Date | null;
        }[];
    }>;
    create(dto: CreateAsistenciaDto): Promise<{
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
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
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        participanteId: string;
        tomadoEn: Date | null;
    }>;
    findAll(sesionId?: string): Promise<({
        sesion: {
            responsable: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
            } | null;
            taller: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
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
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            responsableId: string | null;
            salaId: string | null;
        };
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
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
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        participanteId: string;
        tomadoEn: Date | null;
    })[]>;
    resumen(sesionId: string): Promise<{
        sesionId: string;
        presentes: number;
        ausentes: number;
        tarde: number;
        total: number;
    }>;
    findOne(id: string): Promise<{
        sesion: {
            responsable: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
            } | null;
            taller: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
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
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            responsableId: string | null;
            salaId: string | null;
        };
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
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
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        participanteId: string;
        tomadoEn: Date | null;
    }>;
    update(id: string, dto: UpdateAsistenciaDto): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        participanteId: string;
        tomadoEn: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        participanteId: string;
        tomadoEn: Date | null;
    }>;
    registrarAsistenciaPorQR(dto: RegistrarAsistenciaQRDto, req: ExpressRequest): Promise<{
        sesion: {
            taller: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
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
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            responsableId: string | null;
            salaId: string | null;
        };
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
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
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        participanteId: string;
        tomadoEn: Date | null;
    }>;
    tomarAsistenciaUE(dto: TomarAsistenciaUEDto): Promise<{
        sesionId: string;
        total: number;
        items: ({
            listaParticipante: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                tallerId: string;
                nombre: string;
                email: string | null;
                estado: string | null;
                unidadEducativaId: string;
                documento: string | null;
                telefono: string | null;
                genero: string | null;
                fechaNac: Date | null;
                observaciones: string | null;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string | null;
            sesionId: string;
            tomadoEn: Date | null;
            listaParticipanteUEId: string;
            observaciones: string | null;
        })[];
    }>;
    findAsistenciasUE(sesionId: string): Promise<({
        listaParticipante: {
            unidadEducativa: {
                id: string;
                nombre: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            nombre: string;
            email: string | null;
            estado: string | null;
            unidadEducativaId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            observaciones: string | null;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        estado: string | null;
        sesionId: string;
        tomadoEn: Date | null;
        listaParticipanteUEId: string;
        observaciones: string | null;
    })[]>;
    resumenAsistenciasUE(sesionId: string): Promise<{
        sesionId: string;
        presentes: number;
        ausentes: number;
        justificados: number;
        total: number;
    }>;
    crearEvidencia(dto: CreateEvidenciaDto): Promise<{
        sesion: {
            taller: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
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
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            responsableId: string | null;
            salaId: string | null;
        };
    } & {
        id: string;
        creadoEn: Date;
        tipo: string | null;
        sesionId: string;
        url: string | null;
    }>;
    obtenerEvidencias(sesionId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string | null;
        sesionId: string;
        url: string | null;
    }[]>;
    eliminarEvidencia(id: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string | null;
        sesionId: string;
        url: string | null;
    }>;
}

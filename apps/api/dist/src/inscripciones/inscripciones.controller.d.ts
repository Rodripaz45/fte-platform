import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
import type { Request as ExpressRequest } from 'express';
export declare class InscripcionesController {
    private readonly inscripcionesService;
    constructor(inscripcionesService: InscripcionesService);
    create(dto: CreateInscripcioneDto): Promise<{
        participante: {
            id: string;
            actualizadoEn: Date;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            actualizadoEn: Date;
            estado: string | null;
            creadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        participanteId: string;
        actualizadoEn: Date;
        tallerId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
    }>;
    findMyInscripciones(req: ExpressRequest): Promise<({
        participante: {
            usuario: {
                id: string;
                actualizadoEn: Date;
                nombre: string;
                estado: string | null;
                creadoEn: Date;
                email: string;
                passwordHash: string;
            };
        } & {
            id: string;
            actualizadoEn: Date;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            actualizadoEn: Date;
            estado: string | null;
            creadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        participanteId: string;
        actualizadoEn: Date;
        tallerId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
    })[]>;
    findAll(): Promise<({
        participante: {
            usuario: {
                id: string;
                actualizadoEn: Date;
                nombre: string;
                estado: string | null;
                creadoEn: Date;
                email: string;
                passwordHash: string;
            };
        } & {
            id: string;
            actualizadoEn: Date;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            actualizadoEn: Date;
            estado: string | null;
            creadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        participanteId: string;
        actualizadoEn: Date;
        tallerId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
    })[]>;
    findOne(id: string): Promise<{
        participante: {
            usuario: {
                id: string;
                actualizadoEn: Date;
                nombre: string;
                estado: string | null;
                creadoEn: Date;
                email: string;
                passwordHash: string;
            };
        } & {
            id: string;
            actualizadoEn: Date;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            actualizadoEn: Date;
            estado: string | null;
            creadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        participanteId: string;
        actualizadoEn: Date;
        tallerId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
    }>;
    update(id: string, dto: UpdateInscripcioneDto): Promise<{
        participante: {
            id: string;
            actualizadoEn: Date;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        };
        taller: {
            id: string;
            actualizadoEn: Date;
            estado: string | null;
            creadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        participanteId: string;
        actualizadoEn: Date;
        tallerId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        participanteId: string;
        actualizadoEn: Date;
        tallerId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
    }>;
}

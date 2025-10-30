import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
export declare class InscripcionesController {
    private readonly inscripcionesService;
    constructor(inscripcionesService: InscripcionesService);
    create(dto: CreateInscripcioneDto): Promise<{
        participante: {
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
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    findAll(): Promise<({
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
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    })[]>;
    findOne(id: string): Promise<{
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
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    update(id: string, dto: UpdateInscripcioneDto): Promise<{
        participante: {
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
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        tallerId: string;
        participanteId: string;
        origen: string | null;
        estado: string | null;
        dedupeHash: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
}

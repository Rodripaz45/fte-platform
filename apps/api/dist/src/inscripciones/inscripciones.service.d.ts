import { PrismaService } from '../../prisma/prisma.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';
export declare class InscripcionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tallerId: string;
        origen: string | null;
        dedupeHash: string | null;
    }>;
    findAll(): Promise<({
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tallerId: string;
        origen: string | null;
        dedupeHash: string | null;
    })[]>;
    findOne(id: string): Promise<{
        participante: {
            usuario: {
                id: string;
                email: string;
                nombre: string;
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
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tallerId: string;
        origen: string | null;
        dedupeHash: string | null;
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
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tallerId: string;
        origen: string | null;
        dedupeHash: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        participanteId: string;
        tallerId: string;
        origen: string | null;
        dedupeHash: string | null;
    }>;
}

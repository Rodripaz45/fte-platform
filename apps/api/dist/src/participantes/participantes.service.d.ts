import { PrismaService } from '../../prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
export declare class ParticipantesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateParticipanteDto): Promise<{
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
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findOne(id: string): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
            passwordHash: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
        };
        inscripciones: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            participanteId: string;
            tallerId: string;
            origen: string | null;
            dedupeHash: string | null;
        }[];
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
    }>;
    update(id: string, dto: UpdateParticipanteDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
    }>;
}

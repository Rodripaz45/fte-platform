import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
export declare class ParticipantesController {
    private readonly participantesService;
    constructor(participantesService: ParticipantesService);
    create(dto: CreateParticipanteDto): Promise<{
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
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
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
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
    })[]>;
    findOne(id: string): Promise<{
        inscripciones: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string | null;
            tallerId: string;
            participanteId: string;
            origen: string | null;
            dedupeHash: string | null;
        }[];
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
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
    }>;
    update(id: string, dto: UpdateParticipanteDto): Promise<{
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
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        documento: string | null;
        telefono: string | null;
        genero: string | null;
        fechaNac: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        usuarioId: string;
    }>;
}

import { PrismaService } from '../../prisma/prisma.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
export declare class TalleresService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTallereDto): Promise<{
        id: string;
        tema: string;
        modalidad: string;
        cupos: number | null;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        sede: string | null;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        tema: string;
        modalidad: string;
        cupos: number | null;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        sede: string | null;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }[]>;
    findOne(id: string): Promise<{
        inscripciones: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            participanteId: string;
            origen: string | null;
            dedupeHash: string | null;
        }[];
        feedbacks: {
            id: string;
            creadoEn: Date;
            tallerId: string;
            participanteId: string;
            puntaje: number | null;
            comentario: string | null;
        }[];
    } & {
        id: string;
        tema: string;
        modalidad: string;
        cupos: number | null;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        sede: string | null;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    update(id: string, dto: UpdateTallereDto): Promise<{
        id: string;
        tema: string;
        modalidad: string;
        cupos: number | null;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        sede: string | null;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        tema: string;
        modalidad: string;
        cupos: number | null;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        sede: string | null;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
}

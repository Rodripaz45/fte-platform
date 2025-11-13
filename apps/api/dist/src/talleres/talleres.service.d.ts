import { PrismaService } from '../../prisma/prisma.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
export declare class TalleresService {
    private readonly prisma;
    private readonly notificacionesService;
    constructor(prisma: PrismaService, notificacionesService: NotificacionesService);
    create(dto: CreateTallereDto): Promise<{
        trainer: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
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
        trainerId: string;
    }>;
    findAll(): Promise<({
        cuposDisponibles: null;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
        trainer: {
            id: string;
            email: string;
            nombre: string;
        };
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
        trainerId: string;
    } | {
        cuposDisponibles: number;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
        trainer: {
            id: string;
            email: string;
            nombre: string;
        };
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
        trainerId: string;
    })[]>;
    findOne(id: string): Promise<{
        cuposDisponibles: null;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
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
        trainer: {
            id: string;
            email: string;
            nombre: string;
        };
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
        trainerId: string;
    } | {
        cuposDisponibles: number;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
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
        trainer: {
            id: string;
            email: string;
            nombre: string;
        };
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
        trainerId: string;
    }>;
    update(id: string, dto: UpdateTallereDto): Promise<{
        trainer: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
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
        trainerId: string;
    }>;
    remove(id: string): Promise<{
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
        trainerId: string;
    }>;
}

import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { VerificarDisponibilidadTrainerDto } from './dto/verificar-disponibilidad-trainer.dto';
export declare class DisponibilidadService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    verificarDisponibilidad(dto: VerificarDisponibilidadTrainerDto): Promise<{
        disponible: boolean;
        conflictosDisponibilidad: {
            id: string;
            fechaInicio: Date;
            fechaFin: Date;
            tipo: string;
            motivo: string | null;
        }[];
        conflictosSesiones: {
            id: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            taller: string;
        }[];
    }>;
    create(dto: CreateDisponibilidadDto): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        tipo: string;
        trainerId: string;
        motivo: string | null;
    }>;
    findAll(trainerId?: string, fechaInicio?: string, fechaFin?: string): Promise<({
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        tipo: string;
        trainerId: string;
        motivo: string | null;
    })[]>;
    findOne(id: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        tipo: string;
        trainerId: string;
        motivo: string | null;
    }>;
    update(id: string, dto: UpdateDisponibilidadDto): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        tipo: string;
        trainerId: string;
        motivo: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        tipo: string;
        trainerId: string;
        motivo: string | null;
    }>;
    obtenerCargaTrabajo(trainerId: string, fechaInicio?: string, fechaFin?: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
        periodo: {
            fechaInicio: string | null;
            fechaFin: string | null;
        };
        estadisticas: {
            totalSesiones: number;
            totalTalleres: number;
            diasNoDisponibles: number;
        };
    }>;
    sugerirTrainersDisponibles(fechaInicio: string, fechaFin: string): Promise<{
        fechaInicio: string;
        fechaFin: string;
        trainers: {
            trainer: {
                id: string;
                nombre: string;
                email: string;
            };
            disponible: boolean;
            cargaTrabajo?: {
                totalSesiones: number;
                totalTalleres: number;
                diasNoDisponibles: number;
            };
            conflictos?: {
                disponible: boolean;
                conflictosDisponibilidad: any[];
                conflictosSesiones: any[];
            };
        }[];
        disponibles: number;
        noDisponibles: number;
    }>;
}

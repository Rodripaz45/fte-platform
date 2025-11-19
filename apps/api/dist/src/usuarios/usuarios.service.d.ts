import { PrismaService } from '../../prisma/prisma.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
export declare class UsuariosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        roles: ({
            rol: {
                id: number;
                nombre: string;
            };
        } & {
            usuarioId: string;
            rolId: number;
        })[];
    } & {
        id: string;
        nombre: string;
        email: string;
        passwordHash: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    })[]>;
    findOne(id: string): Promise<{
        participante: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        } | null;
        roles: ({
            rol: {
                id: number;
                nombre: string;
            };
        } & {
            usuarioId: string;
            rolId: number;
        })[];
    } & {
        id: string;
        nombre: string;
        email: string;
        passwordHash: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    findAllTrainers(): Promise<{
        roles: {
            id: number;
            nombre: string;
        }[];
        id: string;
        nombre: string;
        email: string;
        passwordHash: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }[]>;
    createTrainer(dto: CreateTrainerDto): Promise<{
        participante: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        } | null;
        roles: ({
            rol: {
                id: number;
                nombre: string;
            };
        } & {
            usuarioId: string;
            rolId: number;
        })[];
    } & {
        id: string;
        nombre: string;
        email: string;
        passwordHash: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    updateTrainer(id: string, dto: UpdateTrainerDto): Promise<{
        participante: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
        } | null;
        roles: ({
            rol: {
                id: number;
                nombre: string;
            };
        } & {
            usuarioId: string;
            rolId: number;
        })[];
    } & {
        id: string;
        nombre: string;
        email: string;
        passwordHash: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    deleteTrainer(id: string): Promise<{
        message: string;
    }>;
}

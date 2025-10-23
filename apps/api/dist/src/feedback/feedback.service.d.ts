import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validarParticipanteInscrito;
    create(dto: CreateFeedbackDto): Promise<{
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
        creadoEn: Date;
        participanteId: string;
        tallerId: string;
        puntaje: number | null;
        comentario: string | null;
    }>;
    findAll(params?: {
        tallerId?: string;
        participanteId?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        page: number;
        pageSize: number;
        total: number;
        items: ({
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
            creadoEn: Date;
            participanteId: string;
            tallerId: string;
            puntaje: number | null;
            comentario: string | null;
        })[];
    }>;
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
        creadoEn: Date;
        participanteId: string;
        tallerId: string;
        puntaje: number | null;
        comentario: string | null;
    }>;
    update(id: string, dto: UpdateFeedbackDto): Promise<{
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
        creadoEn: Date;
        participanteId: string;
        tallerId: string;
        puntaje: number | null;
        comentario: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        creadoEn: Date;
        participanteId: string;
        tallerId: string;
        puntaje: number | null;
        comentario: string | null;
    }>;
    resumenPorTaller(tallerId: string): Promise<{
        tallerId: string;
        total: number;
        promedio: number;
        distribucion: {
            puntaje: number;
            total: number;
        }[];
    }>;
}

import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackDto): Promise<{
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
                nombre: string;
                email: string;
                passwordHash: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            actualizadoEn: Date;
        };
        taller: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            estado: string | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        puntaje: number | null;
        comentario: string | null;
        creadoEn: Date;
    }>;
    findAll(tallerId?: string, participanteId?: string, page?: string, pageSize?: string): Promise<{
        page: number;
        pageSize: number;
        total: number;
        items: ({
            participante: {
                usuario: {
                    id: string;
                    creadoEn: Date;
                    actualizadoEn: Date;
                    estado: string | null;
                    nombre: string;
                    email: string;
                    passwordHash: string;
                };
            } & {
                id: string;
                creadoEn: Date;
                usuarioId: string;
                documento: string | null;
                telefono: string | null;
                genero: string | null;
                fechaNac: Date | null;
                actualizadoEn: Date;
            };
            taller: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                tema: string;
                modalidad: string;
                cupos: number | null;
                fechaInicio: Date | null;
                fechaFin: Date | null;
                sede: string | null;
                estado: string | null;
            };
        } & {
            id: string;
            tallerId: string;
            participanteId: string;
            puntaje: number | null;
            comentario: string | null;
            creadoEn: Date;
        })[];
    }>;
    resumen(tallerId: string): Promise<{
        tallerId: string;
        total: number;
        promedio: number;
        distribucion: {
            puntaje: number;
            total: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
                nombre: string;
                email: string;
                passwordHash: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            actualizadoEn: Date;
        };
        taller: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            estado: string | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        puntaje: number | null;
        comentario: string | null;
        creadoEn: Date;
    }>;
    update(id: string, dto: UpdateFeedbackDto): Promise<{
        participante: {
            usuario: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
                nombre: string;
                email: string;
                passwordHash: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            usuarioId: string;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            actualizadoEn: Date;
        };
        taller: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
            estado: string | null;
        };
    } & {
        id: string;
        tallerId: string;
        participanteId: string;
        puntaje: number | null;
        comentario: string | null;
        creadoEn: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        tallerId: string;
        participanteId: string;
        puntaje: number | null;
        comentario: string | null;
        creadoEn: Date;
    }>;
}

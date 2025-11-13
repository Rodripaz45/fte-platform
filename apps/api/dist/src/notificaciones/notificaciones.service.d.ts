import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
export declare class NotificacionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificacionDto): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    findByUsuario(usuarioId: string, options?: {
        soloNoLeidas?: boolean;
        limit?: number;
    }): Promise<({
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    })[]>;
    findOne(id: string): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    update(id: string, dto: UpdateNotificacionDto): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    marcarComoLeida(id: string): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    marcarTodasComoLeidas(usuarioId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    countNoLeidas(usuarioId: string): Promise<number>;
    remove(id: string): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    crearRecordatorioSesion(usuarioId: string, sesionId: string, fechaSesion: Date, temaTaller: string): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    crearConfirmacionInscripcion(usuarioId: string, temaTaller: string, fechaInicio?: Date): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    crearNotificacionNuevoTaller(usuarioId: string, temaTaller: string): Promise<{
        usuario: {
            id: string;
            email: string;
            nombre: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        canal: string | null;
        tipo: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
}

import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import type { Request as ExpressRequest } from 'express';
export declare class NotificacionesController {
    private readonly notificacionesService;
    constructor(notificacionesService: NotificacionesService);
    getMisNotificaciones(req: ExpressRequest, soloNoLeidas?: string, limit?: string): Promise<({
        usuario: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        tipo: string | null;
        canal: string | null;
        titulo: string | null;
        mensaje: string | null;
    })[]>;
    countNoLeidas(req: ExpressRequest): Promise<{
        count: number;
    }>;
    marcarTodasComoLeidas(req: ExpressRequest): Promise<import("@prisma/client").Prisma.BatchPayload>;
    findOne(id: string): Promise<{
        usuario: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        tipo: string | null;
        canal: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    marcarComoLeida(id: string): Promise<{
        usuario: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        tipo: string | null;
        canal: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    update(id: string, dto: UpdateNotificacionDto): Promise<{
        usuario: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        tipo: string | null;
        canal: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        tipo: string | null;
        canal: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
    create(dto: CreateNotificacionDto): Promise<{
        usuario: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        estado: string | null;
        creadoEn: Date;
        usuarioId: string;
        tipo: string | null;
        canal: string | null;
        titulo: string | null;
        mensaje: string | null;
    }>;
}

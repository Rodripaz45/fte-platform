import { UsuariosService } from './usuarios.service';
import type { Request as ExpressRequest } from 'express';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    me(req: ExpressRequest): Promise<{
        id: string;
        email: string;
        nombre: string;
        roles: string[];
        participanteId: string | null;
    }>;
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
        email: string;
        nombre: string;
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
        email: string;
        nombre: string;
        passwordHash: string;
        estado: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
}

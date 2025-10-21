import { UsuariosService } from './usuarios.service';
import type { Request as ExpressRequest } from 'express';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    me(req: ExpressRequest): {
        id: string;
        email: string;
        roles: string[];
    };
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

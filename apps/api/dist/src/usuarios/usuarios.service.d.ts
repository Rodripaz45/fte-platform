import { PrismaService } from '../../prisma/prisma.service';
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

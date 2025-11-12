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
}

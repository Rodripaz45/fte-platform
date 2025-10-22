import { PrismaService } from '../../prisma/prisma.service';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
export declare class AsistenciasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validarSesionYRelacion;
    create(dto: CreateAsistenciaDto): Promise<{
        participante: {
            usuario: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
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
    } & {
        id: string;
        sesionId: string;
        participanteId: string;
        estado: string | null;
        tomadoEn: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    tomar(dto: TomarAsistenciaDto): Promise<{
        sesionId: string;
        total: number;
        items: {
            id: string;
            sesionId: string;
            participanteId: string;
            estado: string | null;
            tomadoEn: Date | null;
            creadoEn: Date;
            actualizadoEn: Date;
        }[];
    }>;
    findAll(params?: {
        sesionId?: string;
    }): Promise<({
        participante: {
            usuario: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
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
        sesion: {
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
            responsable: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
            } | null;
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
        };
    } & {
        id: string;
        sesionId: string;
        participanteId: string;
        estado: string | null;
        tomadoEn: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    })[]>;
    findOne(id: string): Promise<{
        participante: {
            usuario: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
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
        sesion: {
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
            responsable: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
            } | null;
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
        };
    } & {
        id: string;
        sesionId: string;
        participanteId: string;
        estado: string | null;
        tomadoEn: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    update(id: string, dto: UpdateAsistenciaDto): Promise<{
        id: string;
        sesionId: string;
        participanteId: string;
        estado: string | null;
        tomadoEn: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        sesionId: string;
        participanteId: string;
        estado: string | null;
        tomadoEn: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
    resumenPorSesion(sesionId: string): Promise<{
        sesionId: string;
        presentes: number;
        ausentes: number;
        tarde: number;
        total: number;
    }>;
}

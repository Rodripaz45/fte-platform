import { PrismaService } from '../../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
export declare class SesionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validarHoras;
    create(dto: CreateSesionDto): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
    }>;
    findAll(params?: {
        tallerId?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        page: number;
        pageSize: number;
        total: number;
        items: ({
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
                email: string;
                nombre: string;
                passwordHash: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
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
        })[];
    }>;
    findOne(id: string): Promise<{
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
        asistencias: ({
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
        } & {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            participanteId: string;
            sesionId: string;
            tomadoEn: Date | null;
        })[];
        responsable: {
            id: string;
            email: string;
            nombre: string;
            passwordHash: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
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
    }>;
    update(id: string, dto: UpdateSesionDto): Promise<{
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
            email: string;
            nombre: string;
            passwordHash: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
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
    }>;
    remove(id: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
    }>;
}

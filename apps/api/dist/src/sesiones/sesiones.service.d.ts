import { PrismaService } from '../../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
export declare class SesionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private validarHoras;
    create(dto: CreateSesionDto): Promise<{
        id: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
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
            responsable: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                nombre: string;
                email: string;
                passwordHash: string;
                estado: string | null;
            } | null;
            taller: {
                id: string;
                creadoEn: Date;
                actualizadoEn: Date;
                estado: string | null;
                tema: string;
                modalidad: string;
                cupos: number | null;
                fechaInicio: Date | null;
                fechaFin: Date | null;
                sede: string | null;
            };
        } & {
            id: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            responsableId: string | null;
        })[];
    }>;
    findOne(id: string): Promise<{
        asistencias: ({
            participante: {
                usuario: {
                    id: string;
                    creadoEn: Date;
                    actualizadoEn: Date;
                    nombre: string;
                    email: string;
                    passwordHash: string;
                    estado: string | null;
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
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string | null;
            sesionId: string;
            participanteId: string;
            tomadoEn: Date | null;
        })[];
        responsable: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            nombre: string;
            email: string;
            passwordHash: string;
            estado: string | null;
        } | null;
        taller: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string | null;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        responsableId: string | null;
    }>;
    update(id: string, dto: UpdateSesionDto): Promise<{
        responsable: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            nombre: string;
            email: string;
            passwordHash: string;
            estado: string | null;
        } | null;
        taller: {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            estado: string | null;
            tema: string;
            modalidad: string;
            cupos: number | null;
            fechaInicio: Date | null;
            fechaFin: Date | null;
            sede: string | null;
        };
    } & {
        id: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        responsableId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        responsableId: string | null;
    }>;
}

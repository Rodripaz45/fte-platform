import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { GenerarQRDto } from './dto/generar-qr.dto';
import { ValidarQRDto } from './dto/validar-qr.dto';
import type { Request as ExpressRequest } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SesionesController {
    private readonly sesionesService;
    private readonly prisma;
    constructor(sesionesService: SesionesService, prisma: PrismaService);
    create(dto: CreateSesionDto): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
    }>;
    findAll(tallerId?: string, page?: string, pageSize?: string): Promise<{
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
                tipo: string | null;
                trainerId: string;
                unidadEducativaId: string | null;
            };
            responsable: {
                id: string;
                nombre: string;
                email: string;
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
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
        })[];
    }>;
    getMisSesiones(req: ExpressRequest): Promise<({
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
            tipo: string | null;
            trainerId: string;
            unidadEducativaId: string | null;
        };
        responsable: {
            id: string;
            nombre: string;
            email: string;
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
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
    })[]>;
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
            tipo: string | null;
            trainerId: string;
            unidadEducativaId: string | null;
        };
        asistencias: ({
            participante: {
                usuario: {
                    id: string;
                    nombre: string;
                    email: string;
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
            tomadoEn: Date | null;
            sesionId: string;
        })[];
        responsable: {
            id: string;
            nombre: string;
            email: string;
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
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
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
            tipo: string | null;
            trainerId: string;
            unidadEducativaId: string | null;
        };
        responsable: {
            id: string;
            nombre: string;
            email: string;
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
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
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
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
    }>;
    generarQR(dto: GenerarQRDto): Promise<{
        sesionId: string;
        codigoQR: string;
        qrUrl: string;
        qrImage: string;
        expiracion: string;
        duracionMinutos: number;
    }>;
    validarQR(dto: ValidarQRDto): Promise<{
        sesionId: string;
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        valido: boolean;
    }>;
    getSesionByQR(codigoQR: string): Promise<{
        sesionId: string;
        taller: {
            id: string;
            tema: string;
            modalidad: string;
            fechaInicio: Date | null;
            fechaFin: Date | null;
        };
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        valido: boolean;
    }>;
    regenerarQR(sesionId: string, duracionMinutos?: number): Promise<{
        sesionId: string;
        codigoQR: string;
        qrUrl: string;
        qrImage: string;
        expiracion: string;
        duracionMinutos: number;
    }>;
    invalidarQR(sesionId: string): Promise<{
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tallerId: string;
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
        responsableId: string | null;
        codigoQR: string | null;
        codigoQRExpiracion: Date | null;
    }>;
}

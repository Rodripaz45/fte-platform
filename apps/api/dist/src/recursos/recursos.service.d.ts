import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { CreateReservaSalaDto } from './dto/create-reserva-sala.dto';
import { UpdateReservaSalaDto } from './dto/update-reserva-sala.dto';
import { VerificarDisponibilidadDto } from './dto/verificar-disponibilidad.dto';
export declare class RecursosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createSala(dto: CreateSalaDto): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        sede: string;
        capacidad: number;
        equipamiento: string | null;
        descripcion: string | null;
        activa: boolean;
    }>;
    findAllSalas(sede?: string, activa?: boolean): Promise<({
        _count: {
            sesiones: number;
            reservas: number;
        };
    } & {
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        sede: string;
        capacidad: number;
        equipamiento: string | null;
        descripcion: string | null;
        activa: boolean;
    })[]>;
    findOneSala(id: string): Promise<{
        sesiones: ({
            taller: {
                id: string;
                tema: string;
                trainer: {
                    id: string;
                    nombre: string;
                };
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            salaId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
        })[];
        reservas: {
            id: string;
            estado: string;
            creadoEn: Date;
            actualizadoEn: Date;
            fechaInicio: Date;
            fechaFin: Date;
            salaId: string;
            sesionId: string | null;
            motivo: string | null;
        }[];
    } & {
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        sede: string;
        capacidad: number;
        equipamiento: string | null;
        descripcion: string | null;
        activa: boolean;
    }>;
    updateSala(id: string, dto: UpdateSalaDto): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        sede: string;
        capacidad: number;
        equipamiento: string | null;
        descripcion: string | null;
        activa: boolean;
    }>;
    removeSala(id: string): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        sede: string;
        capacidad: number;
        equipamiento: string | null;
        descripcion: string | null;
        activa: boolean;
    }>;
    verificarDisponibilidad(dto: VerificarDisponibilidadDto): Promise<{
        disponible: boolean;
        conflictos: {
            id: string;
            fechaInicio: Date;
            fechaFin: Date;
            sesion: {
                id: string;
                taller: string;
                trainer: string;
            } | null;
            motivo: string | null;
        }[];
    }>;
    createReserva(dto: CreateReservaSalaDto): Promise<{
        sesion: ({
            taller: {
                tema: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            salaId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
        }) | null;
        sala: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            sede: string;
            capacidad: number;
            equipamiento: string | null;
            descripcion: string | null;
            activa: boolean;
        };
    } & {
        id: string;
        estado: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        salaId: string;
        sesionId: string | null;
        motivo: string | null;
    }>;
    findAllReservas(salaId?: string, fechaInicio?: string, fechaFin?: string): Promise<({
        sesion: ({
            taller: {
                tema: string;
                trainer: {
                    nombre: string;
                };
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            salaId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
        }) | null;
        sala: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            sede: string;
            capacidad: number;
            equipamiento: string | null;
            descripcion: string | null;
            activa: boolean;
        };
    } & {
        id: string;
        estado: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        salaId: string;
        sesionId: string | null;
        motivo: string | null;
    })[]>;
    findOneReserva(id: string): Promise<{
        sesion: ({
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
                capacidades: string | null;
                trainerId: string;
                directorId: string | null;
                unidadEducativaId: string | null;
                estadoAprobacion: string | null;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            salaId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
        }) | null;
        sala: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            sede: string;
            capacidad: number;
            equipamiento: string | null;
            descripcion: string | null;
            activa: boolean;
        };
    } & {
        id: string;
        estado: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        salaId: string;
        sesionId: string | null;
        motivo: string | null;
    }>;
    updateReserva(id: string, dto: UpdateReservaSalaDto): Promise<{
        sesion: ({
            taller: {
                tema: string;
            };
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            fecha: Date;
            horaInicio: Date | null;
            horaFin: Date | null;
            responsableId: string | null;
            salaId: string | null;
            codigoQR: string | null;
            codigoQRExpiracion: Date | null;
            recurrente: boolean;
            patronRecurrencia: string | null;
        }) | null;
        sala: {
            id: string;
            nombre: string;
            creadoEn: Date;
            actualizadoEn: Date;
            sede: string;
            capacidad: number;
            equipamiento: string | null;
            descripcion: string | null;
            activa: boolean;
        };
    } & {
        id: string;
        estado: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        salaId: string;
        sesionId: string | null;
        motivo: string | null;
    }>;
    removeReserva(id: string): Promise<{
        id: string;
        estado: string;
        creadoEn: Date;
        actualizadoEn: Date;
        fechaInicio: Date;
        fechaFin: Date;
        salaId: string;
        sesionId: string | null;
        motivo: string | null;
    }>;
}

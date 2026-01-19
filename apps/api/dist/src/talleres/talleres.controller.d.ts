import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
import { AprobarTallerDto } from './dto/aprobar-taller.dto';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        email: string;
        roles: string[];
    };
}
export declare class TalleresController {
    private readonly talleresService;
    constructor(talleresService: TalleresService);
    create(createTallereDto: CreateTallereDto): Promise<{
        unidadEducativa: {
            id: string;
            nombre: string;
            email: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            telefono: string | null;
            codigo: string | null;
            direccion: string | null;
            contacto: string | null;
        } | null;
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    findAll(req: AuthenticatedRequest): Promise<({
        cuposDisponibles: null;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
        unidadEducativa: {
            id: string;
            nombre: string;
            codigo: string | null;
        } | null;
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
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
    } | {
        cuposDisponibles: number;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
        unidadEducativa: {
            id: string;
            nombre: string;
            codigo: string | null;
        } | null;
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
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
    })[]>;
    findOne(id: string): Promise<{
        cuposDisponibles: null;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
        unidadEducativa: {
            id: string;
            nombre: string;
            email: string | null;
            telefono: string | null;
            codigo: string | null;
            direccion: string | null;
            contacto: string | null;
        } | null;
        inscripciones: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            participanteId: string;
            origen: string | null;
            dedupeHash: string | null;
        }[];
        feedbacks: {
            id: string;
            creadoEn: Date;
            tallerId: string;
            participanteId: string;
            puntaje: number | null;
            comentario: string | null;
        }[];
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
        listaParticipantes: ({
            asistenciasUE: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                tomadoEn: Date | null;
                sesionId: string;
                observaciones: string | null;
                listaParticipanteUEId: string;
            }[];
        } & {
            id: string;
            nombre: string;
            email: string | null;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            unidadEducativaId: string;
            tallerId: string;
            observaciones: string | null;
        })[];
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
    } | {
        cuposDisponibles: number;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
        unidadEducativa: {
            id: string;
            nombre: string;
            email: string | null;
            telefono: string | null;
            codigo: string | null;
            direccion: string | null;
            contacto: string | null;
        } | null;
        inscripciones: {
            id: string;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            tallerId: string;
            participanteId: string;
            origen: string | null;
            dedupeHash: string | null;
        }[];
        feedbacks: {
            id: string;
            creadoEn: Date;
            tallerId: string;
            participanteId: string;
            puntaje: number | null;
            comentario: string | null;
        }[];
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
        listaParticipantes: ({
            asistenciasUE: {
                id: string;
                estado: string | null;
                creadoEn: Date;
                actualizadoEn: Date;
                tomadoEn: Date | null;
                sesionId: string;
                observaciones: string | null;
                listaParticipanteUEId: string;
            }[];
        } & {
            id: string;
            nombre: string;
            email: string | null;
            estado: string | null;
            creadoEn: Date;
            actualizadoEn: Date;
            documento: string | null;
            telefono: string | null;
            genero: string | null;
            fechaNac: Date | null;
            unidadEducativaId: string;
            tallerId: string;
            observaciones: string | null;
        })[];
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
    }>;
    update(id: string, updateTallereDto: UpdateTallereDto): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    publicar(id: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    cerrar(id: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    finalizar(id: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    asignarTrainer(id: string, trainerId: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    obtenerPendientesAprobacion(): Promise<({
        unidadEducativa: {
            id: string;
            nombre: string;
        } | null;
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
        director: {
            id: string;
            nombre: string;
            email: string;
        } | null;
        _count: {
            sesiones: number;
            inscripciones: number;
        };
    } & {
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
    })[]>;
    aprobarTaller(id: string, dto: AprobarTallerDto, req: AuthenticatedRequest): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
        director: {
            id: string;
            nombre: string;
            email: string;
        } | null;
    } & {
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
    }>;
    enviarARevision(id: string): Promise<{
        trainer: {
            id: string;
            nombre: string;
            email: string;
        };
    } & {
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
    }>;
    obtenerEstadisticasTrainer(trainerId: string, req: AuthenticatedRequest): Promise<{
        trainerId: string;
        totalTalleres: number;
        talleresPublicados: number;
        talleresEnCurso: number;
        talleresFinalizados: number;
        totalSesiones: number;
        totalInscripciones: number;
        totalAsistencias: number;
        tasaAsistenciaPromedio: number;
        satisfaccionPromedio: number;
        totalRetroalimentaciones: number;
        participantesCertificados: number;
        participantesUnicos: number;
        talleresPorModalidad: {
            modalidad: string;
            cantidad: number;
        }[];
        talleresPorEstado: {
            estado: string;
            cantidad: number;
        }[];
    }>;
    obtenerMisEstadisticas(req: AuthenticatedRequest): Promise<{
        trainerId: string;
        totalTalleres: number;
        talleresPublicados: number;
        talleresEnCurso: number;
        talleresFinalizados: number;
        totalSesiones: number;
        totalInscripciones: number;
        totalAsistencias: number;
        tasaAsistenciaPromedio: number;
        satisfaccionPromedio: number;
        totalRetroalimentaciones: number;
        participantesCertificados: number;
        participantesUnicos: number;
        talleresPorModalidad: {
            modalidad: string;
            cantidad: number;
        }[];
        talleresPorEstado: {
            estado: string;
            cantidad: number;
        }[];
    }>;
}
export {};

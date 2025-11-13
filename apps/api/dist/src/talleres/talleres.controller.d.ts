import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';
export declare class TalleresController {
    private readonly talleresService;
    constructor(talleresService: TalleresService);
    create(createTallereDto: CreateTallereDto): Promise<{
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
    }>;
    findAll(): Promise<({
        cuposDisponibles: null;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
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
    } | {
        cuposDisponibles: number;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
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
    })[]>;
    findOne(id: string): Promise<{
        cuposDisponibles: null;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
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
    } | {
        cuposDisponibles: number;
        cuposOcupados: number;
        tieneCuposLimitados: boolean;
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
    }>;
    update(id: string, updateTallereDto: UpdateTallereDto): Promise<{
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
    }>;
}

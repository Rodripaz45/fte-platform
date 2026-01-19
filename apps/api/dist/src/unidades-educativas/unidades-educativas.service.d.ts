import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnidadEducativaDto } from './dto/create-unidad-educativa.dto';
import { UpdateUnidadEducativaDto } from './dto/update-unidad-educativa.dto';
export declare class UnidadesEducativasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUnidadEducativaDto): Promise<{
        id: string;
        nombre: string;
        email: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            talleres: number;
            listasParticipantes: number;
        };
    } & {
        id: string;
        nombre: string;
        email: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    })[]>;
    findOne(id: string): Promise<{
        talleres: ({
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
        })[];
        _count: {
            listasParticipantes: number;
        };
    } & {
        id: string;
        nombre: string;
        email: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
    update(id: string, dto: UpdateUnidadEducativaDto): Promise<{
        id: string;
        nombre: string;
        email: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        nombre: string;
        email: string | null;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
}

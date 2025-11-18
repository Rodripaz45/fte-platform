import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnidadEducativaDto } from './dto/create-unidad-educativa.dto';
import { UpdateUnidadEducativaDto } from './dto/update-unidad-educativa.dto';
export declare class UnidadesEducativasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUnidadEducativaDto): Promise<{
        id: string;
        email: string | null;
        nombre: string;
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
        email: string | null;
        nombre: string;
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
                email: string;
                nombre: string;
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
            trainerId: string;
            unidadEducativaId: string | null;
        })[];
        _count: {
            listasParticipantes: number;
        };
    } & {
        id: string;
        email: string | null;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
    update(id: string, dto: UpdateUnidadEducativaDto): Promise<{
        id: string;
        email: string | null;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        telefono: string | null;
        codigo: string | null;
        direccion: string | null;
        contacto: string | null;
    }>;
}

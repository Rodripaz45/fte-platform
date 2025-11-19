import { PrismaService } from '../../prisma/prisma.service';
import { ImportarListaDto } from './dto/importar-lista.dto';
export declare class ImportacionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    importarLista(dto: ImportarListaDto): Promise<{
        total: number;
        creados: number;
        duplicados: number;
        errores: Array<{
            fila: number;
            error: string;
        }>;
    }>;
    private generarDedupeHash;
    obtenerListaParticipantes(tallerId: string): Promise<{
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
    }[]>;
    eliminarParticipante(id: string): Promise<{
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
    }>;
}

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
export declare class CvsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private sanitizeText;
    create(dto: CreateCvDto): Promise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }>;
    findAll(params?: {
        participanteId?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }>;
    update(id: string, dto: UpdateCvDto): Promise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }>;
}

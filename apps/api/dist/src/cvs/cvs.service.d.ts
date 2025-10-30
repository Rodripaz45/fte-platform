import { PrismaService } from '../../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
export declare class CvsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private sanitizeText;
    create(dto: CreateCvDto): Promise<{
        url: string;
        version: string | null;
        texto: string | null;
        id: string;
        subidoEn: Date;
        participanteId: string;
    }>;
    findAll(params?: {
        participanteId?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<{
        url: string;
        version: string | null;
        texto: string | null;
        id: string;
        subidoEn: Date;
        participanteId: string;
    }[]>;
    findOne(id: string): Promise<{
        url: string;
        version: string | null;
        texto: string | null;
        id: string;
        subidoEn: Date;
        participanteId: string;
    }>;
    update(id: string, dto: UpdateCvDto): Promise<{
        url: string;
        version: string | null;
        texto: string | null;
        id: string;
        subidoEn: Date;
        participanteId: string;
    }>;
    remove(id: string): Promise<{
        url: string;
        version: string | null;
        texto: string | null;
        id: string;
        subidoEn: Date;
        participanteId: string;
    }>;
}

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { IaService } from '../ia/ia.service';
export declare class CvsService {
    private readonly prisma;
    private readonly iaService;
    private readonly logger;
    constructor(prisma: PrismaService, iaService: IaService);
    private sanitizeText;
    create(dto: CreateCvDto): Promise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }>;
    private clearCompetencias;
    private analyzeParticipantProfile;
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

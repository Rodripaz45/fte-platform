import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
export declare class CvsController {
    private readonly cvsService;
    constructor(cvsService: CvsService);
    create(dto: CreateCvDto): Promise<{
        id: string;
        participanteId: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
    }>;
    findAll(participanteId?: string): import("@prisma/client").Prisma.PrismaPromise<{
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

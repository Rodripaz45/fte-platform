import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
export declare class CvsController {
    private readonly cvsService;
    constructor(cvsService: CvsService);
    create(dto: CreateCvDto): Promise<{
        id: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
        participanteId: string;
    }>;
    findAll(participanteId?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
        participanteId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
        participanteId: string;
    }>;
    update(id: string, dto: UpdateCvDto): Promise<{
        id: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
        participanteId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        url: string;
        version: string | null;
        texto: string | null;
        subidoEn: Date;
        participanteId: string;
    }>;
}

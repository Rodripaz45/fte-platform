import { AnalyzeProfileDto, AnalyzeProfileResponse } from './dto/analyze-profile.dto';
import { AnalyzeJobDto, AnalyzeJobResponse } from './dto/analyze-job.dto';
import { PrismaService } from '../../prisma/prisma.service';
export declare class IaService {
    private readonly prisma;
    private readonly logger;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    private logPayload;
    buildAnalyzeDtoFromDb(participanteId: string): Promise<AnalyzeProfileDto>;
    analyzeByParticipantId(participanteId: string): Promise<{
        saved: boolean;
        participanteId: any;
        competencias: import("./dto/analyze-profile.dto").CompetenciaResult[];
        meta: any;
    }>;
    healthCheck(): Promise<any>;
    analyzeProfile(dto: AnalyzeProfileDto): Promise<AnalyzeProfileResponse>;
    analyzeProfileAndSave(dto: AnalyzeProfileDto): Promise<{
        saved: boolean;
        participanteId: any;
        competencias: import("./dto/analyze-profile.dto").CompetenciaResult[];
        meta: any;
    }>;
    analyzeJob(dto: AnalyzeJobDto): Promise<AnalyzeJobResponse>;
}

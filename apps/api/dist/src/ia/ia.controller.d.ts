import { IaService } from './ia.service';
import { AnalyzeJobDto } from './dto/analyze-job.dto';
export declare class IaController {
    private readonly iaService;
    constructor(iaService: IaService);
    healthCheck(): Promise<any>;
    reprocesar(participanteId: string): Promise<{
        saved: boolean;
        participanteId: any;
        competencias: import("./dto").CompetenciaResult[];
        meta: any;
    }>;
    analyzeJob(dto: AnalyzeJobDto): Promise<import("./dto/analyze-job.dto").AnalyzeJobResponse>;
}

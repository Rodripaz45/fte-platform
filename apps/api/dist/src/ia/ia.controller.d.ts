import { IaService } from './ia.service';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto';
import { AnalyzeJobDto } from './dto/analyze-job.dto';
export declare class IaController {
    private readonly iaService;
    constructor(iaService: IaService);
    healthCheck(): Promise<any>;
    analyzeProfile(dto: AnalyzeProfileDto): Promise<import("./dto/analyze-profile.dto").AnalyzeProfileResponse>;
    analyzeJob(dto: AnalyzeJobDto): Promise<import("./dto/analyze-job.dto").AnalyzeJobResponse>;
}

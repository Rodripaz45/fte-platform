import { AnalyzeProfileDto, AnalyzeProfileResponse } from './dto/analyze-profile.dto';
import { AnalyzeJobDto, AnalyzeJobResponse } from './dto/analyze-job.dto';
export declare class IaService {
    private readonly logger;
    private readonly baseUrl;
    constructor();
    healthCheck(): Promise<any>;
    analyzeProfile(dto: AnalyzeProfileDto): Promise<AnalyzeProfileResponse>;
    analyzeJob(dto: AnalyzeJobDto): Promise<AnalyzeJobResponse>;
}

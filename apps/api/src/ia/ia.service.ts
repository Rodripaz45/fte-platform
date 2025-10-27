// apps/api/src/ia/ia.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AnalyzeProfileDto, AnalyzeProfileResponse } from './dto/analyze-profile.dto';
import { AnalyzeJobDto, AnalyzeJobResponse } from './dto/analyze-job.dto';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.IA_URL || 'http://localhost:8000';
    this.logger.log(`IA Service initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Health check del microservicio FTE-AI
   */
  async healthCheck() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new HttpException(
          `IA service health check failed: ${res.status}`,
          res.status,
        );
      }

      return await res.json();
    } catch (error) {
      this.logger.error('Error checking IA service health', error);
      throw new HttpException(
        'IA service is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Analiza el perfil de un participante
   */
  async analyzeProfile(dto: AnalyzeProfileDto): Promise<AnalyzeProfileResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/analyze/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`IA analyze profile error: ${res.status} ${text}`);
        throw new HttpException(
          `IA error: ${res.status} - ${text}`,
          res.status,
        );
      }

      const data = await res.json();
      this.logger.log(
        `Profile analyzed for participant: ${dto.participanteId}`,
      );
      return data;
    } catch (error) {
      this.logger.error('Error analyzing profile', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error connecting to IA service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Analiza los requisitos de un puesto de trabajo
   */
  async analyzeJob(dto: AnalyzeJobDto): Promise<AnalyzeJobResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/analyze/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puestoTexto: dto.puestoTexto,
          topK: dto.topK || 6,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`IA analyze job error: ${res.status} ${text}`);
        throw new HttpException(
          `IA error: ${res.status} - ${text}`,
          res.status,
        );
      }

      const data = await res.json();
      this.logger.log(`Job analyzed: ${dto.puestoTexto.substring(0, 50)}...`);
      return data;
    } catch (error) {
      this.logger.error('Error analyzing job', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error connecting to IA service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

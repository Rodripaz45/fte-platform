// apps/api/src/ia/ia.controller.ts
import { Controller, Get, Post, UseGuards, Param, Body } from '@nestjs/common';
import { IaService } from './ia.service';
import { AnalyzeJobDto } from './dto/analyze-job.dto';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Public()
  @Get('health')
  async healthCheck() {
    return this.iaService.healthCheck();
  }

  @Public()
  @Post('reprocesar/:participanteId')
  async reprocesar(@Param('participanteId') participanteId: string) {
    return this.iaService.analyzeByParticipantId(participanteId);
  }

  @Public()
  @Post('analyze/job')
  async analyzeJob(@Body() dto: AnalyzeJobDto) {
    return this.iaService.analyzeJob(dto);
  }
}

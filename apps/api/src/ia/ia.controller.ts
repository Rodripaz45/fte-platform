// apps/api/src/ia/ia.controller.ts
import { Controller, Get, Post, UseGuards, Param, Body } from '@nestjs/common';
import { IaService } from './ia.service';
import { AnalyzeJobDto } from './dto/analyze-job.dto';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('IA')
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check del microservicio IA' })
  async healthCheck() {
    return this.iaService.healthCheck();
  }

  @Public()
  @Post('reprocesar/:participanteId')
  @ApiOperation({ summary: 'Reconstruye desde BD, analiza y persiste competencias' })
  @ApiParam({ name: 'participanteId', type: String })
  async reprocesar(@Param('participanteId') participanteId: string) {
    return this.iaService.analyzeByParticipantId(participanteId);
  }

  @Public()
  @Post('analyze/job')
  @ApiOperation({ summary: 'Analiza competencias requeridas para una oferta/puesto' })
  @ApiBody({ type: AnalyzeJobDto })
  async analyzeJob(@Body() dto: AnalyzeJobDto) {
    return this.iaService.analyzeJob(dto);
  }
}

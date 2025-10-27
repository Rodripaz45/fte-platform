// apps/api/src/ia/ia.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { IaService } from './ia.service';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto';
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
  @Post('analyze/profile')
  async analyzeProfile(@Body() dto: AnalyzeProfileDto) {
    return this.iaService.analyzeProfile(dto);
  }

  @Public()
  @Post('analyze/job')
  async analyzeJob(@Body() dto: AnalyzeJobDto) {
    return this.iaService.analyzeJob(dto);
  }
}

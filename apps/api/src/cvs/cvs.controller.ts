import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateCvDto) {
    return this.cvsService.create(dto);
  }

  // Listado general o por participanteId
  @Public()
  @Get()
  findAll(@Query('participanteId') participanteId?: string) {
    return this.cvsService.findAll(participanteId ? { participanteId } : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvsService.findOne(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCvDto) {
    return this.cvsService.update(id, dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvsService.remove(id);
  }
}



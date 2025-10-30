import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { ApiBody, ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('CVs')
@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Crear CV. Extrae texto automáticamente del PDF en url' })
  @ApiBody({ type: CreateCvDto })
  create(@Body() dto: CreateCvDto) {
    return this.cvsService.create(dto);
  }

  // Listado general o por participanteId
  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar CVs (opcional: por participanteId)' })
  @ApiQuery({ name: 'participanteId', required: false })
  findAll(@Query('participanteId') participanteId?: string) {
    return this.cvsService.findAll(participanteId ? { participanteId } : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un CV por id' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.cvsService.findOne(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un CV (url, version, texto)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCvDto })
  update(@Param('id') id: string, @Body() dto: UpdateCvDto) {
    return this.cvsService.update(id, dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un CV por id' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.cvsService.remove(id);
  }
}



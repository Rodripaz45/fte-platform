import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { GenerarQRDto } from './dto/generar-qr.dto';
import { ValidarQRDto } from './dto/validar-qr.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';

@ApiBearerAuth()
@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Roles('ADMIN', 'TRAINER')
  @Post()
  create(@Body() dto: CreateSesionDto) {
    return this.sesionesService.create(dto);
  }

  @Get()
  findAll(
    @Query('tallerId') tallerId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.sesionesService.findAll({
      tallerId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sesionesService.findOne(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSesionDto) {
    return this.sesionesService.update(id, dto);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post('generar-qr')
  @ApiOperation({ summary: 'Generar código QR para una sesión' })
  @ApiResponse({ status: 201, description: 'Código QR generado exitosamente' })
  generarQR(@Body() dto: GenerarQRDto) {
    return this.sesionesService.generarQR(dto);
  }

  @Post('validar-qr')
  @ApiOperation({ summary: 'Validar código QR de una sesión' })
  @ApiResponse({ status: 200, description: 'Código QR válido' })
  @ApiResponse({ status: 404, description: 'Código QR no válido' })
  validarQR(@Body() dto: ValidarQRDto) {
    return this.sesionesService.validarQR(dto);
  }

  @Public()
  @Get('qr/:codigoQR')
  @ApiOperation({ summary: 'Obtener información de sesión por código QR (público)' })
  @ApiResponse({ status: 200, description: 'Información de la sesión' })
  @ApiResponse({ status: 404, description: 'Código QR no válido' })
  getSesionByQR(@Param('codigoQR') codigoQR: string) {
    return this.sesionesService.validarQR({ codigoQR });
  }

  @Roles('ADMIN', 'TRAINER')
  @Post(':id/regenerar-qr')
  @ApiOperation({ summary: 'Regenerar código QR de una sesión' })
  @ApiResponse({ status: 200, description: 'Código QR regenerado exitosamente' })
  regenerarQR(
    @Param('id') sesionId: string,
    @Body('duracionMinutos') duracionMinutos?: number,
  ) {
    return this.sesionesService.regenerarQR(sesionId, duracionMinutos);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post(':id/invalidar-qr')
  @ApiOperation({ summary: 'Invalidar código QR de una sesión' })
  @ApiResponse({ status: 200, description: 'Código QR invalidado exitosamente' })
  invalidarQR(@Param('id') sesionId: string) {
    return this.sesionesService.invalidarQR(sesionId);
  }
}

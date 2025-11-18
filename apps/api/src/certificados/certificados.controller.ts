import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificadosService } from './certificados.service';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import type { Request as ExpressRequest } from 'express';

@ApiTags('Certificados')
@ApiBearerAuth()
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Roles('PARTICIPANTE')
  @Get('me')
  @ApiOperation({ summary: 'Obtener mis certificados' })
  @ApiResponse({ status: 200, description: 'Lista de certificados del participante' })
  async getMisCertificados(@Req() req: ExpressRequest) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    return this.certificadosService.findByUsuarioId(userId);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post('emitir/:tallerId/:participanteId')
  @ApiOperation({ summary: 'Emitir certificado manualmente para un participante' })
  @ApiResponse({ status: 201, description: 'Certificado emitido exitosamente' })
  async emitirCertificado(
    @Param('tallerId') tallerId: string,
    @Param('participanteId') participanteId: string,
    @Req() req: ExpressRequest,
  ) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    return this.certificadosService.emitirCertificado(tallerId, participanteId, userId);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post('emitir-masivo/:tallerId')
  @ApiOperation({ summary: 'Emitir certificados automáticamente para todos los elegibles de un taller' })
  @ApiResponse({ status: 200, description: 'Resumen de certificados emitidos' })
  async emitirCertificadosMasivo(@Param('tallerId') tallerId: string) {
    return this.certificadosService.emitirCertificadosAutomaticos(tallerId);
  }

  @Roles('ADMIN')
  @Get('all')
  @ApiOperation({ summary: 'Obtener todos los certificados (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de todos los certificados' })
  async getAllCertificados() {
    return this.certificadosService.findAll();
  }

  @Roles('ADMIN', 'TRAINER', 'PARTICIPANTE')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un certificado por ID' })
  @ApiResponse({ status: 200, description: 'Certificado encontrado' })
  async getCertificado(@Param('id') id: string) {
    return this.certificadosService.findOne(id);
  }

  @Public()
  @Get('verificar/:codigo')
  @ApiOperation({ summary: 'Verificar autenticidad de un certificado por código (público)' })
  @ApiResponse({ status: 200, description: 'Certificado verificado' })
  async verificarCertificado(@Param('codigo') codigo: string) {
    return this.certificadosService.verificarPorCodigo(codigo);
  }

  @Roles('ADMIN', 'TRAINER', 'PARTICIPANTE')
  @Post(':id/reenviar-email')
  @ApiOperation({ summary: 'Reenviar certificado por email' })
  @ApiResponse({ status: 200, description: 'Email reenviado exitosamente' })
  async reenviarEmail(@Param('id') id: string) {
    await this.certificadosService.reenviarPorEmail(id);
    return { message: 'Certificado reenviado por email exitosamente' };
  }

  @Roles('ADMIN')
  @Post(':id/regenerar')
  @ApiOperation({ summary: 'Regenerar y reenviar certificado (solo admin, permite regenerar aunque ya exista)' })
  @ApiResponse({ status: 200, description: 'Certificado regenerado y reenviado exitosamente' })
  async regenerarCertificado(
    @Param('id') id: string,
    @Req() req: ExpressRequest,
  ) {
    type AuthenticatedRequest = ExpressRequest & {
      user: { sub: string; email: string; roles: string[] };
    };
    const { sub: userId } = (req as AuthenticatedRequest).user;

    const certificado = await this.certificadosService.regenerarYReenviar(id, userId);
    return {
      message: 'Certificado regenerado y reenviado exitosamente',
      certificado,
    };
  }
}


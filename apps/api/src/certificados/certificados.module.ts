import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CertificadosService } from './certificados.service';
import { CertificadosController } from './certificados.controller';
import { CertificadoPdfService } from './certificado-pdf.service';
import { EmailService } from './email.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TalleresModule } from '../talleres/talleres.module';
import { TalleresService } from '../talleres/talleres.service';

@Module({
  imports: [PrismaModule, ConfigModule, forwardRef(() => TalleresModule)],
  controllers: [CertificadosController],
  providers: [CertificadosService, CertificadoPdfService, EmailService],
  exports: [CertificadosService],
})
export class CertificadosModule implements OnModuleInit {
  constructor(
    private readonly certificadosService: CertificadosService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    // Inyectar el servicio de certificados en el servicio de talleres
    // Esto se hace después de que ambos módulos estén inicializados
    try {
      const talleresService = this.moduleRef.get(TalleresService, { strict: false });
      if (talleresService) {
        talleresService.setCertificadosService(this.certificadosService);
      }
    } catch (error) {
      // Si no se puede obtener el servicio, no es crítico
      // El servicio de certificados funcionará independientemente
      console.warn('No se pudo inyectar CertificadosService en TalleresService:', error);
    }
  }
}


import { Module } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [SesionesController],
  providers: [SesionesService, PrismaService],
  exports: [SesionesService],
})
export class SesionesModule {}

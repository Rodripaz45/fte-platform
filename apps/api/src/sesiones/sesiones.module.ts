import { Module } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [NotificacionesModule, PrismaModule],
  controllers: [SesionesController],
  providers: [SesionesService],
  exports: [SesionesService],
})
export class SesionesModule {}

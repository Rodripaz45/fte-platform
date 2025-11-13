import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { IaModule } from '../ia/ia.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [IaModule, NotificacionesModule],
  controllers: [InscripcionesController],
  providers: [InscripcionesService, PrismaService],
})
export class InscripcionesModule {}

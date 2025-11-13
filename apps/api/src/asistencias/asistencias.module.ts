import { Module, forwardRef } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { SesionesModule } from '../sesiones/sesiones.module';

@Module({
  imports: [forwardRef(() => SesionesModule)],
  controllers: [AsistenciasController],
  providers: [AsistenciasService, PrismaService],
  exports: [AsistenciasService],
})
export class AsistenciasModule {}

import { Module } from '@nestjs/common';
import { ImportacionesService } from './importaciones.service';
import { ImportacionesController } from './importaciones.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImportacionesController],
  providers: [ImportacionesService],
  exports: [ImportacionesService],
})
export class ImportacionesModule {}


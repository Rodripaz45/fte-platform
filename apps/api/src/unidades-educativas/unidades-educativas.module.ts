import { Module } from '@nestjs/common';
import { UnidadesEducativasService } from './unidades-educativas.service';
import { UnidadesEducativasController } from './unidades-educativas.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UnidadesEducativasController],
  providers: [UnidadesEducativasService],
  exports: [UnidadesEducativasService],
})
export class UnidadesEducativasModule {}


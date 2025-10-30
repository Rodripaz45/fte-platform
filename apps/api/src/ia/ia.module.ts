// apps/api/src/ia/ia.module.ts
import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IaService],
  controllers: [IaController],
  exports: [IaService],
})
export class IaModule {}

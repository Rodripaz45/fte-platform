import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TalleresModule } from './talleres/talleres.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ReportesModule } from './reportes/reportes.module';
import { ParticipantesModule } from './participantes/participantes.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { IaModule } from './ia/ia.module';
import { CvsModule } from './cvs/cvs.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    TalleresModule,
    ParticipantesModule,
    InscripcionesModule,
    AsistenciasModule,
    SesionesModule,
    FeedbackModule,
    ReportesModule,
    IaModule,
    CvsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

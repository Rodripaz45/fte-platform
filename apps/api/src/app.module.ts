import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TalleresModule } from './talleres/talleres.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    TalleresModule,
    InscripcionesModule,
    AsistenciasModule,
    FeedbackModule,
    ReportesModule,
  ],
})
export class AppModule {}

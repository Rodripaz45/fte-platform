export class EstadisticasTrainerDto {
  trainerId: string;
  totalTalleres: number;
  talleresPublicados: number;
  talleresEnCurso: number;
  talleresFinalizados: number;
  totalSesiones: number;
  totalInscripciones: number;
  totalAsistencias: number;
  tasaAsistenciaPromedio: number; // Porcentaje
  satisfaccionPromedio: number; // Puntaje promedio de retroalimentaciones
  totalRetroalimentaciones: number;
  participantesCertificados: number;
  participantesUnicos: number;
  talleresPorModalidad: {
    modalidad: string;
    cantidad: number;
  }[];
  talleresPorEstado: {
    estado: string;
    cantidad: number;
  }[];
}

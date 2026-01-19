export declare class EstadisticasTrainerDto {
    trainerId: string;
    totalTalleres: number;
    talleresPublicados: number;
    talleresEnCurso: number;
    talleresFinalizados: number;
    totalSesiones: number;
    totalInscripciones: number;
    totalAsistencias: number;
    tasaAsistenciaPromedio: number;
    satisfaccionPromedio: number;
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

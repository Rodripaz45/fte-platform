export declare enum CanalNotificacion {
    EMAIL = "EMAIL",
    WEB = "WEB",
    SMS = "SMS"
}
export declare enum TipoNotificacion {
    RECORDATORIO_SESION = "RECORDATORIO_SESION",
    CONFIRMACION_INSCRIPCION = "CONFIRMACION_INSCRIPCION",
    NUEVO_TALLER = "NUEVO_TALLER",
    RECORDATORIO_ENCUESTA = "RECORDATORIO_ENCUESTA",
    ASISTENCIA_REGISTRADA = "ASISTENCIA_REGISTRADA",
    TALLER_CANCELADO = "TALLER_CANCELADO",
    TALLER_MODIFICADO = "TALLER_MODIFICADO",
    OTRO = "OTRO"
}
export declare enum EstadoNotificacion {
    PENDIENTE = "PENDIENTE",
    ENVIADA = "ENVIADA",
    LEIDA = "LEIDA",
    FALLIDA = "FALLIDA"
}
export declare class CreateNotificacionDto {
    usuarioId: string;
    canal?: CanalNotificacion;
    tipo?: TipoNotificacion;
    estado?: EstadoNotificacion;
    titulo?: string;
    mensaje?: string;
}

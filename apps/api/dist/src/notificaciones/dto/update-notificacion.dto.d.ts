import { CreateNotificacionDto, EstadoNotificacion } from './create-notificacion.dto';
declare const UpdateNotificacionDto_base: import("@nestjs/common").Type<Partial<CreateNotificacionDto>>;
export declare class UpdateNotificacionDto extends UpdateNotificacionDto_base {
    estado?: EstadoNotificacion;
}
export {};

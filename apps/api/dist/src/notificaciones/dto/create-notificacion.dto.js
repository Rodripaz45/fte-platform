"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificacionDto = exports.EstadoNotificacion = exports.TipoNotificacion = exports.CanalNotificacion = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var CanalNotificacion;
(function (CanalNotificacion) {
    CanalNotificacion["EMAIL"] = "EMAIL";
    CanalNotificacion["WEB"] = "WEB";
    CanalNotificacion["SMS"] = "SMS";
})(CanalNotificacion || (exports.CanalNotificacion = CanalNotificacion = {}));
var TipoNotificacion;
(function (TipoNotificacion) {
    TipoNotificacion["RECORDATORIO_SESION"] = "RECORDATORIO_SESION";
    TipoNotificacion["CONFIRMACION_INSCRIPCION"] = "CONFIRMACION_INSCRIPCION";
    TipoNotificacion["NUEVO_TALLER"] = "NUEVO_TALLER";
    TipoNotificacion["RECORDATORIO_ENCUESTA"] = "RECORDATORIO_ENCUESTA";
    TipoNotificacion["ASISTENCIA_REGISTRADA"] = "ASISTENCIA_REGISTRADA";
    TipoNotificacion["TALLER_CANCELADO"] = "TALLER_CANCELADO";
    TipoNotificacion["TALLER_MODIFICADO"] = "TALLER_MODIFICADO";
    TipoNotificacion["OTRO"] = "OTRO";
})(TipoNotificacion || (exports.TipoNotificacion = TipoNotificacion = {}));
var EstadoNotificacion;
(function (EstadoNotificacion) {
    EstadoNotificacion["PENDIENTE"] = "PENDIENTE";
    EstadoNotificacion["ENVIADA"] = "ENVIADA";
    EstadoNotificacion["LEIDA"] = "LEIDA";
    EstadoNotificacion["FALLIDA"] = "FALLIDA";
})(EstadoNotificacion || (exports.EstadoNotificacion = EstadoNotificacion = {}));
class CreateNotificacionDto {
    usuarioId;
    canal;
    tipo;
    estado;
    titulo;
    mensaje;
}
exports.CreateNotificacionDto = CreateNotificacionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del usuario destinatario' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificacionDto.prototype, "usuarioId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Canal de notificación',
        enum: CanalNotificacion,
        required: false,
        default: CanalNotificacion.WEB
    }),
    (0, class_validator_1.IsEnum)(CanalNotificacion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacionDto.prototype, "canal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de notificación',
        enum: TipoNotificacion,
        required: false
    }),
    (0, class_validator_1.IsEnum)(TipoNotificacion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacionDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estado de la notificación',
        enum: EstadoNotificacion,
        required: false,
        default: EstadoNotificacion.PENDIENTE
    }),
    (0, class_validator_1.IsEnum)(EstadoNotificacion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacionDto.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Título de la notificación', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacionDto.prototype, "titulo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mensaje de la notificación', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificacionDto.prototype, "mensaje", void 0);
//# sourceMappingURL=create-notificacion.dto.js.map
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
exports.UpdateNotificacionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_notificacion_dto_1 = require("./create-notificacion.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateNotificacionDto extends (0, swagger_1.PartialType)(create_notificacion_dto_1.CreateNotificacionDto) {
    estado;
}
exports.UpdateNotificacionDto = UpdateNotificacionDto;
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Estado de la notificación',
        enum: create_notificacion_dto_1.EstadoNotificacion,
        required: false
    }),
    (0, class_validator_1.IsEnum)(create_notificacion_dto_1.EstadoNotificacion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotificacionDto.prototype, "estado", void 0);
//# sourceMappingURL=update-notificacion.dto.js.map
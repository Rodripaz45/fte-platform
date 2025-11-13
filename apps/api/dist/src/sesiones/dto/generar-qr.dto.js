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
exports.GenerarQRDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GenerarQRDto {
    sesionId;
    duracionMinutos;
}
exports.GenerarQRDto = GenerarQRDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la sesión' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerarQRDto.prototype, "sesionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Duración del código en minutos (por defecto: 60 minutos)',
        default: 60,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GenerarQRDto.prototype, "duracionMinutos", void 0);
//# sourceMappingURL=generar-qr.dto.js.map
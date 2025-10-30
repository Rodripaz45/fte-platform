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
exports.AnalyzeProfileDto = exports.TallerLiteDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class TallerLiteDto {
    tema;
    asistencia_pct;
}
exports.TallerLiteDto = TallerLiteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TallerLiteDto.prototype, "tema", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TallerLiteDto.prototype, "asistencia_pct", void 0);
class AnalyzeProfileDto {
    participanteId;
    talleres;
    cvTexto;
}
exports.AnalyzeProfileDto = AnalyzeProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyzeProfileDto.prototype, "participanteId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TallerLiteDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AnalyzeProfileDto.prototype, "talleres", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AnalyzeProfileDto.prototype, "cvTexto", void 0);
//# sourceMappingURL=analyze-profile.dto.js.map
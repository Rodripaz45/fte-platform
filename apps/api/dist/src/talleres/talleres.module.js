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
exports.TalleresModule = void 0;
const common_1 = require("@nestjs/common");
const talleres_service_1 = require("./talleres.service");
const talleres_controller_1 = require("./talleres.controller");
const notificaciones_module_1 = require("../notificaciones/notificaciones.module");
const certificados_module_1 = require("../certificados/certificados.module");
let TalleresModule = class TalleresModule {
    talleresService;
    constructor(talleresService) {
        this.talleresService = talleresService;
    }
    getTalleresService() {
        return this.talleresService;
    }
};
exports.TalleresModule = TalleresModule;
exports.TalleresModule = TalleresModule = __decorate([
    (0, common_1.Module)({
        imports: [notificaciones_module_1.NotificacionesModule, (0, common_1.forwardRef)(() => certificados_module_1.CertificadosModule)],
        controllers: [talleres_controller_1.TalleresController],
        providers: [talleres_service_1.TalleresService],
        exports: [talleres_service_1.TalleresService],
    }),
    __metadata("design:paramtypes", [talleres_service_1.TalleresService])
], TalleresModule);
//# sourceMappingURL=talleres.module.js.map
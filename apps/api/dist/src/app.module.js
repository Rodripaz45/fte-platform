"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const talleres_module_1 = require("./talleres/talleres.module");
const inscripciones_module_1 = require("./inscripciones/inscripciones.module");
const asistencias_module_1 = require("./asistencias/asistencias.module");
const feedback_module_1 = require("./feedback/feedback.module");
const reportes_module_1 = require("./reportes/reportes.module");
const participantes_module_1 = require("./participantes/participantes.module");
const sesiones_module_1 = require("./sesiones/sesiones.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            usuarios_module_1.UsuariosModule,
            talleres_module_1.TalleresModule,
            participantes_module_1.ParticipantesModule,
            inscripciones_module_1.InscripcionesModule,
            asistencias_module_1.AsistenciasModule,
            sesiones_module_1.SesionesModule,
            feedback_module_1.FeedbackModule,
            reportes_module_1.ReportesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
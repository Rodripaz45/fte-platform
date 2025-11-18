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
exports.CertificadosModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const certificados_service_1 = require("./certificados.service");
const certificados_controller_1 = require("./certificados.controller");
const certificado_pdf_service_1 = require("./certificado-pdf.service");
const email_service_1 = require("./email.service");
const prisma_module_1 = require("../../prisma/prisma.module");
const config_1 = require("@nestjs/config");
const talleres_module_1 = require("../talleres/talleres.module");
const talleres_service_1 = require("../talleres/talleres.service");
let CertificadosModule = class CertificadosModule {
    certificadosService;
    moduleRef;
    constructor(certificadosService, moduleRef) {
        this.certificadosService = certificadosService;
        this.moduleRef = moduleRef;
    }
    onModuleInit() {
        try {
            const talleresService = this.moduleRef.get(talleres_service_1.TalleresService, { strict: false });
            if (talleresService) {
                talleresService.setCertificadosService(this.certificadosService);
            }
        }
        catch (error) {
            console.warn('No se pudo inyectar CertificadosService en TalleresService:', error);
        }
    }
};
exports.CertificadosModule = CertificadosModule;
exports.CertificadosModule = CertificadosModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule, (0, common_1.forwardRef)(() => talleres_module_1.TalleresModule)],
        controllers: [certificados_controller_1.CertificadosController],
        providers: [certificados_service_1.CertificadosService, certificado_pdf_service_1.CertificadoPdfService, email_service_1.EmailService],
        exports: [certificados_service_1.CertificadosService],
    }),
    __metadata("design:paramtypes", [certificados_service_1.CertificadosService,
        core_1.ModuleRef])
], CertificadosModule);
//# sourceMappingURL=certificados.module.js.map
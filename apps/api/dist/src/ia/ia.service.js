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
var IaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IaService = void 0;
const common_1 = require("@nestjs/common");
let IaService = IaService_1 = class IaService {
    logger = new common_1.Logger(IaService_1.name);
    baseUrl;
    constructor() {
        this.baseUrl = process.env.IA_URL || 'http://localhost:8000';
        this.logger.log(`IA Service initialized with base URL: ${this.baseUrl}`);
    }
    async healthCheck() {
        try {
            const res = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                throw new common_1.HttpException(`IA service health check failed: ${res.status}`, res.status);
            }
            return await res.json();
        }
        catch (error) {
            this.logger.error('Error checking IA service health', error);
            throw new common_1.HttpException('IA service is not available', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async analyzeProfile(dto) {
        try {
            const res = await fetch(`${this.baseUrl}/analyze/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dto),
            });
            if (!res.ok) {
                const text = await res.text();
                this.logger.error(`IA analyze profile error: ${res.status} ${text}`);
                throw new common_1.HttpException(`IA error: ${res.status} - ${text}`, res.status);
            }
            const data = await res.json();
            this.logger.log(`Profile analyzed for participant: ${dto.participanteId}`);
            return data;
        }
        catch (error) {
            this.logger.error('Error analyzing profile', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error connecting to IA service', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async analyzeJob(dto) {
        try {
            const res = await fetch(`${this.baseUrl}/analyze/job`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    puestoTexto: dto.puestoTexto,
                    topK: dto.topK || 6,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                this.logger.error(`IA analyze job error: ${res.status} ${text}`);
                throw new common_1.HttpException(`IA error: ${res.status} - ${text}`, res.status);
            }
            const data = await res.json();
            this.logger.log(`Job analyzed: ${dto.puestoTexto.substring(0, 50)}...`);
            return data;
        }
        catch (error) {
            this.logger.error('Error analyzing job', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error connecting to IA service', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
exports.IaService = IaService;
exports.IaService = IaService = IaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], IaService);
//# sourceMappingURL=ia.service.js.map
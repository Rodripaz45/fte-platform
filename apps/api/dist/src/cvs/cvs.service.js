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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CvsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const openai_1 = __importDefault(require("openai"));
let CvsService = class CvsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitizeText(raw) {
        if (!raw)
            return raw;
        let txt = raw
            .replace(/\f/g, '\n')
            .replace(/\r/g, '')
            .replace(/\*\*/g, '')
            .replace(/[\u2022\u00B7\u25E6\u25AA\u25AB\u25BA\u2013\-]\s+/gm, '')
            .replace(/\s+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[\t ]{2,}/g, ' ');
        txt = txt.replace(/\b(P[áa]gina|Page)\s+\d+(\s+de\s+\d+)?\b/gi, '');
        return txt.trim();
    }
    async create(dto) {
        let texto = dto.texto;
        if (!texto && dto.url) {
            try {
                console.log('[CV] Intentando descargar PDF desde URL:', dto.url);
                const res = await fetch(dto.url, { redirect: 'follow' });
                const ct = res.headers.get('content-type');
                console.log('[CV] Respuesta fetch:', { ok: res.ok, status: res.status, contentType: ct });
                if (!res.ok) {
                    console.log('[CV] Descarga fallida, status:', res.status);
                }
                else {
                    const ab = await res.arrayBuffer();
                    const buf = Buffer.from(ab);
                    console.log('[CV] Bytes recibidos:', buf.byteLength);
                    try {
                        const parsed = await (0, pdf_parse_1.default)(buf);
                        if (parsed?.text) {
                            texto = this.sanitizeText(parsed.text);
                            console.log('[CV] Extracción OK. Longitud texto:', (texto || '').length);
                        }
                        else {
                            console.log('[CV] pdf-parse no devolvió texto');
                        }
                    }
                    catch (e) {
                        console.log('[CV] Error en pdf-parse:', e?.message);
                    }
                }
            }
            catch (e) {
                console.log('[CV] Error al descargar/extraer PDF:', e?.message);
            }
        }
        if (texto && process.env.OPENAI_API_KEY) {
            try {
                const client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
                const prompt = 'Limpia y normaliza el siguiente texto de CV. ' +
                    'Elimina encabezados/pies, números de página, guiones/viñetas, asteriscos y cualquier formato Markdown. ' +
                    'Quita espacios repetidos y artefactos. Conserva el contenido en oraciones o párrafos simples. ' +
                    'Además, elimina o anonimiza datos personales (teléfonos, correos, direcciones, documentos de identidad), nombres de empresas y direcciones específicas. ' +
                    'Mantén la esencia de las habilidades, experiencias y características profesionales sin referencias a datos personales o empresas. ' +
                    'Devuelve solo el texto limpio, sin explicación, sin listas, sin **, sin •.\n\n---\n' +
                    texto.substring(0, 12000);
                const completion = await client.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'Eres un asistente que limpia y normaliza texto de CV en español.' },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 1500,
                });
                let cleaned = completion.choices?.[0]?.message?.content?.trim();
                if (cleaned)
                    cleaned = this.sanitizeText(cleaned);
                if (cleaned) {
                    console.log('[CV] OpenAI limpieza OK. Longitud texto:', cleaned.length);
                    texto = cleaned;
                }
            }
            catch (e) {
                console.log('[CV] Error limpieza OpenAI:', e?.message);
            }
        }
        return this.prisma.cv.create({
            data: {
                participanteId: dto.participanteId,
                url: dto.url,
                version: dto.version,
                ...(texto ? { texto } : {}),
            },
        });
    }
    findAll(params) {
        const where = params?.participanteId
            ? { participanteId: params.participanteId }
            : undefined;
        return this.prisma.cv.findMany({ where, orderBy: { subidoEn: 'desc' } });
    }
    async findOne(id) {
        const item = await this.prisma.cv.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('CV no encontrado');
        return item;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.cv.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.cv.delete({ where: { id } });
    }
};
exports.CvsService = CvsService;
exports.CvsService = CvsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CvsService);
//# sourceMappingURL=cvs.service.js.map
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

@Injectable()
export class CvsService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeText(raw: string): string {
    if (!raw) return raw;
    let txt = raw
      .replace(/\f/g, '\n')            // saltos de página -> salto de línea
      .replace(/\r/g, '')               // CR
      .replace(/\*\*/g, '')            // quitar asteriscos dobles (markdown bold)
      .replace(/[\u2022\u00B7\u25E6\u25AA\u25AB\u25BA\u2013\-]\s+/gm, '') // bullets comunes al inicio de línea
      .replace(/\s+\n/g, '\n')         // espacios antes de NL
      .replace(/\n{3,}/g, '\n\n')      // no más de una línea en blanco
      .replace(/[\t ]{2,}/g, ' ');       // compactar espacios

    // Eliminar encabezados/pies de página típicos "Página X de Y" o "Page X"
    txt = txt.replace(/\b(P[áa]gina|Page)\s+\d+(\s+de\s+\d+)?\b/gi, '');

    return txt.trim();
  }

  async create(dto: CreateCvDto) {
    // Si no viene texto, intentamos extraerlo del PDF en dto.url
    let texto: string | undefined = dto.texto;
    if (!texto && dto.url) {
      try {
        // eslint-disable-next-line no-console
        console.log('[CV] Intentando descargar PDF desde URL:', dto.url);
        const res = await fetch(dto.url, { redirect: 'follow' as RequestRedirect });
        const ct = res.headers.get('content-type');
        // eslint-disable-next-line no-console
        console.log('[CV] Respuesta fetch:', { ok: res.ok, status: res.status, contentType: ct });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.log('[CV] Descarga fallida, status:', res.status);
        } else {
          const ab = await res.arrayBuffer();
          const buf = Buffer.from(ab);
          // eslint-disable-next-line no-console
          console.log('[CV] Bytes recibidos:', buf.byteLength);
          try {
            const parsed = await pdfParse(buf);
            if (parsed?.text) {
              texto = this.sanitizeText(parsed.text);
              // eslint-disable-next-line no-console
              console.log('[CV] Extracción OK. Longitud texto:', (texto || '').length);
            } else {
              // eslint-disable-next-line no-console
              console.log('[CV] pdf-parse no devolvió texto');
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log('[CV] Error en pdf-parse:', (e as Error)?.message);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('[CV] Error al descargar/extraer PDF:', (e as Error)?.message);
      }
    }

    // Limpieza con OpenAI (si hay API key y texto no vacío)
    if (texto && process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt =
          'Limpia y normaliza el siguiente texto de CV. ' +
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
        if (cleaned) cleaned = this.sanitizeText(cleaned);
        if (cleaned) {
          // eslint-disable-next-line no-console
          console.log('[CV] OpenAI limpieza OK. Longitud texto:', cleaned.length);
          texto = cleaned;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('[CV] Error limpieza OpenAI:', (e as Error)?.message);
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

  findAll(params?: { participanteId?: string }) {
    const where = params?.participanteId
      ? { participanteId: params.participanteId }
      : undefined;
    return this.prisma.cv.findMany({ where, orderBy: { subidoEn: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.cv.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('CV no encontrado');
    return item;
  }

  async update(id: string, dto: UpdateCvDto) {
    await this.findOne(id);
    return this.prisma.cv.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cv.delete({ where: { id } });
  }
}



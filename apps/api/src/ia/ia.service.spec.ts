import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IaService } from './ia.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto';
import { MatchCandidatesDto } from './dto/match-candidates.dto';

// Mock global fetch
global.fetch = jest.fn();

describe('IaService - Orquestación con Microservicio de IA', () => {
  let service: IaService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockParticipante = {
    id: 'participante-1',
    usuarioId: 'usuario-1',
  };

  const mockInscripcion = {
    id: 'inscripcion-1',
    participanteId: 'participante-1',
    tallerId: 'taller-1',
    taller: {
      id: 'taller-1',
      tema: 'Marketing Digital',
    },
  };

  const mockSesion = {
    id: 'sesion-1',
    tallerId: 'taller-1',
  };

  const mockAsistencia = {
    id: 'asistencia-1',
    participanteId: 'participante-1',
    sesion: { tallerId: 'taller-1' },
    estado: 'PRESENTE',
  };

  const mockCV = {
    id: 'cv-1',
    participanteId: 'participante-1',
    texto: 'Experiencia en marketing digital y redes sociales...',
    subidoEn: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      inscripcion: {
        findMany: jest.fn(),
      },
      sesion: {
        count: jest.fn(),
      },
      asistencia: {
        count: jest.fn(),
      },
      cv: {
        findFirst: jest.fn(),
      },
      competencia: {
        upsert: jest.fn(),
      },
      perfilCompetencia: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      participante: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IaService>(IaService);
    prismaService = module.get(PrismaService);

    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildAnalyzeDtoFromDb - Construcción de DTO desde BD', () => {
    it('debería construir DTO correctamente con talleres y asistencia', async () => {
      // Arrange
      prismaService.inscripcion.findMany.mockResolvedValue([mockInscripcion] as any);
      prismaService.sesion.count.mockResolvedValue(5); // 5 sesiones totales
      prismaService.asistencia.count.mockResolvedValue(4); // 4 asistencias (80%)
      prismaService.cv.findFirst.mockResolvedValue(mockCV as any);

      // Act
      const dto = await service.buildAnalyzeDtoFromDb('participante-1');

      // Assert
      expect(dto.participanteId).toBe('participante-1');
      expect(dto.talleres).toHaveLength(1);
      expect(dto.talleres[0].tema).toBe('marketing digital');
      expect(dto.talleres[0].asistencia_pct).toBe(0.8); // 4/5 = 0.8
      expect(dto.cvTexto).toBe(mockCV.texto);
    });

    it('debería calcular asistencia_pct como 1.0 cuando no hay sesiones', async () => {
      // Arrange
      prismaService.inscripcion.findMany.mockResolvedValue([mockInscripcion] as any);
      prismaService.sesion.count.mockResolvedValue(0); // Sin sesiones
      prismaService.asistencia.count.mockResolvedValue(0);
      prismaService.cv.findFirst.mockResolvedValue(null);

      // Act
      const dto = await service.buildAnalyzeDtoFromDb('participante-1');

      // Assert
      expect(dto.talleres[0].asistencia_pct).toBe(1.0);
    });

    it('debería manejar participantes sin CV', async () => {
      // Arrange
      prismaService.inscripcion.findMany.mockResolvedValue([mockInscripcion] as any);
      prismaService.sesion.count.mockResolvedValue(5);
      prismaService.asistencia.count.mockResolvedValue(4);
      prismaService.cv.findFirst.mockResolvedValue(null);

      // Act
      const dto = await service.buildAnalyzeDtoFromDb('participante-1');

      // Assert
      expect(dto.cvTexto).toBeUndefined();
    });
  });

  describe('analyzeProfile - Llamada al Microservicio de IA', () => {
    const analyzeDto: AnalyzeProfileDto = {
      participanteId: 'participante-1',
      talleres: [
        { tema: 'marketing digital', asistencia_pct: 0.8 },
      ],
      cvTexto: 'Experiencia en marketing...',
    };

    it('debería llamar al microservicio de IA exitosamente', async () => {
      // Arrange
      const mockResponse = {
        competencias: [
          { competencia: 'Marketing Digital', nivel: 85, confianza: 0.9 },
          { competencia: 'Redes Sociales', nivel: 75, confianza: 0.8 },
        ],
        meta: { mode: 'ia' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await service.analyzeProfile(analyzeDto);

      // Assert
      expect(result.competencias).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/analyze/profile'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  describe('analyzeProfileAndSave - Persistencia de Competencias', () => {
    it('debería guardar competencias en la BD después del análisis', async () => {
      // Arrange
      const analyzeDto: AnalyzeProfileDto = {
        participanteId: 'participante-1',
        talleres: [],
      };
      const mockAnalysisResponse = {
        competencias: [
          { competencia: 'Marketing Digital', nivel: 0.85, confianza: 0.9 },
          { competencia: 'Redes Sociales', nivel: 0.75, confianza: 0.8 },
        ],
        meta: { mode: 'ia' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResponse,
      } as Response);

      prismaService.competencia.upsert
        .mockResolvedValueOnce({ id: 'comp-1', nombre: 'Marketing Digital' } as any)
        .mockResolvedValueOnce({ id: 'comp-2', nombre: 'Redes Sociales' } as any);
      prismaService.perfilCompetencia.upsert
        .mockResolvedValueOnce({} as any)
        .mockResolvedValueOnce({} as any);

      // Act
      const result = await service.analyzeProfileAndSave(analyzeDto);

      // Assert
      expect(result.saved).toBe(true);
      expect(result.participanteId).toBe('participante-1');
      expect(prismaService.competencia.upsert).toHaveBeenCalledTimes(2);
      expect(prismaService.perfilCompetencia.upsert).toHaveBeenCalledTimes(2);
    });

    it('debería convertir nivel de 0-1 a 0-100', async () => {
      // Arrange
      const analyzeDto: AnalyzeProfileDto = {
        participanteId: 'participante-1',
        talleres: [],
      };
      const mockAnalysisResponse = {
        competencias: [
          { competencia: 'Marketing Digital', nivel: 0.85, confianza: 0.9 },
        ],
        meta: { mode: 'ia' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResponse,
      } as Response);

      prismaService.competencia.upsert.mockResolvedValue({
        id: 'comp-1',
        nombre: 'Marketing Digital',
      } as any);
      prismaService.perfilCompetencia.upsert.mockResolvedValue({} as any);

      // Act
      await service.analyzeProfileAndSave(analyzeDto);

      // Assert
      expect(prismaService.perfilCompetencia.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            nivel: 85, // 0.85 * 100 = 85
          }),
        }),
      );
    });
  });

  describe('analyzeByParticipantId - Orquestación Completa', () => {
    it('debería construir DTO desde BD y analizar', async () => {
      // Arrange
      prismaService.inscripcion.findMany.mockResolvedValue([mockInscripcion] as any);
      prismaService.sesion.count.mockResolvedValue(5);
      prismaService.asistencia.count.mockResolvedValue(4);
      prismaService.cv.findFirst.mockResolvedValue(null);

      const mockAnalysisResponse = {
        competencias: [
          { competencia: 'Marketing Digital', nivel: 0.85, confianza: 0.9 },
        ],
        meta: { mode: 'ia' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysisResponse,
      } as Response);

      prismaService.competencia.upsert.mockResolvedValue({
        id: 'comp-1',
        nombre: 'Marketing Digital',
      } as any);
      prismaService.perfilCompetencia.upsert.mockResolvedValue({} as any);

      // Act
      const result = await service.analyzeByParticipantId('participante-1');

      // Assert
      expect(result.saved).toBe(true);
      expect(prismaService.inscripcion.findMany).toHaveBeenCalledWith({
        where: { participanteId: 'participante-1' },
        include: { taller: true },
      });
    });
  });

  describe('healthCheck - Verificación de Disponibilidad', () => {
    it('debería retornar estado saludable si el microservicio responde', async () => {
      // Arrange
      const mockHealthResponse = { status: 'ok', version: '1.0.0' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealthResponse,
      } as Response);

      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toEqual(mockHealthResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });
});


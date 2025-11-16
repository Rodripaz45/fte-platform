import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { IaService } from '../ia/ia.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';

describe('InscripcionesService - Validaciones de Cupos y Estados', () => {
  let service: InscripcionesService;
  let prismaService: jest.Mocked<PrismaService>;
  let iaService: jest.Mocked<IaService>;
  let notificacionesService: jest.Mocked<NotificacionesService>;

  const mockParticipante = {
    id: 'participante-1',
    usuarioId: 'usuario-1',
  };

  const mockTaller = {
    id: 'taller-1',
    tema: 'Marketing Digital',
    estado: 'PROGRAMADO',
    cupos: 30,
  };

  const mockInscripcion = {
    id: 'inscripcion-1',
    participanteId: 'participante-1',
    tallerId: 'taller-1',
    estado: 'INSCRITO',
    fechaInscripcion: new Date(),
    taller: mockTaller,
    participante: {
      id: 'participante-1',
      usuario: {
        id: 'usuario-1',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
      },
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      participante: {
        findUnique: jest.fn(),
      },
      taller: {
        findUnique: jest.fn(),
      },
      inscripcion: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const mockIaService = {
      analyzeByParticipantId: jest.fn(),
    };

    const mockNotificacionesService = {
      crearConfirmacionInscripcion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: IaService,
          useValue: mockIaService,
        },
        {
          provide: NotificacionesService,
          useValue: mockNotificacionesService,
        },
      ],
    }).compile();

    service = module.get<InscripcionesService>(InscripcionesService);
    prismaService = module.get(PrismaService);
    iaService = module.get(IaService);
    notificacionesService = module.get(NotificacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - Validaciones de Cupos y Estados', () => {
    const createDto: CreateInscripcioneDto = {
      participanteId: 'participante-1',
      tallerId: 'taller-1',
    };

    it('debería crear una inscripción exitosamente cuando hay cupos disponibles', async () => {
      // Arrange
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.inscripcion.count.mockResolvedValue(10); // 10 inscripciones, quedan 20 cupos
      prismaService.inscripcion.findFirst.mockResolvedValue(null); // No hay duplicado
      prismaService.inscripcion.create.mockResolvedValue(mockInscripcion as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(prismaService.inscripcion.count).toHaveBeenCalledWith({
        where: {
          tallerId: 'taller-1',
          estado: { in: ['INSCRITO', 'FINALIZADO'] },
        },
      });
    });

    it('debería lanzar BadRequestException cuando no hay cupos disponibles', async () => {
      // Arrange
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.inscripcion.count.mockResolvedValue(30); // Cupo lleno

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'El taller ya alcanzó su cupo máximo',
      );
      expect(prismaService.inscripcion.create).not.toHaveBeenCalled();
    });

    it('debería permitir inscripción cuando el taller no tiene límite de cupos (cupos = 0 o null)', async () => {
      // Arrange
      const tallerSinCupos = {
        ...mockTaller,
        cupos: 0,
      };
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(tallerSinCupos as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(null);
      prismaService.inscripcion.create.mockResolvedValue(mockInscripcion as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(prismaService.inscripcion.count).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el taller está FINALIZADO', async () => {
      // Arrange
      const tallerFinalizado = {
        ...mockTaller,
        estado: 'FINALIZADO',
      };
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(tallerFinalizado as any);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'No se puede inscribir en un taller finalizado',
      );
    });

    it('debería lanzar BadRequestException si el participante ya está inscrito', async () => {
      // Arrange
      const inscripcionExistente = {
        id: 'inscripcion-existente',
        estado: 'INSCRITO',
      };
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.inscripcion.count.mockResolvedValue(10);
      prismaService.inscripcion.findFirst.mockResolvedValue(inscripcionExistente as any);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'El participante ya está inscrito en este taller',
      );
    });

    it('debería permitir reinscripción si la inscripción anterior está CANCELADA', async () => {
      // Arrange
      const inscripcionCancelada = {
        id: 'inscripcion-cancelada',
        estado: 'CANCELADO',
      };
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.inscripcion.count.mockResolvedValue(10);
      prismaService.inscripcion.findFirst.mockResolvedValue(inscripcionCancelada as any);
      prismaService.inscripcion.create.mockResolvedValue(mockInscripcion as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(prismaService.inscripcion.create).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el participante no existe', async () => {
      // Arrange
      prismaService.participante.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Participante no encontrado');
    });

    it('debería lanzar NotFoundException si el taller no existe', async () => {
      // Arrange
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.taller.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Taller no encontrado');
    });
  });

  describe('update - Disparar Análisis de IA', () => {
    const updateDto: UpdateInscripcioneDto = {
      estado: 'FINALIZADO',
    };

    it('debería disparar análisis de IA cuando el estado cambia a FINALIZADO', async () => {
      // Arrange
      const inscripcionActual = {
        id: 'inscripcion-1',
        estado: 'INSCRITO',
        participanteId: 'participante-1',
      };
      const inscripcionActualizada = {
        ...inscripcionActual,
        estado: 'FINALIZADO',
        taller: mockTaller,
        participante: mockParticipante,
      };

      prismaService.inscripcion.findUnique
        .mockResolvedValueOnce(inscripcionActual as any)
        .mockResolvedValueOnce(inscripcionActualizada as any);
      prismaService.inscripcion.update.mockResolvedValue(inscripcionActualizada as any);
      iaService.analyzeByParticipantId.mockResolvedValue({ saved: true } as any);

      // Act
      const result = await service.update('inscripcion-1', updateDto);

      // Assert
      expect(result).toEqual(inscripcionActualizada);
      expect(iaService.analyzeByParticipantId).toHaveBeenCalledWith('participante-1');
    });

    it('no debería disparar análisis de IA cuando el estado no es FINALIZADO', async () => {
      // Arrange
      const updateDtoCancelado: UpdateInscripcioneDto = {
        estado: 'CANCELADO',
      };
      const inscripcionActual = {
        id: 'inscripcion-1',
        estado: 'INSCRITO',
      };
      const inscripcionActualizada = {
        ...inscripcionActual,
        estado: 'CANCELADO',
        taller: mockTaller,
        participante: mockParticipante,
      };

      prismaService.inscripcion.findUnique
        .mockResolvedValueOnce(inscripcionActual as any)
        .mockResolvedValueOnce(inscripcionActualizada as any);
      prismaService.inscripcion.update.mockResolvedValue(inscripcionActualizada as any);

      // Act
      await service.update('inscripcion-1', updateDtoCancelado);

      // Assert
      expect(iaService.analyzeByParticipantId).not.toHaveBeenCalled();
    });

    it('no debería fallar la actualización si el análisis de IA falla', async () => {
      // Arrange
      const inscripcionActual = {
        id: 'inscripcion-1',
        estado: 'INSCRITO',
        participanteId: 'participante-1',
      };
      const inscripcionActualizada = {
        ...inscripcionActual,
        estado: 'FINALIZADO',
        taller: mockTaller,
        participante: mockParticipante,
      };

      prismaService.inscripcion.findUnique
        .mockResolvedValueOnce(inscripcionActual as any)
        .mockResolvedValueOnce(inscripcionActualizada as any);
      prismaService.inscripcion.update.mockResolvedValue(inscripcionActualizada as any);
      iaService.analyzeByParticipantId.mockRejectedValue(new Error('IA service error'));

      // Act
      const result = await service.update('inscripcion-1', updateDto);

      // Assert
      expect(result).toEqual(inscripcionActualizada);
      expect(iaService.analyzeByParticipantId).toHaveBeenCalled();
    });
  });
});


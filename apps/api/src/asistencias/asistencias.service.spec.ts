import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SesionesService } from '../sesiones/sesiones.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { TomarAsistenciaDto } from './dto/tomar-asistencia.dto';
import { RegistrarAsistenciaQRDto } from './dto/registrar-asistencia-qr.dto';

describe('AsistenciasService - Reglas de Marcado y Evidencias', () => {
  let service: AsistenciasService;
  let prismaService: jest.Mocked<PrismaService>;
  let sesionesService: jest.Mocked<SesionesService>;

  const mockSesion = {
    id: 'sesion-1',
    tallerId: 'taller-1',
    fecha: new Date('2024-01-15'),
    horaInicio: new Date('2024-01-15T10:00:00'),
    horaFin: new Date('2024-01-15T12:00:00'),
  };

  const mockParticipante = {
    id: 'participante-1',
    usuarioId: 'usuario-1',
  };

  const mockInscripcion = {
    id: 'inscripcion-1',
    participanteId: 'participante-1',
    tallerId: 'taller-1',
    estado: 'INSCRITO',
  };

  const mockAsistencia = {
    id: 'asistencia-1',
    sesionId: 'sesion-1',
    participanteId: 'participante-1',
    estado: 'PRESENTE',
    tomadoEn: new Date(),
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
      sesion: {
        findUnique: jest.fn(),
      },
      participante: {
        findUnique: jest.fn(),
      },
      inscripcion: {
        findFirst: jest.fn(),
      },
      asistencia: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockSesionesService = {
      validarQR: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SesionesService,
          useValue: mockSesionesService,
        },
      ],
    }).compile();

    service = module.get<AsistenciasService>(AsistenciasService);
    prismaService = module.get(PrismaService);
    sesionesService = module.get(SesionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - Validación de Inscripción', () => {
    const createDto: CreateAsistenciaDto = {
      sesionId: 'sesion-1',
      participanteId: 'participante-1',
      estado: 'PRESENTE',
    };

    it('debería crear asistencia exitosamente cuando el participante está inscrito', async () => {
      // Arrange
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(mockInscripcion as any);
      prismaService.asistencia.upsert.mockResolvedValue(mockAsistencia as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockAsistencia);
      expect(prismaService.inscripcion.findFirst).toHaveBeenCalledWith({
        where: {
          participanteId: 'participante-1',
          tallerId: 'taller-1',
          estado: { in: ['INSCRITO', 'FINALIZADO'] },
        },
        select: { id: true },
      });
    });

    it('debería lanzar BadRequestException si el participante no está inscrito', async () => {
      // Arrange
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'El participante no está inscrito en el taller de la sesión',
      );
    });

    it('debería lanzar BadRequestException si la inscripción está CANCELADA', async () => {
      // Arrange
      const inscripcionCancelada = {
        ...mockInscripcion,
        estado: 'CANCELADO',
      };
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(null); // No encuentra porque está cancelada

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('debería hacer upsert si ya existe asistencia para la misma sesión y participante', async () => {
      // Arrange
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(mockInscripcion as any);
      prismaService.asistencia.upsert.mockResolvedValue(mockAsistencia as any);

      // Act
      await service.create(createDto);

      // Assert
      expect(prismaService.asistencia.upsert).toHaveBeenCalledWith({
        where: {
          sesionId_participanteId: {
            sesionId: 'sesion-1',
            participanteId: 'participante-1',
          },
        },
        update: {
          estado: 'PRESENTE',
          tomadoEn: expect.any(Date),
        },
        create: {
          sesionId: 'sesion-1',
          participanteId: 'participante-1',
          estado: 'PRESENTE',
          tomadoEn: expect.any(Date),
        },
        include: {
          participante: { include: { usuario: true } },
        },
      });
    });
  });

  describe('tomar - Asistencia en Bloque', () => {
    const tomarDto: TomarAsistenciaDto = {
      sesionId: 'sesion-1',
      items: [
        { participanteId: 'participante-1', estado: 'PRESENTE' },
        { participanteId: 'participante-2', estado: 'AUSENTE' },
      ],
    };

    it('debería tomar asistencia en bloque exitosamente', async () => {
      // Arrange
      const mockParticipante2 = { id: 'participante-2' };
      const mockInscripcion2 = {
        ...mockInscripcion,
        participanteId: 'participante-2',
      };

      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique
        .mockResolvedValueOnce(mockParticipante as any)
        .mockResolvedValueOnce(mockParticipante2 as any);
      prismaService.inscripcion.findFirst
        .mockResolvedValueOnce(mockInscripcion as any)
        .mockResolvedValueOnce(mockInscripcion2 as any);
      prismaService.$transaction.mockResolvedValue([
        { ...mockAsistencia, estado: 'PRESENTE' },
        { ...mockAsistencia, id: 'asistencia-2', estado: 'AUSENTE' },
      ] as any);

      // Act
      const result = await service.tomar(tomarDto);

      // Assert
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si no se envían items', async () => {
      // Arrange
      const dtoSinItems: TomarAsistenciaDto = {
        sesionId: 'sesion-1',
        items: [],
      };

      // Act & Assert
      await expect(service.tomar(dtoSinItems)).rejects.toThrow(BadRequestException);
      await expect(service.tomar(dtoSinItems)).rejects.toThrow(
        'Debe enviar al menos un item de asistencia',
      );
    });

    it('debería validar que todos los participantes estén inscritos', async () => {
      // Arrange
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(null); // No está inscrito

      // Act & Assert
      await expect(service.tomar(tomarDto)).rejects.toThrow(BadRequestException);
      await expect(service.tomar(tomarDto)).rejects.toThrow(
        'no está inscrito en el taller de la sesión',
      );
    });
  });

  describe('registrarAsistenciaPorQR - Evidencia QR', () => {
    const registrarQRDto: RegistrarAsistenciaQRDto = {
      codigoQR: 'QR-12345',
    };

    it('debería registrar asistencia por QR exitosamente', async () => {
      // Arrange
      const validacionQR = {
        sesionId: 'sesion-1',
        valido: true,
      };
      sesionesService.validarQR.mockResolvedValue(validacionQR as any);
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(mockInscripcion as any);
      prismaService.asistencia.findUnique.mockResolvedValue(null); // No existe
      prismaService.asistencia.create.mockResolvedValue(mockAsistencia as any);

      // Act
      const result = await service.registrarAsistenciaPorQR(
        registrarQRDto,
        'participante-1',
      );

      // Assert
      expect(result).toEqual(mockAsistencia);
      expect(sesionesService.validarQR).toHaveBeenCalledWith({ codigoQR: 'QR-12345' });
      expect(prismaService.asistencia.create).toHaveBeenCalledWith({
        data: {
          sesionId: 'sesion-1',
          participanteId: 'participante-1',
          estado: 'PRESENTE',
          tomadoEn: expect.any(Date),
        },
        include: {
          sesion: { include: { taller: true } },
          participante: { include: { usuario: true } },
        },
      });
    });

    it('debería actualizar asistencia existente a PRESENTE cuando se escanea QR', async () => {
      // Arrange
      const asistenciaExistente = {
        ...mockAsistencia,
        estado: 'AUSENTE',
      };
      const asistenciaActualizada = {
        ...asistenciaExistente,
        estado: 'PRESENTE',
      };
      const validacionQR = {
        sesionId: 'sesion-1',
        valido: true,
      };
      sesionesService.validarQR.mockResolvedValue(validacionQR as any);
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(mockInscripcion as any);
      prismaService.asistencia.findUnique.mockResolvedValue(asistenciaExistente as any);
      prismaService.asistencia.update.mockResolvedValue(asistenciaActualizada as any);

      // Act
      const result = await service.registrarAsistenciaPorQR(
        registrarQRDto,
        'participante-1',
      );

      // Assert
      expect(result.estado).toBe('PRESENTE');
      expect(prismaService.asistencia.update).toHaveBeenCalledWith({
        where: { id: 'asistencia-1' },
        data: {
          estado: 'PRESENTE',
          tomadoEn: expect.any(Date),
        },
        include: {
          sesion: { include: { taller: true } },
          participante: { include: { usuario: true } },
        },
      });
    });

    it('debería validar que el participante esté inscrito antes de registrar por QR', async () => {
      // Arrange
      const validacionQR = {
        sesionId: 'sesion-1',
        valido: true,
      };
      sesionesService.validarQR.mockResolvedValue(validacionQR as any);
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.participante.findUnique.mockResolvedValue(mockParticipante as any);
      prismaService.inscripcion.findFirst.mockResolvedValue(null); // No está inscrito

      // Act & Assert
      await expect(
        service.registrarAsistenciaPorQR(registrarQRDto, 'participante-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resumenPorSesion - Estadísticas', () => {
    it('debería calcular resumen correcto de asistencias', async () => {
      // Arrange
      prismaService.sesion.findUnique.mockResolvedValue(mockSesion as any);
      prismaService.asistencia.count
        .mockResolvedValueOnce(15) // PRESENTE
        .mockResolvedValueOnce(3) // AUSENTE
        .mockResolvedValueOnce(2) // TARDE
        .mockResolvedValueOnce(20); // Total

      // Act
      const result = await service.resumenPorSesion('sesion-1');

      // Assert
      expect(result).toEqual({
        sesionId: 'sesion-1',
        presentes: 15,
        ausentes: 3,
        tarde: 2,
        total: 20,
      });
    });
  });
});


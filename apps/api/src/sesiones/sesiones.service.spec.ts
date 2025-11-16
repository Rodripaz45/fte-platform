import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';

describe('SesionesService - Validaciones de Fechas, Estados y Cupos', () => {
  let service: SesionesService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificacionesService: jest.Mocked<NotificacionesService>;

  const mockTaller = {
    id: 'taller-1',
    tema: 'Marketing Digital',
    estado: 'PROGRAMADO',
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-01-31'),
    inscripciones: [
      {
        id: 'insc-1',
        estado: 'INSCRITO',
        participante: {
          id: 'participante-1',
          usuario: { id: 'usuario-1', email: 'participante1@example.com' },
        },
      },
    ],
  };

  const mockSesion = {
    id: 'sesion-1',
    tallerId: 'taller-1',
    fecha: new Date('2024-01-15'),
    horaInicio: new Date('2024-01-15T10:00:00'),
    horaFin: new Date('2024-01-15T12:00:00'),
    codigoQR: 'QR-12345',
    codigoQRExpiracion: new Date('2024-01-15T13:00:00'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      taller: {
        findUnique: jest.fn(),
      },
      sesion: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      usuario: {
        findUnique: jest.fn(),
      },
    };

    const mockNotificacionesService = {
      crearRecordatorioSesion: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SesionesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificacionesService,
          useValue: mockNotificacionesService,
        },
      ],
    }).compile();

    service = module.get<SesionesService>(SesionesService);
    prismaService = module.get(PrismaService);
    notificacionesService = module.get(NotificacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - Validaciones de Fechas y Estados', () => {
    const createDto: CreateSesionDto = {
      tallerId: 'taller-1',
      fecha: '2024-01-15',
      horaInicio: '10:00',
      horaFin: '12:00',
      tema: 'Introducción',
    };

    it('debería crear una sesión exitosamente cuando el taller está PROGRAMADO', async () => {
      // Arrange
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.sesion.create.mockResolvedValue(mockSesion as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockSesion);
      expect(prismaService.taller.findUnique).toHaveBeenCalledWith({
        where: { id: 'taller-1' },
        include: { inscripciones: { include: { participante: { include: { usuario: true } } } } },
      });
    });

    it('debería lanzar BadRequestException si el taller está FINALIZADO', async () => {
      // Arrange
      const tallerFinalizado = {
        ...mockTaller,
        estado: 'FINALIZADO',
      };
      prismaService.taller.findUnique.mockResolvedValue(tallerFinalizado as any);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow(
        'No se pueden crear sesiones para un taller finalizado',
      );
      expect(prismaService.sesion.create).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el taller no existe', async () => {
      // Arrange
      prismaService.taller.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Taller no encontrado');
    });

    it('debería validar que horaInicio < horaFin', async () => {
      // Arrange
      const dtoConHorasInvalidas: CreateSesionDto = {
        ...createDto,
        horaInicio: '12:00',
        horaFin: '10:00',
      };
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      // Mock la creación para que no falle antes de la validación
      prismaService.sesion.create.mockResolvedValue(mockSesion as any);

      // Act & Assert
      // Nota: La validación se hace después de convertir a Date, así que necesitamos mockear correctamente
      // El servicio convierte '12:00' y '10:00' a Date, y luego compara
      // Como '12:00' > '10:00' como string, pero necesitamos que falle la validación de Date
      // Vamos a probar con fechas completas
      const fecha = '2024-01-15';
      const dtoConFechasInvalidas: CreateSesionDto = {
        ...createDto,
        fecha,
        horaInicio: `${fecha}T12:00:00`,
        horaFin: `${fecha}T10:00:00`,
      };
      
      await expect(service.create(dtoConFechasInvalidas)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería validar que horaInicio no sea igual a horaFin', async () => {
      // Arrange
      const fecha = '2024-01-15';
      const dtoConHorasIguales: CreateSesionDto = {
        ...createDto,
        fecha,
        horaInicio: `${fecha}T10:00:00`,
        horaFin: `${fecha}T10:00:00`,
      };
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.sesion.create.mockResolvedValue(mockSesion as any);

      // Act & Assert
      await expect(service.create(dtoConHorasIguales)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería validar que el responsable existe si se proporciona', async () => {
      // Arrange
      const dtoConResponsable: CreateSesionDto = {
        ...createDto,
        responsableId: 'responsable-1',
      };
      prismaService.taller.findUnique.mockResolvedValue(mockTaller as any);
      prismaService.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(dtoConResponsable)).rejects.toThrow(NotFoundException);
      await expect(service.create(dtoConResponsable)).rejects.toThrow(
        'Usuario responsable no encontrado',
      );
    });
  });

  describe('update - Validaciones de Fechas', () => {
    const updateDto: UpdateSesionDto = {
      horaInicio: '14:00',
      horaFin: '16:00',
    };

    it('debería validar horas en update', async () => {
      // Arrange
      const sesionCompleta = {
        ...mockSesion,
        taller: mockTaller,
        responsable: null,
      };
      prismaService.sesion.findUnique.mockResolvedValue(sesionCompleta as any);
      prismaService.sesion.update.mockResolvedValue({
        ...mockSesion,
        ...updateDto,
      } as any);

      // Act
      await service.update('sesion-1', updateDto);

      // Assert
      expect(prismaService.sesion.update).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si horaInicio >= horaFin en update', async () => {
      // Arrange
      const fecha = '2024-01-15';
      const updateDtoInvalido: UpdateSesionDto = {
        horaInicio: `${fecha}T16:00:00`,
        horaFin: `${fecha}T14:00:00`,
      };
      const sesionCompleta = {
        ...mockSesion,
        taller: mockTaller,
        responsable: null,
      };
      prismaService.sesion.findUnique.mockResolvedValue(sesionCompleta as any);
      prismaService.sesion.update.mockResolvedValue(mockSesion as any);

      // Act & Assert
      await expect(service.update('sesion-1', updateDtoInvalido)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validarQR - Validaciones de Expiración', () => {
    it('debería validar un QR válido y no expirado', async () => {
      // Arrange
      const sesionConQR = {
        ...mockSesion,
        codigoQRExpiracion: new Date(Date.now() + 3600000), // 1 hora en el futuro
        taller: {
          id: 'taller-1',
          tema: 'Marketing Digital',
          modalidad: 'VIRTUAL',
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-01-31'),
        },
      };
      prismaService.sesion.findFirst.mockResolvedValue(sesionConQR as any);

      // Act
      const result = await service.validarQR({ codigoQR: 'QR-12345' });

      // Assert
      expect(result.valido).toBe(true);
      expect(result.sesionId).toBe('sesion-1');
    });

    it('debería lanzar BadRequestException si el QR está expirado', async () => {
      // Arrange
      const sesionConQRExpirado = {
        ...mockSesion,
        codigoQRExpiracion: new Date(Date.now() - 3600000), // 1 hora en el pasado
        taller: {
          id: 'taller-1',
          tema: 'Marketing Digital',
          modalidad: 'VIRTUAL',
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-01-31'),
        },
      };
      prismaService.sesion.findFirst.mockResolvedValue(sesionConQRExpirado as any);

      // Act & Assert
      await expect(service.validarQR({ codigoQR: 'QR-12345' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validarQR({ codigoQR: 'QR-12345' })).rejects.toThrow(
        'El código QR ha expirado',
      );
    });

    it('debería lanzar NotFoundException si el QR no existe', async () => {
      // Arrange
      prismaService.sesion.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validarQR({ codigoQR: 'QR-INEXISTENTE' })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validarQR({ codigoQR: 'QR-INEXISTENTE' })).rejects.toThrow(
        'Código QR no válido',
      );
    });
  });
});


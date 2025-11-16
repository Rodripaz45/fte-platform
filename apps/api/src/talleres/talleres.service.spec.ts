import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';

/**
 * GUÍA DE PRUEBAS UNITARIAS PARA NESTJS
 * 
 * Este archivo muestra cómo hacer pruebas unitarias para servicios en NestJS.
 * 
 * CONCEPTOS CLAVE:
 * 1. Mocking: Simular dependencias (PrismaService, otros servicios)
 * 2. Test Module: Crear un módulo de prueba aislado
 * 3. Arrange-Act-Assert: Estructura de las pruebas
 * 
 * COMANDOS ÚTILES:
 * - npm test                    # Ejecutar todas las pruebas
 * - npm run test:watch          # Ejecutar en modo watch
 * - npm run test:cov            # Ejecutar con cobertura
 * - npm test talleres.service   # Ejecutar solo este archivo
 */

describe('TalleresService', () => {
  let service: TalleresService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificacionesService: jest.Mocked<NotificacionesService>;

  // Datos de prueba reutilizables
  const mockTrainer = {
    id: 'trainer-1',
    nombre: 'Juan Trainer',
    email: 'trainer@example.com',
    estado: 'ACTIVO',
    roles: [
      {
        rol: {
          id: 'rol-1',
          nombre: 'TRAINER',
        },
      },
    ],
  };

    const mockTaller = {
      id: 'taller-1',
      tema: 'Marketing Digital',
      modalidad: 'VIRTUAL',
      cupos: 30,
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2024-01-31'),
      sede: 'Virtual',
      estado: 'PROGRAMADO',
      trainerId: 'trainer-1',
      creadoEn: new Date(),
      trainer: {
        id: 'trainer-1',
        nombre: 'Juan Trainer',
        email: 'trainer@example.com',
      },
    } as any;

  beforeEach(async () => {
    // Crear mocks de las dependencias
    // Nota: Usamos 'as any' porque Prisma tiene tipos muy complejos
    // y TypeScript no puede inferir que estos métodos pueden ser mockeados
    const mockPrismaService = {
      usuario: {
        findUnique: jest.fn() as any,
      },
      taller: {
        create: jest.fn() as any,
        findMany: jest.fn() as any,
        findUnique: jest.fn() as any,
        update: jest.fn() as any,
        delete: jest.fn() as any,
      },
      participante: {
        findMany: jest.fn() as any,
      },
      inscripcion: {
        count: jest.fn() as any,
      },
    } as any;

    const mockNotificacionesService = {
      crearNotificacionNuevoTaller: jest.fn(),
    };

    // Crear el módulo de prueba
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TalleresService,
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

    service = module.get<TalleresService>(TalleresService);
    prismaService = module.get(PrismaService);
    notificacionesService = module.get(NotificacionesService);
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateTallereDto = {
      tema: 'Marketing Digital',
      modalidad: 'VIRTUAL',
      cupos: 30,
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      sede: 'Virtual',
      trainerId: 'trainer-1',
    };

    it('debería crear un taller exitosamente', async () => {
      // Arrange: Configurar los mocks
      prismaService.usuario.findUnique.mockResolvedValue(mockTrainer as any);
      prismaService.taller.create.mockResolvedValue(mockTaller as any);
      prismaService.participante.findMany.mockResolvedValue([]);

      // Act: Ejecutar el método
      const result = await service.create(createDto);

      // Assert: Verificar el resultado
      expect(result).toEqual(mockTaller);
      expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'trainer-1' },
        include: { roles: { include: { rol: true } } },
      });
      expect(prismaService.taller.create).toHaveBeenCalledWith({
        data: {
          tema: 'Marketing Digital',
          modalidad: 'VIRTUAL',
          cupos: 30,
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-01-31'),
          sede: 'Virtual',
          estado: 'PROGRAMADO',
          trainerId: 'trainer-1',
        },
        include: {
          trainer: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });
    });

    it('debería lanzar BadRequestException si fechaInicio >= fechaFin', async () => {
      // Arrange
      const invalidDto: CreateTallereDto = {
        ...createDto,
        fechaInicio: '2024-01-31',
        fechaFin: '2024-01-01',
      };

      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
      expect(prismaService.usuario.findUnique).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el trainer no existe', async () => {
      // Arrange
      prismaService.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow(
        'Trainer no encontrado',
      );
      expect(prismaService.taller.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el usuario no tiene rol TRAINER', async () => {
      // Arrange
      const usuarioSinRolTrainer = {
        ...mockTrainer,
        roles: [
          {
            rol: {
              id: 'rol-2',
              nombre: 'PARTICIPANTE',
            },
          },
        ],
      };
      prismaService.usuario.findUnique.mockResolvedValue(
        usuarioSinRolTrainer as any,
      );

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'El usuario especificado no tiene rol TRAINER',
      );
    });

    it('debería lanzar BadRequestException si el trainer no está activo', async () => {
      // Arrange
      const trainerInactivo = {
        ...mockTrainer,
        estado: 'INACTIVO',
      };
      prismaService.usuario.findUnique.mockResolvedValue(
        trainerInactivo as any,
      );

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'El trainer debe estar activo',
      );
    });

    it('debería notificar a los participantes cuando se crea un taller', async () => {
      // Arrange
      const participantes = [
        {
          id: 'participante-1',
          usuario: {
            id: 'usuario-1',
            email: 'participante1@example.com',
          },
        },
        {
          id: 'participante-2',
          usuario: {
            id: 'usuario-2',
            email: 'participante2@example.com',
          },
        },
      ];

      prismaService.usuario.findUnique.mockResolvedValue(mockTrainer as any);
      prismaService.taller.create.mockResolvedValue(mockTaller as any);
      prismaService.participante.findMany.mockResolvedValue(
        participantes as any,
      );
      notificacionesService.crearNotificacionNuevoTaller.mockResolvedValue(
        {} as any,
      );

      // Act
      await service.create(createDto);

      // Assert
      expect(prismaService.participante.findMany).toHaveBeenCalled();
      // Nota: Las notificaciones se crean en paralelo sin await, así que verificamos que se llamó
      expect(notificacionesService.crearNotificacionNuevoTaller).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los talleres con información de cupos', async () => {
      // Arrange
      const talleres = [
        {
          ...mockTaller,
          id: 'taller-1',
          cupos: 30,
        },
        {
          ...mockTaller,
          id: 'taller-2',
          cupos: 20,
        },
      ];

      prismaService.taller.findMany.mockResolvedValue(talleres as any);
      prismaService.inscripcion.count
        .mockResolvedValueOnce(10) // 10 inscripciones para taller-1
        .mockResolvedValueOnce(5); // 5 inscripciones para taller-2

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        ...talleres[0],
        cuposDisponibles: 20, // 30 - 10
        cuposOcupados: 10,
        tieneCuposLimitados: true,
      });
      expect(result[1]).toMatchObject({
        ...talleres[1],
        cuposDisponibles: 15, // 20 - 5
        cuposOcupados: 5,
        tieneCuposLimitados: true,
      });
    });

    it('debería manejar talleres sin límite de cupos', async () => {
      // Arrange
      const tallerSinCupos = {
        ...mockTaller,
        cupos: null,
      };

      prismaService.taller.findMany.mockResolvedValue([tallerSinCupos] as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).toMatchObject({
        cuposDisponibles: null,
        cuposOcupados: 0,
        tieneCuposLimitados: false,
      });
      expect(prismaService.inscripcion.count).not.toHaveBeenCalled();
    });
  });

  describe('findAllByTrainerId', () => {
    it('debería retornar solo los talleres del trainer especificado', async () => {
      // Arrange
      const talleresDelTrainer = [
        {
          ...mockTaller,
          trainerId: 'trainer-1',
        },
      ];

      prismaService.taller.findMany.mockResolvedValue(talleresDelTrainer as any);
      prismaService.inscripcion.count.mockResolvedValue(5);

      // Act
      const result = await service.findAllByTrainerId('trainer-1');

      // Assert
      expect(prismaService.taller.findMany).toHaveBeenCalledWith({
        where: {
          trainerId: 'trainer-1',
        },
        include: {
          trainer: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('debería retornar un taller con información completa', async () => {
      // Arrange
      const tallerCompleto = {
        ...mockTaller,
        inscripciones: [
          { id: 'insc-1', estado: 'INSCRITO' },
          { id: 'insc-2', estado: 'FINALIZADO' },
          { id: 'insc-3', estado: 'CANCELADO' },
        ],
        feedbacks: [],
      };

      prismaService.taller.findUnique.mockResolvedValue(tallerCompleto as any);

      // Act
      const result = await service.findOne('taller-1');

      // Assert
      expect(result).toMatchObject({
        ...tallerCompleto,
        cuposOcupados: 2, // Solo INSCRITO y FINALIZADO cuentan
        cuposDisponibles: 28, // 30 - 2
        tieneCuposLimitados: true,
      });
    });

    it('debería lanzar NotFoundException si el taller no existe', async () => {
      // Arrange
      prismaService.taller.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('taller-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('taller-inexistente')).rejects.toThrow(
        'Taller no encontrado',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateTallereDto = {
      tema: 'Marketing Digital Avanzado',
    };

    it('debería actualizar un taller exitosamente', async () => {
      // Arrange
      const tallerActualizado = {
        ...mockTaller,
        tema: 'Marketing Digital Avanzado',
      };

      const tallerConRelaciones = {
        ...mockTaller,
        inscripciones: [],
        feedbacks: [],
      };

      prismaService.taller.findUnique.mockResolvedValue(tallerConRelaciones as any);
      prismaService.taller.update.mockResolvedValue(tallerActualizado as any);

      // Act
      const result = await service.update('taller-1', updateDto);

      // Assert
      expect(result).toEqual(tallerActualizado);
      expect(prismaService.taller.update).toHaveBeenCalledWith({
        where: { id: 'taller-1' },
        data: updateDto,
        include: {
          trainer: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });
    });

    it('debería validar el trainer si se actualiza trainerId', async () => {
      // Arrange
      const updateDtoConTrainer: UpdateTallereDto = {
        trainerId: 'trainer-2',
      };

      const nuevoTrainer = {
        ...mockTrainer,
        id: 'trainer-2',
      };

      const tallerConRelaciones = {
        ...mockTaller,
        inscripciones: [],
        feedbacks: [],
      };

      prismaService.taller.findUnique.mockResolvedValue(tallerConRelaciones as any);
      prismaService.usuario.findUnique.mockResolvedValue(nuevoTrainer as any);
      prismaService.taller.update.mockResolvedValue({
        ...mockTaller,
        trainerId: 'trainer-2',
      } as any);

      // Act
      await service.update('taller-1', updateDtoConTrainer);

      // Assert
      expect(prismaService.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'trainer-2' },
        include: { roles: { include: { rol: true } } },
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un taller exitosamente', async () => {
      // Arrange
      const tallerConRelaciones = {
        ...mockTaller,
        inscripciones: [],
        feedbacks: [],
      };

      prismaService.taller.findUnique.mockResolvedValue(tallerConRelaciones as any);
      prismaService.taller.delete.mockResolvedValue(mockTaller as any);

      // Act
      const result = await service.remove('taller-1');

      // Assert
      expect(result).toEqual(mockTaller);
      expect(prismaService.taller.delete).toHaveBeenCalledWith({
        where: { id: 'taller-1' },
      });
    });

    it('debería lanzar NotFoundException si el taller no existe al intentar eliminar', async () => {
      // Arrange
      prismaService.taller.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('taller-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.taller.delete).not.toHaveBeenCalled();
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InscripcionesController } from './inscripciones.controller';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto';

describe('InscripcionesController', () => {
  let controller: InscripcionesController;
  let inscripcionesService: jest.Mocked<InscripcionesService>;

  const mockInscripcion = {
    id: 'inscripcion-1',
    tallerId: 'taller-1',
    participanteId: 'participante-1',
    estado: 'INSCRITO',
    fechaInscripcion: new Date(),
    creadoEn: new Date(),
  };

  beforeEach(async () => {
    const mockInscripcionesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUsuarioId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscripcionesController],
      providers: [
        {
          provide: InscripcionesService,
          useValue: mockInscripcionesService,
        },
      ],
    }).compile();

    controller = module.get<InscripcionesController>(InscripcionesController);
    inscripcionesService = module.get(InscripcionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateInscripcioneDto = {
      tallerId: 'taller-1',
      participanteId: 'participante-1',
    };

    it('debería crear una inscripción exitosamente', async () => {
      // Arrange
      inscripcionesService.create.mockResolvedValue(mockInscripcion as any);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(inscripcionesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findMyInscripciones', () => {
    it('debería retornar las inscripciones del usuario autenticado', async () => {
      // Arrange
      const mockInscripciones = [mockInscripcion];
      const mockRequest = {
        user: {
          sub: 'usuario-1',
          email: 'usuario@example.com',
          roles: ['PARTICIPANTE'],
        },
      } as any;

      inscripcionesService.findByUsuarioId.mockResolvedValue(
        mockInscripciones as any,
      );

      // Act
      const result = await controller.findMyInscripciones(mockRequest);

      // Assert
      expect(result).toEqual(mockInscripciones);
      expect(inscripcionesService.findByUsuarioId).toHaveBeenCalledWith(
        'usuario-1',
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las inscripciones', async () => {
      // Arrange
      const mockInscripciones = [mockInscripcion];
      inscripcionesService.findAll.mockResolvedValue(mockInscripciones as any);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockInscripciones);
      expect(inscripcionesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería retornar una inscripción por id', async () => {
      // Arrange
      inscripcionesService.findOne.mockResolvedValue(mockInscripcion as any);

      // Act
      const result = await controller.findOne('inscripcion-1');

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(inscripcionesService.findOne).toHaveBeenCalledWith('inscripcion-1');
    });

    it('debería propagar NotFoundException si la inscripción no existe', async () => {
      // Arrange
      inscripcionesService.findOne.mockRejectedValue(
        new NotFoundException('Inscripción no encontrada'),
      );

      // Act & Assert
      await expect(controller.findOne('inscripcion-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateInscripcioneDto = {
      estado: 'FINALIZADO',
    };

    it('debería actualizar una inscripción exitosamente', async () => {
      // Arrange
      const inscripcionActualizada = {
        ...mockInscripcion,
        estado: 'FINALIZADO',
      };
      inscripcionesService.update.mockResolvedValue(
        inscripcionActualizada as any,
      );

      // Act
      const result = await controller.update('inscripcion-1', updateDto);

      // Assert
      expect(result).toEqual(inscripcionActualizada);
      expect(inscripcionesService.update).toHaveBeenCalledWith(
        'inscripcion-1',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una inscripción exitosamente', async () => {
      // Arrange
      inscripcionesService.remove.mockResolvedValue(mockInscripcion as any);

      // Act
      const result = await controller.remove('inscripcion-1');

      // Assert
      expect(result).toEqual(mockInscripcion);
      expect(inscripcionesService.remove).toHaveBeenCalledWith('inscripcion-1');
    });
  });
});


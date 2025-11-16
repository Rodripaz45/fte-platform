import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TalleresController } from './talleres.controller';
import { TalleresService } from './talleres.service';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';

describe('TalleresController', () => {
  let controller: TalleresController;
  let talleresService: jest.Mocked<TalleresService>;

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
  };

  beforeEach(async () => {
    const mockTalleresService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllByTrainerId: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TalleresController],
      providers: [
        {
          provide: TalleresService,
          useValue: mockTalleresService,
        },
      ],
    }).compile();

    controller = module.get<TalleresController>(TalleresController);
    talleresService = module.get(TalleresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      // Arrange
      talleresService.create.mockResolvedValue(mockTaller as any);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockTaller);
      expect(talleresService.create).toHaveBeenCalledWith(createDto);
      expect(talleresService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los talleres para ADMIN', async () => {
      // Arrange
      const mockTalleres = [mockTaller];
      const mockRequest = {
        user: {
          sub: 'admin-1',
          email: 'admin@example.com',
          roles: ['ADMIN'],
        },
      } as any;

      talleresService.findAll.mockResolvedValue(mockTalleres as any);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(result).toEqual(mockTalleres);
      expect(talleresService.findAll).toHaveBeenCalled();
      expect(talleresService.findAllByTrainerId).not.toHaveBeenCalled();
    });

    it('debería filtrar por trainerId para TRAINER', async () => {
      // Arrange
      const mockTalleres = [mockTaller];
      const mockRequest = {
        user: {
          sub: 'trainer-1',
          email: 'trainer@example.com',
          roles: ['TRAINER'],
        },
      } as any;

      talleresService.findAllByTrainerId.mockResolvedValue(mockTalleres as any);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(result).toEqual(mockTalleres);
      expect(talleresService.findAllByTrainerId).toHaveBeenCalledWith('trainer-1');
      expect(talleresService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería retornar un taller por id', async () => {
      // Arrange
      talleresService.findOne.mockResolvedValue(mockTaller as any);

      // Act
      const result = await controller.findOne('taller-1');

      // Assert
      expect(result).toEqual(mockTaller);
      expect(talleresService.findOne).toHaveBeenCalledWith('taller-1');
    });

    it('debería propagar NotFoundException si el taller no existe', async () => {
      // Arrange
      talleresService.findOne.mockRejectedValue(
        new NotFoundException('Taller no encontrado'),
      );

      // Act & Assert
      await expect(controller.findOne('taller-inexistente')).rejects.toThrow(
        NotFoundException,
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
      talleresService.update.mockResolvedValue(tallerActualizado as any);

      // Act
      const result = await controller.update('taller-1', updateDto);

      // Assert
      expect(result).toEqual(tallerActualizado);
      expect(talleresService.update).toHaveBeenCalledWith('taller-1', updateDto);
    });
  });

  describe('remove', () => {
    it('debería eliminar un taller exitosamente', async () => {
      // Arrange
      talleresService.remove.mockResolvedValue(mockTaller as any);

      // Act
      const result = await controller.remove('taller-1');

      // Assert
      expect(result).toEqual(mockTaller);
      expect(talleresService.remove).toHaveBeenCalledWith('taller-1');
    });

    it('debería propagar NotFoundException si el taller no existe', async () => {
      // Arrange
      talleresService.remove.mockRejectedValue(
        new NotFoundException('Taller no encontrado'),
      );

      // Act & Assert
      await expect(controller.remove('taller-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});


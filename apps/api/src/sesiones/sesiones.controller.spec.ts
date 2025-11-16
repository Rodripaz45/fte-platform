import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SesionesController } from './sesiones.controller';
import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { GenerarQRDto } from './dto/generar-qr.dto';
import { ValidarQRDto } from './dto/validar-qr.dto';

describe('SesionesController', () => {
  let controller: SesionesController;
  let sesionesService: jest.Mocked<SesionesService>;

  const mockSesion = {
    id: 'sesion-1',
    tallerId: 'taller-1',
    fecha: new Date('2024-01-15'),
    horaInicio: new Date('2024-01-15T10:00:00'),
    horaFin: new Date('2024-01-15T12:00:00'),
    tema: 'Introducción al Marketing',
    descripcion: 'Primera sesión del taller',
    codigoQR: 'QR-12345',
    qrValido: true,
    qrExpiracion: new Date('2024-01-15T12:30:00'),
    creadoEn: new Date(),
  };

  beforeEach(async () => {
    const mockSesionesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      generarQR: jest.fn(),
      validarQR: jest.fn(),
      regenerarQR: jest.fn(),
      invalidarQR: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SesionesController],
      providers: [
        {
          provide: SesionesService,
          useValue: mockSesionesService,
        },
      ],
    }).compile();

    controller = module.get<SesionesController>(SesionesController);
    sesionesService = module.get(SesionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSesionDto = {
      tallerId: 'taller-1',
      fecha: '2024-01-15',
      horaInicio: '10:00',
      horaFin: '12:00',
      tema: 'Introducción al Marketing',
      descripcion: 'Primera sesión del taller',
    };

    it('debería crear una sesión exitosamente', async () => {
      // Arrange
      sesionesService.create.mockResolvedValue(mockSesion as any);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockSesion);
      expect(sesionesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las sesiones sin filtros', async () => {
      // Arrange
      const mockSesiones = [mockSesion];
      sesionesService.findAll.mockResolvedValue(mockSesiones as any);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockSesiones);
      expect(sesionesService.findAll).toHaveBeenCalledWith({
        tallerId: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('debería filtrar por tallerId cuando se proporciona', async () => {
      // Arrange
      const mockSesiones = [mockSesion];
      sesionesService.findAll.mockResolvedValue(mockSesiones as any);

      // Act
      const result = await controller.findAll('taller-1');

      // Assert
      expect(result).toEqual(mockSesiones);
      expect(sesionesService.findAll).toHaveBeenCalledWith({
        tallerId: 'taller-1',
        page: undefined,
        pageSize: undefined,
      });
    });

    it('debería aplicar paginación cuando se proporcionan page y pageSize', async () => {
      // Arrange
      const mockSesiones = [mockSesion];
      sesionesService.findAll.mockResolvedValue(mockSesiones as any);

      // Act
      const result = await controller.findAll(undefined, '1', '10');

      // Assert
      expect(result).toEqual(mockSesiones);
      expect(sesionesService.findAll).toHaveBeenCalledWith({
        tallerId: undefined,
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar una sesión por id', async () => {
      // Arrange
      sesionesService.findOne.mockResolvedValue(mockSesion as any);

      // Act
      const result = await controller.findOne('sesion-1');

      // Assert
      expect(result).toEqual(mockSesion);
      expect(sesionesService.findOne).toHaveBeenCalledWith('sesion-1');
    });

    it('debería propagar NotFoundException si la sesión no existe', async () => {
      // Arrange
      sesionesService.findOne.mockRejectedValue(
        new NotFoundException('Sesión no encontrada'),
      );

      // Act & Assert
      await expect(controller.findOne('sesion-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateSesionDto = {
      tema: 'Marketing Avanzado',
    };

    it('debería actualizar una sesión exitosamente', async () => {
      // Arrange
      const sesionActualizada = {
        ...mockSesion,
        tema: 'Marketing Avanzado',
      };
      sesionesService.update.mockResolvedValue(sesionActualizada as any);

      // Act
      const result = await controller.update('sesion-1', updateDto);

      // Assert
      expect(result).toEqual(sesionActualizada);
      expect(sesionesService.update).toHaveBeenCalledWith('sesion-1', updateDto);
    });
  });

  describe('remove', () => {
    it('debería eliminar una sesión exitosamente', async () => {
      // Arrange
      sesionesService.remove.mockResolvedValue(mockSesion as any);

      // Act
      const result = await controller.remove('sesion-1');

      // Assert
      expect(result).toEqual(mockSesion);
      expect(sesionesService.remove).toHaveBeenCalledWith('sesion-1');
    });
  });

  describe('generarQR', () => {
    const generarQRDto: GenerarQRDto = {
      sesionId: 'sesion-1',
      duracionMinutos: 30,
    };

    it('debería generar un código QR exitosamente', async () => {
      // Arrange
      const qrResult = {
        codigoQR: 'QR-12345',
        qrDataURL: 'data:image/png;base64,...',
        qrExpiracion: new Date('2024-01-15T12:30:00'),
      };
      sesionesService.generarQR.mockResolvedValue(qrResult as any);

      // Act
      const result = await controller.generarQR(generarQRDto);

      // Assert
      expect(result).toEqual(qrResult);
      expect(sesionesService.generarQR).toHaveBeenCalledWith(generarQRDto);
    });
  });

  describe('validarQR', () => {
    const validarQRDto: ValidarQRDto = {
      codigoQR: 'QR-12345',
    };

    it('debería validar un código QR exitosamente', async () => {
      // Arrange
      const validacionResult = {
        valido: true,
        sesion: mockSesion,
      };
      sesionesService.validarQR.mockResolvedValue(validacionResult as any);

      // Act
      const result = await controller.validarQR(validarQRDto);

      // Assert
      expect(result).toEqual(validacionResult);
      expect(sesionesService.validarQR).toHaveBeenCalledWith(validarQRDto);
    });
  });

  describe('getSesionByQR', () => {
    it('debería obtener información de sesión por código QR', async () => {
      // Arrange
      const validacionResult = {
        valido: true,
        sesion: mockSesion,
      };
      sesionesService.validarQR.mockResolvedValue(validacionResult as any);

      // Act
      const result = await controller.getSesionByQR('QR-12345');

      // Assert
      expect(result).toEqual(validacionResult);
      expect(sesionesService.validarQR).toHaveBeenCalledWith({
        codigoQR: 'QR-12345',
      });
    });
  });

  describe('regenerarQR', () => {
    it('debería regenerar un código QR exitosamente', async () => {
      // Arrange
      const qrResult = {
        codigoQR: 'QR-NEW-12345',
        qrDataURL: 'data:image/png;base64,...',
        qrExpiracion: new Date('2024-01-15T13:00:00'),
      };
      sesionesService.regenerarQR.mockResolvedValue(qrResult as any);

      // Act
      const result = await controller.regenerarQR('sesion-1', 60);

      // Assert
      expect(result).toEqual(qrResult);
      expect(sesionesService.regenerarQR).toHaveBeenCalledWith('sesion-1', 60);
    });

    it('debería regenerar QR sin duración específica', async () => {
      // Arrange
      const qrResult = {
        codigoQR: 'QR-NEW-12345',
        qrDataURL: 'data:image/png;base64,...',
        qrExpiracion: new Date('2024-01-15T12:30:00'),
      };
      sesionesService.regenerarQR.mockResolvedValue(qrResult as any);

      // Act
      const result = await controller.regenerarQR('sesion-1');

      // Assert
      expect(result).toEqual(qrResult);
      expect(sesionesService.regenerarQR).toHaveBeenCalledWith('sesion-1', undefined);
    });
  });

  describe('invalidarQR', () => {
    it('debería invalidar un código QR exitosamente', async () => {
      // Arrange
      const sesionInvalidada = {
        ...mockSesion,
        qrValido: false,
      };
      sesionesService.invalidarQR.mockResolvedValue(sesionInvalidada as any);

      // Act
      const result = await controller.invalidarQR('sesion-1');

      // Assert
      expect(result).toEqual(sesionInvalidada);
      expect(sesionesService.invalidarQR).toHaveBeenCalledWith('sesion-1');
    });
  });
});


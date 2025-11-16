import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    // Crear mock de AuthService
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    // Limpiar todos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    it('debería registrar un usuario exitosamente', async () => {
      // Arrange
      const expectedResult = { access_token: 'mock-token' };
      authService.register.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(
        registerDto.nombre,
        registerDto.email,
        registerDto.password,
        undefined,
      );
    });

    it('debería registrar un usuario con rol específico', async () => {
      // Arrange
      const registerDtoConRol: RegisterDto = {
        ...registerDto,
        rol: 'TRAINER',
      };
      const expectedResult = { access_token: 'mock-token' };
      authService.register.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.register(registerDtoConRol);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(
        registerDtoConRol.nombre,
        registerDtoConRol.email,
        registerDtoConRol.password,
        'TRAINER',
      );
    });

    it('debería propagar BadRequestException si el email ya existe', async () => {
      // Arrange
      authService.register.mockRejectedValue(
        new BadRequestException('El email ya está registrado'),
      );

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.register(registerDto)).rejects.toThrow(
        'El email ya está registrado',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'juan@example.com',
      password: 'password123',
    };

    it('debería hacer login exitosamente', async () => {
      // Arrange
      const expectedResult = { access_token: 'mock-token' };
      authService.login.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('debería propagar UnauthorizedException si las credenciales son inválidas', async () => {
      // Arrange
      authService.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });
  });
});

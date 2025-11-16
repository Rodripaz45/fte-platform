# Guía de Pruebas Unitarias para el Backend

Esta guía explica cómo escribir y ejecutar pruebas unitarias para los servicios del backend en NestJS.

## 📋 Tabla de Contenidos

1. [Configuración](#configuración)
2. [Estructura de una Prueba](#estructura-de-una-prueba)
3. [Mocking de Dependencias](#mocking-de-dependencias)
4. [Patrones Comunes](#patrones-comunes)
5. [Ejecutar Pruebas](#ejecutar-pruebas)
6. [Mejores Prácticas](#mejores-prácticas)

## ⚙️ Configuración

El proyecto ya está configurado con:
- **Jest**: Framework de testing
- **@nestjs/testing**: Utilidades de testing para NestJS
- **ts-jest**: Compilador TypeScript para Jest

La configuración está en `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "testEnvironment": "node"
  }
}
```

## 📝 Estructura de una Prueba

### Archivo de Prueba

Los archivos de prueba deben terminar en `.spec.ts` y estar en la misma carpeta que el archivo que están probando.

**Ejemplo**: `talleres.service.ts` → `talleres.service.spec.ts`

### Estructura Básica

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TuService } from './tu.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TuService', () => {
  let service: TuService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    // Configuración antes de cada prueba
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TuService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Mock del servicio
        },
      ],
    }).compile();

    service = module.get<TuService>(TuService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    // Limpiar mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('métodoEspecifico', () => {
    it('debería hacer algo específico', async () => {
      // Arrange: Configurar datos y mocks
      // Act: Ejecutar el método
      // Assert: Verificar el resultado
    });
  });
});
```

### Patrón Arrange-Act-Assert (AAA)

```typescript
it('debería crear un usuario', async () => {
  // ARRANGE: Preparar el entorno
  const dto = { nombre: 'Juan', email: 'juan@example.com' };
  prismaService.usuario.create.mockResolvedValue({
    id: '1',
    ...dto,
  } as any);

  // ACT: Ejecutar la acción
  const result = await service.create(dto);

  // ASSERT: Verificar el resultado
  expect(result).toHaveProperty('id');
  expect(prismaService.usuario.create).toHaveBeenCalledWith({
    data: dto,
  });
});
```

## 🎭 Mocking de Dependencias

### Mock de PrismaService

```typescript
const mockPrismaService = {
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  taller: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // ... otros modelos
};
```

### Mock de Otros Servicios

```typescript
const mockNotificacionesService = {
  crearNotificacion: jest.fn(),
  marcarComoLeida: jest.fn(),
};

// En el módulo de prueba:
{
  provide: NotificacionesService,
  useValue: mockNotificacionesService,
}
```

### Configurar Valores de Retorno

```typescript
// Retornar un valor específico
prismaService.usuario.findUnique.mockResolvedValue({
  id: '1',
  nombre: 'Juan',
} as any);

// Retornar null
prismaService.usuario.findUnique.mockResolvedValue(null);

// Lanzar un error
prismaService.usuario.create.mockRejectedValue(
  new Error('Error de base de datos')
);

// Retornar diferentes valores en llamadas consecutivas
prismaService.inscripcion.count
  .mockResolvedValueOnce(10)
  .mockResolvedValueOnce(20);
```

## 🔧 Patrones Comunes

### Probar Excepciones

```typescript
it('debería lanzar NotFoundException si no existe', async () => {
  prismaService.taller.findUnique.mockResolvedValue(null);

  await expect(service.findOne('id-inexistente')).rejects.toThrow(
    NotFoundException
  );
  await expect(service.findOne('id-inexistente')).rejects.toThrow(
    'Taller no encontrado'
  );
});
```

### Probar Validaciones

```typescript
it('debería validar que fechaInicio < fechaFin', async () => {
  const dto = {
    fechaInicio: '2024-01-31',
    fechaFin: '2024-01-01',
  };

  await expect(service.create(dto)).rejects.toThrow(BadRequestException);
});
```

### Probar Llamadas a Métodos

```typescript
it('debería llamar a prisma con los parámetros correctos', async () => {
  await service.create(dto);

  expect(prismaService.taller.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      tema: dto.tema,
      modalidad: dto.modalidad,
    }),
  });
  expect(prismaService.taller.create).toHaveBeenCalledTimes(1);
});
```

### Probar Transformaciones de Datos

```typescript
it('debería calcular cupos disponibles correctamente', async () => {
  prismaService.taller.findMany.mockResolvedValue([
    { id: '1', cupos: 30 },
  ] as any);
  prismaService.inscripcion.count.mockResolvedValue(10);

  const result = await service.findAll();

  expect(result[0].cuposDisponibles).toBe(20); // 30 - 10
  expect(result[0].cuposOcupados).toBe(10);
});
```

## 🚀 Ejecutar Pruebas

### Comandos Disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar con cobertura de código
npm run test:cov

# Ejecutar solo un archivo específico
npm test talleres.service

# Ejecutar pruebas que coincidan con un patrón
npm test -- -t "debería crear"

# Ejecutar en modo debug
npm run test:debug
```

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas unitarias (archivos .spec.ts)
npm test

# Solo pruebas e2e
npm run test:e2e
```

## ✅ Mejores Prácticas

### 1. Nombres Descriptivos

```typescript
// ❌ Mal
it('test 1', () => {});

// ✅ Bien
it('debería crear un taller cuando se proporcionan datos válidos', () => {});
```

### 2. Una Aserción por Prueba (cuando sea posible)

```typescript
// ✅ Bien: Prueba enfocada
it('debería retornar el taller encontrado', async () => {
  const result = await service.findOne('id');
  expect(result).toEqual(mockTaller);
});

// ✅ También bien: Múltiples aserciones relacionadas
it('debería validar todos los campos requeridos', async () => {
  expect(dto.tema).toBeDefined();
  expect(dto.modalidad).toBeDefined();
  expect(dto.trainerId).toBeDefined();
});
```

### 3. Usar `describe` para Agrupar Pruebas

```typescript
describe('TalleresService', () => {
  describe('create', () => {
    it('debería crear exitosamente', () => {});
    it('debería validar trainer', () => {});
  });

  describe('findAll', () => {
    it('debería retornar todos los talleres', () => {});
    it('debería calcular cupos', () => {});
  });
});
```

### 4. Limpiar Mocks

```typescript
afterEach(() => {
  jest.clearAllMocks(); // Limpia llamadas y valores de retorno
});
```

### 5. Datos de Prueba Reutilizables

```typescript
describe('TalleresService', () => {
  const mockTrainer = {
    id: 'trainer-1',
    nombre: 'Juan Trainer',
    estado: 'ACTIVO',
  };

  // Usar en múltiples pruebas
  it('prueba 1', () => {
    prismaService.usuario.findUnique.mockResolvedValue(mockTrainer);
  });
});
```

### 6. Probar Casos Límite

```typescript
it('debería manejar null correctamente', () => {});
it('debería manejar arrays vacíos', () => {});
it('debería manejar valores extremos', () => {});
```

### 7. Aislar Pruebas

Cada prueba debe ser independiente y no depender del estado de otras pruebas.

```typescript
// ❌ Mal: Depende del estado anterior
it('prueba 1', () => {
  service.contador = 5;
});

it('prueba 2', () => {
  expect(service.contador).toBe(5); // Depende de prueba 1
});

// ✅ Bien: Cada prueba es independiente
it('prueba 1', () => {
  service.contador = 5;
  expect(service.contador).toBe(5);
});

it('prueba 2', () => {
  service.contador = 0;
  expect(service.contador).toBe(0);
});
```

## 📚 Ejemplos Completos

Ver el archivo `talleres.service.spec.ts` para un ejemplo completo de pruebas unitarias que incluye:

- Mocking de PrismaService
- Mocking de otros servicios
- Pruebas de casos exitosos
- Pruebas de validaciones
- Pruebas de excepciones
- Pruebas de transformaciones de datos

## 🔍 Cobertura de Código

Para ver qué partes del código están cubiertas por pruebas:

```bash
npm run test:cov
```

Esto generará un reporte en la carpeta `coverage/`. Abre `coverage/index.html` en tu navegador para ver un reporte visual.

**Objetivo**: Intentar alcanzar al menos 70-80% de cobertura en servicios críticos.

## 🐛 Debugging

Para depurar pruebas:

```bash
npm run test:debug
```

Luego conecta tu debugger a `localhost:9229`.

O usa `console.log` temporalmente:

```typescript
it('debug test', async () => {
  const result = await service.create(dto);
  console.log('Result:', JSON.stringify(result, null, 2));
});
```

## 📖 Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Testing en NestJS](https://docs.nestjs.com/fundamentals/testing)
- [Mock Functions en Jest](https://jestjs.io/docs/mock-functions)


# 🌱 Seeder de Datos para FTE Platform

## 📋 Descripción

Este seeder crea datos realistas para la plataforma FTE, incluyendo:

- ✅ **1 Administrador**
- 👨‍🏫 **4 Trainers/Facilitadores**
- 👥 **10 Participantes**
- 📚 **6 Talleres** (en diferentes estados)
- 📅 **23 Sesiones** distribuidas en los talleres
- ✍️ **26 Inscripciones**
- ✅ **Asistencias** para talleres en curso y finalizados
- ⭐ **Retroalimentaciones** para talleres completados
- 📄 **5 CVs** con texto de ejemplo
- 🎯 **8 Competencias** con perfiles asignados

## 🚀 Cómo Usar

### Opción 1: Ejecutar el Seeder Realista (RECOMENDADO)

```bash
cd apps/api
npm run prisma:seed-realista
```

### Opción 2: Ejecutar el Seeder Original (Datos Demo Básicos)

```bash
cd apps/api
npm run prisma:seed
```

## ⚠️ IMPORTANTE

**Este seeder eliminará todos los datos existentes** antes de crear los nuevos. Úsalo solo en:
- Desarrollo local
- Ambiente de pruebas
- **NUNCA en producción**

## 🔐 Credenciales de Acceso

Todos los usuarios tienen la contraseña: **`password123`**

### Administrador
- **Email**: `admin@fte.bo`
- **Rol**: ADMIN

### Trainers/Facilitadores

| Nombre | Email | Especialidad |
|--------|-------|--------------|
| María González | maria.gonzalez@fte.bo | Marketing Digital |
| Carlos Mendoza | carlos.mendoza@fte.bo | Desarrollo de Negocios |
| Ana Rojas | ana.rojas@fte.bo | Finanzas y Contabilidad |
| Luis Vargas | luis.vargas@fte.bo | Liderazgo y Gestión |

### Participantes

| Nombre | Email | CI |
|--------|-------|-----|
| Juan Pérez Mamani | juan.perez@gmail.com | 7845123 |
| Sofía Quispe Laura | sofia.quispe@gmail.com | 8956234 |
| Roberto Flores Condori | roberto.flores@gmail.com | 6734512 |
| Carla Mamani Ticona | carla.mamani@gmail.com | 9123456 |
| Diego Apaza Cruz | diego.apaza@gmail.com | 8234567 |
| Valentina Choque Nina | valentina.choque@gmail.com | 7456789 |
| Andrés Huanca Poma | andres.huanca@gmail.com | 8567890 |
| Lucía Condori Yujra | lucia.condori@gmail.com | 9678901 |
| Fernando Mamani Quispe | fernando.mamani@gmail.com | 7789012 |
| Isabella Cruz Flores | isabella.cruz@gmail.com | 8890123 |

## 📚 Talleres Creados

### 1. Marketing Digital y Redes Sociales
- **Estado**: EN_CURSO
- **Modalidad**: PRESENCIAL
- **Sede**: Sede Central - La Paz
- **Trainer**: María González
- **Sesiones**: 6 (una por semana)
- **Participantes**: 8 inscritos
- **Asistencias**: Registradas para las primeras 3 sesiones

### 2. Desarrollo de Plan de Negocios
- **Estado**: PROGRAMADO
- **Modalidad**: VIRTUAL
- **Sede**: Plataforma Zoom
- **Trainer**: Carlos Mendoza
- **Sesiones**: 5
- **Participantes**: 6 inscritos

### 3. Contabilidad Básica para Emprendedores
- **Estado**: EN_CURSO
- **Modalidad**: HIBRIDO
- **Sede**: Sede El Alto
- **Trainer**: Ana Rojas
- **Sesiones**: 8 (dos veces por semana)
- **Participantes**: 5 inscritos
- **Asistencias**: Registradas para las primeras 4 sesiones

### 4. Liderazgo y Gestión de Equipos
- **Estado**: PROGRAMADO
- **Modalidad**: PRESENCIAL
- **Sede**: Sede Cochabamba
- **Trainer**: Luis Vargas
- **Participantes**: Sin inscripciones aún

### 5. Estrategias de Ventas y Atención al Cliente
- **Estado**: FINALIZADO ✅
- **Modalidad**: PRESENCIAL
- **Sede**: Sede Santa Cruz
- **Trainer**: María González
- **Sesiones**: 4 (todas completadas)
- **Participantes**: 7 inscritos (estado: FINALIZADO)
- **Asistencias**: Todas registradas
- **Retroalimentaciones**: 7 feedbacks con puntajes 4-5

### 6. Gestión Financiera Personal
- **Estado**: EN_CURSO
- **Modalidad**: VIRTUAL
- **Sede**: Plataforma Google Meet
- **Trainer**: Ana Rojas
- **Participantes**: Sin inscripciones aún

## 🎯 Competencias Creadas

1. Comunicación Efectiva (Habilidades Blandas)
2. Trabajo en Equipo (Habilidades Blandas)
3. Liderazgo (Habilidades Blandas)
4. Marketing Digital (Habilidades Técnicas)
5. Gestión Financiera (Habilidades Técnicas)
6. Ventas (Habilidades Técnicas)
7. Atención al Cliente (Habilidades Técnicas)
8. Planificación (Habilidades Blandas)

## 📊 Estadísticas de Asistencia

- **Taller 1 (Marketing Digital)**: ~80% de asistencia
- **Taller 3 (Contabilidad)**: ~85% de asistencia
- **Taller 5 (Ventas - Finalizado)**: ~75% de asistencia

## 🔧 Solución de Problemas

### Error: "Cannot find module 'bcrypt'"

```bash
cd apps/api
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### Error: "Database connection failed"

Verifica que tu archivo `.env` tenga la variable `DATABASE_URL` correctamente configurada:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

### Limpiar la base de datos antes del seed

Si quieres empezar desde cero:

```bash
cd apps/api
npx prisma migrate reset
npm run prisma:seed-realista
```

⚠️ **CUIDADO**: Esto eliminará TODOS los datos de la base de datos.

## 📝 Personalización

Si quieres modificar los datos del seeder, edita el archivo `seed-realista.ts`:

- **Agregar más participantes**: Modifica el array `participantesData`
- **Agregar más talleres**: Modifica el array `talleresData`
- **Cambiar fechas**: Ajusta las fechas en las secciones de sesiones
- **Modificar competencias**: Edita el array `competenciasData`

## 🎨 Casos de Uso

Este seeder es perfecto para:

✅ **Desarrollo**: Tener datos realistas para probar funcionalidades
✅ **Demos**: Mostrar la plataforma con datos que se ven profesionales
✅ **Testing**: Probar flujos completos con múltiples usuarios
✅ **Capacitación**: Entrenar a nuevos usuarios del sistema
✅ **QA**: Realizar pruebas de calidad con escenarios realistas

## 📞 Soporte

Si tienes problemas con el seeder:

1. Verifica que la base de datos esté corriendo
2. Asegúrate de que las migraciones estén aplicadas: `npx prisma migrate dev`
3. Revisa los logs del seeder para ver el error específico
4. Verifica que todas las dependencias estén instaladas: `npm install`

---

**Última actualización**: 18 de noviembre de 2025


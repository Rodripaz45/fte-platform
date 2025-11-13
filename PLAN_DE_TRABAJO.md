# Plan de Trabajo - Plataforma de Gestión de Talleres FTE
## Funcionalidades Faltantes según Documento de Trabajo de Grado

**Fecha de creación:** 2025-01-XX  
**Estado:** En progreso  
**Última actualización:** 2025-01-XX

---

## 📋 Índice

1. [Requerimientos Funcionales Faltantes](#requerimientos-funcionales-faltantes)
2. [Historias de Usuario Faltantes](#historias-de-usuario-faltantes)
3. [Funcionalidades Adicionales](#funcionalidades-adicionales)
4. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
5. [Documentación Faltante](#documentación-faltante)
6. [Orden de Implementación Recomendado](#orden-de-implementación-recomendado)
7. [Seguimiento de Progreso](#seguimiento-de-progreso)

---

## 🔴 Requerimientos Funcionales Faltantes

### Prioridad M (Must) - Críticos

#### ✅ RF-01: Gestión de talleres
- **Estado:** ✅ COMPLETADO
- **Descripción:** Crear, editar, publicar y cerrar talleres (tema, modalidad, cupos, fechas, sede)
- **Evidencia:** Módulo `TalleresModule` implementado

#### ✅ RF-02: Gestión de sesiones
- **Estado:** ✅ COMPLETADO
- **Descripción:** Definir sesiones por taller (fechas/horarios) y asignar responsables (capacitadores)
- **Evidencia:** Módulo `SesionesModule` implementado

#### ✅ RF-03: Inscripción en línea
- **Estado:** ✅ COMPLETADO
- **Descripción:** Registro de participantes vía formulario web; validaciones y confirmación de cupos
- **Evidencia:** Módulo `InscripcionesModule` implementado

#### ⚠️ RF-05: Deduplicación/validación
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Detección de duplicados e inconsistencias antes de confirmar listas
- **Implementado:**
  - ✅ Campo `dedupe_hash` en modelo `Inscripcion`
- **Falta implementar:**
  - ❌ Lógica de detección automática de duplicados
  - ❌ Interfaz para revisar y resolver duplicados
  - ❌ Historial de decisiones de deduplicación
  - ❌ Algoritmo de comparación (nombre, email, documento)
- **Archivos a modificar:**
  - `apps/api/src/inscripciones/inscripciones.service.ts`
  - `apps/api/src/inscripciones/inscripciones.controller.ts`
  - `apps/web/src/components/dashboard/DuplicadosView.tsx` (nuevo)
- **Historia de usuario relacionada:** HS-A03

#### ⚠️ RF-06: Control de asistencia
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Registro digital por sesión (lista/QR/código) y evidencias en modalidad virtual
- **Implementado:**
  - ✅ Registro manual de asistencia por sesión
  - ✅ Estados: PRESENTE, AUSENTE, TARDE
  - ✅ Modelo `EvidenciaAsistencia` en BD
- **Falta implementar:**
  - ❌ Generación de códigos QR para sesiones
  - ❌ Validación de códigos QR por participantes
  - ❌ Registro de asistencia mediante escaneo de QR
  - ❌ Códigos de acceso temporales para sesiones virtuales
- **Archivos a modificar:**
  - `apps/api/src/sesiones/sesiones.service.ts`
  - `apps/api/src/sesiones/sesiones.controller.ts`
  - `apps/web/src/components/dashboard/AsistenciasView.tsx`
  - `apps/web/src/components/dashboard/QRScanner.tsx` (nuevo)
- **Dependencias:** Librería para generar QR (qrcode)

#### ✅ RF-07: Retroalimentación pos-taller
- **Estado:** ✅ COMPLETADO
- **Descripción:** Recolección de encuestas web vinculadas a taller/sesión y participante
- **Evidencia:** Módulo `FeedbackModule` implementado

#### ✅ RF-08: Gestión de participantes
- **Estado:** ✅ COMPLETADO
- **Descripción:** Administración de perfiles, historial y estado (activo/inactivo)
- **Evidencia:** Módulo `ParticipantesModule` implementado

#### ✅ RF-09: Perfiles por competencias (IA)
- **Estado:** ✅ COMPLETADO
- **Descripción:** Generar/actualizar un perfil a partir de CV, encuestas y participación
- **Evidencia:** Módulo `IaModule` implementado

#### ❌ RF-10: Dashboards y reportes
- **Estado:** ❌ NO IMPLEMENTADO
- **Descripción:** Indicadores (asistencia, satisfacción, recurrencia, cobertura) y exportes (CSV/PDF)
- **Prioridad:** 🔴 CRÍTICA
- **Falta implementar:**
  - ❌ Endpoints para KPIs:
    - Tasa de asistencia por taller
    - Satisfacción promedio por taller
    - Tasa de recurrencia de participantes
    - Cobertura (participantes únicos)
  - ❌ Visualizaciones (gráficos):
    - Gráfico de barras: asistencia por taller
    - Gráfico de líneas: tendencia de inscripciones
    - Gráfico circular: distribución por modalidad
    - Gráfico de satisfacción
  - ❌ Exportación CSV/PDF:
    - Reporte de asistencia
    - Reporte de satisfacción
    - Reporte de inscripciones
    - Dashboard ejecutivo
  - ❌ Filtros:
    - Por periodo (fecha inicio - fecha fin)
    - Por modalidad
    - Por taller
    - Por participante
- **Archivos a crear/modificar:**
  - `apps/api/src/reportes/reportes.service.ts` (completar)
  - `apps/api/src/reportes/reportes.controller.ts` (completar)
  - `apps/web/src/components/dashboard/ReportesView.tsx` (nuevo)
  - `apps/web/src/components/dashboard/DashboardEjecutivo.tsx` (nuevo)
- **Dependencias:** 
  - Librería para gráficos (recharts, chart.js)
  - Librería para PDF (jsPDF, pdfkit)
- **Historia de usuario relacionada:** HS-D01

#### ✅ RF-11: Usuarios y roles (RBAC)
- **Estado:** ✅ COMPLETADO
- **Descripción:** Administración de usuarios (Administrador, Capacitador, Participante) y permisos
- **Evidencia:** Sistema de autenticación y autorización implementado

#### ❌ RF-12: Notificaciones
- **Estado:** ❌ NO IMPLEMENTADO
- **Descripción:** Recordatorios/confirmaciones por correo y notificación web
- **Prioridad:** 🟡 IMPORTANTE
- **Modelo existente:** ✅ `Notificacion` en BD
- **Falta implementar:**
  - ❌ Módulo de notificaciones completo:
    - `apps/api/src/notificaciones/notificaciones.module.ts` (nuevo)
    - `apps/api/src/notificaciones/notificaciones.service.ts` (nuevo)
    - `apps/api/src/notificaciones/notificaciones.controller.ts` (nuevo)
  - ❌ Integración con servicio de email (SMTP):
    - Configuración de SMTP (Nodemailer)
    - Plantillas de email
    - Envío de recordatorios automáticos
  - ❌ Notificaciones in-app:
    - Vista de notificaciones en frontend
    - Marcar como leída/no leída
    - Historial de notificaciones
  - ❌ Triggers automáticos:
    - Recordatorio de sesión (24h antes)
    - Confirmación de inscripción
    - Notificación de nuevo taller disponible
    - Recordatorio de encuesta pendiente
- **Archivos a crear:**
  - `apps/api/src/notificaciones/` (módulo completo)
  - `apps/web/src/components/dashboard/NotificacionesView.tsx` (nuevo)
  - `apps/web/src/lib/api/notificaciones.ts` (nuevo)
- **Dependencias:** Nodemailer, plantillas de email
- **Historia de usuario relacionada:** HS-A08

#### ✅ RF-13: Ingesta de CV y extracción de texto
- **Estado:** ✅ COMPLETADO
- **Descripción:** Carga de CV (PDF/DOCX), extracción/normalización de texto y almacenamiento de metadatos seguros
- **Evidencia:** Integración con Firebase Storage y OpenAI para extracción

#### ❌ RF-14: Catálogo/diccionario de competencias
- **Estado:** ❌ ELIMINADO DEL ALCANCE
- **Descripción:** Gestión de catálogo de competencias y sinónimos; mapeo taller→competencia con pesos editables por administrador
- **Nota:** Este requerimiento ha sido eliminado del alcance del proyecto

#### ✅ RF-15: Cálculo y trazabilidad del perfil
- **Estado:** ✅ COMPLETADO
- **Descripción:** Cómputo de score (0–100), nivel (0..5) y confianza (0..1) por competencia; registro de evidencias y recalcular bajo demanda
- **Evidencia:** Módulo de IA implementado con cálculo de competencias

---

### Prioridad S (Should) - Importantes

#### ❌ RF-04: Importación de listas
- **Estado:** ❌ NO IMPLEMENTADO
- **Descripción:** Cargar listas de UEs (CSV/Excel) y unificar con inscripciones web
- **Prioridad:** 🟡 IMPORTANTE
- **Falta implementar:**
  - ❌ Endpoint para subir archivos CSV/Excel:
    - Validación de formato
    - Parsing de archivos
    - Mapeo de columnas
  - ❌ Previsualización de datos:
    - Mostrar primeras filas
    - Validar campos obligatorios
    - Detectar posibles errores
  - ❌ Consolidación con inscripciones web:
    - Detectar duplicados
    - Unificar datos
    - Generar reporte de carga
  - ❌ Interfaz de importación:
    - Selector de archivo
    - Mapeo de columnas
    - Vista previa
    - Confirmación de importación
- **Archivos a crear/modificar:**
  - `apps/api/src/inscripciones/inscripciones.service.ts` (extender)
  - `apps/api/src/inscripciones/inscripciones.controller.ts` (extender)
  - `apps/web/src/components/dashboard/ImportarListasView.tsx` (nuevo)
- **Dependencias:** 
  - Librería para CSV (papaparse)
  - Librería para Excel (xlsx, exceljs)
- **Historia de usuario relacionada:** HS-A02

---

## 📝 Historias de Usuario Faltantes

### Prioridad Alta

#### ❌ HS-D01: Dashboard ejecutivo
- **Estado:** ❌ NO IMPLEMENTADO
- **Como:** Dirección / Administrador
- **Quiero:** Consultar indicadores y exportar reportes
- **Para poder:** Evaluar el impacto de los talleres y tomar decisiones
- **Validación:**
  - ❌ Seleccionar periodo, modalidad y filtros relevantes
  - ❌ Visualizar indicadores (asistencia, satisfacción, recurrencia) y gráficos
  - ❌ Exportar reportes en CSV/PDF con los filtros aplicados
  - ❌ Registrar en bitácora quién exporta, qué reporta y cuándo lo hace
- **Relacionado con:** RF-10

#### ⚠️ HS-C02: Adjuntar evidencia en sesiones virtuales
- **Estado:** ⚠️ PARCIAL
- **Como:** Capacitador
- **Quiero:** Adjuntar evidencias al registrar asistencia en modalidad virtual
- **Para poder:** Respaldar la verificación de asistencia
- **Validación:**
  - ⚠️ Cargar archivos permitidos (PDF/JPG/PNG) con tamaño máximo definido (modelo existe)
  - ❌ Asociar la evidencia al registro de asistencia correspondiente
  - ❌ Previsualizar o descargar la evidencia desde la revisión de asistencia
  - ❌ Reemplazar la evidencia en caso de error, conservando historial
- **Archivos a modificar:**
  - `apps/api/src/asistencias/asistencias.service.ts`
  - `apps/api/src/asistencias/asistencias.controller.ts`
  - `apps/web/src/components/dashboard/AsistenciasView.tsx`

#### ❌ HS-A03: Revisión y resolución de duplicados
- **Estado:** ❌ NO IMPLEMENTADO
- **Como:** Administrador
- **Quiero:** Revisar y resolver inscripciones duplicadas sugeridas
- **Para poder:** Mantener la calidad e integridad de los datos
- **Validación:**
  - ❌ Listar coincidencias encontradas por el sistema
  - ❌ Permitir fusionar, corregir o descartar registros
  - ❌ Mantener historial de decisiones y cambios aplicados
  - ❌ Evitar que reaparezcan duplicados ya resueltos
- **Relacionado con:** RF-05

### Prioridad Media

#### ❌ HS-A02: Importar listas y consolidar inscripciones
- **Estado:** ❌ NO IMPLEMENTADO
- **Relacionado con:** RF-04
- **Ver detalles en:** RF-04

#### ❌ HS-A06: Gestión del diccionario de competencias
- **Estado:** ❌ NO IMPLEMENTADO
- **Relacionado con:** RF-14
- **Ver detalles en:** RF-14

#### ⚠️ HS-C03: Revisión de retroalimentación del taller
- **Estado:** ⚠️ PARCIAL
- **Como:** Capacitador
- **Quiero:** Consultar el resumen de encuestas del taller
- **Para poder:** Mejorar contenidos y metodología
- **Validación:**
  - ⚠️ Ver distribución de calificaciones y comentarios (básico implementado)
  - ❌ Filtrar por sesión o rango de fechas
  - ❌ Exportar resultados a CSV/PDF
  - ❌ Identificar tendencias y aspectos recurrentes
- **Archivos a modificar:**
  - `apps/api/src/feedback/feedback.service.ts`
  - `apps/web/src/components/dashboard/FeedbackView.tsx`

#### ⚠️ HS-P04: Consulta de mi perfil por competencias
- **Estado:** ⚠️ PARCIAL
- **Como:** Participante
- **Quiero:** Visualizar mi perfil con nivel, puntaje y confianza por competencia
- **Para poder:** Conocer fortalezas y áreas de mejora
- **Validación:**
  - ✅ Mostrar lista de competencias con puntaje, nivel y confianza (implementado)
  - ❌ Exponer evidencias que sustentan cada competencia
  - ❌ Permitir descarga del perfil en CSV/PDF
  - ✅ Actualizar la vista cuando se recalcula el perfil (implementado)
- **Archivos a modificar:**
  - `apps/web/src/components/dashboard/CVsView.tsx`

#### ❌ HS-A08: Notificaciones y recordatorios
- **Estado:** ❌ NO IMPLEMENTADO
- **Relacionado con:** RF-12
- **Ver detalles en:** RF-12

---

## 🔧 Funcionalidades Adicionales Identificadas

### 1. Estados de Taller
- **Estado:** ❌ NO IMPLEMENTADO
- **Descripción:** Implementar estados "borrador", "publicado", "cerrado" con flujo de publicación
- **Falta:**
  - ❌ Campo `estado` en modelo `Taller` (existe pero no se usa)
  - ❌ Lógica de transición de estados
  - ❌ Validación: solo talleres "publicados" visibles para inscripción
  - ❌ Interfaz para cambiar estado
- **Archivos a modificar:**
  - `apps/api/src/talleres/talleres.service.ts`
  - `apps/web/src/components/dashboard/TalleresView.tsx`

### 2. Lista de Espera
- **Estado:** ❌ NO IMPLEMENTADO
- **Descripción:** Cuando se agotan cupos, asignar participantes a lista de espera y notificar cuando hay cupo
- **Falta:**
  - ❌ Modelo `ListaEspera` en BD
  - ❌ Lógica de asignación automática a lista de espera
  - ❌ Notificación cuando hay cupo disponible
  - ❌ Interfaz para gestionar lista de espera
- **Archivos a crear:**
  - `apps/api/src/lista-espera/` (módulo nuevo)
  - `apps/web/src/components/dashboard/ListaEsperaView.tsx` (nuevo)

### 3. Validación Automática de Cupos
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Validar automáticamente cupos disponibles al inscribirse
- **Implementado:**
  - ✅ Campo `cupos` en modelo `Taller`
- **Falta:**
  - ❌ Validación automática en endpoint de inscripción
  - ❌ Bloqueo cuando se agotan cupos
  - ❌ Mensaje claro al usuario
- **Archivos a modificar:**
  - `apps/api/src/inscripciones/inscripciones.service.ts`

### 4. Evidencias de Asistencia (Completar)
- **Estado:** ⚠️ PARCIAL
- **Relacionado con:** HS-C02
- **Ver detalles en:** HS-C02

### 5. Exportación a PDF
- **Estado:** ❌ NO IMPLEMENTADO
- **Descripción:** Exportar reportes, perfiles y listas a PDF
- **Falta:**
  - ❌ Generación de PDF para reportes
  - ❌ Generación de PDF para perfiles de competencias
  - ❌ Generación de certificados de asistencia
  - ❌ Plantillas de PDF
- **Dependencias:** jsPDF, pdfkit, o puppeteer
- **Archivos a crear:**
  - `apps/api/src/reportes/pdf.service.ts` (nuevo)

### 6. Búsqueda y Filtros Avanzados
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Búsqueda de talleres, participantes y filtros avanzados
- **Falta:**
  - ❌ Búsqueda de talleres por tema/modalidad
  - ❌ Filtros avanzados en listados
  - ❌ Búsqueda de participantes
  - ❌ Paginación en listados grandes
- **Archivos a modificar:**
  - Todos los servicios y vistas de listado

### 7. Revisión de Retroalimentación (Completar)
- **Estado:** ⚠️ PARCIAL
- **Relacionado con:** HS-C03
- **Ver detalles en:** HS-C03

### 8. Consulta de Perfil con Evidencias (Completar)
- **Estado:** ⚠️ PARCIAL
- **Relacionado con:** HS-P04
- **Ver detalles en:** HS-P04

---

## 🎯 Requerimientos No Funcionales

### RNF-01: Usabilidad
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Impacta adopción; medible con test de 10 usuarios
- **Falta:**
  - ❌ Realizar pruebas de usabilidad con usuarios reales
  - ❌ Documentar resultados
  - ❌ Implementar mejoras basadas en feedback

### RNF-02: Accesibilidad práctica
- **Estado:** ⚠️ BÁSICO
- **Descripción:** Buenas prácticas esenciales; puede escalar después
- **Falta:**
  - ❌ Validación WCAG completa
  - ❌ Auditoría con herramientas (Lighthouse, axe DevTools)
  - ❌ Implementar ARIA labels faltantes
  - ❌ Validar contraste de colores
  - ❌ Asegurar navegación por teclado
  - ❌ Agregar skip links

### RNF-03: Seguridad
- **Estado:** ✅ COMPLETADO
- **Descripción:** HTTPS, hash de contraseñas, sesiones; no negociable
- **Evidencia:** JWT, hash de contraseñas, RBAC implementado

### RNF-04: Velocidad de respuesta
- **Estado:** ❌ NO VALIDADO
- **Descripción:** Metas operativas (p95 ≤ 2.5 s) ajustables por iteración
- **Falta:**
  - ❌ Monitoreo de tiempos de respuesta
  - ❌ Optimización de queries lentas
  - ❌ Implementar caché donde sea apropiado
  - ❌ Documentar métricas

### RNF-05: Disponibilidad
- **Estado:** ❌ NO VALIDADO
- **Descripción:** Objetivo de servicio; razonable en entorno académico
- **Falta:**
  - ❌ Monitoreo de disponibilidad
  - ❌ Estrategia de backup
  - ❌ Plan de recuperación

### RNF-06: Escalabilidad operativa
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Conveniente; se valida con dataset objetivo
- **Implementado:**
  - ✅ Arquitectura modular
- **Falta:**
  - ❌ Pruebas de carga
  - ❌ Optimización de base de datos
  - ❌ Estrategia de escalabilidad horizontal

### RNF-07: Mantenibilidad
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Onboarding ágil y smoke test; clave para continuidad
- **Falta:**
  - ❌ Documentación técnica completa
  - ❌ Smoke tests
  - ❌ Guía de onboarding para desarrolladores
  - ❌ JSDoc/TSDoc completo

### RNF-08: Privacidad de datos
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Tratamiento de datos personales; requerimiento base
- **Falta:**
  - ❌ Política de privacidad
  - ❌ Consentimiento explícito
  - ❌ Encriptación de datos sensibles
  - ❌ Auditoría de acceso a datos

### RNF-09: Compatibilidad/Responsive
- **Estado:** ✅ COMPLETADO
- **Descripción:** Es alcance central (web responsive, sin app móvil)
- **Evidencia:** Tailwind CSS, diseño responsivo implementado

---

## 📚 Documentación Faltante

### 1. Modelo Conceptual
- **Estado:** ❌ NO CREADO
- **Descripción:** Diagrama entidad-relación conceptual
- **Archivo:** `docs/MODELOS.md` o `docs/diagramas/modelo_conceptual.png`

### 2. Modelo Lógico
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Diagrama ER lógico (normalizado) documentado
- **Nota:** Existe en Prisma pero falta documentación explícita
- **Archivo:** `docs/MODELOS.md`

### 3. Modelo de Dominio
- **Estado:** ❌ NO CREADO
- **Descripción:** Documento separado con entidades, agregados, value objects, servicios de dominio, reglas de negocio
- **Archivo:** `docs/MODELO_DOMINIO.md`

### 4. Casos de Uso
- **Estado:** ❌ NO DOCUMENTADO
- **Descripción:** Especificaciones detalladas y diagramas de secuencia
- **Falta:**
  - ❌ Diagramas de casos de uso
  - ❌ Especificaciones detalladas de casos de uso principales
  - ❌ Diagramas de secuencia
- **Archivo:** `docs/CASOS_USO.md`

### 5. Diagramas de Arquitectura
- **Estado:** ⚠️ PARCIAL
- **Descripción:** Documentación de arquitectura del sistema
- **Falta:**
  - ❌ Diagrama de arquitectura del sistema
  - ❌ Diagrama de módulos y dependencias
  - ❌ Arquitectura de datos
  - ❌ Flujos de información principales
  - ❌ Decisiones de diseño (ADR)
- **Archivo:** `docs/ARQUITECTURA.md`

### 6. Manual de Usuario
- **Estado:** ❌ NO CREADO
- **Descripción:** Guía para usuarios finales (Administrador, Capacitador, Participante)
- **Archivo:** `docs/MANUAL_USUARIO.md`

### 7. Documentación Técnica
- **Estado:** ⚠️ PARCIAL
- **Descripción:** JSDoc/TSDoc completo, README actualizado
- **Falta:**
  - ❌ JSDoc/TSDoc en todos los métodos públicos
  - ❌ README actualizado con instrucciones de instalación y uso
  - ❌ Guía de contribución
- **Archivos:** Todos los archivos de código

### 8. Análisis de Procesos
- **Estado:** ❌ NO DOCUMENTADO
- **Descripción:** Documentación del análisis de procesos actuales
- **Falta:**
  - ❌ Metodología utilizada (entrevistas, observación, revisión documental)
  - ❌ Procesos actuales identificados
  - ❌ Flujos ineficientes encontrados
  - ❌ Necesidades institucionales
  - ❌ Oportunidades de mejora
- **Archivo:** `docs/ANALISIS_PROCESOS.md`

---

## 🚀 Orden de Implementación Recomendado

### Fase 1: Crítico (Must) - 3 requerimientos
**Objetivo:** Completar funcionalidades esenciales para el funcionamiento básico del sistema

1. **RF-10: Dashboards y reportes** 🔴
   - Tiempo estimado: 2-3 semanas
   - Dependencias: Librerías de gráficos y PDF
   - Impacto: Alto - Permite toma de decisiones estratégicas

2. **RF-05: Deduplicación/validación** 🔴
   - Tiempo estimado: 1 semana
   - Dependencias: Ninguna
   - Impacto: Alto - Mejora calidad de datos

3. **RF-06: QR/códigos para asistencia** 🔴
   - Tiempo estimado: 1 semana
   - Dependencias: Librería QR
   - Impacto: Medio - Facilita registro de asistencia

### Fase 2: Importante (Should) - 3 requerimientos
**Objetivo:** Mejorar eficiencia operativa y experiencia de usuario

4. **RF-12: Sistema de notificaciones** 🟡
   - Tiempo estimado: 2 semanas
   - Dependencias: Nodemailer, servicio SMTP
   - Impacto: Alto - Mejora comunicación y recordatorios

5. **RF-04: Importación de listas** 🟡
   - Tiempo estimado: 1-2 semanas
   - Dependencias: Librerías CSV/Excel
   - Impacto: Medio - Reduce carga administrativa

6. ~~**RF-14: Catálogo de competencias**~~ 🟡
   - **ELIMINADO DEL ALCANCE**

### Fase 3: Mejoras y Complementos - 8 funcionalidades
**Objetivo:** Optimizar procesos y agregar valor adicional

7. **Estados de taller**
   - Tiempo estimado: 3 días
   - Dependencias: Ninguna

8. **Lista de espera**
   - Tiempo estimado: 1 semana
   - Dependencias: RF-12 (notificaciones)

9. **Evidencias de asistencia (completar)**
   - Tiempo estimado: 1 semana
   - Dependencias: Firebase Storage

10. **Exportación PDF**
    - Tiempo estimado: 1 semana
    - Dependencias: Librería PDF

11. **Búsqueda y filtros avanzados**
    - Tiempo estimado: 1 semana
    - Dependencias: Ninguna

12. **Validación automática de cupos**
    - Tiempo estimado: 2 días
    - Dependencias: Ninguna

13. **Revisión de retroalimentación (completar)**
    - Tiempo estimado: 3 días
    - Dependencias: Ninguna

14. **Consulta de perfil con evidencias (completar)**
    - Tiempo estimado: 3 días
    - Dependencias: Ninguna

### Fase 4: Documentación y Calidad
**Objetivo:** Completar documentación y mejorar calidad del sistema

15. **Documentación técnica**
    - Tiempo estimado: 1 semana
    - Incluye: JSDoc, README, guías

16. **Diagramas y modelos**
    - Tiempo estimado: 1 semana
    - Incluye: Modelos conceptual, lógico, dominio, casos de uso

17. **Mejoras de accesibilidad**
    - Tiempo estimado: 1 semana
    - Incluye: Validación WCAG, auditoría

18. **Pruebas de usabilidad**
    - Tiempo estimado: 1 semana
    - Incluye: Test con usuarios, documentación de resultados

---

## 📊 Seguimiento de Progreso

### Resumen por Estado

- ✅ **Completado:** 8 requerimientos
- ⚠️ **Parcial:** 6 requerimientos
- ❌ **No implementado:** 10 requerimientos

### Resumen por Prioridad

#### Prioridad M (Must)
- ✅ Completado: 6
- ⚠️ Parcial: 2
- ❌ No implementado: 1

#### Prioridad S (Should)
- ✅ Completado: 2
- ❌ No implementado: 3

### Progreso General

```
[████████░░░░░░░░░░░░] 40% Completado
```

### Próximos Pasos

1. ✅ Revisar y aprobar este plan de trabajo
2. 🔄 Iniciar Fase 1: RF-10 (Dashboards y reportes)
3. ⏳ Planificar sprints para cada fase
4. ⏳ Asignar tareas y tiempos

---

## 📝 Notas

- Este plan está basado en el análisis del documento de trabajo de grado "ERPV - Trabajo de grado Ver. 1.0.docx"
- Las prioridades (M/S) corresponden a la clasificación MoSCoW del documento
- Los tiempos estimados son aproximados y pueden variar según complejidad real
- Se recomienda revisar y actualizar este documento después de completar cada fase

---

**Última actualización:** 2025-01-XX  
**Próxima revisión:** Después de completar Fase 1


# IA Module

Este módulo conecta la API de NestJS con el microservicio Python FTE-AI para análisis de competencias.

## Configuración

El módulo se conecta al microservicio Python usando la variable de entorno `IA_URL`.

### Variables de entorno

Crea un archivo `.env` en la raíz de `apps/api/` con:

```env
IA_URL=http://localhost:8000
```

Por defecto, si no se especifica, usará `http://localhost:8000`.

## Endpoints

### GET /ia/health

Verifica el estado del microservicio FTE-AI.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "FTE-AI service is running"
}
```

### POST /ia/analyze/profile

Analiza el perfil de un participante.

**Body - Ejemplo Completo (multi-área):**
```json
{
  "participanteId": "PART-12345",
  "incluirCV": true,
  "incluirTalleres": true,
  "talleres": [
    { "tema": "atención al paciente", "asistencia_pct": 1.0 },
    { "tema": "pedagogía y didáctica", "asistencia_pct": 0.9 },
    { "tema": "planeación financiera", "asistencia_pct": 0.92 },
    { "tema": "marketing digital", "asistencia_pct": 0.85 },
    { "tema": "control de calidad", "asistencia_pct": 0.88 }
  ],
  "cvTexto": "Profesional con experiencia en salud comunitaria, educación, finanzas, marketing y operaciones. Habilidades en comunicación, liderazgo, orientación al servicio y análisis.",
  "useML": true
}
```

**Body - Mínimo:**
```json
{
  "participanteId": "PART-12345",
  "incluirTalleres": true
}
```

**Respuesta:**
```json
{
  "competencias": [
    {
      "competencia": "string",
      "nivel": 5,
      "confianza": 0.92
    }
  ]
}
```

### POST /ia/analyze/job

Analiza los requisitos de un puesto de trabajo.

**Body - Ejemplo Completo (no técnico):**
```json
{
  "puestoTexto": "Coordinador de operaciones para servicios de atención al público. Responsabilidades: coordinar agendas, asegurar protocolos de servicio, seguimiento de indicadores, coordinación con logística y compras, mejora de procesos. Competencias: liderazgo, comunicación, orientación al usuario, planificación, uso de hojas de cálculo.",
  "topK": 10
}
```

**Body - Simple:**
```json
{
  "puestoTexto": "Desarrollador React con TypeScript",
  "topK": 6
}
```

**Respuesta:**
```json
{
  "competencias": [
    {
      "competencia": "string",
      "relevancia": 0.95,
      "descripcion": "string (opcional)"
    }
  ],
  "meta": {
    "total": 10,
    "tiempo": 0.5
  }
}
```

## Uso Local

1. Asegúrate de que el microservicio Python FTE-AI esté corriendo en `http://localhost:8000`

2. Verifica la conexión:
```bash
curl http://localhost:8000/health
```

3. Usa los endpoints del módulo IA desde tu aplicación NestJS

## Nota

Este módulo NO depende de la base de datos. Solo actúa como un cliente HTTP para el microservicio Python.


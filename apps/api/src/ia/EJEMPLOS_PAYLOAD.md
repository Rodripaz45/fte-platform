# Ejemplos de Payloads para el Módulo IA

## 1. POST /ia/analyze/profile

### Payload Completo (todos los campos en true, multi-área)

```json
{
  "participanteId": "PART-12345",
  "incluirCV": true,
  "incluirTalleres": true,
  "talleres": [
    { "tema": "atención al paciente en salud primaria", "asistencia_pct": 1.0 },
    { "tema": "protocolos de bioseguridad", "asistencia_pct": 0.95 },
    { "tema": "pedagogía y didáctica educativa", "asistencia_pct": 0.9 },
    { "tema": "planeación financiera personal", "asistencia_pct": 0.92 },
    { "tema": "marketing digital y redes sociales", "asistencia_pct": 0.85 },
    { "tema": "control de calidad en manufactura", "asistencia_pct": 0.88 },
    { "tema": "técnicas de ventas consultivas", "asistencia_pct": 0.97 },
    { "tema": "selección por competencias en rrhh", "asistencia_pct": 0.83 },
    { "tema": "diseño de experiencia de usuario", "asistencia_pct": 0.8 },
    { "tema": "gestión de inventarios y logística", "asistencia_pct": 0.9 }
  ],
  "cvTexto": "Profesional con experiencia transversal en salud comunitaria, educación, finanzas personales, marketing y operaciones. Participación en programas de atención primaria, diseño de contenidos educativos, asesorías financieras básicas, campañas de marketing digital y proyectos de mejora de procesos en manufactura y logística. Habilidades en comunicación, trabajo en equipo, liderazgo, orientación al servicio, pensamiento analítico y organización.",
  "useML": true
}
```

### Payload Solo con Talleres (multi-área)

```json
{
  "participanteId": "PART-67890",
  "incluirTalleres": true,
  "talleres": [
    { "tema": "primeros auxilios y rcp", "asistencia_pct": 1.0 },
    { "tema": "evaluación del aprendizaje", "asistencia_pct": 0.9 },
    { "tema": "introducción a finanzas corporativas", "asistencia_pct": 0.95 },
    { "tema": "técnicas de negociación en ventas", "asistencia_pct": 0.9 }
  ],
  "useML": true
}
```

### Payload Solo con CV (genérico)

```json
{
  "participanteId": "PART-99999",
  "incluirCV": true,
  "cvTexto": "Profesional con 5 años de experiencia en atención al cliente, coordinación de equipos, formación y evaluación, planificación de campañas de marketing, y apoyo administrativo-financiero. Enfoque en mejora continua, resolución de problemas, comunicación efectiva y orientación a resultados. Certificaciones en gestión de proyectos y servicio al cliente.",
  "useML": true
}
```

### Payload Mínimo con Obligatorios

```json
{
  "participanteId": "PART-MIN",
  "incluirTalleres": true,
  "useML": true
}
```

---

## 2. POST /ia/analyze/job

### Payload Completo (descripciones no técnicas)

```json
{
  "puestoTexto": "Buscamos Coordinador de Operaciones para sector salud. Responsabilidades: coordinar agendas, asegurar cumplimiento de protocolos, supervisar indicadores de servicio, optimizar procesos de atención, coordinar con áreas de logística y compras. Requisitos: liderazgo, comunicación efectiva, orientación al usuario, manejo de hojas de cálculo, conocimiento básico de normativas de salud. Se valoran cursos en atención al paciente, bioseguridad y gestión de inventarios.",
  "topK": 10
}
```

### Payload para Educación (Docente)

```json
{
  "puestoTexto": "Docente de educación básica. Planificación de clases, elaboración de material didáctico, evaluación continua, acompañamiento a estudiantes y familias. Se valora experiencia con metodologías activas y manejo de aula. Competencias: comunicación, empatía, organización, trabajo colaborativo, manejo del tiempo.",
  "topK": 8
}
```

### Payload para Finanzas (Analista)

```json
{
  "puestoTexto": "Analista financiero junior. Apoyo en presupuestos, conciliaciones, elaboración de reportes, control de gastos y análisis de variaciones. Competencias: pensamiento analítico, atención al detalle, ética, comunicación escrita, organización.",
  "topK": 15
}
```

### Payload para Marketing (Especialista)

```json
{
  "puestoTexto": "Especialista de marketing y contenidos. Planificación de campañas, redacción de copys, gestión de redes sociales, coordinación con diseño y ventas, seguimiento de métricas. Competencias: creatividad, comunicación, orientación a resultados, pensamiento estratégico, trabajo en equipo.",
  "topK": 12
}
```

### Payload Simple

```json
{
  "puestoTexto": "Asesor de ventas retail con orientación al cliente",
  "topK": 6
}
```

---

## Respuestas Esperadas

### Respuesta de analyze/profile (ejemplo genérico)

```json
{
  "competencias": [
    { "competencia": "Comunicación", "nivel": 7, "confianza": 0.95 },
    { "competencia": "Orientación al servicio", "nivel": 6, "confianza": 0.9 },
    { "competencia": "Liderazgo", "nivel": 5, "confianza": 0.82 },
    { "competencia": "Pensamiento analítico", "nivel": 6, "confianza": 0.84 }
  ]
}
```

### Respuesta de analyze/job (ejemplo genérico)

```json
{
  "competencias": [
    { "competencia": "Gestión de equipos", "relevancia": 0.92, "descripcion": "Coordinar y motivar personas hacia objetivos" },
    { "competencia": "Atención al cliente", "relevancia": 0.9, "descripcion": "Resolver necesidades y brindar servicio de calidad" },
    { "competencia": "Planificación", "relevancia": 0.85 }
  ],
  "meta": {
    "total": 15,
    "tiempo": 0.45
  }
}
```

---

## Notas

- Todos los campos booleanos están en `true` para activar todas las funcionalidades
- `asistencia_pct` debe ser un valor entre 0.0 y 1.0 (1.0 = 100% de asistencia)
- `topK` debe ser un número entre 1 y 20 (por defecto: 6)
- `participanteId` es obligatorio
- Los nombres de talleres deben ser en minúsculas según el código original
- `useML` activa el uso de machine learning en el análisis


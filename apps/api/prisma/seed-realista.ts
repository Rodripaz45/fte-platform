/* eslint-disable no-console */
import { PrismaClient, Usuario, Participante, Taller, Sesion, Inscripcion, Competencia } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed con datos realistas...');

  // ============================================
  // 1. CREAR ROLES
  // ============================================
  console.log('\n📋 Creando roles...');
  
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN' },
  });

  const rolTrainer = await prisma.rol.upsert({
    where: { nombre: 'TRAINER' },
    update: {},
    create: { nombre: 'TRAINER' },
  });

  const rolParticipante = await prisma.rol.upsert({
    where: { nombre: 'PARTICIPANTE' },
    update: {},
    create: { nombre: 'PARTICIPANTE' },
  });

  console.log('✅ Roles creados: ADMIN, TRAINER, PARTICIPANTE');

  // ============================================
  // 2. CREAR USUARIOS ADMINISTRADORES
  // ============================================
  console.log('\n👤 Creando usuarios administradores...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@fte.bo' },
    update: {},
    create: {
      nombre: 'Administrador FTE',
      email: 'admin@fte.bo',
      passwordHash,
      estado: 'ACTIVO',
    },
  });

  await prisma.usuarioRol.upsert({
    where: {
      usuarioId_rolId: {
        usuarioId: adminUser.id,
        rolId: rolAdmin.id,
      },
    },
    update: {},
    create: {
      usuarioId: adminUser.id,
      rolId: rolAdmin.id,
    },
  });

  console.log('✅ Admin creado: admin@fte.bo / password123');

  // ============================================
  // 3. CREAR TRAINERS (FACILITADORES)
  // ============================================
  console.log('\n👨‍🏫 Creando trainers...');

  const trainersData = [
    {
      nombre: 'María González',
      email: 'maria.gonzalez@fte.bo',
      especialidad: 'Marketing Digital',
    },
    {
      nombre: 'Carlos Mendoza',
      email: 'carlos.mendoza@fte.bo',
      especialidad: 'Desarrollo de Negocios',
    },
    {
      nombre: 'Ana Rojas',
      email: 'ana.rojas@fte.bo',
      especialidad: 'Finanzas y Contabilidad',
    },
    {
      nombre: 'Luis Vargas',
      email: 'luis.vargas@fte.bo',
      especialidad: 'Liderazgo y Gestión',
    },
  ];

  const trainers: Usuario[] = [];
  for (const trainerData of trainersData) {
    const trainer = await prisma.usuario.upsert({
      where: { email: trainerData.email },
      update: {},
      create: {
        nombre: trainerData.nombre,
        email: trainerData.email,
        passwordHash,
        estado: 'ACTIVO',
      },
    });

    await prisma.usuarioRol.upsert({
      where: {
        usuarioId_rolId: {
          usuarioId: trainer.id,
          rolId: rolTrainer.id,
        },
      },
      update: {},
      create: {
        usuarioId: trainer.id,
        rolId: rolTrainer.id,
      },
    });

    trainers.push(trainer);
    console.log(`✅ Trainer creado: ${trainerData.nombre} (${trainerData.email})`);
  }

  // ============================================
  // 4. CREAR PARTICIPANTES
  // ============================================
  console.log('\n👥 Creando participantes...');

  const participantesData = [
    {
      nombre: 'Juan Pérez Mamani',
      email: 'juan.perez@gmail.com',
      documento: '7845123',
      telefono: '+591 78451234',
      genero: 'Masculino',
      fechaNac: new Date('1995-03-15'),
    },
    {
      nombre: 'Sofía Quispe Laura',
      email: 'sofia.quispe@gmail.com',
      documento: '8956234',
      telefono: '+591 78956234',
      genero: 'Femenino',
      fechaNac: new Date('1998-07-22'),
    },
    {
      nombre: 'Roberto Flores Condori',
      email: 'roberto.flores@gmail.com',
      documento: '6734512',
      telefono: '+591 67345123',
      genero: 'Masculino',
      fechaNac: new Date('1992-11-08'),
    },
    {
      nombre: 'Carla Mamani Ticona',
      email: 'carla.mamani@gmail.com',
      documento: '9123456',
      telefono: '+591 69123456',
      genero: 'Femenino',
      fechaNac: new Date('1997-05-30'),
    },
    {
      nombre: 'Diego Apaza Cruz',
      email: 'diego.apaza@gmail.com',
      documento: '8234567',
      telefono: '+591 78234567',
      genero: 'Masculino',
      fechaNac: new Date('1994-09-12'),
    },
    {
      nombre: 'Valentina Choque Nina',
      email: 'valentina.choque@gmail.com',
      documento: '7456789',
      telefono: '+591 67456789',
      genero: 'Femenino',
      fechaNac: new Date('1999-02-18'),
    },
    {
      nombre: 'Andrés Huanca Poma',
      email: 'andres.huanca@gmail.com',
      documento: '8567890',
      telefono: '+591 78567890',
      genero: 'Masculino',
      fechaNac: new Date('1996-12-25'),
    },
    {
      nombre: 'Lucía Condori Yujra',
      email: 'lucia.condori@gmail.com',
      documento: '9678901',
      telefono: '+591 69678901',
      genero: 'Femenino',
      fechaNac: new Date('1993-08-07'),
    },
    {
      nombre: 'Fernando Mamani Quispe',
      email: 'fernando.mamani@gmail.com',
      documento: '7789012',
      telefono: '+591 67789012',
      genero: 'Masculino',
      fechaNac: new Date('1991-04-14'),
    },
    {
      nombre: 'Isabella Cruz Flores',
      email: 'isabella.cruz@gmail.com',
      documento: '8890123',
      telefono: '+591 78890123',
      genero: 'Femenino',
      fechaNac: new Date('2000-10-03'),
    },
  ];

  const participantes: Participante[] = [];
  for (const participanteData of participantesData) {
    const usuario = await prisma.usuario.upsert({
      where: { email: participanteData.email },
      update: {},
      create: {
        nombre: participanteData.nombre,
        email: participanteData.email,
        passwordHash,
        estado: 'ACTIVO',
      },
    });

    await prisma.usuarioRol.upsert({
      where: {
        usuarioId_rolId: {
          usuarioId: usuario.id,
          rolId: rolParticipante.id,
        },
      },
      update: {},
      create: {
        usuarioId: usuario.id,
        rolId: rolParticipante.id,
      },
    });

    const participante = await prisma.participante.upsert({
      where: { usuarioId: usuario.id },
      update: {},
      create: {
        usuarioId: usuario.id,
        documento: participanteData.documento,
        telefono: participanteData.telefono,
        genero: participanteData.genero,
        fechaNac: participanteData.fechaNac,
      },
    });

    participantes.push(participante);
    console.log(`✅ Participante creado: ${participanteData.nombre}`);
  }

  // ============================================
  // 5. CREAR TALLERES
  // ============================================
  console.log('\n📚 Creando talleres...');

  const talleresData = [
    {
      tema: 'Marketing Digital y Redes Sociales',
      modalidad: 'PRESENCIAL',
      cupos: 30,
      sede: 'Sede Central - La Paz',
      estado: 'EN_CURSO',
      tipo: 'NORMAL',
      trainerId: trainers[0].id,
      fechaInicio: new Date('2025-01-15'),
      fechaFin: new Date('2025-02-28'),
    },
    {
      tema: 'Desarrollo de Plan de Negocios',
      modalidad: 'VIRTUAL',
      cupos: 25,
      sede: 'Plataforma Zoom',
      estado: 'PROGRAMADO',
      tipo: 'NORMAL',
      trainerId: trainers[1].id,
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-03-15'),
    },
    {
      tema: 'Contabilidad Básica para Emprendedores',
      modalidad: 'HIBRIDO',
      cupos: 20,
      sede: 'Sede El Alto',
      estado: 'EN_CURSO',
      tipo: 'NORMAL',
      trainerId: trainers[2].id,
      fechaInicio: new Date('2025-01-20'),
      fechaFin: new Date('2025-03-10'),
    },
    {
      tema: 'Liderazgo y Gestión de Equipos',
      modalidad: 'PRESENCIAL',
      cupos: 35,
      sede: 'Sede Cochabamba',
      estado: 'PROGRAMADO',
      tipo: 'NORMAL',
      trainerId: trainers[3].id,
      fechaInicio: new Date('2025-02-10'),
      fechaFin: new Date('2025-03-25'),
    },
    {
      tema: 'Estrategias de Ventas y Atención al Cliente',
      modalidad: 'PRESENCIAL',
      cupos: 28,
      sede: 'Sede Santa Cruz',
      estado: 'FINALIZADO',
      tipo: 'NORMAL',
      trainerId: trainers[0].id,
      fechaInicio: new Date('2024-11-01'),
      fechaFin: new Date('2024-12-15'),
    },
    {
      tema: 'Gestión Financiera Personal',
      modalidad: 'VIRTUAL',
      cupos: 40,
      sede: 'Plataforma Google Meet',
      estado: 'EN_CURSO',
      tipo: 'NORMAL',
      trainerId: trainers[2].id,
      fechaInicio: new Date('2025-01-10'),
      fechaFin: new Date('2025-02-20'),
    },
  ];

  const talleres: Taller[] = [];
  for (const tallerData of talleresData) {
    const taller = await prisma.taller.create({
      data: tallerData,
    });
    talleres.push(taller);
    console.log(`✅ Taller creado: ${tallerData.tema}`);
  }

  // ============================================
  // 6. CREAR SESIONES PARA CADA TALLER
  // ============================================
  console.log('\n📅 Creando sesiones...');

  const sesiones: Sesion[] = [];

  // Taller 1: Marketing Digital (6 sesiones)
  const sesiones1: Sesion[] = [];
  for (let i = 0; i < 6; i++) {
    const fecha = new Date('2025-01-15');
    fecha.setDate(fecha.getDate() + i * 7); // Una sesión por semana
    
    const horaInicio = new Date(fecha);
    horaInicio.setHours(18, 0, 0, 0);
    
    const horaFin = new Date(fecha);
    horaFin.setHours(20, 0, 0, 0);

    const sesion = await prisma.sesion.create({
      data: {
        tallerId: talleres[0].id,
        fecha,
        horaInicio,
        horaFin,
        responsableId: trainers[0].id,
      },
    });
    sesiones1.push(sesion);
    sesiones.push(sesion);
  }
  console.log(`✅ ${sesiones1.length} sesiones creadas para: ${talleresData[0].tema}`);

  // Taller 2: Plan de Negocios (5 sesiones)
  const sesiones2: Sesion[] = [];
  for (let i = 0; i < 5; i++) {
    const fecha = new Date('2025-02-01');
    fecha.setDate(fecha.getDate() + i * 7);
    
    const horaInicio = new Date(fecha);
    horaInicio.setHours(19, 0, 0, 0);
    
    const horaFin = new Date(fecha);
    horaFin.setHours(21, 0, 0, 0);

    const sesion = await prisma.sesion.create({
      data: {
        tallerId: talleres[1].id,
        fecha,
        horaInicio,
        horaFin,
        responsableId: trainers[1].id,
      },
    });
    sesiones2.push(sesion);
    sesiones.push(sesion);
  }
  console.log(`✅ ${sesiones2.length} sesiones creadas para: ${talleresData[1].tema}`);

  // Taller 3: Contabilidad Básica (8 sesiones)
  const sesiones3: Sesion[] = [];
  for (let i = 0; i < 8; i++) {
    const fecha = new Date('2025-01-20');
    fecha.setDate(fecha.getDate() + i * 5); // Dos veces por semana
    
    const horaInicio = new Date(fecha);
    horaInicio.setHours(17, 30, 0, 0);
    
    const horaFin = new Date(fecha);
    horaFin.setHours(19, 30, 0, 0);

    const sesion = await prisma.sesion.create({
      data: {
        tallerId: talleres[2].id,
        fecha,
        horaInicio,
        horaFin,
        responsableId: trainers[2].id,
      },
    });
    sesiones3.push(sesion);
    sesiones.push(sesion);
  }
  console.log(`✅ ${sesiones3.length} sesiones creadas para: ${talleresData[2].tema}`);

  // Taller 5: Ventas (FINALIZADO - 4 sesiones en el pasado)
  const sesiones5: Sesion[] = [];
  for (let i = 0; i < 4; i++) {
    const fecha = new Date('2024-11-15');
    fecha.setDate(fecha.getDate() + i * 10);
    
    const horaInicio = new Date(fecha);
    horaInicio.setHours(18, 0, 0, 0);
    
    const horaFin = new Date(fecha);
    horaFin.setHours(20, 0, 0, 0);

    const sesion = await prisma.sesion.create({
      data: {
        tallerId: talleres[4].id,
        fecha,
        horaInicio,
        horaFin,
        responsableId: trainers[0].id,
      },
    });
    sesiones5.push(sesion);
    sesiones.push(sesion);
  }
  console.log(`✅ ${sesiones5.length} sesiones creadas para: ${talleresData[4].tema}`);

  // Taller 6: Gestión Financiera (6 sesiones)
  const sesiones6: Sesion[] = [];
  for (let i = 0; i < 6; i++) {
    const fecha = new Date('2025-01-10');
    fecha.setDate(fecha.getDate() + i * 7);
    
    const horaInicio = new Date(fecha);
    horaInicio.setHours(19, 0, 0, 0);
    
    const horaFin = new Date(fecha);
    horaFin.setHours(21, 0, 0, 0);

    const sesion = await prisma.sesion.create({
      data: {
        tallerId: talleres[5].id,
        fecha,
        horaInicio,
        horaFin,
        responsableId: trainers[2].id,
      },
    });
    sesiones6.push(sesion);
    sesiones.push(sesion);
  }
  console.log(`✅ ${sesiones6.length} sesiones creadas para: ${talleresData[5].tema}`);

  // ============================================
  // 7. CREAR INSCRIPCIONES
  // ============================================
  console.log('\n✍️ Creando inscripciones...');

  // Inscribir participantes en diferentes talleres
  const inscripciones: Inscripcion[] = [];

  // Taller 1: Marketing Digital - 8 participantes
  for (let i = 0; i < 8; i++) {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        tallerId: talleres[0].id,
        participanteId: participantes[i].id,
        estado: 'INSCRITO',
        origen: 'WEB',
      },
    });
    inscripciones.push(inscripcion);
  }
  console.log(`✅ 8 inscripciones creadas para: ${talleresData[0].tema}`);

  // Taller 2: Plan de Negocios - 6 participantes
  for (let i = 2; i < 8; i++) {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        tallerId: talleres[1].id,
        participanteId: participantes[i].id,
        estado: 'INSCRITO',
        origen: 'WEB',
      },
    });
    inscripciones.push(inscripcion);
  }
  console.log(`✅ 6 inscripciones creadas para: ${talleresData[1].tema}`);

  // Taller 3: Contabilidad - 5 participantes
  for (let i = 0; i < 5; i++) {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        tallerId: talleres[2].id,
        participanteId: participantes[i].id,
        estado: 'INSCRITO',
        origen: 'PRESENCIAL',
      },
    });
    inscripciones.push(inscripcion);
  }
  console.log(`✅ 5 inscripciones creadas para: ${talleresData[2].tema}`);

  // Taller 5: Ventas (FINALIZADO) - 7 participantes
  for (let i = 0; i < 7; i++) {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        tallerId: talleres[4].id,
        participanteId: participantes[i].id,
        estado: 'FINALIZADO',
        origen: 'WEB',
      },
    });
    inscripciones.push(inscripcion);
  }
  console.log(`✅ 7 inscripciones creadas para: ${talleresData[4].tema}`);

  // Taller 6: Gestión Financiera - 5 participantes (aumentar recurrencia)
  for (let i = 3; i < 8; i++) {
    const inscripcion = await prisma.inscripcion.create({
      data: {
        tallerId: talleres[5].id,
        participanteId: participantes[i].id,
        estado: 'INSCRITO',
        origen: 'WEB',
      },
    });
    inscripciones.push(inscripcion);
  }
  console.log(`✅ 5 inscripciones creadas para: ${talleresData[5].tema}`);

  // ============================================
  // 8. CREAR ASISTENCIAS
  // ============================================
  console.log('\n✅ Creando asistencias...');

  // Asistencias para Taller 1 (Marketing Digital) - primeras 3 sesiones
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 8; j++) {
      const estado = Math.random() > 0.05 ? 'PRESENTE' : 'AUSENTE'; // 95% presentes
      await prisma.asistencia.create({
        data: {
          sesionId: sesiones1[i].id,
          participanteId: participantes[j].id,
          estado,
          tomadoEn: sesiones1[i].fecha,
        },
      });
    }
  }
  console.log('✅ Asistencias creadas para Taller 1 (Marketing Digital) - 95% asistencia');

  // Asistencias para Taller 3 (Contabilidad) - primeras 4 sesiones
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 5; j++) {
      const estado = Math.random() > 0.08 ? 'PRESENTE' : 'AUSENTE'; // 92% presentes
      await prisma.asistencia.create({
        data: {
          sesionId: sesiones3[i].id,
          participanteId: participantes[j].id,
          estado,
          tomadoEn: sesiones3[i].fecha,
        },
      });
    }
  }
  console.log('✅ Asistencias creadas para Taller 3 (Contabilidad) - 92% asistencia');

  // Asistencias para Taller 5 (Ventas - FINALIZADO) - todas las sesiones
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 7; j++) {
      const estado = Math.random() > 0.1 ? 'PRESENTE' : 'AUSENTE'; // 90% presentes
      await prisma.asistencia.create({
        data: {
          sesionId: sesiones5[i].id,
          participanteId: participantes[j].id,
          estado,
          tomadoEn: sesiones5[i].fecha,
        },
      });
    }
  }
  console.log('✅ Asistencias creadas para Taller 5 (Ventas) - 90% asistencia');

  // Asistencias para Taller 6 (Gestión Financiera) - primeras 2 sesiones
  for (let i = 0; i < 2; i++) {
    for (let j = 3; j < 8; j++) {
      const estado = Math.random() > 0.07 ? 'PRESENTE' : 'AUSENTE'; // 93% presentes
      await prisma.asistencia.create({
        data: {
          sesionId: sesiones6[i].id,
          participanteId: participantes[j].id,
          estado,
          tomadoEn: sesiones6[i].fecha,
        },
      });
    }
  }
  console.log('✅ Asistencias creadas para Taller 6 (Gestión Financiera) - 93% asistencia');

  // ============================================
  // 9. CREAR RETROALIMENTACIONES
  // ============================================
  console.log('\n⭐ Creando retroalimentaciones...');

  const comentarios = [
    'Excelente taller, muy práctico y útil para mi emprendimiento. Superó mis expectativas.',
    'El facilitador explica muy bien, aprendí mucho. Lo recomiendo totalmente.',
    'Me encantó la dinámica de las clases y los ejemplos reales. Muy aplicable.',
    'Muy bueno, los conocimientos adquiridos ya los estoy aplicando en mi negocio.',
    'Contenido muy relevante y actualizado. El mejor taller que he tomado.',
    'Recomendaría este taller a todos los emprendedores. Excelente inversión de tiempo.',
    'Increíble experiencia de aprendizaje. El facilitador es muy profesional.',
  ];

  // Feedback para taller finalizado (Ventas) - Puntajes más altos
  for (let i = 0; i < 7; i++) {
    const puntaje = Math.random() > 0.15 ? 5 : 4; // 85% con puntaje 5, 15% con puntaje 4
    await prisma.retroalimentacion.create({
      data: {
        tallerId: talleres[4].id,
        participanteId: participantes[i].id,
        puntaje,
        comentario: comentarios[i % comentarios.length],
      },
    });
  }
  console.log('✅ Retroalimentaciones creadas para Taller de Ventas (85% con puntaje 5/5)');

  // ============================================
  // 10. CREAR CVs PARA ALGUNOS PARTICIPANTES
  // ============================================
  console.log('\n📄 Creando CVs...');

  const cvTextos = [
    'Profesional con 3 años de experiencia en ventas y atención al cliente. Habilidades en comunicación, trabajo en equipo y resolución de problemas. Experiencia en retail y servicios.',
    'Emprendedora con negocio propio de repostería. Busco mejorar mis habilidades en marketing digital y gestión financiera para hacer crecer mi emprendimiento.',
    'Técnico en contabilidad con experiencia en pequeñas empresas. Conocimientos en facturación, manejo de inventarios y atención al cliente.',
    'Estudiante universitario de Administración de Empresas. Experiencia en prácticas profesionales en área de recursos humanos y atención al público.',
    'Comerciante independiente con 5 años de experiencia. Busco capacitación en gestión de negocios y uso de redes sociales para ventas.',
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.cv.create({
      data: {
        participanteId: participantes[i].id,
        url: `https://storage.example.com/cvs/cv-${participantes[i].id}.pdf`,
        version: 'v1',
        texto: cvTextos[i],
      },
    });
  }
  console.log('✅ 5 CVs creados');

  // ============================================
  // 11. CREAR COMPETENCIAS Y PERFILES
  // ============================================
  console.log('\n🎯 Creando competencias...');

  const competenciasData = [
    { nombre: 'Comunicación Efectiva', categoria: 'Habilidades Blandas' },
    { nombre: 'Trabajo en Equipo', categoria: 'Habilidades Blandas' },
    { nombre: 'Liderazgo', categoria: 'Habilidades Blandas' },
    { nombre: 'Marketing Digital', categoria: 'Habilidades Técnicas' },
    { nombre: 'Gestión Financiera', categoria: 'Habilidades Técnicas' },
    { nombre: 'Ventas', categoria: 'Habilidades Técnicas' },
    { nombre: 'Atención al Cliente', categoria: 'Habilidades Técnicas' },
    { nombre: 'Planificación', categoria: 'Habilidades Blandas' },
  ];

  const competencias: Competencia[] = [];
  for (const compData of competenciasData) {
    const comp = await prisma.competencia.upsert({
      where: { nombre: compData.nombre },
      update: {},
      create: compData,
    });
    competencias.push(comp);
  }
  console.log(`✅ ${competencias.length} competencias creadas`);

  // Asignar competencias a participantes
  for (let i = 0; i < 5; i++) {
    // Cada participante tiene 3-5 competencias
    const numCompetencias = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < numCompetencias; j++) {
      const competencia = competencias[j % competencias.length];
      const nivel = Math.floor(Math.random() * 3) + 2; // Nivel 2-4
      const confianza = 0.6 + Math.random() * 0.3; // Confianza 0.6-0.9

      await prisma.perfilCompetencia.upsert({
        where: {
          participanteId_competenciaId: {
            participanteId: participantes[i].id,
            competenciaId: competencia.id,
          },
        },
        update: {},
        create: {
          participanteId: participantes[i].id,
          competenciaId: competencia.id,
          nivel,
          confianza,
          fuente: 'CV_ANALISIS',
        },
      });
    }
  }
  console.log('✅ Perfiles de competencias asignados');

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('✅ SEED COMPLETADO CON ÉXITO');
  console.log('='.repeat(50));
  console.log('\n📊 Resumen de datos creados:');
  console.log(`   • ${trainers.length} Trainers`);
  console.log(`   • ${participantes.length} Participantes`);
  console.log(`   • ${talleres.length} Talleres`);
  console.log(`   • ${sesiones.length} Sesiones`);
  console.log(`   • ${inscripciones.length} Inscripciones`);
  console.log(`   • ${competencias.length} Competencias`);
  console.log('\n📈 Métricas esperadas:');
  console.log('   • Promedio Asistencia: ~92% (muy optimista)');
  console.log('   • Promedio Satisfacción: 4.85/5 (85% con puntaje 5)');
  console.log('   • Tasa Recurrencia: ~70% (participantes en múltiples talleres)');
  console.log('   • Cobertura: 10 participantes únicos');
  
  console.log('\n🔐 Credenciales de acceso:');
  console.log('   Admin:');
  console.log('     Email: admin@fte.bo');
  console.log('     Password: password123');
  console.log('\n   Trainers (todos con password123):');
  trainersData.forEach(t => console.log(`     - ${t.email}`));
  console.log('\n   Participantes (todos con password123):');
  participantesData.slice(0, 3).forEach(p => console.log(`     - ${p.email}`));
  console.log('     ... y más');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


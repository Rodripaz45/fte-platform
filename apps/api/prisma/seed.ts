/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  // 1) Usuario + Participante
  const usuario = await prisma.usuario.upsert({
    where: { email: 'demo.participante@fte.local' },
    update: {},
    create: {
      nombre: 'Demo Participante',
      email: 'demo.participante@fte.local',
      passwordHash: 'seeded',
      estado: 'ACTIVO',
    },
  });

  const participante = await prisma.participante.upsert({
    where: { usuarioId: usuario.id },
    update: {},
    create: {
      usuarioId: usuario.id,
      documento: 'DOC-001',
      telefono: '+51 999 999 999',
      genero: 'N/D',
    },
  });

  // 2) Taller + Sesiones
  const taller = await prisma.taller.create({
    data: {
      tema: 'marketing digital y redes sociales',
      modalidad: 'PRESENCIAL',
      cupos: 30,
      sede: 'Sede Central',
      estado: 'PROGRAMADO',
    },
  });

  const sesion1 = await prisma.sesion.create({
    data: {
      tallerId: taller.id,
      fecha: new Date(),
    },
  });
  const sesion2 = await prisma.sesion.create({
    data: {
      tallerId: taller.id,
      fecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const sesion3 = await prisma.sesion.create({
    data: {
      tallerId: taller.id,
      fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 3) Inscripción del participante en el taller
  const inscripcion = await prisma.inscripcion.upsert({
    where: {
      tallerId_participanteId: { tallerId: taller.id, participanteId: participante.id },
    },
    update: { estado: 'INSCRITO' },
    create: {
      tallerId: taller.id,
      participanteId: participante.id,
      estado: 'INSCRITO',
    },
  });

  // 4) Asistencias: marcar PRESENTE en 2 de 3 sesiones (~66%)
  await prisma.asistencia.upsert({
    where: { sesionId_participanteId: { sesionId: sesion1.id, participanteId: participante.id } },
    update: { estado: 'PRESENTE', tomadoEn: new Date() },
    create: { sesionId: sesion1.id, participanteId: participante.id, estado: 'PRESENTE', tomadoEn: new Date() },
  });
  await prisma.asistencia.upsert({
    where: { sesionId_participanteId: { sesionId: sesion2.id, participanteId: participante.id } },
    update: { estado: 'PRESENTE', tomadoEn: new Date() },
    create: { sesionId: sesion2.id, participanteId: participante.id, estado: 'PRESENTE', tomadoEn: new Date() },
  });
  await prisma.asistencia.upsert({
    where: { sesionId_participanteId: { sesionId: sesion3.id, participanteId: participante.id } },
    update: { estado: 'AUSENTE', tomadoEn: new Date() },
    create: { sesionId: sesion3.id, participanteId: participante.id, estado: 'AUSENTE', tomadoEn: new Date() },
  });

  // 5) CV (solo metadata; texto del PDF se extraerá luego)
  await prisma.cv.create({
    data: {
      participanteId: participante.id,
      url: 'https://example.com/demo-cv.pdf',
      version: 'v1',
      texto:
        'Profesional multidisciplinario con experiencia en atención al cliente, coordinación operativa, elaboración de materiales educativos y campañas de marketing. Competencias clave: comunicación, liderazgo, orientación al servicio, planificación y análisis. Participación en proyectos de mejora de procesos y gestión de inventarios. ',
    },
  });

  console.log('✅ Seed completo');
  console.log('Participante ID:', participante.id);
  console.log('Inscripción ID:', inscripcion.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



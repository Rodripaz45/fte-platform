"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding demo data...');
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
    const rolTrainer = await prisma.rol.upsert({
        where: { nombre: 'TRAINER' },
        update: {},
        create: { nombre: 'TRAINER' },
    });
    const trainerUsuario = await prisma.usuario.upsert({
        where: { email: 'demo.trainer@fte.local' },
        update: {},
        create: {
            nombre: 'Demo Trainer',
            email: 'demo.trainer@fte.local',
            passwordHash: 'seeded',
            estado: 'ACTIVO',
        },
    });
    await prisma.usuarioRol.upsert({
        where: {
            usuarioId_rolId: {
                usuarioId: trainerUsuario.id,
                rolId: rolTrainer.id,
            },
        },
        update: {},
        create: {
            usuarioId: trainerUsuario.id,
            rolId: rolTrainer.id,
        },
    });
    const taller = await prisma.taller.create({
        data: {
            tema: 'marketing digital y redes sociales',
            modalidad: 'PRESENCIAL',
            cupos: 30,
            sede: 'Sede Central',
            estado: 'PROGRAMADO',
            trainerId: trainerUsuario.id,
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
    await prisma.cv.create({
        data: {
            participanteId: participante.id,
            url: 'https://example.com/demo-cv.pdf',
            version: 'v1',
            texto: 'Profesional multidisciplinario con experiencia en atención al cliente, coordinación operativa, elaboración de materiales educativos y campañas de marketing. Competencias clave: comunicación, liderazgo, orientación al servicio, planificación y análisis. Participación en proyectos de mejora de procesos y gestión de inventarios. ',
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
//# sourceMappingURL=seed.js.map
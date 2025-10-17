-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "estado" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "usuarioId" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "participantes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "documento" TEXT,
    "telefono" TEXT,
    "genero" TEXT,
    "fecha_nac" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talleres" (
    "id" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "cupos" INTEGER,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "sede" TEXT,
    "estado" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talleres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" TEXT NOT NULL,
    "taller_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TIMESTAMP(3),
    "hora_fin" TIMESTAMP(3),
    "responsable_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" TEXT NOT NULL,
    "taller_id" TEXT NOT NULL,
    "participante_id" TEXT NOT NULL,
    "origen" TEXT,
    "estado" TEXT,
    "dedupe_hash" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "sesion_id" TEXT NOT NULL,
    "participante_id" TEXT NOT NULL,
    "estado" TEXT,
    "tomado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_asistencia" (
    "id" TEXT NOT NULL,
    "asistencia_id" TEXT NOT NULL,
    "tipo" TEXT,
    "url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retroalimentaciones" (
    "id" TEXT NOT NULL,
    "taller_id" TEXT NOT NULL,
    "participante_id" TEXT NOT NULL,
    "puntaje" INTEGER,
    "comentario" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retroalimentaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "canal" TEXT,
    "tipo" TEXT,
    "estado" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cvs" (
    "id" TEXT NOT NULL,
    "participante_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "version" TEXT,
    "subido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,

    CONSTRAINT "competencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles_competencias" (
    "id" TEXT NOT NULL,
    "participante_id" TEXT NOT NULL,
    "competencia_id" TEXT NOT NULL,
    "nivel" INTEGER,
    "confianza" DOUBLE PRECISION,
    "fuente" TEXT,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_competencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "participantes_usuario_id_key" ON "participantes"("usuario_id");

-- CreateIndex
CREATE INDEX "sesiones_taller_id_idx" ON "sesiones"("taller_id");

-- CreateIndex
CREATE INDEX "inscripciones_taller_id_idx" ON "inscripciones"("taller_id");

-- CreateIndex
CREATE INDEX "inscripciones_participante_id_idx" ON "inscripciones"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_taller_id_participante_id_key" ON "inscripciones"("taller_id", "participante_id");

-- CreateIndex
CREATE INDEX "asistencias_sesion_id_idx" ON "asistencias"("sesion_id");

-- CreateIndex
CREATE INDEX "asistencias_participante_id_idx" ON "asistencias"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_sesion_id_participante_id_key" ON "asistencias"("sesion_id", "participante_id");

-- CreateIndex
CREATE INDEX "evidencias_asistencia_asistencia_id_idx" ON "evidencias_asistencia"("asistencia_id");

-- CreateIndex
CREATE INDEX "retroalimentaciones_taller_id_idx" ON "retroalimentaciones"("taller_id");

-- CreateIndex
CREATE INDEX "retroalimentaciones_participante_id_idx" ON "retroalimentaciones"("participante_id");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_id_idx" ON "notificaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "cvs_participante_id_idx" ON "cvs"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "competencias_nombre_key" ON "competencias"("nombre");

-- CreateIndex
CREATE INDEX "perfiles_competencias_participante_id_idx" ON "perfiles_competencias"("participante_id");

-- CreateIndex
CREATE INDEX "perfiles_competencias_competencia_id_idx" ON "perfiles_competencias"("competencia_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_competencias_participante_id_competencia_id_key" ON "perfiles_competencias"("participante_id", "competencia_id");

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "talleres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "talleres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_asistencia" ADD CONSTRAINT "evidencias_asistencia_asistencia_id_fkey" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retroalimentaciones" ADD CONSTRAINT "retroalimentaciones_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "talleres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retroalimentaciones" ADD CONSTRAINT "retroalimentaciones_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_competencias" ADD CONSTRAINT "perfiles_competencias_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_competencias" ADD CONSTRAINT "perfiles_competencias_competencia_id_fkey" FOREIGN KEY ("competencia_id") REFERENCES "competencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

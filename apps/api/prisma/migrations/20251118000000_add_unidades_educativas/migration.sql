-- AlterTable
ALTER TABLE "talleres" ADD COLUMN "tipo" TEXT;
ALTER TABLE "talleres" ADD COLUMN "unidad_educativa_id" TEXT;

-- CreateTable
CREATE TABLE "unidades_educativas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,
    "direccion" TEXT,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidades_educativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_participantes_ue" (
    "id" TEXT NOT NULL,
    "unidad_educativa_id" TEXT NOT NULL,
    "taller_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "genero" TEXT,
    "fecha_nac" TIMESTAMP(3),
    "estado" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lista_participantes_ue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias_ue" (
    "id" TEXT NOT NULL,
    "sesion_id" TEXT NOT NULL,
    "lista_participante_ue_id" TEXT NOT NULL,
    "estado" TEXT,
    "tomado_en" TIMESTAMP(3),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_ue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unidades_educativas_codigo_key" ON "unidades_educativas"("codigo");

-- CreateIndex
CREATE INDEX "talleres_unidad_educativa_id_idx" ON "talleres"("unidad_educativa_id");

-- CreateIndex
CREATE INDEX "lista_participantes_ue_taller_id_idx" ON "lista_participantes_ue"("taller_id");

-- CreateIndex
CREATE INDEX "lista_participantes_ue_unidad_educativa_id_idx" ON "lista_participantes_ue"("unidad_educativa_id");

-- CreateIndex
CREATE INDEX "lista_participantes_ue_documento_idx" ON "lista_participantes_ue"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_ue_sesion_id_lista_participante_ue_id_key" ON "asistencias_ue"("sesion_id", "lista_participante_ue_id");

-- CreateIndex
CREATE INDEX "asistencias_ue_sesion_id_idx" ON "asistencias_ue"("sesion_id");

-- CreateIndex
CREATE INDEX "asistencias_ue_lista_participante_ue_id_idx" ON "asistencias_ue"("lista_participante_ue_id");

-- AddForeignKey
ALTER TABLE "talleres" ADD CONSTRAINT "talleres_unidad_educativa_id_fkey" FOREIGN KEY ("unidad_educativa_id") REFERENCES "unidades_educativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_participantes_ue" ADD CONSTRAINT "lista_participantes_ue_unidad_educativa_id_fkey" FOREIGN KEY ("unidad_educativa_id") REFERENCES "unidades_educativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_participantes_ue" ADD CONSTRAINT "lista_participantes_ue_taller_id_fkey" FOREIGN KEY ("taller_id") REFERENCES "talleres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_ue" ADD CONSTRAINT "asistencias_ue_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_ue" ADD CONSTRAINT "asistencias_ue_lista_participante_ue_id_fkey" FOREIGN KEY ("lista_participante_ue_id") REFERENCES "lista_participantes_ue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


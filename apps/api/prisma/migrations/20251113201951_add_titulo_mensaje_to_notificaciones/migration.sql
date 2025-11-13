-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "mensaje" TEXT,
ADD COLUMN     "titulo" TEXT;

-- CreateIndex
CREATE INDEX "notificaciones_estado_idx" ON "notificaciones"("estado");

-- AlterTable
ALTER TABLE "sesiones" ADD COLUMN     "codigo_qr" TEXT,
ADD COLUMN     "codigo_qr_expiracion" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "sesiones_codigo_qr_idx" ON "sesiones"("codigo_qr");

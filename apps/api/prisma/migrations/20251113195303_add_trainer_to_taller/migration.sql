/*
  Warnings:

  - Added the required column `trainer_id` to the `talleres` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "talleres" ADD COLUMN     "trainer_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "talleres_trainer_id_idx" ON "talleres"("trainer_id");

-- AddForeignKey
ALTER TABLE "talleres" ADD CONSTRAINT "talleres_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `Bus` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Bus_driverId_key` ON `Bus`(`driverId`);

/*
  Warnings:

  - The primary key for the `bus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `bus` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `driverId` on the `bus` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `busstop` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `busstop` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `userId` on the `checkin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `busStopId` on the `checkin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `bus` DROP FOREIGN KEY `Bus_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `checkin` DROP FOREIGN KEY `CheckIn_busStopId_fkey`;

-- DropForeignKey
ALTER TABLE `checkin` DROP FOREIGN KEY `CheckIn_userId_fkey`;

-- DropIndex
DROP INDEX `CheckIn_busStopId_fkey` ON `checkin`;

-- DropIndex
DROP INDEX `CheckIn_userId_fkey` ON `checkin`;

-- AlterTable
ALTER TABLE `bus` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `driverId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `busstop` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `checkin` MODIFY `userId` INTEGER NOT NULL,
    MODIFY `busStopId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Bus` ADD CONSTRAINT `Bus_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_busStopId_fkey` FOREIGN KEY (`busStopId`) REFERENCES `BusStop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

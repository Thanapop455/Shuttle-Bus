/*
  Warnings:

  - You are about to drop the column `busStopId` on the `bus` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `bus` DROP FOREIGN KEY `Bus_busStopId_fkey`;

-- DropIndex
DROP INDEX `Bus_busStopId_fkey` ON `bus`;

-- AlterTable
ALTER TABLE `bus` DROP COLUMN `busStopId`;

-- AlterTable
ALTER TABLE `checkin` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'waiting';

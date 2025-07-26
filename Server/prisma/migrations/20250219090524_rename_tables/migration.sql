/*
  Warnings:

  - You are about to drop the column `timestamp` on the `checkin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `checkin` DROP COLUMN `timestamp`,
    ADD COLUMN `people` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

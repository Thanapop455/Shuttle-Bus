-- DropForeignKey
ALTER TABLE `checkin` DROP FOREIGN KEY `CheckIn_userId_fkey`;

-- DropIndex
DROP INDEX `CheckIn_userId_fkey` ON `checkin`;

-- AlterTable
ALTER TABLE `checkin` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

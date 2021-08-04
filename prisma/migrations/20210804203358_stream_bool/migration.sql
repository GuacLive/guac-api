/*
  Warnings:

  - You are about to alter the column `live` on the `stream` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `notifications` MODIFY `read_at` TIMESTAMP(0),
    MODIFY `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updated_at` TIMESTAMP(0),
    MODIFY `deleted_at` TIMESTAMP(0);

-- AlterTable
ALTER TABLE `stream` MODIFY `private` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `live` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `time` TIMESTAMP(0);

-- AlterTable
ALTER TABLE `notifications` MODIFY `read_at` DATETIME(3),
    MODIFY `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updated_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `deleted_at` DATETIME(3);

-- AlterTable
ALTER TABLE `stream` MODIFY `time` DATETIME(3);

-- AlterTable
ALTER TABLE `stream_archives` MODIFY `time` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stream_panels` MODIFY `time` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0);

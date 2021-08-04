-- CreateTable
CREATE TABLE `activation_tokens` (
    `act_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `token` VARCHAR(60) NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`act_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bans` (
    `ban_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`ban_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `category_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(255),
    `cover` VARCHAR(255),
    `released` DATE,
    `rawg_id` BIGINT,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channel_bans` (
    `ban_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `reason` VARCHAR(100),
    `banned_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `channel_bans_ibfk_2`(`user_id`),
    UNIQUE INDEX `channel_bans_uniq_1`(`room_id`, `user_id`),
    PRIMARY KEY (`ban_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channel_mods` (
    `mod_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `modded_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `channel_mods_ibfk_2`(`user_id`),
    UNIQUE INDEX `channel_mods_uniq_1`(`room_id`, `user_id`),
    PRIMARY KEY (`mod_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channel_timeouts` (
    `timeout_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `time` BIGINT NOT NULL,

    PRIMARY KEY (`timeout_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clips` (
    `clip_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `clip_name` VARCHAR(255) DEFAULT 'Clip',
    `clipper_id` INTEGER UNSIGNED NOT NULL,
    `stream_id` INTEGER UNSIGNED NOT NULL,
    `video_url` VARCHAR(255) NOT NULL,
    `uuid` VARCHAR(36) NOT NULL,
    `views` BIGINT,
    `time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `category` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `clipper_id`(`clipper_id`),
    INDEX `clips_ibfk_3`(`category`),
    INDEX `stream_id`(`stream_id`),
    PRIMARY KEY (`clip_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devices` (
    `device_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `devices.token_unique`(`token`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`device_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follows` (
    `from_id` INTEGER UNSIGNED NOT NULL,
    `to_id` INTEGER UNSIGNED NOT NULL,
    `followed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`from_id`, `to_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `notification_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `from_user_id` INTEGER UNSIGNED,
    `action` VARCHAR(255),
    `message` VARCHAR(255),
    `rendered` VARCHAR(255),
    `item_type` VARCHAR(255),
    `item_id` VARCHAR(255),
    `read_at` TIMESTAMP(0),
    `created_at` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0),
    `deleted_at` TIMESTAMP(0),

    INDEX `notifications_created_at_index`(`created_at`),
    INDEX `notifications_deleted_at_index`(`deleted_at`),
    INDEX `notifications_from_user_id_index`(`from_user_id`),
    INDEX `notifications_user_id_index`(`user_id`),
    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stream` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `private` BOOLEAN NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `live` VARCHAR(100) NOT NULL,
    `views` BIGINT NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `category` INTEGER UNSIGNED,
    `type` VARCHAR(25),
    `time` TIMESTAMP(0),
    `banner` VARCHAR(255),
    `streamServer` VARCHAR(255) DEFAULT 'lon.stream.guac.live',
    `mature` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `stream.user_id_unique`(`user_id`),
    INDEX `category`(`category`),
    INDEX `stream_index`(`id`),
    INDEX `stream_server_index`(`streamServer`),
    INDEX `title`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stream_archives` (
    `archive_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `duration` BIGINT UNSIGNED NOT NULL,
    `stream` VARCHAR(255) NOT NULL,
    `thumbnail` VARCHAR(255) NOT NULL,
    `random` VARCHAR(40),
    `time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `streamName` VARCHAR(255) NOT NULL,
    `views` BIGINT NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`archive_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stream_config` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `archive` BOOLEAN NOT NULL,
    `bitrateLimit` INTEGER,
    `stream_id` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `stream_config.stream_id_unique`(`stream_id`),
    INDEX `stream_config_index`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stream_keys` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `stream_key` VARCHAR(128) NOT NULL,
    `stream_id` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stream_panels` (
    `panel_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(100),
    `description` TEXT NOT NULL,
    `time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`panel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stream_webhooks` (
    `hook_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`hook_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `plan_id` INTEGER UNSIGNED NOT NULL,
    `plan_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `interval` VARCHAR(10) NOT NULL,
    `price` DECIMAL(8, 2) NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `stream_id` INTEGER UNSIGNED NOT NULL,

    INDEX `stream_id`(`stream_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `subscription_plans_id` INTEGER UNSIGNED NOT NULL,
    `start_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expiration_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` VARCHAR(15) NOT NULL,
    `recurring_payment_id` VARCHAR(25) NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,

    INDEX `subscription_plans_id`(`subscription_plans_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_types` (
    `type_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(25) NOT NULL,

    UNIQUE INDEX `user_types.type_unique`(`type`),
    PRIMARY KEY (`type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(200) NOT NULL,
    `registered_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `activated` BOOLEAN NOT NULL DEFAULT false,
    `type` VARCHAR(25) NOT NULL DEFAULT 'user',
    `avatar` VARCHAR(255),
    `email` VARCHAR(255) NOT NULL,
    `banned` BOOLEAN NOT NULL DEFAULT false,
    `color` BINARY(3),
    `patreon` LONGTEXT,
    `publicKey` VARCHAR(2048),
    `privateKey` VARCHAR(2048),

    UNIQUE INDEX `users.username_unique`(`username`),
    UNIQUE INDEX `users.email_unique`(`email`),
    INDEX `email`(`email`),
    INDEX `user_types_ibfk_1`(`type`),
    INDEX `username`(`username`),
    INDEX `users_id_index`(`user_id`),
    INDEX `users_name_index`(`username`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activation_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bans` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_bans` ADD FOREIGN KEY (`room_id`) REFERENCES `stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_bans` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_mods` ADD FOREIGN KEY (`room_id`) REFERENCES `stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_mods` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clips` ADD FOREIGN KEY (`category`) REFERENCES `categories`(`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clips` ADD FOREIGN KEY (`clipper_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clips` ADD FOREIGN KEY (`stream_id`) REFERENCES `stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD FOREIGN KEY (`from_user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stream` ADD FOREIGN KEY (`category`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stream_archives` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stream_config` ADD FOREIGN KEY (`stream_id`) REFERENCES `stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stream_panels` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stream_webhooks` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_plans` ADD FOREIGN KEY (`stream_id`) REFERENCES `stream`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_plans` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD FOREIGN KEY (`subscription_plans_id`) REFERENCES `subscription_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD FOREIGN KEY (`type`) REFERENCES `user_types`(`type`) ON DELETE CASCADE ON UPDATE CASCADE;

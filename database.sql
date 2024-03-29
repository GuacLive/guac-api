SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `categories` (
  `category_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `channel_bans` (
  `ban_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `reason` varchar(100) DEFAULT NULL,
  `banned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(`ban_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `channel_timeouts` (
  `timeout_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `time` BIGINT NOT NULL,
   PRIMARY KEY(`timeout_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `channel_mods` (
  `mod_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_id` int(11) UNSIGNED NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `modded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mod_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stream` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `private` BOOLEAN NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `live` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `views` bigint(20) NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `category` int(11) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category` (`category`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stream_keys` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `stream_key` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stream_id` int(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `user_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `follows` (
  `from_id` int(11) UNSIGNED NOT NULL,
  `to_id` int(11) UNSIGNED NOT NULL,
  `followed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`from_id`, `to_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `devices` (
  `device_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `token` varchar(255) UNIQUE NOT NULL,
  `type` varchar(100) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY(`device_id`),
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `user_types` (
  `type_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(25) NOT NULL UNIQUE,
   PRIMARY KEY(`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stream_webhooks` (
  `hook_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `url` varchar(255) NOT NULL,
   PRIMARY KEY(`hook_id`),
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stream_panels` (
  `panel_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `title` varchar(100) NULL,
  `description` TEXT NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY(`panel_id`),
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `stream_archives` (
  `archive_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `duration` bigint(30) UNSIGNED NOT NULL,
  `stream` varchar(255) NOT NULL,
  `thumbnail` varchar(255) NOT NULL,
  `random` varchar(40) NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY(`archive_id`),
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bans` (
  `ban_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `reason` varchar(255) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY(`ban_id`),
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `activation_tokens` (
  `act_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `token` varchar(60) NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subscription_plans` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) UNSIGNED NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `interval` varchar(10) NOT NULL,
  `price` decimal(8, 2) NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  `stream_id` int(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`user_id`) REFERENCES users(`user_id`),
  FOREIGN KEY(`stream_id`) REFERENCES stream(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subscriptions` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `subscription_plans_id` int(11) UNSIGNED NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiration_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(15) NOT NULL,
  `recurring_payment_id` VARCHAR(25) NOT NULL,
  `user_id` int(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`user_id`) REFERENCES users(`user_id`),
  FOREIGN KEY(`subscription_plans_id`) REFERENCES subscription_plans(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `stream_config` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `archive` BOOLEAN COLLATE utf8mb4_unicode_ci NOT NULL,
  `bitrateLimit` int(11),
  `stream_id` int(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`stream_id`) REFERENCES stream(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `clips` (
  `clip_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `clip_name` varchar(255) DEFAULT 'Clip',
  `clipper_id` int(11) UNSIGNED NOT NULL,
  `stream_id` int(11) UNSIGNED NOT NULL,
  `video_url` varchar(255) NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `views` bigint(20),
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY(`clip_id`),
   FOREIGN KEY(`stream_id`) REFERENCES stream(`id`),
   FOREIGN KEY(`clipper_id`) REFERENCES users(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `notifications` (
  `notification_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL,
  `from_user_id` int(11) UNSIGNED NULL DEFAULT NULL,
  `action` varchar(255) NULL DEFAULT NULL,
  `message` varchar(255) NULL DEFAULT NULL,
  `rendered` varchar(255) NULL DEFAULT NULL,
  `item_type` varchar(255) NULL DEFAULT NULL,
  `item_id` varchar(255) NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
   PRIMARY KEY(`notification_id`) USING BTREE,
   FOREIGN KEY(`user_id`) REFERENCES users(`user_id`),
   FOREIGN KEY(`from_user_id`) REFERENCES users(`user_id`),
   
    INDEX `notifications_user_id_index` (`user_id`) USING BTREE,
    INDEX `notifications_created_at_index` (`created_at`) USING BTREE,
    INDEX `notifications_from_user_id_index` (`from_user_id`) USING BTREE,
    INDEX `notifications_deleted_at_index` (`deleted_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users` ADD `activated` BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE `channel_bans`
  ADD CONSTRAINT `channel_bans_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `stream` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `channel_bans_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `channel_bans`
  ADD CONSTRAINT `channel_bans_uniq_1` UNIQUE KEY(`room_id`, `user_id`);

ALTER TABLE `channel_mods`
  ADD CONSTRAINT `channel_mods_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `stream` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `channel_mods_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `channel_mods`
  ADD CONSTRAINT `channel_mods_uniq_1` UNIQUE KEY(`room_id`, `user_id`);

ALTER TABLE `stream`
  ADD CONSTRAINT `category` FOREIGN KEY (`category`) REFERENCES `categories` (`category_id`);

ALTER TABLE `users`
  ADD COLUMN `type` varchar(25) NOT NULL DEFAULT 'user',
  ADD CONSTRAINT `user_types_ibfk_1` FOREIGN KEY (`type`) REFERENCES `user_types` (`type`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `users`
  ADD COLUMN `avatar` varchar(255) NULL;

ALTER TABLE `users`
  ADD COLUMN `email` varchar(255) NULL;

ALTER TABLE `stream`
  ADD COLUMN `type` varchar(25) NULL;

ALTER TABLE `users` ADD FULLTEXT(username);
ALTER TABLE `users` ADD FULLTEXT(email);
ALTER TABLE `stream` ADD FULLTEXT(title);

ALTER TABLE `users`
  ADD COLUMN `banned` boolean not null default 0;

ALTER TABLE `stream`
  ADD COLUMN `time` timestamp NULL;

ALTER TABLE `users` MODIFY COLUMN `username` varchar(255) UNIQUE NOT NULL;
ALTER TABLE `users` MODIFY COLUMN `email` varchar(255) UNIQUE NOT NULL;

ALTER TABLE `users`
  ADD COLUMN `color` BINARY(3) NULL;

ALTER TABLE `users`
  ADD COLUMN `patreon` JSON NULL
  CHECK (JSON_VALID(`patreon`));

ALTER TABLE `categories`
  ADD COLUMN `slug` VARCHAR(255) NULL;

ALTER TABLE `categories`
  ADD COLUMN `cover` VARCHAR(255) NULL;

ALTER TABLE `categories`
  ADD COLUMN `released` DATE NULL;

ALTER TABLE `categories`
  ADD COLUMN `rawg_id` BIGINT NULL;

ALTER TABLE `users`
  ADD COLUMN `publicKey` varchar(2048) NULL,
  ADD COLUMN `privateKey` varchar(2048) NULL;

ALTER TABLE `stream`
  ADD COLUMN `banner` VARCHAR(255) NULL;

ALTER TABLE `stream`
  ADD COLUMN `streamServer` VARCHAR(255) DEFAULT 'lon.stream.guac.live';
ALTER TABLE `stream_archives`
 ADD COLUMN `streamName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `stream_archives`
 ADD COLUMN `views` bigint(20) NOT NULL;

ALTER TABLE `stream_config`
  ADD CONSTRAINT `stream_config_uniq_1` UNIQUE KEY(`stream_id`);

ALTER TABLE `stream`
  MODIFY `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `stream`
  ADD COLUMN `mature` boolean not null default 0;

ALTER TABLE `clips`
  ADD COLUMN `category` int(11) UNSIGNED not null default 0;
  
ALTER TABLE `clips`
  ADD CONSTRAINT `clips_ibfk_3` FOREIGN KEY (`category`) REFERENCES `categories` (`category_id`);
  


ALTER TABLE `stream_panels`
  MODIFY `description` TEXT  COLLATE utf8mb4_unicode_ci NOT NULL;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
CREATE INDEX stream_index ON stream (id);
CREATE INDEX stream_config_index ON stream_config (id);
CREATE INDEX stream_server_index ON stream (streamServer);
CREATE INDEX users_name_index ON users (username);
CREATE INDEX users_id_index ON users (user_id);


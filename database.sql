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
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
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

ALTER TABLE `users` ADD FULLTEXT(username);
ALTER TABLE `stream` ADD FULLTEXT(title);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

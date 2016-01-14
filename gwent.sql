-- phpMyAdmin SQL Dump
-- version 4.0.5
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Янв 14 2016 г., 23:19
-- Версия сервера: 5.5.30-log
-- Версия PHP: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- База данных: `gwent`
--

-- --------------------------------------------------------

--
-- Структура таблицы `abilities`
--

CREATE TABLE IF NOT EXISTS `abilities` (
  `id_ability` int(11) NOT NULL AUTO_INCREMENT,
  `name_ability` varchar(50) DEFAULT NULL,
  `name_function` varchar(50) DEFAULT NULL,
  `pict_ability` text,
  `description_ability` text,
  PRIMARY KEY (`id_ability`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `cards`
--

CREATE TABLE IF NOT EXISTS `cards` (
  `id_card` int(11) NOT NULL AUTO_INCREMENT,
  `name_card` varchar(100) DEFAULT NULL,
  `id_race_card` int(11) DEFAULT NULL,
  `id_class_card` int(11) DEFAULT NULL,
  `strength_card` int(11) DEFAULT NULL,
  `id_ability_card` int(11) DEFAULT NULL,
  `hero_card` tinyint(1) NOT NULL DEFAULT '0',
  `pict_card` text,
  `description_card` text,
  PRIMARY KEY (`id_card`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id_class` int(11) NOT NULL AUTO_INCREMENT,
  `name_class` varchar(50) NOT NULL,
  `pict_class` text,
  `description_class` text,
  PRIMARY KEY (`id_class`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `list_of_battles`
--

CREATE TABLE IF NOT EXISTS `list_of_battles` (
  `id_battle` int(10) NOT NULL AUTO_INCREMENT,
  `pl1` varchar(40) DEFAULT NULL,
  `pl2` varchar(40) DEFAULT NULL,
  `pass_battle` varchar(40) DEFAULT NULL,
  `start_battle` tinyint(1) DEFAULT '0',
  `alias_battle` varchar(80) DEFAULT NULL,
  `date_battle` bigint(16) DEFAULT NULL,
  UNIQUE KEY `id_battle` (`id_battle`),
  KEY `alias_battle` (`alias_battle`) USING BTREE,
  KEY `alias_battle_2` (`alias_battle`) USING BTREE
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=59 ;

-- --------------------------------------------------------

--
-- Структура таблицы `races`
--

CREATE TABLE IF NOT EXISTS `races` (
  `id_race` int(11) NOT NULL AUTO_INCREMENT,
  `name_race` varchar(50) DEFAULT NULL,
  `pict_race` text,
  `description_race` text,
  PRIMARY KEY (`id_race`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('GAHv8fdOyIn3LeRfyfvhh9N9cDKsNNkq', 1453399090, 0x7b22636f6f6b6965223a7b226f726967696e616c4d6178416765223a3539393939393939362c2265787069726573223a22323031362d30312d32315431373a35383a31302e3137355a222c22687474704f6e6c79223a747275652c2270617468223a222f227d2c2275736572223a22777777227d),
('qqIFl5vn5XOVRCxEU_7ib1bvhv75v5kt', 1453300922, 0x7b22636f6f6b6965223a7b226f726967696e616c4d6178416765223a3630303030303030302c2265787069726573223a22323031362d30312d32305431343a34323a30312e3934305a222c22687474704f6e6c79223a747275652c2270617468223a222f227d2c2275736572223a2271717171227d);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(40) NOT NULL,
  `user_pass` varchar(100) NOT NULL,
  `battles` varchar(100) DEFAULT NULL,
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=12 ;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `user_name`, `user_pass`, `battles`) VALUES
(6, 'qqq', '$2a$10$nfUupzFnIIdJ1fuYyfiMAuGdCN5ZG819F2BCJwvWplGNMMnN9ks5S', NULL),
(9, 'jenek04', '$2a$10$LNPVo8mGzPnjbqtGil07YeP8WeBkI9xyq1h3KCei.46KQ7Z.JlWmS', NULL),
(10, 'www', '$2a$10$ZNdQhpRUyeVEWmyjuGy.VON7OuSFIKQCTqWl2gk64QmLKRFCutnKG', NULL),
(11, 'qqqq', '$2a$10$iPOZvHJiBi2BpwP1PIf3yuT22n05mdyWgOFhyYDBqzJ9txCS2x..O', NULL);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

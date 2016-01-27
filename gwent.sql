-- phpMyAdmin SQL Dump
-- version 4.4.11
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Янв 27 2016 г., 16:08
-- Версия сервера: 5.5.44-log
-- Версия PHP: 5.4.41

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `gwent`
--

-- --------------------------------------------------------

--
-- Структура таблицы `abilities`
--

CREATE TABLE IF NOT EXISTS `abilities` (
  `id_ability` int(11) NOT NULL,
  `name_ability` varchar(50) DEFAULT NULL,
  `name_function` varchar(50) DEFAULT NULL,
  `pict_ability` text,
  `description_ability` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `cards`
--

CREATE TABLE IF NOT EXISTS `cards` (
  `id_card` int(11) NOT NULL,
  `name_card` varchar(100) DEFAULT NULL,
  `id_race_card` int(11) DEFAULT NULL,
  `id_class_card` int(11) DEFAULT NULL,
  `strength_card` int(11) DEFAULT NULL,
  `id_ability_card` int(11) DEFAULT NULL,
  `hero_card` tinyint(1) NOT NULL DEFAULT '0',
  `pict_card` text,
  `description_card` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id_class` int(11) NOT NULL,
  `name_class` varchar(50) NOT NULL,
  `pict_class` text,
  `description_class` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `fractions`
--

CREATE TABLE IF NOT EXISTS `fractions` (
  `id_fraction` int(11) NOT NULL,
  `name_fraction` varchar(50) DEFAULT NULL,
  `ability_fraction` varchar(50) DEFAULT NULL,
  `pict_fraction` text,
  `pict_fraction_cover` text,
  `description_fraction` text
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `fractions`
--

INSERT INTO `fractions` (`id_fraction`, `name_fraction`, `ability_fraction`, `pict_fraction`, `pict_fraction_cover`, `description_fraction`) VALUES
(6, 'Нейтральная', 'neutral', 'imgs/fractions/Default.png', 'imgs/fractions/Default_cover.png', 'Нейтральная фракция. \r\n\r\nНе имеет особых способностей.'),
(2, 'Северные Королевства', 'take_a_card_if_you_won', 'imgs/fractions/Norths.png', 'imgs/fractions/Norths_cover.png', 'Северные королевства всегда любили хорошую войну. Огромные баллисты, гигантские требушеты, монументальные осадные башни - вот она, сила! Помимо осадных орудий в ход идут шпионы, чародеи и конечно же закалённые в боях герои.\r\n\r\nИгроки этой фракции берут карту из колоды после каждого выигранного раунда.'),
(3, 'Нильфгаард', 'win_if_dead_heat', 'imgs/fractions/Nilfs.png', 'imgs/fractions/Nilfs_cover.png', 'Нильфгаард - мощнейшая империя в истории мира "Ведьмак". Благодаря достижениям в области военной инженерии их осадные и стрелковые орудия имеют большую разрушительную мощь. Также благодаря достижениям в области медицины многие бойцы (карты) имеют умение "Медик". Но если по какой-то невообразимой причине не удаётся повергнуть нордлингов, то в ход идут шпионы и различные уловки.\r\n\r\nИгроки этой фракции побеждаю в случае ничьей.'),
(4, 'Чудовища', 'leave_a_card', 'imgs/fractions/Monsters.png', 'imgs/fractions/Monsters_cover.png', 'Чудовища - невероятно опасные и безжалостные существа наводнившие мир после сопряжения сфер. Утопцы, волколаки, эндриаги, огромные заколдованные не пойми что и т.д, все это разнообразие объединилось в одну армию под предводительством короля дикой охоты. Они не используют шпионов, медиков, их тактика проста - бить, кусать и убивать.\r\n\r\nИгроки этой фракции после каждого раунда сохраняют на столе одну случайно выбранную карту.'),
(5, 'Скоя''таэли', 'goes_first', 'imgs/fractions/Elfs.png', 'imgs/fractions/Elfs_cover.png', 'Скоя''таэли  - партизанское движение нелюдей. Благодаря воинам эльфам они ловки, проворны и хорошо стреляют из лука, а благодаря краснолюдам они стойки в ближнем бою. Как и у других партизан у них отсутствуют большие, тяжелые и мощные осадные орудия. В основном для белок характерно быстрое и точное нападение и такое-же быстрое отступление в леса, где их их ожидают умелые целители.\r\n\r\nИгроки этой фракции в начале битвы решают, кто ходит первым.');

-- --------------------------------------------------------

--
-- Структура таблицы `list_of_battles`
--

CREATE TABLE IF NOT EXISTS `list_of_battles` (
  `id_battle` int(10) NOT NULL,
  `pl1` varchar(40) DEFAULT NULL,
  `pl2` varchar(40) DEFAULT NULL,
  `pass_battle` varchar(40) DEFAULT NULL,
  `start_battle` tinyint(1) DEFAULT '0',
  `alias_battle` varchar(80) DEFAULT NULL,
  `date_battle` bigint(16) DEFAULT NULL
) ENGINE=MyISAM AUTO_INCREMENT=67 DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text COLLATE utf8_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('FHgCmccqkf0Ab1ueHEoc0d27JILgDmqb', 1454488630, '{"cookie":{"originalMaxAge":599999998,"expires":"2016-02-03T08:37:10.459Z","httpOnly":true,"path":"/"},"user":"www"}');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `user_name` varchar(40) NOT NULL,
  `user_pass` varchar(100) NOT NULL,
  `battles` varchar(100) DEFAULT NULL
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `user_name`, `user_pass`, `battles`) VALUES
(6, 'qqq', '$2a$10$nfUupzFnIIdJ1fuYyfiMAuGdCN5ZG819F2BCJwvWplGNMMnN9ks5S', NULL),
(9, 'jenek04', '$2a$10$LNPVo8mGzPnjbqtGil07YeP8WeBkI9xyq1h3KCei.46KQ7Z.JlWmS', NULL),
(10, 'www', '$2a$10$ZNdQhpRUyeVEWmyjuGy.VON7OuSFIKQCTqWl2gk64QmLKRFCutnKG', NULL),
(11, 'qqqq', '$2a$10$iPOZvHJiBi2BpwP1PIf3yuT22n05mdyWgOFhyYDBqzJ9txCS2x..O', NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `abilities`
--
ALTER TABLE `abilities`
  ADD PRIMARY KEY (`id_ability`);

--
-- Индексы таблицы `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id_card`);

--
-- Индексы таблицы `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id_class`);

--
-- Индексы таблицы `fractions`
--
ALTER TABLE `fractions`
  ADD PRIMARY KEY (`id_fraction`);

--
-- Индексы таблицы `list_of_battles`
--
ALTER TABLE `list_of_battles`
  ADD UNIQUE KEY `id_battle` (`id_battle`),
  ADD KEY `alias_battle` (`alias_battle`) USING BTREE,
  ADD KEY `alias_battle_2` (`alias_battle`) USING BTREE;

--
-- Индексы таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `user_name` (`user_name`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `abilities`
--
ALTER TABLE `abilities`
  MODIFY `id_ability` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `cards`
--
ALTER TABLE `cards`
  MODIFY `id_card` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `classes`
--
ALTER TABLE `classes`
  MODIFY `id_class` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT для таблицы `fractions`
--
ALTER TABLE `fractions`
  MODIFY `id_fraction` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT для таблицы `list_of_battles`
--
ALTER TABLE `list_of_battles`
  MODIFY `id_battle` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=67;
--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=12;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

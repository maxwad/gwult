-- phpMyAdmin SQL Dump
-- version 4.4.11
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Фев 04 2016 г., 16:24
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
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `abilities`
--

INSERT INTO `abilities` (`id_ability`, `name_ability`, `name_function`, `pict_ability`, `description_ability`) VALUES
(1, 'Проворство', 'agility', 'imgs/abilities/agility.png', 'Вы можете выбрать этой карте класс  и положить в любую строку.'),
(3, 'Двойник', 'double', 'imgs/abilities/double.png', 'Вместе с этой картой на поле будут выложены  карты с таким же названием.'),
(4, 'Прилив сил', 'gain', 'imgs/abilities/gain.png', 'Карта дает прибавку +1 к силе карт в этой строке.'),
(5, 'Медик', 'medic', 'imgs/abilities/medic.png', 'Оказавшись на поле, восстанавливает одну  карту из отбоя.'),
(6, 'Шпион', 'spy', 'imgs/abilities/spy.png', 'Выкладывается на поле врага, добавляя ему свою силу, но при этом вы получаете две дополнительные карты из колоды.'),
(7, 'Прочная связь', 'support', 'imgs/abilities/support.png', 'Положив в один ряд две  карты с одинаковым названием и этой способностью, вы получите двойное усиление этих карт.'),
(9, 'Чучело', 'dummy', 'imgs/abilities/dummy.png', 'Замените этой картой любого своего юнита (не героя).');

-- --------------------------------------------------------

--
-- Структура таблицы `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id_class` int(11) NOT NULL,
  `name_class` varchar(50) DEFAULT NULL,
  `pict_class` text,
  `description_class` text
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `classes`
--

INSERT INTO `classes` (`id_class`, `name_class`, `pict_class`, `description_class`) VALUES
(2, 'Рукопашный отряд', 'imgs/classes/close_combat.png', 'Карта выкладывается в верхней строчке игрового поля.'),
(3, 'Дальнобойный отряд', 'imgs/classes/ranges_combat.png', 'Карта выкладывается в средней строке игрового поля.'),
(4, 'Осадный отряд', 'imgs/classes/siege.png', 'Карта выкладывается в нижней строке игрового поля.');

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
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

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
-- Структура таблицы `leader_cards`
--

CREATE TABLE IF NOT EXISTS `leader_cards` (
  `id_leader` int(11) NOT NULL,
  `name_leader` varchar(50) DEFAULT NULL,
  `function_leader` varchar(50) DEFAULT NULL,
  `desc_func_leader` text,
  `pict_leader` text,
  `description_leader` text
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

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
) ENGINE=MyISAM AUTO_INCREMENT=70 DEFAULT CHARSET=utf8;

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
('FHgCmccqkf0Ab1ueHEoc0d27JILgDmqb', 1455191871, '{"cookie":{"originalMaxAge":599999994,"expires":"2016-02-11T11:57:50.784Z","httpOnly":true,"path":"/"},"user":"www"}'),
('SE9bRplZkHEjhKMaD84yLdrzcoOsRD-2', 1454947031, '{"cookie":{"originalMaxAge":599999999,"expires":"2016-02-08T15:57:10.993Z","httpOnly":true,"path":"/"},"user":"www"}');

-- --------------------------------------------------------

--
-- Структура таблицы `special_cards`
--

CREATE TABLE IF NOT EXISTS `special_cards` (
  `id_special` int(11) NOT NULL,
  `name_special` varchar(50) DEFAULT NULL,
  `function_special` varchar(50) DEFAULT NULL,
  `pict_special` text,
  `description_special` text
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `special_cards`
--

INSERT INTO `special_cards` (`id_special`, `name_special`, `function_special`, `pict_special`, `description_special`) VALUES
(1, 'Чучело', '9', 'imgs/specials/spec_1.png', 'Пусть стреляют по крестьянам. А нет крестьян - поставьте чучело!');

-- --------------------------------------------------------

--
-- Структура таблицы `unit_cards`
--

CREATE TABLE IF NOT EXISTS `unit_cards` (
  `id_unit` int(11) NOT NULL,
  `name_unit` varchar(100) DEFAULT NULL,
  `id_fraction_unit` int(11) DEFAULT NULL,
  `id_class_unit` int(11) DEFAULT NULL,
  `strength_unit` int(11) DEFAULT NULL,
  `id_ability_unit` int(11) DEFAULT NULL,
  `hero_unit` tinyint(1) NOT NULL DEFAULT '0',
  `pict_unit` text,
  `description_unit` text
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `unit_cards`
--

INSERT INTO `unit_cards` (`id_unit`, `name_unit`, `id_fraction_unit`, `id_class_unit`, `strength_unit`, `id_ability_unit`, `hero_unit`, `pict_unit`, `description_unit`) VALUES
(1, 'Грёбаная пехтура', 2, 2, 1, 7, 0, 'imgs/units/sev_1.png', 'Пожертвуйте грошик ветерану Бренны!');

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
-- Индексы таблицы `leader_cards`
--
ALTER TABLE `leader_cards`
  ADD PRIMARY KEY (`id_leader`);

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
-- Индексы таблицы `special_cards`
--
ALTER TABLE `special_cards`
  ADD PRIMARY KEY (`id_special`);

--
-- Индексы таблицы `unit_cards`
--
ALTER TABLE `unit_cards`
  ADD PRIMARY KEY (`id_unit`);

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
  MODIFY `id_ability` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT для таблицы `classes`
--
ALTER TABLE `classes`
  MODIFY `id_class` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT для таблицы `fractions`
--
ALTER TABLE `fractions`
  MODIFY `id_fraction` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT для таблицы `leader_cards`
--
ALTER TABLE `leader_cards`
  MODIFY `id_leader` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT для таблицы `list_of_battles`
--
ALTER TABLE `list_of_battles`
  MODIFY `id_battle` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=70;
--
-- AUTO_INCREMENT для таблицы `special_cards`
--
ALTER TABLE `special_cards`
  MODIFY `id_special` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT для таблицы `unit_cards`
--
ALTER TABLE `unit_cards`
  MODIFY `id_unit` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=12;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

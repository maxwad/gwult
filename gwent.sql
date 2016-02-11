-- phpMyAdmin SQL Dump
-- version 4.4.11
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Фев 09 2016 г., 16:18
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
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `func` varchar(50) DEFAULT NULL,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `abilities`
--

INSERT INTO `abilities` (`id`, `name`, `func`, `pict`, `description`) VALUES
(11, 'Проворство', 'agility', 'imgs/abilities/agility.png', 'Вы можете выбрать этой карте класс  и положить в любую строку.'),
(3, 'Двойник', 'double', 'imgs/abilities/double.png', 'Вместе с этой картой на поле будут выложены  карты с таким же названием.'),
(4, 'Прилив сил', 'gain', 'imgs/abilities/gain.png', 'Карта дает прибавку +1 к силе карт в этой строке.'),
(5, 'Медик', 'medic', 'imgs/abilities/medic.png', 'Оказавшись на поле, восстанавливает одну  карту из отбоя.'),
(6, 'Шпион', 'spy', 'imgs/abilities/spy.png', 'Выкладывается на поле врага, добавляя ему свою силу, но при этом вы получаете две дополнительные карты из колоды.'),
(7, 'Прочная связь', 'support', 'imgs/abilities/support.png', 'Положив в один ряд две  карты с одинаковым названием и этой способностью, вы получите двойное усиление этих карт.'),
(9, 'Чучело', 'dummy', 'imgs/abilities/dummy.png', 'Замените этой картой любого своего юнита (не героя).'),
(1, 'Нет способности', 'none', '', 'Уникальная способность отсутствует'),
(12, 'Горн', 'commander_horn', 'imgs/abilities/commander_horn.png', 'Сила юнитов в выбранной строке удваивается.');

-- --------------------------------------------------------

--
-- Структура таблицы `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `classes`
--

INSERT INTO `classes` (`id`, `name`, `pict`, `description`) VALUES
(2, 'Рукопашный отряд', 'imgs/classes/close_combat.png', 'Карта выкладывается в верхней строчке игрового поля.'),
(3, 'Дальнобойный отряд', 'imgs/classes/ranges_combat.png', 'Карта выкладывается в средней строке игрового поля.'),
(4, 'Осадный отряд', 'imgs/classes/siege.png', 'Карта выкладывается в нижней строке игрового поля.');

-- --------------------------------------------------------

--
-- Структура таблицы `fractions`
--

CREATE TABLE IF NOT EXISTS `fractions` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `ability` varchar(50) DEFAULT NULL,
  `pict` text,
  `pict_cover` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `fractions`
--

INSERT INTO `fractions` (`id`, `name`, `ability`, `pict`, `pict_cover`, `description`) VALUES
(6, 'Нейтральная', 'neutral', 'imgs/fractions/Default.png', 'imgs/fractions/Default_cover.png', 'Нейтральная фракция. \r\n\r\nНе имеет особых способностей.'),
(2, 'Северные Королевства', 'take_a_card_if_you_won', 'imgs/fractions/Norths.png', 'imgs/fractions/Norths_cover.png', 'Северные королевства всегда любили хорошую войну. Огромные баллисты, гигантские требушеты, монументальные осадные башни - вот она, сила! Помимо осадных орудий в ход идут шпионы, чародеи и конечно же закалённые в боях герои.\r\n\r\nИгроки этой фракции берут карту из колоды после каждого выигранного раунда.'),
(3, 'Нильфгаард', 'win_if_dead_heat', 'imgs/fractions/Nilfs.png', 'imgs/fractions/Nilfs_cover.png', 'Нильфгаард - мощнейшая империя в истории мира "Ведьмак". Благодаря достижениям в области военной инженерии их осадные и стрелковые орудия имеют большую разрушительную мощь. Также благодаря достижениям в области медицины многие бойцы (карты) имеют умение "Медик". Но если по какой-то невообразимой причине не удаётся повергнуть нордлингов, то в ход идут шпионы и различные уловки.\r\n\r\nИгроки этой фракции побеждаю в случае ничьей.'),
(4, 'Чудовища', 'leave_a_card', 'imgs/fractions/Monsters.png', 'imgs/fractions/Monsters_cover.png', 'Чудовища - невероятно опасные и безжалостные существа наводнившие мир после сопряжения сфер. Утопцы, волколаки, эндриаги, огромные заколдованные не пойми что и т.д, все это разнообразие объединилось в одну армию под предводительством короля дикой охоты. Они не используют шпионов, медиков, их тактика проста - бить, кусать и убивать.\r\n\r\nИгроки этой фракции после каждого раунда сохраняют на столе одну случайно выбранную карту.'),
(5, 'Скоя''таэли', 'goes_first', 'imgs/fractions/Elfs.png', 'imgs/fractions/Elfs_cover.png', 'Скоя''таэли  - партизанское движение нелюдей. Благодаря воинам эльфам они ловки, проворны и хорошо стреляют из лука, а благодаря краснолюдам они стойки в ближнем бою. Как и у других партизан у них отсутствуют большие, тяжелые и мощные осадные орудия. В основном для белок характерно быстрое и точное нападение и такое-же быстрое отступление в леса, где их их ожидают умелые целители.\r\n\r\nИгроки этой фракции в начале битвы решают, кто ходит первым.');

-- --------------------------------------------------------

--
-- Структура таблицы `leaders`
--

CREATE TABLE IF NOT EXISTS `leaders` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `id_fraction` int(11) NOT NULL,
  `func` varchar(50) DEFAULT NULL,
  `desc_func` text,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `leaders`
--

INSERT INTO `leaders` (`id`, `name`, `id_fraction`, `func`, `desc_func`, `pict`, `description`) VALUES
(2, 'Фольтест Завоеватель', 2, 'siege_power', 'Удваивает силу всех ваших осадных отрядов (при условии, что не использован в ряду Командирский рог).', 'imgs/leaders/lid_k1.png', 'Точный выстрел из баллисты сокрушит не только укрепления врага, но и его дух.');

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
('FHgCmccqkf0Ab1ueHEoc0d27JILgDmqb', 1455623777, '{"cookie":{"originalMaxAge":599999994,"expires":"2016-02-16T11:56:17.254Z","httpOnly":true,"path":"/"},"user":"www"}');

-- --------------------------------------------------------

--
-- Структура таблицы `specials`
--

CREATE TABLE IF NOT EXISTS `specials` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `func` varchar(50) DEFAULT NULL,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `specials`
--

INSERT INTO `specials` (`id`, `name`, `func`, `pict`, `description`) VALUES
(1, 'Чучело', '9', 'imgs/specials/spec_1.png', 'Пусть стреляют по крестьянам. А нет крестьян - поставьте чучело!'),
(2, 'Командирский рог', '12', 'imgs/specials/spec_2.png', 'Плюс один к морали, минус три к слуху.');

-- --------------------------------------------------------

--
-- Структура таблицы `units`
--

CREATE TABLE IF NOT EXISTS `units` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `id_fraction` int(11) DEFAULT NULL,
  `id_class` int(11) DEFAULT NULL,
  `strength` int(11) DEFAULT NULL,
  `id_ability` int(11) DEFAULT NULL,
  `hero` tinyint(1) NOT NULL DEFAULT '0',
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `units`
--

INSERT INTO `units` (`id`, `name`, `id_fraction`, `id_class`, `strength`, `id_ability`, `hero`, `pict`, `description`) VALUES
(1, 'Грёбаная пехтура', 2, 2, 1, 7, 0, 'imgs/units/sev_1.png', 'Пожертвуйте грошик ветерану Бренны!'),
(2, 'Реданский пехотинец', 2, 2, 1, 1, 0, 'imgs/units/sev_2.png', 'Ради Редании я пойду на всё! Пока мне платят жалование.');

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
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `fractions`
--
ALTER TABLE `fractions`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `leaders`
--
ALTER TABLE `leaders`
  ADD PRIMARY KEY (`id`);

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
-- Индексы таблицы `specials`
--
ALTER TABLE `specials`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT для таблицы `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT для таблицы `fractions`
--
ALTER TABLE `fractions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT для таблицы `leaders`
--
ALTER TABLE `leaders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT для таблицы `list_of_battles`
--
ALTER TABLE `list_of_battles`
  MODIFY `id_battle` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=70;
--
-- AUTO_INCREMENT для таблицы `specials`
--
ALTER TABLE `specials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT для таблицы `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=12;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

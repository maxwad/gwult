-- phpMyAdmin SQL Dump
-- version 4.4.11
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Дек 06 2016 г., 10:30
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
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `abilities`
--

INSERT INTO `abilities` (`id`, `name`, `func`, `pict`, `description`) VALUES
(11, 'Проворство', 'agility', 'imgs/abilities/agility.png', 'Вы можете выбрать этой карте класс  и положить в любую строку.'),
(3, 'Двойник', 'double', 'imgs/abilities/double.png', 'Вместе с этой картой на поле будут выложены  карты с таким же названием.'),
(4, 'Прилив сил', 'gain', 'imgs/abilities/gain.png', 'Карта дает прибавку +1 к силе карт в этой строке (кроме себя самой).'),
(5, 'Медик', 'medic', 'imgs/abilities/medic.png', 'Оказавшись на поле, восстанавливает одну  карту из отбоя.'),
(6, 'Шпион', 'spy', 'imgs/abilities/spy.png', 'Выкладывается на поле врага, добавляя ему свою силу, но при этом вы получаете две дополнительные карты из колоды.'),
(7, 'Прочная связь', 'support', 'imgs/abilities/support.png', 'Положив в один ряд две  карты с одинаковым названием и этой способностью, вы получите двойное усиление этих карт.'),
(9, 'Чучело', 'dummy', 'imgs/abilities/dummy.png', 'Замените этой картой любого своего юнита (не героя).'),
(1, 'Нет способности', 'none', '', 'Уникальная способность отсутствует'),
(12, 'Горн', 'commander_horn', 'imgs/abilities/commander_horn.png', 'Сила юнитов в выбранной строке удваивается.'),
(13, 'Мороз', 'frost', 'imgs/abilities/frost.png', 'Снижает силу рукопашных отрядов до 1.'),
(14, 'Мгла', 'fog', 'imgs/abilities/fog.png', 'Снижает силу дальнобойных отрядов до 1.'),
(17, 'Ливень', 'downpour', 'imgs/abilities/downpour.png', 'Снижает силу осадных отрядов до 1.'),
(16, 'Ясная погода', 'clear_weather', 'imgs/abilities/clear_weather.png', 'Отменяет эффекты всех погодных карт.'),
(18, 'Казнь', 'execution', 'imgs/abilities/execution.png', 'Уничтожает самую сильную карту (или карты) на поле. Действует как на противника, так и на вас.'),
(20, 'Учётчик', 'amount', NULL, 'Даёт карте силу, равную количеству юнитов на поле игрока.');

-- --------------------------------------------------------

--
-- Структура таблицы `card_decks`
--

CREATE TABLE IF NOT EXISTS `card_decks` (
  `id_user` int(11) NOT NULL,
  `id_fraction` int(11) DEFAULT NULL,
  `units` text,
  `specials` text,
  `leader` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `card_decks`
--

INSERT INTO `card_decks` (`id_user`, `id_fraction`, `units`, `specials`, `leader`) VALUES
(10, 4, '2,3,68,81,83,80,38,40,41,37,73,74,75,76,35,36,69,70,71,72,57,58,79,66,60,61,34,78,65,67,59,39,54,53,51', '2,1,6,5,7,4,3', 8),
(14, 2, '38,41,37,35,36,34,39,81,83,80,73,74,75,76,77,78,79,65,71,53,51,17,10,11,12,1,13,22,4,5,23,18,19,24,29,28', '3,4,2,5,6,7,1', 2),
(13, -1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `classes`
--

CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `classes`
--

INSERT INTO `classes` (`id`, `name`, `pict`, `description`) VALUES
(2, 'Рукопашный отряд', 'imgs/classes/close_combat.png', 'Карта выкладывается в верхней строчке игрового поля.'),
(3, 'Дальнобойный отряд', 'imgs/classes/ranges_combat.png', 'Карта выкладывается в средней строке игрового поля.'),
(4, 'Осадный отряд', 'imgs/classes/348siege.png', 'Карта выкладывается в нижней строке игрового поля.'),
(7, 'Смешанный тип', 'imgs/classes/mixed_combat.png', 'Поле для карты (верхнее либо среднее) выбирается игроком непосредственно во время хода.');

-- --------------------------------------------------------

--
-- Структура таблицы `fractions`
--

CREATE TABLE IF NOT EXISTS `fractions` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `func` varchar(50) DEFAULT NULL,
  `desc_func` text,
  `pict` text,
  `pict_cover` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `fractions`
--

INSERT INTO `fractions` (`id`, `name`, `func`, `desc_func`, `pict`, `pict_cover`, `description`) VALUES
(6, 'Нейтральная', 'neutral', 'Не имеет особых способностей.', 'imgs/fractions/Default.png', 'imgs/fractions/Default_cover.png', 'Нейтральная фракция. '),
(2, 'Северные Королевства', 'take_a_card_if_you_won', 'Игроки этой фракции берут карту из колоды после каждого выигранного раунда.', 'imgs/fractions/Norths.png', 'imgs/fractions/Norths_cover.png', 'Северные королевства всегда любили хорошую войну. Огромные баллисты, гигантские требушеты, монументальные осадные башни - вот она, сила! Помимо осадных орудий в ход идут шпионы, чародеи и конечно же закалённые в боях герои.'),
(3, 'Нильфгаард', 'win_if_dead_heat', 'Игроки этой фракции побеждаю в случае ничьей.', 'imgs/fractions/Nilfs.png', 'imgs/fractions/Nilfs_cover.png', 'Нильфгаард - мощнейшая империя в истории мира "Ведьмак". Благодаря достижениям в области военной инженерии их осадные и стрелковые орудия имеют большую разрушительную мощь. Также благодаря достижениям в области медицины многие бойцы (карты) имеют умение "Медик". Но если по какой-то невообразимой причине не удаётся повергнуть нордлингов, то в ход идут шпионы и различные уловки.'),
(4, 'Чудовища', 'leave_a_card', 'Игроки этой фракции после каждого раунда сохраняют на столе одну случайно выбранную карту.', 'imgs/fractions/Monsters.png', 'imgs/fractions/Monsters_cover.png', 'Чудовища - невероятно опасные и безжалостные существа наводнившие мир после сопряжения сфер. Утопцы, волколаки, эндриаги, огромные заколдованные не пойми что и т.д, все это разнообразие объединилось в одну армию под предводительством короля дикой охоты. Они не используют шпионов, медиков, их тактика проста - бить, кусать и убивать.'),
(5, 'Скоя''таэли', 'goes_first', 'Игроки этой фракции в начале битвы решают, кто ходит первым.', 'imgs/fractions/Elfs.png', 'imgs/fractions/Elfs_cover.png', 'Скоя''таэли  - партизанское движение нелюдей. Благодаря воинам эльфам они ловки, проворны и хорошо стреляют из лука, а благодаря краснолюдам они стойки в ближнем бою. Как и у других партизан у них отсутствуют большие, тяжелые и мощные осадные орудия. В основном для белок характерно быстрое и точное нападение и такое-же быстрое отступление в леса, где их их ожидают умелые целители.');

-- --------------------------------------------------------

--
-- Структура таблицы `history`
--

CREATE TABLE IF NOT EXISTS `history` (
  `id` int(20) NOT NULL,
  `pl1` varchar(40) NOT NULL,
  `pl2` varchar(40) NOT NULL,
  `history` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `history`
--

INSERT INTO `history` (`id`, `pl1`, `pl2`, `history`) VALUES
(142, '', '', '{"cards":[{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":37,"name":"Весемир","id_fraction":6,"id_class":2,"strength":6,"id_ability":20,"hero":0,"pict":"imgs/units/neit_4.png","description":"Перед казнью попроси воды. Кто знает, что случится, пока её принесут.","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"amount","number_move":1},"resolution":0,"give_up":0},{"user_room":"142","player_index":1,"rival_index":0,"user_id":14,"card":{"id":36,"name":"Эмиель Регис","id_fraction":6,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/neit_3.png","description":"Я, деликатно говоря, считаюсь чудовищем. Кровожадным монстром.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":1},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":59,"name":"Главоглаз","id_fraction":4,"id_class":2,"strength":4,"id_ability":3,"hero":0,"pict":"imgs/units/mons_16.png","description":"Полукраб, полупаук. Словом, сучий сын.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"double","number_move":2},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":58,"name":"Главоглаз","id_fraction":4,"id_class":2,"strength":4,"id_ability":3,"hero":0,"pict":"imgs/units/mons_15.png","description":"Полукраб, полупаук. Словом, сучий сын.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"double","number_move":3},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":60,"name":"Главоглаз","id_fraction":4,"id_class":2,"strength":4,"id_ability":3,"hero":0,"pict":"imgs/units/mons_17.png","description":"Полукраб, полупаук. Словом, сучий сын.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"double","number_move":4},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":79,"name":"Главоглаз","id_fraction":4,"id_class":4,"strength":6,"id_ability":3,"hero":0,"pict":"imgs/units/mons_36.png","description":"Огромный главоглаз. Оно... оно двигается!","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"double","number_move":5},"resolution":0,"give_up":0},{"user_room":"142","player_index":1,"rival_index":0,"user_id":14,"card":{"id":11,"name":"Боец Синих Полосок","id_fraction":2,"id_class":2,"strength":4,"id_ability":7,"hero":0,"pict":"imgs/units/sev_10.png","description":"Для Темерии я готов на всё. Но обычно я для неё только убиваю.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":2},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":4,"name":"Мороз","id_ability":"13","pict":"imgs/specials/spec_p1.png","description":"Мечта хорошего командира... Кошмар плохого.","unit":0,"ability":"frost","number_move":6},"resolution":0,"give_up":0},{"user_room":"142","player_index":1,"rival_index":0,"user_id":14,"card":{"id":17,"name":"Принц Стеннис","id_fraction":2,"id_class":2,"strength":5,"id_ability":6,"hero":0,"pict":"imgs/units/sev_15.png","description":"Сразу было видно, что он хер моржовый. Ну кто ходит в золотых доспехах?!","unit":1,"fact_strength":1,"multiplier":1,"multihorn":1,"added":0,"exponent":0,"ability":"spy","number_move":3},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":61,"name":"Вампир","id_fraction":4,"id_class":2,"strength":4,"id_ability":3,"hero":0,"pict":"imgs/units/mons_18.png","description":"Гаркаин: - Славно, что вы сразу же нашпиговалися, потому как теперича я вас жрать стану.","unit":1,"fact_strength":1,"multiplier":1,"multihorn":1,"added":0,"exponent":0,"ability":"double","number_move":7},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":70,"name":"Вампир","id_fraction":4,"id_class":2,"strength":5,"id_ability":3,"hero":0,"pict":"imgs/units/mons_27.png","description":"Катакан: Мелитэле, обереги нас от зла, защити нас от когтей катакана...","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"double","number_move":8},"resolution":0,"give_up":0},"give_up",{"user_room":"142","player_index":1,"rival_index":0,"user_id":14,"card":{"id":23,"name":"Детмольд","id_fraction":2,"id_class":3,"strength":6,"id_ability":1,"hero":0,"pict":"imgs/units/sev_20.png","description":"Такими чарами выигрывают войны! Тысячи жертв в одну минуту!","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":4},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":81,"name":"Драуг","id_fraction":4,"id_class":2,"strength":10,"id_ability":1,"hero":1,"pict":"imgs/units/mons_h2.png","description":"Генерал так и не признал поражения. Продолжал сражаться даже после смерти.","unit":1,"fact_strength":10,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":9},"resolution":0,"give_up":0},{"user_room":"142","player_index":1,"rival_index":0,"user_id":14,"card":{"id":12,"name":"Боец Синих Полосок","id_fraction":2,"id_class":2,"strength":4,"id_ability":7,"hero":0,"pict":"imgs/units/sev_10.png","description":"Для Темерии я готов на всё. Но обычно я для неё только убиваю.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":5},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":73,"name":"Бес","id_fraction":4,"id_class":2,"strength":6,"id_ability":1,"hero":0,"pict":"imgs/units/mons_30.png","description":"Бес немного смахивает на оленя. Огромного, злобного оленя.","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":10},"resolution":0,"give_up":0},{"user_room":"142","player_index":1,"rival_index":0,"user_id":14,"card":{"id":1,"name":"Грёбаная пехтура","id_fraction":2,"id_class":2,"strength":1,"id_ability":7,"hero":0,"pict":"imgs/units/sev_1.png","description":"Пожертвуйте грошик ветерану Бренны!","unit":1,"fact_strength":1,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":6},"resolution":0,"give_up":0},{"user_room":"142","player_index":0,"rival_index":1,"user_id":10,"card":{"id":5,"name":"Мгла","id_ability":"14","pict":"imgs/specials/spec_p2.png","description":"Вот туман-то... Хоть глаз выколи.","unit":0,"ability":"fog","number_move":11},"resolution":0,"give_up":0},"give_up"],"count_cards":[3,6],"count_deck":[26,17],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":3,"mes_flag":1}'),
(143, '10', '14', '{"cards":[],"count_cards":[10,10],"count_deck":[0,0],"ready_status":[0,0],"resolution":[1,0],"give_up_status":[0,0],"round":1,"mes_flag":0}'),
(144, '', '', '{"cards":[],"count_cards":[10,10],"count_deck":[30,19],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":1,"mes_flag":1}'),
(145, '10', '14', '{"cards":["game_over"],"count_cards":[10,10],"count_deck":[30,19],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":1,"mes_flag":1}'),
(146, '', '', '{"cards":["game_over"],"count_cards":[10,10],"count_deck":[30,19],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":1,"mes_flag":1}'),
(148, '', '', '{"cards":[{"user_room":"148","player_index":0,"rival_index":1,"user_id":10,"card":{"id":51,"name":"Виверна","id_fraction":4,"id_class":3,"strength":2,"id_ability":1,"hero":0,"pict":"imgs/units/mons_8.png","description":"Это создание жило лишь затем, чтоб убивать.","unit":1,"fact_strength":2,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":1},"resolution":0,"give_up":0},{"user_room":"148","player_index":1,"rival_index":0,"user_id":14,"card":{"id":23,"name":"Детмольд","id_fraction":2,"id_class":3,"strength":6,"id_ability":1,"hero":0,"pict":"imgs/units/sev_20.png","description":"Такими чарами выигрывают войны! Тысячи жертв в одну минуту!","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":1},"resolution":0,"give_up":0},{"user_room":"148","player_index":0,"rival_index":1,"user_id":10,"card":{"id":72,"name":"Ледяной Великан","id_fraction":4,"id_class":4,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/mons_29.png","description":"Раз в жизни я бегал от врага. От Ледяного Великана. И вовсе этого не стыжусь.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":2},"resolution":0,"give_up":0},{"user_room":"148","player_index":1,"rival_index":0,"user_id":14,"card":{"id":36,"name":"Эмиель Регис","id_fraction":6,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/neit_3.png","description":"Я, деликатно говоря, считаюсь чудовищем. Кровожадным монстром.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":2},"resolution":0,"give_up":0},"give_up",{"user_room":"148","player_index":1,"rival_index":0,"user_id":14,"card":{"id":34,"name":"Лютик","id_fraction":6,"id_class":2,"strength":2,"id_ability":12,"hero":0,"pict":"imgs/units/neit_1a.png","description":"Ты циник, свинтус, бабник и лжец. И поверь, ничего сложного в тебе нет.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":2,"added":0,"exponent":1,"ability":"commander_horn","number_move":3},"resolution":0,"give_up":0},{"user_room":"148","player_index":0,"rival_index":1,"user_id":10,"card":{"id":69,"name":"Волколак","id_fraction":4,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/mons_26.png","description":"Не так страшен волк, как его малюют. Зато волколак куда страшней!","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":3},"resolution":0,"give_up":0},{"user_room":"148","player_index":1,"rival_index":0,"user_id":14,"card":{"id":19,"name":"Шеала де Тансервиль","id_fraction":2,"id_class":3,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/sev_17.png","description":"Нет ничего более опасного, нежели научно обоснованный шовинизм.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":4},"resolution":0,"give_up":0},"give_up","game_over","game_over"],"count_cards":[7,6],"count_deck":[30,19],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":3,"mes_flag":6}'),
(150, '', '', '{"cards":["game_over"],"count_cards":[10,10],"count_deck":[30,19],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":1,"mes_flag":1}'),
(151, '', '', '{"cards":[{"user_room":["151"],"player_index":0,"rival_index":1,"user_id":10,"card":{"id":36,"name":"Эмиель Регис","id_fraction":6,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/neit_3.png","description":"Я, деликатно говоря, считаюсь чудовищем. Кровожадным монстром.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":1},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":18,"name":"Кейра Мец","id_fraction":2,"id_class":3,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/sev_16.png","description":"Если мне сегодня суждено умереть, я хоть выглядеть хорошо буду.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":1},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":0,"rival_index":1,"user_id":10,"card":{"id":67,"name":"Вилохвост","id_fraction":4,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/mons_24.png","description":"Вилохвост... Ничего себе. Скорей уж, сука, мечехвост!","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":2},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":23,"name":"Детмольд","id_fraction":2,"id_class":3,"strength":6,"id_ability":1,"hero":0,"pict":"imgs/units/sev_20.png","description":"Такими чарами выигрывают войны! Тысячи жертв в одну минуту!","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":2},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":0,"rival_index":1,"user_id":10,"card":{"id":38,"name":"Виллентретенмерт","id_fraction":6,"id_class":2,"strength":7,"id_ability":18,"hero":0,"pict":"imgs/units/neit_5.png","description":"Дракон ушёл от удара мягким, ловким, полным грации поворотом.","unit":1,"fact_strength":7,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"execution","number_move":3},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":1,"name":"Грёбаная пехтура","id_fraction":2,"id_class":2,"strength":1,"id_ability":7,"hero":0,"pict":"imgs/units/sev_1.png","description":"Пожертвуйте грошик ветерану Бренны!","unit":1,"fact_strength":1,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":3},"resolution":0,"give_up":0},"give_up",{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":29,"name":"Катапульта","id_fraction":2,"id_class":4,"strength":8,"id_ability":7,"hero":0,"pict":"imgs/units/sev_25.png","description":"Боги на стороне того, у кого лучше катапульты...","unit":1,"fact_strength":8,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":4},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":0,"rival_index":1,"user_id":10,"card":{"id":37,"name":"Весемир","id_fraction":6,"id_class":2,"strength":6,"id_ability":20,"hero":0,"pict":"imgs/units/neit_4.png","description":"Перед казнью попроси воды. Кто знает, что случится, пока её принесут.","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"amount","number_move":4},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":24,"name":"Требушет","id_fraction":2,"id_class":4,"strength":6,"id_ability":1,"hero":0,"pict":"imgs/units/sev_21.png","description":"Один требушет стоит сотни пехотинцев. И трёх сотен лахудр вроде тебя.","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":5},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":0,"rival_index":1,"user_id":10,"card":{"id":68,"name":"Моровая дева","id_fraction":4,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/mons_25.png","description":"Больные бредили о покрытой поршой и лишаями женщине, окружённой крысами.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":5},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":4,"name":"Каэдвенский осадный мастер","id_fraction":2,"id_class":4,"strength":1,"id_ability":4,"hero":0,"pict":"imgs/units/sev_4.png","description":"Откалибруй базу на пять градусов! - Так точ... Сука, чо?","unit":1,"fact_strength":1,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"gain","number_move":6},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":0,"rival_index":1,"user_id":10,"card":{"id":83,"name":"Леший","id_fraction":4,"id_class":3,"strength":10,"id_ability":1,"hero":1,"pict":"imgs/units/mons_h4.png","description":"В этом лесу не охотятся. Никогда. Хоть бы деревня с голоду помирала.","unit":1,"fact_strength":10,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":6},"resolution":0,"give_up":0},{"user_room":["151"],"player_index":1,"rival_index":0,"user_id":14,"card":{"id":3,"name":"Казнь","id_ability":"18","pict":"imgs/specials/spec_3.png","description":"Огненные столпы обращают величайших в пепел. Остальные благоговейно трепещут.","unit":0,"ability":"execution","number_move":7},"resolution":0,"give_up":0},"game_over"],"count_cards":[4,4],"count_deck":[30,19],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":2,"mes_flag":1}'),
(152, '', '', ''),
(153, '', '', '{"cards":[{"user_room":153,"player_index":0,"rival_index":1,"user_id":10,"card":{"id":37,"name":"Весемир","id_fraction":6,"id_class":2,"strength":6,"id_ability":20,"hero":0,"pict":"imgs/units/neit_4.png","description":"Перед казнью попроси воды. Кто знает, что случится, пока её принесут.","unit":1,"fact_strength":6,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"amount","number_move":1},"resolution":0,"give_up":0},{"user_room":153,"player_index":1,"rival_index":0,"user_id":14,"card":{"id":17,"name":"Принц Стеннис","id_fraction":2,"id_class":2,"strength":5,"id_ability":6,"hero":0,"pict":"imgs/units/sev_15.png","description":"Сразу было видно, что он хер моржовый. Ну кто ходит в золотых доспехах?!","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"spy","number_move":1},"resolution":0,"give_up":0},{"user_room":153,"player_index":0,"rival_index":1,"user_id":10,"card":{"id":81,"name":"Драуг","id_fraction":4,"id_class":2,"strength":10,"id_ability":1,"hero":1,"pict":"imgs/units/mons_h2.png","description":"Генерал так и не признал поражения. Продолжал сражаться даже после смерти.","unit":1,"fact_strength":10,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":2},"resolution":0,"give_up":0},{"user_room":153,"player_index":1,"rival_index":0,"user_id":14,"card":{"id":3,"name":"Казнь","id_ability":"18","pict":"imgs/specials/spec_3.png","description":"Огненные столпы обращают величайших в пепел. Остальные благоговейно трепещут.","unit":0,"ability":"execution","number_move":2},"resolution":0,"give_up":0},{"user_room":153,"player_index":0,"rival_index":0,"user_id":14,"card":{"id":17,"name":"Принц Стеннис","id_fraction":2,"id_class":2,"strength":5,"id_ability":6,"hero":0,"pict":"imgs/units/sev_15.png","description":"Сразу было видно, что он хер моржовый. Ну кто ходит в золотых доспехах?!","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"spy","number_move":1,"delete":1},"resolution":0,"give_up":0},{"user_room":153,"player_index":0,"rival_index":1,"user_id":10,"card":{"id":36,"name":"Эмиель Регис","id_fraction":6,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/neit_3.png","description":"Я, деликатно говоря, считаюсь чудовищем. Кровожадным монстром.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":3},"resolution":0,"give_up":0},{"user_room":153,"player_index":1,"rival_index":0,"user_id":14,"card":{"id":41,"name":"Йеннифэр из Венгерберга","id_fraction":6,"id_class":3,"strength":7,"id_ability":5,"hero":1,"pict":"imgs/units/neit_h3.png","description":"Одетая только в чёрное и белое, она напоминала декабрьский рассвет.","unit":1,"fact_strength":7,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"medic","number_move":3},"resolution":0,"give_up":0},"give_up",{"user_room":153,"player_index":1,"rival_index":0,"user_id":14,"card":{"id":10,"name":"Боец Синих Полосок","id_fraction":2,"id_class":2,"strength":4,"id_ability":7,"hero":0,"pict":"imgs/units/sev_10.png","description":"Для Темерии я готов на всё. Но обычно я для неё только убиваю.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":4},"resolution":0,"give_up":0},{"user_room":153,"player_index":0,"rival_index":1,"user_id":10,"card":{"id":53,"name":"Эндриага","id_fraction":4,"id_class":3,"strength":2,"id_ability":1,"hero":0,"pict":"imgs/units/mons_10.png","description":"В лес теперь не зайдёшь. Там эндриага завелись.","unit":1,"fact_strength":2,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":4},"resolution":0,"give_up":0},{"user_room":153,"player_index":1,"rival_index":0,"user_id":14,"card":{"id":12,"name":"Боец Синих Полосок","id_fraction":2,"id_class":2,"strength":4,"id_ability":7,"hero":0,"pict":"imgs/units/sev_10.png","description":"Для Темерии я готов на всё. Но обычно я для неё только убиваю.","unit":1,"fact_strength":4,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"support","number_move":5},"resolution":0,"give_up":0},{"user_room":153,"player_index":0,"rival_index":1,"user_id":10,"card":{"id":68,"name":"Моровая дева","id_fraction":4,"id_class":2,"strength":5,"id_ability":1,"hero":0,"pict":"imgs/units/mons_25.png","description":"Больные бредили о покрытой поршой и лишаями женщине, окружённой крысами.","unit":1,"fact_strength":5,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":5},"resolution":0,"give_up":0},{"user_room":153,"player_index":0,"rival_index":1,"user_id":10,"card":{"id":83,"name":"Леший","id_fraction":4,"id_class":3,"strength":10,"id_ability":1,"hero":1,"pict":"imgs/units/mons_h4.png","description":"В этом лесу не охотятся. Никогда. Хоть бы деревня с голоду помирала.","unit":1,"fact_strength":10,"multiplier":1,"multihorn":1,"added":0,"exponent":1,"ability":"none","number_move":6},"resolution":1,"give_up":0},"give_up","game_over"],"count_cards":[4,7],"count_deck":[30,17],"ready_status":[1,1],"resolution":[1,0],"give_up_status":[0,0],"round":3,"mes_flag":1}');

-- --------------------------------------------------------

--
-- Структура таблицы `leaders`
--

CREATE TABLE IF NOT EXISTS `leaders` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `id_fraction` int(11) NOT NULL,
  `func` varchar(50) DEFAULT NULL,
  `desc_func` text,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `leaders`
--

INSERT INTO `leaders` (`id`, `name`, `id_fraction`, `func`, `desc_func`, `pict`, `description`) VALUES
(2, 'Фольтест Завоеватель', 2, 'merge', 'Берёт одну карту из отбоя противника.', 'imgs/leaders/lid_k1.png', 'Точный выстрел из баллисты сокрушит не только укрепления врага, но и его дух.'),
(3, 'Фольтест Предводитель Севера', 2, 'cancel_wheather', 'Отменяет все эффекты погодных карт.', 'imgs/leaders/lid_k2.png', 'Проклятая политика... Я доверяю только своему оружию.'),
(4, 'Фольтест Железный Владыка', 2, 'destroy_siege', 'Уничтожает самый сильный отряд противника, если общая сила его осадных отрядов равна или превышает 10.', 'imgs/leaders/lid_k3.png', 'Замечательный день для битвы.'),
(5, 'Фольтест Король темерии', 2, 'take_fog', 'Возьмите из вашей колоды Мглу и сыграйте ее немедленно.', 'imgs/leaders/lid_k4.png', 'Родственная любовь? Что может быть прекраснее, чем сестра на коленях брата?'),
(6, 'Эредин Бреакк Глас Командир Дикой Охоты', 4, 'take_wheather', 'Возьмите из вашей колоды любую погодную карту и сыграйте ее немедленно.', 'imgs/leaders/lid_m1.png', 'Ну давай. Покажи мне эти свои финты и пируэты, а я посмотрю.'),
(7, 'Эредин Бреак Глас Король Aen Elle', 4, 'double_close_combat', 'Удваивает силу всех ваших рукопашных отрядов (при условии, что не использован в ряду Командирский рог).', 'imgs/leaders/lid_m2.png', 'Держи себя в руках, Геральт. Ты же знаешь, чем это кончится.'),
(8, 'Эредин Бреак Глас Владыка Тир на Лиа', 4, 'merge', 'Верните карту из вашего отбоя в руку.', 'imgs/leaders/lid_m3.png', 'Va faill, luned.'),
(9, 'Эредин Бреак Глас Убийца Оберона', 4, 'change_two_to_one', 'Сбросьте две карты и возьмите из вашей колоды одну карту по выбору.', 'imgs/leaders/lid_m4.png', 'Это неизбежно.');

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
) ENGINE=MyISAM AUTO_INCREMENT=164 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `list_of_battles`
--

INSERT INTO `list_of_battles` (`id_battle`, `pl1`, `pl2`, `pass_battle`, `start_battle`, `alias_battle`, `date_battle`) VALUES
(156, '16', NULL, '', 0, NULL, 5463333333347),
(157, '15', '', '', 0, '15_10', 56756878444445),
(158, '17', NULL, '', 0, NULL, 12341241214143),
(160, '18', NULL, '', 0, NULL, 23465235634235);

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
('p49jlmdqUei4r9K7zYuipyvfZhh0V6fm', 1481609333, '{"cookie":{"originalMaxAge":600000000,"expires":"2016-12-13T06:08:52.880Z","httpOnly":true,"path":"/"},"user":10,"username":"www"}');

-- --------------------------------------------------------

--
-- Структура таблицы `specials`
--

CREATE TABLE IF NOT EXISTS `specials` (
  `id` int(11) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `id_ability` varchar(50) DEFAULT NULL,
  `pict` text,
  `description` text
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `specials`
--

INSERT INTO `specials` (`id`, `name`, `id_ability`, `pict`, `description`) VALUES
(1, 'Чучело', '9', 'imgs/specials/spec_1.png', 'Пусть стреляют по крестьянам. А нет крестьян - поставьте чучело!'),
(2, 'Командирский рог', '12', 'imgs/specials/spec_2.png', 'Плюс один к морали, минус три к слуху.'),
(3, 'Казнь', '18', 'imgs/specials/spec_3.png', 'Огненные столпы обращают величайших в пепел. Остальные благоговейно трепещут.'),
(4, 'Мороз', '13', 'imgs/specials/spec_p1.png', 'Мечта хорошего командира... Кошмар плохого.'),
(5, 'Мгла', '14', 'imgs/specials/spec_p2.png', 'Вот туман-то... Хоть глаз выколи.'),
(6, 'Ливень', '17', 'imgs/specials/spec_p3.png', 'В этом краю даже дождь смердит мочой.'),
(7, 'Ясное небо', '16', 'imgs/specials/spec_p4.png', 'Дромил, солнце-то светит! Значит, и надежда есть...');

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
) ENGINE=MyISAM AUTO_INCREMENT=85 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `units`
--

INSERT INTO `units` (`id`, `name`, `id_fraction`, `id_class`, `strength`, `id_ability`, `hero`, `pict`, `description`) VALUES
(1, 'Грёбаная пехтура', 2, 2, 1, 7, 0, 'imgs/units/sev_1.png', 'Пожертвуйте грошик ветерану Бренны!'),
(2, 'Реданский пехотинец', 2, 2, 1, 1, 0, 'imgs/units/sev_2.png', 'Ради Редании я пойду на всё! Пока мне платят жалование.'),
(3, 'Реданский пехотинец', 2, 2, 1, 1, 0, 'imgs/units/sev_3.png', 'Ради Редании я пойду на всё! Пока мне платят жалование.'),
(4, 'Каэдвенский осадный мастер', 2, 4, 1, 4, 0, 'imgs/units/sev_4.png', 'Откалибруй базу на пять градусов! - Так точ... Сука, чо?'),
(5, 'Каэдвенский осадный мастер', 2, 4, 1, 4, 0, 'imgs/units/sev_5.png', 'Откалибруй базу на пять градусов! - Так точ... Сука, чо?'),
(6, 'Каэдвенский осадный мастер', 2, 4, 1, 4, 0, 'imgs/units/sev_6.png', 'Откалибруй базу на пять градусов! - Так точ... Сука, чо?'),
(7, 'Талер', 2, 4, 1, 6, 0, 'imgs/units/sev_7.png', 'Я вам всем глаза на жопу натяну!'),
(8, 'Ярпен Зигрин', 2, 2, 2, 1, 0, 'imgs/units/sev_8.png', 'Что других-то слушать? Я делаю то, что считаю правильным.'),
(9, 'Шелдон Скаггс', 2, 3, 4, 1, 0, 'imgs/units/sev_9.png', 'А я стоял на первой линии, там, где горячше всего было!'),
(10, 'Боец Синих Полосок', 2, 2, 4, 7, 0, 'imgs/units/sev_10.png', 'Для Темерии я готов на всё. Но обычно я для неё только убиваю.'),
(11, 'Боец Синих Полосок', 2, 2, 4, 7, 0, 'imgs/units/sev_10.png', 'Для Темерии я готов на всё. Но обычно я для неё только убиваю.'),
(12, 'Боец Синих Полосок', 2, 2, 4, 7, 0, 'imgs/units/sev_10.png', 'Для Темерии я готов на всё. Но обычно я для неё только убиваю.'),
(13, 'Сигизмунд Дийкстра', 2, 2, 4, 6, 0, 'imgs/units/sev_11.png', 'Гвинт напоминает политику. Только честнее.'),
(14, 'Сабрина Глевиссиг', 2, 3, 4, 1, 0, 'imgs/units/sev_12.png', 'Дочь каэдвенских лесов.'),
(15, 'Бьянка', 2, 2, 5, 1, 0, 'imgs/units/sev_13.png', 'Лучше прожить один день королём, чем всю жизнь нищим.'),
(16, 'Зигфрид из Денесле', 2, 2, 5, 1, 0, 'imgs/units/sev_14.png', 'О мире очень легко говорить, но его очень сложно поддерживать.'),
(17, 'Принц Стеннис', 2, 2, 5, 6, 0, 'imgs/units/sev_15.png', 'Сразу было видно, что он хер моржовый. Ну кто ходит в золотых доспехах?!'),
(18, 'Кейра Мец', 2, 3, 5, 1, 0, 'imgs/units/sev_16.png', 'Если мне сегодня суждено умереть, я хоть выглядеть хорошо буду.'),
(19, 'Шеала де Тансервиль', 2, 3, 5, 1, 0, 'imgs/units/sev_17.png', 'Нет ничего более опасного, нежели научно обоснованный шовинизм.'),
(20, 'Рубайлы из Кринфрида', 2, 3, 5, 7, 0, 'imgs/units/sev_18.png', 'Записались мы на войну, а то с чудищами последнее время нам не шибко везёт.'),
(21, 'Рубайлы из Кринфрида', 2, 3, 5, 7, 0, 'imgs/units/sev_18.png', 'Записались мы на войну, а то с чудищами последнее время нам не шибко везёт.'),
(22, 'Лекарь Бурой Хоругви', 2, 4, 5, 5, 0, 'imgs/units/sev_19.png', 'Шейте красное с красным, жёлтое с жёлтым, белое с белым...'),
(23, 'Детмольд', 2, 3, 6, 1, 0, 'imgs/units/sev_20.png', 'Такими чарами выигрывают войны! Тысячи жертв в одну минуту!'),
(24, 'Требушет', 2, 4, 6, 1, 0, 'imgs/units/sev_21.png', 'Один требушет стоит сотни пехотинцев. И трёх сотен лахудр вроде тебя.'),
(25, 'Требушет', 2, 4, 6, 1, 0, 'imgs/units/sev_22.png', 'Один требушет стоит сотни пехотинцев. И трёх сотен лахудр вроде тебя.'),
(26, 'Баллиста', 2, 4, 6, 1, 0, 'imgs/units/sev_23.png', '- Мы даём им женские имена. \r\n- И это какая-нибудь Марыська?\r\n- Нет, это Хельга.'),
(27, 'Осадная башня', 2, 4, 6, 1, 0, 'imgs/units/sev_24.png', 'Башня на колёсах... Чего только люди не удумают!'),
(28, 'Катапульта', 2, 4, 8, 7, 0, 'imgs/units/sev_25.png', 'Боги на стороне того, у кого лучше катапульты...'),
(29, 'Катапульта', 2, 4, 8, 7, 0, 'imgs/units/sev_25.png', 'Боги на стороне того, у кого лучше катапульты...'),
(30, 'Вернон Роше', 2, 2, 10, 1, 1, 'imgs/units/sev_h1.png', 'Патриот, хоть и хер моржовый.'),
(31, 'Эстерад Тиссен', 2, 2, 10, 1, 1, 'imgs/units/sev_h2.png', 'Как все мужчины клана Тиссенидов, он был высок, могуч и бандитски красив.'),
(32, 'Ян Наталис', 2, 2, 10, 1, 1, 'imgs/units/sev_h3.png', 'Однако же приметил грозящую опасность чуткий навроде журавля Ян Наталис.'),
(33, 'Филиппа Эйльхарт', 2, 3, 10, 1, 1, 'imgs/units/sev_h4.png', 'Филиппа Эйльхарт, хоть и весьма привлекательная, была очень неприятной.'),
(34, 'Лютик', 6, 2, 2, 12, 0, 'imgs/units/neit_1a.png', 'Ты циник, свинтус, бабник и лжец. И поверь, ничего сложного в тебе нет.'),
(35, 'Золтан Хивай', 6, 2, 5, 1, 0, 'imgs/units/neit_2.png', 'Говорят, краснолюд ради товарища на виселицу пойдёт. Золтан не исключение.'),
(36, 'Эмиель Регис', 6, 2, 5, 1, 0, 'imgs/units/neit_3.png', 'Я, деликатно говоря, считаюсь чудовищем. Кровожадным монстром.'),
(37, 'Весемир', 6, 2, 6, 20, 0, 'imgs/units/neit_4.png', 'Перед казнью попроси воды. Кто знает, что случится, пока её принесут.'),
(38, 'Виллентретенмерт', 6, 2, 7, 18, 0, 'imgs/units/neit_5.png', 'Дракон ушёл от удара мягким, ловким, полным грации поворотом.'),
(39, 'Таинственный эльф', 6, 2, 0, 6, 1, 'imgs/units/neit_h1.png', 'Предсказывать несложно. Искусство в том, чтобы предсказывать точно.'),
(40, 'Трисс Меригольд', 6, 2, 7, 1, 1, 'imgs/units/neit_h2.png', 'Я могу о себе позаботиться. Поверь.'),
(41, 'Йеннифэр из Венгерберга', 6, 3, 7, 5, 1, 'imgs/units/neit_h3.png', 'Одетая только в чёрное и белое, она напоминала декабрьский рассвет.'),
(42, 'Цирилла', 6, 2, 15, 1, 1, 'imgs/units/neit_h4.png', 'Знаешь, когда сказки перестают быть сказками? Когда в них начинают верить.'),
(43, 'Геральт из Ривии', 6, 2, 15, 1, 1, 'imgs/units/neit_h5.png', 'Если надо выбирать между одним злом и другим, я предпочитаю не выбирать.'),
(44, 'Гуль', 4, 2, 1, 3, 0, 'imgs/units/mons_1.png', 'Ходят гули у дороги, съели руки, съели ноги...'),
(45, 'Гуль', 4, 2, 1, 3, 0, 'imgs/units/mons_2.png', 'Ходят гули у дороги, съели руки, съели ноги...'),
(46, 'Гуль', 4, 2, 1, 3, 0, 'imgs/units/mons_3.png', 'Ходят гули у дороги, съели руки, съели ноги...'),
(47, 'Накер', 4, 2, 2, 3, 0, 'imgs/units/mons_4.png', 'Мелкий, быстрый и зловредный'),
(48, 'Накер', 4, 2, 2, 3, 0, 'imgs/units/mons_5.png', 'Мелкий, быстрый и зловредный.'),
(49, 'Накер', 4, 2, 2, 3, 0, 'imgs/units/mons_6.png', 'Мелкий, быстрый и зловредный.'),
(50, 'Туманник', 4, 2, 2, 1, 0, 'imgs/units/mons_7.png', 'Как увидишь свет в тумане, поворачивай обратно. Тут же.'),
(51, 'Виверна', 4, 3, 2, 1, 0, 'imgs/units/mons_8.png', 'Это создание жило лишь затем, чтоб убивать.'),
(52, 'Гаргулья', 4, 3, 2, 1, 0, 'imgs/units/mons_9.png', 'Мне кажется, или статуя за нами смотрит?'),
(53, 'Эндриага', 4, 3, 2, 1, 0, 'imgs/units/mons_10.png', 'В лес теперь не зайдёшь. Там эндриага завелись.'),
(54, 'Василиск', 4, 3, 2, 1, 0, 'imgs/units/mons_11.png', 'Нападает сзади, а целится точно меж позвонков, либо под левую почку, в аорту.'),
(55, 'Гарпия келено', 4, 7, 2, 11, 0, 'imgs/units/mons_12.png', 'Обычные гарпии питаются падалью. А келено - снами.'),
(56, 'Гарпия', 4, 7, 2, 11, 0, 'imgs/units/mons_13.png', 'Спрячьте украшения, сударыня. Не то гарпии слетятся.'),
(57, 'Игоша', 4, 2, 4, 1, 0, 'imgs/units/mons_14.png', 'Признай свои ошибки и похорони их как следует. Иначе они придут за тобой.'),
(58, 'Главоглаз', 4, 2, 4, 3, 0, 'imgs/units/mons_15.png', 'Полукраб, полупаук. Словом, сучий сын.'),
(59, 'Главоглаз', 4, 2, 4, 3, 0, 'imgs/units/mons_16.png', 'Полукраб, полупаук. Словом, сучий сын.'),
(60, 'Главоглаз', 4, 2, 4, 3, 0, 'imgs/units/mons_17.png', 'Полукраб, полупаук. Словом, сучий сын.'),
(61, 'Вампир', 4, 2, 4, 3, 0, 'imgs/units/mons_18.png', 'Гаркаин: - Славно, что вы сразу же нашпиговалися, потому как теперича я вас жрать стану.'),
(62, 'Вампир', 4, 2, 4, 3, 0, 'imgs/units/mons_19.png', 'Брукса: на него глядели огромные, горящие, широко раскрытые антрацитовые глаза...'),
(63, 'Вампир', 4, 2, 4, 3, 0, 'imgs/units/mons_20.png', 'Экимма: она вроде как нетопырь... Только размером с человека.'),
(64, 'Вампир', 4, 2, 4, 3, 0, 'imgs/units/mons_21.png', 'Фледер: лысая башка, шипастые уши, шкура в бородавках. Одно слово - красавчик.'),
(65, 'Пугач', 4, 2, 5, 1, 0, 'imgs/units/mons_22.png', 'Откуда такое название? Постой, я сейчас вспомню!'),
(66, 'Грифон', 4, 2, 5, 1, 0, 'imgs/units/mons_23.png', 'Грифоны любят помучить. Едят живьём, по кусочку.'),
(67, 'Вилохвост', 4, 2, 5, 1, 0, 'imgs/units/mons_24.png', 'Вилохвост... Ничего себе. Скорей уж, сука, мечехвост!'),
(68, 'Моровая дева', 4, 2, 5, 1, 0, 'imgs/units/mons_25.png', 'Больные бредили о покрытой поршой и лишаями женщине, окружённой крысами.'),
(69, 'Волколак', 4, 2, 5, 1, 0, 'imgs/units/mons_26.png', 'Не так страшен волк, как его малюют. Зато волколак куда страшней!'),
(70, 'Вампир', 4, 2, 5, 3, 0, 'imgs/units/mons_27.png', 'Катакан: Мелитэле, обереги нас от зла, защити нас от когтей катакана...'),
(71, 'Кладбищенская баба', 4, 3, 5, 1, 0, 'imgs/units/mons_28.png', 'Редко какое чудовище носит столь подходящее имя, как кладбищенская баба.'),
(72, 'Ледяной Великан', 4, 4, 5, 1, 0, 'imgs/units/mons_29.png', 'Раз в жизни я бегал от врага. От Ледяного Великана. И вовсе этого не стыжусь.'),
(73, 'Бес', 4, 2, 6, 1, 0, 'imgs/units/mons_30.png', 'Бес немного смахивает на оленя. Огромного, злобного оленя.'),
(74, 'Ведьма', 4, 2, 6, 3, 0, 'imgs/units/mons_31.png', 'Кухарка: - Порубим тебя, юноша. Отличный выйдет супчик...'),
(75, 'Ведьма', 4, 2, 6, 3, 0, 'imgs/units/mons_32.png', 'Пряха: - Я чую твою боль, вижу страх...'),
(76, 'Ведьма', 4, 2, 6, 3, 0, 'imgs/units/mons_33.png', 'Шептуха: - Я могу стать твоей последней - и самой лучшей.'),
(77, 'Элементаль земли', 4, 4, 6, 1, 0, 'imgs/units/mons_34.png', 'Как выжить при встрече с элементалем земли? Очень просто. Бежать со всех ног.'),
(78, 'Элементаль огня', 4, 4, 6, 1, 0, 'imgs/units/mons_35.png', 'А теперь будет жарко.'),
(79, 'Главоглаз', 4, 4, 6, 3, 0, 'imgs/units/mons_36.png', 'Огромный главоглаз. Оно... оно двигается!'),
(80, 'Кейран', 4, 7, 8, 1, 1, 'imgs/units/mons_h1.png', 'Как убить кейрана? Легко. Берёшь лучший меч... продаешь и нанимаешь ведьмака.'),
(81, 'Драуг', 4, 2, 10, 1, 1, 'imgs/units/mons_h2.png', 'Генерал так и не признал поражения. Продолжал сражаться даже после смерти.'),
(82, 'Имлерих', 4, 2, 10, 1, 1, 'imgs/units/mons_h3.png', 'Ladd nawh! Убить их! А кишки смешать с землёй.'),
(83, 'Леший', 4, 3, 10, 1, 1, 'imgs/units/mons_h4.png', 'В этом лесу не охотятся. Никогда. Хоть бы деревня с голоду помирала.');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `user_name` varchar(40) NOT NULL,
  `user_pass` varchar(100) NOT NULL,
  `pict` varchar(100) DEFAULT NULL,
  `battles` varchar(10) DEFAULT NULL,
  `numb_of_battle` int(10) DEFAULT '0',
  `numb_of_win` int(10) DEFAULT '0',
  `exp` int(10) DEFAULT '0',
  `level` int(3) DEFAULT '0',
  `old_level` int(3) DEFAULT NULL
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `user_name`, `user_pass`, `pict`, `battles`, `numb_of_battle`, `numb_of_win`, `exp`, `level`, `old_level`) VALUES
(10, 'www', '$2a$10$ZNdQhpRUyeVEWmyjuGy.VON7OuSFIKQCTqWl2gk64QmLKRFCutnKG', NULL, NULL, 36, 33, 141, 0, 0),
(13, 'qqq', '$2a$10$ia45nVEe6N3KH5FH4H2ryuu5V7ryNfL4B2dmU/PaQuYnJ0F5zuuEG', NULL, NULL, 0, 0, 0, 0, 0),
(14, 'eee', '$2a$10$oG/XYhtuH7Y9itgMJJxbMOPpGUmj9DZGw4Nkm2N3pNTkFIOSJetdi', NULL, NULL, 36, 28, 94, 6, 0),
(15, 'wqer', 'vbfgfhghvdsfvdfv', NULL, NULL, 0, 0, 0, 2, 0),
(16, 'sdfbgh', 'dsfgdfg', NULL, NULL, 0, 0, 0, 1, 0),
(17, 'dsfhdsh', 'fgnfdhjd', NULL, NULL, 0, 0, 0, 5, 0),
(18, 'dfjn', 'dfgjfhj', NULL, NULL, 0, 0, 0, 6, 0);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `abilities`
--
ALTER TABLE `abilities`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `card_decks`
--
ALTER TABLE `card_decks`
  ADD PRIMARY KEY (`id_user`);

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
-- Индексы таблицы `history`
--
ALTER TABLE `history`
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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `user_name` (`user_name`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `abilities`
--
ALTER TABLE `abilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=21;
--
-- AUTO_INCREMENT для таблицы `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT для таблицы `fractions`
--
ALTER TABLE `fractions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT для таблицы `leaders`
--
ALTER TABLE `leaders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT для таблицы `list_of_battles`
--
ALTER TABLE `list_of_battles`
  MODIFY `id_battle` int(10) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=164;
--
-- AUTO_INCREMENT для таблицы `specials`
--
ALTER TABLE `specials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT для таблицы `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=85;
--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=19;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

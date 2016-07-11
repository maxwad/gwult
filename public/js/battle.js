/**
 * Created on 19.03.16.
 */
var ggg = 0;
Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var num = Math.floor(Math.random() * (i + 1));
        var d = this[num];
        this[num] = this[i];
        this[i] = d;
    }
    return this;
};

//////////////////////////////////////////////////////////////////
// Функция, формирует колоду пользователя по исходным данным
//////////////////////////////////////////////////////////////////
function build_deck (deck, from, abilities) {
    var to = [];
    for(var i = 0; i < deck.length; i++){
        for(var j = 0; j < from.length; j++){
            if(from[j].id == deck[i]) {
                if(from[j].strength !== undefined){
                    from[j].fact_strength = from[j].strength;
                    from[j].multiplier = 1;
                    from[j].added = 0;
                }
                for(var k = 0; k < abilities.length; k++){
                    if (parseInt(from[j].id_ability) == abilities[k].id) {
                        from[j].ability = abilities[k].func;
                        switch (from[j].abilities) {
                            case 'clear_weather':
                            case 'downpour':
                            case 'fog':
                            case 'frost':
                            case 'gain':
                            case 'commander_horn':
                            case 'support':
                                from[j].type_ability = 1; //способности, которые надо пересчитывать
                                break;

                            case 'agility':
                            case 'double':
                            case 'dummy':
                            case 'execution':
                            case 'medic':
                            case 'spy':
                                from[j].type_ability = 2; //способности, которые не надо пересчитывать
                                break;

                        }
                    }
                }

                to.push(from[j]);
            }
        }
    }
    return to;
}
//////////////////////////////////////////////////////////////////
// Функция, которая выводит карты на стол
//////////////////////////////////////////////////////////////////
function show_cards (count, selector, from, flag, source) {
    selector.empty();
    for (var i = 0; i < count; i++) {
        if(flag == 1) {
            from.push(source[0]);
            source.splice(0,1);
        }
        selector.append(
            $('<div/>').attr('data-item', i).append(
                $('<img/>').attr({
                    'src':          "../" + from[i].pict,
                    'title':        from[i].name
                })
            )
        );
        if(from[i].strength !== undefined) {
            selector.children().eq(i).append(
                $('<div/>').text(from[i].fact_strength).attr('data-item', i).addClass('fact_strength')
            );
        }
    }
}

//////////////////////////////////////////////////////////////////
// Функция, которая отправляет на сервер сигнал готовности игрока
//////////////////////////////////////////////////////////////////
function i_am_ready (socket, user_id, username, number_of_room, player_index) {
    var user_data           = {};
    user_data.user_id       = user_id;
    user_data.user_name     = username;
    user_data.user_room     = number_of_room;
    user_data.player_index  = player_index;
    socket.emit('player ready', user_data);
}

//////////////////////////////////////////////////////////////////
// Конструктор объекта строк боя (каждая из 6 строк)
//////////////////////////////////////////////////////////////////
function Row_obj(index, selector) {
    this.row_selector   = index + selector;
    this.units_cards    = [];
    this.total          = 0;
}

//////////////////////////////////////////////////////////////////
// Конструктор объекта войск игрока (2 области по 3 строки)
//////////////////////////////////////////////////////////////////
function Forces (index) {
    this.siege     = new Row_obj(index, " .siege_row");
    this.range     = new Row_obj(index, " .range_row");
    this.close     = new Row_obj(index, " .close_row");
    this.leader    = {};
    this.specials  = [];
    this.total     = 0;
}

//////////////////////////////////////////////////////////////////
// Функция, которая определяет, в какое поле должна быть выложена карта
//////////////////////////////////////////////////////////////////
function to_battlefield_home (this_card) {
    var field_name;
    switch (this_card.id_class) {
        case 2:
            field_name = 'close';
            break;

        case 3:
            field_name = 'range';
            break;

        case 4:
            field_name = 'siege';
            break;

        case 7:
            if(this_card.change_class !== undefined) {
                if(this_card.change_class == 2) {
                    field_name = 'close';
                } else {
                    field_name = 'range';
                }
            } else {
                if(confirm("Положить карту в ряд рукопашных войск? (Ок - рукопашный отряд, Отмена - дальнобойный отряд)")){
                    field_name = 'close';
                    this_card.change_class = 2;
                } else {
                    field_name = 'range';
                    this_card.change_class = 3;
                }
            }
            break;

        case undefined:
            break;
    }
    return field_name;
}


//////////////////////////////////////////////////////////////////
// Функция, которая пересчитывает очки
//////////////////////////////////////////////////////////////////
function count_strength (player_obj, player_power){
    var row_name_arr = ['close', 'range', 'siege'];
    // Пересчитываем очки у обоих игроков
    for(var i = 0; i < 2; i++) {
        player_obj[i].total = 0;
        for(var n = 0; n < row_name_arr.length; n++) {
            player_obj[i][row_name_arr[n]].total = 0;
            var selector_s = player_obj[i][row_name_arr[n]].row_selector + ' .str_count';
            $(selector_s).text(player_obj[i][row_name_arr[n]].total);
            for(var j = 0; j < player_obj[i][row_name_arr[n]].units_cards.length; j++) {
                player_obj[i][row_name_arr[n]].total += parseInt(player_obj[i][row_name_arr[n]].units_cards[j].fact_strength);
                $(selector_s).text(player_obj[i][row_name_arr[n]].total);
            }
            player_obj[i].total += player_obj[i][row_name_arr[n]].total;
        }
        player_power.eq(i).text(player_obj[i].total);
    }
}

//////////////////////////////////////////////////////////////////
// Функция, которая выводит сообщения о победителях и раундах
//////////////////////////////////////////////////////////////////
function notice_round (mes, type) {
    var message_box = $('<div class="round"></div>').append('<span/>');
    $('.battle_field').append(message_box);
    if(type == 1){
        $('.round span').text('Раунд ' + mes);
    } else {
        $('.round span').text(mes + ' выигрывает раунд!');
    }
    setTimeout(function(){
        message_box.fadeOut(3000,function(){
            $(this).remove();
        });
    }, 1500);
}

//////////////////////////////////////////////////////////////////
// Вывод информации о сдаче игрока
//////////////////////////////////////////////////////////////////
function fold (selector) {
    var sel = selector + ' .fold';
    if($(sel).length == 0) {
        $(selector).append(
            $('<div/>').addClass('fold').append(
                $('<span/>').text('ПАС')));
    }
}

//////////////////////////////////////////////////////////////////
// Определение последних карт в отбое игроков
//////////////////////////////////////////////////////////////////
function last_card(data) {
    var last_card = {};
    var compare = 0;
    if (data.retreat_home.length != 0) {
        for(var i = 0; i < data.retreat_home.length; i++){
            if (data.retreat_home[i].number_move >= compare) {
                compare = data.retreat_home[i].number_move;
                last_card = data.retreat_home[i];
            }
        }
        data.retreat_$.eq(0).attr({
            'src':          "../" + last_card.pict,
            'title':        last_card.name
        });
        if(last_card.strength !== undefined) {
            $('.retreat').eq(0).append(
                $('<div/>').text(last_card.strength).addClass('fact_strength')
            );
        }
    }

    compare = 0;
    if (data.retreat_rival.length != 0) {
        for(var i = 0; i < data.retreat_rival.length; i++){
            if (data.retreat_rival[i].number_move >= compare) {
                compare = data.retreat_rival[i].number_move;
                last_card = data.retreat_rival[i];
            }
        }
        data.retreat_$.eq(1).attr({
            'src':          "../" + last_card.pict,
            'title':        last_card.name
        });
        if(last_card.strength !== undefined) {
            $('.retreat').eq(1).append(
                $('<div/>').text(last_card.strength).addClass('fact_strength')
            );
        }
    }
}


$(document).ready(function () {

    var i,                      /* счётчик */
        length,                 /* граница счётчика */
        selector,               /* переменная для хранения селектора*/
        message,                /* сообщение */
        user_id,                /* id игрока */
        username,               /* ник игрока */
        number_of_room,         /* номер игровой комнаты */
        alias_player,           /* переменная с индексом игрока */
        alias_rival,            /* переменная с индексом противника */
        work_obj        = [],   /* объект с инфой от сервера */
        history         = {},   /* история ходов */
        abilities       = [],   /* массис способностей */
        fractions       = [],   /* массив фракций игроков  */
        specials        = [],   /* массив спецкарт игроков */
        units           = [],   /* массив юнитов игроков */
        player_deck     = {},   /* объект айдишек карт игрока */
        leaders         = [],   /* массив лидеров игроков */
        deck_units      = [],   /* массив юнитов игрока */
        deck_specials   = [],   /* массив спеукарт игрока */
        deck_complete   = [],   /* итоговый массив карт игрока */
        player_cards    = [],   /* начальные карты игрока на данную игру */
        retreat_home    = [],   /* отбой игрока */
        retreat_rival   = [],   /* отбой соперника */
        round_results   = [],   /* массив результатов раундов */
        data_abilities  = {},   /* объект с инфой для отработки способностей */
        result_ability  = [],   /* результат отработки способности */
        player_index    = -1,   /* индекс игрока: -1: зритель; 0: игрок; 1: соперник */
        rival_index     = 0,    /* индекс соперника */
        choose_flag     = 0,    /* флаг: выбирал ли уже игрок карты на замену */
        count_repl      = 0,    /* количество заменённых карт */
        resolution      = 0,    /* разрешение на ход */
        give_up_home    = 0,    /* флаг ПАС для игрока */
        give_up_rival   = 0,    /* флаг ПАС для противника */
        leader_flag     = 0,    /* флаг: использовал ли уже игрок своего лидера */
        health_home     = 2,    /* жизни игрока */
        health_rival    = 2,    /* жизни соперника */
        count_move_h    = 0,    /* номер хода игрока */
        count_move_r    = 0,    /* номер хода соперника */
        leader_pic_$    = $('.leader_pic'),
        fraction_name_$ = $('.fraction_name'),
        players_names_$ = $('.user_name'),
        fraction_pic_$  = $('.fraction_pic'),
        deck_cover_$    = $('.deck_cover'),
        battle_$        = $('.battle'),
        block_rewiev_$  = $('.block_rewiev'),
        card_rewiev_$   = $('.card_rewiev'),
        cards_$         = $('.cards'),
        player_power_$  = $('.player_power'),
        status_move_$   = $('.status_move'),
        count_cards_$   = $('.player_cards'),
        count_deck_$    = $('.deck_count'),
        retreat_$       = $('.last_card');


    var battle_arr      = [];   /* массив игрового стола */
    battle_arr[0]   = new Forces(".row_home");
    battle_arr[1]   = new Forces(".row_enemy");

    number_of_room  = window.location.toString().replace(/\D/g,'');

    var socket = io();

    if(localStorage['count_repl_' + number_of_room]) {
        count_repl = localStorage['count_repl_' + number_of_room];
    }

    $.ajax({
        url: "/check_session",
        method: "POST",
        data: "",
        success: function(response) {
            if (response.user_id != false) {
                user_id     = response.user_id;
                username    = response.username;
                console.log(response.username);
            } else {
                console.log('гость');
                user_id = 0;
            }
            var user_data       = {};
            user_data.user_id   = user_id;
            user_data.user_name = username;
            user_data.user_room = number_of_room;
            socket.emit('user connect', user_data);
        }
    });


    socket.on('user without deck', function(){
        console.log("У вас ещё не создана колода карт.");
    });

    socket.on('battle is not exist', function(){
        console.log("Такой комнаты не существует.");
    });

    socket.on('rivals are not complete', function(){
        console.log('Соперники не готовы');
    });

    socket.on('second player is not ready', function(){
        $('.battle_field').append($('<div />').addClass('not_ready').text('Ваш соперник пока не готов. Ожидайте.'));
    });

    socket.on('start battle', function(data){
        $('.battle_field .not_ready').remove();
        if(data[1] == 0) {
            notice_round(1, 1);
            resolution = data[0][player_index];
            if(resolution == 1) {
                status_move_$.text('ВАШ ХОД');
            } else {
                status_move_$.text('ХОД ПРОТИВНИКА');
            }
        }
    });


    socket.on('take data', function(msg){
        console.log(msg);
        if(msg[0].data_error == true) {
            message = "Не получены необходимые данные. Пожалуйста, попробуйте переподключиться к битве.";
            notice(message, 2);
            return false;
        } else {
            work_obj    = msg;
            units       = work_obj[0].units;
            leaders     = work_obj[0].leaders;
            abilities   = work_obj[0].abilities;
            specials    = work_obj[0].specials;
            length      = work_obj[0].fractions.length;

            for(i = 0; i < length; i++) {
                if(work_obj[0].fractions[i].id == work_obj[0].leaders[0].id_fraction) {
                    fractions[0] = work_obj[0].fractions[i];
                }
                if(work_obj[0].fractions[i].id == work_obj[0].leaders[1].id_fraction) {
                    fractions[1] = work_obj[0].fractions[i];
                }
            }
            switch (user_id) {
                case parseInt(work_obj[0].players[0].user_id):
                    player_index  = 0;
                    rival_index   = 1;
                    break;

                case parseInt(work_obj[0].players[1].user_id):
                    player_index  = 1;
                    rival_index   = 0;
                    // Переворачиваем массивы для удобства использования в коде
                    var temp;

                    temp            = units[0];
                    units[0]        = units[1];
                    units[1]        = temp;

                    temp            = leaders[0];
                    leaders[0]      = leaders[1];
                    leaders[1]      = temp;

                    temp            = fractions[0];
                    fractions[0]    = fractions[1];
                    fractions[1]    = temp;
                    break;

                default:
                    player_index = -1;
                    break;
            }
            for (i = 0; i < 2; i++) {

                leader_pic_$.eq(i).attr({
                    src:   "../" + leaders[i].pict,
                    title: leaders[i].name,
                    alt:   leaders[i].name
                });

                fraction_name_$.eq(i).text(fractions[i].name);

                fraction_pic_$.eq(i).attr({
                    src:   "../" + fractions[i].pict,
                    title: fractions[i].name,
                    alt:   fractions[i].name
                });

                deck_cover_$.eq(i).attr({
                    src:   "../" + fractions[i].pict_cover,
                    title: fractions[i].name,
                    alt:   fractions[i].name
                });
            }

            // Вывод начальных данных для игроков
            if(player_index != -1) {
                history                 = work_obj[2];
                player_deck.units       = work_obj[1].units.split(',').map(Number);
                player_deck.specials    = work_obj[1].specials.split(',').map(Number);
                players_names_$.eq(0).text(work_obj[0].players[player_index].user_name);
                players_names_$.eq(1).text(work_obj[0].players[rival_index].user_name);

                // Формирование колоды игрока
                if(!localStorage['player_cards_' + number_of_room]) {
                    if(choose_flag == 0) {
                        player_cards = [];
                        deck_units = build_deck (player_deck.units, units[0], abilities);
                        deck_specials = build_deck (player_deck.specials, specials, abilities);
                        deck_complete = deck_units.concat(deck_specials);
                        deck_complete.shuffle().shuffle();
                        card_rewiev_$.css('display', 'block');
                        show_cards(10, block_rewiev_$, player_cards, 1, deck_complete);
                        // Блокируем изменение созданной колоды
                        choose_flag = 1;
                    }
                } else {
                    player_cards = JSON.parse(localStorage['player_cards_' + number_of_room]);
                    deck_complete = JSON.parse(localStorage['deck_complete_' + number_of_room]);
                    length = player_cards.length;
                    if(choose_flag == 0 && localStorage['count_repl_' + number_of_room] == 2) {
                        show_cards (length, cards_$, player_cards, 0,'');
                        i_am_ready (socket, user_id, username, number_of_room, player_index);
                        choose_flag = 1;
                    } else {
                        if(choose_flag == 0 && localStorage['count_repl_' + number_of_room] < 2) {
                            card_rewiev_$.css('display', 'block');
                            show_cards (length, block_rewiev_$, player_cards, 0,'');
                            choose_flag = 1;
                        }
                    }
                }


            } else {
                // Вывод начальных данных для зрителей
                history = work_obj[1];
                for(var j = 0; j < 2; j++) {
                    players_names_$.eq(j).text(work_obj[0].players[j].user_name);
                }
                $('.battle .exit').remove();
            }
            var counts_data            = {};
            counts_data.user_room      = number_of_room;
            counts_data.player_index   = player_index;
            counts_data.count_cards    = player_cards.length;
            counts_data.count_deck     = deck_complete.length;
            socket.emit('counts', counts_data);

            // Обработка истории игры для новых подключившихся пользователей
            if (history.cards.length != 0 && count_move_h == 0 && count_move_r == 0) {
                console.log("Вывожу историю игры");
                for(i = 0; i < history.cards.length; i++) {
                    if(history.cards[i] == 'give_up'){
                        round_results.push([battle_arr[0].total, battle_arr[1].total]);
                        alias_player = player_index;
                        alias_rival = rival_index;
                        if (player_index == -1) {
                            alias_player = 0;
                            alias_rival = 1;
                        }
                        if(battle_arr[0].total > battle_arr[1].total){
                            health_rival--;
                            $('.rival .health_pic').eq(health_rival).attr('src', "../imgs/others/unhealth.png");
                        }
                        if(battle_arr[0].total < battle_arr[1].total){
                            health_home--;
                            $('.home .health_pic').eq(health_home).attr('src', "../imgs/others/unhealth.png");
                        }
                        if(battle_arr[0].total == battle_arr[1].total){
                            health_home--;
                            health_rival--;
                            $('.home .health_pic').eq(health_rival).attr('src', "../imgs/others/unhealth.png");
                            $('.rival .health_pic').eq(health_home).attr('src', "../imgs/others/unhealth.png");
                        }

                        var row_name_arr = ['close', 'range', 'siege'];
                        for(var m = 0; m < 2; m++){
                            for (var j = 0; j < row_name_arr.length; j++) {
                                var k = battle_arr[m][row_name_arr[j]].units_cards.length;
                                while(k != 0) {
                                    k--;
                                    if(m == 0){
                                        retreat_home.push(battle_arr[m][row_name_arr[j]].units_cards[k]);
                                    }
                                    if(m == 1) {
                                        retreat_rival.push(battle_arr[m][row_name_arr[j]].units_cards[k]);
                                    }
                                    battle_arr[m][row_name_arr[j]].units_cards.splice(k,1);
                                }
                                selector = battle_arr[m][row_name_arr[j]].row_selector + ' .cards_field';
                                length = battle_arr[m][row_name_arr[j]].units_cards.length;
                                show_cards (length, $(selector), battle_arr[m][row_name_arr[j]].units_cards, 0,'');
                            }

                            length = battle_arr[m].specials.length;
                            for(var n = 0; n < battle_arr[m].specials.length; n++){
                                if(m == 0){
                                    retreat_home.push(battle_arr[m].specials[0]);
                                }
                                if(m == 1){
                                    retreat_rival.push(battle_arr[m].specials[0]);
                                }
                                battle_arr[m].specials.splice(0,1);
                                // TODO: Удалять карту лидера
                            }
                        }
                        count_strength (battle_arr, player_power_$);

                    } else {
                        // Если в истории обрабатывается обычная карта

                        var field_name, ind;
                        if(history.cards[i].player_index == player_index) {
                            count_move_h++;
                            ind = 0;
                        } else {
                            if(player_index == -1) {
                                if(history.cards[i].player_index == 0) {
                                    count_move_h++;
                                }
                                if(history.cards[i].player_index == 1) {
                                    count_move_r++;
                                }
                                ind = history.cards[i].player_index;
                            } else {
                                count_move_r++;
                                ind = 1;
                            }
                        }

                        field_name = to_battlefield_home(history.cards[i].card);
                        if (field_name !== undefined) {
                            if(history.cards[i].card.ability == 'spy'){
                                if(ind == 0) {
                                    ind = 1;
                                } else {
                                    ind = 0;
                                }
                            }
                            battle_arr[ind][field_name].units_cards.push(history.cards[i].card);
                            selector = battle_arr[ind][field_name].row_selector + ' .cards_field';
                            length = battle_arr[ind][field_name].units_cards.length;
                            show_cards (length, $(selector), battle_arr[ind][field_name].units_cards, 0,'');
                            battle_arr[ind][field_name].total = 0;
                        } else {
                            battle_arr[ind].specials.push(history.cards[i].card);
                        }
                        count_strength (battle_arr, player_power_$);

                        data_abilities.battle_arr    = battle_arr;
                        data_abilities.player_cards  = player_cards;
                        data_abilities.retreat_home  = retreat_home;
                        data_abilities.retreat_rival = retreat_rival;
                        result_ability = abilities_obj[history.cards[i].card.ability](data_abilities, 3);

                        counts_data.user_room      = number_of_room;
                        counts_data.player_index   = player_index;
                        counts_data.count_cards    = player_cards.length;
                        counts_data.count_deck     = deck_complete.length;
                        socket.emit('counts', counts_data);
                    }
                }
                if (retreat_home.length !=0 && retreat_rival != 0) {
                    var data = {};
                    data.retreat_home  = retreat_home;
                    data.count_move_h  = count_move_h;
                    data.retreat_$     = retreat_$;
                    data.retreat_rival = retreat_rival;
                    data.count_move_r  = count_move_r;
                    last_card(data);
                }
                if(player_index == -1) {
                    give_up_home = history.give_up_status[0];
                    give_up_rival = history.give_up_status[1];
                } else {
                    give_up_home = history.give_up_status[player_index];
                    give_up_rival = history.give_up_status[rival_index];
                    resolution = history.resolution[player_index];

                    if(resolution == 1 && give_up_rival == 1) {
                        status_move_$.text('ВАШ ХОД. ПРОТИВНИК СДАЛСЯ');
                    }
                    if(resolution == 1 && give_up_rival != 1) {
                        status_move_$.text('ВАШ ХОД');
                    }
                    if(give_up_home == 1) {
                        status_move_$.text('ХОД ПРОТИВНИКА. ВЫ СДАЛИСЬ');
                    }
                    if(resolution == 0 && give_up_home != 1) {
                        status_move_$.text('ХОД ПРОТИВНИКА');
                    }
                }
                if(give_up_home == 1) {
                    fold('.row_home');
                }
                if(give_up_rival == 1){
                    fold('.row_enemy');
                }

            }
        }
    });


    // Обработка данных о количестве карт игроков  для зрителей
    socket.on('take counts', function(data){
        if (player_index == -1) {
            for(i = 0; i < 2; i++) {
                count_deck_$.eq(i).text(data.count_deck[i]);
                count_cards_$.eq(i).text(data.count_cards[i]);
            }
        } else {
            count_deck_$.eq(0).text(deck_complete.length);
            count_deck_$.eq(1).text(data.count_deck[rival_index]);
            count_cards_$.eq(0).text(player_cards.length);
            count_cards_$.eq(1).text(data.count_cards[rival_index]);
        }
    });


    // Блокировка контекстного меню на карточках
    battle_$.on("contextmenu", ".block_rewiev img", function() {
        return false;
    });

    // Замена карт при формировании игровой колоды
    battle_$.on("dblclick", ".block_rewiev div", function() {
        if(count_repl < 2) {
            var index = $(this).attr('data-item');
            deck_complete.push(player_cards[index]);
            player_cards.splice(index, 1);
            deck_complete.shuffle().shuffle();
            player_cards.push(deck_complete[0]);
            deck_complete.splice(0, 1);
            card_rewiev_$.css('display', 'block');
            show_cards (player_cards.length, block_rewiev_$, player_cards, 0,'');
            count_repl++;
            localStorage['count_repl_' + number_of_room] = count_repl;
            localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
            localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);
            if(count_repl == 2) {
                card_rewiev_$.css('display', 'none');
                show_cards (player_cards.length, cards_$, player_cards, 0,'');
                var counts_data            = {};
                counts_data.user_room = number_of_room;
                counts_data.player_index   = player_index;
                counts_data.count_cards    = player_cards.length;
                counts_data.count_deck     = deck_complete.length;
                socket.emit('counts', counts_data);
                i_am_ready (socket, user_id, username, number_of_room, player_index);
            }
        }
    });

    // Пропуск замены карт
    battle_$.on("click", ".card_rewiev .skip", function() {
        card_rewiev_$.css('display', 'none');
        localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
        localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);
        show_cards (player_cards.length, cards_$, player_cards, 0,'');
        var counts_data            = {};
        counts_data.user_room = number_of_room;
        counts_data.player_index   = player_index;
        counts_data.count_cards    = player_cards.length;
        counts_data.count_deck     = deck_complete.length;
        socket.emit('counts', counts_data);
        localStorage['count_repl_' + number_of_room] = 2;
        i_am_ready (socket, user_id, username, number_of_room, player_index);
    });

    // Ходы игроков
    battle_$.on("click", ".cards div", function() {
        if(resolution == 1 && give_up_home != 1) {
            var ind = $(this).attr('data-item');
            var this_card = player_cards[ind];
            count_move_h++;
            this_card.number_move = count_move_h;
            var field_name;
            field_name = to_battlefield_home(this_card);
            $(this).remove();

            if (field_name !== undefined) {
                var flag_field = 0;
                if(this_card.ability == 'spy'){
                    flag_field = 1;
                }
                battle_arr[flag_field][field_name].units_cards.push(this_card);
                selector = battle_arr[flag_field][field_name].row_selector + ' .cards_field';
                length = battle_arr[flag_field][field_name].units_cards.length;
                show_cards (length, $(selector), battle_arr[flag_field][field_name].units_cards, 0,'');
                battle_arr[flag_field][field_name].total = 0;
            } else {
                battle_arr[0].specials.push(this_card);
            }
            player_cards.splice(ind,1);
            show_cards (player_cards.length, cards_$, player_cards, 0,'');
            count_strength (battle_arr, player_power_$);
            count_cards_$.eq(0).text(player_cards.length);
            if(give_up_rival == 1) {
                resolution = 1;
                status_move_$.text('ВАШ ХОД. ПРОТИВНИК СДАЛСЯ');
            } else {
                resolution = 0;
                status_move_$.text('ХОД ПРОТИВНИКА');
            }
            // TODO: Если упротивника закончились карты
            if(player_cards.length == 0 && leader_flag == 1) {
                give_up_home = 1;
                resolution = 0;
                $('.exit').click();
            }

            var arr_data                  = [];
            var user_data                 = {};
            user_data.user_room           = number_of_room;
            user_data.player_index        = player_index;
            user_data.rival_index         = rival_index;
            user_data.user_id             = user_id;
            user_data.card                = this_card;
            user_data.card_effect         = [];
            user_data.resolution          = resolution;
            user_data.give_up             = give_up_home;
            arr_data.push(user_data);

            data_abilities.number_of_room = number_of_room;
            data_abilities.player_index   = player_index;
            data_abilities.battle_arr     = battle_arr;
            data_abilities.player_cards   = player_cards;
            data_abilities.deck_complete  = deck_complete;
            data_abilities.retreat_home   = retreat_home;
            data_abilities.retreat_rival  = retreat_rival;
            data_abilities.socket         = socket;
            data_abilities.arr_data       = arr_data;

            result_ability = abilities_obj[this_card.ability](data_abilities, 1);
            socket.emit('step to', result_ability);
            var counts_data            = {};
            counts_data.user_room      = number_of_room;
            counts_data.player_index   = player_index;
            counts_data.count_cards    = player_cards.length;
            counts_data.count_deck     = deck_complete.length;

            socket.emit('counts', counts_data);

            count_strength (battle_arr, player_power_$);

            localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
            localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);
        }

    });


    // Обработка пришедших карт
    socket.on('step from', function(user_data){
        count_move_r++;
        give_up_rival = user_data.give_up;
        if(give_up_home != 1) {
            status_move_$.text('ВАШ ХОД');
        }

        for(var i = 0; i < user_data.length; i++) {
            var field_name, position;
            if(player_index == -1) {
                position = user_data[i].player_index;
                status_move_$.text('');
            } else {
                position = 1;
            }
            field_name = to_battlefield_home(user_data[i].card);
            if (field_name !== undefined) {
                if(user_data[i].card.ability == 'spy'){
                    if(position == 0) {
                        position = 1;
                    } else {
                        position = 0;
                    }
                }
                battle_arr[position][field_name].units_cards.push(user_data[i].card);
                selector = battle_arr[position][field_name].row_selector + ' .cards_field';
                length = battle_arr[position][field_name].units_cards.length;
                show_cards (length, $(selector), battle_arr[position][field_name].units_cards, 0,'');
                battle_arr[position][field_name].total = 0;
            } else {
                battle_arr[position].specials.push(user_data[i].card);
            }
            count_strength (battle_arr, player_power_$);

            data_abilities.battle_arr    = battle_arr;
            data_abilities.player_cards  = player_cards;
            data_abilities.retreat_home  = retreat_home;
            data_abilities.retreat_rival = retreat_rival;
            result_ability = abilities_obj[user_data[i].card.ability](data_abilities, 2);
/*
            var counts_data            = {};
            counts_data.user_room      = number_of_room;
            counts_data.player_index   = player_index;
            counts_data.count_cards    = player_cards.length;
            counts_data.count_deck     = deck_complete.length;
            socket.emit('counts', counts_data);
            */
        }





        if(give_up_home != 1) {
            resolution = 1;
        } else {
            resolution = 0;
        }
    });

    // Кнопка "ПАС"
    battle_$.on("click", ".exit", function() {
        give_up_home            = 1;
        status_move_$.text('ХОД ПРОТИВНИКА. ВЫ СДАЛИСЬ');
        var user_data           = {};
        user_data.player_index  = player_index;
        user_data.rival_index   = rival_index;
        user_data.give_up       = give_up_home;
        user_data.user_room     = number_of_room;
        user_data.count_cards   = player_cards.length;
        socket.emit('give up', user_data);
        fold('.row_home');
    });

    // Конец раунда
    socket.on('won is', function(user_data){
        if(user_data.give_up !== undefined) {
            if(player_index != -1){
                give_up_rival = 1;
                resolution = 1;
                status_move_$.text('ВАШ ХОД. ПРОТИВНИК СДАЛСЯ');
                fold('.row_enemy');
            } else {
                if(user_data.player == 0){
                    fold('.row_home');
                }
                if(user_data.player == 1){
                    fold('.row_enemy');
                }
            }
        } else {
            round_results.push([battle_arr[0].total, battle_arr[1].total]);
            var winner = '';
            var looser = '';
            alias_player = player_index;
            alias_rival = rival_index;
            if (player_index == -1) {
                alias_player = 0;
                alias_rival = 1;
            }

            if(battle_arr[0].total > battle_arr[1].total){
                winner = work_obj[0].players[alias_player].user_name;
                looser = work_obj[0].players[alias_rival].user_name;
                health_rival--;
                $('.rival .health_pic').eq(health_rival).attr('src', "../imgs/others/unhealth.png");
            }
            if(battle_arr[0].total < battle_arr[1].total){
                winner = work_obj[0].players[alias_rival].user_name;
                looser = work_obj[0].players[alias_player].user_name;
                health_home--;
                $('.home .health_pic').eq(health_home).attr('src', "../imgs/others/unhealth.png");
            }
            if(battle_arr[0].total == battle_arr[1].total){
                winner = "Никто не ";
                looser = "Никто не ";
                health_home--;
                health_rival--;
                $('.home .health_pic').eq(health_rival).attr('src', "../imgs/others/unhealth.png");
                $('.rival .health_pic').eq(health_home).attr('src', "../imgs/others/unhealth.png");
            }
            if(health_home == 0 || health_rival == 0) {
                resolution = 0;
                setTimeout(function(){
                    $('.results_game').fadeIn(1000,function(){});
                }, 1000);
                var td_head = $('.results_body thead td');
                var td_body = $('.results_body tbody');
                td_head.eq(1).text(work_obj[0].players[alias_player].user_name);
                td_head.eq(2).text(work_obj[0].players[alias_rival].user_name);

                if(health_home == 0){
                    if(player_index == -1) {
                        $('.results_body h2').text("Победа " + work_obj[0].players[alias_rival].user_name + "!");
                    } else {
                        $('.results_body h2').text("Поражение!");
                    }
                    if (health_rival != 0) {
                        td_head.eq(2).addClass('win');
                    }

                } else {
                    if(player_index == -1) {
                        $('.results_body h2').text("Победа " + work_obj[0].players[alias_player].user_name + "!");
                    } else {
                        $('.results_body h2').text("Победа!").addClass('win');
                    }
                    if (health_home != 0) {
                        td_head.eq(1).addClass('win');
                    }
                }
                td_body.empty();
                length = round_results.length;
                for (i = 0; i < length; i++) {
                    var class_home = '',
                        class_rival = '';
                    if(round_results[i][0] > round_results[i][1]) {
                        class_home = 'win';
                    }

                    if(round_results[i][0] < round_results[i][1]) {
                        class_rival = 'win';
                    }
                    td_body.append($('<tr/>')
                        .append($('<td/>').text(i+1))
                        .append($('<td/>').text(round_results[i][0]).addClass(class_home))
                        .append($('<td/>').text(round_results[i][1]).addClass(class_rival))
                    )
                }
            } else {
                // TODO: Вставить обработку способности фракции перед каждым раундом
                notice_round (winner, 2);
                setTimeout(function(){
                    notice_round (user_data.round, 1);
                }, 4600);
                var row_name_arr = ['close', 'range', 'siege'];
                for(i = 0; i < 2; i++){

                    for (var j = 0; j < row_name_arr.length; j++) {
                        var k = battle_arr[i][row_name_arr[j]].units_cards.length;
                        while(k != 0) {
                            k--;
                            if(i == 0){
                                retreat_home.push(battle_arr[i][row_name_arr[j]].units_cards[k]);
                            }
                            if(i == 1) {
                                retreat_rival.push(battle_arr[i][row_name_arr[j]].units_cards[k]);
                            }
                            battle_arr[i][row_name_arr[j]].units_cards.splice(k,1);
                        }
                        selector = battle_arr[i][row_name_arr[j]].row_selector + ' .cards_field';
                        length = battle_arr[i][row_name_arr[j]].units_cards.length;
                        show_cards (length, $(selector), battle_arr[i][row_name_arr[j]].units_cards, 0,'');
                    }

                    for(var n = 0; n < battle_arr[i].specials.length; n++){
                        if(i == 0){
                            retreat_home.push(battle_arr[i].specials[0]);
                        }
                        if(i == 1){
                            retreat_rival.push(battle_arr[i].specials[0]);
                        }
                        battle_arr[i].specials.splice(0,1);
                        // TODO: Удалять карту лидера
                    }
                }
                count_strength (battle_arr, player_power_$);
                var counts_data            = {};
                counts_data.user_room = number_of_room;
                counts_data.player_index   = player_index;
                counts_data.count_cards    = player_cards.length;
                counts_data.count_deck     = deck_complete.length;
                socket.emit('counts', counts_data);
                $('.fold').remove();
                var data = {};
                data.retreat_home  = retreat_home;
                data.count_move_h  = count_move_h;
                data.retreat_$     = retreat_$;
                data.retreat_rival = retreat_rival;
                data.count_move_r  = count_move_r;
                last_card(data);
                if(player_index != -1) {
                    resolution = user_data.resolution[player_index];
                    give_up_home = 0;
                    give_up_rival = 0;
                    if(resolution == 1) {
                        status_move_$.text('ВАШ ХОД');
                    } else {
                        status_move_$.text('ХОД ПРОТИВНИКА');
                    }
                }
            }
        }
    });



});
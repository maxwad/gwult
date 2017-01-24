/**
 * Created on 19.03.16.
 */

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
                    from[j].unit          = 1;
                    from[j].fact_strength = from[j].strength;
                    from[j].multiplier    = 1;
                    from[j].multihorn     = 1;
                    from[j].added         = 0;
                    from[j].exponent      = 1;
                } else {
                    from[j].unit          = 0;
                }
                for(var k = 0; k < abilities.length; k++){
                    if (parseInt(from[j].id_ability) == abilities[k].id) {
                        from[j].ability = abilities[k].func;
                        from[j].desc_func = abilities[k].description;
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
function show_cards (flag, from, selector) {
    if(flag == 1) {
        var weather_area_$  = $('.weather_area');
        weather_area_$.empty();
        for (var i = 0; i < 2; i++) {
            for(var j = 0; j < from[i].specials.length; j++) {
                weather_area_$.append(
                    $('<div/>').attr('data-id-card', from[i].specials[j].id)
                        .addClass('weather_card')
                        .append(
                            $('<img/>').attr({
                                'src':          "../" + from[i].specials[j].pict,
                                'data-desc':    from[i].specials[j].desc_func,
                                'title':        from[i].specials[j].name
                            })
                        )
                );
            }
        }
        $('.special_field').empty();
        $('.cards_field').empty();
        var battle_field = $('.battle_field');
        var row_name     = ['siege', 'range', 'close'];
        var prop_name    = ['row_specials', 'units_cards'];
        for(var i = 0; i < 2; i++){
            for(var j = 0; j < row_name.length; j++){
                for(var k = 0; k < prop_name.length; k++){
                    for(var l = 0; l < from[i][row_name[j]][prop_name[k]].length; l++){
                        battle_field
                             .children().eq(i)
                             .children().eq(j)
                             .children().eq(1)
                             .children().eq(k)
                             .append(
                                $('<div/>').attr('data-item', i)
                                    .attr('data-id-card', from[i][row_name[j]][prop_name[k]][l].id)
                                    .addClass('card_on_table')
                                    .append(
                                        $('<img/>').attr({
                                            'src':          "../" + from[i][row_name[j]][prop_name[k]][l].pict,
                                            'data-desc':    from[i][row_name[j]][prop_name[k]][l].desc_func,
                                            'title':        from[i][row_name[j]][prop_name[k]][l].name
                                        })
                                    )
                            );
                        if(from[i][row_name[j]][prop_name[k]][l].unit == 1) {
                            battle_field
                                .children().eq(i)
                                .children().eq(j)
                                .children().eq(1)
                                .children().eq(k)
                                .children().eq(l)
                                .append(
                                $('<div/>')
                                    .text(from[i][row_name[j]][prop_name[k]][l].fact_strength)
                                    .attr('data-item', i).addClass('fact_strength')
                                );
                        }
                    }
                }
            }
        }
    } else {
        if(flag == 0) {
            selector.empty();
            for (var i = 0; i < from.length; i++) {
                selector.append(
                    $('<div/>').attr('data-item', i)
                        .attr('data-id-card', from[i].id)
                        .addClass('card_on_table')
                        .append(
                            $('<img/>').attr({
                                'src':          "../" + from[i].pict,
                                'data-desc':    from[i].desc_func,
                                'title':        from[i].name
                            })
                        )
                );
                if(from[i].unit == 1) {
                    selector.children().eq(i).append(
                        $('<div/>').
                            text(from[i].fact_strength)
                            .attr('data-item', i)
                            .addClass('fact_strength')
                    );
                }
            }
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
    this.effects        = [];
    this.row_specials   = [];
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
    this.effects   = [];
    this.total     = 0;
}

//////////////////////////////////////////////////////////////////
// Функция, которая определяет, в какое поле должна быть выложена карта
//////////////////////////////////////////////////////////////////
function get_field (this_card) {
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
function count_strength (battle_arr, player_power){
    set_effect (battle_arr);
    var row_name_arr = ['close', 'range', 'siege'];
    // Пересчитываем очки у обоих игроков
    for(var i = 0; i < 2; i++) {
        battle_arr[i].total = 0;
        for(var n = 0; n < row_name_arr.length; n++) {
            battle_arr[i][row_name_arr[n]].total = 0;
            var selector_s = battle_arr[i][row_name_arr[n]].row_selector + ' .str_count';
            $(selector_s).text(battle_arr[i][row_name_arr[n]].total);
            for(var j = 0; j < battle_arr[i][row_name_arr[n]].units_cards.length; j++) {
                var card = battle_arr[i][row_name_arr[n]].units_cards[j];
                if(card.ability != 'dummy') {
                    var basis = parseInt(card.strength);
                    if(card.hero != 1 && card.strength != 0) {
                        card.fact_strength = ((Math.pow(basis, card.exponent) + card.added) * card.multiplier * card.multihorn);
                    } else {
                        card.fact_strength = card.strength;
                    }
                    battle_arr[i][row_name_arr[n]].total += card.fact_strength;
                    $(selector_s).text(battle_arr[i][row_name_arr[n]].total);
                }
            }
            battle_arr[i].total += battle_arr[i][row_name_arr[n]].total;
        }
        player_power.eq(i).text(battle_arr[i].total);
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
    $('.retreat').empty();
    var last_card = {};
    var compare = 0;
    if (data.retreat_home.length != 0) {
        for(var i = 0; i < data.retreat_home.length; i++){
            if (data.retreat_home[i].number_move >= compare) {
                compare = data.retreat_home[i].number_move;
                last_card = data.retreat_home[i];
            }
        }
        $('.retreat').eq(0).empty().append(
            $('<img/>').attr({
                'src':          "../" + last_card.pict,
                'data-desc':    last_card.desc_func,
                'class':        'last_card',
                'title':        last_card.name
            })
        );

        //if(last_card.unit == 1) {
            $('.retreat').eq(0).append(
                $('<div/>')
                    .text(data.retreat_home.length)
                    .addClass('fact_strength')
            );
        //}
    }

    last_card = {};
    compare = 0;
    if (data.retreat_rival.length != 0) {
        for(var i = 0; i < data.retreat_rival.length; i++){
            if (data.retreat_rival[i].number_move >= compare) {
                compare = data.retreat_rival[i].number_move;
                last_card = data.retreat_rival[i];
            }
        }
        $('.retreat').eq(1).empty().append(
            $('<img/>').attr({
                'src':          "../" + last_card.pict,
                'data-desc':    last_card.desc_func,
                'class':        'last_card',
                'title':        last_card.name
            })
        );
            $('.retreat').eq(1).append(
                $('<div/>')
                    .text(data.retreat_rival.length)
                    .addClass('fact_strength')
            );
    }
}

//////////////////////////////////////////////////////////////////
// Очистка стола от карт
//////////////////////////////////////////////////////////////////
function clear_battlefield (data) {
    var row_name_arr = ['close', 'range', 'siege'];
    for(var m = 0; m < 2; m++){
        for (var j = 0; j < row_name_arr.length; j++) {
            var card_row = data.battle_arr[m][row_name_arr[j]];

            var k = card_row.units_cards.length;
            while(k != 0) {
                k--;
                card_row.units_cards[k].exponent      = 1;
                card_row.units_cards[k].added         = 0;
                card_row.units_cards[k].multiplier    = 1;
                card_row.units_cards[k].multihorn     = 1;
                card_row.units_cards[k].fact_strength = card_row.units_cards[k].strength;
                if(card_row.units_cards[k].name == 'Чучело') {
                    card_row.units_cards[k].unit = 0;
                }
                if(m == 0){
                    data.retreat_home.push(card_row.units_cards[k]);
                }
                if(m == 1) {
                    data.retreat_rival.push(card_row.units_cards[k]);
                }
                card_row.units_cards.splice(k,1);
            }

            var l = card_row.row_specials.length;
            while(l != 0) {
                l--;
                if(card_row.row_specials[l].ability == 'commander_horn'){
                    delete card_row.row_specials[l].field_horn;
                }
                if(m == 0){
                    data.retreat_home.push(card_row.row_specials[l]);
                }
                if(m == 1) {
                    data.retreat_rival.push(card_row.row_specials[l]);
                }
                card_row.row_specials.splice(l,1);
            }
            card_row.effects = [];
        }

        var n = data.battle_arr[m].specials.length;
        while(n != 0) {
            n--;
            if(m == 0){
                data.retreat_home.push(data.battle_arr[m].specials[0]);
            }
            if(m == 1){
                data.retreat_rival.push(data.battle_arr[m].specials[0]);
            }
            data.battle_arr[m].specials.splice(0,1);
        }
        data.battle_arr[m].effects = [];
        data.battle_arr[m].leader  = {};
    }
}


//////////////////////////////////////////////////////////////////
// Удаление карты со стола
//////////////////////////////////////////////////////////////////
function delete_card (data) {
    if(data.card.from_medic == 1) {
        var retreat = {};
        if(data.ind == 0){
            retreat = data.retreat_home;
        } else {
            retreat = data.retreat_rival;
        }
        for(var k = 0; k < retreat.length; k++){
            if(retreat[k].id == data.card.id){
                retreat.splice(k, 1);
            }
        }
    } else {
        if(data.card.from_theft == 1) {
            var retreat = {};
            if(data.ind == 0){
                retreat = data.retreat_rival;
            } else {
                retreat = data.retreat_home;
            }
            for(var k = 0; k < retreat.length; k++){
                if(retreat[k].id == data.card.id){
                    retreat.splice(k, 1);
                }
            }
        } else {
            var effects = data.battle_arr[data.ind][data.field_name].effects;
            var j = effects.length;
            while(j != 0) {
                j--;
                if(effects[j] == data.card.ability){
                    abilities_obj[data.card.ability](data.battle_arr[data.ind][data.field_name], 5);
                    effects.splice(j, 1);
                    break; // чтоб не удаляло все карты, если есть одинаковые!
                }
            }

            var units = data.battle_arr[data.ind][data.field_name].units_cards;
            var i = units.length;
            while(i != 0) {
                i--;
                if(units[i].id == data.card.id){
                    if(data.card.from_dummy != 1) {
                        units[i].exponent      = 1;
                        units[i].added         = 0;
                        units[i].multiplier    = 1;
                        units[i].multihorn     = 1;
                        units[i].fact_strength = units[i].strength;
                        if(data.ind == 0){
                            data.retreat_home.push(clone(units[i]));
                        } else {
                            data.retreat_rival.push(clone(units[i]));
                        }
                        units.splice(i, 1);
                    }
                    break; // чтоб не удаляло все карты, если есть одинаковые!
                }
            }
        }
    }
    last_card(data);
}

//////////////////////////////////////////////////////////////////
// Удаление данных из локального хранилища по окончанию игры
//////////////////////////////////////////////////////////////////
function clear_storage(number_of_room) {
    localStorage.removeItem('count_repl_' + number_of_room);
    localStorage.removeItem('player_cards_' + number_of_room);
    localStorage.removeItem('deck_complete_' + number_of_room);
}



$(document).ready(function () {

    function Counts_data() {
        this.user_room      = number_of_room;
        this.player_index   = player_index;
        this.count_cards    = player_cards.length;
        this.count_deck     = deck_complete.length;
    }

    function Timer_data() {
        this.user_room      = number_of_room;
        this.player_index   = player_index;
        this.rival_index    = rival_index;
        this.resolution     = resolution;
        this.time           = time;

    }

//////////////////////////////////////////////////////////////////
// Запуск таймеров хода игроков
//////////////////////////////////////////////////////////////////
    function timer_move2(mode, type, number_of_room) {
        // mode: 1 - новый таймер    2 - страница обновлялась
        // type: 1 - таймер игрока   2 - таймер соперника

        var timer_obj = {},
            time = 0,
            random,
            key,
            check,
            selector;
        if(mode == 1){
            time = check = 60;
            if(type == 2) {
                time = check = 70;
            }
        } else {
            if(localStorage['timer_' + number_of_room]){
                timer_obj = JSON.parse(localStorage['timer_' + number_of_room]);
                time   = parseFloat(timer_obj.time);
                random = parseFloat(timer_obj.random);
                key    = parseFloat(timer_obj.key);
                check  = ((((key - 4819) / 17) + 6) * 2) / (random * 16);
            } else {
                $('.pass').click();
            }
        }

        if(check == time){
                timer = setInterval(function() {
                time--;
                random = Math.floor(Math.random() * (101));
                key = ((((time * random * 16) / 2) - 6) * 17) + 4819;
                timer_obj.time = time;
                timer_obj.random = random;
                timer_obj.key = key;
                localStorage['timer_' + number_of_room] = JSON.stringify(timer_obj);
                if(time < 100) {
                    if(type == 1){
                        selector = ".home .user_info";
                    } else {
                        selector = ".rival .user_info";
                    }
                    if($('.timer').length == 0){
                        $(selector).append($('<div/>').addClass('timer'));
                    }
                    $('.timer').text(time);
                }
                if(time == 0) {
                    clear_timer_move(number_of_room);
                    if(type == 1) {
                        //если вдруг в это время открыто поле воскрешения карты
                        $('.choice .card_on_table').eq(0).trigger("click");
                        //если вдруг в это время активна карта Командирский рог
                        $('.row_home .battle_row').eq(0).trigger("click");
                        //если вдруг в это время активна карта Чучела
                        $('.home .cards_field .card_on_table').eq(0).trigger("click");
                        //если вдруг в это время отурыто поле замены карт
                        $('.card_rewiev .skip').eq(0).trigger("click");
                        $('.pass').click();
                    }
                }
            }, 1000);
        } else {
            $('.pass').click();
        }
    }

//////////////////////////////////////////////////////////////////
// Запуск таймеров хода игроков
// mode: 0 - новый ход, 1 - из истории
//////////////////////////////////////////////////////////////////
    function timer_move(mode) {
        $('.timer').remove();
        clearInterval(timer);
        if(player_index != -1) {
            if(mode == 1){
                time = 60;
            } else {
                if(resolution == 1){
                    time = history.timer[player_index];
                } else {
                    time = history.timer[rival_index];
                }
            }
            var selector = '';
            if(resolution == 1) {
                selector = ".home .user_info";
            } else {
                selector = ".rival .user_info";
            }
        } else {
            if(history.resolution[0] == 0){
                selector = ".rival .user_info";
                if(mode == 1){
                    time = 60;
                } else {
                    if(localStorage['timer_' + number_of_room]){
                        time   = parseFloat(localStorage['timer_' + number_of_room]);
                    } else {
                        time = history.timer[1];
                    }
                }
            } else {
                selector = ".home .user_info";
                if(mode == 1){
                    time = 60;
                } else {
                    if(localStorage['timer_' + number_of_room]){
                        time   = parseFloat(localStorage['timer_' + number_of_room]);
                    } else {
                        time = history.timer[0];
                    }
                }
            }
        }

        timer = setInterval(function() {
            time--;
            if(player_index == -1) {
                localStorage['timer_' + number_of_room] = time;
            }
            if(time < 100) {
                if($('.timer').length == 0){
                    $(selector).append($('<div/>').addClass('timer'));
                }
                $('.timer').text(time);
            }
            if(time == 0) {
                $('.timer').remove();
                clearInterval(timer);
                if(player_index == -1) {
                    localStorage.removeItem('timer_' + number_of_room);
                }
                if((resolution == 1 || temp_resolution == 1) && player_index != -1) {
                    //если вдруг в это время открыто поле воскрешения карты
                    $('.choice .card_on_table').eq(0).trigger("click");
                    //если вдруг в это время активна карта Командирский рог
                    $('.row_home .battle_row').eq(0).trigger("click");
                    //если вдруг в это время активна карта Чучела
                    $('.home .cards_field .card_on_table').eq(0).trigger("click");
                    //если вдруг в это время отурыто поле замены карт
                    $('.card_rewiev .skip').eq(0).trigger("click");
                    $('.pass').click();
                }
            }
        }, 1000);
    }

//////////////////////////////////////////////////////////////////
// Удаление таймеров хода игроков
//////////////////////////////////////////////////////////////////
    function clear_timer_move() {
        $('.timer').remove();
        clearInterval(timer);
    }

    var i,                      /* счётчик */
        length,                 /* граница счётчика */
        selector,               /* переменная для хранения селектора*/
        message,                /* сообщение */
        user_id,                /* id игрока */
        username,               /* ник игрока */
        number_of_room,         /* номер игровой комнаты */
        alias_player,           /* переменная с индексом игрока */
        alias_rival,            /* переменная с индексом противника */
        out,                    /* таймер */
        timer,                  /* таймер */
        timer_out,              /* таймер */
        time,                   /* счётчик таймера */
        memory_ability  = '',   /* переменная для хранения выполняющейся способности */
        memory_id       = '',   /* переменная для хранения id играемой карты */
        memory_card     = {},   /* переменная для хранения карты */
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
        result_ability  = [],   /* результат отработки способности */
        player_index    = -1,   /* индекс игрока: -1: зритель; 0: игрок; 1: соперник */
        rival_index     = 0,    /* индекс соперника */
        choose_flag     = 0,    /* флаг: выбирал ли уже игрок карты на замену */
        count_repl      = 0,    /* количество заменённых карт */
        resolution      = 0,    /* разрешение на ход */
        temp_resolution = 0,    /* хранение состояния разрешения*/
        dsc_resolution  = -1,    /* блокировка разрешения при разрыве соединения с соперником*/
        give_up_home    = 0,    /* флаг ПАС для игрока */
        give_up_rival   = 0,    /* флаг ПАС для противника */
        health_home     = 2,    /* жизни игрока */
        health_rival    = 2,    /* жизни соперника */
        end_of_game     = 0,    /* флаг конца игры */
        exp             = 0,    /* очки опыта */
        r_level         = 0,    /* уровень соперника */
        h_level         = 0,    /* уровень игрока */
        leaders_flag    = {},   /* флаг: использовал ли уже игрок своего лидера */
        count_moves     = {},   /* хранение номера хода игроков */
        leader_pic_$    = $('.leader_pic'),
        players_names_$ = $('.user_name'),
        user_pic_$      = $('.user_pic'),
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
        retreat_$       = $('.last_card'),
        pass            = $('.battle .pass'),
        results_h2_$    = $('.results_body h2');

    count_moves.h   = 0;    /* номер хода игрока */
    count_moves.r   = 0;    /* номер хода соперника */
    leaders_flag.h  = 0;    /* флаг: использовал ли уже игрок своего лидера */
    leaders_flag.r  = 0;    /* флаг: использовал ли уже противник своего лидера */
    var battle_arr  = [];   /* массив игрового стола */
    battle_arr[0]   = new Forces(".row_home");
    battle_arr[1]   = new Forces(".row_enemy");

    var string = window.location.toString();
    var regV = /\d+$/;
    number_of_room = parseInt(string.match(regV)[0]);

    var socket = io();

    //TODO: убрать этот кусок в релизе
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
            } else {
                user_id = 0;
            }
            var user_data       = {};
            user_data.user_id   = user_id;
            user_data.user_name = username;
            user_data.user_room = number_of_room;
            socket.emit('user connect', user_data);
        }
    });


    socket.on('disconnect', function(){
        setTimeout(function(){
            if(player_index != -1) {
                var timer_data = new Timer_data();
                socket.emit('timer', timer_data);
            }
            message = "Потеряна связь с сервером, пожалуйста, перегрузите страницу";
            notice(message, 2);
        }, 1000);
    });

    socket.on('user without deck', function(){
        message = "У вас ещё не создана колода карт.";
        notice(message, 2);
    });

    socket.on('battle is not exist', function(){
        setTimeout(function(){
            $('.results_game').fadeIn(50,function(){});
        }, 50);
        results_h2_$.text("Битвы или не было, или она уже закончилась.");
        $('.results_table').remove();
    });

    socket.on('rivals are not complete', function(){
        message = "Соперники не готовы.";
        notice(message, 2);
    });

    socket.on('second player is not ready', function(){
        $('.battle_field').append($('<div />').addClass('not_ready').text('Ваш соперник пока не готов. Ожидайте.'));
    });

    socket.on('go home', function(){
        $('.table').remove();
    });

    socket.on('start battle', function(data){
        $('.battle_field .not_ready').remove();
        if(data[1] == 0) {
            notice_round(1, 1);
            if(player_index != -1){
                resolution = data[0][player_index];
                timer_move(1);
                if(resolution == 1) {
                    status_move_$.text('ВАШ ХОД');
                } else {
                    status_move_$.text('ХОД ПРОТИВНИКА');
                }
            }
        }
    });

    socket.on('player out', function(data){
        if(end_of_game == 0){
            var id_loose = data[0],
                user_name,
                i,
                selector_field,
                selector_user;
            for(i = 0; i < 2; i++) {
                if(work_obj[0].players[i].user_id != id_loose){
                    user_name = work_obj[0].players[i].user_name;
                    break;
                }
            }
            if(player_index != -1) {
                var timer_data = new Timer_data();
                socket.emit('timer', timer_data);
            }

            $('.timer').remove();
            clearInterval(timer);
            dsc_resolution = resolution;
            resolution = 0;
            selector_field = '.rival.player_data';
            selector_user  = ".rival .user_info";
            if(player_index == -1 && i == 1){
                selector_field = '.home.player_data';
                selector_user = ".home .user_info";
            }
            $(selector_field).addClass('out');
            message = "Потеряно соединение с игроком. Техническая победа через 60 секунд. Не перезагружайте страницу.";
            if(player_index == -1) {
                message = "Потеряно соединение с игроком. Не перезагружайте страницу."
            }
            notice(message, 2);
            var time_out;
            time_out = 60;
            timer_out = setInterval(function() {
                time_out--;
                if($('.timer2').length == 0){
                    $(selector_user).append($('<div/>').addClass('timer2'));
                }
                $('.timer2').text(time_out);
            }, 1000);
            out = setTimeout(function(){
                end_of_game = 1;
                setTimeout(function(){
                    $('.results_game').fadeIn(500, function(){});
                }, 1000);
                $('.results_table').remove();
                if(player_index == -1) {
                    results_h2_$.text("Победа " + user_name + "!");
                } else {
                    results_h2_$.text("Победа!").addClass('win');
                    if(data[1] > 7){
                        exp = 2;
                    } else {
                        exp = 0;
                    }
                    results_h2_$.after($('<div/>')
                        .addClass('exp_block')
                        .text("Опыта получено: " + exp + "xp"));
                    var player_res = {};
                    var new_exp = parseInt(work_obj[0].players[player_index].user_exp) + exp,
                        new_level;
                    if(new_exp >= 100) {
                        new_exp = new_exp - 100;
                        new_level = parseInt(work_obj[0].players[player_index].user_level) + 1;
                    } else {
                        new_level = parseInt(work_obj[0].players[player_index].user_level);
                    }
                    player_res.room   = number_of_room;
                    player_res.id     = user_id;
                    player_res.exp    = new_exp;
                    player_res.level  = new_level;
                    if(exp > 0) {
                        player_res.win = 1;
                    } else {
                        player_res.win = 0;
                    }
                    socket.emit('results', player_res);
                    exp = 0;
                    $('.table').remove();
                    clear_storage(number_of_room);
                }
            }, 60000);
        }
    });

    socket.on('clear timeout', function(){
        console.log('Переподключение игрока');
        clearTimeout(out);
        clearInterval(timer_out);
        $('.timer2').remove();
        $('.player_data').removeClass('out');
        timer_move(2);
        if(player_index != -1) {
            message = "Ваш соперник вернулся в игру.";
            notice(message, 1);
            if(dsc_resolution != -1) {
                resolution = dsc_resolution;
            }
            if(resolution == 1) {
                status_move_$.text('ВАШ ХОД');
            } else {
                status_move_$.text('ХОД ПРОТИВНИКА');
            }
        }
    });

    socket.on('player exit', function(data){
        var looser_id = data.looser,
            user_name,
            i,
            selector;
        for(i = 0; i < 2; i++) {
            if(work_obj[0].players[i].user_id != looser_id){
                user_name = work_obj[0].players[i].user_name;
                break;
            }
        }
        resolution = 0;
        clearInterval(timer);
        $('.timer').remove();
        end_of_game = 1;
        setTimeout(function(){
            $('.results_game').fadeIn(500, function(){});
        }, 1000);
        $('.results_table').remove();
        if(player_index == -1) {
            results_h2_$.text("Противник сдался! Победа " + user_name + "!");
        } else {
            results_h2_$.text("Противник сдался! Победа!").addClass('win');
            if(health_rival < 2){
                exp = 3;
            } else {
                exp = 2;
            }
            if(r_level > h_level) {
                exp++;
            }
            results_h2_$.after($('<div/>')
                .addClass('exp_block')
                .text("Опыта получено: " + exp + "xp"));
            var player_res = {};
            var new_exp = parseInt(work_obj[0].players[player_index].user_exp) + exp,
                new_level;
            if(new_exp >= 100) {
                new_exp = new_exp - 100;
                new_level = parseInt(work_obj[0].players[player_index].user_level) + 1;
            } else {
                new_level = parseInt(work_obj[0].players[player_index].user_level);
            }
            player_res.room   = number_of_room;
            player_res.id     = user_id;
            player_res.exp    = new_exp;
            player_res.level  = new_level;
            player_res.win    = 1;
            socket.emit('results', player_res);
            exp = 0;
            $('.table').remove();
            clear_storage(number_of_room);
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
                    pass.css('display', 'block');
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
                    pass.css('display', 'block');
                    break;

                default:
                    player_index = -1;
                    rival_index  =  1;
                    break;
            }
            for (i = 0; i < 2; i++) {

                leaders[i].leader = 1;
                leaders[i].ability = leaders[i].func;

                leader_pic_$.eq(i).attr({
                    'src':          "../" + leaders[i].pict,
                    'data-desc':    leaders[i].desc_func,
                    'title':        leaders[i].name,
                    'alt':          leaders[i].name
                });

                fraction_pic_$.eq(i).attr({
                    'src':          "../" + fractions[i].pict,
                    'title':        fractions[i].name,
                    'alt':          fractions[i].name
                });

                deck_cover_$.eq(i).attr({
                    'src':          "../" + fractions[i].pict_cover,
                    'title':        fractions[i].name,
                    'alt':          fractions[i].name
                });
            }

            // Вывод начальных данных для игроков
            if(player_index != -1) {
                history                 = work_obj[2];
                player_deck.units       = work_obj[1].units.split(',').map(Number);
                player_deck.specials    = work_obj[1].specials.split(',').map(Number);
                players_names_$.eq(0).text(work_obj[0].players[player_index].user_name);
                players_names_$.eq(1).text(work_obj[0].players[rival_index].user_name);
                if(work_obj[0].players[player_index].user_pict == '' || work_obj[0].players[player_index].user_pict == null){
                    user_pic_$.eq(0).attr('src', "../imgs/users/noname.png");
                } else {
                    user_pic_$.eq(0).attr('src', '../' + work_obj[0].players[player_index].user_pict);
                }
                if(work_obj[0].players[rival_index].user_pict == '' || work_obj[0].players[rival_index].user_pict == null){
                    user_pic_$.eq(1).attr('src', "../imgs/users/noname.png");
                } else {
                    user_pic_$.eq(1).attr('src', '../' + work_obj[0].players[rival_index].user_pict);
                }
                h_level = parseInt(work_obj[0].players[player_index].user_level);
                r_level = parseInt(work_obj[0].players[rival_index].user_level);

                if(history.cards !== undefined) {
                    for(var j = 0; j < history.cards.length; j++) {
                        if(history.cards[j] == 'game_over') {
                            end_of_game = 1;
                        }
                    }
                }
                // Формирование колоды игрока
                if(!localStorage['player_cards_' + number_of_room] && end_of_game != 1) {
                    if(choose_flag == 0) {
                        player_cards = [];
                        deck_units = build_deck (player_deck.units, units[0], abilities);
                        deck_specials = build_deck (player_deck.specials, specials, abilities);
                        deck_complete = deck_units.concat(deck_specials);
                        deck_complete.shuffle().shuffle();
                        card_rewiev_$.css('display', 'block');
                        for (var i = 0; i < 10; i++) {
                            player_cards.push(deck_complete[0]);
                            deck_complete.splice(0,1);
                         }
                        show_cards(0, player_cards, block_rewiev_$);
                        // TODO: добавить в релизе
                        //localStorage['count_repl_' + number_of_room] = count_repl;
                        //localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
                        //localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);

                        // Блокируем изменение созданной колоды
                        choose_flag = 1;
                    }
                } else {
                    // TODO: изменить условия проверок в релизе
                    player_cards = JSON.parse(localStorage['player_cards_' + number_of_room]);
                    deck_complete = JSON.parse(localStorage['deck_complete_' + number_of_room]);
                    if(choose_flag == 0 && localStorage['count_repl_' + number_of_room] == 2) {
                        show_cards (0, player_cards, cards_$);
                        i_am_ready (socket, user_id, username, number_of_room, player_index);
                        choose_flag = 1;
                    } else {
                        if(choose_flag == 0 && localStorage['count_repl_' + number_of_room] < 2) {
                            card_rewiev_$.css('display', 'block');
                            show_cards(0, player_cards, block_rewiev_$);
                            choose_flag = 1;
                        }
                    }
                }

            } else {
                // Вывод начальных данных для зрителей
                history = work_obj[1];
                for(var j = 0; j < 2; j++) {
                    players_names_$.eq(j).text(work_obj[0].players[j].user_name);
                    if(work_obj[0].players[j].user_pict == '' || work_obj[0].players[j].user_pict == null){
                        user_pic_$.eq(j).attr('src', "../imgs/users/noname.png");
                    } else {
                        user_pic_$.eq(j).attr('src', '../' + work_obj[0].players[j].user_pict);
                    }
                }
                $('.battle .pass').remove();
                $('.battle .exit').remove();
            }
            var counts_data = new Counts_data();
            socket.emit('counts', counts_data);
            // Обработка истории игры для новых подключившихся пользователей
            if (history.cards.length != 0 && count_moves.h == 0 && count_moves.r == 0) {
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
                        var data_on_table           = {};
                        data_on_table.retreat_home  = retreat_home;
                        data_on_table.retreat_rival = retreat_rival;
                        data_on_table.battle_arr    = battle_arr;
                        clear_battlefield (data_on_table);
                    } else {
                        if(history.cards[i] == 'game_over') {
                            end_of_game = 1;
                            $('.table').remove();

                            setTimeout(function(){
                                $('.results_game').fadeIn(1000,function(){});
                            }, 1000);
                            results_h2_$.text("Битва закончилась").addClass('win');
                            $('.results_table').remove();
                            clear_storage(number_of_room);
                            break;
                        } else {
                            // Если в истории обрабатывается обычная карта

                            var field_name, ind;
                            if(history.cards[i].player_index == player_index) {
                                count_moves.h++;
                                ind = 0;
                            } else {
                                if(player_index == -1) {
                                    if(history.cards[i].player_index == 0) {
                                        count_moves.h++;
                                    }
                                    if(history.cards[i].player_index == 1) {
                                        count_moves.r++;
                                    }
                                    ind = history.cards[i].player_index;
                                } else {
                                    count_moves.r++;
                                    ind = 1;
                                }
                            }
                            field_name = get_field(history.cards[i].card);
                            if (field_name !== undefined) {
                                if(history.cards[i].card.delete == 1) {
                                    // Если карту надо удалить с поля, а не добавить
                                    if(history.cards[i].player_index == rival_index){
                                        ind = 1;
                                    } else {
                                        ind = 0;
                                    }
                                    var delete_data           = {};
                                    delete_data.ind           = ind;
                                    delete_data.field_name    = field_name;
                                    delete_data.card          = history.cards[i].card;
                                    delete_data.battle_arr    = battle_arr;
                                    delete_data.retreat_home  = retreat_home;
                                    delete_data.retreat_rival = retreat_rival;
                                    delete_card(delete_data);
                                } else {
                                    battle_arr[ind][field_name].units_cards.push(history.cards[i].card);
                                }
                                battle_arr[ind][field_name].total = 0;
                            }
                            if(history.cards[i].card.delete != 1) {
                                var data_abilities           = {};
                                data_abilities.battle_arr    = battle_arr;
                                data_abilities.player_cards  = player_cards;
                                data_abilities.retreat_home  = retreat_home;
                                data_abilities.retreat_rival = retreat_rival;
                                data_abilities.player_index  = player_index;
                                data_abilities.rival_index   = rival_index;
                                data_abilities.count_moves   = count_moves;
                                data_abilities.position      = ind;
                                data_abilities.item_history  = history.cards[i];
                                result_ability = abilities_obj[history.cards[i].card.ability](data_abilities, 3);
                                if(history.cards[i].card.leader == 1){
                                    if(ind == 0){
                                        leaders_flag.h = 1;
                                        $('.home .player_leader').css('opacity', '0.5');
                                    } else {
                                        leaders_flag.r = 1;
                                        $('.rival .player_leader').css('opacity', '0.5');
                                    }
                                }
                            }

                            var counts_data = new Counts_data();
                            socket.emit('counts', counts_data);
                            count_strength (battle_arr, player_power_$);
                        }
                    }
                }
                count_strength (battle_arr, player_power_$);
                show_cards (1, battle_arr);
                if (retreat_home.length !=0 && retreat_rival != 0) {
                    var data = {};
                    data.retreat_home  = retreat_home;
                    data.count_move_h  = count_moves.h;
                    data.retreat_$     = retreat_$;
                    data.retreat_rival = retreat_rival;
                    data.count_move_r  = count_moves.r;
                    last_card(data);
                }

            } else {
                if(player_index != -1){
                    // Не могу вспомнить, зачем эта строка
                    resolution = history.resolution[player_index];
                    if(resolution == 1) {
                        status_move_$.text('ВАШ ХОД');
                    } else {
                        status_move_$.text('ХОД ПРОТИВНИКА');
                    }
                }
                // Не могу вспомнить, зачем эта строка
                // resolution = history.resolution[player_index];
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
            timer_move(2);
        }
    });


    // Обработка данных о количестве карт игроков для зрителей
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
            show_cards (0, player_cards, block_rewiev_$);
            count_repl++;
            localStorage['count_repl_' + number_of_room] = count_repl;
            localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
            localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);
            if(count_repl == 2) {
                card_rewiev_$.css('display', 'none');
                show_cards (0, player_cards, cards_$);
                var counts_data = new Counts_data();
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
        show_cards (0, player_cards, cards_$);
        var counts_data = new Counts_data();
        socket.emit('counts', counts_data);
        localStorage['count_repl_' + number_of_room] = 2;
        i_am_ready (socket, user_id, username, number_of_room, player_index);
    });


    // Ходы игроков
    battle_$.on("click", ".cards div, .home .player_leader", function() {
        memory_ability = '';
        memory_id      = '';
        memory_card    = {};
        if(temp_resolution == 1) {
            resolution = 1;
            temp_resolution = 0;
        }
        $('.cards div, .home .player_leader').removeClass('move');
        $(this).addClass('move');
    });

    battle_$.on("click", ".move", function() {
        if(resolution == 1 && give_up_home != 1 && player_index != -1) {
            var this_card = {};
            if ($(this).hasClass('player_leader')){
                this_card = leaders[0];
                leaders_flag.h = 1;
            } else {
                var ind = $(this).attr('data-item');
                this_card = player_cards[ind];
            }
            count_moves.h++;
            this_card.number_move = count_moves.h;
            var field_name;
            field_name = get_field(this_card);

            if (field_name !== undefined) {
                var flag_field = 0;
                battle_arr[flag_field][field_name].units_cards.push(this_card);
                show_cards (1, battle_arr);
                battle_arr[flag_field][field_name].total = 0;
                if(this_card.ability == 'medic'){
                    memory_ability  = this_card.ability;
                    memory_card     = this_card;
                    temp_resolution = 1;
                    resolution      = 0;
                    memory_id       = ind;
                }
            } else {
                if(this_card.ability == 'dummy'){
                    memory_ability = this_card.ability;
                    temp_resolution = 1;
                    resolution = 0;
                    memory_id = ind;
                    message = 'Кликните на карте вашего поля, которую хотите заменить';
                    notice(message, 1);
                    return false;
                }
                if(this_card.ability == 'commander_horn'){
                    memory_ability  = this_card.ability;
                    memory_card     = this_card;
                    temp_resolution = 1;
                    resolution      = 0;
                    memory_id       = ind;
                    message = 'Кликните на вашем поле, в котором хотите усилить карты';
                    notice(message, 1);
                    return false;
                }
            }
            if ($(this).hasClass('player_leader') == false){
                $(this).remove();
                player_cards.splice(ind,1);
            } else {
                $(this).css('opacity', '0.5');
            }
            count_strength (battle_arr, player_power_$);
            show_cards (0, player_cards, cards_$);
            count_cards_$.eq(0).text(player_cards.length);
            if(give_up_rival == 1) {
                resolution = 1;
                status_move_$.text('ВАШ ХОД. ПРОТИВНИК СДАЛСЯ');
                timer_move(1);
            } else {
                resolution = 0;
                status_move_$.text('ХОД ПРОТИВНИКА');
                if(this_card.ability != 'medic'){
                    timer_move(1);
                }
            }
            if(player_cards.length == 0 && leaders_flag.h == 1) {
                give_up_home = 1;
                resolution = 0;
                $('.pass').click();
            }

            var arr_data                  = [];
            var user_data                 = {};
            user_data.user_room           = number_of_room;
            user_data.player_index        = player_index;
            user_data.rival_index         = rival_index;
            user_data.user_id             = user_id;
            user_data.card                = this_card;
            user_data.resolution          = resolution;
            user_data.give_up             = give_up_home;
            arr_data.push(user_data);

            var data_abilities            = {};
            data_abilities.number_of_room = number_of_room;
            data_abilities.player_index   = player_index;
            data_abilities.rival_index    = rival_index;
            data_abilities.battle_arr     = battle_arr;
            data_abilities.player_cards   = player_cards;
            data_abilities.deck_complete  = deck_complete;
            data_abilities.retreat_home   = retreat_home;
            data_abilities.retreat_rival  = retreat_rival;
            data_abilities.count_moves    = count_moves;
            data_abilities.position       = ind;
            data_abilities.socket         = socket;
            data_abilities.arr_data       = arr_data;

            result_ability = abilities_obj[this_card.ability](data_abilities, 1);
            socket.emit('step to', result_ability);
            var counts_data = new Counts_data();
            socket.emit('counts', counts_data);
            count_strength (battle_arr, player_power_$);
            show_cards (1, battle_arr);
            localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
            localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);
        }
    });


    // Обработка пришедших карт
    socket.on('step from', function(user_data){
        count_moves.r++;
        give_up_rival = user_data.give_up;
        if(player_index != -1){
            if(give_up_home != 1) {
                status_move_$.text('ВАШ ХОД');
            }
        }
        for(var i = 0; i < user_data.length; i++) {
            var field_name, position;
            if(player_index == -1) {
                position = user_data[i].player_index;
                status_move_$.text('');
                history.resolution = user_data[i].resolution_h;
            } else {
                position = 1;
            }
            field_name = get_field(user_data[i].card);
            if (field_name !== undefined) {
                if(user_data[i].card.delete == 1) {   // Если карту надо удалить с поля, а не добавить
                    if(user_data[i].player_index == rival_index){
                        position = 1;
                    } else {
                        position = 0;
                    }
                    var delete_data           = {};
                    delete_data.ind           = position;
                    delete_data.field_name    = field_name;
                    delete_data.card          = user_data[i].card;
                    delete_data.battle_arr    = battle_arr;
                    delete_data.retreat_home  = retreat_home;
                    delete_data.retreat_rival = retreat_rival;
                    delete_card(delete_data);
                } else {
                    battle_arr[position][field_name].units_cards.push(user_data[i].card);
                }
                battle_arr[position][field_name].total = 0;
            }
            if(user_data[i].card.delete != 1) {
                var data_abilities           = {};
                data_abilities.battle_arr    = battle_arr;
                data_abilities.player_index  = player_index;
                data_abilities.rival_index   = rival_index;
                data_abilities.player_cards  = player_cards;
                data_abilities.deck_complete = deck_complete;
                data_abilities.retreat_home  = retreat_home;
                data_abilities.retreat_rival = retreat_rival;
                data_abilities.count_moves   = count_moves;
                data_abilities.socket        = socket;
                data_abilities.position      = position;
                data_abilities.from_player   = user_data[i].player_index;
                data_abilities.card          = user_data[i].card;

                result_ability = abilities_obj[user_data[i].card.ability](data_abilities, 2);
                if(user_data[i].card.leader == 1){
                    if(position == 0){
                        leaders_flag.h = 1;
                        $('.home .player_leader').css('opacity', '0.5');
                    } else {
                        leaders_flag.r = 1;
                        $('.rival .player_leader').css('opacity', '0.5');
                    }
                }
            }
            var counts_data            = {};
            counts_data.user_room      = number_of_room;
            counts_data.player_index   = player_index;
            counts_data.count_cards    = player_cards.length;
            counts_data.count_deck     = deck_complete.length;
            socket.emit('counts', counts_data);
            count_strength (battle_arr, player_power_$);
            show_cards (1, battle_arr);
        }

        if(give_up_home != 1) {
            resolution = 1;
        } else {
            resolution = 0;
        }
        localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
        localStorage['deck_complete_' + number_of_room] = JSON.stringify(deck_complete);
        timer_move(1);
    });

    // Кнопка "ПАС"
    battle_$.on("click", ".pass", function() {
        status_move_$.text('ХОД ПРОТИВНИКА. ВЫ СДАЛИСЬ');
        give_up_home            = 1;
        var user_data           = {};
        user_data.player_index  = player_index;
        user_data.rival_index   = rival_index;
        user_data.give_up       = give_up_home;
        user_data.user_room     = number_of_room;
        user_data.count_cards   = player_cards.length;
        socket.emit('give up', user_data);
        fold('.row_home');
        $('.cards div').removeClass('move');
        memory_ability = '';
        memory_id      = '';
        memory_card    = {};
        resolution     = 0;
        timer_move(1);
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
                history.resolution = user_data.resolution;
                if(user_data.player == 0){
                    fold('.row_home');
                }
                if(user_data.player == 1){
                    fold('.row_enemy');
                }
            }
            timer_move(1);
        } else {
            $('.cards div').removeClass('move');
            round_results.push([battle_arr[0].total, battle_arr[1].total]);
            memory_ability = '';
            memory_id      = '';
            memory_card    = {};
            var winner     = '';
            var looser     = '';
            alias_player   = player_index;
            alias_rival    = rival_index;
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
                end_of_game = 1;
                $('.timer').remove();
                clearInterval(timer);
                setTimeout(function(){
                    $('.results_game').fadeIn(1000,function(){});
                }, 1000);

                var td_head_$ = $('.results_body thead td');
                var td_body_$ = $('.results_body tbody');
                td_head_$.eq(1).text(work_obj[0].players[alias_player].user_name);
                td_head_$.eq(2).text(work_obj[0].players[alias_rival].user_name);

                if(health_home == 0){
                    if(player_index == -1) {
                        if(health_rival != 0) {
                            results_h2_$.text("Победа " + work_obj[0].players[alias_rival].user_name + "!");
                        } else {
                            results_h2_$.text("Ничья!");
                        }
                    } else {
                        results_h2_$.text("Поражение!");
                    }
                    if (health_rival != 0) {
                        td_head_$.eq(2).addClass('win');
                    }
                } else {
                    if(player_index == -1) {
                        results_h2_$.text("Победа " + work_obj[0].players[alias_player].user_name + "!");
                    } else {
                        results_h2_$.text("Победа!").addClass('win');
                    }
                    if (health_home != 0) {
                        td_head_$.eq(1).addClass('win');
                    }
                }
                td_body_$.empty();
                length = round_results.length;
                var win_count = 0;
                for (i = 0; i < length; i++) {                    
                    var class_home = '',
                        class_rival = '';
                    if(round_results[i][0] > round_results[i][1]) {
                        class_home = 'win';
                        win_count++;
                    }

                    if(round_results[i][0] < round_results[i][1]) {
                        class_rival = 'win';
                    }
                    td_body_$.append($('<tr/>')
                        .append($('<td/>').text(i+1))
                        .append($('<td/>').text(round_results[i][0]).addClass(class_home))
                        .append($('<td/>').text(round_results[i][1]).addClass(class_rival))
                    )
                }

                if(end_of_game == 1 && player_index != -1) {
                    exp = 0;
                    if(length == 3){
                        //победа
                        if(win_count == 2) {
                            exp = 2;
                        }

                        //выигрыш одного раунда из 3
                        if(win_count == 1) {
                            exp = 1;
                        }

                        //победа сильнейшего соперника
                        if(win_count == 2 && r_level > h_level) {
                            exp++;
                        }
                    }
                    if(length == 2){
                        //чистая победа
                        if(win_count == 2) {
                            exp = 3;
                        }

                        //выигрыш раунда после ничьи
                        if(win_count == 1) {
                            exp = 2;
                        }

                        //ничья в обоих раундах
                        if(win_count == 0 && health_home == 0 && health_rival == 0) {
                            exp = 1;
                        }

                        //чистая победа сильнейшего соперника
                        if(win_count == 2 && r_level > h_level) {
                            exp++;
                        }

                        //победа сильнейшего соперника
                        if(win_count == 1 && r_level > h_level) {
                            exp++;
                        }
                    }

                    results_h2_$.after($('<div/>')
                        .addClass('exp_block')
                        .text("Опыта получено: " + exp + "xp"));
                    var player_res = {};

                    var new_exp = parseInt(work_obj[0].players[player_index].user_exp) + exp,
                        new_level;
                    if(new_exp >= 100) {
                        new_exp = new_exp - 100;
                        new_level = h_level + 1;
                    } else {
                        new_level = h_level;
                    }
                    if(exp > 1) {
                        player_res.win = 1;
                    } else {
                        player_res.win = 0;
                    }
                    player_res.room   = number_of_room;
                    player_res.id     = user_id;
                    player_res.exp    = new_exp;
                    player_res.level  = new_level;
                    socket.emit('results', player_res);
                    exp = 0;
                    clear_storage(number_of_room);
                }
                
            } else {
                notice_round (winner, 2);
                setTimeout(function(){
                    notice_round (user_data.round, 1);
                }, 4600);
                var data_on_table           = {};
                data_on_table.retreat_home  = retreat_home;
                data_on_table.retreat_rival = retreat_rival;
                data_on_table.battle_arr    = battle_arr;
                clear_battlefield (data_on_table);
                count_strength (battle_arr, player_power_$);
                show_cards (1, battle_arr);
                $('.fold').remove();
                for(var i = 0; i < 2; i++){
                    if(deck_complete.length > 0){
                        player_cards.push(deck_complete[0]);
                        deck_complete.splice(0, 1);
                    }
                }
                show_cards (0, player_cards, $('.cards'));
                var counts_data = new Counts_data();
                socket.emit('counts', counts_data);
                var data = {};
                data.retreat_home  = retreat_home;
                data.count_move_h  = count_moves.h;
                data.retreat_$     = retreat_$;
                data.retreat_rival = retreat_rival;
                data.count_move_r  = count_moves.r;
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
                timer_move(1);
            }
        }
    });

    battle_$.on("click", ".home .cards_field .card_on_table, .choice .card_on_table, .row_home .battle_row", function() {
        if(memory_ability != '' && temp_resolution == 1) {
            if(memory_ability == 'dummy'){
                var test = $(this).children().eq(0).attr('title');
                if(test === undefined) {
                    return false;
                }
            }
            if(memory_ability == 'commander_horn') {
                var class_card;
                var field_numb = $(this).closest('.battle_row').index();
                switch (field_numb){

                    case 0:
                        class_card = 4;
                        break;

                    case 1:
                        class_card = 3;
                        break;

                    case 2:
                        class_card = 2;
                        break;
                }
                memory_card.field_horn = class_card;
            }

            var mode = 0;
            var arr_data                  = [];
            var user_data                 = {};
            user_data.user_room           = number_of_room;
            user_data.player_index        = player_index;
            user_data.rival_index         = rival_index;
            user_data.user_id             = user_id;
            user_data.card                = memory_card;
            user_data.resolution          = resolution;
            user_data.give_up             = give_up_home;
            arr_data.push(user_data);

            var data_abilities            = {};
            data_abilities.number_of_room = number_of_room;
            data_abilities.player_index   = player_index;
            data_abilities.rival_index    = rival_index;
            data_abilities.memory_id      = memory_id;
            data_abilities.battle_arr     = battle_arr;
            data_abilities.player_cards   = player_cards;
            data_abilities.deck_complete  = deck_complete;
            data_abilities.retreat_home   = retreat_home;
            data_abilities.retreat_rival  = retreat_rival;
            data_abilities.socket         = socket;
            data_abilities.count_moves    = count_moves;
            data_abilities.arr_data       = arr_data;

            if(memory_ability == 'dummy' && test != 'Чучело'){
                var id_replace            = $(this).attr('data-id-card');
                data_abilities.id_replace = id_replace;
                mode = 1;
            } else {
                if(memory_ability == 'dummy' && test == 'Чучело') {
                    return false;
                }
            }

            if(memory_ability == 'medic'){
                data_abilities.item_card = $(this).attr('data-item');
                mode = 6;
            }

            if(memory_ability == 'commander_horn'){
                mode = 1;
            }
            result_ability = abilities_obj[memory_ability](data_abilities, mode);
            socket.emit('step to', result_ability);
            var counts_data = new Counts_data();
            socket.emit('counts', counts_data);

            localStorage['player_cards_' + number_of_room] = JSON.stringify(player_cards);
            resolution      = temp_resolution;
            memory_ability  = '';
            memory_card     = {};
            temp_resolution = 0;
            if(give_up_rival == 1) {
                resolution = 1;
                status_move_$.text('ВАШ ХОД. ПРОТИВНИК СДАЛСЯ');
            } else {
                resolution = 0;
                status_move_$.text('ХОД ПРОТИВНИКА');
            }
            if(player_cards.length == 0 && leaders_flag.h == 1) {
                give_up_home = 1;
                resolution = 0;
                $('.pass').click();
            }
            timer_move(1);
        }
    });

    // Кнопка "Сдаться"
    battle_$.on("click", ".exit", function() {
        if(confirm("Вы уверены, что хотите сдаться?")){
            var looser_id = work_obj[0].players[player_index].user_id;
            resolution = 0;
            $('.timer').remove();
            clearInterval(timer);
            end_of_game = 1;
            setTimeout(function(){
                $('.results_game').fadeIn(500, function(){});
            }, 500);
            $('.results_table').remove();
            results_h2_$.text("Поражение!");
            if(health_rival < 2) {
                exp = 1;
            } else {
                exp = 0;
            }
            results_h2_$.after($('<div/>')
                .addClass('exp_block')
                .text("Опыта получено: " + exp + "xp"));
            var player_res = {};
            var new_exp = parseInt(work_obj[0].players[player_index].user_exp) + exp,
                new_level;
            if(new_exp >= 100) {
                new_exp = new_exp - 100;
                new_level = parseInt(work_obj[0].players[player_index].user_level) + 1;
            } else {
                new_level = parseInt(work_obj[0].players[player_index].user_level);
            }
            player_res.room   = number_of_room;
            player_res.id     = user_id;
            player_res.exp    = new_exp;
            player_res.level  = new_level;
            player_res.looser = looser_id;
            player_res.win    = 0;
            socket.emit('results', player_res);
            exp = 0;
            $('.table').remove();
            clear_storage(number_of_room);
        } else {
           return false;
        }
    });

    battle_$.on("click", ".del", function() {
        localStorage.clear();
    });

    battle_$.on("contextmenu", "img", function() {
        message = $(this).attr('data-desc');
        if(message != undefined) {
            notice(message, 1);
        }
        return false;
    });

    battle_$.on("click", ".to_home", function() {
        clear_storage(number_of_room);
    });

});
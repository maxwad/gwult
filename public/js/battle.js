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
function build_deck (deck, from) {
    var to = [];
    for(var i = 0; i < deck.length; i++){
        for(var j = 0; j < from.length; j++){
            if(from[j].id == deck[i]) {
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
            from.push(source[i]);
            source.splice(i,1);
        }
        selector.append(
            $('<div/>').append(
                $('<img/>').attr({
                    'src':          "../" + from[i].pict,
                    'title':        from[i].name,
                    'data-item':    i
                })
            )
        );
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
// Конструктор объекта строк боя
//////////////////////////////////////////////////////////////////
function Row_obj (selector) {
    this.selector = selector;
    this.specials_card = [];
    this.units_cards = [];
    this.total = 0;
}

//////////////////////////////////////////////////////////////////
// Конструктор объекта войск игрока
//////////////////////////////////////////////////////////////////
function Forces (index) {
    this.siege = new Rows_obj();
    this.total = 0;
}
var a = new Forces();

$(document).ready(function () {

    var message,
        user_id,
        username,
        number_of_room,
        work_obj        = [],
        abilities       = [],
        fractions       = [],
        rival_fraction  = {},
        specials        = [],
        units           = [],
        player_deck     = {},
        leaders         = [],
        deck_units      = [],
        deck_specials   = [],
        deck_complete   = [],
        player_cards    = [],
        player_index    = -1,
        rival_index     = 0,
        choose_flag     = 0,
        count_repl      = 0,
        resolution      = 0;
        leader_pic      = $('.leader_pic'),
        fraction_name   = $('.fraction_name'),
        players_names   = $('.user_name'),
        fraction_pic    = $('.fraction_pic'),
        deck_cover      = $('.deck_cover'),
        battle          = $('.battle'),
        block_rewiev    = $('.block_rewiev'),
        card_rewiev     = $('.card_rewiev'),
        cards           = $('.cards');


    var battle_arr      = [];
        battle_arr[0].





    if(localStorage.count_repl) {
        count_repl = localStorage.count_repl;
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
            number_of_room  = window.location.toString().replace(/\D/g,'');
            var user_data       = {};
            user_data.user_id   = user_id;
            user_data.user_name = username;
            user_data.user_room = number_of_room;
            socket.emit('user connect', user_data);
        }
    });

    var socket = io();

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
        console.log(data);
        resolution = data[player_index];
        if(resolution == 1) {
            $('.status_move').text('ВАШ ХОД');
        } else {
            $('.status_move').text('ХОД ПРОТИВНИКА');
        }
    });


    socket.on('take data', function(msg){
        console.log(msg);
        if(msg[0].data_error == true) {
            message = "Не получены необходимые данные. Пожалуйста, попробуйте переподключиться к битве.";
            notice(message, 2);
            return false;
        } else {
            switch (user_id) {
                case parseInt(msg[0].players[0].user_id):
                    player_index  = 0;
                    rival_index   = 1;
                    break;

                case parseInt(msg[0].players[1].user_id):
                    player_index  = 1;
                    rival_index   = 0;
                    break;

                default:
                    player_index = -1;
                    break;
            }
            work_obj    = msg;
            units       = work_obj[0].units;
            leaders     = work_obj[0].leaders;
            abilities   = work_obj[0].abilities;
            specials    = work_obj[0].specials;
            fractions   = work_obj[0].fractions;
            // Вывод начальных данных для игроков
            if(player_index != -1) {
                for(var i = 0; i < fractions.length; i++) {
                    if(fractions[i].id == work_obj[1].id_fraction) {
                        player_deck.fraction = fractions[i];
                    }
                    if(fractions[i].id == work_obj[0].leaders[rival_index].id_fraction) {
                        rival_fraction = fractions[i];
                    }
                }
                player_deck.units       = work_obj[1].units.split(',').map(Number);
                player_deck.specials    = work_obj[1].specials.split(',').map(Number);
                player_deck.leader      = work_obj[0].leaders[player_index];

                leader_pic.eq(1).attr({
                    src:   "../" + player_deck.leader.pict,
                    title: player_deck.leader.name,
                    alt:   player_deck.leader.name
                });
                leader_pic.eq(0).attr({
                    src:   "../" + work_obj[0].leaders[rival_index].pict,
                    title: work_obj[0].leaders[rival_index].name,
                    alt:   work_obj[0].leaders[rival_index].name
                });

                fraction_name.eq(1).text(player_deck.fraction.name);
                fraction_name.eq(0).text(rival_fraction.name);

                fraction_pic.eq(1).attr({
                    src:   "../" + player_deck.fraction.pict,
                    title: player_deck.fraction.name,
                    alt:   player_deck.fraction.name
                });
                fraction_pic.eq(0).attr({
                    src:   "../" + rival_fraction.pict,
                    title: rival_fraction.name,
                    alt:   rival_fraction.name
                });

                deck_cover.eq(1).attr({
                    src:   "../" + player_deck.fraction.pict_cover,
                    title: player_deck.fraction.name,
                    alt:   player_deck.fraction.name
                });
                deck_cover.eq(0).attr({
                    src:   "../" + rival_fraction.pict_cover,
                    title: rival_fraction.name,
                    alt:   rival_fraction.name
                });

                players_names.eq(1).text(work_obj[0].players[player_index].user_name);
                players_names.eq(0).text(work_obj[0].players[rival_index].user_name);

                // Формирование колоды игрока
                if(!localStorage.player_cards) {
                    if(choose_flag == 0) {
                        player_cards = [];
                        deck_units = build_deck (player_deck.units, units[player_index]);
                        deck_specials = build_deck (player_deck.specials, specials);
                        deck_complete = deck_units.concat(deck_specials);
                        deck_complete.shuffle();
                        card_rewiev.css('display', 'block');
                        show_cards(10, block_rewiev, player_cards, 1, deck_complete);
                        // Блокируем изменение созданной колоды
                        choose_flag = 1;
                    }
                } else {
                    player_cards = JSON.parse(localStorage.player_cards);
                    deck_complete = JSON.parse(localStorage.deck_complete);
                    if(choose_flag == 0 && localStorage.count_repl == 2) {
                        show_cards (player_cards.length, cards, player_cards, 0,'');
                        i_am_ready (socket, user_id, username, number_of_room, player_index);
                        choose_flag = 1;
                    } else {
                        if(choose_flag == 0 && localStorage.count_repl < 2) {
                            card_rewiev.css('display', 'block');
                            show_cards (player_cards.length, block_rewiev, player_cards, 0,'');
                            choose_flag = 1;
                        }
                    }
                }
                $('.deck_count').text(deck_complete.length);
                $('.player_deck').text(player_cards.length);


            } else {
                // Вывод начальных данных для зрителей
                work_obj[0].actual_fr = [];
                for(var i = 0; i < fractions.length; i++) {
                    if(fractions[i].id == work_obj[0].leaders[0].id_fraction) {
                        work_obj[0].actual_fr[0] = fractions[i];
                    }
                    if(fractions[i].id == work_obj[0].leaders[1].id_fraction) {
                        work_obj[0].actual_fr[1] = fractions[i];
                    }
                }

                for(var j = 0; j < 2; j++) {
                    leader_pic.eq(j).attr({
                        src: "../" + work_obj[0].leaders[j].pict,
                        title: work_obj[0].leaders[j].name,
                        alt: work_obj[0].leaders[j].name
                    });

                    fraction_name.eq(j).text(work_obj[0].actual_fr[j].name);

                    fraction_pic.eq(j).attr({
                        src: "../" + work_obj[0].actual_fr[j].pict,
                        title: work_obj[0].actual_fr[j].name,
                        alt: work_obj[0].actual_fr[j].name
                    });

                    deck_cover.eq(j).attr({
                        src: "../" + work_obj[0].actual_fr[j].pict_cover,
                        title: work_obj[0].actual_fr[j].name,
                        alt: work_obj[0].actual_fr[j].name
                    });

                    players_names.eq(j).text(work_obj[0].players[j].user_name);

                }
            }
        }
    });

    // Блокировка контекстного меню на карточках
    battle.on("contextmenu", ".block_rewiev img", function() {
        return false;
    });

    // Замена карт при формировании игровой колоды
    battle.on("dblclick", ".block_rewiev img", function() {
        if(count_repl < 2) {
            var index = $(this).attr('data-item');
            deck_complete.push(player_cards[index]);
            player_cards.splice(index, 1);
            deck_complete.shuffle();
            player_cards.push(deck_complete[0]);
            deck_complete.splice(0, 1);
            card_rewiev.css('display', 'block');
            show_cards (player_cards.length, block_rewiev, player_cards, 0,'');
            count_repl++;
            localStorage.count_repl = count_repl;
            localStorage.player_cards = JSON.stringify(player_cards);
            localStorage.deck_complete = JSON.stringify(deck_complete);
            if(count_repl == 2) {
                card_rewiev.css('display', 'none');
                show_cards (player_cards.length, cards, player_cards, 0,'');
                $('.deck_count').text(deck_complete.length);
                $('.player_deck').text(player_cards.length);
                i_am_ready (socket, user_id, username, number_of_room, player_index);
            }
        }
    });

    // Пропуск замены карт
    battle.on("click", ".card_rewiev .skip", function() {
        card_rewiev.css('display', 'none');
        localStorage.player_cards = JSON.stringify(player_cards);
        localStorage.deck_complete = JSON.stringify(deck_complete);
        show_cards (player_cards.length, cards, player_cards, 0,'');
        $('.deck_count').text(deck_complete.length);
        $('.player_deck').text(player_cards.length);
        localStorage.count_repl = 2;
        i_am_ready (socket, user_id, username, number_of_room, player_index);
    });

    // Ходы игроков
    battle.on("click", ".cards img", function() {
        console.log('thi sis work');
    });

});
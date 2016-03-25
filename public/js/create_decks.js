$(document).ready(function () {

var abilities,  // массив способностей
fractions,      // массив фракций
specials,       // массив специальных карт
leaders,        // массив лидеров выбранной фракции
units,          // массив юнитов выбранной фракции
units_user,     // массив юнитов пользователя
specials_user,  // массив специальных карт пользователя
deck_leader,    // id лидера пользователя
deck_fraction,  // id выбранной фракции
deck_units,     // массив id юнитов
deck_specials,  // массив id специальных карт
id_user,
selector;

var select_fraction = $('#select_fraction');
var leader_choice   = $('.leader_choice');
var card_view       = $('.card_view');
var deck_room       = $(".deck_room");
var data_block      = {};
var message         = '';


//////////////////////////////////////////////////////////////////
// функция выводит опуции select на формах и
// отображает списки созданных карт
//////////////////////////////////////////////////////////////////
function create_list_fr (rows, elem) {
    $(elem).empty();
    var obj_xxx = rows;

    $.each(obj_xxx, function(index){
        if (obj_xxx[index].name == "Нейтральная") {
            // Нейтральная фракция не выводится, т.к. такой по сути нет.
        } else {
            $(elem).append(
                $('<option value=' + obj_xxx[index].id +'>' + obj_xxx[index].name +'</option>')
            );
        }

    });
}


//////////////////////////////////////////////////////////////////
// Функция, которая выводит карты из массива в соответствующие поля по фильтру
//////////////////////////////////////////////////////////////////
function show_cards (obj, selector, filter, prop, value) {
    $.each(obj, function(index){
        // Вывод карт с фильтром или без
        if(filter == 0) {
            $(selector).append(
                $('<div/>').attr({
                    'class'         : 'item_card',
                    'data-id'       : obj[index].id,
                    'data-strength' : obj[index].strength
                }).append(
                        $('<img/>').attr({
                            'class'   : 'item_card_img',
                            'src'     : obj[index].pict,
                            'title'   : '',
                            'alt'     : ''
                        })
                    )
            );
        } else {
            if (obj[index][prop] == value) {
                $(selector).append(
                    $('<div/>').attr({
                        'class'         : 'item_card',
                        'data-id'       : obj[index].id,
                        'data-strength' : obj[index].strength
                    }).append(
                            $('<img/>').attr({
                                'class'   : 'item_card_img',
                                'src'     : obj[index].pict,
                                'title'   : '',
                                'alt'     : ''
                            })
                        )
                );
            }
        }

    });
}


//////////////////////////////////////////////////////////////////
// Функция сортироки колоды по силе
//////////////////////////////////////////////////////////////////
function userCompare(a,b){
    var r=0;
    if (a.strength > b.strength) { r = -1; }
    if (a.strength < b.strength) { r = 1; }
    return r;
}

//////////////////////////////////////////////////////////////////
// Функция, формирует колоду пользователя по исходным данным
//////////////////////////////////////////////////////////////////
function build_deck (deck, from, to) {
    for(var i = 0; i < deck.length; i++){
        for(var j = 0; j < from.length; j++){
            if(from[j].id == deck[i]) {
                to.push(from[j]);
                from.splice(j,1);
            }
        }
    }
    to.sort(userCompare);
}


//////////////////////////////////////////////////////////////////
// Функция, которая выводит карту лидера
//////////////////////////////////////////////////////////////////
function show_leader (obj, deck_leader) {
    $('.leader_block').empty();
    $.each(obj, function(index){
        if(obj[index].id == deck_leader) {
            $('.leader_block').empty().append(
                $('<div/>').attr({
                    'class'         : 'leader',
                    'data-id'       : obj[index].id
                }).append(
                        $('<img/>').attr({
                            'class'   : 'leader_img',
                            'src'     : obj[index].pict,
                            'title'   : obj[index].desc_func,
                            'alt'     : ''
                        })
                    )
            );
        }
    });
}



//////////////////////////////////////////////////////////////////
// Отправка запроса на начальные данные
//////////////////////////////////////////////////////////////////
function clear (selector) {
    $(selector).empty();
}


//////////////////////////////////////////////////////////////////
// Функция, которая заполняет статистику по колоде
//////////////////////////////////////////////////////////////////
function count_stat (units_user, specials_user) {
    var strength            = 0,
        quantity            = 0,
        numb_of_units       = $('.numb_of_units'),
        numb_of_specials    = $('.numb_of_specials'),
        hero                = 0;

    quantity = units_user.length + specials_user.length;
    $('.numb_of_cards').text(quantity);

    if(units_user.length < 22) {
        numb_of_units.text(units_user.length + '/22').css('color', 'red');
    } else {
        numb_of_units.text(units_user.length).css('color', 'green');
    }

    if(specials_user.length < 6) {
        numb_of_specials.text(specials_user.length + '/6').css('color', 'red');
    } else {
        numb_of_specials.text(specials_user.length).css('color', 'green');
    }

    $.each(units_user, function(index){
        if (units_user[index].hero == 1) {
            hero ++;
        }
    });
    $('.numb_of_heroes').text(hero);

    $.each(units_user, function(index){
        if (units_user[index].strength !== undefined) {
            strength += units_user[index].strength;
        }
    });
    $('.strength_deck').text(strength);

}


//////////////////////////////////////////////////////////////////
// Сброс фильтра отображения карт
//////////////////////////////////////////////////////////////////
function reset_filter () {
    $('ul li').removeClass('selected');
    $('ul li:first-child').addClass('selected');
}



//////////////////////////////////////////////////////////////////
// Функция обновления данных
//////////////////////////////////////////////////////////////////
function refresh_cards () {
    // Вывод логотипа выбранной фракции и её описание
    $.each(fractions, function(index){
        if (fractions[index].id == deck_fraction) {
            $('.desc_fraction').empty().append(fractions[index].desc_func);
            var background_img = 'url("'+ fractions[index].pict +
                '") 20% top no-repeat, url("'+
                fractions[index].pict +'") 80% top no-repeat';
            var background_size = '70px 70px';
            $('.fraction_choice').css({
                'background': background_img,
                'background-size': background_size
            });
        }
    });
    // Проверка нужна, чтобы при выборе новой фракции сохранялись
    // выбранные специальные карты
    if(specials_user === undefined) {
        specials_user = [];
    }
    units_user = [];

    show_leader (leaders, deck_leader);
    // Формируем колоду пользвателя и выводим его карты
    build_deck (deck_specials, specials, specials_user);
    build_deck (deck_units, units, units_user);
    clear ('#all_cards');
    clear ('#deck');
    show_cards (specials, '#all_cards', 0);
    show_cards (units, '#all_cards', 0);
    show_cards (specials_user, '#deck', 0);
    show_cards (units_user, '#deck', 0);
    count_stat (units_user, specials_user);
    reset_filter ();
}


//////////////////////////////////////////////////////////////////
// Функция выводит уникальную способность карты
//////////////////////////////////////////////////////////////////
    function view_card(obj, this_card){
        var pict, description;
        $.each(obj, function(index){
            if(obj[index].id == this_card.attr('data-id')) {
                pict = obj[index].pict;
                $.each(abilities, function(jndex){
                    if(abilities[jndex].id == obj[index].id_ability) {
                        description = abilities[jndex].description;
                    }
                });
            }
        });
        $('.pict_unit').attr('src', pict);
        $('.desc_unit').empty().text(description);
    }


//////////////////////////////////////////////////////////////////
// Отправка запроса на начальные данные
//////////////////////////////////////////////////////////////////


    $.ajax({
        url: "initial",
        method: "POST",
        data: '',
        success: function(response) {
            console.log(response);
            if(response.user == false) {
                window.location.href = "auth.html";
            }
            if(response.user_error == true) {
                message = "Неизвестная ошибка. Пожалуйста, перегрузите страницу";
                notice(message, 2);
                return false;
            } else {
                abilities       = response.abilities;
                fractions       = response.fractions;
                specials        = response.specials;
                leaders         = response.leaders;
                units           = response.units;
                id_user         = response.id_user;
                deck_fraction   = response.deck_user.id_fraction;
                deck_units      = response.deck_user.units;
                deck_specials   = response.deck_user.specials;
                deck_leader     = response.deck_user.leader;
                if(deck_units !== null) {
                    deck_units = deck_units.split(',').map(Number);
                } else {
                    deck_units = [];
                }

                if(deck_specials !== null) {
                    deck_specials = deck_specials.split(',').map(Number);
                } else {
                    deck_specials = [];
                }
                // Выводим список доступных фракций
                create_list_fr(fractions, "#select_fraction");
                if(deck_fraction == -1) {
                    $('#select_fraction').append(
                        $('<option value=' + deck_fraction + '> Фракция не выбрана </option>')
                    );
                }
                selector = "#select_fraction [value='" + deck_fraction + "']";
                $(selector).attr("selected", "selected");
                refresh_cards();
                $('.save_deck').addClass('not_visible');
            }
        }
    });


//////////////////////////////////////////////////////////////////
// Обновление данных на странице по запросу новой фракции
//////////////////////////////////////////////////////////////////
    select_fraction.change( function() {
        data_block.fraction = $(this).val();
        $.ajax({
            url: "give_me_fraction",
            method: "POST",
            data: data_block,
            success: function(response) {
                deck_fraction = data_block.fraction;
                units = response.units;
                leaders = response.leaders;
                refresh_cards ();
                $('.save_deck').removeClass('not_visible');
            }
        });
    });


//////////////////////////////////////////////////////////////////
// Фильтр отображения карт
//////////////////////////////////////////////////////////////////
    $('.filter_li').click( function() {
        var arr_units, arr_specials;
        if($(this).parent().parent().hasClass('filter_left')){
            selector = '#all_cards';
            arr_units = units;
            arr_specials = specials;
        }
        if($(this).parent().parent().hasClass('filter_right')){
            selector = '#deck';
            arr_units = units_user;
            arr_specials = specials_user;
        }

        $(this).parent().parent().find('.filter_li').removeClass('selected');
        $(this).addClass('selected');
        var li = $(this).attr('data-filter');
        switch (li) {
            case '1':
                clear (selector);
                show_cards (arr_specials, selector, 0);
                show_cards (arr_units, selector, 0);
                break;

            case '2':
                clear (selector);
                show_cards (arr_units, selector, 1, 'id_class', 2);
                show_cards (arr_units, selector, 1, 'id_class', 7);
                break;

            case '3':
                clear (selector);
                show_cards (arr_units, selector, 1, 'id_class', 3);
                show_cards (arr_units, selector, 1, 'id_class', 7);
                break;

            case '4':
                clear (selector);
                show_cards (arr_units, selector, 1, 'id_class', 4);
                break;

            case '5':
                clear (selector);
                show_cards (arr_specials, selector, 0);
                break;

            case '6':
                clear (selector);
                show_cards (arr_units, selector, 1, 'hero', 1);
                break;

            case '7':
                clear (selector);
                show_cards (arr_units, selector, 1, 'id_fraction', 6);
                break;
        }
    });


//////////////////////////////////////////////////////////////////
// Окно выбора лидера
//////////////////////////////////////////////////////////////////
    $('.change_leader, .leader_block').click( function() {
        if (leaders.length == 0){
            message = "Пожалуйста, выберите другую фракцию.";
            notice(message, 2);
            return false;
        } else{
            leader_choice.removeClass('not_visible');
            $('.leaders_block').empty();
            $.each(leaders, function(index){
                $('.leaders_block').append(
                    $('<div/>').attr({
                        'class'         : 'item_leader',
                        'data-id'       : leaders[index].id
                    }).append(
                            $('<img/>').attr({
                                'class'   : 'pict_leader',
                                'src'     : leaders[index].pict,
                                'title'   : leaders[index].name,
                                'alt'     : ''
                            })
                        )
                );
            });
            $('.save_deck').removeClass('not_visible');
        }
    });


//////////////////////////////////////////////////////////////////
// Вывод описания лидера
//////////////////////////////////////////////////////////////////
    deck_room.on('mouseover', '.item_leader',function() {
        var this_item = $(this);
        $.each(leaders, function(index){
            if(parseInt(this_item.attr('data-id')) == leaders[index].id) {
                $('.leader_choice p').text(leaders[index].desc_func);
            }
        });
    });


//////////////////////////////////////////////////////////////////
// Выбор лидера
//////////////////////////////////////////////////////////////////
    deck_room.on('click', '.item_leader',function() {
        deck_leader = $(this).attr('data-id');
        show_leader (leaders, deck_leader);
        leader_choice.addClass('not_visible');
        $('.leaders_block, .leader_choice p').empty();
    });


//////////////////////////////////////////////////////////////////
// Очистка пользовательской колоды
//////////////////////////////////////////////////////////////////
    $('.clean_deck').click( function() {
        reset_filter ();
        $('.deck').empty();
        var quantity_units      = units_user.length;
        var quantity_specials   = specials_user.length;
        for(var i = 0; i < quantity_units; i++){
            units.push(units_user[i]);
        }
        for(var j = 0; j < quantity_specials; j++){
            specials.push(specials_user[j]);
        }
        units_user.splice(0, units_user.length);
        deck_units.splice(0, deck_units.length);
        units.sort(userCompare);
        specials_user.splice(0, specials_user.length);
        deck_specials.splice(0, deck_specials.length);
        refresh_cards();
    });


//////////////////////////////////////////////////////////////////
// Перемещение карт между колодами
//////////////////////////////////////////////////////////////////
    deck_room.on('click', '.item_card',function() {
        var temp_deck = [];
        var is_unit = $(this).attr('data-strength');
        temp_deck.push($(this).attr('data-id'));

        if($(this).parent().hasClass('deck')) {
            if(is_unit === undefined){
                for(var i = 0; i < deck_specials.length; i++) {
                    if(deck_specials[i] == temp_deck[0]) {
                        deck_specials.splice(i,1);
                    }
                }
                build_deck (temp_deck, specials_user, specials);

            } else {
                for(var i = 0; i < deck_units.length; i++) {
                    if(deck_units[i] == temp_deck[0]) {
                        deck_units.splice(i,1);
                    }
                }
                build_deck (temp_deck, units_user, units);
            }
            $('.filter_left .filter_li').each(function(){
                if ($(this).hasClass('selected')) {
                    $(this).click();
                }
            });
        } else {
            if(is_unit === undefined){
                deck_specials.push(parseInt(temp_deck[0]));
                build_deck (temp_deck, specials, specials_user);
            } else {
                deck_units.push(parseInt(temp_deck[0]));
                build_deck (temp_deck, units, units_user);
            }
            $('.filter_right .filter_li').each(function(){
                if ($(this).hasClass('selected')) {
                    $(this).click();
                }

            });
        }
        $(this).remove();
        count_stat (units_user, specials_user);
        $('.save_deck').removeClass('not_visible');
    });



//////////////////////////////////////////////////////////////////
// Отображение деталей отдельных карт
//////////////////////////////////////////////////////////////////
    deck_room.on("contextmenu", ".item_card", function() {
        var this_card = $(this);
        var is_unit = this_card.attr('data-strength');
        card_view.removeClass('not_visible');
        if($(this).parent().hasClass('deck')) {
            if(is_unit === undefined){
                view_card(specials_user, this_card);
            } else {
                view_card(units_user, this_card);
            }
        } else {
            if(is_unit === undefined){
                view_card(specials, this_card);
            } else {
                view_card(units, this_card);
            }
        }
        return false;
    });



//////////////////////////////////////////////////////////////////
// Закрытие информации о карте
//////////////////////////////////////////////////////////////////
    $('.close_unit, .pict_unit').click( function() {
        $('.card_view').addClass('not_visible');
    });



//////////////////////////////////////////////////////////////////
// Сохранение данных в БД
//////////////////////////////////////////////////////////////////
    $('.save_deck').click( function() {
        if($('.leader_block img').attr('src') === undefined) {
            message = "Выберите лидера вашей фракции.";
            notice(message, 2);
            return false;
        }
        if(deck_units.length < 22 || deck_specials.length < 6){
            message = "Вы должны выбрать как минимум 22 юнита и 6 специальных карт.";
            notice(message, 2);
            return false;
        }
        var data_block          = {};
        data_block.id_user      = id_user;
        data_block.leader       = deck_leader;
        data_block.id_fraction  = deck_fraction;
        data_block.units        = deck_units.join(',');
        data_block.specials     = deck_specials.join(',');
        $.ajax({
            url: "update_deck",
            method: "POST",
            data: data_block,
            success: function(response) {
                if(response.update_error == true) {
                    message = "Ошибка при обновлении вашей колоды.";
                    notice(message, 2);
                } else {
                    message = "Ваша колода успешно сохранена.";
                    notice(message, 1);
                }
            }
        });
        $('.save_deck').addClass('not_visible');
    });


});
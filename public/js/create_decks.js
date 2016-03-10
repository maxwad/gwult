var fractions,
    selector,
    specials,
    leaders,
    units,
    units_user,
    specials_user,
    leader_user,
    fraction_user,
    deck_units,
    deck_specials;

var select_fraction = $('#select_fraction');
var data_block = {};


//////////////////////////////////////////////////////////////////
// функция выводит опуции select на формах и
// отображает списки созданных карт
//////////////////////////////////////////////////////////////////
function create_list (rows, elem) {
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
}


//////////////////////////////////////////////////////////////////
// Функция, которая выводит карту лидера
//////////////////////////////////////////////////////////////////
function show_leader (obj, leader_user) {
    $('.leader_block').empty();
    $.each(obj, function(index){
        if(obj[index].id == leader_user) {
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
// Функция обновления данных
//////////////////////////////////////////////////////////////////
function refresh_cards () {
    $.each(fractions, function(index){
        if (fractions[index].id == fraction_user) {
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
    units_user = [];
    specials_user = [];
    show_leader (leaders, leader_user);
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

            fractions = response.fractions;
            specials = response.specials;
            leaders = response.leaders;
            units = response.units;
            fraction_user = response.deck_user.id_fraction;
            deck_units = response.deck_user.deck;
            deck_specials = response.deck_user.specials;
            leader_user = response.deck_user.leader;
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
            create_list(fractions, "#select_fraction");
            if(fraction_user == -1) {
                $('#select_fraction').append(
                    $('<option value=' + fraction_user + '> Фракция не выбрана </option>')
                );
            }
            selector = "#select_fraction [value='" + fraction_user + "']";
            $(selector).attr("selected", "selected");
            refresh_cards ();
        }
    }
});


$(document).ready(function () {

//////////////////////////////////////////////////////////////////
// Обновление данных на странице по запросу новой фракции
//////////////////////////////////////////////////////////////////
    $('#select_fraction').change( function() {
        data_block.fraction = $(this).val();
        $.ajax({
            url: "give_me_fraction",
            method: "POST",
            data: data_block,
            success: function(response) {
                console.log(response);
                fraction_user = data_block.fraction;
                units = response.units;
                leaders = response.leaders;
                console.log(leaders);
                refresh_cards ();
                $('ul li').removeClass('selected');
                $('ul li:first-child').addClass('selected');
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
        console.log(li);
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


});
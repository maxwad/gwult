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
function show_cards (obj, selector) {
    $.each(obj, function(index){
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
    $.each(obj, function(index){
        if(obj[index].id == leader_user) {
            $('.leader_block').append(
                $('<div/>').attr({
                    'class'         : 'leader',
                    'data-id'       : obj[index].id
                }).append(
                        $('<img/>').attr({
                            'class'   : 'leader_img',
                            'src'     : obj[index].pict,
                            'title'   : '',
                            'alt'     : ''
                        })
                    )
            );
        }
    });
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
        numb_of_specials.text(units_user.length + '/6').css('color', 'red');
    } else {
        numb_of_specials.text(units_user.length).css('color', 'green');
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
// Отправка запроса на начальные данные
//////////////////////////////////////////////////////////////////
$.ajax({
    url: "give_me_fraction",
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
            units_user = [];
            specials_user = [];
            // Выводим список доступных фракций
            create_list(fractions, "#select_fraction");
            if(fraction_user == -1) {
                $('#select_fraction').append(
                    $('<option value=' + fraction_user + '> Фракция не выбрана </option>')
                );
            }
            selector = "#select_fraction [value='" + fraction_user + "']";
            $(selector).attr("selected", "selected");
            $.each(fractions, function(index){
                if (fractions[index].id == fraction_user) {
                    $('.desc_fraction').append(fractions[index].desc_func);
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

            // Выводим все карты, которые пришли
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
            show_leader (leaders, leader_user);
            // Формируем колоду пользвателя и выводим его карты
            build_deck (deck_specials, specials, specials_user);
            build_deck (deck_units, units, units_user);
            show_cards (specials, '#all_cards');
            show_cards (units, '#all_cards');
            show_cards (specials_user, '#deck');
            show_cards (units_user, '#deck');
            count_stat (units_user, specials_user);

        }


    }
});


$(document).ready(function () {

    var message = '';



});
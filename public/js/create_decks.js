$(document).ready(function () {

var abilities           = [],  // массив способностей
    fractions           = [],  // массив фракций
    specials            = [],  // массив специальных карт
    leaders             = [],  // массив лидеров выбранной фракции
    classes             = [],  // массив классов карт
    units               = [],  // массив юнитов выбранной фракции
    units_user          = [],  // массив юнитов пользователя
    specials_user       = [],  // массив специальных карт пользователя
    id_deck_leader,            // id лидера пользователя
    id_fraction,               // id выбранной фракции
    id_deck_units       = [],  // массив id юнитов
    id_deck_specials    = [],  // массив id специальных карт
    deck_upgraded       = [],  // данные о прокачанных картах
    deck_unlocked       = [],  // данные о разблокированных картах
    size_deck,
    user,
    id_user,
    selector,
    $_body              = $('body'),
    select_fraction     = $('#select_fraction'),
    leader_choice       = $('.leader_choice'),
    card_view           = $('.card_view'),
    deck_room           = $(".deck_room"),
    data_block          = {},
    data_response       = {},
    message             = '';


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
            get_card(obj[index], $(selector));

        } else {
            if (obj[index][prop] == value) {
                get_card(obj[index], $(selector));
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
    from.sort(userCompare);
    to.sort(userCompare);
}


//////////////////////////////////////////////////////////////////
// Функция, которая выводит карту лидера
//////////////////////////////////////////////////////////////////
function show_leader (obj, id_deck_leader) {
    $('.leader_block').empty();
    $.each(obj, function(index){
        if(obj[index].id == id_deck_leader) {
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
// Очистка области вывода
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
        numb_of_cards       = $('.numb_of_cards'),
        hero                = 0;

    quantity = units_user.length + specials_user.length;
    numb_of_cards.text(quantity + '/' + size_deck);

    if(quantity < size_deck) {
        numb_of_cards.css('color', 'red');
    } else {
        numb_of_cards.css('color', 'green');
    }
    // Раздельная статистика пока не требуется
    /*
    if(units_user.length + specials_user.length < size_deck) {
        numb_of_units.text(units_user.length + '/22').css('color', 'red');
    } else {
        numb_of_units.text(units_user.length).css('color', 'green');
    }

    if(specials_user.length < 6) {
        numb_of_specials.text(specials_user.length + '/6').css('color', 'red');
    } else {
        numb_of_specials.text(specials_user.length).css('color', 'green');
    }
    */

    $.each(units_user, function(index){
        if (units_user[index].hero == 1) {
            hero++;
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
        if (fractions[index].id == id_fraction) {
            // Описание способности фракций пока неактуально
            //$('.desc_fraction').empty().append(fractions[index].desc_func);
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

    specials_user = [];
    units_user = [];

    show_leader (leaders, id_deck_leader);
    // Формируем колоду пользвателя и выводим его карты
    build_deck (id_deck_specials, specials, specials_user);
    build_deck (id_deck_units, units, units_user);
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
    function view_card(arr, this_card){
        var card;
        for (var i = 0; i < arr.length; i++){
            if(arr[i].id == this_card) {
                card = arr[i];
                break;
            }
        }
        $('.pict_unit').attr('src', card.pict);
        $('.desc_unit').empty().text(card.desc_ability);
    }


//////////////////////////////////////////////////////////////////
// Функция формирует рабочие массивы карт
//////////////////////////////////////////////////////////////////
    function get_array_card(id_fraction) {
        leaders = [];
        units = [];
        var data_array = {};
        // Оставляем массив нужных лидеров
        for(var i = 0; i < data_response.leaders.length; i++) {
            if(data_response.leaders[i].id_fraction == id_fraction){
                leaders.push(data_response.leaders[i]);
            }
        }

        if(id_fraction == -1) {
            id_deck_units = [];
            id_deck_specials = [];
            id_deck_leader = '';
        } else {
            id_deck_units = data_response.deck_user.units["fraction_" + id_fraction];
            id_deck_specials = data_response.deck_user.specials["fraction_" + id_fraction];
            id_deck_leader = data_response.deck_user.leader["fraction_" + id_fraction][0];
        }

        data_array.units = [];
        data_array.specials = [];
        data_array.leaders = [];
        for(var i = 0; i < data_response.units.length; i++) {
            data_array.units.push(clone(data_response.units[i]));
        }
        for(var i = 0; i < data_response.specials.length; i++) {
            data_array.specials.push(clone(data_response.specials[i]));
        }
        for(var i = 0; i < leaders.length; i++) {
            data_array.leaders.push(clone(leaders[i]));
        }
        data_array.abilities = abilities;
        data_array.classes = classes;
        data_array.deck_unlocked = deck_unlocked;
        data_array.deck_upgraded = deck_upgraded;
        data_array.unlocked_units = [];
        data_array.locked_units = [];
        data_array.unlocked_specials = [];
        data_array.locked_specials = [];
        // Описание находится в functions.js
        var results = get_right_card(data_array);
        leaders = results.leaders;
        specials = results.unlocked_specials;
        for(var i = 0; i < results.unlocked_units.length; i++) {
            if(results.unlocked_units[i].id_fraction == 6 ||
                results.unlocked_units[i].id_fraction == id_fraction){
                units.push(results.unlocked_units[i]);
            }
        }
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
                data_response   = response;
                classes         = response.classes;
                abilities       = response.abilities;
                fractions       = response.fractions;
                specials        = response.specials;
                user            = response.user;
                id_fraction     = response.deck_user.id_fraction;
                id_user         = response.user.id;
                size_deck       = response.user.size_deck;

                response.deck_user.units    = JSON.parse(response.deck_user.units);
                response.deck_user.specials = JSON.parse(response.deck_user.specials);
                response.deck_user.leader   = JSON.parse(response.deck_user.leader);
                if(response.deck_user.unlocked === undefined ||
                    response.deck_user.unlocked === null){
                    response.deck_user.unlocked = [];
                } else {
                    response.deck_user.unlocked = JSON.parse(response.deck_user.unlocked);
                }
                if(response.deck_user.upgraded === undefined ||
                    response.deck_user.upgraded === null){
                    response.deck_user.upgraded = [];
                } else {
                    response.deck_user.upgraded = JSON.parse(response.deck_user.upgraded);
                }
                deck_upgraded = response.deck_user.upgraded;
                deck_unlocked = response.deck_user.unlocked;

                // формируем рабочие массивы карт
                get_array_card(id_fraction);
                // Выводим список доступных фракций
                create_list_fr(fractions, "#select_fraction");
                if(id_fraction == -1) {
                    $('#select_fraction').append(
                        $('<option value=' + id_fraction + '> Фракция не выбрана </option>')
                    );
                }
                selector = "#select_fraction [value='" + id_fraction + "']";
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
        var option = $('#select_fraction option');
        // После выбора фракции убираем из списка заглушку
        for(var i = 0; i < option.length; i++) {
            if(option.eq(i).attr('value') == -1){
                option.eq(i).remove();
                break;
            }
        }
        id_fraction = $(this).val();
        get_array_card(id_fraction);
        refresh_cards ();
        id_deck_units = data_response.deck_user.units["fraction_" + id_fraction];
        id_deck_specials = data_response.deck_user.specials["fraction_" + id_fraction];
        id_deck_leader = data_response.deck_user.leader["fraction_" + id_fraction][0];
        $('.save_deck').removeClass('not_visible');
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
                if(leaders[index].resolution == 1){
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
                }
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
        id_deck_leader = $(this).attr('data-id');
        data_response.deck_user.leader["fraction_" + id_fraction] = id_deck_leader;
        show_leader (leaders, id_deck_leader);
        leader_choice.addClass('not_visible');
        $('.leaders_block, .leader_choice p').empty();
    });


//////////////////////////////////////////////////////////////////
// Очистка пользовательской колоды
//////////////////////////////////////////////////////////////////
    $('.clean_deck').click( function() {
        reset_filter ();
        $('.deck').empty();
        if(data_response.deck_user.leader["fraction_" + id_fraction].length != 0){
            id_deck_leader = data_response.deck_user.leader["fraction_" + id_fraction][0];
        }
        var quantity_units      = units_user.length;
        var quantity_specials   = specials_user.length;
        for(var i = 0; i < quantity_units; i++){
            units.push(units_user[i]);
        }
        for(var j = 0; j < quantity_specials; j++){
            specials.push(specials_user[j]);
        }
        units_user.splice(0, units_user.length);
        id_deck_units.splice(0, id_deck_units.length);
        units.sort(userCompare);
        specials_user.splice(0, specials_user.length);
        id_deck_specials.splice(0, id_deck_specials.length);
        refresh_cards();
    });


//////////////////////////////////////////////////////////////////
// Перемещение карт между колодами
//////////////////////////////////////////////////////////////////
    deck_room.on('click', '.deck_col .card',function() {
        if(id_fraction == -1) {
            message = 'Сначала нужно выбрать фракцию для колоды';
            notice(message, 2);
            return false;
        }
        // Тип "массив" нужен для универсальности функции
        var temp_deck = [];
        var is_unit = $(this).attr('data-type-card');
        temp_deck.push($(this).attr('data-id-card'));

        if($(this).parent().hasClass('deck')) {
            if(is_unit == "S"){
                for(var i = 0; i < id_deck_specials.length; i++) {
                    if(id_deck_specials[i] == temp_deck[0]) {
                        id_deck_specials.splice(i,1);
                    }
                }
                build_deck (temp_deck, specials_user, specials);
            } else {
                for(var i = 0; i < id_deck_units.length; i++) {
                    if(id_deck_units[i] == temp_deck[0]) {
                        id_deck_units.splice(i,1);
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
            if(is_unit == "S"){
                id_deck_specials.push(parseInt(temp_deck[0]));
                build_deck (temp_deck, specials, specials_user);
            } else {
                id_deck_units.push(parseInt(temp_deck[0]));
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
    deck_room.on("contextmenu", ".deck_col .card", function() {
        var this_card = $(this).attr('data-id-card'),
        type = $(this).attr('data-type-card'),
        temp_arr = [],
        card = {};
        card_view.empty().removeClass('not_visible');
        if($(this).parent().hasClass('deck')) {
            if(type == 'S'){
                temp_arr = specials_user;
            } else {
                temp_arr = units_user;
            }
        } else {
            if(type == 'S'){
                temp_arr = specials;
            } else {
                temp_arr = units;
            }
        }
        for (var i = 0; i < temp_arr.length; i++){
            if(temp_arr[i].id == this_card) {
                card = temp_arr[i];
                break;
            }
        }
        console.log(card);
        get_card(card, card_view);
        card_view.append(
            $('<div/>')
                .addClass('desc_unit')
                .text(card.desc_ability)
            )
            .append(
                $('<button/>')
                    .addClass('close_unit')
                    .text('Закрыть')
            );

        return false;
    });



//////////////////////////////////////////////////////////////////
// Закрытие информации о карте
//////////////////////////////////////////////////////////////////
    $_body.on("click", ".close_unit, .card_view .card", function() {
        card_view.empty().addClass('not_visible');
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
        if(id_deck_units.length + id_deck_specials.length < size_deck){
            message = "Вы выбрали недостаточно карт для игры.";
            notice(message, 2);
            return false;
        } else {
            data_response.deck_user.units["fraction_" + id_fraction] = id_deck_units;
            data_response.deck_user.specials["fraction_" + id_fraction] = id_deck_specials;
            data_response.deck_user.leader["fraction_" + id_fraction] = id_deck_leader;

            var data_block          = {};
            data_block.id_user      = id_user;
            data_block.id_fraction  = id_fraction;
            data_block.units        = JSON.stringify(data_response.deck_user.units);
            data_block.specials     = JSON.stringify(data_response.deck_user.specials);
            data_block.leader       = JSON.stringify(data_response.deck_user.leader);
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
        }
    });


});
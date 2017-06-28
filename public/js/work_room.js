$(document).ready(function () {


    // Отображение оставшихся очков рейтинга

    function set_points () {
        $('.rait_p').text(points.points);
        $('.g_rait_p').text(points.win_points);
    }


    // Получение цены апгрейда

    function give_price (button) {
        purchase = $(button).attr('data-value');
        if(purchase == "unlock_card") {
            if(this_card === undefined) {
                message = 'Пожалуйста, выберите карту для желаемого действия.';
                notice(message, 2);
                return false;
            } else {
                if(this_card.type == "L"){
                    purchase = 'unlock_lead';
                }
                if(this_card.type == "S"){
                    purchase = "unlock_sp";
                }
                if(this_card.type == "U"){
                    purchase = "unlock_ord";
                }
                if(this_card.type == "U" && this_card.pict.indexOf('joker') != -1){
                    purchase = "unlock_joker";
                }
                if(this_card.type == "U" && this_card.hero == 1){
                    purchase = "unlock_hero";
                }
            }
        }
        if(purchase == "add_str" || purchase == "remove_str"){
            if(this_card === undefined) {
                message = 'Пожалуйста, выберите карту для желаемого действия.';
                notice(message, 2);
                return false;
            } else {
                if(this_card.type == "U" && this_card.hero == 1 && purchase == "add_str"){
                    purchase = "add_str_h";
                }
                if(this_card.type == "U" && this_card.hero == 1 && purchase == "remove_str"){
                    purchase = "remove_str_h";
                }
            }
        }

        return price_obj[purchase];
    }

    // объект с "расценками" на действия игрока
    var price_obj = {
        'add_str':         2,
        'remove_str':      2,
        'add_str_h':       1,
        'remove_str_h':    1,
        'unlock_ord':      5,
        'unlock_sp':       7,
        'unlock_joker':    8,
        'unlock_hero':     10,
        'unlock_lead':     11,
        'name_card':       1,
        'ability_card':    5,
        'descr_card':      2,
        'decrease_deck':   5,
        'reset_card':      3,
        'unlock_likes':    8,
        'reset_all':       7,
        'buy_votes':       0
    };

    var message            = '',
        purchase           = '',        // название действия апгрейда
        points             = {},        // очки рейтинга
        sp_points          = {},        // потраченные очки рейтинга
        score              = 0,         // фактический счёт
        price              = 0,         // цена действия
        votes              = 0,         // количество голосов для покупки
        size_deck          = 0,         // размер колоды
        like_flag          = 0,         // флаг шкалы лайков
        abilities          = [],        // массив способностей
        fractions          = [],        // массив фракций
        specials           = [],        // массив специальных карт
        classes            = [],        // массив всех классов
        leaders            = [],        // массив лидеров выбранной фракции
        units              = [],        // массив юнитов выбранной фракции
        unlocked_units     = [],        // массив юнитов, доступных пользователю
        unlocked_specials  = [],        // массив специальных карт, доступных пользователю
        locked_units       = [],        // массив юнитов, недоступных пользователю
        locked_specials    = [],        // массив специальных карт, недоступных пользователю
        deck_unlocked      = [],        // массив id разблокированных карт
        deck_upgraded      = [],        // массив проапгрейдженыых карт
        work_array         = [],        // временный массив для работы с картами
        actions            = [],        // история действий игрока в мастерской
        actions_str        = [],        // история усиления карт
        actions_constr     = [],        // история конструктора
        edit_close         = {},        // объект джокера
        edit_range         = {},        // объект джокера
        edit_siege         = {},        // объект джокера
        user               = {},
        data_block         = {},
        deck_leader,                    // id лидера пользователя
        deck_fraction,                  // id выбранной фракции
        id_fraction,                    // хранение активной фракции
        selector,                       // текущий селектор
        this_card,                      // текущая карта
        type_card,                      // тип текущей карты
        id_card,                        // номер текущей карты
        $_link              = $('.tab'),
        $_tab_content       = $('.tab_cont'),
        $_select_fr         = $('.select_fr'),
        $_slider_area       = $('.slides_block'),
        $_body              = $('body'),
        $_buttons           = $('.points_block button'),
        $_reset_actions     = $('.reset_actions'),
        $_reset_img         = $('.reset_img');



    $($_link[0]).addClass("active_li");
    $($_tab_content[0]).addClass("visible");


    //////////////////////////////////////////////////////////////////
    // функция, перегружающая форму
    //////////////////////////////////////////////////////////////////
    function reset_form() {
        $('form').trigger("reset");
    }


    ////////////////////////////////////////////////////////////////
    // переход по вкладкам
    ////////////////////////////////////////////////////////////////
    $($_link).click(function () {
        var index = $(this).index();
        $_link.removeClass('active_li');
        $_tab_content.removeClass('visible');
        $(this).addClass('active_li');
        $($_tab_content[index]).addClass('visible');
    });


    //////////////////////////////////////////////////////////////////
    //Отправка запроса на начальные данные
    //////////////////////////////////////////////////////////////////

    $.ajax({
        url: "initial",
        method: "POST",
        data: '',
        success: function(response) {
            console.log(response);
            if(response.user == false) {
                window.location = "auth.html";
            }
            if(response.user_error == true) {
                message = "Неизвестная ошибка. Пожалуйста, перегрузите страницу";
                notice(message, 2);
                return false;
            } else {
                abilities       = response.abilities;
                fractions       = response.fractions;
                specials        = response.specials;
                classes         = response.classes;
                leaders         = response.leaders;
                units           = response.units;
                user            = response.user;
                deck_fraction   = response.deck_user.id_fraction;
                deck_leader     = response.deck_user.leader;
                deck_unlocked   = response.deck_user.unlocked;
                deck_upgraded   = response.deck_user.upgraded;
                actions         = response.user.actions;
                like_flag       = response.user.liking;
                size_deck       = response.user.size_deck;
                score           = response.user.score;

                if(deck_unlocked !== null && deck_unlocked !== '' && deck_unlocked !== undefined) {
                    deck_unlocked = JSON.parse(deck_unlocked);
                } else {
                    deck_unlocked = [];
                }

                if(deck_upgraded !== null && deck_upgraded !== '' && deck_upgraded !== undefined) {
                    deck_upgraded = JSON.parse(deck_upgraded);
                } else {
                    deck_upgraded = [];
                }

                if(actions !== null && actions !== '' && actions !== undefined) {
                    actions = JSON.parse(actions);
                } else {
                    actions = [];
                }

                // устанавливаем флаги редактирования карт-канструкторов
                edit_close.name_card = edit_range.name_card = edit_siege.name_card = 0;
                edit_close.ability_card = edit_range.ability_card = edit_siege.ability_card = 0;
                edit_close.descr_card = edit_range.descr_card = edit_siege.descr_card = 0;

                var data_array = {};
                data_array.units = [];
                data_array.specials = [];
                data_array.leaders = [];
                for(var i = 0; i < units.length; i++) {
                    data_array.units.push(clone(units[i]));
                }
                for(var i = 0; i < specials.length; i++) {
                    data_array.specials.push(clone(specials[i]));
                }
                for(var i = 0; i < leaders.length; i++) {
                    data_array.leaders.push(clone(leaders[i]));
                }
                data_array.abilities = abilities;
                data_array.classes = classes;
                data_array.deck_unlocked = deck_unlocked;
                data_array.unlocked_units = unlocked_units;
                data_array.deck_upgraded = deck_upgraded;
                data_array.locked_units = locked_units;
                data_array.unlocked_specials = unlocked_specials;
                data_array.locked_specials = locked_specials;
                // Описание находится в functions.js
                var results = get_right_card(data_array);
                units = results.units;
                specials = results.specials;
                leaders = results.leaders;
                unlocked_units = results.unlocked_units;
                locked_units = results.locked_units;
                unlocked_specials = results.unlocked_specials;
                locked_specials = results.locked_specials;

                // Прикрепляем к юнитам картинки, названия и описания их способностей
               /*
                for(var i = 0; i < units.length; i++){
                    for(var j = 0; j < abilities.length; j++){
                        if(units[i].id_ability == abilities[j].id){
                            units[i].pict_ability = abilities[j].pict;
                            break;
                        }
                    }
                }

                // Прикрепляем к юнитам картинки, названия и описания их классов
                for(var i = 0; i < units.length; i++){
                    for(var j = 0; j < classes.length; j++){
                        if(units[i].id_class == classes[j].id){
                            units[i].pict_class = classes[j].pict;
                            break;
                        }
                    }
                }

                // накладываем маску разблокированных карт на все карты
                // и формируем массивы из них
                for(var i = 0; i < deck_unlocked.length; i++){
                    for(var j = 0; j < units.length; j++){
                        if(deck_unlocked[i].id == units[j].id){
                            units[j].resolution = 1;
                            break;
                        }
                    }
                    for(var k = 0;  k < specials.length; k++){
                        if(deck_unlocked[i].id == specials[k].id){
                            specials[k].resolution = 1;
                            break;
                        }
                    }
                }

                // сортируем карты на открытые и заблокированные
                // и отсеиваем героев в конец массива
                for(var i = 0; i < units.length; i++){
                    // Запоминаем изначальную силу карты
                    units[i].basic_strength = units[i].strength;
                    units[i].new_strength = units[i].strength;
                    if (units[i].hero != 1) {
                        if(units[i].resolution == 1){
                            unlocked_units.push(units[i]);
                        } else {
                            locked_units.push(units[i]);
                        }
                    }

                }
                for(var i = 0; i < units.length; i++){
                    units[i].new_strength = units[i].strength;
                    if (units[i].hero == 1) {
                        if(units[i].resolution == 1){
                            unlocked_units.push(units[i]);
                        } else {
                            locked_units.push(units[i]);
                        }
                    }
                }

                for(var i = 0; i < specials.length; i++){
                    if(specials[i].resolution == 1){
                        unlocked_specials.push(specials[i]);
                    } else {
                        locked_specials.push(specials[i]);
                    }
                }

                // Накладываем маску прокачанных юнитов
                for(var i = 0; i < deck_upgraded.length; i++){
                    for(var j = 0; j < unlocked_units.length; j++){
                        if(deck_upgraded[i].id == unlocked_units[j].id){
                            if(deck_upgraded[i].name !== undefined){
                                unlocked_units[j].name = deck_upgraded[i].name;
                            }
                            if(deck_upgraded[i].id_ability !== undefined){
                                unlocked_units[j].id_ability = deck_upgraded[i].id_ability;
                            }
                            if(deck_upgraded[i].description !== undefined){
                                unlocked_units[j].description = deck_upgraded[i].description;
                            }
                            if(deck_upgraded[i].new_strength !== undefined){
                                unlocked_units[j].strength = deck_upgraded[i].new_strength;
                                unlocked_units[j].new_strength = deck_upgraded[i].new_strength;
                            }
                            break;
                        }
                    }
                }
*/
                var selects = [];
                for(var i = 0; i < $('.select_fr').length; i++) {
                    selects.push($('.select_fr').eq(i).attr('id'));
                }
                // заполняем html-данными select'ы фракций
                $.each(selects, function(index){
                    $.each(fractions, function(jndex){
                        $('#' + selects[index]).append(
                            $('<option value=' + fractions[jndex].id +'>' + fractions[jndex].name +'</option>')
                        );
                    });
                    $('#' + selects[index] + ' option[value="' + deck_fraction + '"]').attr('selected','selected');
                });

                id_fraction = deck_fraction;
                points.points = user.points;
                points.win_points = user.win_points;
                sp_points.sp_points = user.sp_points;
                sp_points.sp_win_points = user.sp_win_points;
                set_points();

                $('.size').text(user.size_deck);

                // Симулируем клик по вкладке для заполнения слайдера
                $('#strength_tab').click();
            }
        }
    });

    // Вывод детальной информации по текущей карте

    $_body.on("contextmenu", ".tab_cont .card", function() {
        $('.card_view').removeClass('not_visible').addClass('visible');
        id_card = $(this).attr('data-id-card');
        type_card = $(this).attr('data-type-card');
        var temp_array = [];
        switch (type_card) {
            case "U":
                temp_array = units;
                break;

            case "S":
                temp_array = specials;
                break;

            case "L":
                temp_array = leaders;
                break;

            default :
                break;
        }

        var card = {};
        for(var i = 0; i < temp_array.length; i++){
            if(temp_array[i].id == id_card){
                card = temp_array[i];
            }
        }
        var ability_name,
            ability_descr;
        for(var i = 0; i < abilities.length; i++){
            if(card.id_ability == abilities[i].id){
                ability_name = abilities[i].name;
                ability_descr = abilities[i].description;
            }
        }
        if(card.desc_func !== undefined) {
            ability_descr = card.desc_func;
        }
        $('.card_view .card_name').text(card.name);
        $('.card_view .ability_name_row .val').text(ability_name);
        $('.card_view .ability_row .val').text(ability_descr);
        $('.card_view .descr_row .val').text('"' + card.description + '"');
        selector = $('.card_view .pict_card');
        selector.empty();
        get_card(card, selector);

        return false;
    });


    $_body.on("click", ".close_it", function() {
        $('.card_view').removeClass('visible').addClass('not_visible');
    });

//////////////////////////////////////////////////////////////////
//                        STRENGTH BLOCK
//////////////////////////////////////////////////////////////////

    // Формируем начальное состояние вкладки

    $_body.on("click", "#strength_tab", function() {
        work_array = [];
        $_slider_area.empty();
        selector = $('.strength_block .slides_block');
        id_fraction = $('#select_fraction option:selected').attr('value');
        for(var i = 0; i < unlocked_units.length; i++){
            if(unlocked_units[i].id_fraction == id_fraction){
                work_array.push(unlocked_units[i]);
            }
        }

        for(var i = 0; i < work_array.length; i++){
            get_card(work_array[i], selector);
        }
        id_card = undefined;
        this_card = undefined;
        $('.strength_block .caption').text('Карта');
        $('.strength_block .strength').text('');
    });


    // Вывод силы выделенной карты

    $_body.on("click", ".strength_block .card", function() {
        $(".strength_block .card").removeClass('gold');
        $(this).addClass('gold');
        id_card = $(this).attr('data-id-card');
        for(var i = 0; i < unlocked_units.length; i++){
            if(unlocked_units[i].id == id_card){
                $('.strength_block .caption').text(unlocked_units[i].name);
                $('.strength_block .strength').text(unlocked_units[i].new_strength);
                this_card = unlocked_units[i];
            }
        }
    });


    // Механика слайдера

    $_body.on("click", ".slider_actions button", function(e) {
        e.preventDefault();
        if($(this).closest('.strength_block').hasClass('strength_block')) {
            selector = '.strength_block .slides_block';
        } else {
            selector = '.unlock_block .slides_block';
        }
        var height_slide = $(selector + " .card").outerHeight(true),
            margin_area  = parseInt($(selector).css('margin-top')),
            counter      = Math.floor(-margin_area/height_slide),
            max_counter  = Math.floor($(selector).outerHeight()/height_slide);
        if($(this).hasClass('units_up')){
            if(counter > 0) {
                counter--;
                $(selector).css('margin-top', -height_slide*counter + 'px');
            }
        }
        if($(this).hasClass('units_down')){
            if(counter < max_counter - 1) {
                counter++;
                $(selector).css('margin-top', -height_slide*counter + 'px');
            }
        }
    });


    // Фильтр фракций
    $_select_fr.change( function() {
        var buffer = [];
        var slide_block;
        id_fraction = $(this).val();
        work_array = [];
        $(".unlock_block .filter").removeClass('active');
        if($(this).hasClass('select_str')) {
            buffer = unlocked_units;
            slide_block = '.strength_block ';
            $(slide_block + '.strength').text('');
        } else {
            buffer = locked_units;
            slide_block = '.unlock_block ';
        }
        $_slider_area.empty();
        selector = $(slide_block + '.slides_block');
        id_card = undefined;
        this_card = undefined;
        $(slide_block + '.caption').text('Карта');
        $(slide_block + '.slides_block').css('margin-top', '0');
        for(var i = 0; i < buffer.length; i++){
            if(buffer[i].id_fraction == id_fraction){
                work_array.push(buffer[i]);
            }
        }
        for(var i = 0; i < work_array.length; i++){
            get_card(work_array[i], selector);
        }
    });

    // Повышение и понижение силы

    $_body.on("click", ".strength_block .buy", function(e) {
        e.preventDefault();
        price = give_price(this);
        if(price == false) {
            return false;
        }
        var step = 1,
            new_strength,
            difference,
            buy_point       = 'points',
            buy_sp_points   = 'sp_points',
            str_up          = 'add_str',
            str_down        = 'remove_str';
        if($(this).hasClass('strength_down')){
            step = -1;
        }
        if(this_card.hero == 1) {
            buy_point       = 'win_points';
            buy_sp_points   = 'sp_win_points';
            str_up          = 'add_str_h';
            str_down        = 'remove_str_h';
        }
        new_strength = this_card.new_strength + step;
        if(new_strength < 1) {
            message = 'Сила карты не может быть меньше 1.';
            notice(message, 2);
            return false;
        }

        var card_obj    = {};
        card_obj.id     = this_card.id;
        card_obj.action = purchase;
        card_obj.price  = price;
        // Условие предусматривает холостое переливание силы
        if(($(this).hasClass('strength_down') && new_strength < this_card.work_strength) ||
            ($(this).hasClass('strength_up') && new_strength > this_card.work_strength)) {
            if(Math.abs(step * price) > points[buy_point]) {
                message = 'У вас недостаточно очков рейтинга для апгрейда силы';
                notice(message, 2);
                return false;
            } else {
                $_buttons.removeClass('not_visible');
                actions_str.push(card_obj);
                difference = Math.abs(step * price);
                points[buy_point] = points[buy_point] - difference;
                sp_points[buy_sp_points] = sp_points[buy_sp_points] + difference;
                score = score + difference;
                this_card.new_strength = new_strength;
                set_points();
                $('.strength_block .strength').text(this_card.new_strength);
            }
        } else {
            actions_str.push(card_obj);
            difference = Math.abs(step * price);
            points[buy_point] = points[buy_point] + difference;
            sp_points[buy_sp_points] = sp_points[buy_sp_points] - difference;
            score = score - difference;
            this_card.new_strength = new_strength;
            set_points();
            $('.strength_block .strength').text(this_card.new_strength);


            // Оставляем в массиве действия только уникальные действия
            var count_up = 0,
                count_down = 0,
                counter = 0;
            for(var i = 0; i < actions_str.length; i++){
                if(actions_str[i].id == card_obj.id){
                    if(purchase == str_up){
                        count_up++;
                    }
                    if(purchase == str_down){
                        count_down++;
                    }
                }
            }
            if(count_up != 0 || count_down != 0){
                if(count_up > count_down){
                    counter = count_down;
                } else {
                    counter = count_up;
                }
                for(var j = 0; j <= counter; j++){
                    var k = actions_str.length;
                    while(k != 0) {
                        k--;
                        if(actions_str[k].id == card_obj.id && actions_str[k].action == str_up) {
                            actions_str.splice(k, 1);
                            break;
                        }
                    }
                    k = actions_str.length;
                    while(k != 0) {
                        k--;
                        if(actions_str[k].id == card_obj.id && actions_str[k].action == str_down) {
                            actions_str.splice(k, 1);
                            break;
                        }
                    }
                }
            }
        }

        for(var i = 0; i < $('.card').length; i++){
            var card = $('.card').eq(i);
            if(card.attr('data-id-card') == this_card.id){
                card.find('.strength_card').text(this_card.new_strength);
                if(this_card.new_strength != this_card.strength){
                    card.find('.strength_card').addClass('up');
                } else {
                    card.find('.strength_card').removeClass('up');
                }
            }
        }

        var flag_paste = 0,
            paste_obj = {};
        for(var i = 0; i < deck_upgraded.length; i++){
            if(deck_upgraded[i].id == this_card.id && deck_upgraded[i].type == this_card.type){
                deck_upgraded[i].new_strength = this_card.new_strength;
                flag_paste = 1;
                break;
            }
        }
        if(flag_paste == 0){
            paste_obj.id = this_card.id;
            paste_obj.type = this_card.type;
            paste_obj.new_strength = this_card.new_strength;
            deck_upgraded.push(paste_obj);
        }
    });



//////////////////////////////////////////////////////////////////
//                        UNLOCK BLOCK
//////////////////////////////////////////////////////////////////

    // Формируем начальное состояние вкладки

    $_body.on("click", "#unlock_tab", function() {
        work_array = [];
        $_slider_area.empty();
        $(".unlock_block .filter").removeClass('active');
        selector = $('.unlock_block .slides_block');
        id_fraction = $('#select_fraction2 option:selected').attr('value');
        for(var i = 0; i < locked_units.length; i++){
            if(locked_units[i].id_fraction == id_fraction){
                work_array.push(locked_units[i]);
            }
        }
        for(var i = 0; i < work_array.length; i++){
            get_card(work_array[i], selector);
        }
        id_card = undefined;
        this_card = undefined;
        $('.unlock_block .caption').text('Карта');
    });


    // Вывод имени выделенной карты

    $_body.on("click", ".unlock_block .card", function() {
        $(".unlock_block .card").removeClass('gold');
        $(this).addClass('gold');
        id_card = $(this).attr('data-id-card');
        type_card = $(this).attr('data-type-card');
        var temp_array = [];
        switch (type_card) {
            case "U":
                temp_array = locked_units;
                break;

            case "S":
                temp_array = locked_specials;
                break;

            case "L":
                temp_array = leaders;
                break;

            default :
                break;
        }

        for(var i = 0; i < temp_array.length; i++){
            if(temp_array[i].id == id_card){
                $('.unlock_block .caption').text(temp_array[i].name);
                this_card = temp_array[i];
            }
        }
    });

    // Механика слайдера описана в блоке выше
    // Фильтр фракций описан в блоке выше

    // Фильтр отображения карт

    $_body.on("click", ".unlock_block .filter", function() {
        $(".unlock_block .filter").removeClass('active');
        $(this).addClass('active');
        var id = $(this).attr('id');
        work_array = [];
        $_slider_area.empty();
        switch (id) {
            case "ordinaries":
                for(var i = 0; i < locked_units.length; i++){
                    if((locked_units[i].id_fraction == id_fraction)
                        && (locked_units[i].hero != 1)
                        && (locked_units[i].pict.indexOf('joker') == -1)){
                        work_array.push(locked_units[i]);
                    }
                }
                break;

            case "heroes":
                for(var i = 0; i < locked_units.length; i++){
                    if((locked_units[i].id_fraction == id_fraction)
                        && (locked_units[i].hero == 1)
                        && (locked_units[i].pict.indexOf('joker') == -1)){
                        work_array.push(locked_units[i]);
                    }
                }
                break;

            case "blank":
                for(var i = 0; i < locked_units.length; i++){
                    if((locked_units[i].id_fraction == id_fraction)
                        && (locked_units[i].hero != 1)
                        && (locked_units[i].pict.indexOf('joker') != -1)){
                        work_array.push(locked_units[i]);
                    }
                }
                break;

            case "specials":
                for(var i = 0; i < locked_specials.length; i++){
                    work_array.push(locked_specials[i]);
                }
                break;

            case "leaders":
                for(var i = 0; i < leaders.length; i++){
                    if((leaders[i].id_fraction == id_fraction)
                        && (leaders[i].resolution == 0)){
                        work_array.push(leaders[i]);
                    }
                }
                break;

            default:
                break;
        }
        selector = $('.unlock_block .slides_block');
        selector.css('margin-top', '0');
        for(var i = 0; i < work_array.length; i++){
            get_card(work_array[i], selector);
        }
        id_card = undefined;
        this_card = undefined;
        $('.unlock_block .caption').text('Карта');
    });



    // Разблокировка карт

    $_body.on("click", ".unlock_block .buy", function(e) {
        e.preventDefault();
        price = give_price(this);
        if(price == false) {
            return false;
        }
        if(price <= points.points) {
            if(confirm("Стоимость: " + price + ". Вы уверены, что хотите разблокировать эту карту?")){
                points.points = points.points - price;
                sp_points.sp_points = sp_points.sp_points + price;
                score = score + price;
                set_points();
                var unlock_obj = {},
                    actions_unl = {};

                unlock_obj.id = this_card.id;
                unlock_obj.type = this_card.type;
                deck_unlocked.push(unlock_obj);

                actions_unl.id = this_card.id;
                actions_unl.action = purchase;
                actions_unl.price = price;
                actions.push(actions_unl);

                if(this_card.type == 'L') {
                    for(var i = 0; i < leaders.length; i++){
                        if(leaders[i].id == this_card.id) {
                            leaders[i].resolution = 1;
                        }
                    }
                } else {
                    var flag_search = 0;
                    for(var i = 0; i < locked_units.length; i++){
                        if(locked_units[i].id == this_card.id && locked_units[i].type == this_card.type){
                            locked_units[i].resolution = 1;
                            unlocked_units.push(locked_units[i]);
                            locked_units.splice(i, 1);
                            flag_search = 1;
                            break;
                        }
                    }
                    if(flag_search != 1) {
                        for(var i = 0; i < locked_specials.length; i++){
                            if(locked_specials[i].id == this_card.id && locked_specials[i].type == this_card.type){
                                locked_specials[i].resolution = 1;
                                unlocked_specials.push(locked_specials[i]);
                                locked_specials.splice(i, 1);
                                break;
                            }
                        }
                    }
                }

                for(var i = 0; i < $('.card').length; i++){
                    if($('.card').eq(i).attr('data-id-card') == this_card.id){
                        $('.card').eq(i).remove();
                    }
                }
                $_buttons.removeClass('not_visible');
                id_card = undefined;
                this_card = undefined;
            } else {
                return false;
            }
        } else {
            message = 'У вас недостаточно очков рейтинга для разблокировки это карты. Необходимо очков: ' + price;
            notice(message, 2);
            return false;
        }

    });

//////////////////////////////////////////////////////////////////
//                        CONSTRUCTOR BLOCK
//////////////////////////////////////////////////////////////////

    // Формируем начальное состояние вкладки

    $_body.on("click", "#constructor_tab", function() {
        work_array = [];
        id_card = undefined;
        this_card = undefined;
        var blank,
            class_card;
        for(var i = 0; i < unlocked_units.length; i++){
            if((unlocked_units[i].pict.indexOf('joker') != -1) && (unlocked_units[i].resolution == 1)){
                work_array.push(unlocked_units[i]);
            }
        }
        for(var i = 0; i < work_array.length; i++){
            blank =  $('.constructor_block .blank_card').eq(i);
            blank.attr('data-id', work_array[i].id);
            blank.children(".lock_card").remove();
            for(var j = 0; j < classes.length; j++) {
                if(work_array[i].id_class == classes[j].id){
                    class_card = classes[j].pict;
                }
            }
            blank.children(".class_row").empty().append(
                $('<img/>').attr({
                    'src':     "../" + class_card,
                    'class':   "class_img"
                })
            );
            blank.find(".name_blank").val(work_array[i].name);
            blank.find(".descr_blank").val(work_array[i].description);
            $.each(abilities, function(jndex){
                $('.select_abl').eq(i).append(
                    $('<option value=' + abilities[jndex].id +' class="blank_abl" title="' + abilities[jndex].description + '">' + abilities[jndex].name +'</option>')
                );
            });
            blank.find('.select_abl option[value="' + work_array[i].id_ability + '"]').attr('selected','selected');
            var ability_descr = blank.find(".select_abl option[selected='selected']").attr('title');
            blank.find(".ability_descr").text(ability_descr);
        }


    });


    // Изменение карт-конструкторов

    $_body.on("click", ".constructor_block .buy", function(e) {
        e.preventDefault();
        var id = $(this).parent().parent().attr('data-id');
        price = give_price(this);
        if(price == false) {
            return false;
        }
        var selector = '.blank_close',
            constr_obj = edit_close;
        if($(this).parent().parent().hasClass('blank_range')){
            selector = '.blank_range';
            constr_obj = edit_range;
        }
        if($(this).parent().parent().hasClass('blank_siege')){
            selector = '.blank_siege';
            constr_obj = edit_siege;
        }

        if(price <= points.points) {
            if(confirm("Стоимость: " + price + ". Вы уверены, что хотите разблокировать этот параметр?")){
                points.points = points.points - price;
                sp_points.sp_points = sp_points.sp_points + price;
                set_points();
                $(this).css('display', 'none');
                $(selector + ' .fixed').removeClass('not_visible');
                constr_obj[purchase] = 1;
                var action_obj = {};
                action_obj.id = id;
                action_obj.action = purchase;
                action_obj.price = price;
                actions_constr.push(action_obj);
            } else {
                return false;
            }
        } else {
            message = 'У вас недостаточно очков рейтинга для разблокировки этой карты. Необходимо очков: ' + price;
            notice(message, 2);
            return false;
        }
    });


    // Предварительное сохранение карт-конструкторов

    $_body.on("click", ".constructor_block .fixed", function(e) {
        e.preventDefault();
        var id = $(this).parent().attr('data-id');
        var selector    = '.blank_close',
            constr_obj  = edit_close,
            save_obj    = {},
            field;
        if($(this).parent().hasClass('blank_range')){
            selector = '.blank_range';
            constr_obj = edit_range;
        }
        if($(this).parent().hasClass('blank_siege')){
            selector = '.blank_siege';
            constr_obj = edit_siege;
        }
        if(constr_obj.name_card == 0 && constr_obj.ability_card == 0 && constr_obj.descr_card == 0){
            message = 'Попробуйте проапгрейдить карты честным путём.';
            notice(message, 2);
            return false;
        } else {
            if(constr_obj.name_card == 1){
                field = $(selector +' .name_blank').val();
                if(field.length <= 20) {
                    save_obj.id = id;
                    save_obj.name = field;
                    constr_obj.name_card = 0;
                } else {
                    message = 'Имя карты не должно превышать 20 символов.';
                    notice(message, 2);
                    return false;
                }
            }
            if(constr_obj.ability_card == 1){
                save_obj.id = id;
                save_obj.id_ability = $(selector +' .select_abl').val();
                constr_obj.ability_card = 0;
            }
            if(constr_obj.descr_card == 1){
                field = $(selector +' .descr_blank').val();
                if(field.length <= 100) {
                    save_obj.id = id;
                    save_obj.description = $(selector +' .descr_blank').val();
                    constr_obj.descr_card = 0;
                } else {
                    message = 'Описание карты не должно превышать 100 символов.';
                    notice(message, 2);
                    return false;
                }
            }
        }

        for(var i = 0; i < work_array.length; i++){
            if(work_array[i].id == id){
                this_card = work_array[i];
                break;
            }
        }
        var flag_paste = 0,
            paste_obj = {};
        for(var i = 0; i < deck_upgraded.length; i++){
            if(deck_upgraded[i].id == this_card.id && deck_upgraded[i].type == this_card.type){
                if(save_obj.name !== undefined){
                    deck_upgraded[i].name = save_obj.name;
                    this_card.name = save_obj.name;
                }
                if(save_obj.id_ability !== undefined){
                    deck_upgraded[i].id_ability = save_obj.id_ability;
                    this_card.id_ability = save_obj.id_ability;
                }
                if(save_obj.description !== undefined){
                    deck_upgraded[i].description = save_obj.description;
                    this_card.description = save_obj.description;
                }
                flag_paste = 1;
                break;
            }
        }
        for(var i = 0; i < unlocked_units.length; i++){
            if(unlocked_units[i].id == id){
                if(save_obj.name !== undefined){
                    unlocked_units[i].name = save_obj.name;
                }
                if(save_obj.id_ability !== undefined){
                    unlocked_units[i].id_ability = save_obj.id_ability;
                }
                if(save_obj.description !== undefined){
                    unlocked_units[i].description = save_obj.description;
                }
                break;
            }
        }
        if(flag_paste == 0){
            paste_obj.id = this_card.id;
            paste_obj.type = this_card.type;
            if(save_obj.name !== undefined){
                paste_obj.name = save_obj.name;
            }
            if(save_obj.id_ability !== undefined){
                paste_obj.id_ability = save_obj.id_ability;
            }
            if(save_obj.description !== undefined){
                paste_obj.description = save_obj.description;
            }
            deck_upgraded.push(paste_obj);
        }
        $(selector +' .fixed').addClass('not_visible');
        $(selector +' .buy').css('display', 'flex');
        $_buttons.removeClass('not_visible');
    });

    // Фильтр фракций
    $('.select_abl').change( function() {
        var ability_descr = $(this).find("option:selected").attr('title');
        console.log(ability_descr);
        $(this).next().text(ability_descr);
    });



//////////////////////////////////////////////////////////////////
//                          ANY BLOCK
//////////////////////////////////////////////////////////////////

    // Формируем начальное состояние вкладки
    $_body.on("click", "#any_tab", function() {
        work_array = [];
        id_card = undefined;
        this_card = undefined;
        if(like_flag == 1){
            $('.like_rival .description').text('Шкала лайков разблокирована');
            $('.like_rival #get_likes').remove();
        }
        for(var i = 0; i < unlocked_units.length; i++){
            if(unlocked_units[i].new_strength !== unlocked_units[i].strength){
                work_array.push(unlocked_units[i]);
            }
        }
        if(work_array.length == 0){
            $_reset_actions.css('display', 'none');
            $_reset_img.css('display', 'none');
            $('.reset_descr').remove();
            $('.reset_card').append(
                $('<div></div>').addClass('reset_descr').text('У вас нет прокачанных карт')
            );
        } else {
            $_reset_actions.css('display', 'block');
            $_reset_img.css('display', 'block');
            $('.reset_descr').remove();
            var basic_strength = 0;
            // заполняем html-данными select карт для сброса
            $('#select_card').empty();
            $.each(work_array, function(index){
                for(var j = 0; j < units.length; j++) {
                    if(work_array[index].id == units[j].id){
                        basic_strength = units[j].strength;
                    }
                }
                $('#select_card').append(
                    $('<option value=' + work_array[index].id +'>' + work_array[index].name + ' (' + work_array[index].new_strength + ' &#10144;  ' + basic_strength + ')' + '</option>')
                );
            });
            $('#select_card option:first-child').attr('selected','selected');
            this_card = work_array[0];
            $_reset_img.empty();
            get_card(this_card, $_reset_img);
        }
    });


    // Количество голосов для покупки
    $_body.on("click", ".any_block .strength_actions button", function(e) {
        e.preventDefault();
        var step = 1;
        votes = parseInt($('.any_block .strength_actions .strength').text());
        if($(this).hasClass('strength_down')){
            step = -1;
        }
        votes+= step;
        if((votes) >= 0) {
            $('.any_block .strength_actions .strength').text(votes);
            // TODO: калькулятор цены голосов

        } else {
            message = 'Вы не можете купить отрицательное число голосов';
            notice(message, 2);
            return false;
        }

    });


    // Покупка голосов
    $_body.on("click", ".any_block .buy_votes", function(e) {
        e.preventDefault();
        if(votes != 0){
            $_buttons.removeClass('not_visible');
        } else {
            message = "Укажите количество голосов для покупки";
            notice(message, 2);
            return false;
        }

    });


    // Изменение лимита колоды
    $_body.on("click", ".any_block #max_down", function(e) {
        e.preventDefault();
        price = give_price(this);
        if(price == false) {
            return false;
        }
        if(price <= points.points) {
            if(confirm("Стоимость: " + price + ". Вы уверены, что хотите изменить лимит карт в колоде?")){
                if(user.size_deck <= 25){
                    message = 'Вы достигли минимального размера колоды';
                    notice(message, 2);
                    return false;
                } else {
                    points.points = points.points - price;
                    sp_points.sp_points = sp_points.sp_points + price;
                    set_points();
                    size_deck = user.size_deck - 3;
                    $('.size').text(size_deck);
                    var card_obj    = {};
                    card_obj.action = purchase;
                    card_obj.price  = price;
                    actions.push(card_obj);
                    $_buttons.removeClass('not_visible');
                }
            } else {
                return false;
            }
        } else {
            message = 'У вас недостаточно очков рейтинга для уменьшения лимита. Необходимо очков: ' + price;
            notice(message, 2);
            return false;
        }
    });


    // Разблокировка шкалы лайков
    $_body.on("click", ".any_block #get_likes", function(e) {
        e.preventDefault();
        if(like_flag == 1){
            message = 'Вы уже разблокировали шкалу';
            notice(message, 2);
            return false;
        }
        price = give_price(this);
        if(price == false) {
            return false;
        }
        if(price <= points.points) {
            if(confirm("Стоимость: " + price + ". Вы уверены, что хотите разблокировать шкалу?")){
                points.points = points.points - price;
                sp_points.sp_points = sp_points.sp_points + price;
                set_points();
                like_flag = 1;
                $('.like_rival .description').text('Шкала лайков разблокирована');
                $('.like_rival #get_likes').remove();
                var card_obj    = {};
                card_obj.action = purchase;
                card_obj.price  = price;
                actions.push(card_obj);
                $_buttons.removeClass('not_visible');
            } else {
                return false;
            }
        } else {
            message = 'У вас недостаточно очков рейтинга для уменьшения лимита. Необходимо очков: ' + price;
            notice(message, 2);
            return false;
        }
    });


    // Выбор карт для сброса
    $('#select_card').change( function() {
        $_reset_img.empty();
        id_card = $(this).val();
        for(var i = 0; i < work_array.length; i++){
            if(work_array[i].id == id_card){
                this_card = work_array[i];
                get_card(work_array[i], $_reset_img);
                break;
            }
        }
    });

    // Сброс силы карт
    $_body.on("click", ".any_block #reset_card, .any_block #reset_all", function(e) {
        e.preventDefault();
        price = give_price(this);
        if(price == false) {
            return false;
        }
        if(work_array.length == 0){
            message = 'У вас нет прокачанных карт';
            notice(message, 2);
            return false;
        }
        var note = ". Вы уверены, что хотите сбросить силу этой карты?";
        if(purchase == 'reset_all'){
            note = ". Вы уверены, что хотите сбросить силу всех карт?";
        }
        var reset_flag = 0;
        if(price <= points.points) {
            if(confirm("Стоимость: " + price + note)){
                points.points = points.points - price;
                sp_points.sp_points = sp_points.sp_points + price;
                var count = 1;
                if(purchase == 'reset_all'){
                    count = work_array.length;
                }
                while(count > 0) {
                    count--;
                    // Удаляем данные из объекта апгрейдов
                    var i = deck_upgraded.length;
                    while(i > 0){
                        i--;
                        if(deck_upgraded[i].id == this_card.id && deck_upgraded[i].type == this_card.type){
                            if(deck_upgraded[i].new_strength !== undefined){
                                if(deck_upgraded[i].name == undefined &&
                                    deck_upgraded[i].id_ability == undefined &&
                                    deck_upgraded[i].description == undefined){
                                    deck_upgraded.splice(i,1);
                                } else {
                                    delete deck_upgraded[i].new_strength;
                                }
                            }
                        }
                    }

                    var find = 0;
                    // Присваиваем карте изначальную силу
                    for(var i = 0; i < unlocked_units.length; i++){
                        for(var j = 0; j < units.length; j++){
                            if(unlocked_units[i].id == units[j].id && unlocked_units[i].id == this_card.id){
                                unlocked_units[i].work_strength = units[j].strength;
                                unlocked_units[i].new_strength = units[j].strength;
                                find = 1;
                                break;
                            }
                        }
                        if(find == 1) {
                            break;
                        }
                    }

                    // Выбрасываем карту из рабочего массива
                    for(var i = 0; i < work_array.length; i++){
                        if(work_array[i].id == this_card.id){
                            work_array.splice(i,1);
                        }
                    }

                    // Отменяем действия апгрейда карты и возвращаем потраченные очки
                    var action_arr = [actions, actions_str];
                    for(var k = 0; k < 2; k++){
                        var j = action_arr[k].length;
                        while(j > 0){
                            j--;
                            if(action_arr[k][j].id !== undefined && action_arr[k][j].id == this_card.id){
                                if(action_arr[k][j].action == "add_str" || action_arr[k][j].action == "remove_str"){
                                    points.points += action_arr[k][j].price;
                                    sp_points.sp_points -= action_arr[k][j].price;
                                    score -= action_arr[k][j].price;
                                }
                                if(action_arr[k][j].action == "add_str_h" || action_arr[k][j].action == "remove_str_h"){
                                    points.win_points += action_arr[k][j].price;
                                    sp_points.sp_win_points -= action_arr[k][j].price;
                                    score -= action_arr[k][j].price;
                                }
                                action_arr[k].splice(j,1);
                            }
                        }
                    }

                    set_points();

                    if(reset_flag == 0) {
                        var find_reset = 0;
                        for(var k = 0; k < actions.length; k++){
                            if(actions[k].action == purchase){
                                actions[k].counter++;
                                find_reset = 1;
                                break;
                            }
                        }
                        if(find_reset != 1){
                            var card_obj    = {};
                            card_obj.action = purchase;
                            card_obj.counter = 1;
                            card_obj.price  = price;
                            actions.push(card_obj);
                        }
                        reset_flag = 1;
                    }


                    $_buttons.removeClass('not_visible');
                    this_card = [];
                    if(work_array.length != 0) {
                        var basic_strength = 0;
                        // заполняем html-данными select карт для сброса
                        $('#select_card').empty();
                        $.each(work_array, function(index){
                            for(var j = 0; j < units.length; j++) {
                                if(work_array[index].id == units[j].id){
                                    basic_strength = units[j].strength;
                                }
                            }
                            $('#select_card').append(
                                $('<option value=' + work_array[index].id +'>' + work_array[index].name + ' (' + work_array[index].new_strength + ' &#10144;  ' + basic_strength + ')' + '</option>')
                            );
                        });
                        $('#select_card option:first-child').attr('selected','selected');
                        this_card = work_array[0];
                        $_reset_img.empty();
                        get_card(this_card, $_reset_img);
                    } else {
                        $_reset_actions.css('display', 'none');
                        $_reset_img.css('display', 'none');
                        $('.reset_descr').remove();
                        $('.reset_card').append(
                            $('<div></div>').addClass('reset_descr').text('У вас нет прокачанных карт')
                        );
                    }
                }

            } else {
                return false;
            }
        } else {
            message = 'У вас недостаточно очков рейтинга для этого действия. Необходимо очков: ' + price;
            notice(message, 2);
            return false;
        }
    });

//////////////////////////////////////////////////////////////////
//        Обработка апгрейдов для отправки и сохранения
//////////////////////////////////////////////////////////////////

    // Отмена всех изменений
    $_body.on("click", ".points_block .cancel", function(e) {
        e.preventDefault();
        $_buttons.addClass('not_visible');
        location.reload();
    });

    // Формирование и сохранение всех изменений
    $_body.on("click", ".points_block .save", function(e) {
        e.preventDefault();
        var count = 0;
        count = actions_str.length;
        while(count > 0) {
            count--;
            actions.push(actions_str[count]);
            actions_str.splice(count, 1)
        }
        count = actions_constr.length;
        while(count > 0) {
            count--;
            actions.push(actions_constr[count]);
            actions_constr.splice(count, 1)
        }

        data_block.user_id          = user.id;
        data_block.liking           = like_flag;
        data_block.size_deck        = size_deck;
        data_block.points           = points.points;
        data_block.sp_points        = sp_points.sp_points;
        data_block.win_points       = points.win_points;
        data_block.sp_win_points    = sp_points.sp_win_points;
        data_block.score            = score;
        data_block.actions          = JSON.stringify(actions);
        data_block.unlocked         = JSON.stringify(deck_unlocked);
        data_block.upgraded         = JSON.stringify(deck_upgraded);

        $_buttons.addClass('not_visible');

        $.ajax({
            url: "save_data",
            method: "POST",
            data: data_block,
            success: function(response) {
                switch (response.error){
                    case 0:
                        message = 'Изменения успешно сохранены. Системе нужно перезагрузить страницу.';
                        notice(message, 1);
                        setTimeout(function(){
                            location.reload();
                        }, 2000);
                        break;

                    case 1:
                        message = 'Похоже, Вы не авторизированы в системе.';
                        notice(message, 2);
                        break;

                    case 2:
                        message = 'Ай-ай-ай, как некрасиво с Вашей стороны.';
                        notice(message, 2);
                        break;

                    case 3:
                    case 4:
                        message = 'Ошибка при записи данных. Попробуйте обновить страницу.';
                        notice(message, 2);
                        break;

                    default:
                        console.log(response.error);
                        break;
                }
            }
        });

    });

});
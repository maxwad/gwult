// Значения mode:
// 1 - непосредственный ход игрока
// 2 - обработка пришедшей карты
// 3 - обработка карты из истории
// 4 - установка эффекта карты

function set_effect (battle) {
    var row_name_arr = ['close', 'range', 'siege'];
    for(var i = 0; i < 2; i++) {
        var effect_arr = battle[i].effects;
        for(var j = 0; j < effect_arr.length; j++) {
            abilities_obj[effect_arr[j]](battle, 4);
        }
        for(var k = 0; k < row_name_arr.length; k++) {
            effect_arr = battle[i][row_name_arr[k]].effects;
            for(var l = 0; l < effect_arr.length; l++) {
                abilities_obj[effect_arr[l]](battle, 4);
            }
        }
    }
}

// Поиск самых слабых(сильных) карт на поле
function minmax (flag, mode, area, battle) {
    //flag: 0 - min
    //      1 - max

    //mode: 0 - multi
    //      1 - mono

    //area: 0 - home area
    //      1 - rival area
    //      2 - all area

    var cards   = [],
        counter = 0,
        count,
        limit   = 0,
        row_name_arr = ['close', 'range', 'siege'],
        strength,
        card = {};

    cards.area = [];
    cards.fields = [];
    cards.ids = [];
    switch (area) {
        case 0:
            counter = 0;
            limit = 1;
            break;

        case 1:
            counter = 1;
            limit = 2;
            break;
        case 2:
            counter = 0;
            limit = 2;
            break;
    }
    if(flag == 0){
        strength = 999999999;
    } else {
        strength = 0;
    }
    for(count = counter; count < limit; count++){
        for(var j = 0; j < row_name_arr.length; j++){
            for(var k = 0; k < battle[count][row_name_arr[j]].units_cards.length; k++){
                card = battle[count][row_name_arr[j]].units_cards[k];
                if(flag == 0){
                    if(card.type == 'U' && card.hero != 1 && card.work_strength < strength){
                        strength = card.work_strength;
                    }
                } else {
                    if(card.type == 'U' && card.hero != 1 && card.work_strength > strength){
                        strength = card.work_strength;
                    }
                }
            }
        }
    }

    out: for(count = counter; count < limit; count++){
        for(var j = 0; j < row_name_arr.length; j++){
            for(var k = 0; k < battle[count][row_name_arr[j]].units_cards.length; k++){
                card = battle[count][row_name_arr[j]].units_cards[k];
                if(card.hero != 1 && card.work_strength == strength){
                    cards.area.push(count);
                    cards.fields.push(row_name_arr[j]);
                    cards.ids.push(card.id);
                    if(mode == 1){
                        break out;
                    }
                }
            }
        }
    }
    return cards;
}

var abilities_obj = {

    'agility':         agility,
    'double':          double,
    'dummy':           dummy,
    'execution':       execution,
    'row_execution':   row_execution,
    'gain':            gain,
    'medic_units':     medic_units,
    'medic_hero':      medic_hero,
    'medic_specials':  medic_specials,
    'support':         support,
    'frost':           frost,
    'fog':             fog,
    'downpour':        downpour,
    'clear_weather':   clear_weather,
    'spy':             spy,
    'commander_horn':  commander_horn,
    'amount':          amount,
    'none':            none,

    'theft':           theft,
    'recruit':         recruit,
    'merge':           merge

}



function agility (data, mode) {
    return data.arr_data;
}



// Выкладывается на сторону соперника, даёт игроку 2 карты
function spy (data, mode) {
    var row_name_arr = ['close', 'range', 'siege'];
    var card = {};
    switch (mode) {
        case 1:
            for(var i = 0; i < 2; i++){
                if(data.deck_complete.length > 0){
                    data.player_cards.push(data.deck_complete[0]);
                    data.deck_complete.splice(0, 1);
                }
            }
            show_cards (0, data.player_cards, $('.cards'));
            var counts_data            = {};
            counts_data.user_room      = data.number_of_room;
            counts_data.player_index   = data.player_index;
            counts_data.count_cards    = data.player_cards.length;
            counts_data.count_deck     = data.deck_complete.length;
            data.socket.emit('counts', counts_data);
            card = data.arr_data[0].card;
            break;

        case 2:
            card = data.card;
            break;

        case 3:
            card = data.item_history.card;
            break;

        case 4:
            break;
    }

    outer: for(var n = 0; n < 2; n++) {
        for(var m = 0; m < row_name_arr.length; m++) {
            var field = data.battle_arr[n][row_name_arr[m]].units_cards;
            var count = field.length;
            while(count != 0) {
                count--;
                if(field[count].ability == 'spy' && field[count].id == card.id) {
                    if(n == 0) {
                        data.battle_arr[1][row_name_arr[m]].units_cards.push(clone(field[count]));
                        field.splice(count, 1);
                        break outer;
                    }
                    if(n == 1) {
                        data.battle_arr[0][row_name_arr[m]].units_cards.push(clone(field[count]));
                        field.splice(count, 1);
                        break outer;
                    }
                }
            }
        }

    }
    return data.arr_data;
}



// Вызывает на поле всех юнитов с таким же именем из колоды
function double (data, mode) {
    switch (mode) {

        case 1:
            var name_card = data.arr_data[0].card.name,
                i = data.deck_complete.length,
                field_name;
            while(i != 0) {
                i--;
                if(data.deck_complete[i].name == name_card) {
                    field_name = get_field(data.deck_complete[i]);
                    data.count_moves.h++;
                    data.deck_complete[i].number_move = data.count_moves.h;
                    data.battle_arr[0][field_name].units_cards.push(data.deck_complete[i]);
                    show_cards (1, data.battle_arr);
                    data.battle_arr[0][field_name].total = 0;
                    data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                    data.arr_data[data.arr_data.length - 1].card = data.deck_complete[i];
                    data.deck_complete.splice(i,1);
                }
            }
            break;

        case 2:
        case 3:
        case 4:
            break;
    }
    return data.arr_data;
}

// Возвращает юнит в руку
function dummy (data, mode) {
    var row_name_arr = ['close', 'range', 'siege'],
        position,
        move,
        retreat;
    switch (mode) {
        case 1:
            if(data.arr_data[0].card.find_flag == 1){
                var card = {};
                out_replace: for (var j = 0; j < row_name_arr.length; j++) {
                    var k = data.battle_arr[0][row_name_arr[j]].units_cards.length;
                    while(k != 0) {
                        k--;
                        if(data.id_replace == data.battle_arr[0][row_name_arr[j]].units_cards[k].id) {
                            card = find_card(data.id_replace, data.units);
                            card.work_strength += 3;
                            // Возвращаем карту в руку
                            data.player_cards.push(card);
                            // На стол ставим Чучело и превращаем его в юнит
                            data.battle_arr[0][row_name_arr[j]].units_cards[k] = clone(data.arr_data[0].card);
                            // Отправляем Чучело
                            data.arr_data[0].card = clone(data.battle_arr[0][row_name_arr[j]].units_cards[k]);
                            data.arr_data[0].card.id_replace = data.id_replace;
                            // Чучело на столе превращаем в юнит
                            data.battle_arr[0][row_name_arr[j]].units_cards[k].type = 'U';
                            data.battle_arr[0][row_name_arr[j]].units_cards[k].hero = 1;
                            data.battle_arr[0][row_name_arr[j]].units_cards[k].new_strength = 1;
                            data.battle_arr[0][row_name_arr[j]].units_cards[k].work_strength = 1;
                            data.battle_arr[0][row_name_arr[j]].units_cards[k].number_move = data.count_moves.h;
                            // Удаляем Чучело из руки
                            data.player_cards.splice(data.memory_id, 1);
                            break out_replace;
                        }
                    }
                }
            } else {
                data.player_cards.splice(data.memory_id, 1);
                data.retreat_home.push(clone(data.arr_data[0].card));
                last_card(data);
            }

            count_strength (data, $('.player_power'));
            show_cards (1, data.battle_arr);
            show_cards (0, data.player_cards, $('.cards'));
            break;

        case 2:
            position = data.position;
            if(position == 0){
                retreat = data.retreat_home;
                move = data.count_moves.h;
            } else {
                retreat = data.retreat_rival;
                move = data.count_moves.r;
            }

            // Если Чучело сыграно не вхолостую
            if(data.card.id_replace !== undefined){
                out_replace: for (var j = 0; j < row_name_arr.length; j++) {
                    var k = data.battle_arr[position][row_name_arr[j]].units_cards.length;
                    while(k != 0) {
                        k--;
                        if(data.card.id_replace == data.battle_arr[position][row_name_arr[j]].units_cards[k].id) {
                            // Ставим Чучело на стол
                            data.battle_arr[position][row_name_arr[j]].units_cards[k] = clone(data.card);
                            // Чучело на столе превращаем в юнит
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].type = 'U';
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].hero = 1;
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].new_strength = 1;
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].work_strength = 1;
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].number_move = move;

                            break out_replace;
                        }
                    }
                }
                if(data.player_index != -1){
                    for(var i = 0; i < data.deck_complete.length; i++){
                        if(data.deck_complete[i].hero != 1 && data.deck_complete[i].type != 'S'){
                            data.player_cards.push(data.deck_complete[i]);
                            data.deck_complete.splice(i, 1);
                            break;
                        }
                    }
                    show_cards (0, data.player_cards, $('.cards'));
                }
            } else {
                retreat.push(clone(data.card));
                retreat[retreat.length - 1].number_move = move;
                last_card(data);
            }

            break;

        case 3:
            position = data.position;
            if(position == 0){
                retreat = data.retreat_home;
                move = data.count_moves.h;
            } else {
                retreat = data.retreat_rival;
                move = data.count_moves.r;
            }
            // Если Чучело сыграно не вхолостую
            if(data.item_history.card.id_replace !== undefined){
                out_replace: for (var j = 0; j < row_name_arr.length; j++) {
                    var k = data.battle_arr[position][row_name_arr[j]].units_cards.length;
                    while(k != 0) {
                        k--;
                        if(data.item_history.card.id_replace == data.battle_arr[position][row_name_arr[j]].units_cards[k].id) {
                            // Ставим Чучело на стол
                            data.battle_arr[position][row_name_arr[j]].units_cards[k] = clone(data.item_history.card);
                            // Чучело на столе превращаем в юнит
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].type = 'U';
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].hero = 1;
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].new_strength = 1;
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].work_strength = 1;
                            data.battle_arr[position][row_name_arr[j]].units_cards[k].number_move = move;
                            break out_replace;
                        }
                    }
                }
            } else {
                retreat.push(clone(data.item_history.card));
                retreat[retreat.length - 1].number_move = move;
                last_card(data);
            }
            break;

        case 4:
            break;
    }
    return data.arr_data;
}


//Удаляет с поля самые сильные юниты
function execution (data, mode) {
    var cards,
        count,
        row_units = [],
        position;

    switch (mode) {
        case 1:
            data.retreat_home.push(clone(data.arr_data[0].card));
            break;

        case 2:
            position = data.position;
            if(position == 0){
                data.retreat_home.push(clone(data.card));
            } else {
                data.retreat_rival.push(clone(data.card));
            }
            break;

        case 3:
            position = data.position;
            if(position == 0){
                data.retreat_home.push(clone(data.item_history.card));
            } else {
                data.retreat_rival.push(clone(data.item_history.card));
            }
            break;
    }

    cards = minmax(1, 0, 2, data.battle_arr);
    count = cards.ids.length;
    while(count != 0) {
        count--;
        row_units = data.battle_arr[cards.area[count]][cards.fields[count]].units_cards;
        for(var i = 0; i < row_units.length; i++){
            if(row_units[i].id == cards.ids[count]) {
                row_units[i].work_strength = 0;
            }
        }
    }

    last_card(data);
    return data.arr_data;
}

// Сжигает сильнейший отряд противника и игрока в зеркальном ряду
function row_execution (data, mode) {
    var cards,
        card,
        strength = 0,
        row_units,
        search,
        mirror;
    switch (mode) {
        case 1:
            search = 1;
            mirror = 0;
            break;

        case 2:
            search = 0;
            mirror = 1;
            if(data.player_index == -1 && data.position == 0){
                search = 1;
                mirror = 0;
            }
            break;

        case 3:
            if(data.position == 0){
                search = 1;
                mirror = 0;
            } else {
                search = 0;
                mirror = 1;
            }
            break;
   }
    // Находим сильнейшую карту нужного игрока и сжигаем её
    cards = minmax(1, 1, search, data.battle_arr);
    // Если у противника нет карт, ничего не сжигаем
    if(cards.ids.length != 0){
        row_units = data.battle_arr[search][cards.fields[0]].units_cards;
        for(var i = 0; i < row_units.length; i++){
            if(cards.ids[0] == row_units[i].id){
                row_units[i].work_strength = 0;
                break;
            }
        }
        // Находим сильнейшую карту в зеркальном ряду
        for(var k = 0; k < data.battle_arr[mirror][cards.fields[0]].units_cards.length; k++){
            card = data.battle_arr[mirror][cards.fields[0]].units_cards[k];
            if(card.type == 'U' && card.hero != 1 && card.work_strength > strength){
                strength = card.work_strength;
            }
        }
        // Сжигаем её
        row_units = data.battle_arr[mirror][cards.fields[0]].units_cards;
        for(var i = 0; i < row_units.length; i++){
            if(row_units[i].work_strength == strength){
                row_units[i].work_strength = 0;
                break;
            }
        }
    }

    return data.arr_data;
}



function medic (type_medic, side, data, mode) {
    var work_array = [],
        retreat,
        position,
        stop = 0;

    switch (mode) {
        case 1:
            if(side == 0) {
                retreat = data.retreat_home;
            } else {
                retreat = data.retreat_rival;
            }

            switch (type_medic) {
                case 'medic_units':
                    for(var j = 0; j < retreat.length; j++) {
                        if(retreat[j].type == 'U' &&
                            retreat[j].hero != 1){
                            work_array.push(retreat[j]);
                        }
                    }
                    break;

                case 'medic_hero':
                    for(var j = 0; j < retreat.length; j++) {
                        if(retreat[j].type == 'U' &&
                            retreat[j].hero == 1){
                            work_array.push(retreat[j]);
                        }
                    }
                    break;

                case 'medic_specials':
                    for(var j = 0; j < retreat.length; j++) {
                        if(retreat[j].type == 'S'){
                            work_array.push(retreat[j]);
                        }
                    }
                    break;
            }

            if(work_array.length != 0) {
                $('.battle').append(
                    $('<div/>').addClass('choice')
                );
                show_cards(0, work_array, $('.choice'));
                stop = 1;
            }
            break;

        case 2:
            position = data.position;
            if(position == 0){
                if(side == 0){
                    retreat = data.retreat_home;
                } else {
                    retreat = data.retreat_rival;
                }
            } else {
                if(side == 0){
                    retreat = data.retreat_rival;
                } else {
                    retreat = data.retreat_home;
                }
            }
            for(var i = 0; i < retreat.length; i++){
                if(data.card.id_medic == retreat[i].id){
                   retreat.splice(i, 1);
                   break;
                }
            }
            break;

        case 3:
            position = data.position;
            if(position == 0){
                if(side == 0){
                    retreat = data.retreat_home;
                } else {
                    retreat = data.retreat_rival;
                }
            } else {
                if(side == 0){
                    retreat = data.retreat_rival;
                } else {
                    retreat = data.retreat_home;
                }
            }
            for(var i = 0; i < retreat.length; i++){
                if(data.item_history.card.id_medic == retreat[i].id){
                    retreat.splice(i, 1);
                    break;
                }
            }
            break;

        case 4:
            if(side == 0) {
                retreat = data.retreat_home;
            } else {
                retreat = data.retreat_rival;
            }
            for(var j = 0; j < retreat.length; j++){
                if(retreat[j].id == data.card_id){
                    data.arr_data[0].card.id_medic = retreat[j].id;
                    data.player_cards.push(clone(retreat[j]));
                    retreat.splice(j, 1);
                    break;
                }
            }

            last_card(data);
            $('.choice').remove();
            show_cards (0, data.player_cards, $('.cards'));
            break;
    }
    return stop;
}


// Воскрешаем свой юнит
function medic_units (data, mode) {
    var type_medic = arguments.callee.name,
        stop = medic(type_medic, 0, data, mode);
    if(stop == 1){
        return false;
    }
    return data.arr_data;
}

// Воскрешаем своего героя
function medic_hero (data, mode) {
    var type_medic = arguments.callee.name,
        stop = medic(type_medic, 0, data, mode);
    if(stop == 1){
        return false;
    }
    return data.arr_data;
}

// Воскрешаем свою специальную карту
function medic_specials (data, mode) {
    var type_medic = arguments.callee.name,
        stop = medic(type_medic, 0, data, mode);
    if(stop == 1){
        return false;
    }
    return data.arr_data;
}


// Делаем силу всех юнитов в ряду равной 5
function gain (data, mode) {
    var field_name,
        card,
        position;
    switch (mode) {
        case 1:
            card = data.arr_data[0].card;
            position = 0;
            break;

        case 2:
            card = data.card;
            position = data.position;
            break;

        case 3:
            card = data.item_history.card;
            position = data.position;
            break;
    }

    field_name = get_field(card);
    for(var i = 0; i < data.battle_arr[position][field_name].units_cards.length; i++){
        var item_card = data.battle_arr[position][field_name].units_cards[i];
        if(item_card.hero != 1 && item_card.type == 'U'){
            item_card.work_strength = 5;
        }
    }

    return data.arr_data;
}


// Увеличивает силу первых 3 отрядов в ряду на 5
function commander_horn (data, mode) {
    var field_name,
        count = 0,
        card,
        item,
        position = data.position,
        retreat,
        move;
    switch (mode) {
        case 1:
            card = data.arr_data[0].card;
            position = 0;

            for(var i = 0; i < data.player_cards.length; i++){
                if(data.player_cards[i].id == card.id){
                    data.player_cards.splice(i, 1);
                    break;
                }
            }
            show_cards (0, data.player_cards, $('.cards'));
            break;

        case 2:
            card = data.card;
            break;

        case 3:
            card = data.item_history.card;
            break;
    }

    card.id_class = card.field_horn;
    field_name = get_field(card);
    for(var i = 0; i < data.battle_arr[position][field_name].units_cards.length; i++){
        item = data.battle_arr[position][field_name].units_cards[i];
        if(item.type == 'U' && item.hero != 1){
            item.work_strength += 5;
            count++;
            if(count == 3){
                break;
            }
        }
    }
    delete card.id_class;
    if(position == 0){
        retreat = data.retreat_home;
        move = data.count_moves.h;
    } else {
        retreat = data.retreat_rival;
        move = data.count_moves.r;
    }
    retreat.push(find_card(card.id, data.specials));
    retreat[retreat.length - 1].number_move = move;
    count_strength (data, $('.player_power'));
    show_cards (1, data.battle_arr);

    return data.arr_data;
}


// Добавляет всем отрядам в ряду с такой же способностью +1
function support (data, mode) {
    var field_name,
        card,
        item,
        position = data.position;
    switch (mode) {
        case 1:
            position = 0;
            card = data.arr_data[0].card;
            break;

        case 2:
            card = data.card;
            break;

        case 3:
            card = data.item_history.card;
            break;
    }

    field_name = get_field(card);
    for(var i = 0; i < data.battle_arr[position][field_name].units_cards.length; i++){
        item = data.battle_arr[position][field_name].units_cards[i];
        if(item.type == 'U' && item.hero != 1 && item.ability == 'support'){
            item.work_strength += 1;
        }
    }
    return data.arr_data;
}


function weather (type_weather, data, mode) {
    var position = 0,
        row = [],
        weather_flag = 0;
    switch (type_weather) {
        case "frost":
           row = ['close'];
            break;

        case "fog":
            row = ['range'];
            break;

        case "downpour":
            row = ['siege'];
            break;

        case "clear_weather":
            row = ['close', 'range', 'siege'];
            break;
    }

    // Пушим эффект погоды в объект и перемещаем карту в сброс
    switch (mode) {
        case 1:
            if(row.length == 1) {
                if(data.battle_arr[0][row[0]].effects[0] == type_weather){
                    data.battle_arr[0][row[0]].effects[0] = data.arr_data[0].card.ability;
                    data.battle_arr[1][row[0]].effects[0] = data.arr_data[0].card.ability;
                } else {
                    data.battle_arr[0][row[0]].effects.unshift(data.arr_data[0].card.ability);
                    data.battle_arr[1][row[0]].effects.unshift(data.arr_data[0].card.ability);
                }
            }
            data.retreat_home.push(clone(data.arr_data[0].card));
            last_card(data);
            break;

        case 2:
            position = data.position;
            if(row.length == 1) {
                if(data.battle_arr[0][row[0]].effects[0] == type_weather){
                    data.battle_arr[0][row[0]].effects[0] = data.card.ability;
                    data.battle_arr[1][row[0]].effects[0] = data.card.ability;
                } else {
                    data.battle_arr[0][row[0]].effects.unshift(data.card.ability);
                    data.battle_arr[1][row[0]].effects.unshift(data.card.ability);
                }
            }
            if(position == 0){
                data.retreat_home.push(clone(data.card));
            } else {
                data.retreat_rival.push(clone(data.card));
            }
            last_card(data);
            break;

        case 3:
            position = data.position;
            if(row.length == 1) {
                if(data.battle_arr[0][row[0]].effects[0] == type_weather){
                    data.battle_arr[0][row[0]].effects[0] = data.item_history.card.ability;
                    data.battle_arr[1][row[0]].effects[0] = data.item_history.card.ability;
                } else {
                    data.battle_arr[0][row[0]].effects.unshift(data.item_history.card.ability);
                    data.battle_arr[1][row[0]].effects.unshift(data.item_history.card.ability);
                }
            }
            if(position == 0){
                data.retreat_home.push(clone(data.item_history.card));
            } else {
                data.retreat_rival.push(clone(data.item_history.card));
            }
            last_card(data);
            break;
    }
    // Если это дебаф, то бьём по юнитам
    if(row.length == 1){
        for (var i = 0; i < 2; i++) {
            for(var k = 0; k < row.length; k++){
                for (var j = 0; j < data.battle_arr[i][row[k]].units_cards.length; j++) {
                    var card = data.battle_arr[i][row[k]].units_cards[j];
                    if(card.hero != 1 && card.work_strength != 0 && card.weather === undefined) {
                        card.weather = Math.round(Math.round(card.work_strength/2)/2);
                        card.work_strength = Math.round(card.work_strength/2);
                    }
                }
            }
        }

    } else {
        // Если это Чистое небо, то лечим юнита
        for(var i = 0; i < 2; i++){
            for(var k = 0; k < row.length; k++){
                for (var j = 0; j < data.battle_arr[i][row[k]].effects.length; j++) {
                    var effect = data.battle_arr[i][row[k]].effects[j];
                    if(effect == 'frost' || effect == 'fog' || effect == 'downpour') {
                        weather_flag = 1;
                        data.battle_arr[i][row[k]].effects.splice(j,1);
                    }
                }
            }
        }
        if(weather_flag == 1){
            for (var i = 0; i < 2; i++) {
                    for(var k = 0; k < row.length; k++){
                    for (var j = 0; j < data.battle_arr[i][row[k]].units_cards.length; j++) {
                        var card = data.battle_arr[i][row[k]].units_cards[j];
                        if(card.hero != 1 && card.work_strength != 0 && card.weather !== undefined) {
                            card.work_strength += card.weather;
                            card.weather = undefined;
                        }
                    }
                }
            }
        } else {
            // Если Чистое небо сыграно на стол без погоды
            for(var k = 0; k < row.length; k++){
                for (var j = 0; j < data.battle_arr[position][row[k]].units_cards.length; j++) {
                    var card = data.battle_arr[position][row[k]].units_cards[j];
                    if(card.hero != 1 && card.work_strength != 0) {
                        card.work_strength += 2;
                        break;
                    }
                }
            }
        }
    }
    return data;
}

function frost (data, mode) {
    var type_weather = arguments.callee.name;
    weather (type_weather, data, mode);
    return data.arr_data;
}

function fog (data, mode) {
    var type_weather = arguments.callee.name;
    weather (type_weather, data, mode);
    return data.arr_data;
}

function downpour (data, mode) {
    var type_weather = arguments.callee.name;
    weather (type_weather, data, mode);
    return data.arr_data;
}

function clear_weather (data, mode) {
    var type_weather = arguments.callee.name;
    weather (type_weather, data, mode);
    return data.arr_data;
}


// Установить силу равной количеству юнитов "не героев" на столе
function amount (data, mode) {
    var field_name,
        count = 0,
        card,
        item,
        position = data.position,
        row = ['close', 'range', 'siege'];

    switch (mode) {
        case 1:
            position = 0;
            card = data.arr_data[0].card;
            break;

        case 2:
            card = data.card;
            break;

        case 3:
            card = data.item_history.card;
            break;
    }

    for(var j = 0; j < row.length; j++){
        for(var i = 0; i < data.battle_arr[position][row[j]].units_cards.length; i++){
            item = data.battle_arr[position][row[j]].units_cards[i];
            if(item.type == 'U' && item.hero != 1){
                count++;
            }
        }
    }
    if(count > 1){
        field_name = get_field(card);
        for(var k = 0; k < data.battle_arr[position][field_name].units_cards.length; k++){
            item = data.battle_arr[position][field_name].units_cards[k];
            if(item.type == 'U' && item.ability == 'amount'){
                item.work_strength = count;
            }
        }
    }
    return data.arr_data;
}



function theft (data, mode) {
    switch (mode) {
        case 1:
            if(data.retreat_rival.length != 0) {
                var rand = Math.round(0 - 0.5 + Math.random() * (data.retreat_rival.length - 0 + 1));
                if(rand == data.retreat_rival.length){
                    rand--;
                }
                var card = data.retreat_rival[rand];
                var clone_card = clone(card);
                data.player_cards.push(card);
                data.retreat_rival.splice(rand, 1);
                last_card(data);
                clone_card.delete = 1;
                clone_card.from_theft = 1;
                data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                data.arr_data[data.arr_data.length - 1].card = clone_card;
            }
            break;

        case 2:
            var message = 'Игроком использована карта лидера';
            notice(message, 1);
            break;

        case 3:
            break;

        case 4:
            break;
    }

    show_cards (0, data.player_cards, $('.cards'));
    return data.arr_data;
}


function recruit (data, mode) {
    switch (mode) {
        case 1:
            for(var i = 0; i < 2; i++){
                if(data.deck_complete.length > 0){
                    data.player_cards.push(data.deck_complete[0]);
                    data.deck_complete.splice(0, 1);
                }
            }
            show_cards (0, data.player_cards, $('.cards'));
            var counts_data            = {};
            counts_data.user_room      = data.number_of_room;
            counts_data.player_index   = data.player_index;
            counts_data.count_cards    = data.player_cards.length;
            counts_data.count_deck     = data.deck_complete.length;
            data.socket.emit('counts', counts_data);
            break;

        case 2:
            if(data.deck_complete.length > 0){
                data.player_cards.push(data.deck_complete[0]);
                data.deck_complete.splice(0, 1);
            }
            show_cards (0, data.player_cards, $('.cards'));
            var message = 'Игроком использована карта лидера';
            notice(message, 1);
            break;

        case 3:
            break;

        case 4:
            break;
    }

    return data.arr_data;
}



function merge (data, mode) {
    var row_name_arr = ['close', 'range', 'siege'];
    switch (mode) {
        case 1:
            var strength = 9999,
                field    = '',
                card_id  = 0,
                item     = 0;
            for(var j = 0; j < row_name_arr.length; j++){
                for(var k = 0; k < data.battle_arr[0][row_name_arr[j]].units_cards.length; k++){
                    var card = data.battle_arr[0][row_name_arr[j]].units_cards[k];
                    if(card.hero != 1 &&
                        card.ability == 'none' &&
                        card.new_strength < strength){
                        strength  = card.new_strength;
                        field     = row_name_arr[j];
                        card_id   = card.id;
                        item      = k;
                    }
                }
            }
            if(field != '') {
                data.battle_arr[0][field].units_cards[item].ability = 'merge';
                data.battle_arr[0][field].effects.push('merge');
                data.arr_data[0].card.field_merge   = field;
                data.arr_data[0].card.card_id_merge = card_id;
            }
            break;

        case 2:
            if(data.card.field_merge !== undefined){
                var position = data.position,
                    cards = data.battle_arr[position][data.card.field_merge].units_cards;
                for(var j = 0; j < cards.length; j++){
                    if(cards[j].id == data.card.card_id_merge){
                        cards[j].ability = 'merge';
                        data.battle_arr[position][data.card.field_merge].effects.push('merge');
                        break;
                    }
                }
            }
            var message = 'Игроком использована карта лидера';
            notice(message, 1);
            break;

        case 3:
            if(data.item_history.card.field_merge !== undefined) {
                var position = data.position,
                    cards = data.battle_arr[position][data.item_history.card.field_merge].units_cards;
                for(var j = 0; j < cards.length; j++){
                    if(cards[j].id == data.item_history.card.card_id_merge){
                        cards[j].ability = 'merge';
                        data.battle_arr[position][data.item_history.card.field_merge].effects.push('merge');
                        break;
                    }
                }
            }
            break;

        case 4:
            var row = ['close', 'range', 'siege'];
            for(var i = 0; i < 2; i++){
                for(var j = 0; j < row.length; j++){
                    var cards = data[i][row[j]].units_cards;
                    for(var k = 0; k < cards.length; k++) {
                        if(cards[k].ability == 'merge') {
                            if(k > 0 && k < cards.length - 1){
                                if(cards[k].basic === undefined) {
                                    cards[k].basic = cards[k].work_strength;
                                }
                                cards[k].work_strength = cards[k - 1].work_strength + cards[k + 1].work_strength;
                            } else {
                                if(cards[k].basic !== undefined){
                                    cards[k].work_strength = cards[k].basic;
                                }
                            }
                        }
                    }
                }
            }
            break;

        case 5:
            for(var m = 0; m < data.units_cards.length; m++){
                if(data.units_cards[m].ability == 'merge') {
                    data.units_cards[m].ability = 'none';
                    data.units_cards[m].work_strength = data.units_cards[m].basic;
                    delete data.units_cards[m].basic;
                }
            }
            break;
    }

    return data.arr_data;
}



function none (data, mode) {
    return data.arr_data;
}

//Каждый метод должен возвращать стек карт, даже если он ничего не делал
// Значения mode:
// 1 - непосредственный ход игрока
// 2 - обработка пришедшей карты
// 3 - обработка карты из истории
// 4 - установка эффекта карты

function clone(obj) {
    if(obj == null || typeof(obj) != 'object'){
        return obj;
    }
    var temp = {};
    for(var key in obj){
        temp[key] = clone(obj[key]);
    }
    return temp;
}



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



function change_weather(data, mode) {
    for(var i = 0; i < 2; i++) {
        var count = data.battle_arr[i].effects.length;
        while(count != 0) {
            count--;
            if(mode == 1) {
                if(data.battle_arr[i].effects[count] == 'clear_weather') {
                    data.battle_arr[i].effects.splice(count, 1);
                }
            }
            if(mode == 2) {
                if(data.battle_arr[i].effects[count] == 'frost' ||
                   data.battle_arr[i].effects[count] == 'fog' ||
                   data.battle_arr[i].effects[count] == 'downpour') {
                    data.battle_arr[i].effects.splice(count, 1);
                }
            }

        }
        var k = data.battle_arr[i].specials.length;
        while(k != 0) {
            k--;
            if(mode == 1) {
                if(data.battle_arr[i].specials[k].ability == 'clear_weather') {
                    if(i == 0){
                        data.retreat_home.push(data.battle_arr[i].specials[k]);
                    }
                    if(i == 1) {
                        data.retreat_rival.push(data.battle_arr[i].specials[k]);
                    }
                    data.battle_arr[i].specials.splice(k,1);
                }
            }
            if(mode == 2) {
                if(data.battle_arr[i].specials[k].ability == 'frost' ||
                   data.battle_arr[i].specials[k].ability == 'fog' ||
                   data.battle_arr[i].specials[k].ability == 'downpour') {
                    if(i == 0){
                        data.retreat_home.push(data.battle_arr[i].specials[k]);
                    }
                    if(i == 1) {
                        data.retreat_rival.push(data.battle_arr[i].specials[k]);
                    }
                    data.battle_arr[i].specials.splice(k,1);
                }
            }
        }
    }
    last_card(data);
}



var abilities_obj = {

    'agility':         agility,
    'double':          double,
    'dummy':           dummy,
    'execution':       execution,
    'gain':            gain,
    'medic':           medic,
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

            var j = data.player_cards.length;
            while(j != 0) {
                j--;
                if(data.player_cards[j].name == name_card) {
                    field_name = get_field(data.player_cards[j]);
                    data.count_moves.h++;
                    data.player_cards[j].number_move = data.count_moves.h;
                    data.battle_arr[0][field_name].units_cards.push(data.player_cards[j]);
                    show_cards (1, data.battle_arr);
                    data.battle_arr[0][field_name].total = 0;
                    data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                    data.arr_data[data.arr_data.length - 1].card = data.player_cards[j];
                    data.player_cards.splice(j,1);
                }
            }

            show_cards (0, data.player_cards, $('.cards'));
            break;

        case 2:
        case 3:
        case 4:
            break;
    }
    return data.arr_data;
}



function dummy (data, mode) {
    var field_name;
    switch (mode) {

        case 1:
            var found_card = {},
                field_index,
                row_name_arr = ['close', 'range', 'siege'];
            for (var j = 0; j < row_name_arr.length; j++) {
                var k = data.battle_arr[0][row_name_arr[j]].units_cards.length;
                while(k != 0) {
                    k--;
                    if(data.id_replace == data.battle_arr[0][row_name_arr[j]].units_cards[k].id) {

                        found_card = clone(data.battle_arr[0][row_name_arr[j]].units_cards[k]);
                        found_card.exponent   = 1;
                        found_card.added      = 0;
                        found_card.multiplier = 1;
                        found_card.multihorn  = 1;
                        if(found_card.basic !== undefined){
                            found_card.strength = found_card.basic;
                            delete found_card.basic;
                        }
                        if(found_card.ability == 'amount'){
                            found_card.strength = 0;
                        }
                        found_card.fact_strength = found_card.strength;
                        data.arr_data[0].card = data.player_cards[data.memory_id];
                        data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                        data.arr_data[1].card = clone(found_card);
                        data.arr_data[1].card.delete = 1;
                        data.arr_data[1].card.from_dummy  = 1;
                        data.arr_data[1].card.delete_field = data.player_index;

                        data.player_cards.push(found_card);
                        data.player_cards[data.memory_id].unit          = 1;
                        data.player_cards[data.memory_id].position      = k;
                        data.player_cards[data.memory_id].strength      = 0;
                        data.player_cards[data.memory_id].fact_strength = 0;
                        if(found_card.id_class == 7) {
                            data.player_cards[data.memory_id].id_class = found_card.change_class;
                            delete found_card.change_class;
                        } else {
                            data.player_cards[data.memory_id].id_class = found_card.id_class;
                        }

                        var delete_data              = {};
                        delete_data.ind              = 0;
                        delete_data.field_name       = row_name_arr[j];
                        delete_data.card             = data.battle_arr[0][row_name_arr[j]].units_cards[k];
                        delete_data.battle_arr       = data.battle_arr;
                        delete_data.retreat_home     = data.retreat_home;
                        delete_data.retreat_rival    = data.retreat_rival;
                        delete_data.card.from_dummy  = 1;
                        delete_card(delete_data);

                        data.battle_arr[0][row_name_arr[j]].units_cards[k] = data.player_cards[data.memory_id];

                        data.player_cards.splice(data.memory_id, 1);
                        break;
                    }
                }
            }
            count_strength (data.battle_arr, $('.player_power'));
            show_cards (1, data.battle_arr);
            show_cards (0, data.player_cards, $('.cards'));
            break;

        case 2:
            var ind = data.position;
            field_name = get_field(data.card);
            data.battle_arr[ind][field_name].units_cards[data.card.position] = data.card;
            var index = data.battle_arr[ind][field_name].units_cards.length - 1;
            data.battle_arr[ind][field_name].units_cards.splice(index, 1);

            break;

        case 3:
            field_name = get_field(data.item_history.card);
            data.battle_arr[data.position][field_name].units_cards[data.item_history.card.position] = data.item_history.card;
            var index = data.battle_arr[data.position][field_name].units_cards.length - 1;
            data.battle_arr[data.position][field_name].units_cards.splice(index, 1);
            break;

        case 4:
            break;
    }
    return data.arr_data;
}



function execution (data, mode) {
    var row_name_arr = ['close', 'range', 'siege'];
    switch (mode) {
        case 1:
            var strength     = 0,
                arr_player   = [],
                arr_field    = [],
                arr_card_id  = [];

            if(data.arr_data[0].card.name == 'Казнь') {
                data.retreat_home.push(clone(data.arr_data[0].card));
                for(var i = 0; i < 2; i++){
                    for(var j = 0; j < row_name_arr.length; j++){
                        for(var k = 0; k < data.battle_arr[i][row_name_arr[j]].units_cards.length; k++){
                            var card = data.battle_arr[i][row_name_arr[j]].units_cards[k];
                            if(card.hero != 1 && card.fact_strength > strength){
                                strength = card.fact_strength;
                            }
                        }
                    }
                }
                for(var i = 0; i < 2; i++){
                    for(var j = 0; j < row_name_arr.length; j++){
                        for(var k = 0; k < data.battle_arr[i][row_name_arr[j]].units_cards.length; k++){
                            var card = data.battle_arr[i][row_name_arr[j]].units_cards[k];
                            if(card.hero != 1 && card.fact_strength == strength){
                                arr_player.push(i);
                                arr_field.push(row_name_arr[j]);
                                arr_card_id.push(card.id);
                            }
                        }
                    }
                }
            } else {
                var field_name = get_field(data.arr_data[0].card);
                var total_field = 0;
                for(var k = 0; k < data.battle_arr[1][field_name].units_cards.length; k++){
                    var test = data.battle_arr[1][field_name].units_cards[k];
                    if(test.unit == 1){
                        total_field += test.fact_strength;
                    }
                }
                if (total_field >= 10) {
                    for(var l = 0; l < data.battle_arr[1][field_name].units_cards.length; l++){
                        var card = data.battle_arr[1][field_name].units_cards[l];
                        if(card.hero != 1 && card.fact_strength > strength){
                            strength = card.fact_strength;
                        }
                    }
                    for(var m = 0; m < data.battle_arr[1][field_name].units_cards.length; m++){
                        var del_card = data.battle_arr[1][field_name].units_cards[m];
                        if(del_card.hero != 1 && del_card.fact_strength == strength){
                            arr_player.push(1);
                            arr_field.push(field_name);
                            arr_card_id.push(del_card.id);
                        }
                    }
                }
            }
            var count = arr_player.length;
            while(count != 0) {
                count--;
                var cards = data.battle_arr[arr_player[count]][arr_field[count]].units_cards;
                var i = cards.length;
                while(i != 0) {
                    i--;
                    if(cards[i].id == arr_card_id[count]) {
                        data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                        data.arr_data[data.arr_data.length - 1].card = clone(cards[i]);
                        data.arr_data[data.arr_data.length - 1].card.delete = 1;
                        if(arr_player[count] == 0){
                            data.arr_data[data.arr_data.length - 1].player_index = data.player_index;
                        } else {
                            data.arr_data[data.arr_data.length - 1].player_index = data.rival_index;
                        }
                        var delete_data           = {};
                        delete_data.ind           = arr_player[count];
                        delete_data.field_name    = arr_field[count];
                        delete_data.card          = cards[i];
                        delete_data.battle_arr    = data.battle_arr;
                        delete_data.retreat_home  = data.retreat_home;
                        delete_data.retreat_rival = data.retreat_rival;
                        delete_card(delete_data);
                    }
                }
            }
            break;

        case 2:
            if(data.card.name == 'Казнь') {
                if(data.player_index == data.from_player) {
                    data.retreat_home.push(clone(data.card));
                } else {
                    if(data.player_index == -1) {
                        if(data.from_player == 0) {
                            data.retreat_home.push(clone(data.card));
                        } else {
                            data.retreat_rival.push(clone(data.card));
                        }
                    } else {
                        data.retreat_rival.push(clone(data.card));
                    }
                }
            }
            break;

        case 3:
            if(data.item_history.card.name == 'Казнь') {
                if(data.player_index == data.item_history.player_index) {
                    data.retreat_home.push(clone(data.item_history.card));
                } else {
                    if(data.player_index == -1) {
                        if(data.item_history.player_index == 0) {
                            data.retreat_home.push(clone(data.item_history.card));
                        } else {
                            data.retreat_rival.push(clone(data.item_history.card));
                        }
                    } else {
                        data.retreat_rival.push(clone(data.item_history.card));
                    }
                }
            }
            break;

        case 4:
            break;
    }
    last_card(data);
    return data.arr_data;
}



function medic (data, mode) {
    switch (mode) {
        case 1:
            var count = 0;
            for(var j = 0; j < data.retreat_home.length; j++) {
                if(data.retreat_home[j].unit == 1 &&
                    data.retreat_home[j].hero != 1 &&
                    data.retreat_home[j].name != 'Чучело'){
                    count++;
                }
            }
            if(count != 0) {
                $('.battle').append(
                    $('<div/>').addClass('choice')
                );
                for (var i = 0; i < data.retreat_home.length; i++) {
                    if(data.retreat_home[i].unit == 1 &&
                        data.retreat_home[i].hero != 1 &&
                        data.retreat_home[i].name != 'Чучело') {
                        $('.choice').append(
                            $('<div/>').attr('data-item', i)
                                .attr('data-id-card', data.retreat_home[i].id)
                                .addClass('card_on_table')
                                .append(
                                    $('<img/>').attr({
                                        'src':          "../" + data.retreat_home[i].pict,
                                        'title':        data.retreat_home[i].name
                                    })
                                )
                        );
                        if(data.retreat_home[i].unit == 1) {
                            $('.choice').children().eq(i).append(
                                $('<div/>').
                                    text(data.retreat_home[i].fact_strength)
                                    .attr('data-item', i)
                                    .addClass('fact_strength')
                            );
                        }
                    }
                }
                return false;
            }
            break;

        case 2:
            break;

        case 3:
            break;

        case 4:
            break;

        case 6:
            var card = data.retreat_home[data.item_card];
            var clone_card = clone(card);
            data.player_cards.push(card);
            data.retreat_home.splice(data.item_card, 1);
            last_card(data);

            clone_card.delete = 1;
            clone_card.from_medic = 1;
            data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
            data.arr_data[data.arr_data.length - 1].card = clone_card;
            break;
    }
    $('.choice').remove();
    show_cards (0, data.player_cards, $('.cards'));
    return data.arr_data;
}



function gain (data, mode) {
    var field_name;
    switch (mode) {
        case 1:
            field_name = get_field(data.arr_data[0].card);
            data.battle_arr[0][field_name].effects.push(data.arr_data[0].card.ability);
            break;

        case 2:
            var ind = data.position;
            field_name = get_field(data.card);
            data.battle_arr[ind][field_name].effects.push(data.card.ability);
            break;

        case 3:
            field_name = get_field(data.item_history.card);
            if(data.player_index == data.item_history.player_index){
                data.battle_arr[0][field_name].effects.push(data.item_history.card.ability);
            } else {
                if(data.player_index == -1){
                    data.battle_arr[data.item_history.player_index][field_name].effects.push(data.item_history.card.ability);
                } else {
                    data.battle_arr[1][field_name].effects.push(data.item_history.card.ability);
                }
            }
            break;

        case 4:
            var gain = 0;
            var row = ['close', 'range', 'siege'];
            for(var i = 0; i < 2; i++){
                for(var j = 0; j < row.length; j++){
                    for(var k = 0; k < data[i][row[j]].effects.length; k++) {
                        if(data[i][row[j]].effects[k] == 'gain') {
                            gain++;
                        }
                        if(data[i][row[j]].units_cards.length > 1){
                            for(var l = 0; l < data[i][row[j]].units_cards.length; l++){
                                if(data[i][row[j]].units_cards[l].hero != 1 &&
                                    data[i][row[j]].units_cards[l].name != 'Чучело') {
                                    data[i][row[j]].units_cards[l].added = gain;
                                }
                            }
                        }

                    }
                    gain = 0;
                }
            }
            break;

        case 5:
            for(var m = 0; m < data.units_cards.length; m++){
                data.units_cards[m].added = 0;
            }
            break;
    }
    return data.arr_data;
}



function commander_horn (data, mode) {
    var field_name;
    switch (mode) {
        case 1:
            if(data.arr_data[0].card.name != 'Лютик'){
                data.arr_data[0].card.id_class = data.arr_data[0].card.field_horn;
            }
            field_name = get_field(data.arr_data[0].card);
            if(data.arr_data[0].card.name != 'Лютик'){
                delete data.arr_data[0].card.id_class;
                data.battle_arr[0][field_name].row_specials.push(data.arr_data[0].card);
                for(var i = 0; i < data.player_cards.length; i++){
                    if(data.player_cards[i].id == data.arr_data[0].card.id){
                        data.player_cards.splice(i, 1);
                        break;
                    }
                }
            }
            data.battle_arr[0][field_name].effects.push('commander_horn');
            show_cards (0, data.player_cards, $('.cards'));
            count_strength (data.battle_arr, $('.player_power'));
            show_cards (1, data.battle_arr);
            break;

        case 2:
            var ind = data.position;
            if(data.card.name != 'Лютик'){
                data.card.id_class = data.card.field_horn;
            }
            field_name = get_field(data.card);
            if(data.card.name != 'Лютик'){
                delete data.card.id_class;
                data.battle_arr[ind][field_name].row_specials.push(data.card);
            }
            data.battle_arr[ind][field_name].effects.push('commander_horn');
            count_strength (data.battle_arr, $('.player_power'));
            show_cards (1, data.battle_arr);
            break;

        case 3:
            var ind = data.position;

            if(data.item_history.card.name != 'Лютик'){
                data.item_history.card.id_class = data.item_history.card.field_horn;
            }
            field_name = get_field(data.item_history.card);
            if(data.item_history.card.name != 'Лютик'){
                delete data.item_history.card.id_class;
                data.battle_arr[ind][field_name].row_specials.push(data.item_history.card);
            }
            data.battle_arr[ind][field_name].effects.push('commander_horn');
            count_strength (data.battle_arr, $('.player_power'));
            show_cards (1, data.battle_arr);
            break;

        case 4:
            var row = ['close', 'range', 'siege'];
            for(var i = 0; i < 2; i++){
                for(var j = 0; j < row.length; j++){
                    for(var k = 0; k < data[i][row[j]].effects.length; k++) {
                        if(data[i][row[j]].effects[k] == 'commander_horn') {
                            for(var l = 0; l < data[i][row[j]].units_cards.length; l++){
                                if(data[i][row[j]].units_cards[l].hero != 1) {
                                    data[i][row[j]].units_cards[l].multihorn = 2;
                                }
                            }
                        }
                    }
                }
            }
            break;

        case 5:
            for(var m = 0; m < data.units_cards.length; m++){
                data.units_cards[m].multihorn = 1;
            }
    }

    return data.arr_data;
}



function support (data, mode) {
    var field_name;
    switch (mode) {
        case 1:
            field_name = get_field(data.arr_data[0].card);
            data.battle_arr[0][field_name].effects.push('support');
            break;

        case 2:
            var ind = data.position;
            field_name = get_field(data.card);
            data.battle_arr[ind][field_name].effects.push('support');
            break;

        case 3:
            var ind = data.position;
            field_name = get_field(data.item_history.card);
            data.battle_arr[ind][field_name].effects.push('support');
            break;

        case 4:
            var row = ['close', 'range', 'siege'];
            var count = 0;
            for(var i = 0; i < 2; i++){
                for(var j = 0; j < row.length; j++){
                    for(var k = 0; k < data[i][row[j]].effects.length; k++) {
                        if(data[i][row[j]].effects[k] == 'support') {
                            count++;
                        }
                    }
                    if(count > 1) {
                        var cards     = data[i][row[j]].units_cards;
                        var arr_names = [];
                        var arr_sup   = [];
                        for(var p = 0; p < cards.length; p++){
                            if(cards[p].ability == 'support'){
                                arr_names.push(cards[p].name);
                            }
                        }
                        var count_sup = 0;
                        for (var r = 0; r < arr_names.length; r++){
                            for(var q = 0; q < arr_names.length; q++){
                                if (arr_names[r] == arr_names[q]){
                                    count_sup++;
                                }
                            }
                            if(count_sup > 1) {
                                arr_sup.push(arr_names[r]);
                            }
                            count_sup = 0;
                        }
                        for(var t = 0; t < arr_sup.length; t++) {
                            for(var l = 0; l < cards.length; l++) {
                                if(cards[l].ability == 'support' && cards[l].name == arr_sup[t]) {
                                    cards[l].multiplier = 2;
                                }
                            }
                        }
                    }
                    count = 0;
                }
            }
            break;

        case 5:
            var count = 0;
            for(var m = 0; m < data.effects.length; m++){
                if(data.effects[m] == 'support') {
                    count++;
                }
            }
            if(count - 1 < 2) {
                for(var n = 0; n < data.units_cards.length; n++){
                    data.units_cards[n].multiplier = 1;
                }
            }
            break;
    }

    return data.arr_data;
}



function frost (data, mode) {
    switch (mode) {
        case 1:
            data.battle_arr[0].effects.push(data.arr_data[0].card.ability);
            data.battle_arr[0].specials.push(data.arr_data[0].card);
            change_weather(data, 1);
            break;

        case 2:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.card.ability);
            data.battle_arr[ind].specials.push(data.card);
            change_weather(data, 1);
            break;

        case 3:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.item_history.card.ability);
            data.battle_arr[ind].specials.push(data.item_history.card);
            change_weather(data, 1);
            break;

        case 4:
            var row = ['close'];
            var exponent = 0;
            for (var i = 0; i < 2; i++) {
                for(var k = 0; k < row.length; k++){
                    for (var j = 0; j < data[i][row[k]].units_cards.length; j++) {
                        if(data[i][row[k]].units_cards[j].hero != 1 && data[i][row[k]].units_cards[j].strength != 0) {
                            data[i][row[k]].units_cards[j].exponent = exponent;
                        }
                    }
                }
            }
            break;
    }
    return data.arr_data;
}



function fog (data, mode) {
    switch (mode) {
        case 1:
            data.battle_arr[0].effects.push(data.arr_data[0].card.ability);
            data.battle_arr[0].specials.push(data.arr_data[0].card);
            change_weather(data, 1);
            break;

        case 2:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.card.ability);
            data.battle_arr[ind].specials.push(data.card);
            change_weather(data, 1);
            break;

        case 3:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.item_history.card.ability);
            data.battle_arr[ind].specials.push(data.item_history.card);
            change_weather(data, 1);
            break;

        case 4:
            var row = ['range'];
            var exponent = 0;
            for (var i = 0; i < 2; i++) {
                for(var k = 0; k < row.length; k++){
                    for (var j = 0; j < data[i][row[k]].units_cards.length; j++) {
                        if(data[i][row[k]].units_cards[j].hero != 1 && data[i][row[k]].units_cards[j].strength != 0) {
                            data[i][row[k]].units_cards[j].exponent = exponent;
                        }
                    }
                }
            }
            break;
    }

    return data.arr_data;
}



function downpour (data, mode) {
    switch (mode) {
        case 1:
            data.battle_arr[0].effects.push(data.arr_data[0].card.ability);
            data.battle_arr[0].specials.push(data.arr_data[0].card);
            change_weather(data, 1);
            break;

        case 2:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.card.ability);
            data.battle_arr[ind].specials.push(data.card);
            change_weather(data, 1);
            break;

        case 3:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.item_history.card.ability);
            data.battle_arr[ind].specials.push(data.item_history.card);
            change_weather(data, 1);
            break;

        case 4:
            var row = ['siege'];
            var exponent = 0;
            for (var i = 0; i < 2; i++) {
                for(var k = 0; k < row.length; k++){
                    for (var j = 0; j < data[i][row[k]].units_cards.length; j++) {
                        if(data[i][row[k]].units_cards[j].hero != 1 && data[i][row[k]].units_cards[j].strength != 0) {
                            data[i][row[k]].units_cards[j].exponent = exponent;
                        }
                    }
                }
            }
            break;
    }

    return data.arr_data;
}



function clear_weather (data, mode) {
    switch (mode) {
        case 1:
            data.battle_arr[0].effects.push(data.arr_data[0].card.ability);
            data.battle_arr[0].specials.push(data.arr_data[0].card);
            change_weather(data, 2);
            break;

        case 2:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.card.ability);
            data.battle_arr[ind].specials.push(data.card);
            change_weather(data, 2);
            break;

        case 3:
            var ind = data.position;
            data.battle_arr[ind].effects.push(data.item_history.card.ability);
            data.battle_arr[ind].specials.push(data.item_history.card);
            change_weather(data, 2);
            break;

        case 4:
            var row = ['close', 'range', 'siege'];
            var exponent = 1;
            for (var i = 0; i < 2; i++) {
                for(var k = 0; k < row.length; k++){
                    for (var j = 0; j < data[i][row[k]].units_cards.length; j++) {
                        if(data[i][row[k]].units_cards[j].hero != 1 && data[i][row[k]].units_cards[j].strength != 0) {
                            data[i][row[k]].units_cards[j].exponent = exponent;
                        }
                    }
                }
            }
            break;

    }

    return data.arr_data;
}


function amount (data, mode) {
    var field_name;
    switch (mode) {
        case 1:
            field_name = get_field(data.arr_data[0].card);
            data.battle_arr[0][field_name].effects.push(data.arr_data[0].card.ability);
            break;

        case 2:
            var ind = data.position;
            field_name = get_field(data.card);
            data.battle_arr[ind][field_name].effects.push(data.card.ability);
            break;

        case 3:
            field_name = get_field(data.item_history.card);
            if(data.player_index == data.item_history.player_index){
                data.battle_arr[0][field_name].effects.push(data.item_history.card.ability);
            } else {
                if(data.player_index == -1){
                    data.battle_arr[data.item_history.player_index][field_name].effects.push(data.item_history.card.ability);
                } else {
                    data.battle_arr[1][field_name].effects.push(data.item_history.card.ability);
                }
            }
            break;

        case 4:
            var counter_h = 0;
            var counter_r = 0;
            var row = ['close', 'range', 'siege'];
            for(var m = 0; m < 2; m++) {
                for(var l = 0; l < row.length; l++){
                    if(m == 0){
                        counter_h += data[m][row[l]].units_cards.length;
                    }
                    if(m == 1) {
                        counter_r += data[m][row[l]].units_cards.length;
                    }
                }
            }
            for(var i = 0; i < 2; i++){
                for(var j = 0; j < row.length; j++){
                    for(var k = 0; k < data[i][row[j]].units_cards.length; k++) {
                        if(data[i][row[j]].units_cards[k].ability == 'amount') {
                            if(i == 0) {
                                data[i][row[j]].units_cards[k].strength = counter_h;
                            }
                            if(i == 1) {
                                data[i][row[j]].units_cards[k].strength = counter_r;
                            }
                        }
                    }
                }
            }
            break;

        case 5:
            for(var p = 0; p < data.units_cards.length; p++){
                if(data.units_cards[p].ability == 'amount') {
                    data.units_cards[p].strength = 0;
                    break;
                }
            }
            break;
    }
    return data.arr_data;
}



function theft (data, mode) {
    switch (mode) {
        case 1:
            if(data.retreat_rival.length != 0) {
                var rand = Math.round(0 - 0.5 + Math.random() * (data.retreat_rival.length - 0 + 1));
                var card = data.retreat_rival[rand];
                console.log(card);
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
                        card.strength < strength){
                        strength  = card.strength;
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
                var ind = data.position;
                var cards = data.battle_arr[ind][data.card.field_merge].units_cards;
                for(var j = 0; j < cards.length; j++){
                    if(cards[j].id == data.card.card_id_merge){
                        cards[j].ability = 'merge';
                        data.battle_arr[ind][data.card.field_merge].effects.push('merge');
                        break;
                    }
                }
            }
            var message = 'Игроком использована карта лидера';
            notice(message, 1);
            break;

        case 3:
            if(data.item_history.card.field_merge !== undefined) {
                var ind = data.position;
                var cards = data.battle_arr[ind][data.item_history.card.field_merge].units_cards;
                for(var j = 0; j < cards.length; j++){
                    if(cards[j].id == data.item_history.card.card_id_merge){
                        cards[j].ability = 'merge';
                        data.battle_arr[ind][data.item_history.card.field_merge].effects.push('merge');
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
                                    cards[k].basic = cards[k].strength;
                                }
                                cards[k].strength = cards[k - 1].strength + cards[k + 1].strength;
                            } else {
                                if(cards[k].basic !== undefined){
                                    cards[k].strength = cards[k].basic;
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
                    data.units_cards[m].strength = data.units_cards[m].basic;
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

//каждый метод должен возвращать стек карт, даже если он ничего не делал
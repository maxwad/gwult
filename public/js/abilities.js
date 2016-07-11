// Значения mode:
// 1 - непосредственный ход игрока
// 2 - обработка пришедшей карты
// 3 - обработка карты из истории
// 4 - продолжение выполнения функции

var selector;
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
    'none':            none

};

function agility (data, mode) {
    return data.arr_data;
}

function spy (data, mode) {
    switch (mode) {
        case 1:
            for(var i = 0; i < 2; i++){
                if(data.deck_complete.length > 0){
                    data.player_cards.push(data.deck_complete[0]);
                    data.deck_complete.splice(0,1);
                }
            }
            show_cards(data.player_cards.length, $('.cards'), data.player_cards, 0, '');
            var counts_data            = {};
            counts_data.user_room      = data.number_of_room;
            counts_data.player_index   = data.player_index;
            counts_data.count_cards    = data.player_cards.length;
            counts_data.count_deck     = data.deck_complete.length;
            data.socket.emit('counts', counts_data);
            break;

        case 2:
        case 3:
        case 4:
            break;
    }

    return data.arr_data;
}

function double (data, mode) {
    function clone(obj)
    {
        if(obj == null || typeof(obj) != 'object')
        {
            return obj;
        }
        var temp = {};
        for(var key in obj)
        {
            temp[key] = clone(obj[key]);
        }
        return temp;
    }

    switch (mode) {

        case 1:
            var name_card = data.arr_data[0].card.name;
            var length = data.deck_complete.length;
            var field_name;
            var selector;
            for(var i = length - 1; i >= 0; i--) {
                if(data.deck_complete[i].name == name_card) {
                    field_name = to_battlefield_home(data.deck_complete[i]);
                    data.battle_arr[0][field_name].units_cards.push(data.deck_complete[i]);
                    selector = data.battle_arr[0][field_name].row_selector + ' .cards_field';
                    length = data.battle_arr[0][field_name].units_cards.length;
                    show_cards (length, $(selector), data.battle_arr[0][field_name].units_cards, 0,'');
                    data.battle_arr[0][field_name].total = 0;
                    data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                    data.arr_data[data.arr_data.length - 1].card = data.deck_complete[i];
                    data.deck_complete.splice(i,1);
                }
            }
            length = data.player_cards.length;
            for(var j = length - 1; j >= 0; j--) {
                if(data.player_cards[j].name == name_card) {
                    field_name = to_battlefield_home(data.player_cards[j]);
                    data.battle_arr[0][field_name].units_cards.push(data.player_cards[j]);
                    selector = data.battle_arr[0][field_name].row_selector + ' .cards_field';
                    length = data.battle_arr[0][field_name].units_cards.length;
                    show_cards (length, $(selector), data.battle_arr[0][field_name].units_cards, 0,'');
                    data.battle_arr[0][field_name].total = 0;
                    data.arr_data[data.arr_data.length] = clone(data.arr_data[0]);
                    data.arr_data[data.arr_data.length - 1].card = data.player_cards[j];
                    data.player_cards.splice(j,1);
                }
            }
            show_cards(data.player_cards.length, $('.cards'), data.player_cards, 0, '');
            break;

        case 2:
        case 3:
        case 4:
            break;
    }


    return data.arr_data;
}

function dummy (data, mode) {
    return data.arr_data;
}

function execution (data, mode) {
    return data.arr_data;
}

function medic (data, mode) {
    return data.arr_data;
}

function gain (data, mode) {
    return data.arr_data;
}

function commander_horn (data, mode) {
    return data.arr_data;
}

function support (data, mode) {
    return data.arr_data;
}

function frost (data, mode) {
    return data.arr_data;
}

function fog (data, mode) {
    return data.arr_data;
}

function downpour (data, mode) {
    return data.arr_data;
}

function clear_weather (data, mode) {
    return data.arr_data;
}

function none (data, mode) {
    return data.arr_data;
}

//каждый метод должен возвращать стек карт, даже если он ничего не делал
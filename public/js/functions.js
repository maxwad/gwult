// Функция вывода сообщений

function notice (mes, type) {
    if(mes != ''){
    var message_box = $('<div class="message_box"></div>');
    $('#message_block').append(message_box);
    var color = '';
    if (type == 2) {
        color = 'rgba(190, 4, 4, 1)';
    } else {
        color = 'rgba(5, 170, 20, 1)';
    }
    message_box.html(mes).css('background', color);
    setTimeout(function(){
        message_box.fadeOut(2000,function(){
            $(this).remove();
        });
    }, 2100);
    }
}

// Клонирование объектов
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

//////////////////////////////////////////////////////////////////
// Функция сортироки колоды по силе
//////////////////////////////////////////////////////////////////
function userCompare(a,b){
    var r = 0;
    if (a.new_strength > b.new_strength) { r = -1; }
    if (a.new_strength < b.new_strength) { r = 1; }
    return r;
}


// Функция совмещает маски прокачанных и разблокированных карт с начальными картами
function get_right_card (data){

    // Прикрепляем к юнитам картинки, названия и описания их способностей
    for(var i = 0; i < data.units.length; i++){
        // Запоминаем изначальную силу карты
        data.units[i].work_strength = data.units[i].strength;
        data.units[i].new_strength = data.units[i].strength;
        for(var j = 0; j < data.abilities.length; j++){
            if(data.units[i].id_ability == data.abilities[j].id){
                data.units[i].ability      = data.abilities[j].func;
                data.units[i].name_ability = data.abilities[j].name;
                data.units[i].pict_ability = data.abilities[j].pict;
                data.units[i].desc_ability = data.abilities[j].description;
                break;
            }
        }
    }

    for(var i = 0; i < data.specials.length; i++){
        for(var j = 0; j < data.abilities.length; j++){
            if(data.specials[i].id_ability == data.abilities[j].id){
                data.specials[i].ability      = data.abilities[j].func;
                data.specials[i].name_ability = data.abilities[j].name;
                data.specials[i].pict_ability = data.abilities[j].pict;
                data.specials[i].desc_ability = data.abilities[j].description;
                break;
            }
        }
    }

    // Прикрепляем к юнитам картинки, названия и описания их классов
    for(var i = 0; i < data.units.length; i++){
        for(var j = 0; j < data.classes.length; j++){
            if(data.units[i].id_class == data.classes[j].id){
                data.units[i].pict_class = data.classes[j].pict;
                break;
            }
        }
    }

    // накладываем маску разблокированных карт на все карты
    // и формируем массивы из них
    for(var i = 0; i < data.deck_unlocked.length; i++){
        for(var j = 0; j < data.units.length; j++){
            if(data.deck_unlocked[i].id == data.units[j].id &&
                data.deck_unlocked[i].type == "U"){
                data.units[j].resolution = 1;
                break;
            }
        }
        for(var k = 0;  k < data.specials.length; k++){
            if(data.deck_unlocked[i].id == data.specials[k].id &&
                data.deck_unlocked[i].type == "S"){
                data.specials[k].resolution = 1;
                break;
            }
        }
        for(var l = 0;  l < data.leaders.length; l++){
            if(data.deck_unlocked[i].id == data.leaders[l].id &&
                data.deck_unlocked[i].type == "L"){
                data.leaders[l].resolution = 1;
                break;
            }
        }
    }

    // Накладываем маску прокачанных юнитов
    for(var i = 0; i < data.deck_upgraded.length; i++){
        for(var j = 0; j < data.units.length; j++){
            if(data.deck_upgraded[i].id == data.units[j].id){
                if(data.deck_upgraded[i].name !== undefined){
                    data.units[j].name = data.deck_upgraded[i].name;
                }
                if(data.deck_upgraded[i].id_ability !== undefined){
                    data.units[j].id_ability = data.deck_upgraded[i].id_ability;
                }
                if(data.deck_upgraded[i].description !== undefined){
                    data.units[j].description = data.deck_upgraded[i].description;
                }
                if(data.deck_upgraded[i].new_strength !== undefined){
                    data.units[j].new_strength = data.deck_upgraded[i].new_strength;
                    data.units[j].work_strength = data.deck_upgraded[i].new_strength;
                }
                break;
            }
        }
    }

    data.units.sort(userCompare);

    // сортируем карты на открытые и заблокированные
    for(var i = 0; i < data.units.length; i++){
        if(data.units[i].resolution == 1){
            data.unlocked_units.push(data.units[i]);
        } else {
            data.locked_units.push(data.units[i]);
        }
    }

    for(var i = 0; i < data.specials.length; i++){
        if(data.specials[i].resolution == 1){
            data.unlocked_specials.push(data.specials[i]);
        } else {
            data.locked_specials.push(data.specials[i]);
        }
    }

    return data;
}




// Выводит карты в область просмотра
function get_card(unit, selector){
    if(unit.type == "U") {
        var up_flag = "";
        if(unit.strength != unit.new_strength){
            up_flag = "up";
        }
        selector.append(
            $('<div/>').attr('data-id-card', unit.id)
                .attr('data-type-card', unit.type)
                .addClass('card')
                .append(
                    $('<img/>').attr({
                        'src':     "../" + unit.pict,
                        'title':   unit.name,
                        'class':   "img_card"
                    })
                )
                .append(
                    $('<div/>').
                        text(unit.new_strength)
                        .addClass('strength_card')
                        .addClass(up_flag)
                )
                .append(
                    $('<img/>').attr({
                        'src':     "../" + unit.pict_class,
                        'class':   "class_card"
                    })
                )
                .append(
                    $('<img/>').attr({
                        'src':     "../" + unit.pict_ability,
                        'class':   "ability_card"
                    })
                )
        )
    }

    if(unit.type == "S") {
        selector.append(
            $('<div/>').attr('data-id-card', unit.id)
                .attr('data-type-card', unit.type)
                .addClass('card')
                .append(
                    $('<img/>').attr({
                        'src':     "../" + unit.pict,
                        'title':   unit.name,
                        'class':   "img_card"
                    })
                )
        )
    }

    if(unit.type == "L") {
        selector.append(
            $('<div/>').attr('data-id-card', unit.id)
                .attr('data-type-card', unit.type)
                .addClass('card')
                .append(
                    $('<img/>').attr({
                        'src':     "../" + unit.pict,
                        'title':   unit.name,
                        'class':   "img_card"
                    })
                )
        )
    }

}

//////////////////////////////////////////////////////////////////
// Поиск нужной карты по id
//////////////////////////////////////////////////////////////////
function find_card (id, array) {
    var card = {};
    for(var i = 0; i < array.length; i++){
        if(array[i].id == id){
            card = clone(array[i]);
        }
    }
    return card;
}

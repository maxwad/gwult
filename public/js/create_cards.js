$(document).ready(function () {

    var message, sec_class     = '';
    var link                   = $('.tab');
    var tab_content            = $('.tab_cont');
    var type_query             = "submit";
    var data_fractions,
        data_classes,
        data_abilities,
        id_card,
        obj_card,
        id_tab,
        selector;

    $(link[0]).addClass("active_li");
    $(tab_content[0]).addClass("visible");



    //////////////////////////////////////////////////////////////////
    // функция выводит опуции select на формах и
    // отображает списки созданных карт
    //////////////////////////////////////////////////////////////////
    function create_list (rows, type, elem, class_elem) {
        $(elem).empty();
        var obj_xxx = rows;
        if (type == 1) {
            $.each(obj_xxx, function(index){
                $(elem).append(
                    $('<option value=' + obj_xxx[index].id +'>' + obj_xxx[index].name +'</option>')
                );
            });
        } else {
            $.each(obj_xxx, function(index){
                $(elem).append(
                    $('<li class=' + class_elem + ' data-id=' + obj_xxx[index].id +'>' + obj_xxx[index].name +'</li>')
                );
            });
        }
    }



    //////////////////////////////////////////////////////////////////
    // функция, преобразующая id  в соответствующий ему name
    //////////////////////////////////////////////////////////////////
    function get_name (ind, obj) {
        var name;
        $.each(obj, function(index){
            if(obj[index].id == ind) {
                name = obj[index].name;
            }
        });
        return name;
    }



    //////////////////////////////////////////////////////////////////
    // функция, перегружающая форму
    //////////////////////////////////////////////////////////////////
    function reset_form() {
        selector = "#" + id_tab + "_form button";
        $(selector).text($(selector).attr('data-text'));
        $('form').trigger("reset");
        $("#hero").prop('checked', false);
    }



    ////////////////////////////////////////////////////////////////
    // переход по вкладкам
    ////////////////////////////////////////////////////////////////
    $(link).click(function () {
        var index = $(this).index();
        link.removeClass('active_li');
        tab_content.removeClass('visible');
        $(this).addClass('active_li');
        $(tab_content[index]).addClass('visible');
    });




    ////////////////////////////////////////////////////////////////
    // запись новых или отредактированных данных в БД
    ////////////////////////////////////////////////////////////////
    $(".card form").submit(function(e) {
        var form_data = new FormData(this);
        form_data.append('type_query', type_query);
        form_data.append('id_card', id_card);
        $.ajax({
            url: "take_form",
            method: "POST",
            data: form_data,
            contentType: false,
            cache: false,
            processData:false,
            success: function(response) {
                if(response.answer == true) {
                    message = "Добавление выполнено успешно";
                    notice(message, 1);
                    reset_form();
                    selector =  "#" + id_tab + "_tab";
                    $(selector).click();
                    $(".desc_block").removeClass('desc_visible');
                    id_card = 'undefined'; // сброс переменных в начальное состояние
                    type_query = 'submit';
                } else {
                    message = "Ошибка при записи в базу данных";
                    notice(message, 2);
                    return false;
                }
            }
        });
        this.reset();
        e.preventDefault();
        return false;
    });

    ////////////////////////////////////////////////////////////////
    // заполнение форм и списков карт данными из БД
    ////////////////////////////////////////////////////////////////
    $(".tab").click(function() {
        reset_form();
        type_query = "submit";
        id_card = 'undefined';
        $('.to_cards').html("Выберите фракцию");
        id_tab = $(this).attr('id').replace('_tab','');
        var data_options = {};
        data_options.id_tab = id_tab;
        data_options.select = 0;
        if(id_tab == "units" || id_tab == "leaders" || id_tab == "specials") {
            data_options.select = 1; //признак "пришли данные для заполнения select'ов"
        }
        $.ajax({
            url: "give_me_data",
            method: "POST",
            data: data_options,
            success: function(response) {
                if(response.options_answer == true) {
                    //рез-ты запроса присваиваются глобальным переменным,
                    //т.к. эти данные будут использоваться в других обработчиках
                    data_fractions = response.data_fractions;
                    data_classes = response.data_classes;
                    data_abilities = response.data_abilities;
                    if (id_tab == "units" ||id_tab == "specials" ||id_tab == "leaders" ) {
                        create_list (response.data_fractions, 1, "select[name='id_fraction[]']");
                        create_list (response.data_classes, 1, "select[name='id_class[]']");
                        create_list (response.data_abilities, 1, "select[name='id_ability[]']");
                    }
                } else {
                    message = "Опции не пришли";
                    notice(message, 2);
                }

                if(response.data_answer == true) {
                    sec_class = "li_card";
                    if(id_tab == "units") {
                        //сначала выводится список фракций,
                        //дабы не загружать на страницу сразу все карты юнитов, имеющиеся в БД
                        response.data_rows = response.data_fractions;
                        sec_class = "prepare";
                    }
                    create_list (response.data_rows, 2, "#" + id_tab + "_list", sec_class);
                } else {
                    message = "Карты не созданы или произошла ошибка на сервере";
                    notice(message, 2);
                }
            }
        });

    });

    $('#units_tab').click();

    ////////////////////////////////////////////////////////////////
    // Вывод списка доступных фракций на первой вкладке и
    // вывод информации по конкретным картам
    ////////////////////////////////////////////////////////////////

    $(".card").on('click', '.preview li',function() {

        var data_options = {};
        id_tab = data_options.list_name = $(this).parent().attr('id').replace('_list','');
        data_options.id_query = $(this).attr('data-id');
        data_options.type_query = $(this).attr('class');
        $('.preview li').removeClass('marked');
        $(this).addClass('marked');
        reset_form();

        $.ajax({
            url: "give_me_cards",
            method: "POST",
            data: data_options,
            success: function(response) {
                if(response.data_answer == true) {
                    if (response.answer_type == 1) {
                        //если пришёл такой ответ, значит, мы на вкладке units и сперва надо построить
                        //список карт выбранной фракции
                        sec_class = "li_card";
                        create_list (response.data_rows, 2, "#units_list", sec_class);
                        $('.to_cards').html("Вернуться к фракциям");
                    } else {
                        $(".desc_block").removeClass('desc_visible');
                        var desc_block = "#" + data_options.list_name + "_desc_block";
                        $(desc_block).addClass('desc_visible');
                        var obj = obj_card = response.data_rows[0];

                        var id_to_name;
                        //заполняем html пришедшими данными
                        for (var prop in obj) {
                            var selector = "." + id_tab + "_preview .desc_" + prop + " span";
                            switch (prop) {

                                case "id":
                                    selector = "." + id_tab + "_preview .delete";
                                    $(selector).attr('data_value', obj[prop]);
                                    break;

                                case "name":
                                case "description":
                                    $(selector).empty().append(obj[prop]);
                                    break;

                                case "id_fraction":
                                    id_to_name = get_name(obj[prop], data_fractions);
                                    $(selector).empty().append(id_to_name).attr('data_value', obj[prop]);
                                    break;

                                case "id_class":
                                    id_to_name = get_name(obj[prop], data_classes);
                                    $(selector).empty().append(id_to_name).attr('data_value', obj[prop]);
                                    break;

                                case "id_ability":
                                    id_to_name = get_name(obj[prop], data_abilities);
                                    $(selector).empty().append(id_to_name).attr('data_value', obj[prop]);
                                    selector = "." + id_tab + "_preview .desc_desc_ability span";
                                    var desc_ability;
                                    $.each(data_abilities, function(index){
                                        if(data_abilities[index].id == obj.id_ability) {
                                            desc_ability = data_abilities[index].description;
                                            $(selector).empty().append(desc_ability);
                                        }
                                    });
                                    break;

                                case "pict":
                                case "pict_cover":
                                    selector = "." + id_tab + "_preview .desc_" + prop;
                                    $(selector).empty().attr('src', obj[prop]);
                                    break;

                                case "hero":
                                    if(obj[prop] == 1) {
                                        $(selector).empty().append("Да").attr('data_value', obj[prop]);
                                    } else {
                                        $(selector).empty().append("Нет").attr('data_value', obj[prop]);
                                    }
                                    break;

                                default:
                                    $(selector).empty().append(obj[prop]).attr('data_value', obj[prop]);
                            }
                        }
                    }
                } else {
                    message = "Карты не созданы или произошла ошибка на сервере";
                    notice(message, 2);
                }
            }
        });
    });

    ////////////////////////////////////////////////////////////////
    // Возвращение к фракциям на первой вкладке
    ////////////////////////////////////////////////////////////////
    $('.to_cards').click(function() {
        $('.to_cards').html("Выберите фракцию");
        $('#units_tab').click();
    });

    ////////////////////////////////////////////////////////////////
    // Редактирование карт
    ////////////////////////////////////////////////////////////////
    $('.edit').click(function() {
        type_query = "edit";
        selector = "#" + id_tab + "_form button";
        $(selector).text("Сохранить изменения");
        if(obj_card) {
            for (var prop in obj_card) {
                var selector;
                switch (prop) {

                    case "id":
                        id_card = obj_card[prop];
                        break;

                    case "id_ability":
                    case "id_fraction":
                    case "id_class":
                        selector = "#" + id_tab + "_form select[name='"+ prop + "[]'] [value='" + obj_card[prop] + "']";
                        $(selector).attr("selected", "selected");
                        break;

                    case "hero":
                        if (obj_card[prop] == 1) {
                        selector = "#" + id_tab + "_form input[name=" + prop + "]";
                        $(selector).prop('checked',true);
                        }
                        break;

                    case "description":
                    case "desc_func":
                        selector = "#" + id_tab + "_form textarea[name=" + prop + "]";
                        $(selector).empty().val(obj_card[prop]);
                        break;

                    case "pict":
                    case "pict_cover":
                        break;

                    default:
                        selector = "#" + id_tab + "_form input[name=" + prop + "]";
                        $(selector).empty().val(obj_card[prop]);
                }
            }
        }
    });


    ////////////////////////////////////////////////////////////////
    // Удаление карт
    ////////////////////////////////////////////////////////////////
    $('.delete').click(function() {

        type_query = "delete";
        var form_data = {};
        form_data.type_query = type_query;
        form_data.id_card = $(this).attr('data_value');
        form_data.name_form = id_tab;
        $.ajax({
            url: "take_form",
            method: "POST",
            data: form_data,
            success: function(response) {
                if(response.answer == true) {
                    message = "Удаление выполнено успешно";
                    notice(message, 1);
                    $(".desc_block").removeClass('desc_visible');
                    reset_form();
                    type_query = "submit";
                    selector =  "#" + id_tab + "_tab";
                    $(selector).click();
                } else {
                    message = "Ошибка при удалении из базы данных";
                    notice(message, 2);
                    return false;
                }
            }
        });
    });
});
$(document).ready(function () {

    var message     = '';
    var link = $('.tab');
    var tabContent = $('.tab_cont');
    var sec_class = "";

    $(link[0]).addClass("active_li");
    $(tabContent[0]).addClass("visible");

    //
    // функция, заполняющая списки созданных карт и доступных опций форм
    //
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
    //
    // переход по вкладкам карт
    //
    $(link).click(function () {

        var index = $(this).index();
        link.removeClass('active_li');
        tabContent.removeClass('visible');
        $(this).addClass('active_li');
        $(tabContent[index]).addClass('visible');

    });


    //
    // отправка форм для записи данных картах в БД
    //
    $(".card form").submit(function(e) {

        var form_data = new FormData(this);
        console.log(form_data);
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
                } else {
                    message = "Ошибка при записи в базу данных";
                    notice(message, 2);
                    return false;
                }
            }
        });
        this.reset();
        e.preventDefault(); //Prevent Default action.
        return false;
    });

    //
    // Вывод опций и созданных карт
    //
    $(".tab").click(function() {
        $('.to_cards').html("Выберите фракцию");
        var id_tab = $(this).attr('id').replace('_tab','');
        var data_options = {};
        data_options.id_tab = id_tab;
        data_options.classes = data_options.fractions = data_options.abilities = 0;
        switch (id_tab) {
            case "units":
                data_options.classes = data_options.fractions = data_options.abilities = 1;
                break;

            case "leaders":
                data_options.fractions = 1;
                break;

            case "specials":
                data_options.abilities = 1;
                break;
        }
        $.ajax({
            url: "give_me_data",
            method: "POST",
            data: data_options,
            success: function(response) {
                if(response.options_answer == true) {
                    if (id_tab == "units" ||id_tab == "specials" ||id_tab == "leaders" ) {
                        create_list (response.data_fractions, 1, "select[name='select_fraction[]']");
                        create_list (response.data_classes, 1, "select[name='select_class[]']");
                        create_list (response.data_abilities, 1, "select[name='select_ability[]']");
                    }
                } else {
                    message = "Опции не пришли";
                    notice(message, 2);
                }

                if(response.data_answer == true) {
                    sec_class = "li_card";
                    if(id_tab == "units") {
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

    //
    // вывод фракций на первой вкладке
    //
    $(".card").on('click', '.preview li',function() {
        var data_options = {};

        data_options.list_name = $(this).parent().attr('id').replace('_list','');
        data_options.id_query = $(this).attr('data-id');
        data_options.type_query = $(this).attr('class');



        $.ajax({
            url: "give_me_units",
            method: "POST",
            data: data_options,
            success: function(response) {
                if(response.data_answer == true) {
                    if (response.answer_type == 1) {
                        sec_class = "li_card";
                        create_list (response.data_rows, 2, "#units_list", sec_class);
                        $('.to_cards').html("Вернуться к фракциям");
                    } else {
                        console.log(response);
                    }

                } else {
                    message = "Карты не созданы или произошла ошибка на сервере";
                    notice(message, 2);
                }
            }
        });
    });

    //
    // переход к фракциям на первой вкладке
    //
    $('.to_cards').click(function() {
        $('.to_cards').html("Выберите фракцию");
        $('#units_tab').click();
    });


    //
    // вывод информации по картам
    //

});
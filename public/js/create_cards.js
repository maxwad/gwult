$(document).ready(function () {

    var message     = '';
    var link = $('.tab');
    var tabContent = $('.tab_cont');

    $(link[0]).addClass("active_li");
    $(tabContent[0]).addClass("visible");





    $(link).click(function () {

        var index = $(this).index();
        link.removeClass('active_li');
        tabContent.removeClass('visible');
        $(this).addClass('active_li');
        $(tabContent[index]).addClass('visible');

    });



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

    $(".unit_tab").click(function() {
        $("#select_class").empty();
        $("#select_fraction").empty();
        $("#select_ability").empty();
        $("#unit_list").empty();

        $.ajax({
            url: "give_me_unit",
            method: "POST",
            data: "",
            success: function(response) {
                console.log(response);
                if(response.answer == true) {
                    var obj_classes = response.classes_rows;
                    var obj_fractions = response.fractions_rows;
                    var obj_abilities = response.abilities_rows;
                    $.each(response.classes_rows, function(index, value){
                        $("#select_class").append(
                            $('<option value=' + obj_classes[index].id_class+'>' + obj_classes[index].name_class+'</option>')
                        );
                    });
                    $.each(response.fractions_rows, function(index, value){
                        $("#select_fraction").append(
                            $('<option value=' + obj_fractions[index].id_fraction+'>' + obj_fractions[index].name_fraction+'</option>')
                        );
                    });
                    $.each(response.abilities_rows, function(index, value){
                        $("#select_ability").append(
                            $('<option value=' + obj_abilities[index].id_ability+'>' + obj_abilities[index].name_ability+'</option>')
                        );
                    });
                    message = "Заполнение выполнено успешно";
                    notice(message, 1);
                } else {

                    message = "Опции не пришли";
                    notice(message, 2);
                }

                if(response.cards_answer == true) {
                    var obj_units = response.units_rows;
                    $.each(response.units_rows, function(index, value){
                        $("#unit_list").append(
                            $('<li class="card_li" data-id=' + obj_units[index].id_unit +'>' + obj_units[index].name_unit+'</option>')
                        );
                    });
                } else {
                    message = "Карты не созданы или произошла ошибка на сервере";
                    notice(message, 2);
                }
            }
        });

    }).click();

    $(".special_tab").click(function() {
        $("#ability_special").empty();

        $.ajax({
            url: "give_me_special",
            method: "POST",
            data: "",
            success: function(response) {
                if(response.answer == true) {
                    var obj_abilities = response.data_rows;
                    $.each(response.data_rows, function(index, value){
                        $("#ability_special").append(
                            $('<option value=' + obj_abilities[index].id_ability+'>' + obj_abilities[index].name_ability+'</option>')
                        );
                    });
                    message = "Опции пришли";
                    notice(message, 1);
                } else {
                    message = "Опции не пришли";
                    notice(message, 2);
                }
            }
        });

    });

});
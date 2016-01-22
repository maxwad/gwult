$(document).ready(function () {

    var create_pass     = $('#create_pass');
    var info_battles    =  $(".info_battles");
    var join_number     = $("#join_number");
    var join_pass       = $("#join_pass");
    var message         = '';

    function list_of_battle () {
        $.ajax({
            url: "give_me_battle",
            method: "POST",
            data: '',
            success: function(response) {
                if (response.answer == false) {
                    message = "У Вас нет созданных комнат.";
                    notice(message, 1);
                    $(info_battles).empty();
                } else {
                    $(info_battles).empty();
                    $(info_battles).append("<h2>Список созданных комнат</h2>" +
                        "<table><tr><td>Номер комнаты</td><td>Пароль</td><td>Действие</td><td>Ссылка</td></tr></table>");
                    $.each(response.data_rows, function(index, value){
                        var flag = "";
                        if (response.data_rows[index].start_battle == 1) {
                            flag = "(!!!)";
                        }
                        $(info_battles).children().next().append("<tr>" +
                            "<td class='numb_room'>"+response.data_rows[index].id_battle+"</td>" +
                            "<td>"+response.data_rows[index].pass_battle+"</td>" +
                            "<td><button class='del_battle'>Удалить</button></td>" +
                            "<td><button class='go_battle'>Перейти "+ flag + "</button></td>" +
                            "</tr>");
                    });
                    $(create_pass).val('');
                }
            }
        });
    }
    list_of_battle();

    //Создание игровой комнаты
    $("#create_button").click(function(e) {
        e.preventDefault();

        if (create_pass.val() == '') {
            if(confirm("Вы оставили поле пароля пустым. Вы хотите создать общедоступную игру?")){

            } else {
                return false;
            }
        }
        var user_data = {};
        user_data.pass = create_pass.val();
        user_data.date = new Date().getTime();
        $.ajax({
            url: "take_pass",
            method: "POST",
            data: user_data,
            success: function(response) {
                if (response.answer == false) {
                    message = "Не удалось создать комнату. Обновите страницу и попытайтесь снова.";
                    notice(message, 2);
                    $(create_pass).val('');
                } else {
                    list_of_battle();
                    message = "Комната успешно создана.";
                    notice(message, 1);
                }
            }
        });
    });


    // Вход в уже созданную другим игроком комнату
    $("#join_button").click(function(e) {
        e.preventDefault();
        if (join_number.val() == '') {
            join_number.addClass('incorrect');
            message = "Введите номер комнаты.";
            notice(message, 2);
            return false;
        } else { //возможно тут стоит добавить проверку на то, что введено число
            var user_data = {};
            user_data.numb = join_number.val();
            user_data.pass = join_pass.val();
            $.ajax({
                url: "join_game",
                method: "POST",
                data: user_data,
                success: function(response) {
                    switch (response.answer) {
                        case "1":
                            message = "Ошибка: Проверьте введённый номер игры.";
                            notice(message, 2);
                            join_number.addClass('incorrect');
                            break;
                        case "2":
                            message = "Ошибка: Не найдено комнаты с таким номером.";
                            notice(message, 2);
                            join_number.addClass('incorrect');
                            break;
                        case "3":
                            message = "Ошибка: Вы не можете играть сами с собой.";
                            notice(message, 2);
                            break;
                        case "4":
                            message = "Ошибка: Комната уже укомплектована игроками.";
                            notice(message, 2);
                            break;
                        case "5":
                            message = "Ошибка: Вы указали неверный пароль от комнаты.";
                            notice(message, 2);
                            break;
                        case "6":
                            message = "Ошибка: Не удалось подключится к комнате.";
                            notice(message, 2);
                            break;
                        case "7":
                            var addr_room = "/" + join_number.val();
                            window.location = addr_room;
                            break;
                    }
                }
            });
        }
    });


    //Удаление игровой комнаты
    $("body").on('click', '.del_battle', function() {

        var user_data = {};
        user_data.numb = $(this).parent().parent().find(".numb_room").text();
        $.ajax({
            url: "del_room",
            method: "POST",
            data: user_data,
            success: function(response) {
                if (response.answer == false) {
                    message = "Не удалось удалить комнату. Обновите страницу и попытайтесь снова.";
                    notice(message, 2);
                    list_of_battle();
                } else {
                    list_of_battle();
                    message = "Комната успешно удалена.";
                    notice(message, 1);
                }
            }
        });
    });


    //Переход в игровую комнату (кто должен переадресовывать: клиент или сервер?)
    $("body").on('click', '.go_battle', function() {

        var addr_room = "/" + $(this).parent().parent().find(".numb_room").text();
        window.location = addr_room;
    });

});
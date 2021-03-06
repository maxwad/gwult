$(document).ready(function () {

    var create_pass     = $('#create_pass');
    var info_battles    = $(".info_battles");
    var join_number     = $("#join_number");
    var join_pass       = $("#join_pass");
    var message         = '';
    var link            = $('.tab');
    var tab_content     = $('.tab_cont');
    var status_deck     = 0;

    function list_of_battle () {
        $.ajax({
            url: "give_me_battle",
            method: "POST",
            data: '',
            success: function(response) {
                info_battles.empty();
                if (response.answer != false) {
                    info_battles.append("<h2>Список Ваших комнат</h2>" +
                        "<table><tr><td></td><td>Комната</td><td>Пароль</td><td></td></tr></table>");
                    $.each(response.data_rows, function(index){
                        info_battles.children().next().append("<tr>" +
                            "<td><button class='del_battle' title='Удалить'></button></td>" +
                            "<td class='numb_room'>"+response.data_rows[index].id_battle+"</td>" +
                            "<td>"+response.data_rows[index].pass_battle+"</td>" +
                            "<td><button class='go_battle' title='К бою!'></button></td>" +
                            "</tr>");
                    });
                    create_pass.val('');
                }
            }
        });
    }
    list_of_battle();


    // Запрос информации о состоянии колоды игрока

    $.ajax({
        url: "deck_status",
        method: "POST",
        data: '',
        success: function(response) {
            var bg, title;
            if (response.answer == false) {
                bg = 'deck_unready';
                title = 'Ваша колода не готова к игре';
                status_deck = 0;
            } else {
                bg = 'deck_ready';
                title = 'Ваша колода готова к игре';
                status_deck = 1;
            }
            $(".status span").addClass(bg).attr('title', title);
        }
    });



    // Запрос статистики по игроку

    $.ajax({
        url: "statistics",
        method: "POST",
        data: '',
        success: function(response) {
            console.log(response);
            if(response.answer == true){
                var url,
                    scale = response.exp,
                    unscale = 100 - scale,
                    percent = 0;
                if(response.numb_of_battle != 0) {
                    percent = (response.numb_of_win*100/response.numb_of_battle).toFixed(1);
                }
                if(response.pict == '' || response.pict == null) {
                    url = "../imgs/users/noname.png";
                } else {
                    url = "../" + response.pict;
                }
                $('.username').text(response.user_name);
                $('.pict').attr('src', url);
                $('.player_level').text(response.level);
                $('.level_next').attr('title', unscale + ' exp до нового уровня!');
                $('.scale').css('width', scale + "%");
                $('.all_games').text(response.numb_of_battle).attr('title', 'Всего сыграно');
                $('.win_games').text(response.numb_of_win).attr('title', 'Побед');
                $('.percent_win').text(percent + '%').attr('title', 'Процент побед');
                if(response.level > response.old_level){
                    $('.player_level').css('box-shadow', '0 0 5px 5px #FFD550').attr('title', 'Новый уровень!');
                    $.ajax({
                        url: "update_lvl",
                        method: "POST",
                        data: '',
                        success: function() {
                        }
                    });
                }
            } else {
                var message = 'Ошибка. Попробуйте перезагрузить страницу.';
                notice(message, 2);
            }
        }
    });


    $('#upload').change(function () {
        $('.upload_pict').css('display', 'block');
    });

    ////////////////////////////////////////////////////////////////
    // запись новых или отредактированных данных в БД
    ////////////////////////////////////////////////////////////////

    $("#take_pict").submit(function(e) {
        var form_data = new FormData(this);
        form_data.append('name_form', 'users');
        $.ajax({
            url: "take_avatar",
            method: "POST",
            data: form_data,
            contentType: false,
            cache: false,
            processData:false,
            success: function(response) {
                console.log(response);
                if(response.answer == true) {
                    message = "Редактирование выполнено успешно";
                    notice(message, 1);
                    $('.upload_pict').css('display', 'none');
                    $('#join_form').trigger("reset");
                    if(response.pict == '' || response.pict == null) {
                        url = "../imgs/users/noname.png";
                    } else {
                        url = "../" + response.pict;
                    }
                    $('.pict').attr('src', url);
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


    link.click(function () {
        var index = $(this).index();
        link.removeClass('active_li');
        tab_content.removeClass('visible');
        $(this).addClass('active_li');
        $(tab_content[index]).addClass('visible');
    });


    //Создание игровой комнаты
    $("#create_button").click(function(e) {
        e.preventDefault();
        if(status_deck == 1) {
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
                        message = "У вас уже создана игровая комната.";
                        notice(message, 2);
                        create_pass.val('');
                    } else {
                        list_of_battle();
                        message = "Комната успешно создана.";
                        notice(message, 1);
                    }
                }
            });
        } else {
            message = "Ваша колода не готова к игре";
            notice(message, 2);
            return false;
        }

    });


    // Вход в уже созданную другим игроком комнату
    $("#join_button").click(function(e) {
        e.preventDefault();
        if(status_deck == 1) {
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
                                var addr_room = "/battle/" + join_number.val();
                                window.location = addr_room;
                                break;
                        }
                    }
                });
            }
        } else {
            message = "Ваша колода не готова к игре";
            notice(message, 2);
            return false;
        }

    });


    //Удаление игровой комнаты
    $(".room").on('click', '.del_battle', function() {

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


    //Переход в игровую комнату
    $("body").on('click', '.go_battle', function() {
        if(status_deck == 1) {
            var addr_room = "/battle/" + $(this).parent().parent().find(".numb_room").text();
            window.location = addr_room;
        } else {
            message = "Ваша колода не готова к игре";
            notice(message, 2);
            return false;
        }

    });

});
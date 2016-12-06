
function query(mode) {
    var data = {};
    data.option = mode;
    $.ajax({
        url: "/gamer_list",
        method: "POST",
        data: data,
        success: function(response) {
            var message, mode;
            if(response.error != 0){
                switch(response.error){
                    case 1:
                        message = "Внутренняя ошибка приложения. Попробуйте перезагрузуть страницу";
                        mode = 0;
                        break;
                    case 2:
                        message = "Соперников по заданному критерию не найдено";
                        mode = 1;
                        break;
                    case 3:
                        message = "Похоже, вы некорректно создали свою колоду карт";
                        mode = 0;
                        break;
                }
            error_handler(mode, message);
            } else {
                $('.gamers').css('display', 'table');
                $('.option_lev').css('display', 'flex');
                $('.message').remove();
                var tbody = $('.gamers tbody');
                var arr_data = response.result;
                tbody.empty();
                for(var i = 0; i < arr_data.length; i++){
                    var percent;
                    if (arr_data[i].numb_of_win != 0 && arr_data[i].numb_of_battle != 0) {
                        percent = arr_data[i].numb_of_win/arr_data[i].numb_of_battle*100;
                        percent = percent.toFixed(2);
                    } else {
                        percent = 0;
                    }
                    tbody.append(
                        $('<tr>')
                            .append($('<td>').text(i+1))
                            .append($('<td>').text(arr_data[i].user_name))
                            .append($('<td>').text(arr_data[i].level))
                            .append($('<td>').text(arr_data[i].numb_of_battle))
                            .append($('<td>').text(percent))
                            .append($('<td>').append(
                                $('<button>').attr({'class': 'join_to_battle',
                                                    'data-id-battle': arr_data[i].id_battle,
                                                    'title' : 'К бою!'}))
                            )
                    );
                }
                if(response.deck == 0){
                    $('.join_to_battle')
                        .addClass('no_deck')
                        .attr({'title': 'Вы ещё не создали колоду карт',
                               'data-id-battle': ''})
                        .removeClass('join_to_battle');
                }
            }
        }
    });
}

function error_handler (mode, msg) {
    $('.message').remove();
    var selector = '.gamers';
    if(mode == 0){
        selector = '.option_lev, .gamers';
    }
    $(selector).css('display', 'none');
    $('.container').append(
        $('<h3>').attr('class', 'message').text(msg)
    );
}

var checkUser = new CustomEvent("checkUser", {});

document.addEventListener("checkUser", function(e) {
    console.log(user_flag);
    if(user_flag == true) {
        query(1);
    } else {
        var message = 'могут видеть только авторизованные игроки';
        error_handler(0, message);
    }
});


$(document).ready(function () {

    $('input[type="radio"]').click(function(e) {
        var mode = this.value;
        query(mode);
    });

    // Вход в уже созданную другим игроком комнату
    $("body").on('click', '.join_to_battle', function() {
console.log($(this).attr('data-id-battle'));
        var user_data = {};
        user_data.numb = $(this).attr('data-id-battle');
        user_data.pass = null;
        $.ajax({
            url: "join_game",
            method: "POST",
            data: user_data,
            success: function(response) {
                console.log(response);
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
                        var addr_room = "/battle/" + user_data.numb;
                        window.location = addr_room;
                        break;
                }
            }
        });

    });
});
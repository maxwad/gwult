/**
 * Created on 19.11.15.
 */
$(document).ready(function () {

    var input       = $('input');
    var auth_name   = $('#login_name');
    var auth_pass   = $('#login_pass');
    var reg_name    = $('#reg_name');
    var reg_pass    = $('#reg_pass');
    var conf_pass   = $('#conf_pass');
    var message     = '';
    var link        = $('.tab');
    var tab_content = $('.tab_cont');

    link.click(function () {
        var index = $(this).index();
        link.removeClass('active_li');
        tab_content.removeClass('visible');
        $(this).addClass('active_li');
        $(tab_content[index]).addClass('visible');
    });



    $(input).focus(function() {
        $( this ).removeClass('incorrect');
    });

    //Забираем данные с формы авторизации

    $("#login_button").click(function(e) {
        e.preventDefault();

        var user_data = {};
        if(auth_name.val()!="") {
            user_data.name = auth_name.val();


            if(auth_pass.val()!="") {
                user_data.pass = auth_pass.val();
            } else {
                auth_pass.addClass('incorrect');
                message = "Вы не ввели пароль.";
                notice(message, 2);
                return false;
            }


        } else {
            auth_name.addClass('incorrect');
            message = "Вы не ввели имя пользователя.";
            notice(message, 2);
            return false;
        }
        $.ajax({
            url: "login",
            method: "POST",
            data: user_data,
            success: function(response) {
                if(response.answer == true) {
                    window.location = "/";
                } else {
                    auth_pass.addClass('incorrect');
                    auth_name.addClass('incorrect');
                    message = "Вы ввели неправильное имя пользователя или пароль.";
                    notice(message, 2);
                    return false;
                }
            }
        });
    });


    //Забираем данные с формы регистрации

    $("#reg_button").click(function(e) {
        e.preventDefault();
        input.removeClass('incorrect');
        var user_data = {};
        if(reg_name.val()!="") {
            user_data.name = reg_name.val();


            if(reg_pass.val()!="") {
                if(conf_pass.val()!=""){
                    if(reg_pass.val() == conf_pass.val()) {
                        user_data.pass = reg_pass.val();
                    } else {
                        conf_pass.addClass('incorrect');
                        message = "Пароли не совпадают. Попытайтесь ещё раз.";
                        notice(message, 2);
                        return false;
                    }
                } else {
                    conf_pass.addClass('incorrect');
                    message = "Подтвердите пароль.";
                    notice(message, 2);
                    return false;
                }
            } else {
                reg_pass.addClass('incorrect');
                message = "Вы не ввели желаемый пароль.";
                notice(message, 2);
                return false;
            }


        } else {
            reg_name.addClass('incorrect');
            message = "Вы не ввели желаемое имя пользователя.";
            notice(message, 2);
            return false;
        }
        $.ajax({
            url: "check_name",
            method: "POST",
            data: user_data,
            success: function(response) {
                console.log(response.answer);
                if(response.answer == true) {
                    message = "Имя доступно.";
                    notice(message, 1);
                    $('#reg_button').prop('disabled', false);
                    $.ajax({
                        url: "reg",
                        method: "POST",
                        data: user_data,
                        success: function(resp) {
                            console.log(resp.answer);
                            if(resp.answer == true) {
                                window.location = "/";
                            } else {
                                message = "Ошибка сервера. Обновите страницу и попытайтесь ещё раз.";
                                notice(message, 2);
                                return false;
                            }
                        }
                    });
                } else {
                    message = "Имя уже занято. Попробуйте другое.";
                    notice(message, 2);
                    reg_name.addClass('incorrect');
                    $('#reg_button').prop('disabled', true);
                }
            }
        });
    });


    //Проверка доступности для регистрации имени пользователя
    $(reg_name).blur(function () {
        if(reg_name.val()!="") {
            var user_data = {};
            user_data.name = reg_name.val();
            $.ajax({
                url: "check_name",
                method: "POST",
                data: user_data,
                success: function(response) {
                    console.log(response.answer);
                    if(response.answer == true) {
                        message = "Имя доступно.";
                        notice(message, 1);
                        $('#reg_button').prop('disabled', false);
                    } else {
                        message = "Имя уже занято. Попробуйте другое.";
                        notice(message, 2);
                        reg_name.addClass('incorrect');
                        $('#reg_button').prop('disabled', true);
                    }
                }
            });
        }
    });

});
/**
 * Created by Максим on 19.11.15.
 */
$(document).ready(function () {

    var input       = $('input');
    var auth_name   = $('#login_name');
    var auth_pass   = $('#login_pass');
    var reg_name    = $('#reg_name');
    var reg_pass    = $('#reg_pass');
    var conf_pass   = $('#conf_pass');



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
                return false;
            }


        } else {
            auth_name.addClass('incorrect');
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
                    console.log("ЭРРОР");
                    auth_pass.addClass('incorrect');
                    auth_name.addClass('incorrect');
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
            //ajax


            if(reg_pass.val()!="") {
                if(conf_pass.val()!=""){
                    if(reg_pass.val() == conf_pass.val()) {
                        user_data.pass = reg_pass.val();
                    } else {
                        conf_pass.addClass('incorrect');
                        return false;
                    }
                } else {
                    conf_pass.addClass('incorrect');
                    return false;
                }
            } else {
                reg_pass.addClass('incorrect');
                return false;
            }


        } else {
            reg_name.addClass('incorrect');
            return false;
        }
        $.ajax({
            url: "check_name",
            method: "POST",
            data: user_data,
            success: function(response) {
                console.log(response.answer);
                if(response.answer == true) {
                    console.log("Имя доступно");
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
                                console.log("ЭРРОР");
                                return false;
                            }
                        }
                    });
                } else {
                    console.log("Имя уже занято");
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
                        console.log("Имя доступно");
                        $('#reg_button').prop('disabled', false);
                    } else {
                        console.log("Имя уже занято");
                        reg_name.addClass('incorrect');
                        $('#reg_button').prop('disabled', true);
                    }
                }
            });
        }
    });

});
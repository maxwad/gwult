// скрипт проверяет, залогинен ли пользователь
// и хранит признак в переменной user_flag

var user_flag;


$(document).ready(function () {

    var my_page = $('.my_page span');
    $.ajax({
        url: "/check_session",
        method: "POST",
        data: "",
        success: function(response) {
            if (response.user_id == false) {
                $(my_page).text("Гость");
                user_flag = false;
            } else {
                $(my_page).text($(my_page).text() + " (" + response.username + ")");
                user_flag = true;
                $('.login_page').html('<a href="/logout" title=""><span>Выйти</span></a>');
            }

            // вызов события для страницы index.html
            if(window.checkUser !== undefined){
                document.dispatchEvent(checkUser);
            }
        }
    });

});
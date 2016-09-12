
$(document).ready(function () {

    var hello = $('.hello');
    $.ajax({
        url: "/check_session",
        method: "POST",
        data: "",
        success: function(response) {
            if (response.user_id == false) {
                $(hello).text($(hello).text()+", гость");
            } else {
                $(hello).text($(hello).text()+", "+response.username);
                $('.login_page').html('<a href="/logout" title=""><span>Выйти</span></a>');
            }
        }
    });

});
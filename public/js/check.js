$(document).ready(function () {

    var hello = $('.hello');
    $.ajax({
        url: "check_session",
        method: "POST",
        data: "",
        success: function(response) {
            if (response.answer == false) {
                $(hello).text($(hello).text()+", гость");
            } else {
                console.log(response.answer);
                $(hello).text($(hello).text()+", "+response.answer);
                $('.login_page').html('<a href="/logout" title=""><span>Выйти</span></a>');
            }
        }
    });
});
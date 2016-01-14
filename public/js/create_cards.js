$(document).ready(function () {

    var message_box = $('#message_box');
    var message = '';

    $("#create_race").click(function(e) {
        e.preventDefault();
        message = "It works!";
        message_box.empty().addClass('hide_block').text(message);
    });


    /*$.ajax({
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
    });   */
});
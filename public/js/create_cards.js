$(document).ready(function () {

    var message = '';

    $("#create_race").click(function(e) {
        e.preventDefault();
        message = "It works!";
        notice(message, 1);

    });

    $("#create_class").click(function(e) {
        e.preventDefault();
        message = "But not as it should...";
        notice(message, 2);

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
$(document).ready(function () {

    var message = '';
    function notice (mes) {
        var message_box = $('<div class="message_box"></div>');
        $('#message_block').append(message_box);
        message_box.html(mes);
        setTimeout(function(){
            message_box.fadeOut(2000,function(){
                $(this).remove();
            });
        }, 2100);
    }

    $("#create_race").click(function(e) {
        e.preventDefault();
        message = "It works!";
        notice(message);

    });

    $("#create_class").click(function(e) {
        e.preventDefault();
        message = "But not as it should...";
        notice(message);

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
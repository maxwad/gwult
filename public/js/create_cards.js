$(document).ready(function () {

    var message = '';

    $("#race_form").submit(function(e) {

        var form_data = new FormData(this);
        $.ajax({
            url: "test",
            method: "POST",
            data: form_data,
            contentType: false,
            cache: false,
            processData:false,
            success: function(response) {
                console.log(response.answer);
            }
        });
        e.preventDefault(); //Prevent Default action.
        return false;
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
/**
 * Created by Максим on 19.11.15.
 */
$(document).ready(function () {

    var user_id;
    $.ajax({
        url: "/check_session",
        method: "POST",
        data: "",
        success: function(response) {
            if (response.answer != false) {
                user_id = response.answer;
                console.log(response.answer);
                $('.login_page').html('<a href="/logout" title=""><span>Выйти</span></a>');
            } else {
                console.log('гость');
                user_id = 0;
            }
            var number_of_room = window.location.toString().replace(/\D/g,'');
            var user_data = {};
            user_data.user_id = user_id;
            user_data.user_room = number_of_room;
            socket.emit('user connect', user_data);
        }
    });

    var socket = io();


    socket.on('chat message', function(msg){
        console.log(msg);
    });

});
//функция вывода сообщений

function notice (mes, type) {
    var message_box = $('<div class="message_box"></div>');
    $('#message_block').append(message_box);
    var color = '';
    if (type == 2) {
        color = 'rgba(190, 4, 4, 1)';
    } else {
        color = 'rgba(5, 170, 20, 1)';
    }
    message_box.html(mes).css('background', color);
    setTimeout(function(){
        message_box.fadeOut(2000,function(){
            $(this).remove();
        });
    }, 2100);
}
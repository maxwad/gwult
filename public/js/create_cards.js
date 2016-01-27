$(document).ready(function () {

    var message = '';

    $("#fraction_form").submit(function(e) {

        var form_data = new FormData(this);
        $.ajax({
            url: "take_fraction",
            method: "POST",
            data: form_data,
            contentType: false,
            cache: false,
            processData:false,
            success: function(response) {
                if(response.answer == true) {
                    message = "Фракция успешно добавлена";
                    notice(message, 1);
                } else {
                    message = "Ошибка при добавлении фракции";
                    notice(message, 2);
                    return false;
                }
            }
        });
        this.reset();
        e.preventDefault(); //Prevent Default action.
        return false;
    });

    $("#class_form").submit(function(e) {

        var form_data = new FormData(this);
        $.ajax({
            url: "take_class",
            method: "POST",
            data: form_data,
            contentType: false,
            cache: false,
            processData:false,
            success: function(response) {
                if(response.answer == true) {
                    message = "Класс успешно добавлен";
                    notice(message, 1);
                } else {
                    message = "Ошибка при добавлении класса";
                    notice(message, 2);
                    return false;
                }
            }
        });
        this.reset();
        e.preventDefault(); //Prevent Default action.
        return false;
    });

});
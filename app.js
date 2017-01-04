var express        = require('express');
var session        = require('express-session');
var SessionStore   = require('express-mysql-session');
var http           = require('http');
var mysql          = require('mysql');
var connect        = require('connect');
var methodOverride = require('method-override');
var path           = require('path');
var bodyParser     = require('body-parser');
var bcrypt         = require('bcrypt-nodejs');
var fs             = require('fs');
var multer         = require('multer');
var Q              = require('q');
var socketio       = require('socket.io');

var query_to_db;
var app = express();


app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 80);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(connect.favicon());
app.use(connect.logger('dev'));
app.use(connect.json());
app.use(connect.urlencoded());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(connect.cookieParser());


var options = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gwent'
};


/////////////////////////////////////////////////////////////
// Старт сессии
/////////////////////////////////////////////////////////////
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    cookie: { maxAge: 600000000 },
    rolling: true,
    saveUninitialized: true,
    resave: true,
    store: new SessionStore(options)
}));

var connection = mysql.createConnection(options);
connection.connect();


/////////////////////////////////////////////////////////////
// Функция проверки, залогинен ли пользователь.
// Если переменная USER не определена, то проверяется объект сессии,
// данные записываются в переменную USER
/////////////////////////////////////////////////////////////
function HelloUser(req) {
    var USER = false;
        if(!('user' in req.session)) {
            console.log("1. Нет юзера в сессии");
            USER = false;
        } else {
            if (req.session.username == false) {
                console.log("2. Нет юзера в сессии");
                USER = false;
            } else {
                console.log("3. Есть юзер в сессии - " + req.session.username);
                USER = req.session.user;
            }
        }
    return USER;
}


/////////////////////////////////////////////////////////////
// Функция, которая переопределяет место записи файлов на сервере
/////////////////////////////////////////////////////////////
function getStorage() {
    var random = function() {
        return Math.floor(Math.random() * (1001));
    };
    return multer.diskStorage({
        destination: function (req, file, cb) { cb(null, 'public/imgs/' + req.body.name_form);},
        filename: function (req, file, cb) { cb(null, random() + file.originalname)}
    });
}

/////////////////////////////////////////////////////////////
// Функция, удаляющая картинки с сервера
//
// БАГ: если при редактировании картинки выбрать картинку с таким же именем,
// то картинка не отобразится, т.к. скрипт успевает скопировать новую картинку
// на сервер и только потом удаляет старую. А картинки с одинаковым именем
// просто перезаписываются. В итоге картинка заменилась и удалилась.
/////////////////////////////////////////////////////////////
function delete_pict (prop, name_table, id_card) {
    var query_to_delete = "SELECT ?? FROM ?? WHERE id=?";
    connection.query(query_to_delete, [prop, name_table, id_card], function(err, rows) {
        if (err) {
            console.log("84. Ошибка при выборе файла для удаления: " + err);
        } else {
            fs.unlink("public/" + rows[0][prop], function (err) {
                if (err) {
                    console.log("85. Ошибка при удалении файла: " + err);
                } else {
                    console.log("86. Файл успешно удалён");
                }
            });
        }
    });
}


/////////////////////////////////////////////////////////////
// Функция, которая отсылает пользователю массив данных:
// фракции, спецкарты, юниты и лидеры его фракции
/////////////////////////////////////////////////////////////
function rows_cards (result, table, id, sort) {
    var deferred = Q.defer();

    switch (table) {
        case "specials":
        case "fractions":
        case "abilities":
            query_to_db = "SELECT * FROM " + table;
            break;

        case "leaders":
        case "units":
        default:
            query_to_db = "SELECT * FROM " + table + " WHERE id_fraction IN (?, 6)" + sort;
            break;
    }
    connection.query(query_to_db, [id], function(err, rows) {
        if (err) {
            console.log("88. Ошибка при выборе карт: " + err);
            result.data_error = true;
            deferred.reject(result);
        } else {
            result.data_error = false;
            result[table] = rows;
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}


/////////////////////////////////////////////////////////////
// Функция, которая отсылает данные для меню и списки созданных карт
/////////////////////////////////////////////////////////////
function request_data(data_block, flag, obj, data_prop, answer_prop){
    var deferred = Q.defer();
    if(flag == 0) {
        query_to_db = "SELECT * FROM ?? ORDER BY id";
    } else {
        query_to_db = "SELECT ?? FROM ?? ORDER BY id";
    }
    connection.query(query_to_db, obj, function(err, rows) {
        if (err || rows.length == 0) {
            console.log("84. Ошибка при выборке данных либо записи отсутствуют: " + err);
            data_block.data_answer = false;
            deferred.reject(data_block);
        } else {
            var index = "data_" + data_prop;
            data_block[index] = rows;
            data_block[answer_prop] = true;
            deferred.resolve(data_block);
        }
    });
    return deferred.promise;
}


/////////////////////////////////////////////////////////////
// Заглушка для главной страницы
/////////////////////////////////////////////////////////////
app.get('/', function(req, res, next) {
    console.log("4. " + req.session.username);
    //res.render('index', {});
    res.redirect("/index.html");
    next();
});

/////////////////////////////////////////////////////////////
// Разлогивание пользователя
/////////////////////////////////////////////////////////////
app.get('/logout', function(req, res, next) {
    req.session.user = false;
    req.session.username = false;
    req.session.destroy(function(err) {
        if (err) {
            console.log("19. Сессия не закрыта");
            answer = false;
        } else {
            console.log("20. Сессия закрыта");
        }
    });
    res.redirect("/");
    next();
});


/////////////////////////////////////////////////////////////
// Запрос-проверка на то, залогинен ли юзер
// Если да, то продлеваем срок жизни coockie
/////////////////////////////////////////////////////////////
app.post('/check_session', function(req, res) {
    var user_id = HelloUser(req);
    if (user_id != false) {
        req.session.touch();
    }
    console.log("5. " + req.session.username);
    res.send({
        user_id: user_id,
        username: req.session.username
    });
});



/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// обработка страницы "Регистрация и авторизация"
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////
// Регистрация пользователя
/////////////////////////////////////////////////////////////
app.post('/reg', function(req, res) {

    var hash = bcrypt.hashSync(req.body.pass);
    query_to_db = "INSERT INTO users (user_name,user_pass) VALUES( ?, ?)";
    connection.query(query_to_db, [req.body.name, hash], function(err, result) {
        if (err) {
            res.send({answer:false});
            req.session.user = false;
        } else {
            req.session.user = result.insertId;
            req.session.username = req.body.name;
            res.send({answer:true});
        }
    });
});

/////////////////////////////////////////////////////////////
// Авторизация пользователя
/////////////////////////////////////////////////////////////
app.post('/login', function(req, res) {
    query_to_db = "SELECT user_pass, id FROM users WHERE user_name=?";
    connection.query(query_to_db, [req.body.name], function(err, rows) {
        if (err) {
            console.log("8. Непредвиденная ошибка авторизации");
        } else {
            if (rows.length == 0) {
                console.log('9. Такого имени не существует');
                res.send({answer:false});
            } else {
                console.log('10. Такой пользователь есть');
                console.log(rows[0].user_pass);
                var test_pass =  rows[0].user_pass;
                if(!bcrypt.compareSync(req.body.pass, test_pass)) {
                    console.log("12. Не совпадают пароли");
                    req.session.user = false;
                    res.send({answer:false});
                } else {
                    console.log("13. Пароли совпадают");
                    req.session.user = rows[0].id;
                    req.session.username = req.body.name;
                    res.send({answer:true});
                }
            }
        }
    });
});

/////////////////////////////////////////////////////////////
// Проверка на доступность никнэйма при регистрации
/////////////////////////////////////////////////////////////
app.post('/check_name', function(req, res) {
    query_to_db = "SELECT * FROM users WHERE user_name=?";
    connection.query(query_to_db, [req.body.name], function(err, rows) {
        if (err) {
            console.log("15. Ошибка при проверке наличия пользователя " + err);
            res.send({answer:false});
        } else {
            if (rows.length == 0) {
                console.log('16. не занято ' + rows);
                res.send({answer:true});
            } else {
                console.log('17. занято');
                res.send({answer:false});
            }
        }
    });
});



/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// обработка страницы "Комната пользователя"
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Проверка готовности колоды игрока
/////////////////////////////////////////////////////////////
app.post('/deck_status', function(req, res) {
    query_to_db = "SELECT * FROM card_decks WHERE id_user=?";
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        // Если ошибка, записи о пользователе нет или колода полностью не сформирована
        if (err || rows.length == 0 || rows[0].leader === null) {
            console.log("26. Ошибка при обращении к таблице колод: " + err);
            res.send({answer:false});
        } else {
            // Колода существует и полностью сформирована
            res.send({answer:true, data: rows});
        }
    });

});



/////////////////////////////////////////////////////////////
// Получение статистики по игроку
/////////////////////////////////////////////////////////////
app.post('/statistics', function(req, res) {
    query_to_db = "SELECT user_name, pict, level, old_level, exp, numb_of_battle, numb_of_win FROM users  WHERE id=?";
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        // Если ошибка, записи о пользователе нет
        if (err || rows.length == 0) {
            console.log("99. Ошибка. Такого пользователя нет: " + err);
            res.send({answer:false});
        } else {
            // Колода существует и полностью сформирована
            rows[0].answer = true;
            res.send(rows[0]);
        }
    });

});



/////////////////////////////////////////////////////////////
// Создание комнаты
/////////////////////////////////////////////////////////////
app.post('/take_pass', function(req, res) {
    query_to_db = "SELECT * FROM list_of_battles WHERE pl1=?";
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        if (err) {
            console.log("26. Ошибка при обращении к таблице игр: " + err);
            res.send({answer:false});
        } else {
            // Проверка на число созданных комнат одного пользователя
            if (rows.length < 1) {
                console.log('27. Допустимо создать комнату');
                query_to_db = "INSERT INTO list_of_battles (pl1, pass_battle, date_battle) VALUES( ?, ?, ?)";
                connection.query(query_to_db, [req.session.user, req.body.pass, req.body.date], function(err, rows) {
                    if (err) {
                        console.log("29. Ошибка при создании коматы: " + err);
                        res.send({answer:false});
                    } else {
                        res.send({answer:true});
                    }
                });
            } else {
                console.log('30. Комната уже создана');
                res.send({answer:false});
            }
        }
    });

});


/////////////////////////////////////////////////////////////
// Вывод данных о созданных комнатах пользователя
/////////////////////////////////////////////////////////////
app.post('/give_me_battle', function(req, res) {
    query_to_db = "SELECT * FROM list_of_battles WHERE pl1=?";
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        if (err ||(rows.length == 0)) {
            console.log("21. Ошибка при выводе информации о комате: " + err);
            res.send({answer:false});
        } else {
            // Проверка срока давности битвы.
            // Удаление комнат, которым больше суток
            var check_date = new Date().getTime() - rows[0].date_battle;
            if (check_date >= 1000*60*60*24) {
                query_to_db = "DELETE FROM list_of_battles WHERE pl1=?";
                connection.query(query_to_db, [req.session.user], function(err) {
                    if (err) {
                        console.log("23. Ошибка при попытке удаления устаревших комнат: " + err);
                        res.send({answer:false});
                    } else {
                        console.log("24. Устаревшие комнаты удалены");
                        res.send({answer:false});
                    }
                });
            } else {
                res.send({answer:true, data_rows:rows});
            }
        }
    });
});


/////////////////////////////////////////////////////////////
// Удаление комнаты
/////////////////////////////////////////////////////////////
app.post('/del_room', function(req, res) {
    query_to_db = "DELETE FROM list_of_battles WHERE pl1=? AND id_battle=?";
    connection.query(query_to_db, [req.session.user, req.body.numb], function(err) {
        if (err) {
            console.log("31. Ошибка при удалении комнаты: " + err);
            res.send({answer:false});
        } else {
            console.log('32. Комната успешно удалена');
            res.send({answer:true});
        }
    });

});


/////////////////////////////////////////////////////////////
// Переход в "свою" комнату
/////////////////////////////////////////////////////////////
app.post('/join_game', function(req, res) {
    query_to_db = "SELECT * FROM list_of_battles WHERE id_battle=?";
    connection.query(query_to_db, [req.body.numb], function(err, rows) {
        if (err) {
            console.log("34. Ошибка при поиске игры: " + err);
            res.send({answer:"1"});
        } else {
            if (rows.length == 1) {
                // Проверяем есть ли у игры пароль, т.е. игра приватная или общедоступная
                var row_battle = rows[0];
                if (row_battle.pl1 == req.session.user) {   //  Исключаем игру с самим собой
                    res.send({answer:"3"});
                } else {
                    if (row_battle.start_battle == 1) {   //   Проверяем, не занята ли уже комната
                        res.send({answer:"4"});
                    } else {
                        if (row_battle.pass_battle !== req.body.pass) {    //    Сверяем введённые пароли
                            console.log(row_battle.pass_battle, req.body.pass);
                            res.send({answer:"5"});
                        } else {                                         //    Заполняем таблицу
                            var alias_battle = row_battle.pl1 + "_" + req.session.user;
                            query_to_db = "UPDATE list_of_battles SET pl2=?, start_battle='1', alias_battle=? WHERE id_battle=?";
                            connection.query(query_to_db, [req.session.user, alias_battle, req.body.numb], function(err) {
                                if (err) {
                                    console.log("37. Ошибка при заполнении данных в таблице list_of_battles: " + err);
                                    res.send({answer:"6"});
                                } else {
                                    res.send({answer:"7"});
                                }
                            });
                        }
                    }
                }
            } else {
                console.log("35. Не найдено комнаты с таким номером");
                res.send({answer:"2"});
            }
        }
    });
});


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// обработка страницы "Генератор карт"
///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////
// Обработка форм: создание карт и редактирование
////////////////////////////////////////////////////////////////
app.post('/take_form', multer({ storage: getStorage() }).any(), function(req, res) {

    query_to_db         = '';
    var query_var       = [];
    var name_fields     = [];
    var value_fields    = [];
    var name_table      = req.body.name_form;
    var type_query      = req.body.type_query;
    var id_card         = req.body.id_card;
    var query_action;

    // Свойства объекта удаляются для того, чтобы они не участвовали
    // в циклической обработке объекта ниже
    delete req.body.name_form;
    delete req.body.type_query;
    delete req.body.id_card;

    // Чтобы удалить старую картинку, нужно сначала запомнить её путь,
    // иначе он будет перезаписан в процессе сохранения новых данных в БД
    if(req.files) {
        if(req.files[0] != undefined) {
            req.body.pict = (req.files[0].destination + "/" + req.files[0].filename).replace('public/','');
            if (id_card != 'undefined'){
                delete_pict ("pict", name_table, id_card);
            }
        }
        if(req.files[1] != undefined) {
            req.body.pict_cover = (req.files[1].destination + "/" + req.files[1].filename).replace('public/','');
            if (id_card != 'undefined'){
                delete_pict ("pict_cover", name_table, id_card);
            }
        }
    }

    // Данные поля hero приводится к нужному формату
    if(name_table == "units") {
        if(req.body.hero) {
            req.body.hero = true;
        } else {
            req.body.hero = false;
        }
    }

    switch (type_query) {
        case "submit":
            query_action = "INSERT INTO ";
            for (var prop in req.body) {
                name_fields.push(prop);
                value_fields.push("?");
                query_var.push(req.body[prop]);
            }
            query_to_db = query_action + name_table + " (" + name_fields + ") " + "VALUES (" + value_fields + ")";
            break;

        case "edit":
            query_action = "UPDATE ";
            for (var prop in req.body) {
                name_fields.push(prop + "=?");
                query_var.push(req.body[prop]);
            }
            query_to_db = query_action + name_table + " SET " + name_fields + " WHERE id=" + id_card;
            break;

        case "delete":
            delete_pict ("pict", name_table, id_card);
            if(name_table == "fractions") {
                delete_pict ("pict_cover", name_table, id_card);
            }
            query_action = "DELETE FROM ";
            query_to_db = query_action + name_table + " WHERE id=" + id_card;

            break;
    }

    connection.query(query_to_db, query_var, function(err) {
        if(err) {
            console.log("41. Ошибка при записи в БД: " + err);
            res.send({answer:false});
        } else {
            res.send({answer:true});
        }
    });
});


/////////////////////////////////////////////////////////////
// Заполнение форм и вывод карт
/////////////////////////////////////////////////////////////
app.post('/give_me_data', function(req, res) {
    query_to_db         = '';
    var data_block      = {};
    data_block.options_answer   = true;
    request_data(data_block, 0, [req.body.id_tab], 'rows', 'data_answer').
        then(function(result) { return request_data(result, 1, [['id', 'name'], 'classes'], 'classes', 'options_answer')}).
        then(function(result) { return request_data(result, 1, [['id', 'name'], 'fractions'], 'fractions', 'options_answer')}).
        then(function(result) { return request_data(result, 1, [['id', 'name', 'description'], 'abilities'], 'abilities', 'options_answer')}).
        then(function(result) { res.send(result); }).
        catch(function(result) { res.send(result); }).
        done();
});


/////////////////////////////////////////////////////////////
// Вывод запрошенных карт
/////////////////////////////////////////////////////////////
app.post('/give_me_cards', function(req, res) {
    query_to_db         = '';
    var query_var       = [];
    var data_block      = {};
    data_block.data_answer   = true;

    if(req.body.type_query == "prepare") {
        query_to_db = "SELECT id, name FROM units WHERE id_fraction = ? ORDER BY strength, name";
        query_var = [req.body.id_query];
        data_block.answer_type   = 1;
    } else {
        query_to_db = "SELECT * FROM ?? WHERE id = ?";
        query_var = [req.body.list_name , req.body.id_query];
        data_block.answer_type   = 2;
    }
    connection.query(query_to_db, query_var, function(err, rows) {
        if (err) {
            console.log("81. Ошибка при выборе данных из БД: " + err);
            data_block.data_answer = false;
            res.send(data_block);
        } else {
            if(rows.length > 0) {
                console.log('82. Данные выбраны успешно');
                data_block.data_rows = rows;

            } else {
                console.log('83. В таблице отсутствуют записи');
                data_block.data_answer = false;
            }
            res.send(data_block);
        }
    });
});


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// обработка страницы "Генератор колод"
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////
//Получаем начальные данные из БД
/////////////////////////////////////////////////////////////
app.post('/initial', function(req, res) {

    var data_block      = {};
    var deck_user       = {};
    // Получаем id пользователя
    function get_user_id () {
        var deferred = Q.defer();
        query_to_db = "SELECT id FROM users WHERE user_name = ?";
        connection.query(query_to_db, [req.session.username], function(err, rows) {
            if (err || rows.length == 0) {
                console.log("84. Ошибка при поиске юзера в БД: " + err);
                data_block.user_error = true;
                deferred.reject(data_block);
            } else {
                data_block.id_user = rows[0].id;
                deferred.resolve(data_block.id_user);
            }
        });
        return deferred.promise;
    }


    // Проверяем наличие колод у пользователя
    function check_user_deck (result) {
        var deferred = Q.defer();
        query_to_db = "SELECT * FROM card_decks WHERE id_user = ?";
        connection.query(query_to_db, [result], function(err, rows) {
            if (err) {
                console.log("85. Ошибка при поиске юзера в БД: " + err);
                data_block.user_error = true;
                deferred.reject(data_block);
            } else {
                if(rows.length != 0) {
                // признак "Пользователь есть в таблице"
                    deck_user = rows[0];
                    data_block.deck_user = deck_user;
                    deferred.resolve(-1);
                } else {
                    deferred.resolve(result);
                }
            }
        });
        return deferred.promise;
    }

    // заносим пользователя в таблицу, если его там не было
    // и берём данные из таблицы, если он там уже был
    function insert_user_deck (result) {
        var deferred = Q.defer();
        if(result == -1) {
            deferred.resolve(data_block);
        } else {
            query_to_db = "INSERT INTO card_decks (id_user, id_fraction) VALUES (?, '-1')";
            connection.query(query_to_db, [result], function(err) {
                if (err) {
                    console.log("86. Ошибка при записи юзера в БД: " + err);
                    data_block.user_error = true;
                    deferred.reject(data_block);
                } else {
                    deck_user.id_fraction   = -1;
                    deck_user.specials      = null;
                    deck_user.units         = null;
                    deck_user.leader        = '';
                    data_block.deck_user    = deck_user;
                    deferred.resolve(data_block);
                }
            });
        }
        return deferred.promise;
    }

    // Если пользователь авторизован - запускаем
    if(req.session.user !== undefined) {
        data_block.user = true;

        get_user_id().
            then(function(result) { return check_user_deck(result) }).
            then(function(result) { return insert_user_deck(result) }).
            then(function(result) { return rows_cards(result, "fractions") }).
            then(function(result) { return rows_cards(result, "abilities")}).
            then(function(result) { return rows_cards(result, "units", deck_user.id_fraction, " ORDER BY strength DESC") }).
            then(function(result) { return rows_cards(result, "leaders", deck_user.id_fraction,"") }).
            then(function(result) { return rows_cards(result, "specials") }).
            then(function(result) { res.send(result); }).
            catch(function(result) { res.send(result); }).
            done();
    } else {
        data_block.user = false;
        res.send(data_block);
    }
});


/////////////////////////////////////////////////////////////
// Обработка запроса на изменение текущей фракции
/////////////////////////////////////////////////////////////
app.post('/give_me_fraction', function(req, res) {
    var data_block      = {};
    rows_cards(data_block, "units", req.body.fraction, " ORDER BY strength DESC").
        then(function(result) { return rows_cards(result, "leaders", req.body.fraction,"") }).
        then(function(result) { res.send(result); }).
        catch(function(result) { res.send(result); }).
        done();
});


/////////////////////////////////////////////////////////////
// Обновление колоды пользователя
/////////////////////////////////////////////////////////////
app.post('/update_deck', function(req, res) {
    query_to_db = "UPDATE card_decks SET id_fraction=?, units=?, specials=?, leader=? WHERE id_user=?";
    var data_obj = [
        req.body.id_fraction,
        req.body.units,
        req.body.specials,
        req.body.leader,
        req.body.id_user
    ];
    connection.query(query_to_db, data_obj, function(err) {
        if (err) {
            console.log("87. Ошибка при обновлении колоды: " + err);
            res.send({update_error:true});
        } else {
            console.log('88. Колода успешно обновлена');
            res.send({update_error:false});
        }
    });
});




/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// Обработка главной страницы
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

app.post('/gamer_list', function(req, res) {
    var data_block = {};
    data_block.error = 0;
    var user_id = HelloUser(req);
    var sign = "";
    if(user_id != false) {
        switch (parseInt(req.body.option)){
            case 1:
                sign = "AND users.level>=? AND users.level<=?+2 ";
                break;

            case 2:
                sign = "AND users.level=? ";
                break;

            case 3:
                sign = "AND users.level>? AND users.level<=?+2 ";
                break;
        }
        function get_user_lvl () {
           var deferred = Q.defer();
            query_to_db = "SELECT level FROM users WHERE id = ?";
            connection.query(query_to_db, [user_id], function(err, rows) {
                if (err || rows.length == 0) {
                    console.log("97. Ошибка при поиске юзера в БД: " + err);
                    data_block.error = 1;
                    deferred.reject(data_block);
                } else {
                    data_block.user_level = rows[0].level;
                    deferred.resolve(data_block);
                }
            });
            return deferred.promise;
        }

        function get_battle (data) {
            var deferred = Q.defer();
            query_to_db = "SELECT list_of_battles.id_battle, users.user_name, users.numb_of_battle, users.numb_of_win, users.level FROM list_of_battles, users WHERE list_of_battles.pl1<>? AND list_of_battles.pl1=users.id AND list_of_battles.pass_battle='' AND list_of_battles.start_battle='0' " + sign + "ORDER BY users.level ASC LIMIT 10";
            connection.query(query_to_db, [user_id, data_block.user_level, data_block.user_level], function(err, rows) {
                if (err || rows.length == 0) {
                    console.log("98. Свободных беспарольных битв нет: " + err);
                    data.error = 2;
                    deferred.reject(data);
                } else {
                    data.result = rows;
                    deferred.resolve(data);
                }
            });
            return deferred.promise;
        }

        // Проверяем наличие колод у пользователя
        function check_user_deck (data) {
            var deferred = Q.defer();
            query_to_db = "SELECT * FROM card_decks WHERE id_user = ?";
            connection.query(query_to_db, [user_id], function(err, rows) {
                if (err) {
                    console.log("85. Ошибка при поиске юзера в БД: " + err);
                    data.error = 3;
                    deferred.reject(data);
                } else {
                    if(rows.length != 0 && rows[0].id_fraction != -1) {
                            // признак "У пользователя есть готовая колода"
                            data.deck = 1;
                            deferred.resolve(data);
                    } else {
                        // признак "У пользователя нет готовой колоды"
                        data.deck = 0;
                        deferred.resolve(data);
                    }
                    res.send(data);
                }
            });
            return deferred.promise;
        }


        get_user_lvl().
            then(function(result) { return get_battle(result) }).
            then(function(result) { return check_user_deck(result) }).
            catch(function(result) { res.send(result); }).
            done();
    }
});




/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// Обработка игровой комнаты
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
var gwent   = http.createServer(app);
var io      = socketio(gwent);
var rooms   = {};
var decks   = {};
var history = {};



/////////////////////////////////////////////////////////////
// Подключение к игровой комнате
/////////////////////////////////////////////////////////////
app.get('/battle/:id', function(req, res) {
    res.render('battle');
});


/////////////////////////////////////////////////////////////
// Подключение к игровой комнате сокетов
/////////////////////////////////////////////////////////////
io.on('connection', function(socket) {


    /////////////////////////////////////////////////////////////
    // Подключение к игровой комнате, сортировка на зрителей и игроков
    /////////////////////////////////////////////////////////////
    socket.on('user connect', function(user_data) {
        // Каждая битва проходит в "комнате".
        // Комната - это дочерний объект глобального объекта rooms.
        // Данные о колодах игроков находятся в аналогичных
        // "отделениях" глобального объекта decks.
        var room = "room_" + user_data.user_room;
        var user_id = user_data.user_id;
        if(!rooms[room]) {
            rooms[room]                     = {};
            rooms[room].complete            = 0;
            rooms[room].players             = [];
            rooms[room].units               = [];
            rooms[room].leaders             = [];
            rooms[room].listeners           = [];
            rooms[room].send_to_listeners   = 0;
            decks[room]                     = [];
            history[room]                   = {};
            history[room].cards             = [];
            history[room].count_cards       = [10, 10];
            history[room].count_deck        = [0, 0];
            history[room].ready_status      = [0, 0];
            history[room].resolution        = [1, 0];
            history[room].give_up_status    = [0, 0];
            history[room].round             = 1;
            history[room].mes_flag          = 0;

        }
        // Если не все игроки подключились к комнате
        if (rooms[room].complete != 2) {
            var deck_player;
            var data_player = {};

            // Получаем данные из таблицы битв
            query_to_db = "SELECT * FROM list_of_battles WHERE id_battle =?";
            connection.query(query_to_db, [user_data.user_room], function(err, rows) {
                if (err || rows.length == 0) {
                    console.log("89. Ошибка при обращении к таблице битв: " + err);
                    rooms[room].data_error = 2;
                    socket.emit('battle is not exist');
                } else {
                    rooms[room].data_error = false;
                    // Определяем роль юзера: игрок 1, игрок 2 или зритель
                    var player;
                    socket.join(room);
                    if(rows[0].pl1 !== null && rows[0].pl1 == user_id) {
                        player = 1;
                    } else {
                        if(rows[0].pl2 !== null && rows[0].pl2 == user_id) {
                            player = 2;
                        } else {
                            player = 0;
                            rooms[room].listeners.push({ user_id : user_id, socket_id : socket.id });
                            console.log("Добавлен зритель");
                            socket.to(room).emit('rivals are not complete');
                        }
                    }
                    if (player != 0) {

                        // Функция выбирает данные из таблицы колод
                        function select_user_deck (result) {
                            var deferred = Q.defer();
                            query_to_db = "SELECT * FROM card_decks WHERE id_user = ?";
                            connection.query(query_to_db, [user_id], function(err, rows) {
                                if (err || rows.length == 0) {
                                    console.log("90. Ошибка при поиске юзера в БД: " + err);
                                    result.data_error = 1;
                                    // Сообщаем юзеру, что у него не создана колода
                                    socket.emit('user without deck');
                                    deferred.reject(result);
                                } else {
                                    deck_player = rows[0];
                                    deferred.resolve(result);
                                }
                            });
                            return deferred.promise;
                        }

                        // Функция формирует объект игрока
                        function initial_player (player, rows, obj, socket) {
                            var deferred = Q.defer();
                            var pl, bg, leader;
                            obj.complete = 2;
                            if(player == 1) {
                                pl = rows[0].pl1;
                                bg = true;
                            } else {
                                pl = rows[0].pl2;
                                bg = false;
                            }
                            obj.units[player - 1]   = data_player.units;
                            for (var index = 0; index < data_player.leaders.length; index++) {
                                if(data_player.leaders[index].id == deck_player.leader) {
                                    obj.leaders[player - 1] = data_player.leaders[index];
                                }
                            }

                            obj.players[player - 1] = { user_id   : pl,
                                user_name : user_data.user_name,
                                socket_id : socket.id,
                                beginners : bg      };
                            decks[room][player - 1] = deck_player;
                            console.log("Добавлен игрок");
                            for (var i = 0; i < 2; i++) {
                                if (obj.players[i] === undefined) {
                                    obj.complete = obj.complete - 1;
                                }
                            }
                            deferred.resolve(obj);
                            return deferred.promise;
                        }

                        // Функция отправляет данные подключённым сокетам
                        function send_info (socket, obj){
                            var deferred = Q.defer();
                            if(obj.complete == 2){
                                obj.send_to_listeners = 1;
                                io.to(obj.players[0].socket_id).emit('take data', [obj, decks[room][0], history[room]]);
                                io.to(obj.players[1].socket_id).emit('take data', [obj, decks[room][1], history[room]]);
                                // отменяем техническое поражение, если игрок переподключился в срок
                                socket.broadcast.to(room).emit('clear timeout');
                            } else {
                                socket.to(room).emit('rivals are not complete');
                            }
                            deferred.resolve(obj);
                            return deferred.promise;
                        }

                        select_user_deck(rooms[room]).
                            then(function(result) { return rows_cards(rooms[room], "abilities")}).
                            then(function(result) { return rows_cards(rooms[room], "specials") }).
                            then(function(result) { return rows_cards(rooms[room], "fractions") }).
                            then(function(result) { return rows_cards(data_player, "units", deck_player.id_fraction, " ORDER BY strength DESC") }).
                            then(function(result) { return rows_cards(data_player, "leaders", deck_player.id_fraction,"") }).
                            then(function(result) { return initial_player(player, rows, rooms[room], socket) }).
                            then(function(result) { return send_info(socket, rooms[room]) }).
                            catch(function(result) { console.log(result); }).
                            done();
                    }
                }
            });
        } else {
            if (user_id != rooms[room].players[0].user_id && user_id != rooms[room].players[1].user_id){
                rooms[room].listeners.push({ user_id : user_id, socket_id : socket.id });
                console.log("Добавлен зритель.");
                socket.join(room);
                socket.emit('take data', [rooms[room], history[room]]);
            } else {
                var old_socket, i;
                if (user_id == rooms[room].players[0].user_id) {
                    i = 0;
                } else {
                    i = 1;
                }
                old_socket = rooms[room].players[i].socket_id;
                rooms[room].players[i].socket_id = socket.id;
                socket.id = old_socket;
                socket.leave(room);
                io.to(socket.id).emit('go home');
                socket.id = rooms[room].players[i].socket_id;
            }
        }

        /////////////////////////////////////////////////////////////
        // Обработка отключения игроков
        /////////////////////////////////////////////////////////////
        socket.on('disconnect', function() {
            var finded = 0;
            for(var i = 0; i < rooms[room].players.length; i++) {
                if(rooms[room].players[i] !== undefined &&
                    rooms[room].players[i].user_id == user_id &&
                    rooms[room].players[i].socket_id == socket.id) {

                    rooms[room].players[i] = undefined;
                    rooms[room].send_to_listeners = 0;
                    rooms[room].complete--;
                    finded = 1;
                    console.log("Игрок удалён");
                    io.to(room).emit('player out', [user_id, history[room].cards.length]);
                    socket.leave(room);
                    // Запись истории в БД
                    if(rooms[room].complete == 0 && history[room] !== undefined){
                        query_to_db = "UPDATE history SET pl1=(SELECT pl1 FROM list_of_battles WHERE id_battle = ?), pl2=(SELECT pl2 FROM list_of_battles WHERE id_battle = ?), history = ? WHERE id = ?";
                        var hist_battle = JSON.stringify(history[room]);
                        var query_var = [user_data.user_room, user_data.user_room, hist_battle, user_data.user_room];
                        connection.query(query_to_db, query_var, function(err, rows) {
                            if (err || rows.length == 0) {
                                console.log("95. Лог игры не записан: " + err);
                            } else {
                                console.log("96. Лог успешно записан");
                            }
                        });
                    }
                }
            }
            if(finded == 0) {
                for(var j = 0; j < rooms[room].listeners.length; j++) {
                    if(rooms[room].listeners[j].user_id == user_id) {
                        rooms[room].listeners.splice(j, 1);
                        socket.leave(room);
                        console.log("Зритель удалён");
                        break;
                    }
                }
            }

            // Чистка мусора
            if(rooms[room].complete == 0 &&
                rooms[room].listeners.length == 0 &&
                rooms[room] !== undefined) {
                delete decks[room];
                delete rooms[room];
                delete history[room];
            }
        });
    });

    /////////////////////////////////////////////////////////////
    // Проверка готовности игроков к игре
    /////////////////////////////////////////////////////////////
    socket.on('player ready', function(user_data) {
        var room = "room_" + user_data.user_room;
        var player_index = user_data.player_index;
        history[room].ready_status[player_index] = 1;
        if (history[room].ready_status[0] == 1 && history[room].ready_status[1] == 1) {
            io.to(rooms[room].players[0].socket_id).emit('start battle', [history[room].resolution, history[room].mes_flag]);
            io.to(rooms[room].players[1].socket_id).emit('start battle', [history[room].resolution, history[room].mes_flag]);
            history[room].mes_flag++;
        } else {
            io.to(rooms[room].players[player_index].socket_id).emit('second player is not ready');
        }
    });

    /////////////////////////////////////////////////////////////
    // Запись данных по количеству карт у игрока на руках и в колоде
    /////////////////////////////////////////////////////////////
    socket.on('counts', function(user_data) {
        var room = "room_" + user_data.user_room;
        if(user_data.player_index != -1) {
            history[room].count_cards[user_data.player_index] = user_data.count_cards;
            history[room].count_deck[user_data.player_index]  = user_data.count_deck;
        }
        var data = {};
        data.count_cards = history[room].count_cards;
        data.count_deck  = history[room].count_deck;
        io.to(room).emit('take counts', data);
    });

    /////////////////////////////////////////////////////////////
    // Обработка и перенаправление карт игрокам и зрителям
    /////////////////////////////////////////////////////////////
    socket.on('step to', function(user_data) {
        var room;
        for(var i = 0; i < user_data.length; i++) {
            room = "room_" + user_data[i].user_room;
            console.log(user_data[i].user_room);
            history[room].cards.push(user_data[i]);
            if(user_data[i].resolution == 1) {
                history[room].resolution[user_data[i].player_index] = 1;
                history[room].resolution[user_data[i].rival_index] = 0;
            }
            if(user_data[i].resolution == 0){
                history[room].resolution[user_data[i].player_index] = 0;
                history[room].resolution[user_data[i].rival_index] = 1;
            }
        }

        socket.broadcast.to(room).emit('step from', user_data);
    });

    /////////////////////////////////////////////////////////////
    // Обработка кнопки "ПАС"
    /////////////////////////////////////////////////////////////
    socket.on('give up', function(user_data) {
        var room = "room_" + user_data.user_room;
        var data = {};
        history[room].give_up_status[user_data.player_index] = 1;
        history[room].count_cards[user_data.player_index] = user_data.count_cards;
        history[room].resolution[user_data.player_index] = 0;
        history[room].resolution[user_data.rival_index] = 1;
        if(history[room].give_up_status[0] == 1 && history[room].give_up_status[1] == 1) {
            delete data.give_up;
            history[room].cards.push('give_up');
            history[room].give_up_status = [0, 0];
            history[room].round++;
            switch (history[room].round) {
                case 2:
                    history[room].resolution = [0, 1];
                    break;

                case 3:
                    history[room].resolution = [1, 0];
                    break;

                case 4:
                    history[room].resolution = [0, 1];
                    history[room].round = 1;
                    break;

            }
            data.count_cards    = history[room].count_cards;
            data.resolution     = history[room].resolution;
            data.round          = history[room].round;
            data.player         = user_data.player_index;
            io.to(room).emit('won is', data);
        } else {
            data.give_up = 1;
            data.player  = user_data.player_index;
            socket.broadcast.to(room).emit('won is', data);
        }
    });

    /////////////////////////////////////////////////////////////
    // Запись результатов игры в БД и сигнал окончания игры
    /////////////////////////////////////////////////////////////
    socket.on('results', function(user_data) {
        var query_var = '';

        function user_stat (user_data) {
            var deferred = Q.defer();
            query_var = [user_data.win, user_data.exp, user_data.id];
            query_to_db = "UPDATE users SET numb_of_battle = numb_of_battle + 1, " +
                "numb_of_win = numb_of_win + ?, exp = exp + ? WHERE id = ?";
            connection.query(query_to_db, query_var, function(err, rows) {
                if (err || rows.length == 0) {
                    console.log("91. Ошибка при поиске юзера в БД: " + err);
                    deferred.reject(user_data.err = 1);
                } else {
                    console.log("92. Результат успешно записан");
                    deferred.resolve(user_data);
                }
            });
            return deferred.promise;
        }

        function write_history (user_data) {
            var deferred = Q.defer();
            if(user_data.exp > 1) {
                query_to_db = "INSERT INTO history (id) VALUES(?) ON DUPLICATE KEY UPDATE id=?";
                query_var = [user_data.room, user_data.room];
                connection.query(query_to_db, query_var, function(err) {
                    if (err) {
                        console.log("93. Попытка вставки неуникального значения: " + err);
                        deferred.reject(user_data.err = 2);
                    } else {
                        console.log("94. Результат игры успешно записан");
                        deferred.resolve(user_data);
                    }
                });
            }
            return deferred.promise;
        }

        function game_over (user_data) {
            var deferred = Q.defer();
            var room = "room_" + user_data.room;
            history[room].cards.push('game_over');
            deferred.resolve(user_data);
            return deferred.promise;
        }

        function delete_battle (user_data) {
            var deferred = Q.defer();
            query_to_db = "DELETE FROM list_of_battles WHERE id_battle=?";
            query_var = [user_data.room];
            connection.query(query_to_db, query_var, function(err) {
                if (err) {
                    console.log("95. Ошибка при попытке удаления комнаты: " + err);
                    deferred.reject(user_data.err = 3);
                } else {
                    console.log("96. Отыгранная комната удалена");
                    deferred.resolve(user_data);
                }
            });
            return deferred.promise;
        }

        user_stat (user_data).
            then(function(user_data){ return write_history (user_data) }).
            then(function(user_data){ return game_over (user_data) }).
            then(function(user_data){ return delete_battle (user_data) }).
            catch(function(user_data) { console.log(user_data.err); }).
            done();

    });

});

gwent.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

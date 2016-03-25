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
    return multer.diskStorage({
        destination: function (req, file, cb) { cb(null, 'public/imgs/' + req.body.name_form);},
        filename: function (req, file, cb) { cb(null, file.originalname)}
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
    console.log(query_to_db);
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
            console.log('66. Данные выбраны успешно');
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
    res.render('index', {});
    next();
});

/////////////////////////////////////////////////////////////
// Разлогивание пользователя
/////////////////////////////////////////////////////////////
app.get('/logout', function(req, res, next) {
    req.session.user = false;
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
    var answer = HelloUser(req);
    if (answer != false) {
        req.session.touch();
    }
    console.log("5. " + req.session.username);
    res.send({answer:answer});
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
    console.log("6. " + query_to_db);
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
    console.log("7. " + query_to_db);
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
    console.log("14. " + query_to_db);
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
// Создание комнаты
/////////////////////////////////////////////////////////////
app.post('/take_pass', function(req, res) {
    query_to_db = "SELECT * FROM list_of_battles WHERE pl1=?";
    console.log("25. " + query_to_db);
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        if (err) {
            console.log("26. Ошибка при обращении к таблице игр: " + err);
            res.send({answer:false});
        } else {
            // Проверка на число созданных комнат одного пользователя
            if (rows.length < 3) {
                console.log('27. Допустимо создать ещё комнату');
                query_to_db = "INSERT INTO list_of_battles (pl1, pass_battle, date_battle) VALUES( ?, ?, ?)";
                console.log("28. " + query_to_db);
                connection.query(query_to_db, [req.session.user, req.body.pass, req.body.date], function(err, rows) {
                    if (err) {
                        console.log("29. Ошибка при создании коматы: " + err);
                        res.send({answer:false});
                    } else {
                        res.send({answer:true});
                    }
                });
            } else {
                console.log('30. Уже создано максимальное количество комнат');
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
    console.log("20. " + query_to_db);
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        if (err ||(rows.length == 0)) {
            console.log("21. Ошибка при выводе информации о комате: " + err);
            res.send({answer:false});
        } else {
            console.log("22. " + rows[0].id_battle + "  " + rows[0].pass_battle + "  " + rows[0].date_battle);
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
    console.log("31. " + query_to_db);
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
    console.log("33. " + query_to_db);
    connection.query(query_to_db, [req.body.numb], function(err, rows, fields) {
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
                        if (row_battle.pass_battle != req.body.pass) {    //    Сверяем введённые пароли
                            res.send({answer:"5"});
                        } else {                                         //    Заполняем таблицу
                            var alias_battle = row_battle.pl1 + "_" + req.session.user;
                            query_to_db = "UPDATE list_of_battles SET pl2=?, start_battle='1', alias_battle=? WHERE id_battle=?";
                            console.log("36. " + query_to_db);
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

    console.log("40. " + query_to_db);
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
    console.log(req.body.id_tab);
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
    console.log("80. " + query_to_db);
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
// обработка игровой комнаты
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////
var gwent = http.createServer(app);
var io = socketio(gwent);


// Функция формирует объект игрока
function initial_player (player, rows, obj, socket, deck_player, data_player) {
    var deferred = Q.defer();
    var pl, bg, units, leader;
    if(player == 1) {
        pl = rows[0].pl1;
        bg = true;
    } else {
        pl = rows[0].pl2;
        bg = false;
    }
    units = data_player.units;
    for (var index = 0; index < data_player.leaders.length; index++) {
        if(data_player.leaders[index].id == deck_player.leader) {
            leader = data_player.leaders[index];
        }
    }
    delete data_player;
    console.log(data_player);
    console.log(units);
    console.log(leader);
    if (obj.players.length < 2) {
        obj.players.push({
            user_id : pl,
            socket_id : socket.id,
            beginners : bg,
            deck : deck_player,
            units: units,
            leader: leader
        });
    }
    obj.complete =  obj.players.length;
    console.log("+++++++++++++");
    console.log(obj.players);
    console.log(obj.complete);
    console.log(obj.listeners);
    console.log("+++++++++++++");
    deferred.resolve(obj);
    return deferred.promise;
}


app.get('/battle/:id', function(req, res) {
    res.render('battle');
});

var rooms = {};
io.on('connection', function(socket) {

    socket.on('user connect', function(user_data) {
        var room = "room_" + user_data.user_room;
        if(!rooms[room]) {
            rooms[room] = {};
            rooms[room].complete = 0;
            rooms[room].players = [];
            rooms[room].listeners = [];
        }
        if (rooms[room].complete != 2) {
            var deck_player;
            var data_player = {};


            // Функция выбирает кданные из таблицы колод
            function select_user_deck (result, user_data) {
                var deferred = Q.defer();
                query_to_db = "SELECT * FROM card_decks WHERE id_user = ?";
                connection.query(query_to_db, [user_data.user_id], function(err, rows) {
                    if (err || rows.length == 0) {
                        console.log("90. Ошибка при поиске юзера в БД: " + err);
                        result.data_error = true;
                        deferred.reject(result);
                    } else {
                        deck_player = rows[0];
                        deferred.resolve(result);
                    }
                });
                return deferred.promise;
            }


            query_to_db = "SELECT * FROM list_of_battles WHERE id_battle =?";
            connection.query(query_to_db, [user_data.user_room], function(err, rows) {
                if (err) {
                    console.log("89. Ошибка при обращении к таблице битв: " + err);
                    rooms[room].data_error = true;
                } else {
                    rooms[room].data_error = false;
                    var player;
                    if(rows[0].pl1 !== null && rows[0].pl1 == user_data.user_id) {
                        player = 1;
                    } else {
                        if(rows[0].pl2 !== null && rows[0].pl2 == user_data.user_id) {
                            player = 2;
                        } else {
                            player = 0;
                            rooms[room].listeners.push({ user_id : user_data.user_id, socket_id : socket.id });
                            console.log("+++++++++++++");
                            console.log(rooms[room].players);
                            console.log(rooms[room].complete);
                            console.log(rooms[room].listeners);
                            console.log("+++++++++++++");
                        }
                    }
                    if (player != 0) {
                        select_user_deck(rooms[room], user_data).
                            then(function(result) { return rows_cards(rooms[room], "abilities")}).
                            then(function(result) { return rows_cards(rooms[room], "specials") }).
                            then(function(result) { return rows_cards(data_player, "units", deck_player.id_fraction, " ORDER BY strength DESC") }).
                            then(function(result) { return rows_cards(data_player, "leaders", deck_player.id_fraction,"") }).
                            then(function(result) { return initial_player(player, rows, rooms[room], socket, deck_player, data_player) }).
                            catch(function(result) { console.log(result); }).
                            done();
                    }
                }
            });
        } else {
            if (user_data.user_id != rooms[room].players[0].user_id && user_data.user_id != rooms[room].players[1].user_id){
                rooms[room].listeners.push({ user_id : user_data.user_id, socket_id : socket.id });
                console.log("+++++++++++++");
                console.log(rooms[room].players);
                console.log(rooms[room].complete);
                console.log(rooms[room].listeners);
                console.log("+++++++++++++");
            }
        }







        socket.broadcast.emit('chat message', '');
    });
    console.log('connected', socket.id);
});

gwent.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

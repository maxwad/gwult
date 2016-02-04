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
var multer         = require('multer');

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


//        стартуем сессию
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


// функция проверки, залогинен ли пользователь
// если переменная USER не определена, то проверяется объект сессии
// данные записываются в переменную USER
function HelloUser(req) {
    var USER = false;
        if(!('user' in req.session)) {
            console.log("1. нет юзера в сессии");
            USER = false;
        } else {
            if (req.session.user == false) {
                console.log("2. нет юзера в сессии");
                USER = false;
            } else {
                console.log("3. есть юзер в сессии - "+req.session.user);
                USER = req.session.user;
            }
        }
    return USER;
}

// функция, которая переопределяет место записи файлов на сервере

function getStorage() {
    return multer.diskStorage({
        destination: function (req, file, cb) { cb(null, 'public/imgs/'+req.body.name_form);},
        filename: function (req, file, cb) { cb(null, file.originalname)}
    });
}


app.get('/', function(req, res, next) {
    console.log("4. "+req.session.user);
    res.render('index', {});
    next();
});

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


//        обрабатываем AJAX-запросы со страниц
//        запрос-проверка на то, залогинен ли юзер
app.post('/check_session', function(req, res, next) {
    var answer = HelloUser(req);
    if (answer != false) {
        req.session.touch();
    }
    console.log("5. "+req.session.user);
    res.send({answer:answer});
});



/////////////////////////////////////////////////////////////
// обработка страницы "Регистрация и авторизация"
/////////////////////////////////////////////////////////////



//       запрос на регистрацию юзера
app.post('/reg', function(req, res) {

    var hash = bcrypt.hashSync(req.body.pass);
    query_to_db = "INSERT INTO users (user_name,user_pass) VALUES( ?, ?)";
    console.log("6. "+query_to_db);
    connection.query(query_to_db, [req.body.name, hash], function(err) {
        if (err) {
            res.send({answer:false});
            req.session.user = false;
        } else {
            req.session.user = req.body.name;
            res.send({answer:true});
        }
    });
});

//       запрос на авторизацию юзера
app.post('/login', function(req, res) {
    query_to_db = "SELECT user_pass FROM users WHERE user_name=?";
    console.log("7. "+query_to_db);
    connection.query(query_to_db, [req.body.name], function(err, rows, fields) {
        if (err) {
            console.log("8. Непредвиденная ошибка авторизации");
        } else {
            if (rows.length == 0) {
                console.log('9. такого имени не существует');
                res.send({answer:false});
            } else {
                console.log('10. есть такой пользователь');
                console.log(rows[0].user_pass);
                var test_pass =  rows[0].user_pass;
                console.log("11. "+test_pass);
                if(!bcrypt.compareSync(req.body.pass, test_pass)) {
                    console.log("12. Не совпадают"+test_pass+" + "+req.body.pass);
                    req.session.user = false;
                    res.send({answer:false});
                } else {
                    console.log("13. Cовпадают"+test_pass+" + "+req.body.pass);
                    req.session.user = req.body.name;
                    res.send({answer:true});
                }
            }
        }
    });
});

//           запрос на проверку вакантности никнейма
app.post('/check_name', function(req, res) {
    query_to_db = "SELECT * FROM users WHERE user_name=?";
    console.log("14. "+query_to_db);
    connection.query(query_to_db, [req.body.name], function(err, rows, fields) {
        if (err) {
            console.log("15. Ошибка при проверке наличия пользователя "+err);
            res.send({answer:false});
        } else {
            if (rows.length == 0) {
                console.log('16. не занято '+rows);
                res.send({answer:true});
            } else {
                console.log('17. занято');
                res.send({answer:false});
            }
        }
    });
});


/////////////////////////////////////////////////////////////
// обработка страницы "Комната пользователя"
/////////////////////////////////////////////////////////////

//         запрос на создание комнаты
app.post('/take_pass', function(req, res) {

    query_to_db = "SELECT * FROM list_of_battles WHERE pl1=?";
    console.log("25. "+query_to_db);
    connection.query(query_to_db, [req.session.user], function(err, rows, fields) {
        if (err) {
            console.log("26. Ошибка при обращении к таблице игр: "+err);
            res.send({answer:false});
        } else {
            // проверка на число созданных комнату одного пользователя
            if (rows.length < 3) {
                console.log('27. Допустимо создать ещё комнату');
                query_to_db = "INSERT INTO list_of_battles (pl1, pass_battle, date_battle) VALUES( ?, ?, ?)";
                console.log("28. "+query_to_db);
                connection.query(query_to_db, [req.session.user, req.body.pass, req.body.date], function(err, rows) {
                    if (err) {
                        console.log("29. Ошибка при создании коматы: "+err);
                        res.send({answer:false});
                    } else {
                        res.send({answer:true});
                    }
                });
            } else {
                console.log('30. Уже создано 3 комнаты - максимальное количество');
                res.send({answer:false});
            }
        }
    });

});



//         запрос на вывод игры пользователя
app.post('/give_me_battle', function(req, res) {
    query_to_db = "SELECT * FROM list_of_battles WHERE pl1=?";
    console.log("20. "+query_to_db);
    connection.query(query_to_db, [req.session.user], function(err, rows) {
        if (err ||(rows.length == 0)) {
            console.log("21. Ошибка при выводе информации о комате: "+err);
            res.send({answer:false});
        } else {
            console.log("22. "+rows[0].id_battle+"  "+rows[0].pass_battle+"  "+rows[0].date_battle);
            //         проверка срока давности битвы
            var check_date = new Date().getTime() - rows[0].date_battle;
            if (check_date >= 1000*60*60*24) {
                query_to_db = "DELETE FROM list_of_battles WHERE pl1=?";
                connection.query(query_to_db, [req.session.user], function(err, rows) {
                    if (err) {
                        console.log("23. Ошибка при попытке удаления устаревших комнат: "+err);
                        res.send({answer:false});
                    } else {
                        console.log("24. Устаревшие комнаты удалены");
                        res.send({answer:false});
                    }
                });
            } else {
                res.send({answer:true, data_rows:rows});
                //res.send({answer:true, id_battle:rows[0].id_battle, pass_battle:rows[0].pass_battle});
            }
        }
    });
});

//         запрос на удаление комнаты
app.post('/del_room', function(req, res) {

    query_to_db = "DELETE FROM list_of_battles WHERE pl1=? AND id_battle=?";
    console.log("31. "+query_to_db);
    connection.query(query_to_db, [req.session.user, req.body.numb], function(err, rows, fields) {
        if (err) {
            console.log("31. Ошибка при удалении комнаты: "+err);
            res.send({answer:false});
        } else {
            console.log('32. Комната успешно удалена');
            res.send({answer:true});
        }
    });

});

//         запрос на переход в "свою" комнату
app.post('/join_game', function(req, res) {

    query_to_db = "SELECT * FROM list_of_battles WHERE id_battle=?";
    console.log("33. "+query_to_db);
    connection.query(query_to_db, [req.body.numb], function(err, rows, fields) {
        if (err) {
            console.log("34. Ошибка при поиске игры: "+err);
            res.send({answer:"1"});
        } else {
            if (rows.length == 1) {
                //проверяем есть ли у игры пароль, т.е. игра приватная или общедоступная
                var row_battle = rows[0];
                if (row_battle.pl1 == req.session.user) {   //  исключаем игру с самим собой
                    res.send({answer:"3"});
                } else {
                    if (row_battle.start_battle == 1) {   //   проверяем, не занята ли уже комната
                        res.send({answer:"4"});
                    } else {
                        if (row_battle.pass_battle != req.body.pass) {    //    сверяем введённые пароли
                            res.send({answer:"5"});
                        } else {                                         //    заполняем таблицу
                            var alias_battle = row_battle.pl1 + "_" + req.session.user;
                            query_to_db = "UPDATE list_of_battles SET pl2=?, start_battle='1', alias_battle=? WHERE id_battle=?";
                            console.log("36. "+query_to_db);
                            connection.query(query_to_db, [req.session.user, alias_battle, req.body.numb], function(err, rows, fields) {
                                if (err) {
                                    console.log("37. Ошибка при заполнении данных в таблице list_of_battles: "+err);
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
// обработка страницы "Генератор карт"
/////////////////////////////////////////////////////////////


//         Добавление карт и способностей

app.post('/take_form', multer({ storage: getStorage() }).any(), function(req, res) {

    query_to_db = '';
    var path_pict = '';
    var path_cover = '';
    var hero_flag = '';
    var query_var = [];

    if(req.files[0] != undefined) {
        path_pict = (req.files[0].destination + "/" + req.files[0].filename).replace('public/','');
    }
    if(req.files[1] != undefined) {
        path_cover = (req.files[1].destination + "/" + req.files[1].filename).replace('public/','');
    }

    if(req.body.hero) {
        hero_flag = true;
    } else {
        hero_flag = false;
    }

    switch (req.body.name_form) {
        case "units":
            query_to_db = "INSERT INTO unit_cards (name_unit, id_fraction_unit, id_class_unit, strength_unit, id_ability_unit, hero_unit, pict_unit, description_unit) VALUES( ?, ?, ?, ?, ?, ?, ?, ?)";
            query_var = [req.body.name_unit, req.body.select_fraction, req.body.select_class, req.body.strength_unit, req.body.select_ability, hero_flag, path_pict, req.body.description_unit];
            break;

        case "specials":
            query_to_db = "INSERT INTO special_cards (name_special, function_special, pict_special, description_special) VALUES( ?, ?, ?, ?)";
            query_var = [req.body.name_special, req.body.ability_special, path_pict, req.body.description_special];
            break;

        case "leaders":
            query_to_db = "INSERT INTO leader_cards (name_leader, function_leader, desc_func_leader, pict_leader, description_leader) VALUES( ?, ?, ?, ?, ?)";
            query_var = [req.body.name_leader, req.body.function_leader, req.body.desc_func_leader, path_pict, req.body.description_leader];
            break;

        case "classes":
            query_to_db = "INSERT INTO classes (name_class, pict_class, description_class) VALUES( ?, ?, ?)";
            query_var = [req.body.name_class, path_pict, req.body.description_class];
            break;

        case "abilities":
            query_to_db = "INSERT INTO abilities (name_ability, name_function, pict_ability, description_ability) VALUES( ?, ?, ?, ?)";
            query_var = [req.body.name_ability, req.body.function_ability, path_pict, req.body.description_ability];
            break;

        case "fractions":
            query_to_db = "INSERT INTO fractions (name_fraction, ability_fraction, pict_fraction, pict_fraction_cover, description_fraction) VALUES( ?, ?, ?, ?, ?)";
            query_var = [req.body.name_fraction, req.body.ability_fraction, path_pict, path_cover, req.body.description_fraction];
            break;

        default:
            console.log("38. Не найдено такой формы");
    }

    console.log("40. "+query_to_db);
    connection.query(query_to_db, query_var, function(err, rows, fields) {
        if(err) {
            console.log("41. Ошибка при записи в БД: " + err);
            res.send({answer:false});
        } else {
            res.send({answer:true});
        }
    });

});


//         запрос заполнение формы "Специальные карты"
app.post('/give_me_special', function(req, res) {

    query_to_db = "SELECT id_ability, name_ability FROM abilities";
    console.log("42. "+query_to_db);
    connection.query(query_to_db, function(err, rows, fields) {
        if (err) {
            console.log("43. Ошибка при выборе способностей: "+err);
            res.send({answer:false});
        } else {
            if(rows.length > 0) {
                console.log('44. Способности выбраны успешно');
                res.send({answer:true, data_rows:rows});
            } else {
                console.log('45. Не найдено ни одной способности');
                res.send({answer:false});
            }
        }
    });

});

app.post('/give_me_unit', function(req, res) {
    var data_block = {};
    query_to_db = "SELECT id_class, name_class FROM classes";
    console.log("46. "+query_to_db);
    connection.query(query_to_db, function(err, rows, fields) {
        if (err) {
            console.log("47. Ошибка при выводе классов: "+err);
            res.send(data_block.answer = false);
        } else {
            if(rows.length > 0) {
                console.log('48. Классы успешно обработаны');
                data_block.classes_rows = rows;


                query_to_db = "SELECT id_fraction, name_fraction FROM fractions";
                console.log("50. "+query_to_db);
                connection.query(query_to_db, function(err, rows, fields) {
                    if (err) {
                        console.log("51. Ошибка при выводе фракций: "+err);
                        res.send(data_block.answer = false);
                    } else {
                        if(rows.length > 0) {
                            console.log('52. Фракции успешно обработаны');
                            data_block.fractions_rows = rows;


                            query_to_db = "SELECT id_ability, name_ability FROM abilities";
                            console.log("53. "+query_to_db);
                            connection.query(query_to_db, function(err, rows, fields) {
                                if (err) {
                                    console.log("54. Ошибка при выборе способностей: "+err);
                                    res.send(data_block.answer = false);
                                } else {
                                    if(rows.length > 0) {
                                        console.log('55. Способности выбраны успешно');
                                        data_block.abilities_rows = rows;
                                        data_block.answer = true;


                                        query_to_db = "SELECT id_unit, name_unit FROM unit_cards ORDER BY id_fraction_unit, strength_unit";
                                        console.log("57. "+query_to_db);
                                        connection.query(query_to_db, function(err, rows, fields) {
                                            if (err) {
                                                console.log("58. Ошибка при выборе юнитов: "+err);
                                                res.send(data_block.cards_answer = false);
                                            } else {
                                                if(rows.length > 0) {
                                                    console.log('59. Юниты выбраны успешно');
                                                    data_block.units_rows = rows;
                                                    data_block.cards_answer = true;
                                                    res.send(data_block);
                                                } else {
                                                    console.log('56. Не найдено ни одного юнита');
                                                    data_block.cards_answer = false;
                                                    res.send(data_block);
                                                }
                                            }
                                        });


                                    } else {
                                        console.log('56. Не найдено ни одной способности');
                                        res.send(data_block.answer = false);
                                    }
                                }
                            });



                        } else {
                            console.log('49. Не найдено данных о фракциях');
                            res.send(data_block.answer = false);
                        }
                    }
                });


            } else {
                console.log('49. Не найдено данных о классах');
                res.send(data_block.answer = false);
            }
        }
    });

});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
/**
 * Created by amalyuhin on 15.07.14.
 */

var mongojs = require("mongojs");
var vkApi = require("../lib/vkApi");
var vk = new vkApi();

var databaseUrl = "admin:masterkey@localhost/friends_updater";
var collections = ["users"];

var db = mongojs.connect(databaseUrl, collections, function(){
    console.log("Connected  "+db);
});

module.exports.controller = function(app) {

    app.get('/user/:id', function (req, res) {
        var callback = function (data, error) {
            if (error) {
                console.log('Error:', error);
            }

            if (data && data.response.length > 0) {
                console.log(data.response[0]);
                res.render('user', data.response[0]);
            }
        };

        vk.request('users.get', { user_id: req.params.id, fields: 'photo_100,online' }, callback);
    });

    app.get('/user/:id/friends', function (req, res) {
        var callback = function (data, error) {
            if (error) {
                console.log('Error:', error);
            }

            if (data && data.response) {
                //res.render('user', data.response);
            }
        };

        vk.request('friends.get', { user_id: req.params.id }, callback);
    });

//    app.get('/wines', function (req, res) {
//        res.send([
//            {name: 'wine1'},
//            {name: 'wine2'}
//        ]);
//    });
//    app.get('/wines/:id', function (req, res) {
//        res.send({id: req.params.id, name: "The Name", description: "description"});
//    });
//
//    app.get('/test', function (req, res) {
//        var callback = function (response, error) {
//            if (error) {
//                console.log('Error:', error);
//            }
//
//            if (response) {
//                console.log('Ok:', response);
//            }
//        };
//
//        vk.request('users.get', { user_id: '2839118' }, callback);
//        //    var options = {
//        //        host: 'api.vk.com',
//        //        port: 80,
//        //        path: '/method/friends.get?user_id=2839118&v=5.23',
//        //        method: 'GET'
//        //    };
//        //
//        //    http.get(options, function(response) {
//        //        console.log('STATUS: ' + response.statusCode);
//        //        console.log('HEADERS: ' + JSON.stringify(response.headers));
//        //        response.setEncoding('utf8');
//        //
//        //        var result = '';
//        //
//        //
//        //        response.on('data', function (data) {
//        //            result += data;
//        //        });
//        //
//        //        response.on('end', function() {
//        //            var json = JSON.parse(result);
//        //            if (json.response ) {
//        //                db.users.save({_id: "2839118", first_name: "Тамара", last_name: "Хайрова", friends: [{created_at: new Date(), count: json.response.count, items: json.response.items}]}, function(err, saved) {
//        //                    if( err || !saved ) {
//        //                        res.send({error: "User not saved", message: err});
//        //                    } else {
//        //                        res.send({success: "User saved"});
//        //                    }
//        //                });
//        //            }
//        //        });
//        //    });
//    });
//
//    app.get('/add/:id', function (req, res) {
//        db.users.findOne({
//            _id: mongojs.ObjectId('asd2')
//        }, function (err, doc) {
//            res.send({asd: doc});
//        });
//
//        //    var options = {
//        //        host: 'api.vk.com',
//        //        port: 80,
//        //        path: '/method/users.get?user_id=' + req.params.id,
//        //        method: 'GET'
//        //    };
//        //
//        //    http.request(options, function(response) {
//        //        console.log('STATUS: ' + response.statusCode);
//        //        console.log('HEADERS: ' + JSON.stringify(response.headers));
//        //        response.setEncoding('utf8');
//        //        response.on('data', function (data) {
//        //            var result = {};
//        //            var json = JSON.parse(data);
//        //            if (json.response && json.response.length == 1) {
//        //                var user = json.response[0];
//        //                if (user.id) {
//        //                    var options2 = {
//        //                        host: 'api.vk.com',
//        //                        port: 80,
//        //                        path: '/method/friends.get?user_id=' + user.id,
//        //                        method: 'GET'
//        //                    };
//        //
//        //                    http.request(options2, function(response2) {
//        //                        response2.setEncoding('utf8');
//        //                        response2.on('data', function (data2) {
//        //                            if (data2.response) {
//        //                                db.users.save({_id: user.id, first_name: user.first_name, last_name: user.last_name, friends: [{created_at: new Date(), count: data2.response.count}]}, function(err, saved) {
//        //                                    if( err || !saved ) {
//        //                                        res.send({error: "User not saved", message: err});
//        //                                    } else {
//        //                                        res.send({success: "User saved"});
//        //                                    }
//        //                                });
//        //                            }
//        //                        });
//        //                    });
//        //                }
//        //
//        //                result = { status: 'success', message: user.first_name + ' ' + user.last_name };
//        //            } else {
//        //                result = { status: 'error', message: 'Error!' };
//        //            }
//        //
//        //            res.send(result);
//        //        });
//        //    }).end();
//        //
//        //    db.users.save({email: "srirangan@gmail.com", password: "iLoveMongo", sex: "male"}, function(err, saved) {
//        //        if( err || !saved ) {
//        //            res.send({error: "User not saved", message: err});
//        //        } else {
//        //            res.send({success: "User saved"});
//        //        }
//        //    });
//    });
}
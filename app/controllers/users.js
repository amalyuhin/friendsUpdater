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
    function arr_diff(a1, a2)
    {
        var a=[], diff=[];
        for(var i=0;i<a1.length;i++)
            a[a1[i]]=true;
        for(var i=0;i<a2.length;i++)
            if(a[a2[i]]) delete a[a2[i]];
            else a[a2[i]]=true;
        for(var k in a)
            diff.push(k);
        return diff;
    }

    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

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

    app.get('/user/:id/remove', function (req, res) {
        db.users.remove({ "_id" : req.params.id, "friends[1].created_at" : "Wed Jul 30 21:15:44 NOVT 2014"});
    });

    app.get('/user/:id/update', function (req, res) {
        var uid = req.params.id;

        db.users.findOne({ "_id" : uid}, function (err, doc) {
            if (err) {
                console.log("Error: " + err);
            }

            if (!doc) {
                console.log("Error: User does not exist.");
            } else {
                var fOld = doc.friends[0].items;
                var fNew = doc.friends[doc.friends.length-1].items;

                var addedFriends = fNew.diff(fOld);
                var removedFriends = fOld.diff(fNew);
                var now = new Date();

                db.users.update(
                    { "_id": uid },
                    { $push: { added: {created_at: now, items: addedFriends} } }
                );

                db.users.update(
                    { "_id": uid },
                    { $push: { removed: {created_at: now, items: removedFriends} } }
                );

                vk.request('users.get', { user_ids: addedFriends }, function (data, error) {
                    console.log("Added: ", data);

                    vk.request('users.get', { user_ids: removedFriends }, function (data2, error2) {
                        console.log("Removed: ", data2);
                    });
                });

//                var firstDate = new Date();
//                var secondDate = new Date();
//
//                firstDate.setHours(0, 0, 0, 0);
//                secondDate.setHours(23, 59, 59, 59);
//
//                console.log(firstDate, secondDate);
//
//                db.users.findOne({ "friends.created_at": { $gte: firstDate, $lt: secondDate } }, function (err, doc1) {
//                   console.log(doc1);
//                   if (!doc1) {
//                       vk.request('friends.get', { user_id: uid }, function (data, error) {
//                           db.users.update(
//                               { "_id": uid },
//                               { $push: { friends: {created_at: new Date(), count: data.response.count, items: data.response.items} } }
//                           );
//                       });
//                   }
//                });
            }
        });
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
//        //            if (json.response ) {//        //
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
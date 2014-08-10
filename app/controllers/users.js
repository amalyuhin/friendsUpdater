/**
 * Created by amalyuhin on 15.07.14.
 */

var mongojs = require("mongojs");
var moment = require('moment');
var vkApi = require("../lib/vkApi");
var vk = new vkApi();

var databaseUrl = "admin:masterkey@localhost/friends_updater";
var collections = ["users"];

var db = mongojs.connect(databaseUrl, collections, function(){
    console.log("Connected  "+db);
});

module.exports.controller = function(app) {

    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    app.get('/user/:id', function (req, res) {
        var uid = req.params.id;
        var profile = null;
        var users = [];

        db.users.findOne({ "_id" : uid}, function (err, doc) {
            if (err) {
                console.log("Error: " + err);
            }

            if (!doc) {
                console.log("Error: User does not exist.");
            } else {
                profile = doc;
                profile.id = parseInt(doc._id);
                var ids = [profile.id];

                for (var i in doc.added) {
                    if (doc.added.hasOwnProperty(i)) {
                        ids = ids.concat(doc.added[i].items);
                    }
                }

                for (var j in doc.removed) {
                    if (doc.added.hasOwnProperty(j)) {
                        ids = ids.concat(doc.removed[j].items);
                    }
                }

                var callback = function (data, error) {
                    if (error) {
                        console.log('Error:', error);
                    }

                    if (data && data.response.length > 0) {
                        for (var key in data.response) {
                            if (data.response.hasOwnProperty(key)) {
                                var item = data.response[key];
                                users[item.id] = item;
                            }
                        }
                    }

                    res.render('user', { profile: profile, users: users, moment: moment });
                };

                vk.request('users.get', { user_ids: ids.join(','), fields: 'photo_100,photo_50,online' }, callback);
            }
        });
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

    app.get('/user/:id/update', function (req, res) {
        var uid = req.params.id;

        db.users.findOne({ "_id" : uid}, function (err, doc) {
            if (err) {
                console.log("Error: " + err);
            }

            if (!doc) {
                console.log("Error: User does not exist.");
            } else {

                vk.request('friends.get', { user_id: uid }, function (data, error) {
                    var fOld = doc.friends[doc.friends.length-1].items;
                    var fNew = data.response.items;
                    var addedFriends = fNew.diff(fOld);
                    var removedFriends = fOld.diff(fNew);
                    var now = new Date();

                    if (addedFriends.length > 0 || removedFriends.length > 0) {
                        db.users.update(
                            { "_id": uid },
                            { $push: { friends: {created_at: now, count: data.response.count, items: data.response.items} } }
                        );

                        if (addedFriends.length > 0) {
                            db.users.update(
                                { "_id": uid },
                                { $push: { added: {created_at: now, items: addedFriends} } }
                            );

                            vk.request('users.get', { user_ids: addedFriends }, function (addedData, error) {
                                console.log("Added: ", addedData);
                            });
                        }

                        if (removedFriends.length > 0) {
                            db.users.update(
                                { "_id": uid },
                                { $push: { removed: {created_at: now, items: removedFriends} } }
                            );

                            vk.request('users.get', { user_ids: removedFriends }, function (removedData, error2) {
                                console.log("Removed: ", removedData);
                            });
                        }
                    } else {
                        console.log("No changes.")
                    }

                });
            }
        });
    });

}
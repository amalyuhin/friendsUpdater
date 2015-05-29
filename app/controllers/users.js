var vkApi = require("../lib/vkApi");
var vk = new vkApi();

var controller = {};

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

controller.getInfo = function(req, res, next) {
    var uid = req.params.id;

    try {
        req.db.users.findOne({ "_id" : uid}, function (err, doc) {
            if (err) {
                return res.json( { status: 'error', error: err } );
            }

            if (!doc) {
                return res.json( { status: 'error', error: { message: 'User does not exist' }} );
            } else {
                var profile = doc;
                profile.id = parseInt(doc._id);
                delete profile._id;

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
                        return res.json( { status: 'error', error: error } );
                    }

                    var users = {};
                    if (data && data.response.length > 0) {
                        for (var key in data.response) {
                            if (data.response.hasOwnProperty(key)) {
                                var item = data.response[key];

                                if (item.id == profile.id) {
                                    for (var index in item) {
                                        profile[index] = item[index];
                                    }
                                } else {
                                    users[item.id] = data.response[key]
                                }
                            }
                        }
                    }

                    return res.json({ profile: profile, users: users });
                };

                vk.request('users.get', { user_ids: ids.join(','), fields: 'photo_100,photo_50,online' }, callback);
            }
        });
    } catch (e) {
        return res.json( { status: 'error', error: e } );
    }
};

controller.getUser = function(req, res, next) {
    var uid = req.params.id;

    var callback = function(data, error) {
        if (error) {
            return res.json( { status: 'error', error: error } );
        }


        if (data && data.response.length > 0) {
            return res.json({ user: data.response[0] });
        }

        return res.json( { status: 'error', error: { message: 'No user data' } } );
    };

    vk.request('users.get', { user_ids: [uid], fields: 'photo_100,photo_50,online' }, callback);
};


controller.updateFriends = function (req, res, next) {
    var uid = req.params.id;
    var result = { added: [], removed: [] };

    req.db.users.findOne({"_id": uid}, function (err, doc) {
        if (err) {
            console.log("Error: " + err);
        }

        if (!doc) {
            console.log("Error: User does not exist.");
        } else {

            vk.request('friends.get', {user_id: uid}, function (data, error) {
                var fOld = doc.friends[doc.friends.length - 1].items;
                var fNew = data.response.items;
                var addedFriends = fNew.diff(fOld);
                var removedFriends = fOld.diff(fNew);
                var now = new Date();

                if (addedFriends.length > 0 || removedFriends.length > 0) {
                    req.db.users.update(
                        {"_id": uid},
                        {$push: {friends: {created_at: now, count: data.response.count, items: data.response.items}}}
                    );

                    var userIds = [];
                    var push = {};

                    if (addedFriends.length > 0) {
                        push.added = { created_at: now, items: addedFriends };
                        userIds = userIds.concat(addedFriends);
                    }

                    if (removedFriends.length > 0) {
                        push.removed = { created_at: now, items: removedFriends };
                        userIds = userIds.concat(removedFriends);
                    }

                    req.db.users.update({"_id": uid}, {$push: push});

                    vk.request('users.get', {user_ids: userIds}, function (users, err) {
                        if (err) {
                            return next(err);
                        }

                        if (users && users.response.length) {
                            for (var i = 0; i < users.response.length; i++) {
                                var user = users.response[i];

                                if (addedFriends.indexOf(user.id) > -1) {
                                    result.added.push(user);
                                }

                                if (removedFriends.indexOf(user.id) > -1) {
                                    result.removed.push(user);
                                }
                            }

                            return res.json({ response: result });

                        } else {
                            console.log('vk api response empty', users);
                        }
                    });

                } else {
                    return res.json({ response: result });
                }

            });
        }
    });
};

module.exports = controller;

//module.exports.controller = function(app) {
//
//    Array.prototype.diff = function(a) {
//        return this.filter(function(i) {return a.indexOf(i) < 0;});
//    };
//
//    app.get('/user/:id', function (req, res) {
//        var uid = req.params.id;
//        var profile = null;
//        var users = [];
//
//        try {
//            db.users.findOne({ "_id" : uid}, function (err, doc) {
//                if (err) {
//                    return res.json( { status: 'error', error: err } );
//                }
//
//                if (!doc) {
//                    return res.json( { status: 'error', error: { message: 'User does not exist' }} );
//                } else {
//                    profile = doc;
//                    profile.id = parseInt(doc._id);
//                    var ids = [profile.id];
//
//                    for (var i in doc.added) {
//                        if (doc.added.hasOwnProperty(i)) {
//                            ids = ids.concat(doc.added[i].items);
//                        }
//                    }
//
//                    for (var j in doc.removed) {
//                        if (doc.added.hasOwnProperty(j)) {
//                            ids = ids.concat(doc.removed[j].items);
//                        }
//                    }
//
//                    var callback = function (data, error) {
//                        if (error) {
//                            return res.json( { status: 'error', error: error } );
//                        }
//
//                        if (data && data.response.length > 0) {
//                            for (var key in data.response) {
//                                if (data.response.hasOwnProperty(key)) {
//                                    var item = data.response[key];
//                                    users[item.id] = item;
//                                }
//                            }
//                        }
//
//                        return res.json({ profile: profile, users: users, moment: moment });
//                    };
//
//                    vk.request('users.get', { user_ids: ids.join(','), fields: 'photo_100,photo_50,online' }, callback);
//                }
//            });
//        } catch (e) {
//            return res.json( { status: 'error', error: e } );
//        }
//
//    });
//
//    app.get('/user/:id/friends', function (req, res) {
//        var callback = function (data, error) {
//            if (error) {
//                console.log('Error:', error);
//            }
//
//            if (data && data.response) {
//                //res.render('user', data.response);
//            }
//        };
//
//        vk.request('friends.get', { user_id: req.params.id }, callback);
//    });
//
//    app.get('/user/:id/update', function (req, res) {
//        var uid = req.params.id;
//
//        db.users.findOne({ "_id" : uid}, function (err, doc) {
//            if (err) {
//                console.log("Error: " + err);
//            }
//
//            if (!doc) {
//                console.log("Error: User does not exist.");
//            } else {
//
//                vk.request('friends.get', { user_id: uid }, function (data, error) {
//                    var fOld = doc.friends[doc.friends.length-1].items;
//                    var fNew = data.response.items;
//                    var addedFriends = fNew.diff(fOld);
//                    var removedFriends = fOld.diff(fNew);
//                    var now = new Date();
//
//                    if (addedFriends.length > 0 || removedFriends.length > 0) {
//                        db.users.update(
//                            { "_id": uid },
//                            { $push: { friends: {created_at: now, count: data.response.count, items: data.response.items} } }
//                        );
//
//                        if (addedFriends.length > 0) {
//                            db.users.update(
//                                { "_id": uid },
//                                { $push: { added: {created_at: now, items: addedFriends} } }
//                            );
//
//                            vk.request('users.get', { user_ids: addedFriends }, function (addedData, error) {
//                                console.log("Added: ", addedData);
//                            });
//                        }
//
//                        if (removedFriends.length > 0) {
//                            db.users.update(
//                                { "_id": uid },
//                                { $push: { removed: {created_at: now, items: removedFriends} } }
//                            );
//
//                            vk.request('users.get', { user_ids: removedFriends }, function (removedData, error2) {
//                                console.log("Removed: ", removedData);
//                            });
//                        }
//                    } else {
//                        console.log("No changes.")
//                    }
//
//                });
//            }
//        });
//    });
//
//};
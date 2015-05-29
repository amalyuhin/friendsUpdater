var express = require('express'),
    mongojs = require("mongojs"),
    conf    = require('./config/config'),
    request = require('request'),
    path = require('path'),
    app = express(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    io = require('socket.io').listen(3002);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/../public'));

app.use(function(req, res, next) {
    var connectUrl = conf.get('db:connection') + '/' + conf.get('db:name');
    var collections = conf.get('db:collections');

    req.db = mongojs.connect(connectUrl, collections);
    next();
});

app.use('/', require('./routes'));


app.listen(3000);
console.log('Listening on port 3000...');

io.sockets.on('connection', function (socket) {
    socket.emit('connected', {message: 'connected'});

    socket.on('startScan', function(params) {
        var userInfoUrl = 'https://api.vk.com/method/execute.getUser';
        userInfoUrl += '?uid=' + params.uid;
        userInfoUrl += '&access_token=' + conf.get('vk:access_token');

        request.get(userInfoUrl, function(err, response, body) {
            var data = JSON.parse(body);
            if (data.response && data.response.user) {
                var groups = data.response.subs.groups.items;
                var users = data.response.subs.users.items;
                var friends = data.response.friends;

                var pages = [];
                for (var i = 0; i < groups; i++) {
                    pages.push('-' + groups[i]);
                }

                pages = pages.concat(users);
                pages = pages.concat(friends);

                socket.emit('scanningStarted');

                makeRequest(params.uid, pages);
            }
        });
    });

    function makeRequest(uid, groups) {
        if (groups.length > 0) {
            var url = 'https://api.vk.com/method/execute.checkwallE?&uid=' + uid + '&offset=0&hr=24&access_token=149a002f663695d17c1b8c7560b4d2656195ae63897a12477d55f6b8d9b4c09ed462cc08fb60ff99a9ff0';
            url += '&oid=' + groups[0];

            request.get(url, function(err, response, body) {
                try {
                    var data = JSON.parse(body);
                } catch (e) {
                    next();
                }

                if (!err) {
                    if (data.error && 6 == data.error.error_code) {
                        setTimeout(makeRequest(uid, groups), 5000);
                    } else {
                        console.log(url);
                        console.log(groups[0], body);
                        if (data.response && data.response.length) {
                            socket.emit('dataReceived', data);
                        }

                        next();
                    }

                } else {
                    socket.emit('dataError', err);
                }

                function next() {
                    groups.splice(0, 1);
                    makeRequest(uid, groups);
                }
            });
        } else {

            socket.emit('scanningCompleted');
        }
    }
});

module.exports.app = app;

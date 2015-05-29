(function() {
    'use strict';

    var module = angular.module('app.users');

    module.factory('UserService', ['$http', function($http) {
        var service = {
            baseUrl: 'http://localhost:3000/user/'
        };

        service.getInfo = function(uid) {
            return $http.get(this.baseUrl + uid);
        };

        return service;
    }]);

    module.factory('socket', function ($rootScope) {
        var socket = io.connect('http://127.0.0.1:3002');
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });
})();
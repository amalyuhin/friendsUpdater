(function() {
    'use strict';

    var module = angular.module('app.users');

    module.controller('UserController', ['$scope', '$routeParams', 'UserService', function($scope, $routeParams, UserService) {
        var uid = $routeParams.uid;
        $scope.data = {};

        UserService.getInfo(uid).success(function(result) {
            $scope.data = result;
        });
    }]);

    module.controller('LikesController', ['$scope', '$routeParams', 'socket', function($scope, $routeParams, socket) {
        $scope.items = [];

        socket.on('connected', function () {
            console.log('test');

            socket.emit('startScan', { uid: $routeParams.uid });

            socket.on('scanningStarted', function() {
                console.log('--- Scanning started ---');
            });

            socket.on('scanningCompleted', function() {
                console.log('--- Scanning completed ---');
            });

            socket.on('dataReceived', function(data) {
                if (data.response.length) {
                    for (var i = 0; i < data.response.length; i++) {
                        var item = data.response[i];
                        if (!item.date || item.date != 'time mismatch') {
                            console.log(item);
                            $scope.items.push(item);
                        }
                    }
                }
            });

            socket.on('dataError', function(err) {
                console.log('receiving data error:', err);
            });
        });
    }]);
})();
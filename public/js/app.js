(function() {
    'use strict';

    angular.module('app.main', []);
    angular.module('app.users', []);
    angular.module('app.likes', []);

    var app = angular.module('app', ['ngRoute', 'ngMaterial', 'app.main', 'app.users', 'app.likes']);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', { templateUrl: 'partials/main/index.html', controller: 'MainController' })
            .when('/user/:uid', { templateUrl: 'partials/users/index.html', controller: 'UserController'} )
            .when('/user/:uid/likes', { templateUrl: 'partials/users/likes.html', controller: 'LikesController'} )

            //.when('/login', {
            //    templateUrl: 'partials/login.html',
            //    freeAccess: true
            //})
            //.when('/logout', {
            //    templateUrl: 'partials/login.html',
            //    controller: 'LogoutCtrl'
            //})
            //.when('/dashboard', { templateUrl: 'partials/dashboard.html' })
            //.when('/hours', { templateUrl: 'partials/hours.html' })
            //.when('/hours/:date', { templateUrl: 'partials/hours.html' })
            //.when('/day', { templateUrl: 'partials/day.html', controller: 'DayCtrl' })
            //.when('/day/:date', { templateUrl: 'partials/day.html', controller: 'DayCtrl' })
            //.when('/stats', { templateUrl: 'partials/stats.html', title: 'Statistic' })
            //.when('/calendar', { templateUrl: 'partials/calendar.html', title: 'Calendar' })
            //.otherwise({templateUrl:'404.html'})
        ;
    }]);
})();
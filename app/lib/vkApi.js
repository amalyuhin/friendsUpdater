/**
 * Created by amalyuhin on 13.07.14.
 */

var http = require('http');

var vkApi = function () {
    this.params = {
        version: '5.23',
        host: 'api.vk.com',
        port: 80,
        method: 'GET'
    };
};

vkApi.prototype = {
    request: function (method, options, callback) {
        var url = '/method/' + method + '?v=' + this.params.version;
        var requestOptions = {
            host: this.params.host,
            port: this.params.port,
            method: this.params.method
        };

        for(var key in options) {
            if (options.hasOwnProperty(key)) {
                url += '&' + key + '=' + options[key];
            }
        }

        requestOptions.path = url;

        http.get(requestOptions, function (response) {
            response.setEncoding('utf8');

            var result = '';

            response.on('data', function (data) {
                result += data;
            });

            response.on('end', function () {
                callback(JSON.parse(result), null);
            });

        }).on("error", function (e) {
            callback(null, e);
        });
    }
};


module.exports = vkApi;
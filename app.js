/**
 * Created by amalyuhin on 09.07.14.
 */

//////////////////////
//Define the Express app
//////////////////////
var express = require('express'),
    cons = require('consolidate'),
    swig = require('swig'),
    http = require('http'),
    path = require('path'),
    fs   = require('fs'),
    app = module.exports = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var methodOverride = require('method-override');

var applicationDir = './app';


//////////////////////
// Configuration
//////////////////////
app.configure(function(){
    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/app/views');
    app.set('view options', { layout: false });
    app.set('view cache', false);
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieSession({secret: 'app_1'}));
    app.use(methodOverride('_method'));
    app.use(app.router);
    app.use(express.static(__dirname + '/app/public'));
});

//////////////////////
// Swig Settings
//////////////////////
//swig.init({
//    root: __dirname + '/app/views',
//    allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
//});

//////////////////////
// Dynamically include routes (Controller)
//////////////////////
fs.readdirSync(applicationDir + '/controllers').forEach(function (file) {
    if(file.substr(-3) == '.js') {
        route = require(applicationDir + '/controllers/' + file);
        route.controller(app);
    }
});

//////////////////////
//Run the server
//////////////////////
app.listen(3000);
console.log('Listening on port 3000...');

module.exports.app = app;

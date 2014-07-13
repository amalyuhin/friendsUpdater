/**
 * Created by amalyuhin on 13.07.14.
 */

var nconf = require('nconf');
nconf.argv()
    .env()
    .file({ file: './app/config/parameters.json' });

module.exports = nconf;
var mysql = require('mysql');
var dbconfig = require('../config');
var connection = mysql.createConnection(dbconfig.database);

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
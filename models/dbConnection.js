var mysql = require('mysql');
var config = require('../config.json');
// var connection = mysql.createConnection(config.database);
// connection.connect(function(err) {
//     if (err) throw err;
// });

var pool  = mysql.createPool(config.database);

// pool.getConnection(function(err, connection) {
//     if (err) throw err; // not connected!
   
//     // Use the connection
//     connection.query('SELECT something FROM sometable', function (error, results, fields) {
//       // When done with the connection, release it.
//       connection.release();
   
//       // Handle error after the release.
//       if (error) throw error;
   
//       // Don't use the connection here, it has been returned to the pool.
//     });
//   });

module.exports = pool;
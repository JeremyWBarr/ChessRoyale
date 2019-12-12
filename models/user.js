/*var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	
	unique_id: Number,
	email: String,
	username: String,
	password: String,
	passwordConf: String
}),
User = mongoose.model('User', userSchema);

module.exports = User;*/

var mariadb	= require('mariadb');

var pool = mariadb.createPool({
	host: 			'localhost',
	user: 			'root',
	password: 		'pass',
	database:		'chessroyale',
	connetionLimit: 5
});

function addUser(username, password) {
	pool.getConnection()
    .then(conn => {
      conn.query("INSERT INTO user value (?, ?)", [username, password])
        .catch(err => {
		  //handle error
		  console.log(err);
          conn.end();
        })
    }).catch(err => {
	  //not connected
	  console.log(err);
    });
}

function getUsername(id) {
	pool.getConnection()
	.then(conn => {
	conn.query("SELECT name FROM user WHERE id = ?", [id])
		.then((rows) => {
			return rows[0]["name"];
		})
		.catch(err => {
			//handle error
			console.log(err);
			conn.end();
		})
	}).catch(err => {
			//not connected
			console.log(err);
	});
}

function checkLogin(username, password) {
	pool.getConnection()
		.then(conn => {
		conn.query("SELECT * FROM user WHERE name = ? and password = ?", [username, password])
			.then((rows) => {
				return {"isSuccess": (rows.length > 0), "userId": rows[0]['id']};
			})
			.catch(err => {
				//handle error
				console.log(err);
				conn.end();
			})
	}).catch(err => {
			//not connected
			console.log(err);
	});
}
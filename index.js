var express	= require('express');
var app		= express();
var path	= require('path');
var http	= require('http').createServer(app);
var io		= require('socket.io')(http);
var mariadb	= require('mariadb');

var isconnected = false;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	//res.redirect('index.html');
	res.send(isconnected ? "YES" : "NO");
});

var pool = mariadb.createPool({
	host: 			'localhost',
	user: 			'root',
	password: 		'pass',
	database:		'chessroyale',
	connetionLimit: 5
});

pool.getConnection()
    .then(conn => {
      conn.query("SELECT * from user")
        .then((rows) => {
          console.log(rows);
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

io.on('connection', function(socket){

	console.log('A user connected.');

	socket.on('disconnect', function(){
		console.log('A user disconnected.');
	});
});

http.listen(80, function(){
	console.log('listening on *:80');
});

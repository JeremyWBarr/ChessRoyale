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
	connetionLimit: 5
});

pool.getConnection()
    .then(conn => {
      conn.query("SELECT * from user")
        .then((rows) => {
		  console.log(rows);
		  conn.end();
        })
        .catch(err => {
          //handle error
          conn.end();
        })
    }).catch(err => {
      //not connected
    });

con.connect(function(err) {
	if (err) throw err;
	isconnected = true;
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

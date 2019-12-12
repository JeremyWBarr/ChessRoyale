var express	= require('express');
var app		= express();
var path	= require('path');
var http	= require('http').createServer(app);
var io		= require('socket.io')(http);
var mysql	= require('mysql');

var isconnected = false;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	//res.redirect('index.html');
	res.send(isconnected ? "YES" : "NO");
});

var con = mysql.createConnection({
	host: 		'localhost',
	user: 		'root',
	password: 	'pass'
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

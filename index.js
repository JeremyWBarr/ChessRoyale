var express	= require('express');
var session = require('express-session');
var engines = require('consolidate');
var bodyParser = require('body-parser');
var app		= express();
var path	= require('path');
var http	= require('http').createServer(app);
var io		= require('socket.io')(http);
var mariadb	= require('mariadb');

app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(req, res){
	if(request.session.loggedin) {
		res.redirect('index.html');
	} else {
		res.redirect('login.html');
	}
});

app.get('/signup', function(req, res){
	res.redirect('signup.html');
});

app.get('/login', function(req, res){
	res.redirect('login.html');
});

app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	if(username && password) {
		pool.getConnection()
		.then(conn => {
		conn.query("SELECT * FROM user WHERE name = ? and password = ?", [username, password])
			.then((rows) => {
				if(rows.length > 0) {
					req.session.loggedin = true;
					req.session.username = username;

					res.render('index.html', {username: req.session.username});
				} else {
					res.send('Incorrect Username and/or Password!');
				}
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
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

var pool = mariadb.createPool({
	host: 			'localhost',
	user: 			'root',
	password: 		'pass',
	database:		'chessroyale',
	connetionLimit: 5
});


io.on('connection', function(socket){

	console.log('A user connected.');

	socket.on('disconnect', function(){
		console.log('A user disconnected.');
	});
});

function checkCredentials(username, password) {
	var accountFound = false;
	console.log("credentials: " + username + ", " + password);

	pool.getConnection()
    .then(conn => {
      conn.query("SELECT * FROM user WHERE name = ? and password = ?", [username, password])
		.then((rows) => {
			accountFound = true;
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
	return accountFound;
}

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

http.listen(80, function(){
	console.log('listening on *:80');
});

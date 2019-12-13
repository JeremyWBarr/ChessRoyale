// IMPORTS
var express		= require('express');
var path		= require('path');
var app			= express();
var http		= require('http').createServer(app);
var io			= require('socket.io')(http);
var mariadb		= require('mariadb');

var lobbies		= [];

app.use(express.static(path.join(__dirname, 'public')));

// MYSQL CONNECTION 3307
var pool = mariadb.createPool({
	host: 			'localhost',
	user: 			'root',
	password: 		'pass',
	database:		'chessroyale',
	port:			3307,
	connetionLimit: 5
});

// ROUTES
app.get('/', function(req, res){
    res.redirect('main.html');
});

// SOCKET IO
io.on('connection', function(socket){

	// SOCKET DATA
    var username    = '';
    var room        = '';

	// SOCKET CONNECTION LOGGING
    console.log('A user connected.');

    socket.on('disconnect', function(){
        console.log('A user disconnected.');
    });

	// ==================== SOCKET INBOUND EVENTS ==================== //

		// SIGNUP
		socket.on('signup', function(u, p, c){
			hadError = false;
			if(p == c) {
				pool.getConnection()
					.then(conn => {
						conn.query("INSERT INTO user (name, password) value (?, ?)", [u, p])
							.catch(err => {
								//handle error
								hadError = true;
								console.log(err);
								conn.end();
							})
					}).catch(err => {
						//not connected
						console.log(err);
					});
			} else {
				hadError = true;
				sendError("Passwords do not match.");
			}
			if(!hadError) {
				username = u;
				changeView("HOME");
				sendMessage("Welcome, " + u + "!");
			}
		});

		// LOGIN
		socket.on('login', function(u, p) {
			if(u && p) { 
				pool.getConnection()
					.then(conn => {
						conn.query("SELECT * FROM user WHERE name = ? and password = ?", [u, p])
							.then((rows) => {
								if(rows.length) {
									username = u;
									changeView("HOME");
									sendMessage("Welcome, " + u + "!");
								} else {
									sendError("Incorrect username or password.");
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
				sendError("Please enter a username and password.");
			}
		});
		
		// LOGOUT
		socket.on('logout', function(u, p){
			username = '';
			changeView("LOGIN");
		});

		// CREATE LOBBY
		socket.on('createLobby', function() {
			var id      = Math.random().toString(36).substring(2, 10);
			var name    = username + "'s Lobby";
			var lobby 	= new Lobby(id, name, [username]);
			
			lobbies.push(lobby);
			
			room = id;
			socket.join(id);
			
			changeView("LOBBY");
			updateLobbies();
		});
		
		// DELETE LOBBY
		socket.on('deleteLobby', function(id){
			lobbies.forEach(function(lobby){
				if(lobby.id == id) {
					var index = lobbies.indexOf(lobby);
					lobbies.splice(index, 1);
				}
			});
		});

		// JOIN LOBBY
		socket.on('joinLobby', function(id) {
			var lobbyFull = false;
			lobbies.forEach(function(lobby) {
				if(lobby.members >= 4){
					sendError("Lobby already full!");
					lobbyFull = true;
				} else {
					if(lobby.id == id) lobby.members.push(username);
				}
			});
			if(!lobbyFull) {
				room = id;
				socket.join(id);

				updateMembers(id);
				changeView("LOBBY");
			}
		});

		// GET USERNAME
		socket.on('getUsername', function(){
			socket.emit('getUsernameCallback', username);
		});

		// GET LOBBY
		socket.on('getLobby', function() {
			lobbies.forEach(function(lobby){
				if(lobby.id == room)
					socket.emit('getLobbyCallback', lobby);
			});
		})

		// GET LOBBIES
		socket.on('getLobbies', function(id) {
			socket.emit('getLobbiesCallback', lobbies);
		});

		// GET MEMBERS
		socket.on('getMembers', function(id) {
			updateMembers(id);
		});

		// BOARD UPDATE
		socket.on('boardUpdate', function(board) {
			lobbies.forEach(function(lobby){
				if(lobby.id == room) {
					lobby.turn++;
					if(lobby.turn > 3) lobby.turn = 0;
					socket.to(room).emit('getTurnCallback', lobby.turn);
				}
			});
			socket.broadcast.to(room).emit('boardUpdate', board);
		});

		// GET TURN
		socket.on('getTurn', function(){
			lobbies.forEach(function(lobby){
				if(lobby.id == room) {
					io.to(room).emit('getTurnCallback', lobby.turn);
				}
			});
		});

	// ==================== SOCKET OUTBOUND EVENTS ==================== //

		// SEND ERROR
		function sendError(e) {
			socket.emit('message', 'ERR', e);
		}

		// SEND MESSAGE 
		function sendMessage(m) {
			socket.emit('message', 'MSG', m);
		}

		// CHANGE VIEW v = (LOGIN, SIGNUP, HOME, LOBBY)
		function changeView(v) {
			socket.emit('changeView', v);
		}

		// UPDATE LOBBIES
		function updateLobbies() {
			io.emit('getLobbiesCallback', lobbies);
		}

		// UPDATE MEMBERS
		function updateMembers(id) {
			lobbies.forEach(function(lobby){
				if(lobby.id == id) {
					io.to(id).emit('getMembersCallback', lobby.members);
				}
			});
		}
});

// LOBBY OBJECT
class Lobby {
    constructor(i, n, m) {
        this.id = i;
		this.name = n;
		this.members = m;
		this.turn = 0;
    }
}

// LISTEN TO PORT
http.listen(3000, function(){
    console.log('listening on *:3000');
});

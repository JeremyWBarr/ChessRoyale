// IMPORTS
var express		= require('express');
var path		= require('path');
var app			= express();
var http		= require('http').createServer(app);
var io			= require('socket.io')(http);
var mariadb		= require('mariadb');

var lobbies		= [];
var parties		= [];

app.use(express.static(path.join(__dirname, 'public')));

// MYSQL CONNECTION 3307
var pool = mariadb.createPool({
	host: 			'localhost',
	user: 			'root',
	password: 		'pass',
	database:		'chessroyale',
	port:			3306,
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
	var party		= '';

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
						conn.query("INSERT INTO user (name, pass) value (?, ?)", [u, p])
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
						conn.query("SELECT * FROM user WHERE name = ? and pass = ?", [u, p])
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
			socket.join(id);
			room = id;
			lobbies.forEach(function(lobby){
				if(lobby.id == id) io.to(id).emit('lobbyUpdate', lobby);
			});
		});

		// CREATE PARTY
		socket.on('createParty', function() {
			var id      = Math.random().toString(36).substring(2, 10);
			var name    = username + "'s Party";
			var party 	= new Party(id, name, [new Member(username)]);
			
			parties.push(party);
		
			party = id;
			socket.join(id);
			
			updateParty(id);
		});
		
		// DELETE PARTY
		socket.on('deleteParty', function(id){
			parties.forEach(function(party){
				if(party.id == id) {
					var index = parties.indexOf(party);
					parties.splice(index, 1);
				}
			});
		});

		// JOIN PARTY
		socket.on('joinParty', function(id) {
			var partyFull = false;
			parties.forEach(function(party) {
				if(party.id == id) {
					if(party.members.length >= 4){
						sendError("Party already full!");
						partyFull = true;
					} else {
						party.members.push(new Member(username));
						party.memberCount++;
					}
				}
			});
			if(!partyFull) {
				party = id;
				socket.join(id);

				updateParty(id);
			}
		});

		// JOIN QUEUE
		socket.on('joinQueue', function(id, type , size) {
			var foundLobby = false;

			parties.forEach(function(party){
				if(party.id == id) {
					if(size == 'SMALL') {
						lobbies.forEach(function(lobby){
							if(lobby.memberCount + party.members.length <= 4) {
								if(lobby.memberCount + party.members.length == 4) {
									lobby.gamestate = 'selection';
								}
								foundLobby = true;
								joinLobby(party.id, lobby.id);
							}
						});

						if(!foundLobby) {
							var lobby = createLobby();
							joinLobby(party.id, lobby.id);
						}

					} else if(size == 'MEDIUM') {
						// TODO						

					} else if(size == 'LARGE') {
						// TODO

					}
				}
			});
		});

		// GET USERNAME
		socket.on('getUsername', function(){
			socket.emit('getUsernameCallback', username);
		});

		// GET LOBBY
		socket.on('getLobby', function() {
			lobbies.forEach(function(lobby){
				if(lobby.id == room)
					io.to(room).emit('lobbyUpdate', lobby);
			});
		})

		// GET LOBBIES
		socket.on('getLobbies', function(id) {
			socket.emit('getLobbiesCallback', lobbies);
		});

		// GET PARTY
		socket.on('getParty', function() {
			lobbies.forEach(function(party){
				if(party.id == room)
					socket.emit('getPartyCallback', party);
			});
		})

		// GET PARTIES
		socket.on('getParties', function(id) {
			socket.emit('getPartiesCallback', parties);
		});

		// GET MEMBERS
		socket.on('getMembers', function(id) {
			updateMembers(id);
		});

		// CHOSE START
		socket.on('choseStart', function() {
			lobbies.forEach(function(lobby) {
				if(lobby.id == room){
					lobby.members.forEach(function(party) {
						party.members.forEach(function(member){
							if(member.name == username) {
								member.choseStart = true;
							}
						})
					});
				}
			})
		});

		// BOARD UPDATE
		socket.on('boardUpdate', function(board) {

			lobbies.forEach(function(lobby){
				if(lobby.id == room) {
					if(lobby.gamestate == 'selection') {
						var selectionFinished = true;

						lobby.members.forEach(function(party){
							party.members.forEach(function(member){
								if(!member.choseStart) selectionFinished = false;
							});
						});
						
						if(selectionFinished) {
							io.to(room).emit('gameStart');
							lobby.gamestate = 'gameStart';
						}
					}

					lobby.turn++;
					if(lobby.turn > 3) lobby.turn = 0;
					socket.to(room).emit('getTurnCallback', lobby.turn);
				}
			});
			socket.broadcast.to(room).emit('boardUpdate', board);
		});

		// GET TURN
		socket.on('getTurn', function() {
			lobbies.forEach(function(lobby){
				if(lobby.id == room) {
					io.to(room).emit('getTurnCallback', lobby.turn);
				}
			});
		});

		// SEND INVITE
		socket.on('sendInvite', function(from, to, id) {
			io.emit('recieveInvite', from, to, id);
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

		function updateParty(id) {
			parties.forEach(function(party){
				if(party.id == id) {
					io.to(id).emit('getPartyCallback', party)
				}
			});
		}

		// UPDATE LOBBY MEMBERS
		function updateMembers(id) {
			lobbies.forEach(function(lobby){
				if(lobby.id == id) {
					io.to(id).emit('getMembersCallback', lobby.members);
				}
			});
		}

		// JOIN LOBBY
		function joinLobby(partyId, lobbyId) {
			lobbies.forEach(function(lobby) {
				if(lobby.id == lobbyId){
					parties.forEach(function(party){
						if(party.id == partyId) {
							lobby.members.push(party);
							lobby.memberCount += party.members.length;
							io.to(partyId).emit('joinLobby', lobby);
						}
					});
				}
			});
		}

		// CREATE LOBBY
		function createLobby() {
			var id      = Math.random().toString(36).substring(2, 10);
			var lobby 	= new Lobby(id);
			
			lobbies.push(lobby);

			return lobby;
		};
});

// LOBBY OBJECT
class Lobby {
    constructor(i) {
        this.id = i;
		this.members = [];
		this.memberCount = 0;
		this.turn = 0;
		this.gamestate = 'pregame';
    }
}

class Party {
    constructor(i, n, m) {
        this.id = i;
		this.name = n;
		this.members = m;
		this.memberCount = 0;
		this.turn = 0;
    }
}

class Member {
    constructor(n) {
		this.name = n;
		this.choseStart = false;
		this.score = 0;
    }
}

// LISTEN TO PORT
http.listen(3000, function(){
    console.log('listening on *:3000');
});

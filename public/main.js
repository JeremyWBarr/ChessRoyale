var socket      = io();
var user        = '';
var lobbyId     = '';
var lobbyName   = '';
            
socket.emit('getLobbies');

// ==================== FORM SUBMISSIONS ==================== //

$(function() {

    // LOGIN
    $('.login').click(function(e) {
        socket.emit('login', $('#loginUsername').val(), $('#loginPassword').val());
    });
    
    // SWITCH SIGNUP
    $('.switchSignup').click(function(e) {
        showView('SIGNUP');
    });

    // SWITCH LOGIN
    $('.switchLogin').click(function(e) {
        showView('LOGIN');
    });

    // SIGNUP
    $('.signup').click(function(e) {
        socket.emit('signup', $('#signupUsername').val(), $('#signupPassword').val(),$('#signupPasswordCheck').val(), );
    });

    // CREATE LOBBY
    $('.createLobby').click(function() {
        socket.emit('createLobby');
    });

});

// ==================== SOCKET INBOUND EVENTS ==================== //

    // RECIEVE MESSAGE
    socket.on('message', function(type, message){
        if(type == "ERR") {

            console.log("ERROR: " + message);

        } else if(type == "MSG") {

            console.log("MESSAGE: " + message);

        }
    });

    // CHANGE VIEW
    socket.on('changeView', function(view) {
        if(view == 'HOME'){
            getUsername();
        } else if(view == 'LOBBY') {
            getLobby();
        }

        showView(view);
    });

    // GET USERNAME CALLBACK
    socket.on('getUsernameCallback', function(username){
        user = username;
        $('.loggedInAs').html('Logged in as: '+username + '! (<a href=# class=switchLogin>logout</a>)');
    });

    // GET LOBBY CALLBACK
    socket.on('getLobbyCallback', function(lobby){
        console.log(lobby);

        lobbyId     = lobby.id;
        lobbyName   = lobby.name;

        $('.lobbyName').html("Welcome to " + lobby.name + "'s Lobby");

        updateMembers(lobby.members);
    });

    // GET LOBBIES CALLBACK
    socket.on('getLobbiesCallback', function(lobbylist){
        console.log(lobbylist);
        
        // CLEAR OLD LOBBIES TABLE
        var oldTable = document.getElementsByClassName('lobbyTable');
        if(oldTable.length > 0)
            oldTable[0].remove();
            

        // CREATE DOM ELEMENTS
        var container               = document.getElementsByClassName('tableContainer')[0];
        var table                   = document.createElement('table');
        table.className             = 'lobbyTable';
        var header                  = document.createElement("th");
        header.innerHTML            = 'Available Lobbies:';

        table.appendChild(header);

        // ADD LOBBIES
        for(var i = 0; i < 5; i++) {
            var row                 = document.createElement("tr");
            var cell                = document.createElement("td");
            
            var link                = document.createElement("a");

            if(i < lobbylist.length) {
                link.innerHTML          = lobbylist[i].name;
                link.href               = 'javascript:joinLobby("'+lobbylist[i].id+'")';
            } else {
                link.innerHTML          = '';
            }

            cell.appendChild(link);
            row.appendChild(cell);
            table.appendChild(row);
        }

        container.appendChild(table);
    });

    // GET MEMBERS CALLBACK
    socket.on('getMembersCallback', function(memberlist){
        updateMembers(memberlist);
    });

// ==================== SOCKET OUTBOUND EVENTS ==================== //

    // GET USERNAME
    function getUsername() {
        socket.emit('getUsername');
    }

    // GET LOBBY
    function getLobby() {
        socket.emit('getLobby');
    }

    // GET LOBBIES
    function getLobbies() {
        socket.emit('getLobbies');
    }

    // GET MEMBERS
    function getMembers() {
        socket.emit('getMembers', lobbyId);
    }

    // JOIN LOBBY
    function joinLobby(id) {
        socket.emit('joinLobby', id);
    }

// FUNCTIONS
function showView(v) {
    console.log("switching to view: " + v);
    view = v.toLowerCase();
    $('.view').css('visibility', 'hidden');
    $('#'+view+'View').css('visibility', 'visible');
}

function updateMembers(memberlist) {
    // CLEAR OLD LOBBIES TABLE
    var oldTable = document.getElementsByClassName('memberTable');
    if(oldTable.length > 0)
        oldTable[0].remove();
        

    // CREATE DOM ELEMENTS
    var container               = document.getElementsByClassName('memberTableContainer')[0];
    var table                   = document.createElement('table');
    table.className             = 'memberTable';
    var header                  = document.createElement("th");
    header.innerHTML            = 'Members:';

    table.appendChild(header);

    // ADD LOBBIES
    for(var i = 0; i < 4; i++) {
        var row                 = document.createElement("tr");
        var cell                = document.createElement("td");
        
        var link                = document.createElement("a");

        if(i < memberlist.length) {
            link.innerHTML          = memberlist[i];
        } else {
            link.innerHTML          = '';
        }

        cell.appendChild(link);
        row.appendChild(cell);
        table.appendChild(row);
    }

    container.appendChild(table);
}
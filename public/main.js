var socket      = io();
var user        = '';
var lobbyId     = '';
var lobbyName   = '';
var userColor   = 0;
var turn        = 0;
var list        = [];

var gameStarted = false;
            
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

            alert('ERROR: '+ message);

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
            getTurn();
        }

        showView(view);
    });

    // GET USERNAME CALLBACK
    socket.on('getUsernameCallback', function(username){
        user = username;
        $('.loggedInAs').html('Logged in as: '+username + '! (<a href=javascript:showView("LOGIN")>logout</a>)');
    });

    // GET LOBBY CALLBACK
    socket.on('getLobbyCallback', function(lobby){
        console.log(lobby);

        lobbyId     = lobby.id;
        lobbyName   = lobby.name;
        userColor   = lobby.members.indexOf(user);

        switch(userColor) {
            case 0:
                $('#lobbyView').css('border', '5px solid #F00');
                $('#lobbyView').css('box-shadow', '0 0 15px #F00');
            break;
            case 1:
                $('#lobbyView').css('border', '5px solid #00F');
                $('#lobbyView').css('box-shadow', '0 0 15px #00F');
            break;
            case 2:
                $('#lobbyView').css('border', '5px solid #0F0');
                $('#lobbyView').css('box-shadow', '0 0 15px #0F0');
            break;
            case 3:
                $('#lobbyView').css('border', '5px solid #FF0');
                $('#lobbyView').css('box-shadow', '0 0 15px #FF0');
            break;
        }

        $('.lobbyName').html("Welcome to " + lobby.name);

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

    // GET TURN CALLBACK
    socket.on('getTurnCallback', function(t){
        turn = t;
        $('.playerTurn').html(list[t] + "'s Turn");
        switch(t){
            case 0:
            $('.playerTurn').css('color', '#F00');
            break;
            case 1:
            $('.playerTurn').css('color','#00F' );
            break;
            case 2:
            $('.playerTurn').css('color', '#0F0');
            break;
            case 3:
            $('.playerTurn').css('color', '#FF0');
        }
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

    // GET TURN
    function getTurn() {
        socket.emit('getTurn');
    }

// FUNCTIONS
function showView(v) {
    console.log("switching to view: " + v);
    view = v.toLowerCase();
    $('.view').css('visibility', 'hidden');
    $('#'+view+'View').css('visibility', 'visible');
}

function updateMembers(memberlist) {
    list = memberlist;

    if(memberlist.length == 4) gameStarted = true;

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

        switch(i) {
            case 0:
            link.style.cssText='color:#F00;font-weight:bold;font-size:150%';
            break;
            case 1:
            link.style.cssText='color:#00F;font-weight:bold;font-size:150%';
            break;
            case 2:
            link.style.cssText='color:#0F0;font-weight:bold;font-size:150%';
            break;
            case 3:
            link.style.cssText='color:#FF0;font-weight:bold;font-size:150%';
            break;
        }

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
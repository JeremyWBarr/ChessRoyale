var socket      = io();
var user        = '';
var lobbyId     = '';
var lobbyName   = '';
var lobby;
var partyId     = '';
var partyCount  = 0;
var inviteId    = '';
var userColor   = 0;
var turn        = 0;
var list        = [];

var gameStarted = false;

socket.emit('getLobby');

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

    // INVITE PLAYER
    $('.inviteSubmit').click(function() {
        socket.emit('sendInvite', user, $('#inviteUser').val(), partyId);
        var invitePopup = document.getElementById('invitePopup');
        invitePopup.style.visibility = 'hidden';
    });

    // ACCEPT INVITE
    $('.inviteAccept').click(function() {
        socket.emit('deleteParty', partyId);
        socket.emit('joinParty', inviteId);

        console.log(partyId+", "+inviteId);

        var invitedPopup = document.getElementById('invitedPopup');
        invitedPopup.style.visibility = 'hidden';
    });

    // DECLINE INVITE
    $('.inviteDecline').click(function() {
        var invitedPopup = document.getElementById('invitedPopup');
        invitedPopup.style.visibility = 'hidden';
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
            socket.emit('createParty');
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
    /*socket.on('getLobbyCallback', function(lobby){
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
    });*/

    // GET PARTY CALLBACK
    socket.on('getPartyCallback', function(party){
        console.log(party);

        partyId     = party.id;
        partyCount  = party.members.length;

        // reset
        for(var i = 1; i < 5; i++) {
            document.getElementsByClassName('player'+i+'Invite')[0].style.display = "block";
            document.getElementsByClassName('player'+i)[0].style.display = "none";
        }

        // set
        party.members.forEach(function(member, i){
            var slotnum     = i + 1;
            var slotInvite  = document.getElementsByClassName('player'+slotnum+'Invite')[0];
            var slot        = document.getElementsByClassName('player'+slotnum)[0];

            slotInvite.style.display    = "none";
            slot.style.display          = "block";

            slot.getElementsByTagName("span")[0].innerHTML = member.name;
        });
    });

    // GET MEMBERS CALLBACK
    socket.on('getMembersCallback', function(memberlist){
        //updateMembers(memberlist);
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

    // RECIEVE INVITE
    socket.on('recieveInvite', function(from, to, id){
        inviteId = id;
        console.log("invite from: " + from + ". to: " + to + ". Id: " + id);
        if(user == to) {
            var invitedPopup = document.getElementById('invitedPopup');
            invitedPopup.getElementsByClassName('invitedMessage')[0].innerHTML = 'Invite from ' + from + '!';

            invitedPopup.style.visibility = 'visible';
        }
    });

    // JOIN LOBBY
    socket.on('joinLobby', function(l){
        console.log(l);
        joinLobby(l.id);
        lobby = l;
        showView("LOBBY");
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

function invite() {
    var invitePopup = document.getElementById('invitePopup');
    invitePopup.style.visibility = 'visible';
}

function joinQueue(type) {
    console.log("HERE")
    if(type == 'SOLO' && partyCount < 2) {
        // TODO
    } else if(type == 'DUO' && partyCount < 3) {
        // TODO
    } else if(type == 'SQUAD') {
        socket.emit('joinQueue', partyId, type, 'SMALL');
    }
}

/*function updateMembers(memberlist) {
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
}*/
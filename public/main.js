var socket      = io();
var user        = '';
var lobbyId     = '';
var lobbyName   = '';
            
socket.emit('getLobbies');

// ==================== FORM SUBMISSIONS ==================== //

    // LOGIN
    $('.login').submit(function(e){
        e.preventDefault();
        console.log("HEHEDF");
        socket.emit('login', $('#loginUsername').val(), $('#loginPassword').val());

        return false;
    });

    // SIGNUP
    $('.signup').submit(function(e){
        e.preventDefault();
        socket.emit('signup', $('#signupUsername').val(), $('#signupPassword').val(),$('#signupPasswordCheck').val(), );

        return false;
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
        $('.loggedInAs').html(username);
    });

    //GET LOBBY CALLBACK
    socket.on('getUsernameCallback', function(lobby){
        lobbyId     = lobby.id;
        lobbyName   = lobby.name;
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
        var headerRow               = document.createElement("tr");
        var header                  = document.createElement("th");
        headerRow.innerHTML         = 'Lobby Name';

        headerRow.appendChild(header);
        table.appendChild(headerRow);

        // ADD LOBBIES
        lobbylist.forEach(function(lobby){
            var row                 = document.createElement("tr");
            var cell                = document.createElement("td");
            
            var link                = document.createElement("a");
            link.innerHTML          = lobby.name;
            link.href               = '\\lobby\\'+lobby.id;

            cell.appendChild(link);
            row.appendChild(cell);
            table.appendChild(row);
        });

        container.appendChild(table);
    });

// ==================== SOCKET OUTBOUND EVENTS ==================== //

    // GET USERNAME
    function getUsername() {
        socket.emit('getUsername');
    }

    // GET LOBBY
    function getLobby(){
        socket.emit('getLobby');
    }

    // GET LOBBIES
    function getLobbies() {
        socket.emit('getLobbies');
    }

    // CREATE LOBBY
    $('.createLobby').click(function(){
        socket.emit('createLobby');
    });


// FUNCTIONS
function showView(v) {
    console.log("switching to view: " + v);
    view = v.toLowerCase();
    $('.view').css('visibility', 'hidden');
    $('#'+view+'View').css('visibility', 'visible');
}
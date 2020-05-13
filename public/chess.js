// GLOBALS
var board;
var gamestate = 'pregame';
var hud;
var zoom = 1;

var currentLobby;
var playerCount = 0;
var username = '';

var canW = window.innerWidth;
var canH = window.innerHeight;
var startX = 0;
var startY = 0;
var camX = 0;
var camY = 0;
var xhover = 0;
var yhover = 0;
var grass, wall, font;
var choseStart = false;
var countdown = 3;
var isCountdown = false;
var carryingPiece = null;
var score = 5;

// PIECE IMAGES
var wPawn, 
    wKnight,
    wBishop,
    wRook,
    wQueen,
    wKing;

// P5 PRELOAD
function preload() {
    wPawn       = loadImage('assets/White_Pawn.png');
    wKnight     = loadImage('assets/White_Knight.png');
    wBishop     = loadImage('assets/White_Bishop.png');
    wRook       = loadImage('assets/White_Rook.png');
    wQueen      = loadImage('assets/White_Queen.png');
    wKing       = loadImage('assets/White_King.png');
    grass       = loadImage('assets/grass.jpg');
    wall        = loadImage('assets/wall.png');
    wallone     = loadImage('assets/wall-one.png');
    walllog     = loadImage('assets/wall-two-log.png');
    wallang     = loadImage('assets/wall-two-angle.png');
    wallthree   = loadImage('assets/wall-three.png');
    wallfour    = loadImage('assets/wall-four.png')
    font        = loadFont('assets/Righteous-Regular.ttf');
}

// P5 SETUP
function setup() {
    angleMode(DEGREES);

    var c = createCanvas(canW, canH);
    c.parent('chessContainer');

    board   = new Board(40,40);
    board.init();
    hud     = new Hud();
    hud.init();

    socket.emit("getUsername");
}

// P5 DRAW
function draw() {
    background(51);
    camOff();
    board.draw();
    hud.draw();

    mouseHover();

    if(gamestate == 'pregame') {
        background(51, 200);
        fill(255, 255, 0);
        strokeWeight(1);
        textSize(52);
        textAlign(CENTER);
        text("Waiting for players...", canW/2, canH/2);
        text(playerCount + " / 8", canW/2, (canH/2)+100);
        textAlign(LEFT);
    }

    if(gamestate == 'gameStart' && isCountdown) {
        background(51, 200);
        fill(255, 255, 0);
        strokeWeight(1);
        textSize(52);
        textAlign(CENTER);
        text("Game Starts in...", canW/2, canH/2);
        text(countdown, canW/2, (canH/2)+100);
        textAlign(LEFT);
    }

    if(gamestate == 'gameStart' && !isCountdown) {
        if(carryingPiece != null) {
            carryingPiece.draw(mouseX, mouseY, true);
        }
    }

    socket.emit('getLobby');
}

function Hud() {

    this.buttons = [];

    this.init = function() {
        this.buttons.push(new Button(canW-110, 220, 80, 80, wPawn, '1', buyPawn));
        this.buttons.push(new Button(canW-110, 320, 80, 80, wKnight, '3', buyKnight));
        this.buttons.push(new Button(canW-110, 420, 80, 80, wBishop, '3', buyBishop));
        this.buttons.push(new Button(canW-110, 520, 80, 80, wRook, '5', buyRook));
        this.buttons.push(new Button(canW-110, 620, 80, 80, wQueen, '9', buyQueen));
    }

    this.draw = function() {

        // TEAM
        if(lobby != null) {
            lobby.members.forEach(function(party) {
                var inLobby = false;
                if(party.members[0] != null)
                    if(party.members[0].name == username) inLobby = true;
                if(party.members[1] != null)
                    if(party.members[1].name == username) inLobby = true;
                if(party.members[2] != null)
                    if(party.members[2].name == username) inLobby = true;
                if(party.members[3] != null)
                    if(party.members[3].name == username) inLobby = true;

                if(inLobby) {
                    textSize(32);
                    if(party.members[0] != null){
                        fill(70, 130, 180);
                        text(party.members[0].name, 90, 100);
                    }
                    if(party.members[1] != null){
                        fill(238, 130, 238);
                        text(party.members[1].name, 90, 150);
                    }
                    if(party.members[2] != null){
                        fill(255, 165, 0);
                        text(party.members[2].name, 90, 200);
                    }
                    if(party.members[3] != null){
                        fill(102, 51, 153);
                        text(party.members[3].name, 90, 250);
                    }
                }
            });
        }

        // BUY MENU
        fill(100);
        rect(canW-130, 200, 500, canH-720, 20, 20, 20, 20);

        this.buttons.forEach(function(button) {
            button.draw();
        });

        fill(255);
        textSize(28);
        strokeWeight(2);
        text("Points: ", canW-110, 750);

        textSize(64);
        text(score, canW-85, 820);
    }
}

function Button(x, y, w, h, img, subtext = '', callback) {
    this.x          = x;
    this.y          = y;
    this.w          = w;
    this.h          = h;
    this.img        = img;
    this.subtext    = subtext;
    this.callback   = callback;

    this.isClicked = function() {
        if(mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
            return true;
        } return false;
    }

    this.draw = function() {
        fill(51);
        stroke(0); 
        strokeWeight(2);
        rect(this.x, this.y, this.w, this.h, 20, 20, 20, 20);
        image(this.img, this.x, this.y, this.w, this.h);
        textFont(font);
        textSize(28);
        fill(255, 255, 0);
        strokeWeight(1);
        text(this.subtext, this.x + this.w + 8, this.y + this.h);
    }

    this.check = function() {
        if(mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
            console.log("hm");
            this.callback();
        }
    }
}

function Board(w, h) {

    this.width  = w;
    this.height = h;
    this.tiles  = [];

    this.init = function() {

        for(var x = 0; x < this.width; x++) {
            var row = []
            for(var y = 0; y < this.height; y++) {
                row.push(new Tile(x, y, ((x+y)%2 == 0) ? color(0,0,0, 50) : color(255,255,255, 0)))
            }
            this.tiles.push(row);
        }

        initMap();
        sendBoardState();
    }

    this.draw = function() {
        this.tiles.forEach(function(row) {
            row.forEach(function(tile) {
                tile.draw();
            });
        });
    }
}

function Tile(x, y, c) {
    this.x  = x;
    this.y  = y;
    this.c  = c;
    this.p  = null;
    this.droppable = false;

    this.draw = function() {
        var size = zoom * (canW / board.height);
        var xpos = (this.x * size-1) - camX;
        var ypos = (this.y * size-1) - camY;

        if(this.x%4 == 0 && this.y%4 == 0) image(grass, xpos, ypos, size*4, size*4);

        fill(this.c);
        rect(xpos, ypos, size, size);

        if(gamestate == 'selection' && abs(this.x - xhover) < 5 && abs(this.y - yhover) < 5 && !choseStart) {
            fill(255, 50, 50, 150);
            rect(xpos, ypos, size, size);
        }
        if(gamestate == 'selection' && this.x == xhover && this.y == yhover && !choseStart) image(wKing, xpos, ypos, size, size);

        if(this.p != null) this.p.draw(this.x, this.y);

        this.droppable = false;
        if(carryingPiece != null) {

            var x = this.x;
            var y = this.y;
            var valid = false;
            var moves = carryingPiece.getAvailableMoves();
            moves.forEach(function(moveset){
                moveset.forEach(function(move){
                    if((x == carryingPiece.x + move[0] && y == carryingPiece.y + move[1])){
                        valid = true;

                        fill(51, 100);
                        noStroke();
                        circle(xpos + size/2, ypos + size/2, size/2);
                        stroke(0);
                    }
                });
            });
            this.droppable = valid;
        }
    }
}

function Piece(x, y, t, player, justBought=false) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.player = player;
    this.hide = false;
    this.justBought = justBought;
    this.isEnemy = false;
    this.deleteCheck = false;
    var cv = 0;
    
    if(t != 'W') {
        lobby.members.forEach(function(party){
            party.members.forEach(function(member){
                if(username == member.name) {
                    for(var i = 0; i < 5; i++){
                        if(party.members[i] != null)
                            if(party.members[i].name == player) cv = i+1;
                    }
                }
            });
        });
    
        switch(cv) {
            case 0:
            this.c = color(255, 255, 255);
            this.isEnemy = true;
            break;
            case 1:
            this.c = color(70, 130, 180);
            break;
            case 2:
            this.c = color(238, 130, 238);
            break;
            case 3:
            this.c = color(255, 165, 0);
            break;
            case 4:
            this.c = color(102, 51, 153);
        }
    }

    this.draw = function(x, y, float=false) {
        var size = zoom * (canW / board.height);
        var xpos = (x * size) - camX;
        var ypos = (y * size) - camY;
        var piece;

        switch(this.t) {
            case 'P':
                piece = wPawn;
            break;
            case 'B':
                piece = wBishop;
            break;
            case 'N':
                piece = wKnight;
            break;
            case 'R':
                piece = wRook;
            break;
            case 'Q':
                piece = wQueen;
            break;
            case 'K':
                piece = wKing;
            break;
            case 'W':
                piece = wall;
        }

        if(t != 'W') {
            tint(this.c);

            if(!float){
                if(!this.hide) image(piece, xpos, ypos, size, size);
            } else {
                image(piece, x - size/2, y - size/2, size, size);
            }
        } else {
            push();
            var n = e = s = w = total = 0;

            if(typeof board.tiles[x][y-1] !== 'undefined')
                if(board.tiles[x][y-1].p != null)
                    if(board.tiles[x][y-1].p.t == 'W') n = 1;

            if(typeof board.tiles[x+1] !== 'undefined')                        
                if(typeof board.tiles[x+1][y] !== 'undefined')
                    if(board.tiles[x+1][y].p != null)
                        if(board.tiles[x+1][y].p.t == 'W') e = 1;
        
            if(typeof board.tiles[x][y+1] !== 'undefined')
                if(board.tiles[x][y+1].p != null)
                    if(board.tiles[x][y+1].p.t == 'W') s = 1;

            if(typeof board.tiles[x-1] !== 'undefined')                        
                if(typeof board.tiles[x-1][y] !== 'undefined')
                    if(board.tiles[x-1][y].p != null)
                        if(board.tiles[x-1][y].p.t == 'W') w = 1;

            total = n + e + s + w;

            translate((xpos+size) - size/2, (ypos+size) - size/2);

            if(total == 1) {
                piece = wallone;
                rotate( (90*e) + (180*s) + (270*w) );
            } else if(total == 2) {
                if(n + s == 2) {
                    piece = walllog;
                } else if(e + w == 2) {
                    piece = walllog;
                    rotate(90);
                } else {
                    piece = wallang;
                    if(e + s == 2) {
                        rotate(90);
                    } else if(s + w == 2) {
                        rotate(180);
                    } else if(w + n == 2) {
                        rotate(270);
                    }
                }
            } else if(total == 3) {
                piece = wallthree;
                if(n == 0) {
                    rotate(90);
                } else if(e == 0) {
                    rotate(180);
                } else if(s == 0) {
                    rotate(270);
                }
            } else if(total == 4) {
                piece = wallfour;
            } else if(!this.deleteCheck) {
                // var rand = floor(random(0, 10))
                // this.deleteCheck = true;
                // if(rand < 2) board.tiles[x][y].p = null;
            }

            image(piece, -size/2, -size/2, size, size);
            pop();
        }
        
        noTint();
    }

    this.getAvailableMoves = function(x, y) {
        switch(this.t) {
            case 'P':
                return [[[-1,1]],[[0,1]],[[1,1]],[[-1,0]],[[1,0]],[[-1,-1]],[[0,-1]],[[1,-1]]];
            case 'N':
                return [[[-2,1]],[[-1,2]],[[1,2]],[[2,1]],[[2,-1]],[[1,-2]],[[-1,-2]],[[-2,-1]]];
            case 'B':
                return [[[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]],
                        [[1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7]],
                        [[-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7]],
                        [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]];
            case 'R':
                return [[[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
                        [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7]],
                        [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
                        [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0]]];
            case 'Q':
                return [[[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]],
                        [[1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7]],
                        [[-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7]],
                        [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]],
                        [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
                        [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7]],
                        [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
                        [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0]]];
            case 'K':
                return [[[-1,1]],[[0,1]],[[1,1]],[[-1,0]],[[1,0]],[[-1,-1]],[[0,-1]],[[1,-1]]];
        }
    }
}

function mouseWheel(event) {
    if(gamestate != 'pregame') {
        var scale = 5 * 133.3333282470703;

        zoom -= event.delta / scale;

        if(zoom < 1)    zoom = 1;
        if(zoom > 5)    zoom = 5;
    }
}

function camOff() {
    if(gamestate != 'pregame') {
        if(mouseButton === RIGHT && mouseX > 0 && mouseY > 0 && mouseX < canW && mouseY < canH && mouseIsPressed) {
            camX = (startX - mouseX);
            camY = (startY - mouseY);
        }

        if(camX < -100) camX = -100;
        if(camY < -100) camY = -100;

        var xMax = (canW*zoom) - canW;
        var yMax = (canW*zoom) - canH;

        if(camX > xMax + 100) camX = xMax + 100;
        if(camY > yMax + 100) camY = yMax + 100;
    }
}

function mouseHover() {
    var size = zoom * (canW / board.height);
    xhover = floor((mouseX + camX) / size);
    yhover = floor((mouseY + camY) / size);
}

function mousePressed() {
    if(mouseButton === RIGHT && mouseX > 0 && mouseY > 0 && mouseX < canW && mouseY < canH) {
        startX = mouseX + camX;
        startY = mouseY + camY;
    }

    if(mouseButton === LEFT) {

        if(gamestate == 'selection' && !choseStart) {
            var xpos = board.tiles[xhover][yhover].x;
            var ypos = board.tiles[xhover][yhover].y;
            if(board.tiles[xhover][yhover].p == null) {
                board.tiles[xhover][yhover].p = new Piece(xpos, ypos, 'K', username);
                socket.emit('choseStart');
                sendBoardState();
                choseStart = true;
            }
        }

        if(gamestate == 'gameStart' && !isCountdown) {

            hud.buttons.forEach(function(button){
                button.check();
            });

            if(carryingPiece == null) {
                if(board.tiles[xhover][yhover].p != null) {
                    if(board.tiles[xhover][yhover].p.player == username) {
                        board.tiles[xhover][yhover].p.hide = true;
                        carryingPiece   = board.tiles[xhover][yhover].p;
                    }
                }
            }
        }
    }
}

function mouseReleased() {
    if(mouseButton === LEFT) {
        if(gamestate == 'gameStart' && !isCountdown) {
            if(carryingPiece != null) {
                if(board.tiles[xhover][yhover].p == null) {
                    if(board.tiles[xhover][yhover].droppable || carryingPiece.justBought){
                        board.tiles[carryingPiece.x][carryingPiece.y].p = null;
                        carryingPiece.x                                 = xhover;
                        carryingPiece.y                                 = yhover;
                        carryingPiece.hide                              = false;
                        carryingPiece.justBought                        = false;
                        board.tiles[xhover][yhover].p                   = carryingPiece;
                    } else {
                        board.tiles[carryingPiece.x][carryingPiece.y].p.hide = false;
                    }
                    
                    sendBoardState();
                } else if (board.tiles[xhover][yhover].p.isEnemy) {
                    if(board.tiles[xhover][yhover].droppable || carryingPiece.justBought){

                        if(board.tiles[carryingPiece.x][carryingPiece.y].p.t == 'P') score += 1;
                        if(board.tiles[carryingPiece.x][carryingPiece.y].p.t == 'N') score += 3;
                        if(board.tiles[carryingPiece.x][carryingPiece.y].p.t == 'B') score += 3;
                        if(board.tiles[carryingPiece.x][carryingPiece.y].p.t == 'R') score += 5;
                        if(board.tiles[carryingPiece.x][carryingPiece.y].p.t == 'Q') score += 9;

                        board.tiles[carryingPiece.x][carryingPiece.y].p = null;
                        carryingPiece.x                                 = xhover;
                        carryingPiece.y                                 = yhover;
                        carryingPiece.hide                              = false;
                        board.tiles[xhover][yhover].p                   = carryingPiece;
                    } else {
                        board.tiles[carryingPiece.x][carryingPiece.y].p.hide = false;
                    }
                    
                    sendBoardState();
                } else {
                    board.tiles[carryingPiece.x][carryingPiece.y].p.hide = false;
                }
            }
            carryingPiece = null;
        }
    }
}

function startGame() {
    isCountdown = true;

    setTimeout(function(){
        countdown--;
        setTimeout(function(){
            countdown--;
            setTimeout(function(){
                isCountdown = false;
            }, 1000);
        }, 1000);
    }, 1000);
}

function buyPawn() {
    console.log("pawnme");
    if(score >= 1) {
        score -= 1;
        carryingPiece = new Piece(0, 0, 'P', username, true);
    }
}

function buyKnight() {
    if(score >= 3) {
        score -= 3;
        carryingPiece = new Piece(0, 0, 'N', username, true);
    }
}

function buyBishop() {
    if(score >= 3) {
        score -= 3;
        carryingPiece = new Piece(0, 0, 'B', username, true);
    }
}

function buyRook() {
    if(score >= 5) {
        score -= 5;
        carryingPiece = new Piece(0, 0, 'R', username, true);
    }
}

function buyQueen() {
    if(score >= 9) {
        score -= 9;
        carryingPiece = new Piece(0, 0, 'Q', username, true);
    }
}

// ======= BOARD STATE ======= //

// SEND
function sendBoardState() {
    var data = [];
    board.tiles.forEach(function(tileRow){
        var dataRow = [];
        tileRow.forEach(function(tile){
            if(tile.p != null) {
                dataRow.push({t: tile.p.t, p: tile.p.player});
            } else {
                dataRow.push(null);
            }
        });
        data.push(dataRow);
    });
    socket.emit('boardUpdate', data);
}

//RECIEVE
socket.on('boardUpdate', function(data) {
    var tiles = [];
    data.forEach(function(dataRow, x){
        var tileRow = [];
        dataRow.forEach(function(data, y){
            tile = new Tile(x, y, ((x+y)%2 == 0) ? color(0,0,0, 50) : color(255,255,255, 0));
            if(data != null) {
                tile.p = new Piece(x, y, data.t, data.p);
            }
            tileRow.push(tile);
        });
        tiles.push(tileRow);
    });

    board.tiles = tiles;
    console.log(tiles);
});

// ======= SOCKET EVENTS ======= //

socket.on('lobbyUpdate', function(l){
    currentLobby    = l;
    playerCount     = l.memberCount;
    gamestate       = l.gamestate;
});

socket.on('getUsernameCallback', function(user){
    username = user;
});

socket.on('gameStart', function() {
    startGame();
});

// ======= INIT MAP ======= //
function initMap() {
    for(var i = 0; i < 400; i ++) {
        var x = floor(random(0, 40));
        var y = floor(random(0, 40));

        board.tiles[x][y].p = new Piece(x, y, 'W', '');
    }
}
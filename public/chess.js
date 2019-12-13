// GLOBALS
var board;

zoom            = 1;
xoff            = 0;
yoff            = 0;
startX          = 0;
startY          = 0;
canvasWidth     = 0;

selectedTile    = null;
availableTiles  = [];



// PIECE IMAGES
var wPawn, 
    wKnight,
    wBishop,
    wRook,
    wQueen,
    wKing;

// P5 PRELOAD
function preload() {
    wPawn   = loadImage('assets/White_Pawn.png');
    wKnight = loadImage('assets/White_Knight.png');
    wBishop = loadImage('assets/White_Bishop.png');
    wRook   = loadImage('assets/White_Rook.png');
    wQueen  = loadImage('assets/White_Queen.png');
    wKing   = loadImage('assets/White_King.png');
}

// P5 SETUP
function setup() {
    var parent      = document.getElementById('chessContainer');
    canvasWidth     = Math.floor((parent.offsetWidth-60)*.6);

    board = new Board(24, 24, canvasWidth / 24)

    var c = createCanvas(canvasWidth, canvasWidth);
    c.parent('chessContainer');

    board.init();
}

// P5 DRAW
function draw() {
    background('#2C2F33');
    board.draw();
    if(!gameStarted) {
        fill(51, 51, 51, 50);
        rect(0, 0, canvasWidth, canvasWidth);
    }
}


// BOARD OBJECT
function Board(w, h, s) {
    this.width  = w;
    this.height     = h
    this.tileSize   = s;
    this.tiles      = [];

    this.init = function() {
        for(var x = 0; x < this.width; x++) {
            var row = [];
            for(var y = 0; y < this.height; y++) {
                row[y] = new Tile(x, y, this.tileSize, ((x+y)%2 == 0) ? color('#3a466e') : color('#a2afdb'));
            }
            this.tiles[x] = row;
        }
        // RED TEAM
        this.tiles[0][0].p = new Piece('K',     0,     canvasWidth / 24);
        this.tiles[1][1].p = new Piece('Q',     0,     canvasWidth / 24);
        this.tiles[0][1].p = new Piece('R',     0,     canvasWidth / 24);
        this.tiles[1][0].p = new Piece('R',     0,     canvasWidth / 24);
        this.tiles[0][2].p = new Piece('N',     0,     canvasWidth / 24);
        this.tiles[2][0].p = new Piece('N',     0,     canvasWidth / 24);
        this.tiles[0][3].p = new Piece('B',     0,     canvasWidth / 24);
        this.tiles[3][0].p = new Piece('B',     0,     canvasWidth / 24);
        this.tiles[4][0].p = new Piece('P',     0,     canvasWidth / 24);
        this.tiles[3][1].p = new Piece('P',     0,     canvasWidth / 24);
        this.tiles[2][1].p = new Piece('P',     0,     canvasWidth / 24);
        this.tiles[1][2].p = new Piece('P',     0,     canvasWidth / 24);
        this.tiles[1][3].p = new Piece('P',     0,     canvasWidth / 24);
        this.tiles[0][4].p = new Piece('P',     0,     canvasWidth / 24);

        // BLUE TEAM
        this.tiles[23][0].p = new Piece('K',    1,     canvasWidth / 24);
        this.tiles[22][1].p = new Piece('Q',    1,     canvasWidth / 24);
        this.tiles[23][1].p = new Piece('R',    1,     canvasWidth / 24);
        this.tiles[22][0].p = new Piece('R',    1,     canvasWidth / 24);
        this.tiles[23][2].p = new Piece('N',    1,     canvasWidth / 24);
        this.tiles[21][0].p = new Piece('N',    1,     canvasWidth / 24);
        this.tiles[23][3].p = new Piece('B',    1,     canvasWidth / 24);
        this.tiles[20][0].p = new Piece('B',    1,     canvasWidth / 24);
        this.tiles[19][0].p = new Piece('P',    1,     canvasWidth / 24);
        this.tiles[20][1].p = new Piece('P',    1,     canvasWidth / 24);
        this.tiles[21][1].p = new Piece('P',    1,     canvasWidth / 24);
        this.tiles[22][2].p = new Piece('P',    1,     canvasWidth / 24);
        this.tiles[22][3].p = new Piece('P',    1,     canvasWidth / 24);
        this.tiles[23][4].p = new Piece('P',    1,     canvasWidth / 24);

        // GREEN TEAM
        this.tiles[23][23].p = new Piece('K',   2,     canvasWidth / 24);
        this.tiles[22][22].p = new Piece('Q',   2,     canvasWidth / 24);
        this.tiles[23][22].p = new Piece('R',   2,     canvasWidth / 24);
        this.tiles[22][23].p = new Piece('R',   2,     canvasWidth / 24);
        this.tiles[23][21].p = new Piece('N',   2,     canvasWidth / 24);
        this.tiles[21][23].p = new Piece('N',   2,     canvasWidth / 24);
        this.tiles[23][20].p = new Piece('B',   2,     canvasWidth / 24);
        this.tiles[20][23].p = new Piece('B',   2,     canvasWidth / 24);
        this.tiles[19][23].p = new Piece('P',   2,     canvasWidth / 24);
        this.tiles[20][22].p = new Piece('P',   2,     canvasWidth / 24);
        this.tiles[21][22].p = new Piece('P',   2,     canvasWidth / 24);
        this.tiles[22][21].p = new Piece('P',   2,     canvasWidth / 24);
        this.tiles[22][20].p = new Piece('P',   2,     canvasWidth / 24);
        this.tiles[23][19].p = new Piece('P',   2,     canvasWidth / 24);

        // YELLOW TEAM
        this.tiles[0][23].p = new Piece('K',    3,     canvasWidth / 24);
        this.tiles[1][22].p = new Piece('Q',    3,     canvasWidth / 24);
        this.tiles[0][22].p = new Piece('R',    3,     canvasWidth / 24);
        this.tiles[1][23].p = new Piece('R',    3,     canvasWidth / 24);
        this.tiles[0][21].p = new Piece('N',    3,     canvasWidth / 24);
        this.tiles[2][23].p = new Piece('N',    3,     canvasWidth / 24);
        this.tiles[0][20].p = new Piece('B',    3,     canvasWidth / 24);
        this.tiles[3][23].p = new Piece('B',    3,     canvasWidth / 24);
        this.tiles[4][23].p = new Piece('P',    3,     canvasWidth / 24);
        this.tiles[3][22].p = new Piece('P',    3,     canvasWidth / 24);
        this.tiles[2][22].p = new Piece('P',    3,     canvasWidth / 24);
        this.tiles[1][21].p = new Piece('P',    3,     canvasWidth / 24);
        this.tiles[1][20].p = new Piece('P',    3,     canvasWidth / 24);
        this.tiles[0][19].p = new Piece('P',    3,     canvasWidth / 24);
    }

    this.draw = function() {
        if(mouseX > 0 && mouseY > 0 && mouseX < canvasWidth && mouseY < canvasWidth && gameStarted && mouseIsPressed) {
            xoff = startX - mouseX;
            yoff = startY - mouseY;

            if(xoff < -100) xoff = -100;
            if(yoff < -100) yoff = -100;

            if(xoff > 100*Math.pow(zoom, 3)) xoff = 100*Math.pow(zoom, 3);
            if(yoff > 100*Math.pow(zoom, 3)) yoff = 100*Math.pow(zoom, 3);
        }

        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                this.tiles[x][y].draw();
            }
        }
    }
}

// TILE OBJECT
function Tile(x, y, s, c) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.c = c;
    this.p = null;

    this.draw = function() {
        fill(this.c);
        if(this == selectedTile) 
            fill('#d411cd');
        if(containsObject(this, availableTiles))
            fill('#dba2d9')
        var size = this.s * zoom;
        var xpos = this.x * size - (xoff * zoom);
        var ypos = this.y * size - (yoff * zoom);
        rect(xpos, ypos, size, size);

        if(this.p != null) this.p.draw(this.x, this.y);
    }
}

// PIECE OBJECT
function Piece(t, cv, s) {
    this.t = t;
    this.cv = cv;
    this.s = s;
    
    switch(cv) {
        case 0:
        this.c = color(255, 0, 0);
        break;
        case 1:
        this.c = color(0, 0, 255);
        break;
        case 2:
        this.c = color(0, 255, 0);
        break;
        case 3:
        this.c = color(255, 255, 0);
    }

    this.draw = function(x, y) {
        var size = this.s * zoom;
        var xpos = x * size - (xoff * zoom);
        var ypos = y * size - (yoff * zoom);
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
        }

        tint(this.c);
        image(piece, xpos, ypos, size-6, size-6);
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

// SELECT TILE 
function mouseClicked() {
    if(mouseX > 0 && mouseY > 0 && mouseX < canvasWidth && mouseY < canvasWidth && gameStarted) {
        var xIndex = Math.floor((mouseX + (xoff * zoom))/(canvasWidth/24 * zoom));
        var yIndex = Math.floor((mouseY + (yoff * zoom))/(canvasWidth/24 * zoom));
        tempSelectedTile = board.tiles[xIndex][yIndex];

        var movedPiece = false;

        if(containsObject(tempSelectedTile, availableTiles)) {
            // MOVE PIECE
            tempSelectedTile.p = selectedTile.p;
            selectedTile.p = null;
            sendBoardState(board);
            movedPiece = true;
        }

        // FIND AVAILABLE TILES
        selectedTile = tempSelectedTile;
        availableTiles = [];

        if(selectedTile.p != null && !movedPiece) {
            if(selectedTile.p.cv == userColor && turn == userColor) {
                selectedTile.p.getAvailableMoves().forEach(function(moveset){
                    console.log(moveset);
                    var deadEnd = false;
                    moveset.forEach(function(move) {
                        if( (selectedTile.x + move[0]) >= 0 && (selectedTile.x + move[0]) < board.tiles.length &&
                            (selectedTile.y + move[1]) >= 0 && (selectedTile.y + move[1]) < board.tiles[0].length && !deadEnd) {
                                if(board.tiles[selectedTile.x + move[0]][selectedTile.y + move[1]].p == null) {
                                    availableTiles.push(board.tiles[selectedTile.x + move[0]][selectedTile.y + move[1]]);
                                } else {
                                    if(board.tiles[selectedTile.x + move[0]][selectedTile.y + move[1]].p.cv != userColor)
                                        availableTiles.push(board.tiles[selectedTile.x + move[0]][selectedTile.y + move[1]]);
                                    deadEnd = true;
                                }
                            }
                    });
                });
            }
        }
    }
}

// ZOOM
function mouseWheel(event) {
    zoom += event.delta/1000;

    if(zoom < 1)    zoom = 1;
    if(zoom > 3)    zoom = 3;
}

// OFFSET
function mousePressed() {
    if(mouseX > 0 && mouseY > 0 && mouseX < canvasWidth && mouseY < canvasWidth && gameStarted) {
        startX = mouseX + xoff;
        startY = mouseY + yoff;
    }
}

// CONTAINS OBJECT
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

// ======= BOARD STATE ======= //

// SEND
function sendBoardState(board) {
    var data = [];
    board.tiles.forEach(function(tileRow){
        var dataRow = [];
        tileRow.forEach(function(tile){
            if(tile.p != null) {
                dataRow.push({t: tile.p.t, c: tile.p.cv});
            } else {
                dataRow.push(null);
            }
        });
        data.push(dataRow);
    });
    socket.emit('boardUpdate', data);
    socket.emit('getTurn');
}

//RECIEVE
socket.on('boardUpdate', function(data) {
    var tiles = [];
    data.forEach(function(dataRow, x){
        var tileRow = [];
        dataRow.forEach(function(data, y){
            tile = new Tile(x, y, canvasWidth/24, ((x+y)%2 == 0) ? color('#3a466e') : color('#a2afdb'));
            if(data != null) {
                tile.p = new Piece(data.t, data.c, canvasWidth/24);
            }
            tileRow.push(tile);
        });
        tiles.push(tileRow);
    });

    board.tiles = tiles;
    console.log(tiles);
});
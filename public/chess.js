// GLOBALS
board   = new Board(24, 24, 30);

zoom    = 1;
xoff    = 0;
yoff    = 0;
startX  = 0;
startY  = 0;

selectedTile = null;

// PIECE IMAGES
var     bPawn,      wPawn, 
        bKnight,    wKnight,
        bBishop,    wBishop,
        bRook,      wRook,
        bQueen,     wQueen,
        bKing,      wKing;

// P5 PRELOAD
function preload() {
    Pawn   = loadImage('assets/Black_Pawn.png');
    wPawn   = loadImage('assets/White_Pawn.png');
    bKnight = loadImage('assets/Black_Knight.png');
    wKnight = loadImage('assets/White_Knight.png');
    bBishop = loadImage('assets/Black_Bishop.png');
    wBishop = loadImage('assets/White_Bishop.png');
    bRook   = loadImage('assets/Black_Rook.png');
    wRook   = loadImage('assets/White_Rook.png');
    bQueen  = loadImage('assets/Black_Queen.png');
    wQueen  = loadImage('assets/White_Queen.png');
    bKing   = loadImage('assets/Black_King.png');
    wKing   = loadImage('assets/White_King.png');
}

// P5 SETUP
function setup() {
    var c = createCanvas(720, 720);
    c.parent('chessContainer');

    board.init();
    board[0][23].p = new Piece("P", color(255,0,0));
}

// P5 DRAW
function draw() {
    background(51);
    board.draw();
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
                row[y] = new Tile(x, y, this.tileSize, ((x+y)%2 == 0) ? color(255) : color(0));
            }
            this.tiles[x] = row;
        }
    }

    this.draw = function() {
        if(mouseIsPressed) {
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
        if(this == selectedTile) fill(255, 0, 0);
        var size = this.s * zoom;
        var xpos = this.x * size - (xoff * zoom);
        var ypos = this.y * size - (yoff * zoom);
        rect(xpos, ypos, size, size);
    }
}

function Piece(t, c) {
    this.t = t;
    this.c = c;

    this.draw = function(x, y) {
        tint(this.c);
        switch(this.t) {
            case "P":
                image(wPawn, x, y)
                break;
        }
    }
}

function mouseClicked() {
    var xIndex = Math.floor((mouseX + (xoff * zoom))/(30 * zoom));
    var yIndex = Math.floor((mouseY + (yoff * zoom))/(30 * zoom));
    selectedTile = board.tiles[xIndex][yIndex];
}

// ZOOM
function mouseWheel(event) {
    zoom += event.delta/1000;

    if(zoom < 1)    zoom = 1;
    if(zoom > 3)    zoom = 3;
}

// OFFSET
function mousePressed() {
    startX = mouseX + xoff;
    startY = mouseY + yoff;
}
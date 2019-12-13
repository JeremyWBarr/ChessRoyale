// GLOBALS
var board;

zoom        = 1;
xoff        = 0;
yoff        = 0;
startX      = 0;
startY      = 0;
canvasWidth = 0;

selectedTile = null;

// PIECE IMAGES
var wPawn, 
    wKnight,
    wBishop,
    wRook,
    wQueen,
    wKing;

// P5 PRELOAD
function preload() {
    wPawn   = loadImage('assets/White_Pawn.png'););
    wKnight = loadImage('assets/White_Knight.png'););
    wBishop = loadImage('assets/White_Bishop.png');
    wRook   = loadImage('assets/White_Rook.png');;
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
    board.tiles[12][12].p = new Piece(wPawn, color(255,0,0));
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

        if(this.p != null) this.p.draw(this.x, this.y);
    }
}

function Piece(t, c) {
    this.t = t;
    this.c = c;

    this.draw = function(x, y) {
        var size = this.s * zoom;
        var xpos = this.x * size - (xoff * zoom);
        var ypos = this.y * size - (yoff * zoom);
        tint(this.c);
        image(this.t, xpos, ypos, size-5, size-5);
        noTint();
    }
}

function mouseClicked() {
    var xIndex = Math.floor((mouseX + (xoff * zoom))/(canvasWidth/24 * zoom));
    var yIndex = Math.floor((mouseY + (yoff * zoom))/(canvasWidth/24 * zoom));
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
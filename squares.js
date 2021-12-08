canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
context.strokeStyle = "#FFFFFF";

const TILESIZE = canvas.width / 50;
const INTERPOLATE = true;
const SHOWPOINTS = false;

const UPDATE = true;
const TIMESTEP = 100;

let squares = [];
let threshold = 0.5;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Square {
    constructor(value, x, y, neighbourX, neighbourY, neighbourXY) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.checkSolid();
        if (INTERPOLATE) {
            this.updateIsos(neighbourX, neighbourY, neighbourXY);
        } else {
            this.a = new Point(this.x*TILESIZE - TILESIZE*0.5, this.y*TILESIZE - TILESIZE);
            this.b = new Point(this.x*TILESIZE, this.y*TILESIZE - TILESIZE*0.5);
            this.c = new Point(this.x*TILESIZE - TILESIZE*0.5, this.y*TILESIZE);
            this.d = new Point(this.x*TILESIZE - TILESIZE, this.y*TILESIZE - TILESIZE*0.5);
        }
    }

    checkSolid() {
        this.solid = this.value < threshold ? 1 : 0;
    }

    updateIsos(neighbourX, neighbourY, neighbourXY) {
        this.a = new Point(this.x*TILESIZE - lerpPos(neighbourXY, neighbourY), this.y*TILESIZE - TILESIZE);
        this.b = new Point(this.x*TILESIZE, this.y*TILESIZE - lerpPos(neighbourY, this.value));
        this.c = new Point(this.x*TILESIZE - lerpPos(neighbourX, this.value), this.y*TILESIZE);
        this.d = new Point(this.x*TILESIZE - TILESIZE, this.y*TILESIZE - lerpPos(neighbourXY, neighbourX));
    }
}

// Assign values and initialize squares
for (let i = 0; i <= canvas.width / TILESIZE; i++) {
    squares[i] = [];
    for (let j = 0; j <= canvas.height / TILESIZE; j++) {
        let valueAtPoint = Math.random();

        if (!INTERPOLATE || i == 0 || j == 0) {
            let s = new Square(valueAtPoint, i, j);
            squares[i][j] = s;
        } else {
            let s = new Square(valueAtPoint, i, j, squares[i - 1][j].value, squares[i][j - 1].value, squares[i - 1][j - 1].value);
            squares[i][j] = s;
        }
    }
}

function updateSquares() {
    for (let i = 0; i <= canvas.width / TILESIZE; i++) {
        for (let j = 0; j <= canvas.height / TILESIZE; j++) {
            if (squares[i][j].value < 1) {
                squares[i][j].value += TIMESTEP / 100000;
            }
            squares[i][j].checkSolid();
            if (INTERPOLATE && !(i == 0 || j == 0)) {
                squares[i][j].updateIsos(squares[i - 1][j].value, squares[i][j - 1].value, squares[i - 1][j - 1].value);
            }
        }
    }
}

function drawMarchingSquares() {
    // March through squares and draw shape
    for (let i = 0; i <= canvas.width / TILESIZE; i++) {
        for (let j = 0; j <= canvas.height / TILESIZE; j++) {
            // Debug points
            if (SHOWPOINTS) {
                if (INTERPOLATE) {
                    drawPoint(i * TILESIZE, j * TILESIZE, TILESIZE / 10, squares[i][j].value);
                } else {
                    drawPoint(i * TILESIZE, j * TILESIZE, TILESIZE / 10, squares[i][j].solid);
                }    
            }
            // Check out of bounds
            if (i == 0 || j == 0) {
                continue;
            }
            // Lookup shape and draw
            index = 8*squares[i][j].solid + 4*squares[i - 1][j].solid + 2*squares[i][j - 1].solid + 1*squares[i - 1][j - 1].solid;
            draw_shape(index, squares[i][j]);
        }
    }
}
drawMarchingSquares();

if (UPDATE) {
    setInterval(function() {
        // Clear screen
        context.fillStyle = "#000000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        // Update squares values
        updateSquares();
        // Marching Squares algorithm
        drawMarchingSquares();
    }, TIMESTEP);
}

function lerpPos(v0, v1) {
    if (v0 == v1) {
        return;
    }
    if (v0 > v1) {
        return ((threshold - v0) / (v1 - v0)) * TILESIZE;
    } else {
        return ((v0 - threshold) / (v0 - v1)) * TILESIZE;
    }
}

function lerp(v0, v1, t) {
    return (1 - t) * v0 + t * v1;
}

function calculatePointColor(v) {
    let rgbColor = Math.round(lerp(0, 255, v));
    hexColor = rgbColor.toString(16);
    hexColor = hexColor.length == 1 ? "0" + hexColor : hexColor;
    return "#" + hexColor.repeat(3);
}

function draw_shape(index, s) {
    switch (index) {
        case 0:
            break;
        // Single point cases
        case 1:
            drawLine(s.a, s.d);
            break;
        case 2:
            drawLine(s.a, s.b);
            break;
        case 4:
            drawLine(s.c, s.d);
            break;
        case 8:
            drawLine(s.b, s.c);
            break;
        case 3:
            drawLine(s.b, s.d);
            break;
        case 5:
            drawLine(s.a, s.c);
            break;
        case 10:
            drawLine(s.a, s.c);
            break;
        case 12:
            drawLine(s.b, s.d);
            break;
        // Two point cases
        case 6:
            drawLine(s.a, s.d);
            drawLine(s.b, s.c);
            break;
        case 9:
            drawLine(s.a, s.b);
            drawLine(s.c, s.d);
            break;
        // Three point cases
        case 7:
            drawLine(s.b, s.c);
            break;
        case 11:
            drawLine(s.c, s.d);
            break;
        case 13:
            drawLine(s.a, s.b);
            break;
        case 14:
            drawLine(s.a, s.d);
            break;
        case 15:
            break;
        default:
            console.log("Error.");
    }
}

function drawLine(a, b) {
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
}

function drawPoint(x, y, r, v) {
    context.fillStyle = calculatePointColor(v);
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI);
    context.fill();
}

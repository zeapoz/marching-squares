canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
context.strokeStyle = "#FFFFFF";

const TILESIZE = 50;
let values = [];

for (let i = 0; i < canvas.height; i += TILESIZE) {
    values[i] = [];
    for (let j = 0; j < canvas.width; j += TILESIZE) {
        let valueAtPoint = Math.random();
        values[i][j] = valueAtPoint;
        drawPoint(i, j, TILESIZE / 5, valueAtPoint);
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

function drawLine(x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawPoint(x, y, r, v) {
    context.fillStyle = calculatePointColor(v);
    context.beginPath();
    context.arc(x + TILESIZE / 2, y + TILESIZE / 2, r, 0, 2 * Math.PI);
    context.fill();
}
const STEP = 5;
const SIZE = 30;
const SPACING = 0;
const SPEED = 20;

let LEFT = 37;
let RIGHT = 39;
let UP = 38;
let DOWN = 40;
let keys = [RIGHT, LEFT, UP, DOWN];

let ctx = $('#canvas')[0].getContext('2d');
let t_score = $('#score');
nbWidth = Math.round((window.innerWidth * 0.6) / (SIZE + SPACING));
nbHeight = Math.round((window.innerHeight * 0.8) / (SIZE + SPACING));
ctx.canvas.width = nbWidth * (SIZE + SPACING);
ctx.canvas.height = nbHeight * (SIZE + SPACING);
ctx.strokeStyle = '#9E9E9E';

$('#canvas').css({
    "border-color": "#607D8B",
    "border-width": "5px",
    "border-style": "solid"
});

$('input[type=radio][name=keyboardType]').change(function () {
    this.blur();
    let isArrows = this.id == 'keys_arrows';
    LEFT = isArrows ? 37 : 97;
    RIGHT = isArrows ? 39 : 99;
    UP = isArrows ? 38 : 101;
    DOWN = isArrows ? 40 : 98;
    keys = [RIGHT, LEFT, UP, DOWN];
    clearInterval(interval);
    startGame();
});

let nodes, food, score, interval;
startGame();

function startGame() {
    nodes = [{ x: 300, y: 300, d: RIGHT, q: [] }];
    food = { x: 0, y: 0 }
    score = 0;
    t_score.text("0");
    $('#gameover').hide();
    generateFood();
    interval = setInterval(draw, SPEED);
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    $.each(nodes, function (index, n) {
        updateNodePosition(index);
        ctx.fillStyle = '#00E676';
        ctx.fillRect(n.x, n.y, SIZE, SIZE);
    });

    ctx.fillStyle = '#0091EA';
    ctx.fillRect(nodes[0].x, nodes[0].y, SIZE, SIZE);

    ctx.fillStyle = '#FFA000';
    ctx.fillRect(food.x, food.y, SIZE, SIZE);
    drawGrid();

    checkCollision();
};

function drawGrid() {
    for (let x = 1; x <= nbWidth; ++x) {
        ctx.beginPath();
        ctx.moveTo(x * SIZE, 0);
        ctx.lineTo(x * SIZE, nbHeight * SIZE);
        ctx.stroke();
    }

    for (let y = 1; y <= nbHeight; ++y) {
        ctx.beginPath();
        ctx.moveTo(0, y * SIZE);
        ctx.lineTo(nbWidth * SIZE, y * SIZE);
        ctx.stroke();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * nbWidth) * SIZE;
    food.y = Math.floor(Math.random() * nbHeight) * SIZE;
    $.each(nodes, function (index, n) {
        if (n.x == food.x && n.y == food.y) {
            generateFood();
            return;
        }
    });
}

function checkCollision() {
    n = nodes[0];

    //check snake collision
    cls = false;
    for (let i = 1; i < nodes.length && !cls; ++i) {
        nd = nodes[i];
        if (n.x == nd.x && n.y == nd.y)
            cls = true;
    }

    //check border collision
    if (cls || (n.d == LEFT && n.x == 0) || (n.d == UP && n.y == 0)
        || (n.d == RIGHT && n.x >= (ctx.canvas.width - SIZE)) || (n.d == DOWN && n.y >= (ctx.canvas.height - SIZE))) {
        clearInterval(interval);
        $('#gameover').show();
        //document.body.style.backgroundColor = "#F44336";
    }

    //check food collision
    if (n.x == food.x && n.y == food.y) {
        t_score.text(++score);
        addNode(1);
        generateFood();
    }
}

function addNode(k) {
    for (let i = 0; i < k; ++i) {
        n = nodes[nodes.length - 1];
        ix = n.d === LEFT ? n.x + (SIZE + SPACING) : (n.d === RIGHT ? n.x - (SIZE + SPACING) : n.x);
        iy = n.d === UP ? n.y + (SIZE + SPACING) : (n.d === DOWN ? n.y - (SIZE + SPACING) : n.y);
        nodes.push({ x: ix, y: iy, d: n.d, q: [] });
    }
}

function updateNodePosition(idx) {
    node = nodes[idx];
    switch (node.d) {
        case LEFT:
            node.x -= STEP;
            break;
        case UP:
            node.y -= STEP;
            break;
        case RIGHT:
            node.x += STEP;
            break;
        case DOWN:
            node.y += STEP;
            break;
    }

    if (idx > 0) {
        if (node.q.length > 0) {
            if (((node.q[0].d == UP || node.q[0].d == DOWN) && node.x == node.q[0].x) || ((node.q[0].d == LEFT || node.q[0].d == RIGHT) && node.y == node.q[0].y)) {
                node.d = node.q[0].d;
                n = node.q.shift();
                if (idx < nodes.length - 1)
                    nodes[idx + 1].q.push(n);
            }
        }
    } else {
        if (node.q.length > 0) {
            if (((node.q[0] == LEFT || node.q[0] == RIGHT) && node.y % SIZE === 0) || ((node.q[0] == UP || node.q[0] == DOWN) && node.x % SIZE === 0)) {
                node.d = node.q.shift();
                if (nodes.length > 1)
                    nodes[idx + 1].q.push({ x: node.x, y: node.y, d: node.d });
            }
        }
    }
}

$("body").keydown(function (e) {
    dir = e.keyCode;
    if (keys.includes(dir)) {
        h = nodes[0];
        l = nodes.length;
        lastdir = h.q.length === 0 ? h.d : h.q[h.q.length - 1];

        if (((dir != lastdir) && (l > 1 && (
            (LEFT == lastdir && RIGHT != dir)
            || (RIGHT == lastdir && LEFT != dir)
            || (UP == lastdir && DOWN != dir)
            || (DOWN == lastdir && UP != dir))))
            || l == 1)
            nodes[0].q.push(e.keyCode);
    } else if (e.keyCode == 13) {
        clearInterval(interval);
        startGame();
    }
});

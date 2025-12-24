const canvas = document.getElementById('scribbleCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let paths = [];
let currentPath = [];

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

document.getElementById('scoreButton').addEventListener('click', scoreScribble);
document.getElementById('clearButton').addEventListener('click', clearCanvas);

function startDrawing(e) {
    drawing = true;
    currentPath = [{x: e.offsetX, y: e.offsetY}];
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    currentPath.push({x: e.offsetX, y: e.offsetY});
}

function stopDrawing() {
    drawing = false;
    if (currentPath.length > 1) {
        paths.push(currentPath);
    }
    currentPath = [];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths = [];
    document.getElementById('result').innerHTML = '';
}

function scoreScribble() {
    let totalScore = 0;
    let allMutations = [];
    for (let path of paths) {
        let res = analyzePath(path);
        totalScore += res.score;
        allMutations.push(...res.mutations);
    }
    let globalRes = analyzeGlobal(paths);
    totalScore += globalRes.score;
    allMutations.push(...globalRes.mutations);
    let tier = getTier(totalScore);
    let mutationsText = allMutations.length > 0 ? "Detected mutations: " + allMutations.join(", ") : "No mutations detected.";
    document.getElementById('result').innerHTML = `${mutationsText}<br>Your score: ${totalScore}<br>Tier: ${tier}`;
}

function analyzePath(path) {
    let mutations = [];
    let score = 0;
    let length = calculateLength(path);
    if (length < 200) {
        mutations.push("Short line (300)");
        score += 300;
    }
    if (isStraight(path)) {
        mutations.push("Straight line (1000)");
        score += 1000;
    }
    if (isZigzag(path)) {
        mutations.push("Zigzag (1200)");
        score += 1200;
    }
    if (isCurve(path)) {
        mutations.push("Curve (400)");
        score += 400;
    }
    if (isCircle(path)) {
        mutations.push("Circle (200)");
        score += 200;
    }
    if (isOval(path)) {
        mutations.push("Oval (250)");
        score += 250;
    }
    if (length < 10) {
        mutations.push("Dot (50)");
        score += 50;
    }
    if (isClosed(path)) {
        mutations.push("Closed shape (1000)");
        score += 1000;
    }
    return {score, mutations};
}

function analyzeGlobal(paths) {
    let mutations = [];
    let score = 0;
    // Intersections
    for (let i = 0; i < paths.length; i++) {
        for (let j = i + 1; j < paths.length; j++) {
            if (pathsIntersect(paths[i], paths[j])) {
                mutations.push("Two lines crossing (1800)");
                score += 1800;
            }
        }
    }
    // Add more global mutations here
    return {score, mutations};
}

function calculateLength(path) {
    let len = 0;
    for (let i = 1; i < path.length; i++) {
        len += Math.sqrt((path[i].x - path[i - 1].x) ** 2 + (path[i].y - path[i - 1].y) ** 2);
    }
    return len;
}

function isStraight(path) {
    if (path.length < 3) return true;
    let x1 = path[0].x, y1 = path[0].y;
    let x2 = path[path.length - 1].x, y2 = path[path.length - 1].y;
    let maxDev = 0;
    for (let p of path) {
        let dev = Math.abs((y2 - y1) * (p.x - x1) - (x2 - x1) * (p.y - y1)) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        if (isNaN(dev)) dev = 0;
        maxDev = Math.max(maxDev, dev);
    }
    return maxDev < 5;
}

function isZigzag(path) {
    if (path.length < 5) return false;
    let turns = 0;
    for (let i = 2; i < path.length; i++) {
        let v1 = {x: path[i - 1].x - path[i - 2].x, y: path[i - 1].y - path[i - 2].y};
        let v2 = {x: path[i].x - path[i - 1].x, y: path[i].y - path[i - 1].y};
        let dot = v1.x * v2.x + v1.y * v2.y;
        let mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
        let mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
        if (mag1 > 0 && mag2 > 0) {
            let cos = dot / (mag1 * mag2);
            let angle = Math.acos(Math.max(-1, Math.min(1, cos)));
            if (angle > Math.PI / 6) turns++;
        }
    }
    return turns >= 3;
}

function isCurve(path) {
    return !isStraight(path) && !isZigzag(path);
}

function isClosed(path) {
    if (path.length < 3) return false;
    let dist = Math.sqrt((path[0].x - path[path.length - 1].x) ** 2 + (path[0].y - path[path.length - 1].y) ** 2);
    return dist < 10;
}

function isCircle(path) {
    if (!isClosed(path)) return false;
    let center = {x: 0, y: 0};
    for (let p of path) {
        center.x += p.x;
        center.y += p.y;
    }
    center.x /= path.length;
    center.y /= path.length;
    let radii = path.map(p => Math.sqrt((p.x - center.x) ** 2 + (p.y - center.y) ** 2));
    let avgR = radii.reduce((a, b) => a + b) / radii.length;
    let varR = radii.reduce((a, b) => a + (b - avgR) ** 2, 0) / radii.length;
    return varR < 100;
}

function isOval(path) {
    return isClosed(path) && !isCircle(path);
}

function pathsIntersect(p1, p2) {
    for (let i = 1; i < p1.length; i++) {
        for (let j = 1; j < p2.length; j++) {
            if (segmentsIntersect(p1[i - 1], p1[i], p2[j - 1], p2[j])) return true;
        }
    }
    return false;
}

function segmentsIntersect(a, b, c, d) {
    let denom = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
    if (Math.abs(denom) < 1e-6) return false;
    let t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / denom;
    let u = -((a.x - b.x) * (a.y - c.y) - (a.y - b.y) * (a.x - c.x)) / denom;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function getTier(score) {
    if (score <= 1000) return "Tiny Spark: Your scribble is just waking up. A beginner's doodle.";
    if (score <= 5000) return "Line Jumper: Lines and curves are starting to dance, small chaos emerging.";
    if (score <= 10000) return "Curve Conjurer: Spirals, loops, and shapes are forming. You're shaping reality… on paper.";
    if (score <= 20000) return "Chaos Overlord: Absolute scribble mastery. Lines cross, loops swirl, and the paper can barely contain your power.";
    if (score <= 35000) return "Mutation God: Your scribbles are legendary. Even mathematicians would bow before your curves.";
    return "Quantum Scribbler: Your marks transcend space and time. Paper is now a multiverse.";
}
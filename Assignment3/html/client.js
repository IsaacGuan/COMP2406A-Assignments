let window_width = window.innerWidth;
let window_height = window.innerHeight;
let startX = 800;
let startY = 600;
let ball_radius = 15;

let timer;
let selectedBall;
let deltaX, deltaY;
let x_speed = 0;
let y_speed = 0;

let balls = [
	{ name: `ball1`, x: startX + ball_radius, y: startY - ball_radius, x_speed: 0, y_speed: 0, direction: [0, 0], color: `red` },
	{ name: `ball2`, x: startX + 45, y: startY - ball_radius, x_speed: 0, y_speed: 0, direction: [0, 0], color: `red` },
	{ name: `ball3`, x: startX + 75, y: startY - ball_radius, x_speed: 0, y_speed: 0, direction: [0, 0], color: `red` },
	{ name: `ball4`, x: startX + 120, y: startY - ball_radius, x_speed: 0, y_speed: 0, direction: [0, 0], color: `yellow` },
	{ name: `ball5`, x: startX + 150, y: startY - ball_radius, x_speed: 0, y_speed: 0, direction: [0, 0], color: `yellow` },
	{ name: `ball6`, x: startX + 180, y: startY - ball_radius, x_speed: 0, y_speed: 0, direction: [0, 0], color: `yellow` }
];

function drawCanvas() {
	let container1 = document.getElementById("canvas1");

	let ball_svg_s = "";
	let ball_svg_l = "";

	for (ball of balls) {
		ball_svg_s += `<ellipse rx=${ball_radius-5} cy=${ball.y} cx=${ball.x} stroke-width="5" stroke="grey" fill=${ball.color} />`;
		if (ball.y < 200) {
			ball_svg_l += `<ellipse rx=${(ball_radius-5)*3} cy=${ball.y*3} cx=${(ball.x-startX)*3} stroke-width="15" stroke="grey" fill=${ball.color} />`;
		}
	}

	container1.innerHTML = `<svg id="svg" xmlns="http://www.w3.org/2000/svg" width=${window_width} height=${window_height}>
	<ellipse rx="225" id="svg_1" cy="300" cx="300" stroke-width="75" stroke="blue" fill="#fff"/>
	<ellipse rx="75" id="svg_2" cy="300" cx="300" stroke-width="75" stroke="red" fill="#fff"/>
	<ellipse rx="75" id="svg_3" cy="100" cx=${startX+100} stroke-width="25" stroke="blue" fill="#fff"/>
	<ellipse rx="25" id="svg_4" cy="100" cx=${startX+100} stroke-width="25" stroke="red" fill="#fff"/>
	<line id="svg_5" y2=${startY} x2=${startX} y1="0" x1=${startX} stroke-width="1.5" stroke="#000" fill="none"/>
	<line id="svg_6" y2=${startY} x2= ${startX+200} y1=${startY} x1=${startX} stroke-width="1.5" stroke="#000" fill="none"/>
	<line id="svg_5" y2=${startY} x2=${startX+200} y1="0" x1=${startX+200} stroke-width="1.5" stroke="#000" fill="none"/>
	${ball_svg_s}
	${ball_svg_l}
	</svg>`;
}

function getBall(aCanvasX, aCanvasY) {
	for (ball of balls) {
		if ((aCanvasX > ball.x - ball_radius && aCanvasX < ball.x + ball_radius) &&
			(aCanvasY > ball.y - ball_radius && aCanvasY < ball.y + ball_radius)) {
			return ball;
		}
	}
	return null;
}

function handleMouseDown(e) {
	console.log("mouse down: " + e.pageX + ", " + e.pageY);
	selectedBall = getBall(e.pageX, e.pageY);

	console.log(selectedBall);

	if (selectedBall != null) {
		deltaX = selectedBall.x - e.pageX;
		deltaY = selectedBall.y - e.pageY;

		$("#canvas1").mousemove(handleMouseMove);
		$("#canvas1").mouseup(handleMouseUp);
	}

	e.stopPropagation();
	e.preventDefault();

	drawCanvas();
}

function handleMouseMove(e) {
	let curr_x = selectedBall.x;
	let curr_y = selectedBall.y;

	selectedBall.x = e.pageX + deltaX;
	selectedBall.y = e.pageY + deltaY;

	x_speed = selectedBall.x - curr_x;
	y_speed = selectedBall.y - curr_y;

	e.stopPropagation();

	drawCanvas();
}

function handleMouseUp(e) {
	selectedBall.x_speed = x_speed;
	selectedBall.y_speed = y_speed;

	e.stopPropagation();

	$("#canvas1").off("mousemove", handleMouseMove);
	$("#canvas1").off("mouseup", handleMouseUp);

	drawCanvas();
}

function updateBall(ball) {
	hitBoundary(ball);

	ball.direction = getDirection(ball);

	if (Math.abs(ball.y_speed) < 0.98) {
		ball.y_speed = 0;
	}
	if (Math.abs(ball.x_speed) < 0.98) {
		ball.x_speed = 0;
	}

	ball.y += ball.y_speed;
	ball.y_speed *= 0.95;

	ball.x += ball.x_speed;
	ball.x_speed *= 0.95;

	drawCanvas();
}

function getDirection(ball) {
	let dirc = [];

	if (ball.x_speed > 0) {
		if (ball.y_speed > 0) {
			dirc = [1, 1];
		} else {
			dirc = [1, -1];
		}
	} else {
		if (ball.y_speed > 0) {
			dirc = [-1, 1];
		} else {
			dirc = [-1, -1];
		}
	}

	return dirc;
}

function hitBoundary(movingBall) {
	if (movingBall.x < startX + ball_radius) {
		movingBall.x_speed = 0;
		movingBall.x = startX + ball_radius;
	} else if (movingBall.x > startX + 200 - ball_radius) {
		movingBall.x_speed = 0;
		movingBall.x = startX + 200 - ball_radius;
	}

	if (movingBall.y < ball_radius ) {
		movingBall.y_speed = 0;
		movingBall.y = ball_radius;
	} else if (movingBall.y > startY - ball_radius) {
		movingBall.y_speed = 0;
		movingBall.y = startY - ball_radius;
	}
}

function handleTimer() {
	for (ball of balls) {
		updateBall(ball);
	}
}

$(document).ready(function() {
	$("#canvas1").mousedown(handleMouseDown);
	drawCanvas();

	timer = setInterval(handleTimer,30);
});

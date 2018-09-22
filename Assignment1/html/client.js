let lines = [];
let words = [];

let wordBeingMoved;

let deltaX, deltaY;
let canvas = document.getElementById("canvas1");

function getWordAtLocation(aCanvasX, aCanvasY) {
	let context = canvas.getContext("2d");

	for (let i = 0; i < words.length; i++) {
		let wordWidth = context.measureText(words[i].word).width;

		if (Math.abs(words[i].x + wordWidth / 2 - aCanvasX) < wordWidth / 2 &&
			Math.abs(words[i].y - 15 / 2 - aCanvasY) < 15 / 2) {
			return words[i];
		}
	}
	return null;
}

let drawCanvas = function() {
	let context = canvas.getContext("2d");

	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = "15pt Arial";
	context.fillStyle = "blue";

	for (let i = 0; i < words.length; i++) {
		let data = words[i];
		context.fillText(data.word, data.x, data.y);
	}
}

function handleMouseDown(e) {
	let rect = canvas.getBoundingClientRect();

	let canvasX = e.pageX - rect.left;
	let canvasY = e.pageY - rect.top;
	console.log("mouse down:" + canvasX + ", " + canvasY);

	wordBeingMoved = getWordAtLocation(canvasX, canvasY);

	if (wordBeingMoved != null) {
		deltaX = wordBeingMoved.x - canvasX;
		deltaY = wordBeingMoved.y - canvasY;
		$("#canvas1").mousemove(handleMouseMove);
		$("#canvas1").mouseup(handleMouseUp);
	}

	e.stopPropagation();
	e.preventDefault();

	drawCanvas();
}

function handleMouseMove(e) {
	console.log("mouse move");

	let rect = canvas.getBoundingClientRect();
	let canvasX = e.pageX - rect.left;
	let canvasY = e.pageY - rect.top;

	wordBeingMoved.x = canvasX + deltaX;
	wordBeingMoved.y = canvasY + deltaY;

	e.stopPropagation();

	drawCanvas();
}

function handleMouseUp(e) {
	console.log("mouse up");

	e.stopPropagation();

	$("#canvas1").off("mousemove", handleMouseMove);
	$("#canvas1").off("mouseup", handleMouseUp);

	drawCanvas();
}

let ENTER = 13;

function handleKeyUp(e) {
	console.log("key UP: " + e.which);

	if (e.which == ENTER) {
		handleSubmitButton();
		$("#userTextField").val("");
	}

	e.stopPropagation();
	e.preventDefault();
}

function handleSubmitButton() {
	let userText = $("#userTextField").val();

	let context = canvas.getContext("2d");
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	let textDiv = document.getElementById("text-area");
	textDiv.innerHTML = `<p></p>`;

	lines = [];
	words = [];

	if (userText && userText != "") {
		let userRequestObj = { text: userText };
		let userRequestJSON = JSON.stringify(userRequestObj);
		$("#userTextField").val("");

		$.post("fetchSong", userRequestJSON, function(data, status) {
			console.log("data: " + data);
			console.log("typeof: " + typeof data);

			let responseObj = data;
			lines = responseObj.lyricsArray;

			let yValue = 30;

			for (line of lines) {
				if (line.length === 0) continue;

				let xValue = 20;

				textDiv.innerHTML = textDiv.innerHTML + `<p>${line}</p>`;

				line = line.split("[").join(" [");
				line = line.split("]").join("] ");

				let wordsInLine = line.split(/\s/);

				console.log(wordsInLine);

				for (aWord of wordsInLine) {
					words.push({ word: aWord, x:xValue, y:yValue });
					xValue += 9 + context.measureText(aWord).width;
				}

				yValue += 50;
			}

			drawCanvas();

			console.log(status);
		});
	}
}

$(document).ready(function() {
	$("#canvas1").mousedown(handleMouseDown);

	$(document).keyup(handleKeyUp);

	drawCanvas();
});

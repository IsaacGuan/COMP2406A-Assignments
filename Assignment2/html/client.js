let lines = [];
let words = [];

let wordBeingMoved;

let deltaX, deltaY;
let canvas = document.getElementById("canvas1");

function getWordAtLocation(aCanvasX, aCanvasY) {
	let context = canvas.getContext("2d");

	for (let i = 0; i < words.length; i++) {
		let wordWidth = context.measureText(words[i].word).width;

		if ((aCanvasX > words[i].x && aCanvasX < (words[i].x + wordWidth)) &&
			(aCanvasY > words[i].y - 20 && aCanvasY < words[i].y)) {
			return words[i];
		}
	}
	return null;
}

function drawCanvas() {
	let context = canvas.getContext("2d");

	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = "18pt Courier New";

	for (let i = 0; i < words.length; i++) {
		let data = words[i];
		if (data.lyric) {
			context.fillStyle = "blue";
			context.strokeStyle = "blue";
		}
		if (data.chord) {
			context.fillStyle = "green";
			context.strokeStyle = "green";
		}
		context.fillText(data.word, data.x, data.y);
		context.strokeText(data.word, data.x, data.y);
	}
}

function getCanvasMouseLocation(e) {
	let rect = canvas.getBoundingClientRect();

	let scrollOffsetX = $(document).scrollLeft();
	let scrollOffsetY = $(document).scrollTop();

	let canX = e.pageX - rect.left - scrollOffsetX;
	let canY = e.pageY - rect.top - scrollOffsetY;

	return { canvasX: canX, canvasY: canY };
}

function handleMouseDown(e) {
	let canvasMouseLoc = getCanvasMouseLocation(e);
	let canvasX = canvasMouseLoc.canvasX;
	let canvasY = canvasMouseLoc.canvasY;
	console.log("mouse down:" + canvasX + ", " + canvasY);

	wordBeingMoved = getWordAtLocation(canvasX, canvasY);
	if (wordBeingMoved != null ) {
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
	let canvasMouseLoc = getCanvasMouseLocation(e);
	let canvasX = canvasMouseLoc.canvasX;
	let canvasY = canvasMouseLoc.canvasY;

	console.log("move: " + canvasX + ", " + canvasY);

	wordBeingMoved.x = canvasX + deltaX;
	wordBeingMoved.y = canvasY + deltaY;

	e.stopPropagation();

	drawCanvas();
}

function handleMouseUp(e) {
	e.stopPropagation();

	$("#canvas1").off("mousemove", handleMouseMove);
	$("#canvas1").off("mouseup", handleMouseUp);

	drawCanvas();
}

let ENTER = 13;

function handleKeyUp(e) {
	if (e.which == ENTER) {
		handleSubmitButton();
		$("#userTextField").val("");
	}

	e.stopPropagation();
	e.preventDefault();
}

function parseChordProFormat(chordProLinesArray) {
	for (let i = 0; i < chordProLinesArray.length; i++) {
		chordProLinesArray[i] = chordProLinesArray[i].replace(/(\r\n|\n|\r)/gm, "");
	}

	let textDiv = document.getElementById("text-area");
	textDiv.innerHTML = "";

	for (let i = 0; i < chordProLinesArray.length; i++) {
		let line = chordProLinesArray[i];
		textDiv.innerHTML = textDiv.innerHTML + `<p>${line}</p>`;

		let lyricLine = "";

		for (let charIndex = 0; charIndex < line.length; charIndex++) {
			let ch = line.charAt(charIndex);
			if (ch == "]") {
				lyricLine = lyricLine + ch + " ";
			} else if (ch == "[") {
				lyricLine = lyricLine + " " + ch;
			} else lyricLine = lyricLine + ch;
		}

		let characterWidth = canvas.getContext("2d").measureText("m").width;

		lyricLine += " ";
		if (lyricLine.trim().length > 0) {
			let theLyricWord = "";
			let theLyricLocationIndex = -1;
			for (let j = 0; j < lyricLine.length; j++) {
				let ch = lyricLine.charAt(j);
				if (ch == " ") {
					if (theLyricWord.trim().length > 0) {
						let word = {
							word: theLyricWord,
							x: 40 + theLyricLocationIndex * characterWidth,
							y: 40 + i * 2 * 40 + 25
						};
						if (word.word.endsWith("]")) word.chord = "chord";
						else word.lyric = "lyric";
						words.push(word);
					}
					theLyricWord = "";
					theLyricLocationIndex = -1;
				} else {
					theLyricWord += ch;
					if (theLyricLocationIndex === -1) theLyricLocationIndex = j;
				}
			}
		}
	}
}

function handleSubmitButton() {
	let userText = $("#userTextField").val();
	if (userText && userText !== "") {
		let userRequestObj = { text: userText };
		let userRequestJSON = JSON.stringify(userRequestObj);
		$("#userTextField").val("");

		$.post("fetchSong", userRequestJSON, function(data, status) {
			console.log("data: " + data);
			console.log("typeof: " + typeof data);
			let responseObj = data;
			lines = [];
			words = [];
			if (responseObj.songLines) {
				lines = responseObj.songLines;
				parseChordProFormat(lines);
			}
			drawCanvas();
		});
	}
}

function transpose(semitones) {
	if(semitones === 0) return;
	for (let i = 0; i < words.length; i++) {
		if (words[i].chord) {
			words[i].word = transposeChord(words[i].word, semitones);
		}
	}
}

function transposeChord(aChordString, semitones) {
	console.log(`transposeChord: ${aChordString} by ${semitones}`);

	let RootNamesWithSharps = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
	let RootNamesWithFlats = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"];
	let rootNames = RootNamesWithSharps;
	let transposedChordString = "";
	for (let i = 0; i< aChordString.length; i++) {
		if (rootNames.findIndex(function(element) { return element === aChordString[i]; }) === -1) {
			if ((aChordString[i] !== "#") && (aChordString[i] !== "b")) transposedChordString += aChordString[i];
		} else {
			let indexOfSharp = -1;
			let indexOfFlat = -1;
			if (i < aChordString.length -1) {
				indexOfSharp = RootNamesWithSharps.findIndex(function(element) { return element === (aChordString[i] + aChordString[i+1]); });
				if (indexOfSharp !== -1) transposedChordString += RootNamesWithSharps[(indexOfSharp + 12 + semitones) % 12];
				indexOfFlat = RootNamesWithFlats.findIndex(function(element) { return element === (aChordString[i] + aChordString[i+1]); });
				if (indexOfFlat !== -1) transposedChordString += RootNamesWithFlats[(indexOfFlat + 12 + semitones) % 12];
			}
			if ((indexOfSharp === -1) && (indexOfFlat === -1)) {
				let index = rootNames.findIndex(function(element) { return element === aChordString[i]; });
				if (index !== -1) transposedChordString += rootNames[(index + 12 + semitones) % 12];
			}
		}
	}
	return transposedChordString;
}

function handleTransposeUpButton() {
	transpose(1);
	drawCanvas();
}

function handleTransposeDownButton(){
	transpose(-1);
	drawCanvas();
}

$(document).ready(function() {
	$("#canvas1").mousedown(handleMouseDown);

	$(document).keyup(handleKeyUp);

	drawCanvas();
})

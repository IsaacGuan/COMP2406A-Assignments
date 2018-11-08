let server = require("http").createServer(handler);
let io = require("socket.io")(server);
let fs = require("fs");
let url = require("url");

let ROOT_DIR = "html";

let MIME_TYPES = {
	css: "text/css",
	gif: "image/gif",
	htm: "text/html",
	html: "text/html",
	ico: "image/x-icon",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	js: "serverlication/javascript",
	json: "serverlication/json",
	png: "image/png",
	svg: "image/svg+xml",
	txt: "text/plain"
};

function get_mine(filename) {
	for (let ext in MIME_TYPES) {
		if (filename.indexOf(ext,filename.length - ext.length) !== -1) {
			return MIME_TYPES[ext];
		}
	}
	return MIME_TYPES["txt"];
}

function handler(request, response) {
	let urlObj = url.parse(request.url, true, false);
	console.log("\n============================");
	console.log("PATHNAME: " + urlObj.pathname);
	console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
	console.log("METHOD: " + request.method);
	
	let receivedData = "";
	
	request.on("data", function(chunk) {
		receivedData += chunk;
	})

	request.on("end", function() {
		console.log("received data: ", receivedData);
		console.log("type: ", typeof receivedData);

		if (request.method == "GET") {
			let filePath = ROOT_DIR + urlObj.pathname;
			if (urlObj.pathname === "/") filePath = ROOT_DIR + "/assignment3.html";

			fs.readFile(filePath, function(err, data) {
				if (err) {
					console.log(err);
					response.writeHead(404);
					response.end(JSON.stringify(err));
				}
				response.writeHead(200, { "Content-Type": get_mine(urlObj.pathname) });
				response.end(data);
			});
		}
	});
}

server.listen(3000);

let clientNumber = 0;

io.on("connection", function(socket) {
	clientNumber = Object.keys(io.sockets.connected).length;
	console.log("player number : " + clientNumber);
	socket.join("playground");

	if (clientNumber > 2) {
		socket.leave("playground", function() {
			console.log("you are leaving");
		});
	} else {
		socket.on("updateBall", function(data) {
			console.log(data);
			io.emit("updateBall",data);
		});
	}
});

console.log("Server Running at http://localhost:3000/ CNTL-C to quit");

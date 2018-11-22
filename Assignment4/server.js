const https = require("https")
const url = require("url")
const express = require("express");
const bodyParser = require("body-parser");
const server = express();

const PORT = process.env.PORT || 3000
const API_KEY = "2eb670a1003f3666dbb20b6318686071"

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

function sendResponse(data, res) {
	var page = 
	"<html>" +
		"<head>" + 
			"<title>Assignment 4</title>" +
			"<style>" +
				"div.searchbar { margin: 0 auto; text-align: center; }" +
				"div.grid { display: inline-block; margin-left: auto; margin-right: auto; float: left; border: 1px solid black; }" +
			"</style>" +
		"</head>" +
		"<body>" +
			"<div class='searchbar'>" +
				"<form method='post'>" +
					"<input name='ingredient'/>" +
					"<input type='submit' value='Submit'/>" +
				"</form>" +
			"</div><br>";
	if (data) {
		let dataParsed = JSON.parse(data);
		console.log(dataParsed);
		for (let i = 0; i < dataParsed.count; i++) {
			page += 
			"<div class='grid'>" +
				"<a href='" + dataParsed.recipes[i].source_url + "'>" +
				"<img src='" + dataParsed.recipes[i].image_url + "' alt='Recipe Image' width='400' height='300'></a>" +
				"<div>" + dataParsed.recipes[i].title + "</div>" +
			"</div>"; 
		}
	}
	page += 
		"</body>" +
	"</html>";
	res.end(page);
}

function parseData(serverResponse, res) {
	console.log("inside parseData:");
	let data = "";
	serverResponse.on("data", function (chunk) {
		data += chunk
	});
	serverResponse.on("end", function () {
		sendResponse(data, res);
	});
}

function getRecipes(ingredient, res){
	ingredient = ingredient.replace(/\s/g, '');
	const options = {
		host: "www.food2fork.com",
		path: `/api/search?key=${API_KEY}&q=${ingredient}`
	};
	https.request(options, function(apiResponse) {
		parseData(apiResponse, res);
	});
}

function handleGet(req, res) {
	let requestURL = req.url;
	let query = url.parse(requestURL).query;
	if (query != null) {
		let str = query.substring(query.indexOf("=") + 1);
		getRecipes(str, res);
	}
	else {
		sendResponse(null, res);
	}
}

server.get("/", function(req, res) { handleGet(req, res); });
server.get("/recipes", function(req, res) { handleGet(req, res); });

server.post("", function(req, res) {
	getRecipes(req.body.ingredient, res);
});

server.listen(PORT, function() {
	console.log(`Server is listening on PORT ${PORT} CNTL-C to quit`)
});

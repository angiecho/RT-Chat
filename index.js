var express = require('express'),
	http = require('http'),
	URL = require('url'),
	Github = require('github-api'),
	app = express(),
	server = require('http').createServer(app),
	mongoose = require('mongoose');
	
/*  Get envorinment variables for use with cloud server (e.g Heroku)
	or local port variables if application hosted locally
*/
var port = process.env.PORT||3700,	
	mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost';
	
// Connect to MongoDB
mongoose.connect (mongoUri, function(err){
	if(err){
		console.log(err);
	}
	else {
		console.log('Connected to Mongo');
	}
	
});

// Create a schema to store data with Mongoose
var chatSchema = mongoose.Schema({
	username: String,
	message: String,
	created: {type: Date, default: Date.now}
});

var chat = mongoose.model('messages', chatSchema);
 
app.get("/", function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public')); // Connect to front-end logic

var io = require('socket.io').listen(server);

var github = new Github({
	apiUrl: "https://api.github.com"
});

// Execute upon connection with a client
io.sockets.on('connection', function (socket) {
	
	// Retrieve chat logs passed through "docs"
	chat.find(function(err, docs){
		if(err) console.log(err);
		else {
			chatHead = docs.length;
		}
	});
	
	//Load 10 previous messages in history by most recent
	//chatHead tracks of the top/head of the history shown
	var chatHead = 0;
	var loadten = 10;
	socket.on('load', function (data) {
		chat.find(function(err, docs){
			if(err) console.log(err);
			else {
				if (chatHead > 0){
					var chatTail = chatHead;
					chatHead = chatHead - loadten;
					if (chatHead < 0 ) 
						chatHead = 0;
					for (var i = chatTail - 1; i >= chatHead; i--){
						// Pass each chat log's username and message one at a time to 
						var logdata = {username: docs[i].username, message: docs[i].message}
						socket.emit('oldmessage', logdata);
					}
				}
				else {
					var logdata = {username: "Server",  message: ""}	//Tell client: no more messages
					socket.emit('oldmessage', logdata);
				}
			}
		});
	});
	
	
	// Receive message and username from client
	socket.on('send', function (data) {
		
		var msg = new chat(data);
		msg.save(function(err){	// Save our message in our "chat" collection
			if(err){
				console.log(err);
			}
			else {
				io.sockets.emit('newmessage', data);	// Pass the message to client side
			}
		});

    });
	
	//Show first 5 results from "/github" <arg> command or total_count size if less than 5
	var maxresult = 5;	
	socket.on('searchgithub', function (data) {
		var command = "/github " + data;
		var result = "";
		socket.emit('commandresult',{command:command, result: result});
		var search = github.getSearch(data + "+in%3Aname%2Cdescription%2Creadme&sort=updated&order=desc");
		search.repositories(null, function (err, repositories) {
			if (repositories.total_count < maxresult)
				maxresult = repositories.total_count;
			for (var i = 0; i < maxresult; i++){
				result = repositories.items[i];
				socket.emit('commandresult',{command:command, result: result});
			}
			
		});
	});
});

server.listen(port);

console.log("Listening on port " + port);
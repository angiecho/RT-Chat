var express = require('express'),
	http = require('http'),
	app = express(),
	server = require('http').createServer(app),
	mongoose = require('mongoose');
	
/*  Get envorinment variables for use with cloud server (e.g Heroku)
	or local port variables if application hosted locally
*/
var port = process.env.PORT||3700,	
	mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost';
	

mongoose.connect (mongoUri, function(err){
	if(err){
		console.log(err);
	}
	else {
		console.log('Connected');
	}
	
});

// Create a schema to store data with MongoDB
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

// Execute upon connection with a client
io.sockets.on('connection', function (socket) {
	
	// Retrieve chat logs passed through "docs"
	chat.find(function(err, docs){
		if(err) console.log(err);
		else {
			var maxlog = docs.length;	// Set the number of past messages to be displayed.
			if (docs.length > 15)		// Max the number of past messages to show 14 most
				maxlog = 15;			// recent

			for (var i = docs.length - maxlog; i < docs.length; i++){
				// Pass each chat log's username and message one at a time to 
				var logdata = {username: docs[i].username, message: docs[i].message}
				socket.emit('message', logdata);
			}
			
		}
	});
	
	// Receive message and username from client
	socket.on('send', function (data) {
		var msg = new chat(data);
		msg.save(function(err){	// Save our message in our "chat" collection
			if(err){
				console.log(err);
			}
			else {
				io.sockets.emit('message', data);	// Pass the message to client side
			}
		});

    });
});

server.listen(port);

console.log("Listening on port " + port);
var WebSocketServer = require('websocket').Server;
var http = require('http');
var express = require('express');
var app = express();
var port = process.env.PORT||3700;
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/Chat', function(err){
	if(err){
		console.log(err);
	}
	else {
		console.log('Connected');
	}
	
});

var chatSchema = mongoose.Schema({
	username: String,
	message: String,
	created: {type: Date, default: Date.now}
});

var chat = mongoose.model('messages', chatSchema);
 
app.get("/", function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port);
console.log("http server listening on %d", port);
var io = require('socket.io').listen(server);



io.sockets.on('connection', function (socket) {
	socket.emit('message', { message: 'Please enter a name to begin chatting' });

	/*chat.find(function(err, docs){
		socket.emit('chatlog', {chatlog: docs});
		console.log(docs);
	});*/
	//Welcome message and save new messages
	socket.on('send', function (data) {
		var msg = new chat(data);
		msg.save(function(err, mymessage){

			if(err){
				console.log(err);
			}
			else {
				io.sockets.emit('message', data);
			}
		});

    });
});


console.log("Listening on port " + port);
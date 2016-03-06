var express = require('express');
var http = require('http');
var app = express();
var mongoose = require('mongoose');
var port = 3700;

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

server.listen(process.env.PORT||port);

console.log("Listening on port " + port);
var express = require("express");
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

var chat = mongoose.model('Message', chatSchema);
 
app.get("/", function(req, res){
    res.sendFile(__dirname + '/index.html');
});
 
app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
	socket.on('old messages', function(){
		chat.find(function(err, docs){
			socket.emit('database', docs);
		});
	});
	//Welcome message and save new messages
    socket.emit('message', { message: 'Please enter a name to begin chatting' });
   	socket.on('send', function (data) {
		var msg = new chat(data);
		msg.save(function(err, mymessage){

			if(err){
				console.log(err);
			}
			else {
				io.sockets.emit('message', data);
				console.log('Logged: \n', mymessage);
			}
		});

    });
});

console.log("Listening on port " + port);
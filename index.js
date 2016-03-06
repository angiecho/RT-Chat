var express = require('express');
var http = require('http');
var app = express();
var server = require('http').createServer(app);
var mongoose = require('mongoose');
var port = process.env.PORT||3700;
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost';
mongoose.connect (mongoUri, function(err){
//mongoose.connect('mongodb://localhost/Chat', function(err){
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

//var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	socket.emit('message', { message: 'Please enter a name to begin chatting' });
	
	chat.find(function(err, docs){
		socket.emit('chatlog', {chatlog: docs});
		console.log(docs);
	});
	
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

server.listen(port);

console.log("Listening on port " + port);
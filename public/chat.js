window.onload = function() {
 
    var messages = [];
    var socket = io.connect();
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
 
	socket.on('chatlog', function (docs) {
		for (var i = docs.length-1; i >=0; i--){
			content.innerHTML = docs;
			
		}
		
		/*var html = '';
		for(var i=0; i<docs.length; i++) {
			html += '<b>' + (docs[i].username ? messages[i].username : 'Server') + ': </b>';
			html += docs[i].message + '<br />';
			html += docs[i].created + '<br />';
		}
		content.innerHTML = html;
		content.scrollTop = content.scrollHeight;
		*/
		
    });
	
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
			content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });
 
    sendButton.onclick = sendMessage = function() {
        if(name.value == "") {
            alert("Please type your name!");
        } else {
            socket.emit('send', {username: name.value, message: field.value});
			field.value = "";
        }
    };
 
}

document.onkeydown = function(evt) {
if (evt.keyCode === 13 && ['name', 'field'].indexOf(document.activeElement.id) > -1 ) { sendMessage(); }
else { }
}
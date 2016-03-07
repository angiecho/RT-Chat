window.onload = function() {
 
    var messages = [];	// Stack to store all messages to be shown in chat window
    var socket = io.connect();
    var field = document.getElementById("field");	// Get message field
    var name = document.getElementById("name");		// Get name field
	var sendButton = document.getElementById("send"); 
    var content = document.getElementById("content");
 
 	// Execute on click of send button.
	// Client sends user's new message to server-side.
    sendButton.onclick = sendMessage = function() {
        if(name.value == "") {
            alert("Please type your name!");	// Require username from user
        } else {
            socket.emit('send', {username: name.value, message: field.value});
			field.value = "";	// Clear message field
        }
    };
	
	// Receive messages to be shown in chat window
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);	// Push messages onto stack 
            var html = '';			// Convert message data to html
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;	// Pass html to content div
			content.scrollTop = content.scrollHeight;	// Enable window scrolling
        } else {
            console.log("There is a problem:", data);
        }
    });
	

 
}

// On key down of "enter" (keyCode 13) execute sendMessage function
document.onkeydown = function(evt) {
	if (evt.keyCode === 13 && ['name', 'field'].indexOf(document.activeElement.id) > -1 ){
		sendMessage(); 
	}
}
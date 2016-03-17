window.onload = function() {
 
    var newmessages = [];	// Stack to store all messages to be shown in chat window
	var oldmessages = [];
	var html = '';
	var socket = io.connect();
    var field = document.getElementById("field");	// Get message field
    var name = document.getElementById("name");		// Get name field
	var sendButton = document.getElementById("send"); 
	var loadButton = document.getElementById("load");
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
	
	loadButton.onclick = function() {
		socket.emit('load');

    };
	
	// Receive messages to be shown in chat window
    socket.on('oldmessage', function (data) {
        if(data.message) {
			var temp = '';
			temp += '<b>' + (data.username ? data.username : 'Server') + ': </b>';
			temp += data.message + '<br />';
			html = temp + html;
            content.innerHTML = html;	// Pass html to content div
			content.scrollTop = content.scrollHeight;	// Enable window scrolling
        } else {
            console.log("There is a problem:", data);
        }
    });
	
	// Receive messages to be shown in chat window
    socket.on('newmessage', function (data) {
        if(data.message) {
            //newmessages.push(data);	// Push messages onto stack 
            var temp = '';			// Convert message data to html
            //for(var i=0; i<newmessages.length; i++) {
            temp += '<b>' + (data.username ? data.username : 'Server') + ': </b>';
            temp += data.message + '<br />';
			html = html + temp;
				
            //}
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
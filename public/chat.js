window.onload = function() {
 
	var html = '';
	var socket = io.connect();
    var field = document.getElementById("field");	// Get message field
    var name = document.getElementById("name");		// Get name field
	var sendButton = document.getElementById("send"); 
	var loadButton = document.getElementById("load");
    var content = document.getElementById("content");
 
 	// Execute on click of send button.
	// Client sends user's new message to server-side.
	// Check if message is a chat message or slash-command.
    sendButton.onclick = sendMessage = function() {
		var user = name.value;
		var input = field.value;
		
		if ((input[0] == '/' || input[0]=='\\') && input.length > 1){
			var cmd = input.match(/[a-z]+\b/)[0];
			var arg = input.substr(cmd.length+2, input.length);
			field.value = '';
			command(cmd, arg);
		}
		else if ((input[0] == '/' || input[0] == '\\') && input.length == 1){
			html = html + "<b>/github 'term' : </b>search for github repos related to 'term' and return 5 most recently updated<br />";
			content.innerHTML = html;	// Pass html to content div
			content.scrollTop = content.scrollHeight;	// Enable window scrolling
			field.value = '';
		}
        else {
			if(user == "") {
				alert("Please submit a username to send a message or enter '/' to see commands.");	// Require username from user
			} else {
					socket.emit('send', {username: user, message: input});
					field.value = "";	// Clear message field
			}
		}	
    };
	
	loadButton.onclick = function() {
		socket.emit('load');
    };
	
	// Receive messages to be shown in chat window
    socket.on('oldmessage', function (data) {
        if(data.username === "Server") {
			alert("No more messages in history!");
        } 
		else {
            var temp = '';
			temp += '<b>' + (data.username ? data.username : 'Server') + ': </b>';
			temp += data.message + '<br />';
			html = temp + html;
            content.innerHTML = html;	// Pass html to content div
			content.scrollTop = content.scrollHeight;	// Enable window scrolling
        }
    });
	
	// Receive messages to be shown in chat window
    socket.on('newmessage', function (data) {
        if(data.message) {
            var temp = '';			// Convert message data to html
            temp += '<b>' + (data.username ? data.username : 'Server') + ': </b>';
            temp += data.message + '<br />';
			html = html + temp;			// Add on to html stack
            content.innerHTML = html;	// Pass html to content div
			content.scrollTop = content.scrollHeight;	// Enable window scrolling
        } else {
            console.log("There is a problem:", data);
        }
    });
	
	// Receive results for the github command
	socket.on('commandresult', function (data) {
		console.log(data.result);
		var htmlurl = data.result.html_url;
		var fullname = data.result.full_name;
		var temp = '';
        if(data.result == "")
			temp += '<b><i>' + data.command + '</i></b><br />';	
		else{
			temp += '<i>' + fullname + ':   ' + '<u><a href="' + htmlurl + '"target="_blank">' + htmlurl+'</u></i></a><br />';		
        }
		html = html + temp;
        content.innerHTML = html;	// Pass html to content div
		content.scrollTop = content.scrollHeight;	// Enable window scrolling
    });
	
	// Check which command we got after reading '/', indicating a slash-command
	function command(cmd, arg) {
		switch (cmd) {
			case 'github':
				socket.emit('searchgithub', arg);
				break;
	 
			default:
				alert("That is not a valid command.");
	 
		}
	}
}

// On key down of "enter" (keyCode 13) execute sendMessage function
document.onkeydown = function(evt) {
	if (evt.keyCode === 13 && ['name', 'field'].indexOf(document.activeElement.id) > -1 ){
		sendMessage(); 
	}
}


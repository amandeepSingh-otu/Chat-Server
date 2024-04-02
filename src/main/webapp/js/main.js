let ws;
let code;
let rooms = {};
function newRoom(){
    // calling the ChatServlet to retrieve a new room ID
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/chat-servlet";
    clearMessageArea();
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => enterRoom(response)); // enter the room with the code
}
function clearMessageArea(){
    document.getElementById("messageArea").innerHTML = "";
}

function getRooms(){
    // calling the servlets to get the room code
    /*
    * This return codes in csv format like LKMNQ, ABCDE, .......
    */
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/room-info-servlets";
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => addRooms(response)); // enter the room with the code
}
function getUsers(){
    // calling the api to get the data about users in the room;
    /*
    * This return the users in csv format like Aman, josiah, simon ......
    */
    let callURL= "http://localhost:8080/WSChatServer-1.0-SNAPSHOT/user-Inroom-servlets/"+code;
    fetch(callURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain',
        },
    })
        .then(response => response.text())
        .then(response => addUsers(response));
}

//this will take the return response (user names) from api and split it and add to list
function addUsers(response){
    let users=response.split(",");
    let userList = document.getElementById("addUsers");
    userList.innerHTML=""
    if(users!=null){
        users.forEach(function(user) {
            let listItem = document.createElement("li");
            if(user.trim()!=="") {
                listItem.textContent = user.trim();
                userList.appendChild(listItem);
            }
        });
    }
}
//this will take the return response( room names) from api and split it and add to list as button
function addRooms(response){

    let users=response.split(",");
    //console.log(users);
    let userList = document.getElementById("addRooms");
    userList.innerHTML=""
    if(users!=null){
        users.forEach(function(user) {
            let listItem = document.createElement("li");
           // console.log("User trim"+user.trim());
            if(user.trim()!=="") {
                listItem.textContent = user.trim();
                userList.appendChild(listItem);
                getRoomMsgs(listItem,user.trim());
            }

        });
    }
}
// adds event listener to evey room list element that changes the chatroom to the one clicked
function getRoomMsgs(listItem, roomcode) {
    listItem.addEventListener('click', function(event) {
        clearMessageArea();

       enterRoom(roomcode);
        getRooms();
        getUsers();
    });
}




function timestamp() {
    let d = new Date(), minutes = d.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    return d.getHours() + ':' + minutes;
}


//this function takes code and let you enter the room, can be used to enter and existing room or new room
function enterRoom(response){

  //  console.log("enter room response"+response);
    code=response.substring(0,5)


    // refresh the list of rooms to show a new room if you created in list
    if(ws!==undefined){
        ws.close();
        ws=undefined;
    }
    refresh();
    // create the web socket
    ws = new WebSocket("ws://localhost:8080/WSChatServer-1.0-SNAPSHOT/ws/"+code);
    document.getElementById("roomMessage").innerHTML ="You are currently in the room "+code;
    // parse messages received from the server and update the UI accordingly
    ws.onmessage = function (event) {
        //console.log(event.data);
        // parsing the server's message as json
        let message = JSON.parse(event.data);
        // handle message
        document.getElementById("messageArea").innerHTML += "<p>[" + timestamp() + "]    " + message.message +"</p>";
        refresh();
    }

}

//Listen to the event of pressing key and send message to the server
let inputMessage=document.getElementById("chatInput");
inputMessage.addEventListener("keyup", function (event) {
    if (event.key === "Enter" && event.target.value!=null) {
        //we gonna send the room number in the message so it's easier on backend to identify the message
        let request = {"type": "chat","roomId":code, "msg": event.target.value};
        console.log(request);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(request));
            event.target.value = "";
        } else {
            console.error("WebSocket connection not open.");
        }
    }
});

//Listen to the event of clicking send button and send message to the server
function sendMessage(){
    refresh();
    if (inputMessage.value!=null) {
        let request = {"type": "chat","roomId":code, "msg": inputMessage.value};
        console.log(request);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(request));
            inputMessage.value = "";
        } else {
            console.error("WebSocket connection not open.");
        }
    }
}
//get the room initially
getRooms();

//update the data about rooms and users
function refresh(){
    //this refresh the list of room present
    getRooms();
    getUsers();
}


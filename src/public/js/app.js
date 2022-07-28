const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input")
    const value = input.value
    socket.emit("newMessage", input.value, roomName, () => {
        addMessage(`나 : ${value}`)
    })
    input.value = ""
}

function handleNameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input")
    const value = input.value
    socket.emit("nickname", input.value)
}

function showRoom(){
    room.hidden = false
    welcome.hidden = true
    const h3 = room.querySelector("h3")
    h3.innerText = `${roomName}방 입니다.`
    const msgform = room.querySelector("#msg")
    const nameform = room.querySelector("#name")
    msgform.addEventListener("submit", handleMessageSubmit)
    nameform.addEventListener("submit", handleNameSubmit)
}

function handleRoomSubmit(event){
    event.preventDefault()
    const input = form.querySelector("input")
    socket.emit("enterRoom", input.value, showRoom)
    //socket.emit("enterRoom", {payload : input.value}, () => {console.log("server is done")}) //socketIO Callback
    roomName = input.value
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `${roomName}방 (${newCount})`
    addMessage(`${user}(이)가 방에 입장하였습니다.`);
});

socket.on("bye", (user, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `${roomName}방 (${newCount})`
    addMessage(`${user}(이)가 방을 떠났습니다.`)
})

socket.on("newMessage", (message) => {
    addMessage(message);
})

socket.on("roomChange", (rooms) => {
    const roomList = welcome.querySelector("ul")
    roomList.innerHTML = ""
    if(rooms.length == 0 ){
        roomList.innerHTML = "";
        return
    }
    rooms.forEach(room => {
        const li = document.createElement("li")
        li.innerText = room
        roomList.append(li);
    })
})


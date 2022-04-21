// front 에서 server 소켓으로 연결
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
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);  // 내 대화창에 보이기 위해서
    });
    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}
function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    // argument => name, object, callback
    // 콜백함수는 마지막 argument 이어야 한다.
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName} (${newCount})`;
    addMessage(`${left} left`);
})

// (msg) => {addMessage(msg)} 와 같음
socket.on("new_message", addMessage);

socket.on("room_change", (romms) => {
    const rommsList = welcome.querySelector("ul");
    rommsList.innerHTML = "";
    romms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        rommsList.append(li);
    });
});
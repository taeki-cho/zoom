// front 에서 server 소켓으로 연결
const socket = io(); 

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    // argument => name, object, callback
    socket.emit("enter_room", {playload: input.value}, () => {
        console.log("serveris done!");
    });
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);
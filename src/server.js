import http from "http";
//import WebSocket from "ws";
//import SocketIO from "socket.io";
import { Server } from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');
//app.listen(3000, handleListen);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
}); // 관리자 화면 세팅 (추가적으로 로그인 정보도 만들 수 있음)
instrument(wsServer, {
    auth: false
})

// 방목록 갖고오기 
function publicRooms(){
    const {sockets: {adapter: {sids, rooms}}} = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

// 방에 참여자 수 갖고오기
function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {socket.to(room).emit("bye"), socket.nickname, countRoom(room) - 1});
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });
});

/* websocket 으로 작업했을 시
const wss = new WebSocket.Server({server});
const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from the Browser"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.playload}`));
            case "nickname":
                socket["nickname"] = message.playload;
        }
    });
}); */

httpServer.listen(3000, handleListen);
import http from "http";
import {Server} from "socket.io"
import {instrument} from "@socket.io/admin-ui"
import express from "express";
import { Socket } from "dgram";
import { nextTick } from "process";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req, res) => res.render("home"))

const httpServer = http.createServer(app)//http server
const wsServer = new Server(httpServer, {
    cors : {
        origin : ["https://admin.socket.io"],
        credentials : true
    }
})

instrument(wsServer, {
    auth : false
})

function publicRooms(){
    const {
        sockets : {
            adapter : {sids, rooms},
            },
        } = wsServer
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "누군가"
    socket.onAny((event)=> {
        console.log(wsServer.sockets.adapter)
        console.log(`Socket Event : ${event}`);
    })
    //socket connection event on server
    socket.on("enterRoom", (roomName, done) => {
        socket.join(roomName)
        done()
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("roomChange", publicRooms())
    });
    //socket disconnecting event on server
    socket.on("disconnecting", () => {
        socket.rooms.forEach(
            (room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
            );
    })
    socket.on("disconnect", () => {
        wsServer.sockets.emit("roomChange", publicRooms())
    })
    //socket newMessage event on server
    socket.on("newMessage", (msg, room, done) => {
        socket.to(room).emit("newMessage", `${socket.nickname} : ${msg}`)
        done()
    })
    socket.on("nickname", nickname => (socket["nickname"] = nickname))
})

//wsServer.on("connection", (socket) => { //socketIO Callback
    //socket.on("enterRoom", (msg, done) => {     
        //console.log(msg);
        // setTimeout(() => {
        //     done();
        // }, 10000)
    //})
//})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
const express = require("express");
var cors = require('cors');
const users = {};
const socketToRoom = {};

const https = require('https');

const fs = require('fs');
const app = express();
var key = fs.readFileSync( 'ssl/private.key');
var cert = fs.readFileSync('ssl/certificate.crt');
var options1 = {
  key: key,
  cert: cert,
  ca:fs.readFileSync('ssl/ca_bundle.crt')


};
var server = https.createServer(options1, app);

corsOptions=["*"];
app.use(cors(corsOptions));

const io = require("socket.io")(server, {
	cors: ["*"]
})

io.on("connection", (socket) => {
	socket.emit("me", socket.id)

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})

	socket.on("join room", data => {
        if (users[data.roomID]) {
            const length = users[data.roomID].length;
            if (length === 8) {
                socket.emit("room full");
        		console.log("Room Full");
                return;
            }
            if(users[data.roomID].includes(socket.id)){
                console.log("I am already in room");
                return;
            }
        	console.log("Room Joined");
            users[data.roomID].push({
                id : socket.id,
                userProfile : data.userProfile});
        } else {
        	console.log("New Room Created");
            users[data.roomID] = [{
                id : socket.id,
                userProfile : data.userProfile}];
        }
        socketToRoom[socket.id] = data.roomID;
        const usersInThisRoom = users[data.roomID].filter(user => user.id !== socket.id);
        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, userProfile : payload.userProfile });
    });

    socket.on("returning signal", payload => {
        // console.log(payload)
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id, userProfile : payload.userProfile });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(user => user.id !== socket.id);
            users[roomID] = room;
        }
        socket.broadcast.emit('user left',socket.id)
    });

    socket.on('sendmessage', (data) => {
        socket.broadcast.emit('receive message',data)
    })

    socket.on('change', (payload) => {
        socket.broadcast.emit('change',payload)
    });

    socket.on('audiochange', (studentId) => {
        socket.broadcast.emit('audiochange',studentId)
    });

    socket.on('videochange', (studentId) => {
        socket.broadcast.emit('videochange',studentId)
    });

    socket.on('filechange', (file) => {
        console.log(file,"filechange")
        socket.broadcast.emit('filechange',file)
    });


    socket.on('whiteboardChanged', (whiteboard) => {
        console.log("Whiteboard Changed")
        console.log(whiteboard,"here")
        socket.broadcast.emit('whiteboardChangeTransmit',whiteboard)
    });

    socket.on('whiteboardFileUploaded', (file) => {
        console.log("whiteboardFileUploaded Changed")
        console.log(file,"here")
        socket.broadcast.emit('whiteboardFileUploadedTransmit',file)
    });

    socket.on('whiteboardDisablChange', (studentId) => {
        socket.broadcast.emit('whiteboardDisabled',studentId)
    });
    socket.on('whiteboardAccessRequest', (studentId) => {
        socket.broadcast.emit('whiteboardAccessRequest',studentId)
        console.log(studentId)
    }
    );

    socket.on('class closed', () => {
        const roomID = socketToRoom[socket.id];
        delete users[roomID];
        socket.broadcast.emit('room closed')
    });

})


server.listen(3002, () => {
  console.log("server starting on port : " + 3002)
});

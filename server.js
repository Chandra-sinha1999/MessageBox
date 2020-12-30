const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./util/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./util/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botname = 'MessageBox bot';
//set static 
app.use(express.static(path.join(__dirname,'public')));

io.on('connection',socket =>{
    socket.on('joinRoom',({username,room}) => {

        const user = userJoin(socket.id,username,room);

        socket.join(user.room);//functionality to join a room
        //welcome current user
        socket.emit('message',formatMessage(botname,'Welcome to MessageBox!'));

        //Brodcast when a user connect
        socket.broadcast.to(user.room).emit(
            'message',
            formatMessage(botname,`${user.username} has joined the chat`)
        );
        
        //send users and room info
        io.to(user.room).emit('roomusers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //listen for chat message
    socket.on('chatMessage',msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });


    socket.on('disconnect',() => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit(
            'message',
            formatMessage(botname,`${user.username} has left the chat`)
            );
            
            //send users and room info
            io.to(user.room).emit('roomusers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

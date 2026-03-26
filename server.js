const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Yeh line Render.com ke liye bohat zaroori hai
const PORT = process.env.PORT || 3000; 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const rooms = {};

io.on('connection', function(socket) {
  console.log('User connected: ' + socket.id);

  // Google Login Room Logic
  socket.on('google-login', function(email) {
    socket.join(email);
    console.log('User joined Google account room:', email);
    socket.to(email).emit('peer-joined', socket.id);
  });

  // 5-Digit Code Logic
  socket.on('create-room', function(roomCode) {
    rooms[roomCode] = socket.id;
    socket.join(roomCode);
    console.log('Room created: ' + roomCode);
  });

  socket.on('join-room', function(roomCode) {
    if (rooms[roomCode]) {
      socket.join(roomCode);
      socket.to(roomCode).emit('peer-joined', socket.id);
    } else {
      socket.emit('room-not-found');
    }
  });

  socket.on('signal', function(data) {
    io.to(data.to).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('disconnect', function() {
    console.log('User disconnected: ' + socket.id);
  });
});

server.listen(PORT, function() {
  console.log(`FizShare server running on port ${PORT}`);
});
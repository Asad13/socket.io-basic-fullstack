const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const cors = require('cors');

const app = express();
app.use(cors());

/*
***************** Method 1 ***************
Note: The below approach works fine.

const server = app.listen(3000, () => {
  console.log(`server connected at port 3000`);
});
const io = socket(server, {
  cors: {
    origin: ['http://localhost:8080'],
  },
});
*/

app.get('/', (req, res) => {
  return res.json({ status: true, message: 'Hello from API' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'https://admin.socket.io'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('send-message', (roomId, message) => {
    if (!roomId) return;
    socket.to(roomId).emit('recieve-message', message);
  });

  socket.on('join-room', (roomId, cb) => {
    socket.join(roomId);
    cb(`Successfully joined the room with ID: ${roomId}`);
  });
});

// demo function to call database to get user name based on information from auth token
const getUsername = async (token) => {
  // Fetch username from database based on information from token
  return 'abcd';
};

const userIo = io.of('/user');
userIo.use(async (socket, next) => {
  if (socket.handshake.auth.token && socket.handshake.auth.token === '1234') {
    socket.uname = await getUsername(socket.handshake.auth.token);
    next();
  } else {
    next(new Error('Unauthorized'));
  }
});
userIo.on('connection', (socket) => {
  console.log(`User name: ${socket.uname}`);
});

instrument(io, {
  auth: {
    type: 'basic',
    username: 'admin',
    password: '$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS', // "changeit" encrypted with bcrypt
  },
});

server.listen(3000, () => {
  console.log(`server connected at port 3000`);
});

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

require('./sockets')(io);

server.listen(PORT, () => {
  console.log(`[SERVER] Suraksha Backend listening on port ${PORT}`);
});

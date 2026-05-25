module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join room based on role or incident ID
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`[SOCKET] ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  // Export io globally if needed, or attach to req in middleware
};

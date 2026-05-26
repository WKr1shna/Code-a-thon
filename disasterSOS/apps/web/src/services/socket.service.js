import { io } from 'socket.io-client';

class SocketService {
  socket = null;
  connect() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5050');
  }
  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

const socketService = new SocketService();
export default socketService;

import { useEffect, useState } from 'react';
import socketService from '../services/socket.service';

export default function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketService.connect();
    setConnected(true);
    return () => socketService.disconnect();
  }, []);

  return { connected };
}

import { Server as WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: HTTPServer) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Echo message for now
      ws.send(message);
    });
  });

  console.log('WebSocket server started');
}

export function broadcast(data: any) {
  if (!wss) return;
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
} 
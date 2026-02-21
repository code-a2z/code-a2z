import { createServer } from 'http';
import server from './src/server.js';
import { PORT } from './src/config/env.js';
import { initializeSocketIO } from './src/config/socket.io.js';

const httpServer = createServer(server);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Make io available globally if needed
server.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

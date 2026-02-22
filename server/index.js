import { createServer } from 'http';
import server from './src/server.js';
import { PORT } from './src/config/env.js';
import { initializeSocketIO } from './src/config/socket.io.js';
import connectDB from './src/config/db.js';

const httpServer = createServer(server);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Make io available globally if needed
server.set('io', io);

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server initialized`);
  });
}

start().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

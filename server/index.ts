import server from './src/server';
import { PORT } from './src/config/env';

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default server;

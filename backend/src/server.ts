// ENTRY POINT - IN DEVELOPMENT 
import app from './app/index.js';
import envConfig from './config/env.js';

console.log('envConfig', envConfig);

app.listen(envConfig.server.port, () => {
  console.log(`Server is running on http://localhost:${envConfig.server.port}`);
  console.log(`Environment: ${envConfig.server.environment.toUpperCase()}`);
});

process.env.NODE_ENV = 'test';
process.env.MONGODB_URL ??= 'mongodb://127.0.0.1:27017/code-a2z-nestjs-test';
process.env.JWT_SECRET_ACCESS_KEY ??= 'test-access-secret-not-for-production';
process.env.JWT_SECRET_REFRESH_KEY ??= 'test-refresh-secret-not-for-production';
process.env.JWT_ACCESS_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d';
process.env.JWT_REFRESH_COOKIE_MAX_AGE_MS ??= '604800000';
process.env.CLIENT_ORIGIN ??= 'http://localhost:5173';

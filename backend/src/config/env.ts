import dotenv from 'dotenv';

dotenv.config();

export enum AppEnv {
  PRODUCTION = 'production',
  STAGING = 'staging',
  TEST = 'test',
  DEVELOPMENT = 'development',
}

const APP_ENV = (process.env.APP_ENV ?? AppEnv.DEVELOPMENT) as AppEnv;

interface EnvConfig {
  server: {
    environment: AppEnv;
    port: number;
  };
  database: {
    mongodb: {
      url: string;
    };
  };
};

let envConfig: EnvConfig;

if (APP_ENV === AppEnv.PRODUCTION) {
  envConfig = {
    server: {
      environment: APP_ENV,
      port: 8000,
    },
    database: {
      mongodb: {
        url: `${process.env.MONGODB_URL}/${APP_ENV}-cloud?appName=Cluster0`,
      }
    }
  };
} else if (APP_ENV === AppEnv.STAGING) {
  envConfig = {
    server: {
      environment: APP_ENV,
      port: 8000,
    },
    database: {
      mongodb: {
        url: `${process.env.MONGODB_URL}/${APP_ENV}-cloud?appName=Cluster0`,
      }
    }
  };
} else if (APP_ENV === AppEnv.TEST) {
  envConfig = {
    server: {
      environment: APP_ENV,
      port: 8000,
    },
    database: {
      mongodb: {
        url: `mongodb://localhost:27017/${APP_ENV}-cloud`,
      }
    }
  };
} else {
  envConfig = {
    server: {
      environment: APP_ENV,
      port: 8000,
    },
    database: {
      mongodb: {
        url: `mongodb://localhost:27017/${APP_ENV}-cloud`,
      }
    }
  };
}

export default envConfig;

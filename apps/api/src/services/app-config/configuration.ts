function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const getConfig = (): AppConfig => {
  return {
    port: parseInt(process.env.PORT as string, 10) || 3000,
    appEnv: (process.env.APP_ENV as AppEnv) || AppEnv.DEV,
    jwtSecret: requireEnv('JWT_SECRET'),
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
      host: requireEnv('DB_HOST'),
      port: parseInt(process.env.DB_PORT as string, 10) || 54321,
      user: requireEnv('DB_USER'),
      password: requireEnv('DB_PASSWORD'),
      dbName: requireEnv('DB_NAME'),
    },
    cache: {
      host: process.env.REDIS_HOST as string,
      port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
      password: process.env.REDIS_PASSWORD as string,
    },
    mail: {
      from: process.env.MAIL_FROM as string,
      transportOptions: {
        host: process.env.MAIL_HOST as string,
        port: parseInt(process.env.MAIL_PORT as string, 10),
        auth: {
          user: process.env.MAIL_AUTH_USER as string,
          pass: process.env.MAIL_AUTH_PASS as string,
        },
      },
    },
  };
};

export interface AppConfig {
  port: number;
  appEnv: AppEnv;
  jwtSecret: string;
  logLevel: string;
  database: DbConfig;
  cache: CacheConfig;
  mail: MailConfig;
}

export enum AppEnv {
  DEV = 'dev',
  TEST = 'test',
  PROD = 'production',
}

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  dbName: string;
}

export interface CacheConfig {
  host: string;
  port: number;
  password: string;
}

export interface MailConfig {
  from: string;
  transportOptions: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
}
import { getConfig } from './configuration';
import { readFileSync } from 'fs';
import { join } from 'path';

const TEST_DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'secret';
const TEST_JWT_SECRET = process.env.TEST_JWT_SECRET || 'secret';
const TEST_MAIL_PASS = process.env.TEST_MAIL_PASS || 'any-password';
const TEST_MAIL_USER = process.env.TEST_MAIL_USER || 'any-user';

describe('config helper', () => {
  it('should be defined', () => {
    expect(getConfig).toBeDefined();
  });

  it('should return configs', () => {
    const env = readFileSync(join(process.cwd(), '.env.example'), 'utf8')
      .split('\n')
      .reduce((vars: any, i) => {
        const [variable, value] = i.split('=');
        vars[variable] = value;
        return vars;
      }, {});

    process.env = Object.assign(process.env, env);

    expect(getConfig()).toStrictEqual({
      cache: {
        host: 'localhost',
        password: '',
        port: 6379,
      },
      database: {
        dbName: 'api',
        host: 'localhost',
        password: TEST_DB_PASSWORD,
        port: 5432,
        user: 'postgres',
      },
      appEnv: 'dev',
      jwtSecret: TEST_JWT_SECRET,
      logLevel: 'debug',
      port: 3000,
      mail: {
        from: 'no-reply@insa.gov.et',
        transportOptions: {
          auth: {
            pass: TEST_MAIL_PASS,
            user: TEST_MAIL_USER,
          },
          host: '127.0.0.1',
          port: 1025,
        },
      },
    });
  });
});

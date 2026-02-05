import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { getConfig } from '../../services/app-config/configuration';
import { adminSeed } from './admin.seed';
import { departmentsSeed } from './departments.seed';
import { universitiesSeed } from './universities.seed';
import { universityCoordinatorsSeed } from './university-coordinators.seed';
import { applicationsSeed } from './applications.seed';
import { studentsSeed } from './students.seed';
import { internsSeed } from './interns.seed';
import { documentsSeed } from './documents.seed';
import { supervisorsSeed } from './supervisors.seed';

dotenv.config();

const {
  database: { host, port, password, user, dbName },
} = getConfig();

const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username: user,
  password,
  database: dbName,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/**/migrations/*.ts'],
  synchronize: false,
});

async function runSeedStep(
  name: string,
  fn: (ds: DataSource) => Promise<void>,
) {
  try {
    console.log(`🔸 Seeding ${name}...`);
    if (typeof fn === 'function') {
      await fn(AppDataSource);
      console.log(`✅ ${name} seeded`);
      return true;
    } else {
      console.warn(`⚠️  ${name} function not available, skipping`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error seeding ${name}:`, err);
    return false;
  }
}

async function runSeeds() {
  let anyFailed = false;

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🌱 Starting database seeding...');

    // Order: departments → supervisors → universities → coordinators → applications → students → interns → documents → admin
    if (!(await runSeedStep('departments', departmentsSeed))) anyFailed = true;
    if (!(await runSeedStep('supervisors', supervisorsSeed))) anyFailed = true;
    if (!(await runSeedStep('universities', universitiesSeed)))
      anyFailed = true;
    if (
      !(await runSeedStep(
        'university coordinators',
        universityCoordinatorsSeed,
      ))
    )
      anyFailed = true;
    if (!(await runSeedStep('applications', applicationsSeed)))
      anyFailed = true;
    if (!(await runSeedStep('students', studentsSeed))) anyFailed = true;
    if (!(await runSeedStep('interns', internsSeed))) anyFailed = true;
    if (!(await runSeedStep('documents', documentsSeed))) anyFailed = true;
    if (!(await runSeedStep('admin user', adminSeed))) anyFailed = true;

    if (anyFailed) {
      console.error('❌ One or more seed steps failed. Check logs above.');
      process.exit(1);
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

runSeeds();
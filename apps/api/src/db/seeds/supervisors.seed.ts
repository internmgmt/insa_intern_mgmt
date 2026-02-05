import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../../entities/user.entity';
import { DepartmentEntity } from '../../entities/department.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function supervisorsSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(UserEntity);
  const deptRepo = dataSource.getRepository(DepartmentEntity);

  const email = process.env.SUPERVISOR_SEED_EMAIL || 'supervisor@insa.gov.et';
  const password = process.env.SUPERVISOR_SEED_PASSWORD || 'Supervisor@123';

  console.log(`Checking existence for supervisor: ${email}`);

  // Check if supervisor already exists to avoid duplicates
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Supervisor "${email}" already exists, skipping...`);
    return;
  }

  // Try to find 'Software Development' department first, otherwise use first available
  let department = await deptRepo.findOne({ where: { name: 'Software Development' } });
  if (!department) {
    department = await deptRepo.findOne({ where: {} });
  }

  if (!department) {
    console.warn('⚠️  No departments found. Supervisor will be created without a department.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = userRepo.create({
    email,
    firstName: 'Supervisor',
    lastName: 'User',
    passwordHash: hashedPassword,
    role: UserRole.SUPERVISOR,
    departmentId: department?.id || null,
    isActive: true,
    isFirstLogin: true, 
  } as Partial<UserEntity>);

  await userRepo.save(user);

  console.log(`✅ Supervisor created: ${email}`);
  console.log(`   Password: ${password}`);
}
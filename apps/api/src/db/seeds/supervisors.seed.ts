import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserEntity } from '../../entities/user.entity';
import { DepartmentEntity } from '../../entities/department.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function supervisorsSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(UserEntity);
  const deptRepo = dataSource.getRepository(DepartmentEntity);

  const email = 'supervisor@insa.gov.et';

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Supervisor ${email} already exists, skipping...`);
    return;
  }

  let department = await deptRepo.findOne({ where: { name: 'Software Development' } });
  if (!department) {
    department = await deptRepo.findOne({ where: {} });
  }

  if (!department) {
    console.warn('⚠️  No departments found. Supervisor will be created without a department.');
  }

  const generatedPassword = generateSecurePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

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
  console.log(`⚠️  SECURITY NOTICE: Generated password: ${generatedPassword}`);
  console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!');
}

function generateSecurePassword(): string {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '@$!%*?&';
  
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += digits[crypto.randomInt(digits.length)];
  password += special[crypto.randomInt(special.length)];
  
  const allChars = uppercase + lowercase + digits + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
}
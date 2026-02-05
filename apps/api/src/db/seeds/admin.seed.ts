import { DataSource } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export async function adminSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(UserEntity);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@insa.gov.et' },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping...');
    return;
  }

  const generatedPassword = generateSecurePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  const adminUser = userRepository.create({
    email: 'admin@insa.gov.et',
    firstName: 'System',
    lastName: 'Administrator',
    passwordHash: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
    isFirstLogin: true,
  });

  await userRepository.save(adminUser);
  
  console.log('✅ Admin user created successfully');
  console.log('⚠️  SECURITY NOTICE: Default admin credentials:');
  console.log(`   Email: admin@insa.gov.et`);
  console.log(`   Password: ${generatedPassword}`);
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
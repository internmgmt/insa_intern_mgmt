import { DataSource } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

export async function adminSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(UserEntity);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@insa.gov.et' },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

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
}

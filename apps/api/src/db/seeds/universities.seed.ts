import { DataSource } from 'typeorm';
import { UniversityEntity } from '../../entities/university.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';

export async function universitiesSeed(dataSource: DataSource): Promise<void> {
  const universityRepository = dataSource.getRepository(UniversityEntity);
  const userRepository = dataSource.getRepository(UserEntity);

  const universities = [
    {
      name: 'Addis Ababa University',
      address: 'Addis Ababa, Ethiopia',
      contactEmail: 'info@aau.edu.et',
      contactPhone: '+251911000000',
      isActive: true,
      coordinator: {
        firstName: 'Samuel',
        lastName: 'Bekele',
        email: 'coordinator@aau.edu.et',
      },
    },
    {
      name: 'Adama Science and Technology University',
      address: 'Adama, Ethiopia',
      contactEmail: 'info@astu.edu.et',
      contactPhone: '+251911111111',
      isActive: true,
      coordinator: {
        firstName: 'Martha',
        lastName: 'Kebede',
        email: 'coordinator@astu.edu.et',
      },
    },
  ];

  for (const uni of universities) {
    const existing = await universityRepository.findOne({
      where: { name: uni.name },
    });
    if (existing) {
      console.log(`ℹ️  University "${uni.name}" already exists, skipping...`);
      continue;
    }

    const newUni = universityRepository.create({
      name: uni.name,
      address: uni.address,
      contactEmail: uni.contactEmail,
      contactPhone: uni.contactPhone,
      isActive: uni.isActive ?? true,
    });
    const savedUni = await universityRepository.save(newUni);
    console.log(`✅ University "${savedUni.name}" created successfully`);

    if (uni.coordinator && uni.coordinator.email) {
      const coordEmail = uni.coordinator.email.toLowerCase();
      const existingUser = await userRepository.findOne({
        where: { email: coordEmail },
      });
      if (existingUser) {
        console.log(
          `ℹ️  Coordinator "${coordEmail}" already exists, skipping user creation...`,
        );
        continue;
      }

      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const user = userRepository.create({
        email: coordEmail,
        firstName: uni.coordinator.firstName,
        lastName: uni.coordinator.lastName,
        passwordHash: hashedPassword,
        role: UserRole.UNIVERSITY,
        universityId: savedUni.id,
        isActive: true,
        isFirstLogin: true,
      });

      const savedUser = await userRepository.save(user);
      console.log(`✅ Coordinator user created: ${savedUser.email}`);
      console.log(`   Temporary password: ${temporaryPassword}`);
    }
  }
}

function generateTemporaryPassword(): string {
  const length = 12;
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specials = '@$!%*?&';
  const all = upper + lower + numbers + specials;

  let pwd = '';
  pwd += upper.charAt(Math.floor(Math.random() * upper.length));
  pwd += lower.charAt(Math.floor(Math.random() * lower.length));
  pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pwd += specials.charAt(Math.floor(Math.random() * specials.length));

  for (let i = pwd.length; i < length; i++) {
    pwd += all.charAt(Math.floor(Math.random() * all.length));
  }

  return pwd
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

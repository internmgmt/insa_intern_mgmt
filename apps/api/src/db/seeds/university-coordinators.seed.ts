import { DataSource } from 'typeorm';
import { UniversityEntity } from '../../entities/university.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcryptjs';
import { createTransport } from 'nodemailer';
import { coordinatorCredentialsTemplate } from '../../universities/templates/coordinator-email.template';

export async function universityCoordinatorsSeed(
  dataSource: DataSource,
): Promise<void> {
  const universityRepo = dataSource.getRepository(UniversityEntity);
  const userRepo = dataSource.getRepository(UserEntity);

  const transport = createTransport({
    host: process.env.MAIL_HOST || '127.0.0.1',
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    auth: {
      user: process.env.MAIL_AUTH_USER || '',
      pass: process.env.MAIL_AUTH_PASS || '',
    },
  });

  const universities = await universityRepo.find();

  for (const uni of universities) {
    const existingCoordinator = await userRepo.findOne({
      where: { universityId: uni.id, role: UserRole.UNIVERSITY },
    });

    if (existingCoordinator) {
      console.log(
        `ℹ️  Coordinator already exists for university "${uni.name}", skipping.`,
      );
      continue;
    }

    const tempPassword = generateTemporaryPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const coordinatorEmail = `coordinator@${uni.name.replace(/\s+/g, '').toLowerCase()}.edu.et`;

    const user = userRepo.create({
      email: coordinatorEmail,
      firstName: 'Coordinator',
      lastName: uni.name.split(' ')[0] || 'Coordinator',
      passwordHash: hashed,
      role: UserRole.UNIVERSITY,
      universityId: uni.id,
      isActive: true,
      isFirstLogin: true,
    });

    const saved = await userRepo.save(user);
    console.log(`✅ Created coordinator ${saved.email} for "${uni.name}"`);

    const { subject, html, text } = coordinatorCredentialsTemplate({
      firstName: saved.firstName,
      lastName: saved.lastName,
      email: saved.email,
      temporaryPassword: tempPassword,
      loginUrl: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login`
        : 'http://localhost:3000/login',
    });

    try {
      await transport.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@insa.gov.et',
        to: saved.email,
        subject,
        html,
        text,
      });
      console.log(`✉️  Sent coordinator credentials to ${saved.email}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${saved.email}:`, err);
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

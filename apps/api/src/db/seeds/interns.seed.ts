import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InternEntity } from '../../entities/intern.entity';
import { StudentEntity } from '../../entities/student.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { StudentStatus } from '../../common/enums/student-status.enum';
import { generateInternId } from '../../common/utils/intern-id.util';

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

export async function internsSeed(dataSource: DataSource): Promise<void> {
  const internRepo = dataSource.getRepository(InternEntity);
  const studentRepo = dataSource.getRepository(StudentEntity);
  const userRepo = dataSource.getRepository(UserEntity);

  const acceptedStudents = await studentRepo.find({
    where: { status: StudentStatus.ACCEPTED },
  });

  if (!acceptedStudents || acceptedStudents.length === 0) {
    console.log('ℹ️  No accepted students found, skipping interns seed...');
    return;
  }

  for (const student of acceptedStudents) {
    const existing = await internRepo.findOne({
      where: { studentId: student.id },
    });
    if (existing) {
      console.log(
        `ℹ️  Intern already exists for student ${student.studentId}, skipping...`,
      );
      continue;
    }

    let savedUser: UserEntity | null = null;
    if (student.email) {
      const email = student.email.toLowerCase();
      const existingUser = await userRepo.findOne({ where: { email } });
      if (!existingUser) {
        const tempPassword = generateTemporaryPassword();
        const hashed = await bcrypt.hash(tempPassword, 10);
        const user = userRepo.create({
          email,
          firstName: student.firstName,
          lastName: student.lastName,
          passwordHash: hashed,
          role: UserRole.INTERN,
          isActive: true,
          isFirstLogin: true,
        } as Partial<UserEntity>);
        savedUser = await userRepo.save(user);
        console.log(
          `✅ Created user for intern ${email} (temporary password: ${tempPassword})`,
        );
      } else {
        savedUser = existingUser;
      }
    }

    const internId = generateInternId(student.academicYear);
    const intern = internRepo.create({
      studentId: student.id,
      userId: savedUser ? savedUser.id : undefined,
      internId,
      status: 'ACTIVE',
      isActive: true,
    } as Partial<InternEntity>);

    const savedIntern = await internRepo.save(intern);
    console.log(
      `✅ Intern created for student ${student.studentId} -> internId ${internId} (id: ${savedIntern.id})`,
    );
  }
}

import { DataSource } from 'typeorm';
import { ApplicationEntity } from '../../entities/application.entity';
import { UniversityEntity } from '../../entities/university.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export async function applicationsSeed(dataSource: DataSource): Promise<void> {
  const applicationRepo = dataSource.getRepository(ApplicationEntity);
  const universityRepo = dataSource.getRepository(UniversityEntity);

  const university = (await universityRepo.find({ take: 1 }))[0];
  if (!university) {
    console.log('ℹ️  No universities found, skipping applications seed...');
    return;
  }

  const applications = [
    {
      academicYear: '2024/2025',
      officialLetterUrl: 'https://example.com/official-letter-2024.pdf',
      status: ApplicationStatus.PENDING,
      name: 'Application 2024/2025',
      universityId: university.id,
    },
    {
      academicYear: '2025/2026',
      officialLetterUrl: 'https://example.com/official-letter-2025.pdf',
      status: ApplicationStatus.PENDING,
      name: 'Application 2025/2026',
      universityId: university.id,
    },
  ];

  for (const app of applications) {
    const exists = await applicationRepo.findOne({
      where: { academicYear: app.academicYear, universityId: app.universityId },
    });
    if (exists) {
      console.log(
        `ℹ️  Application ${app.academicYear} for university ${app.universityId} already exists, skipping...`,
      );
      continue;
    }
    const newApp = applicationRepo.create({
      academicYear: app.academicYear,
      name: app.name ?? null,
      officialLetterUrl: app.officialLetterUrl,
      status: app.status,
      universityId: app.universityId,
    });
    await applicationRepo.save(newApp);
    console.log(
      `✅ Application ${app.academicYear} created for university ${app.universityId}`,
    );
  }
}

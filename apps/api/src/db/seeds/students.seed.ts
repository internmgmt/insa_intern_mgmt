import { DataSource } from 'typeorm';
import { StudentEntity, StudentStatus } from '../../entities/student.entity';
import { ApplicationEntity } from '../../entities/application.entity';

export async function studentsSeed(dataSource: DataSource) {
  const studentRepository = dataSource.getRepository(StudentEntity);
  const applicationRepository = dataSource.getRepository(ApplicationEntity);

  const applicationId = await applicationRepository.findOne({
    where: { academicYear: '2024/2025' },
  });

  if (!applicationId) {
    console.log('❌ Application not found for 2024/2025');
    return;
  }

  const studentsData = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      studentId: 'INSA-2025-001',
      fieldOfStudy: 'Computer Science',
      academicYear: '2024/2025',
      email: 'alice.johnson@student.example.edu',
      phone: '+251911000001',
      status: StudentStatus.ACCEPTED,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      studentId: 'INSA-2025-002',
      fieldOfStudy: 'Networking',
      academicYear: '2024/2025',
      email: 'bob.smith@student.example.edu',
      phone: '+251911000002',
      status: StudentStatus.ACCEPTED,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Charlie',
      lastName: 'Brown',
      studentId: 'INSA-2025-003',
      fieldOfStudy: 'Cybersecurity',
      academicYear: '2024/2025',
      email: 'charlie.brown@student.example.edu',
      phone: '+251911000003',
      status: StudentStatus.PENDING_REVIEW,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Diana',
      lastName: 'Prince',
      studentId: 'INSA-2025-004',
      fieldOfStudy: 'Software Development',
      academicYear: '2024/2025',
      email: 'diana.prince@student.example.edu',
      phone: '+251911000004',
      status: StudentStatus.REJECTED,
      rejectionReason: 'GPA below minimum requirement',
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Eve',
      lastName: 'White',
      studentId: 'INSA-2025-005',
      fieldOfStudy: 'Computer Science',
      academicYear: '2024/2025',
      email: 'eve.white@student.example.edu',
      phone: '+251911000005',
      status: StudentStatus.AWAITING_ARRIVAL,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Frank',
      lastName: 'Miller',
      studentId: 'INSA-2025-006',
      fieldOfStudy: 'Networking',
      academicYear: '2024/2025',
      email: 'frank.miller@student.example.edu',
      phone: '+251911000006',
      status: StudentStatus.ARRIVED,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Grace',
      lastName: 'Lee',
      studentId: 'INSA-2025-007',
      fieldOfStudy: 'Cybersecurity',
      academicYear: '2024/2025',
      email: 'grace.lee@student.example.edu',
      phone: '+251911000007',
      status: StudentStatus.PENDING_REVIEW,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Henry',
      lastName: 'Davis',
      studentId: 'INSA-2025-008',
      fieldOfStudy: 'Software Development',
      academicYear: '2024/2025',
      email: 'henry.davis@student.example.edu',
      phone: '+251911000008',
      status: StudentStatus.ACCEPTED,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Iris',
      lastName: 'Wilson',
      studentId: 'INSA-2025-009',
      fieldOfStudy: 'Computer Science',
      academicYear: '2024/2025',
      email: 'iris.wilson@student.example.edu',
      phone: '+251911000009',
      status: StudentStatus.PENDING_REVIEW,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
    {
      firstName: 'Jack',
      lastName: 'Taylor',
      studentId: 'INSA-2025-010',
      fieldOfStudy: 'Networking',
      academicYear: '2024/2025',
      email: 'jack.taylor@student.example.edu',
      phone: '+251911000010',
      status: StudentStatus.ACCEPTED,
      cvUrl: 'https://example.com/cv/sample.pdf',
      transcriptUrl: 'https://example.com/transcripts/sample.pdf',
    },
  ];

  for (const studentData of studentsData) {
    try {
      // Check if student already exists by studentId
      const existingStudent = await studentRepository.findOne({
        where: { studentId: studentData.studentId },
      });

      if (existingStudent) {
        console.log(
          `ℹ️  Student ${studentData.studentId} already exists, skipping...`,
        );
        continue;
      }

      const student = studentRepository.create({
        ...studentData,
        applicationId: applicationId.id,
      });

      await studentRepository.save(student);
      console.log(`✅ Student ${studentData.studentId} created`);
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation - student already exists
        console.log(
          `ℹ️  Student ${studentData.studentId} already exists (constraint check), skipping...`,
        );
      } else {
        throw error;
      }
    }
  }

  console.log('✅ students seeded');
}

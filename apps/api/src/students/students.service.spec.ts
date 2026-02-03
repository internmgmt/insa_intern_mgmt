import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentEntity } from '../entities/student.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { Repository } from 'typeorm';
import { StudentStatus } from '../common/enums/student-status.enum';
import { ApplicationsService } from '../applications/applications.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserRole } from '../common/enums/user-role.enum';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepo: Repository<StudentEntity>;

  const mockStudentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockApplicationsService = {
    getApplicationForStudentModification: jest.fn(),
  };

  const mockUser = { role: UserRole.UNIVERSITY, universityId: 'uni-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(StudentEntity),
          useValue: mockStudentRepo,
        },
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentRepo = module.get<Repository<StudentEntity>>(
      getRepositoryToken(StudentEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addStudent', () => {
    const appId = 'app-1';
    const createDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      studentId: 'ST-001',
      fieldOfStudy: 'CS',
      academicYear: '2024/2025',
    };

    it('should add a student to a pending application', async () => {
      mockApplicationsService.getApplicationForStudentModification.mockResolvedValue(
        { id: appId },
      );
      mockStudentRepo.findOne.mockResolvedValueOnce(null); // uniqueness check
      mockStudentRepo.create.mockReturnValue({
        ...createDto,
        applicationId: appId,
      });
      mockStudentRepo.save.mockResolvedValue({
        id: 's-1',
        ...createDto,
        status: StudentStatus.PENDING_REVIEW,
      });
      mockStudentRepo.findOne.mockResolvedValue({
        id: 's-1',
        ...createDto,
        status: StudentStatus.PENDING_REVIEW,
        application: { university: { name: 'Test' } },
      }); // Relations load

      const result = await service.addStudent(
        appId,
        createDto as any,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.data.studentId).toBe(createDto.studentId);
    });
  });

  describe('updateStudent', () => {
    const studentId = 's-1';
    const updateDto = { firstName: 'Updated' };

    it('should update a student', async () => {
      const student = {
        id: studentId,
        applicationId: 'app-1',
        firstName: 'Old',
      };
      mockStudentRepo.findOne.mockResolvedValueOnce(student); // check exist
      mockApplicationsService.getApplicationForStudentModification.mockResolvedValue(
        { id: 'app-1' },
      );
      mockStudentRepo.save.mockImplementation((s) => Promise.resolve(s));
      mockStudentRepo.findOne.mockResolvedValue({
        id: studentId,
        firstName: 'Updated',
        application: { university: { name: 'Test' } },
      }); // Reload relations

      const result = await service.updateStudent(
        studentId,
        updateDto,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe('Updated');
    });
  });

  describe('removeStudent', () => {
    it('should remove a student', async () => {
      const student = { id: 's-1', applicationId: 'app-1' };
      mockStudentRepo.findOne.mockResolvedValue(student);
      mockApplicationsService.getApplicationForStudentModification.mockResolvedValue(
        { id: 'app-1' },
      );
      mockStudentRepo.softRemove.mockResolvedValue(student);

      const result = await service.removeStudent('app-1', 's-1', mockUser);

      expect(result.success).toBe(true);
      expect(mockStudentRepo.softRemove).toHaveBeenCalled();
    });
  });

  describe('reviewStudent', () => {
    it('should accept a student pending review', async () => {
      const student = {
        id: 's-1',
        status: StudentStatus.PENDING_REVIEW,
        application: { university: { name: 'Test' } },
      };
      mockStudentRepo.findOne.mockResolvedValue(student);
      mockStudentRepo.save.mockImplementation((s) => Promise.resolve(s));

      const result = await service.reviewStudent('s-1', 'ACCEPT');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe(StudentStatus.ACCEPTED);
    });
  });
});

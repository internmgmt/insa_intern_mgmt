import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StudentsController } from '../src/students/students.controller';
import { StudentsService } from '../src/students/students.service';
import { ApplicationsService } from '../src/applications/applications.service';
import { StudentEntity } from '../src/entities/student.entity';
import { ApplicationEntity } from '../src/entities/application.entity';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { UserRole } from '../src/common/enums/user-role.enum';
import { ApplicationStatus } from '../src/common/enums/application-status.enum';
import { StudentStatus } from '../src/common/enums/student-status.enum';

describe('StudentsController (e2e)', () => {
  let app: INestApplication;

  // Shared state (reset per test)
  let studentsStore: StudentEntity[] = [];
  let applicationsStore: ApplicationEntity[] = [];

  const mockUser = {
    userId: 'admin-id',
    username: 'admin',
    roles: [UserRole.ADMIN],
    universityId: 'uni-1', // Added for university access checks
  };

  // Generic mock find implementation
  const mockFindOne = (store: any[]) =>
    jest.fn().mockImplementation(async (options) => {
      const where = options?.where || {};
      const id = where.id;
      if (id) {
        return store.find((s) => s.id === id) || null;
      }
      // Fallback for simple where checks
      return (
        store.find((item) => {
          return Object.keys(where).every((key) => {
            // Skip relations or complex objects
            if (typeof where[key] === 'object') return true;
            return item[key] === where[key];
          });
        }) || null
      );
    });

  const mockSave = (store: any[]) =>
    jest.fn().mockImplementation(async (entity) => {
      if (!entity.id) {
        entity.id = uuidv4();
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        store.push(entity);
      } else {
        const index = store.findIndex((i) => i.id === entity.id);
        if (index !== -1) {
          store[index] = { ...store[index], ...entity };
        } else {
          store.push(entity);
        }
      }
      return entity;
    });

  const mockStudentRepo = {
    find: jest.fn().mockImplementation(async () => studentsStore),
    findOne: mockFindOne(studentsStore),
    create: jest.fn().mockImplementation((dto) => dto),
    save: mockSave(studentsStore),
    remove: jest.fn().mockImplementation(async (entity) => {
      const index = studentsStore.findIndex((s) => s.id === entity.id);
      if (index !== -1) {
        studentsStore.splice(index, 1);
      }
      return entity;
    }),
    softRemove: jest.fn().mockImplementation(async (entity) => {
      const index = studentsStore.findIndex((s) => s.id === entity.id);
      if (index !== -1) {
        entity.deletedAt = new Date(); // soft delete simulation
        studentsStore[index] = { ...studentsStore[index], ...entity };
      }
      return entity;
    }),
    findAndCount: jest.fn().mockImplementation(async () => {
      // Basic filtering support for test
      const filtered = studentsStore;
      // Check where clause logic roughly
      return [filtered, filtered.length];
    }),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockImplementation(async () => [studentsStore, studentsStore.length]),
    })),
  };

  const mockApplicationRepo = {
    findOne: mockFindOne(applicationsStore),
    save: mockSave(applicationsStore),
    create: jest.fn().mockImplementation((dto) => dto),
    find: jest.fn().mockImplementation(async () => applicationsStore),
  };

  const mockApplicationsService = {
    getApplicationForStudentModification: jest
      .fn()
      .mockImplementation(async (appId) => {
        const app = applicationsStore.find((a) => a.id === appId);
        if (!app) throw new NotFoundException('Application not found');
        return app;
      }),
    findById: jest.fn().mockImplementation(async (id) => {
      const app = applicationsStore.find((a) => a.id === id);
      if (!app) throw new NotFoundException('Application not found');
      return { data: app };
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(StudentEntity),
          useValue: mockStudentRepo,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: mockApplicationRepo,
        },
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  beforeEach(() => {
    studentsStore.length = 0;
    applicationsStore.length = 0;

    const defaultApp = {
      id: 'app-default',
      status: ApplicationStatus.PENDING,
      academicYear: '2024/2025',
      universityId: 'uni-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      university: { id: 'uni-1', name: 'Test Uni' }, // Add university relation for mapper
    } as unknown as ApplicationEntity;
    applicationsStore.push(defaultApp);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a student', async () => {
    const createStudentDto = {
      firstName: 'E2E',
      lastName: 'Test',
      studentId: 'E2E-001',
      fieldOfStudy: 'SE',
      academicYear: '2024/2025',
      email: 'e2e@test.com',
      phone: '+251900000000',
    };

    return request(app.getHttpServer())
      .post(`/applications/app-default/students`)
      .send(createStudentDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.firstName).toBe('E2E');
        expect(studentsStore.length).toBe(1);
      });
  });

  it('should list students', async () => {
    studentsStore.push({
      id: 's-1',
      firstName: 'Seed',
      applicationId: 'app-default',
      status: StudentStatus.PENDING_REVIEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      application: applicationsStore[0], // link relation
    } as StudentEntity);

    return request(app.getHttpServer())
      .get(`/applications/app-default/students`)
      .query({ page: 1, limit: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.items.length).toBeGreaterThan(0);
      });
  });

  it('should update a student', async () => {
    studentsStore.push({
      id: 's-1',
      firstName: 'Seed',
      applicationId: 'app-default',
      status: StudentStatus.PENDING_REVIEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      application: applicationsStore[0],
    } as StudentEntity);

    return request(app.getHttpServer())
      .patch(`/applications/app-default/students/s-1`)
      .send({ firstName: 'UpdatedName' })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.firstName).toBe('UpdatedName');
      });
  });

  it('should review a student', async () => {
    studentsStore.push({
      id: 's-1',
      firstName: 'Seed',
      applicationId: 'app-default',
      status: StudentStatus.PENDING_REVIEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      application: applicationsStore[0],
    } as StudentEntity);

    return request(app.getHttpServer())
      .patch(`/students/s-1/review`)
      .send({ decision: 'ACCEPT' })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe(StudentStatus.ACCEPTED);
      });
  });

  it('should delete a student', async () => {
    studentsStore.push({
      id: 's-1',
      firstName: 'Seed',
      applicationId: 'app-default',
      status: StudentStatus.PENDING_REVIEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      application: applicationsStore[0],
    } as StudentEntity);

    return request(app.getHttpServer())
      .delete(`/applications/app-default/students/s-1`)
      .expect(200);
  });
});

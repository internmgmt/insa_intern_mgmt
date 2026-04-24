import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { UserRole } from '../common/enums/user-role.enum';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(InternEntity)
    private readonly internRepository: Repository<InternEntity>,
  ) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
  }

  async create(
    createDocumentDto: any,
    currentUser?: { role?: UserRole; id?: string; universityId?: string },
  ) {
    const {
      studentId,
      title,
      url,
      metadata,
      tags,
      isPublic,
      entityType,
      applicationId,
      documentType,
      type,
      category,
    } = createDocumentDto;

    const docType = documentType || type || category || null;
    if (!title || !url) {
      throw new BadRequestException({
        success: false,
        message: 'Title and url are required',
        error: { code: 'DOCUMENT_INVALID_PAYLOAD', details: null },
      });
    }
    this.validateUrl(url);

    if (currentUser?.role === UserRole.UNIVERSITY) {
      const allowed = ['OFFICIAL_LETTER', 'CV', 'TRANSCRIPT'];
      if (!allowed.includes(docType)) {
        throw new ForbiddenException({
          success: false,
          message:
            'Universities can only upload OFFICIAL_LETTER, CV, or TRANSCRIPT documents',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }
    if (currentUser?.role === UserRole.INTERN) {
      const allowedIntern = ['SUBMISSION'];
      if (!allowedIntern.includes(docType)) {
        throw new ForbiddenException({
          success: false,
          message: 'Interns can only upload submission files',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    let student = null;

    if (currentUser?.role === UserRole.UNIVERSITY) {
      if (docType === 'OFFICIAL_LETTER') {
        if (applicationId) {
          const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
          });
          if (!application) {
            throw new NotFoundException({
              success: false,
              message: 'Application not found',
              error: { code: 'APPLICATION_NOT_FOUND', details: null },
            });
          }
          if (application.universityId !== currentUser.universityId) {
            throw new ForbiddenException({
              success: false,
              message: 'You act on behalf of another university',
              error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
            });
          }
        }
      } else if (docType === 'CV' || docType === 'TRANSCRIPT') {
        if (studentId) {
          student = await this.studentRepository.findOne({
            where: { id: studentId },
            relations: ['application'],
          });
          if (!student) {
            throw new NotFoundException({
              success: false,
              message: 'Student not found',
              error: { code: 'STUDENT_NOT_FOUND', details: null },
            });
          }
          if (student.application?.universityId !== currentUser.universityId) {
            throw new ForbiddenException({
              success: false,
              message: 'You act on behalf of another university',
              error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
            });
          }
        }
      }
    }

    if (studentId && !student) {
      student = await this.studentRepository.findOne({
        where: { id: studentId },
        relations: ['application'],
      });
      if (!student) {
        throw new NotFoundException({
          success: false,
          message: 'Student not found',
          error: { code: 'STUDENT_NOT_FOUND', details: null },
        });
      }
    }

    const finalMetadata = {
      ...(metadata || {}),
      uploadedBy: currentUser?.id,
      entityType,
      entityId: applicationId || studentId,
      documentType: docType,
    };

    let applicationIdForMetadata = applicationId;
    if (!applicationIdForMetadata && student?.application?.id) {
      applicationIdForMetadata = student.application.id;
    }

    if (applicationIdForMetadata) {
      finalMetadata.applicationId = applicationIdForMetadata;
    }

    const document = this.documentRepository.create({
      title,
      url,
      metadata: JSON.stringify(finalMetadata),
      tags: tags ? JSON.stringify(tags) : null,
      isPublic: isPublic ?? false,
      studentId: student ? student.id : null,
    });
    const saved = await this.documentRepository.save(document);

    return {
      success: true,
      message: 'Document created successfully',
      data: saved,
    };
  }

  async update(id: string, updateDocumentDto: any) {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException({
        success: false,
        message: 'Document not found',
        error: { code: 'DOCUMENT_NOT_FOUND', details: null },
      });
    }
    if (updateDocumentDto.url) {
      this.validateUrl(updateDocumentDto.url);
    }

    if (updateDocumentDto.metadata !== undefined) {
      updateDocumentDto.metadata = updateDocumentDto.metadata
        ? JSON.stringify(updateDocumentDto.metadata)
        : null;
    }
    if (updateDocumentDto.tags !== undefined) {
      updateDocumentDto.tags = updateDocumentDto.tags
        ? JSON.stringify(updateDocumentDto.tags)
        : null;
    }

    Object.assign(document, updateDocumentDto);
    const updated = await this.documentRepository.save(document);
    return {
      success: true,
      message: 'Document updated successfully',
      data: updated,
    };
  }

  async findById(id: string) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['student', 'student.application'],
    });
    if (!document) {
      throw new NotFoundException({
        success: false,
        message: 'Document not found',
        error: { code: 'DOCUMENT_NOT_FOUND', details: null },
      });
    }
    return {
      success: true,
      message: 'Document retrieved successfully',
      data: document,
    };
  }

  async download(
    id: string,
    currentUser?: { role?: UserRole; id?: string; universityId?: string },
  ) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: [
        'student',
        'student.application',
        'student.application.university',
      ],
    });

    if (!document) {
      throw new NotFoundException({
        success: false,
        message: 'Document not found',
        error: { code: 'DOCUMENT_NOT_FOUND', details: null },
      });
    }

    if (currentUser?.role === UserRole.UNIVERSITY) {
      let isAllowed = false;

      try {
        const meta = document.metadata ? JSON.parse(document.metadata) : {};
        if (meta.uploadedBy === currentUser.id) {
          isAllowed = true;
        }
      } catch (e) {}

      if (
        !isAllowed &&
        document.student?.application?.universityId === currentUser.universityId
      ) {
        isAllowed = true;
      }

      if (!isAllowed && document.metadata) {
        try {
          const meta = JSON.parse(document.metadata);
          if (meta.entityType === 'APPLICATION' && meta.entityId) {
            const app = await this.applicationRepository.findOne({
              where: { id: meta.entityId },
            });
            if (app?.universityId === currentUser.universityId) {
              isAllowed = true;
            }
          }
          if (!isAllowed && meta.applicationId) {
            const app = await this.applicationRepository.findOne({
              where: { id: meta.applicationId },
            });
            if (app?.universityId === currentUser.universityId) {
              isAllowed = true;
            }
          }
        } catch (e) {
          console.error(`DEBUG: Error parsing metadata for document ${id}:`, e);
        }
      }

      if (!isAllowed) {
        console.error(
          `DEBUG: Access denied for document ${id} - universityId: ${currentUser.universityId}`,
        );
        throw new ForbiddenException({
          success: false,
          message: 'Access denied',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    // Mentors are allowed to download documents belonging to interns assigned to them
    if (currentUser?.role === UserRole.MENTOR) {
      let allowedForMentor = false;
      try {
        if (document.studentId) {
          const intern = await this.internRepository.findOne({
            where: { studentId: document.studentId },
          });
          if (intern && intern.assignedMentorId === currentUser.id) {
            allowedForMentor = true;
          }
        }

        // Fallback: Check via uploadedBy user ID if studentId is not set
        if (!allowedForMentor && document.metadata) {
          try {
            const meta = JSON.parse(document.metadata);
            if (meta.uploadedBy) {
              const intern = await this.internRepository.findOne({
                where: { userId: meta.uploadedBy },
              });
              if (intern && intern.assignedMentorId === currentUser.id) {
                allowedForMentor = true;
              }
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      } catch (e) {
        this.logger.warn(`Mentor access check failed for document ${id}: ${e}`);
      }

      if (!allowedForMentor) {
        this.logger.error(
          `DEBUG: Access denied for document ${id} - mentorId: ${currentUser.id}`,
        );
        throw new ForbiddenException({
          success: false,
          message: 'Access denied',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    const { filePath, fileName } = this.validateAndSanitizePath(document);

    return {
      filePath,
      fileName,
    };
  }

  private validateAndSanitizePath(document: DocumentEntity): {
    filePath: string;
    fileName: string;
  } {
    const documentUrl = document.url;

    if (
      documentUrl.includes('..') ||
      documentUrl.includes('\\..') ||
      documentUrl.includes('/..')
    ) {
      this.logger.error(
        `Path traversal attempt detected: ${documentUrl} (document ID: ${document.id})`,
      );
      throw new ForbiddenException({
        success: false,
        message: 'Invalid file path',
        error: { code: 'INVALID_FILE_PATH', details: null },
      });
    }

    if (path.isAbsolute(documentUrl)) {
      this.logger.error(
        `Absolute path attempt detected: ${documentUrl} (document ID: ${document.id})`,
      );
      throw new ForbiddenException({
        success: false,
        message: 'Invalid file path',
        error: { code: 'INVALID_FILE_PATH', details: null },
      });
    }

    const resolvedPath = path.resolve(process.cwd(), documentUrl);

    if (!resolvedPath.startsWith(this.uploadDir)) {
      this.logger.error(
        `Path traversal detected after resolution: ${documentUrl} resolved to ${resolvedPath} (document ID: ${document.id})`,
      );
      throw new ForbiddenException({
        success: false,
        message: 'Invalid file path',
        error: { code: 'INVALID_FILE_PATH', details: null },
      });
    }

    if (!fs.existsSync(resolvedPath)) {
      this.logger.warn(
        `File not found: ${resolvedPath} (document ID: ${document.id})`,
      );
      throw new NotFoundException({
        success: false,
        message: 'File not found',
        error: { code: 'FILE_NOT_FOUND', details: null },
      });
    }

    const fileName = this.generateSafeFileName(document);

    return {
      filePath: resolvedPath,
      fileName,
    };
  }

  private generateSafeFileName(document: DocumentEntity): string {
    let filename = document.title || 'document';
    const ext = path.extname(document.url) || '.pdf';

    let docType = 'Document';
    try {
      if (document.metadata) {
        const meta =
          typeof document.metadata === 'string'
            ? JSON.parse(document.metadata)
            : document.metadata;
        docType = meta.documentType || 'Document';
      }
    } catch (e) {
      this.logger.warn(`Failed to parse metadata for document ${document.id}`);
    }

    filename = `${docType}_${filename}`;

    filename = filename
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!filename.endsWith(ext)) {
      filename += ext;
    }

    if (filename.length > 200) {
      const nameWithoutExt = filename.substring(
        0,
        filename.length - ext.length,
      );
      filename = nameWithoutExt.substring(0, 200 - ext.length) + ext;
    }

    return filename;
  }

  async list(
    query?: {
      page?: number;
      limit?: number;
      type?: string;
      entityId?: string;
      entityType?: string;
      universityId?: string;
    },
    currentUser?: { role?: UserRole; id?: string; universityId?: string },
  ) {
    const page = query?.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit =
      query?.limit && Number(query.limit) > 0
        ? Math.min(Number(query.limit), 100)
        : 100;

    const [items] = await this.documentRepository.findAndCount({
      relations: ['student', 'student.application'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const requestedUniversityId =
      query?.universityId ??
      (currentUser?.role === UserRole.UNIVERSITY
        ? currentUser.universityId
        : undefined);

    if (
      currentUser?.role === UserRole.UNIVERSITY &&
      query?.universityId &&
      query.universityId !== currentUser.universityId
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'You can only access documents for your own university',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }

    const filteredResults = await Promise.all(
      items.map(async (doc: any) => {
        let meta: any = {};
        try {
          meta = doc.metadata ? JSON.parse(doc.metadata) : {};
        } catch (e) {
          this.logger.warn(`Failed to parse metadata for document ${doc.id}`);
        }

        if (query?.type && meta.documentType !== query.type) {
          return null;
        }

        if (query?.entityType && meta.entityType !== query.entityType) {
          return null;
        }

        if (query?.entityId) {
          const matchesEntity =
            meta.entityId === query.entityId ||
            meta.applicationId === query.entityId ||
            doc.studentId === query.entityId;
          if (!matchesEntity) {
            return null;
          }
        }

        if (requestedUniversityId) {
          if (
            doc.student?.application?.universityId === requestedUniversityId
          ) {
            return doc;
          }

          if (meta.applicationId) {
            const app = await this.applicationRepository.findOne({
              where: { id: meta.applicationId },
            });
            if (app?.universityId === requestedUniversityId) {
              return doc;
            }
          }

          if (meta.uploadedBy === currentUser?.id) {
            return doc;
          }

          return null;
        }

        if (
          currentUser?.role === UserRole.UNIVERSITY &&
          doc.student?.application?.universityId === currentUser.universityId
        ) {
          return doc;
        }

        if (
          currentUser?.role === UserRole.UNIVERSITY &&
          meta.uploadedBy === currentUser.id
        ) {
          return doc;
        }

        if (currentUser?.role !== UserRole.UNIVERSITY) {
          return doc;
        }

        if (meta.applicationId) {
          const app = await this.applicationRepository.findOne({
            where: { id: meta.applicationId },
          });
          if (app?.universityId === currentUser.universityId) {
            return doc;
          }
        }

        return null;
      }),
    );

    const filtered = filteredResults.filter((doc) => doc !== null);

    return {
      success: true,
      message: 'Documents retrieved successfully',
      data: {
        items: filtered,
        pagination: {
          page,
          limit,
          totalItems: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      },
    };
  }

  async remove(
    id: string,
    currentUser?: { role?: UserRole; id?: string; universityId?: string },
  ) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['student', 'student.application'],
    });
    if (!document) {
      throw new NotFoundException({
        success: false,
        message: 'Document not found',
        error: { code: 'DOCUMENT_NOT_FOUND', details: null },
      });
    }

    if (currentUser?.role === UserRole.UNIVERSITY) {
      let isAllowed = false;

      if (
        document.student?.application?.universityId === currentUser.universityId
      ) {
        isAllowed = true;
      }

      if (!isAllowed && document.metadata) {
        try {
          const meta = JSON.parse(document.metadata);
          if (meta.uploadedBy === currentUser.id) {
            isAllowed = true;
          }
          if (
            !isAllowed &&
            meta.entityType === 'APPLICATION' &&
            meta.applicationId
          ) {
            const app = await this.applicationRepository.findOne({
              where: { id: meta.applicationId },
            });
            if (app?.universityId === currentUser.universityId) {
              isAllowed = true;
            }
          }
        } catch {}
      }

      if (!isAllowed) {
        throw new ForbiddenException({
          success: false,
          message: 'Access denied',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }
    await this.documentRepository.remove(document);
    return {
      success: true,
      message: 'Document deleted successfully',
      data: null,
    };
  }

  private validateUrl(url: string) {
    if (url.startsWith('uploads/')) return;
    try {
      new URL(url);
    } catch {
      throw new BadRequestException({
        success: false,
        message: 'Invalid URL provided',
        error: { code: 'DOCUMENT_INVALID_URL', details: null },
      });
    }
  }
}

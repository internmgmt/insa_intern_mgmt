import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { StudentEntity } from '../entities/student.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) { }

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

    // Role-based type restrictions
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

    // Ownership validation for universities
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

    // Try to find student if ID provided and not already found
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

    // Always try to include applicationId in metadata for filtering
    let applicationIdForMetadata = applicationId;
    if (!applicationIdForMetadata && student?.application?.id) {
      applicationIdForMetadata = student.application.id;
    }

    if (applicationIdForMetadata) {
      finalMetadata.applicationId = applicationIdForMetadata;
    }

    console.log('DEBUG: Creating document with metadata:', JSON.stringify(finalMetadata, null, 2));
    console.log('DEBUG: Setting studentId:', student ? student.id : null);

    const document = this.documentRepository.create({
      title,
      url,
      metadata: JSON.stringify(finalMetadata),
      tags: tags ? JSON.stringify(tags) : null,
      isPublic: isPublic ?? false,
      studentId: student ? student.id : null,
    });
    const saved = await this.documentRepository.save(document);

    console.log('DEBUG: Document created:', {
      id: saved.id,
      studentId: saved.studentId,
      metadata: saved.metadata,
    });

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

    // Handle metadata and tags serialization
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

  async download(id: string, currentUser?: { role?: UserRole; id?: string; universityId?: string }) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['student', 'student.application', 'student.application.university'],
    });

    if (!document) {
      throw new NotFoundException({
        success: false,
        message: 'Document not found',
        error: { code: 'DOCUMENT_NOT_FOUND', details: null },
      });
    }

    // Permission Check
    if (currentUser?.role === UserRole.UNIVERSITY) {
      let isAllowed = false;
      // 1. Check via Student relation
      if (document.student?.application?.universityId === currentUser.universityId) {
        isAllowed = true;
      }

      // 2. Check via Metadata Application ID (for Application docs)
      if (!isAllowed && document.metadata) {
        try {
          const meta = JSON.parse(document.metadata);
          if (meta.entityType === 'APPLICATION' && meta.entityId) {
            const app = await this.applicationRepository.findOne({ where: { id: meta.entityId } });
            if (app?.universityId === currentUser.universityId) {
              isAllowed = true;
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      if (!isAllowed) {
        throw new ForbiddenException({
          success: false,
          message: 'Access denied',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    // Generate Filename
    let filename = document.title; // Default fallback
    const ext = document.url.split('.').pop() || 'pdf';
    let docType = 'Document';

    // Parse metadata for docType
    try {
      const meta = document.metadata ? JSON.parse(document.metadata) : {};
      docType = meta.documentType || 'Document';
    } catch (e) { }

    // Sanitize docType for filename (remove spaces, etc if needed, though spec implies simple types)
    docType = docType.replace(/\s+/g, '_');

    // Force PDF extension for specific document types
    let finalExt = ext;
    if (['CV', 'TRANSCRIPT', 'OFFICIAL_LETTER'].includes(docType.toUpperCase())) {
      finalExt = 'pdf';
    }

    if (document.student) {
      // <University>_<Batch>_<FirstName>_<LastName>_<StudentID>_<DocumentType>.<ext>
      const s = document.student;
      const universityName = s.application?.university?.name?.replace(/\s+/g, '_') || 'University';
      const batch = s.application?.academicYear?.replace('/', '-') || s.academicYear?.replace('/', '-') || 'Batch';
      filename = `${universityName}_${batch}_${s.firstName}_${s.lastName}_${s.studentId}_${docType}.${finalExt}`;
    } else {
      // Try to find Application context from metadata if it's an Application doc
      try {
        const meta = document.metadata ? JSON.parse(document.metadata) : {};
        if (meta.entityType === 'APPLICATION' && meta.entityId) {
          const app = await this.applicationRepository.findOne({
            where: { id: meta.entityId },
            relations: ['university'],
          });
          if (app) {
            // Convention for Application docs: <University>_<Batch>_<DocumentType>.<ext>
            const universityName = app.university?.name?.replace(/\s+/g, '_') || 'University';
            filename = `${universityName}_${app.academicYear.replace('/', '-')}_${docType}.${finalExt}`;
          }
        }
      } catch (e) { }
    }

    // Clean filename of any potential path traversal or illegal chars just in case (though we constructed it)
    filename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');

    return {
      filePath: document.url, // Assuming url is relative path 'uploads/...'
      fileName: filename,
    };
  }

  async list(
    query?: { page?: number; limit?: number },
    currentUser?: { role?: UserRole; id?: string; universityId?: string },
  ) {
    const page = query?.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = 100; // Enforce strict 100 limit as requested

    // Load documents with relations needed for filtering
    const [items, totalItems] = await this.documentRepository.findAndCount({
      relations: ['student', 'student.application'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    console.log(`DEBUG: Loaded ${items.length} documents from DB`);
    console.log('DEBUG: Current User:', JSON.stringify(currentUser, null, 2));

    // Non-university roles see all documents
    if (currentUser?.role !== UserRole.UNIVERSITY) {
      return {
        success: true,
        message: 'Documents retrieved successfully',
        data: {
          items,
          pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.max(1, Math.ceil(totalItems / limit)),
          },
        },
      };
    }

    // Filter documents for University role (async to check application ownership)
    const filterResults = await Promise.all(
      items.map(async (doc: any) => {
        // Check 1: Student-linked document (via student -> application -> university)
        if (doc.student?.application?.universityId === currentUser.universityId) {
          console.log(`DEBUG: Document ${doc.id} included via student link`);
          return doc;
        }

        // Check 2: Application-linked document (via metadata)
        try {
          const meta = doc.metadata ? JSON.parse(doc.metadata) : {};

          // Check if uploaded by this university user
          if (meta.uploadedBy === currentUser.id) {
            console.log(`DEBUG: Document ${doc.id} included via uploadedBy`);
            return doc;
          }

          // Check if linked to an application owned by this university
          if (meta.entityType === 'APPLICATION' && meta.applicationId) {
            const app = await this.applicationRepository.findOne({
              where: { id: meta.applicationId },
            });
            if (app?.universityId === currentUser.universityId) {
              console.log(`DEBUG: Document ${doc.id} included via application link`);
              return doc;
            }
          }
        } catch (e) {
          console.error(`DEBUG: Error parsing metadata for doc ${doc.id}:`, e);
        }

        return null;
      }),
    );

    const filtered = filterResults.filter((doc) => doc !== null);
    console.log(`DEBUG: Filtered to ${filtered.length} documents for university ${currentUser.universityId}`);


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

    // Restrict university users to their own documents/applications
    if (currentUser?.role === UserRole.UNIVERSITY) {
      let isAllowed = false;

      // 1) Student-linked document (via student -> application -> university)
      if (document.student?.application?.universityId === currentUser.universityId) {
        isAllowed = true;
      }

      // 2) Application-linked document (via metadata)
      if (!isAllowed && document.metadata) {
        try {
          const meta = JSON.parse(document.metadata);
          // If this university user originally uploaded it
          if (meta.uploadedBy === currentUser.id) {
            isAllowed = true;
          }
          // Or if linked to an application owned by this university
          if (!isAllowed && meta.entityType === 'APPLICATION' && meta.applicationId) {
            const app = await this.applicationRepository.findOne({
              where: { id: meta.applicationId },
            });
            if (app?.universityId === currentUser.universityId) {
              isAllowed = true;
            }
          }
        } catch {
          // ignore parse errors
        }
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

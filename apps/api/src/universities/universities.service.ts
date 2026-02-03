import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UniversityEntity } from '../entities/university.entity';
import { UserEntity } from '../entities/user.entity';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../global/services/mail/mail.service';
import { coordinatorCredentialsTemplate } from './templates/coordinator-email.template';
import { mapUniversityToResponse } from './university.mapper';
import { UNIVERSITY_NAME_EXISTS } from './university.constants';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UniversitiesService {
  private readonly logger = new Logger(UniversitiesService.name);

  constructor(
    @InjectRepository(UniversityEntity)
    private readonly universityRepository: Repository<UniversityEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  async findAll() {
    const universities = await this.universityRepository.find({
      order: { name: 'ASC' },
    });

    return {
      success: true,
      message: 'Universities retrieved successfully',
      data: {
        items: universities,
      },
    };
  }

  async getById(id: string) {
    const university = await this.universityRepository.findOne({
      where: { id },
      relations: ['users', 'applications'],
    });

    if (!university) {
      throw new NotFoundException({
        success: false,
        message: 'University not found',
        error: { code: 'UNIVERSITY_NOT_FOUND', details: null },
      });
    }

    return {
      success: true,
      message: 'University retrieved successfully',
      data: mapUniversityToResponse(university),
    };
  }

  async create(createUniversityDto: CreateUniversityDto) {
    const {
      name,
      address,
      contactEmail,
      contactPhone,
      isActive = true,
      coordinator,
    } = createUniversityDto;

    const existing = await this.universityRepository.findOne({
      where: { name },
    });
    if (existing) {
      throw new ConflictException({
        success: false,
        message: 'University with this name already exists',
        error: {
          code: UNIVERSITY_NAME_EXISTS,
          details: null,
        },
      });
    }

    const university = this.universityRepository.create({
      name,
      address,
      contactEmail,
      contactPhone,
      isActive,
    });

    const savedUni = await this.universityRepository.save(university);

    if (coordinator && coordinator.email) {
      try {
        const tempPassword = this.generateTemporaryPassword();
        const hashed = await bcrypt.hash(tempPassword, 10);

        const coordEmail = coordinator.email.toLowerCase();
        const existingUser = await this.userRepository.findOne({
          where: { email: coordEmail },
        });
        if (!existingUser) {
          const user = this.userRepository.create({
            email: coordEmail,
            firstName: coordinator.firstName,
            lastName: coordinator.lastName,
            passwordHash: hashed,
            role: UserRole.UNIVERSITY,
            universityId: savedUni.id,
            isActive: true,
            isFirstLogin: true,
          });
          await this.userRepository.save(user);

          const { subject, html, text } = coordinatorCredentialsTemplate({
            firstName: coordinator.firstName,
            lastName: coordinator.lastName,
            email: coordEmail,
            temporaryPassword: tempPassword,
            loginUrl: process.env.FRONTEND_URL
              ? `${process.env.FRONTEND_URL}/login`
              : 'http://localhost:3000/login',
          });

          await this.mailService.send({
            from: this.mailService.from(),
            to: coordEmail,
            subject,
            html,
            text,
          });
        } else {
          this.logger.log(
            `Coordinator ${coordEmail} already exists, skipping creation`,
          );
        }
      } catch (err) {
        this.logger.error(
          'Failed to create/send coordinator credentials',
          err as any,
        );
      }
    }

    const uniWithRelations = await this.universityRepository.findOne({
      where: { id: savedUni.id },
      relations: ['users', 'applications'],
    });

    return {
      success: true,
      message: 'University created successfully',
      data: mapUniversityToResponse(uniWithRelations || savedUni),
    };
  }

  async update(id: string, updateUniversityDto: UpdateUniversityDto) {
    const university = await this.universityRepository.findOne({
      where: { id },
      relations: ['users', 'applications'],
    });

    if (!university) {
      throw new NotFoundException({
        success: false,
        message: 'University not found',
        error: { code: 'UNIVERSITY_NOT_FOUND', details: null },
      });
    }

    // Validate name uniqueness (exclude self)
    if (
      updateUniversityDto.name &&
      updateUniversityDto.name !== university.name
    ) {
      const existing = await this.universityRepository.findOne({
        where: { name: updateUniversityDto.name, id: Not(id) },
      });
      if (existing) {
        throw new ConflictException({
          success: false,
          message: 'University with this name already exists',
          error: {
            code: UNIVERSITY_NAME_EXISTS,
            details: null,
          },
        });
      }
    }

    Object.assign(university, updateUniversityDto);
    const updated = await this.universityRepository.save(university);

    const uniWithRelations = await this.universityRepository.findOne({
      where: { id: updated.id },
      relations: ['users', 'applications'],
    });

    return {
      success: true,
      message: 'University updated successfully',
      data: mapUniversityToResponse(uniWithRelations || updated),
    };
  }

  async deactivate(id: string) {
    const university = await this.universityRepository.findOne({
      where: { id },
      relations: ['users', 'applications'],
    });

    if (!university) {
      throw new NotFoundException({
        success: false,
        message: 'University not found',
        error: { code: 'UNIVERSITY_NOT_FOUND', details: null },
      });
    }

    university.isActive = false;
    const updated = await this.universityRepository.save(university);

    const uniWithRelations = await this.universityRepository.findOne({
      where: { id: updated.id },
      relations: ['users', 'applications'],
    });

    return {
      success: true,
      message: 'University deactivated successfully',
      data: mapUniversityToResponse(uniWithRelations || updated),
    };
  }

  private generateTemporaryPassword(): string {
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
}

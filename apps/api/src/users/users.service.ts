import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../global/services/mail/mail.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) { }

  async findAll(query: QueryUsersDto) {
    const {
      page = 1,
      role,
      search,
      isActive,
      departmentId,
    } = query;
    const limit = 100; // Enforce strict 100 limit as requested

    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (role) {
      whereConditions.role = role;
    }

    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    if (departmentId) {
      whereConditions.departmentId = departmentId;
    }

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.university', 'university')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.isActive',
        'user.isFirstLogin',
        'user.createdAt',
        'department.id',
        'department.name',
        'university.id',
        'university.name',
      ])
      .where(whereConditions)
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        items,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      },
    };
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['department', 'university'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isFirstLogin: true,
        createdAt: true,
        department: {
          id: true,
          name: true,
          type: true,
        },
        university: {
          id: true,
          name: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: null,
        },
      });
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { email, firstName, lastName, role, departmentId, universityId } =
      createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException({
        success: false,
        message: 'User with this email already exists',
        error: {
          code: 'USER_EMAIL_EXISTS',
          details: null,
        },
      });
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = this.userRepository.create({
      email: email.toLowerCase(),
      firstName,
      lastName,
      role,
      passwordHash: hashedPassword,
      departmentId,
      universityId,
      isActive: true,
      isFirstLogin: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Send user created email with MailService
    try {
      await this.mailService.sendUserCreatedEmail(
        savedUser.email,
        savedUser.firstName,
        savedUser.lastName,
        temporaryPassword,
        savedUser.role,
      );
    } catch (error) {
      this.logger.error('Failed to send user created email', error);
      // Don't throw - email failure shouldn't block user creation
    }

    return {
      success: true,
      message: 'User created successfully. Temporary password sent to email.',
      data: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        isActive: savedUser.isActive,
        isFirstLogin: savedUser.isFirstLogin,
        createdAt: savedUser.createdAt,
      },
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: null,
        },
      });
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isFirstLogin: updatedUser.isFirstLogin,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  async deactivate(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: null,
        },
      });
    }

    user.isActive = false;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User deactivated successfully',
      data: null,
    };
  }

  generateTemporaryPassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';

    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(
      Math.floor(Math.random() * 26),
    );
    password += 'abcdefghijklmnopqrstuvwxyz'.charAt(
      Math.floor(Math.random() * 26),
    );
    password += '0123456789'.charAt(Math.floor(Math.random() * 10));
    password += '@$!%*?&'.charAt(Math.floor(Math.random() * 7));

    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }
}

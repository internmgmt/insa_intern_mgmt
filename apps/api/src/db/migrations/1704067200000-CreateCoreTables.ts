import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCoreTables1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing users table if it exists
    await queryRunner.dropTable('users', true);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['ADMIN', 'UNIVERSITY', 'SUPERVISOR', 'INTERN'],
            default: "'ADMIN'",
          },
          {
            name: 'is_first_login',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'university_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'department_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create universities table
    await queryRunner.createTable(
      new Table({
        name: 'universities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isUnique: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'contact_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create departments table
    await queryRunner.createTable(
      new Table({
        name: 'departments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['NETWORKING', 'CYBERSECURITY', 'SOFTWARE_DEVELOPMENT'],
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create applications table
    await queryRunner.createTable(
      new Table({
        name: 'applications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'academic_year',
            type: 'varchar',
            length: '9',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
          },
          {
            name: 'official_letter_url',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'rejection_reason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'reviewed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'university_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create students table
    await queryRunner.createTable(
      new Table({
        name: 'students',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'student_id',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'field_of_study',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'academic_year',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'PENDING_REVIEW',
              'ACCEPTED',
              'REJECTED',
              'AWAITING_ARRIVAL',
              'ARRIVED',
              'ACCOUNT_CREATED',
            ],
            default: "'PENDING_REVIEW'",
          },
          {
            name: 'rejection_reason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'cv_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'transcript_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'application_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys for users table
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['university_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'universities',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'departments',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign keys for applications table
    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['university_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'universities',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['reviewed_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign keys for students table
    await queryRunner.createForeignKey(
      'students',
      new TableForeignKey({
        columnNames: ['application_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'applications',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('students', true);
    await queryRunner.dropTable('applications', true);
    await queryRunner.dropTable('departments', true);
    await queryRunner.dropTable('universities', true);
    await queryRunner.dropTable('users', true);
  }
}

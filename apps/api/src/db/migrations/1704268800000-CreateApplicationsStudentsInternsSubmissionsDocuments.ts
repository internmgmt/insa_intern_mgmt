import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateApplicationsStudentsInternsSubmissionsDocuments1704268800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasApplications = await queryRunner.hasTable('applications');
    if (!hasApplications) {
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
            { name: 'academic_year', type: 'varchar', length: '9' },
            {
              name: 'status',
              type: 'enum',
              enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
              default: "'PENDING'",
            },
            { name: 'official_letter_url', type: 'varchar', length: '500' },
            {
              name: 'rejection_reason',
              type: 'varchar',
              length: '500',
              isNullable: true,
            },
            { name: 'reviewed_by', type: 'uuid', isNullable: true },
            { name: 'reviewed_at', type: 'timestamp', isNullable: true },
            { name: 'university_id', type: 'uuid' },
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
    }

    const hasStudents = await queryRunner.hasTable('students');
    if (!hasStudents) {
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
            { name: 'first_name', type: 'varchar', length: '100' },
            { name: 'last_name', type: 'varchar', length: '100' },
            {
              name: 'student_id',
              type: 'varchar',
              length: '50',
              isUnique: true,
            },
            { name: 'field_of_study', type: 'varchar', length: '200' },
            { name: 'academic_year', type: 'varchar', length: '20' },
            { name: 'email', type: 'varchar', length: '255', isNullable: true },
            { name: 'phone', type: 'varchar', length: '20', isNullable: true },
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
            { name: 'application_id', type: 'uuid' },
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
    }

    const hasInterns = await queryRunner.hasTable('interns');
    if (!hasInterns) {
      await queryRunner.createTable(
        new Table({
          name: 'interns',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid', isNullable: true },
            {
              name: 'intern_id',
              type: 'varchar',
              length: '50',
              isNullable: true,
              isUnique: true,
            },
            { name: 'assigned_supervisor_id', type: 'uuid', isNullable: true },
            { name: 'department_id', type: 'uuid', isNullable: true },
            { name: 'start_date', type: 'timestamp', isNullable: true },
            { name: 'end_date', type: 'timestamp', isNullable: true },
            { name: 'status', type: 'varchar', length: '50', isNullable: true },
            { name: 'is_active', type: 'boolean', default: true },
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
    }

    const hasSubmissions = await queryRunner.hasTable('submissions');
    if (!hasSubmissions) {
      await queryRunner.createTable(
        new Table({
          name: 'submissions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'student_id', type: 'uuid' },
            { name: 'title', type: 'varchar', length: '200' },
            {
              name: 'description',
              type: 'varchar',
              length: '1000',
              isNullable: true,
            },
            { name: 'files', type: 'text', isNullable: true },
            {
              name: 'status',
              type: 'varchar',
              length: '50',
              default: "'SUBMITTED'",
            },
            { name: 'reviewed_by', type: 'uuid', isNullable: true },
            { name: 'reviewed_at', type: 'timestamp', isNullable: true },
            {
              name: 'rejection_reason',
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
    }

    const hasDocuments = await queryRunner.hasTable('documents');
    if (!hasDocuments) {
      await queryRunner.createTable(
        new Table({
          name: 'documents',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'title', type: 'varchar', length: '200' },
            { name: 'url', type: 'varchar', length: '500' },
            { name: 'metadata', type: 'text', isNullable: true },
            { name: 'tags', type: 'text', isNullable: true },
            { name: 'is_public', type: 'boolean', default: false },
            { name: 'student_id', type: 'uuid', isNullable: true },
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
    }

    const applicationsTable = await queryRunner.getTable('applications');
    if (
      applicationsTable &&
      !applicationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('university_id') !== -1,
      )
    ) {
      await queryRunner.createForeignKey(
        'applications',
        new TableForeignKey({
          columnNames: ['university_id'],
          referencedTableName: 'universities',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    const applicationsReviewedByFkExists =
      applicationsTable &&
      applicationsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('reviewed_by') !== -1,
      );
    if (applicationsTable && !applicationsReviewedByFkExists) {
      await queryRunner.createForeignKey(
        'applications',
        new TableForeignKey({
          columnNames: ['reviewed_by'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    const studentsTable = await queryRunner.getTable('students');
    if (
      studentsTable &&
      !studentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('application_id') !== -1,
      )
    ) {
      await queryRunner.createForeignKey(
        'students',
        new TableForeignKey({
          columnNames: ['application_id'],
          referencedTableName: 'applications',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    const internsTable = await queryRunner.getTable('interns');
    if (internsTable) {
      const internUserFkExists = internsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (!internUserFkExists) {
        await queryRunner.createForeignKey(
          'interns',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        );
      }
      const internSupervisorFkExists = internsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('assigned_supervisor_id') !== -1,
      );
      if (!internSupervisorFkExists) {
        await queryRunner.createForeignKey(
          'interns',
          new TableForeignKey({
            columnNames: ['assigned_supervisor_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        );
      }
      const internDeptFkExists = internsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('department_id') !== -1,
      );
      if (!internDeptFkExists) {
        await queryRunner.createForeignKey(
          'interns',
          new TableForeignKey({
            columnNames: ['department_id'],
            referencedTableName: 'departments',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        );
      }
    }

    const submissionsTable = await queryRunner.getTable('submissions');
    if (
      submissionsTable &&
      !submissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('student_id') !== -1,
      )
    ) {
      await queryRunner.createForeignKey(
        'submissions',
        new TableForeignKey({
          columnNames: ['student_id'],
          referencedTableName: 'students',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
    if (
      submissionsTable &&
      !submissionsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('reviewed_by') !== -1,
      )
    ) {
      await queryRunner.createForeignKey(
        'submissions',
        new TableForeignKey({
          columnNames: ['reviewed_by'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    const documentsTableNow = await queryRunner.getTable('documents');
    if (
      documentsTableNow &&
      !documentsTableNow.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('student_id') !== -1,
      )
    ) {
      await queryRunner.createForeignKey(
        'documents',
        new TableForeignKey({
          columnNames: ['student_id'],
          referencedTableName: 'students',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const documentsExist = await queryRunner.hasTable('documents');
    if (documentsExist) {
      await queryRunner.dropTable('documents', true);
    }
    const submissionsExist = await queryRunner.hasTable('submissions');
    if (submissionsExist) {
      await queryRunner.dropTable('submissions', true);
    }
    const internsExist = await queryRunner.hasTable('interns');
    if (internsExist) {
      await queryRunner.dropTable('interns', true);
    }
    const studentsExist = await queryRunner.hasTable('students');
    if (studentsExist) {
      await queryRunner.dropTable('students', true);
    }
    const applicationsExist = await queryRunner.hasTable('applications');
    if (applicationsExist) {
      await queryRunner.dropTable('applications', true);
    }
  }
}

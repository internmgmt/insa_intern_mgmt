import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateUniversitiesDepartmentsTables1704168000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUniversities = await queryRunner.hasTable('universities');
    if (!hasUniversities) {
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
    }

    const hasDepartments = await queryRunner.hasTable('departments');
    if (!hasDepartments) {
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
    }

    const usersHasUniversityId = await queryRunner.hasColumn(
      'users',
      'university_id',
    );
    if (!usersHasUniversityId) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'university_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const usersHasDepartmentId = await queryRunner.hasColumn(
      'users',
      'department_id',
    );
    if (!usersHasDepartmentId) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'department_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const fkUsersUniversityExists = (
      await queryRunner.getTable('users')
    )?.foreignKeys.some(
      (fk) =>
        fk.columnNames.length === 1 && fk.columnNames[0] === 'university_id',
    );
    if (!fkUsersUniversityExists) {
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          columnNames: ['university_id'],
          referencedTableName: 'universities',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          name: 'fk_users_university_id',
        }),
      );
    }

    const fkUsersDepartmentExists = (
      await queryRunner.getTable('users')
    )?.foreignKeys.some(
      (fk) =>
        fk.columnNames.length === 1 && fk.columnNames[0] === 'department_id',
    );
    if (!fkUsersDepartmentExists) {
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          columnNames: ['department_id'],
          referencedTableName: 'departments',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          name: 'fk_users_department_id',
        }),
      );
    }

    const applicationsTable = await queryRunner.getTable('applications');
    if (applicationsTable) {
      const fkApplicationsUniversityExists = applicationsTable.foreignKeys.some(
        (fk) =>
          fk.columnNames.length === 1 && fk.columnNames[0] === 'university_id',
      );
      if (!fkApplicationsUniversityExists) {
        const hasUniversityIdColumn = applicationsTable.columns.some(
          (c) => c.name === 'university_id',
        );
        if (!hasUniversityIdColumn) {
          await queryRunner.addColumn(
            'applications',
            new TableColumn({
              name: 'university_id',
              type: 'uuid',
            }),
          );
        }
        await queryRunner.createForeignKey(
          'applications',
          new TableForeignKey({
            columnNames: ['university_id'],
            referencedTableName: 'universities',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'fk_applications_university_id',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const applicationsTable = await queryRunner.getTable('applications');
    if (applicationsTable) {
      const fkAppUni = applicationsTable.foreignKeys.find(
        (fk) => fk.name === 'fk_applications_university_id',
      );
      if (fkAppUni) {
        await queryRunner.dropForeignKey('applications', fkAppUni);
      }
      const hasUniversityIdColumn = applicationsTable.columns.some(
        (c) => c.name === 'university_id',
      );
      if (hasUniversityIdColumn) {
        await queryRunner.dropColumn('applications', 'university_id');
      }
    }

    const usersTable = await queryRunner.getTable('users');
    if (usersTable) {
      const fkUsersUni = usersTable.foreignKeys.find(
        (fk) => fk.name === 'fk_users_university_id',
      );
      if (fkUsersUni) {
        await queryRunner.dropForeignKey('users', fkUsersUni);
      }
      const fkUsersDept = usersTable.foreignKeys.find(
        (fk) => fk.name === 'fk_users_department_id',
      );
      if (fkUsersDept) {
        await queryRunner.dropForeignKey('users', fkUsersDept);
      }
      if (usersTable.columns.some((c) => c.name === 'university_id')) {
        await queryRunner.dropColumn('users', 'university_id');
      }
      if (usersTable.columns.some((c) => c.name === 'department_id')) {
        await queryRunner.dropColumn('users', 'department_id');
      }
    }

    const hasDepartments = await queryRunner.hasTable('departments');
    if (hasDepartments) {
      await queryRunner.dropTable('departments', true);
    }

    const hasUniversities = await queryRunner.hasTable('universities');
    if (hasUniversities) {
      await queryRunner.dropTable('universities', true);
    }
  }
}

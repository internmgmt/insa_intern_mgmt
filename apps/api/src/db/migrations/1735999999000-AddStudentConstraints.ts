import {
  MigrationInterface,
  QueryRunner,
  TableIndex,
  TableColumn,
} from 'typeorm';

export class AddStudentConstraints1735999999000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique index on student_id if not exists
    const table = await queryRunner.getTable('students');
    if (!table) return;

    // Check if index exists by name or column
    const hasIndex = table.indices.some(
      (index) => index.columnNames.includes('student_id') && index.isUnique,
    );
    if (!hasIndex) {
      await queryRunner.createIndex(
        'students',
        new TableIndex({
          name: 'UQ_students_student_id',
          columnNames: ['student_id'],
          isUnique: true,
        }),
      );
    }

    if (!table.findColumnByName('deleted_at')) {
      await queryRunner.addColumn(
        'students',
        new TableColumn({
          name: 'deleted_at',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('students');
    if (!table) return;

    if (table.findColumnByName('deleted_at')) {
      await queryRunner.dropColumn('students', 'deleted_at');
    }

    const hasIndex = table.indices.some(
      (index) => index.name === 'UQ_students_student_id',
    );
    if (hasIndex) {
      await queryRunner.dropIndex('students', 'UQ_students_student_id');
    }
  }
}

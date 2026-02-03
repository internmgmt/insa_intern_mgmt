import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddStudentIdToInterns1736000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('interns', 'student_id');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'student_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable('interns');
    const fkExists = table?.foreignKeys.some(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'student_id',
    );

    if (!fkExists) {
      await queryRunner.createForeignKey(
        'interns',
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
    const table = await queryRunner.getTable('interns');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'student_id',
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('interns', foreignKey);
    }

    const hasColumn = await queryRunner.hasColumn('interns', 'student_id');
    if (hasColumn) {
      await queryRunner.dropColumn('interns', 'student_id');
    }
  }
}

import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddInternIdToSubmissions1736000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('submissions', 'intern_id');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'submissions',
        new TableColumn({
          name: 'intern_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable('submissions');
    const fkExists = table?.foreignKeys.some(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'intern_id',
    );

    if (!fkExists) {
      await queryRunner.createForeignKey(
        'submissions',
        new TableForeignKey({
          columnNames: ['intern_id'],
          referencedTableName: 'interns',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('submissions');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'intern_id',
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('submissions', foreignKey);
    }

    const hasColumn = await queryRunner.hasColumn('submissions', 'intern_id');
    if (hasColumn) {
      await queryRunner.dropColumn('submissions', 'intern_id');
    }
  }
}

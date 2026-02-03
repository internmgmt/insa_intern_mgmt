import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddApplicationName1738008000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('applications', 'name');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'applications',
        new TableColumn({
          name: 'name',
          type: 'varchar',
          length: '200',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('applications', 'name');
    if (hasColumn) {
      await queryRunner.dropColumn('applications', 'name');
    }
  }
}

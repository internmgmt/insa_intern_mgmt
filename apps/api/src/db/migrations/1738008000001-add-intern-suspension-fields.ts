import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInternSuspensionFields1738008000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIsSuspended = await queryRunner.hasColumn('interns', 'is_suspended');
    if (!hasIsSuspended) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'is_suspended',
          type: 'boolean',
          default: false,
        }),
      );
    }

    const hasSuspensionReason = await queryRunner.hasColumn('interns', 'suspension_reason');
    if (!hasSuspensionReason) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'suspension_reason',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasSuspensionReason = await queryRunner.hasColumn('interns', 'suspension_reason');
    if (hasSuspensionReason) {
      await queryRunner.dropColumn('interns', 'suspension_reason');
    }

    const hasIsSuspended = await queryRunner.hasColumn('interns', 'is_suspended');
    if (hasIsSuspended) {
      await queryRunner.dropColumn('interns', 'is_suspended');
    }
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserResetToken1736153613000 implements MigrationInterface {
  name = 'AddUserResetToken1736153613000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasResetToken = await queryRunner.hasColumn('users', 'reset_token');
    const hasResetTokenExpiry = await queryRunner.hasColumn(
      'users',
      'reset_token_expiry',
    );

    if (!hasResetToken) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'reset_token',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
      console.log('✅ Added reset_token column to users table');
    } else {
      console.log('ℹ️  reset_token column already exists, skipping...');
    }

    if (!hasResetTokenExpiry) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'reset_token_expiry',
          type: 'timestamp',
          isNullable: true,
        }),
      );
      console.log('✅ Added reset_token_expiry column to users table');
    } else {
      console.log('ℹ️  reset_token_expiry column already exists, skipping...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasResetToken = await queryRunner.hasColumn('users', 'reset_token');
    const hasResetTokenExpiry = await queryRunner.hasColumn(
      'users',
      'reset_token_expiry',
    );

    if (hasResetToken) {
      await queryRunner.dropColumn('users', 'reset_token');
      console.log('✅ Dropped reset_token column from users table');
    }

    if (hasResetTokenExpiry) {
      await queryRunner.dropColumn('users', 'reset_token_expiry');
      console.log('✅ Dropped reset_token_expiry column from users table');
    }
  }
}

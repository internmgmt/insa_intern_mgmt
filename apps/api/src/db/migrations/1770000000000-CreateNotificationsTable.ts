import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateNotificationsTable1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('notifications');
    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: 'notifications',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'recipient_user_id', type: 'uuid' },
            { name: 'type', type: 'varchar', length: '80' },
            { name: 'title', type: 'varchar', length: '200' },
            { name: 'body', type: 'text' },
            {
              name: 'entity_type',
              type: 'varchar',
              length: '50',
              isNullable: true,
            },
            { name: 'entity_id', type: 'uuid', isNullable: true },
            { name: 'metadata', type: 'jsonb', isNullable: true },
            { name: 'is_read', type: 'boolean', default: false },
            { name: 'read_at', type: 'timestamp', isNullable: true },
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

    const table = await queryRunner.getTable('notifications');
    if (table) {
      const hasRecipientFk = table.foreignKeys.some(
        (fk) =>
          fk.columnNames.length === 1 &&
          fk.columnNames[0] === 'recipient_user_id',
      );
      if (!hasRecipientFk) {
        await queryRunner.createForeignKey(
          'notifications',
          new TableForeignKey({
            columnNames: ['recipient_user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'fk_notifications_recipient_user_id',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('notifications');
    if (table) {
      const fk = table.foreignKeys.find(
        (foreignKey) =>
          foreignKey.name === 'fk_notifications_recipient_user_id',
      );
      if (fk) {
        await queryRunner.dropForeignKey('notifications', fk);
      }
      await queryRunner.dropTable('notifications', true);
    }
  }
}

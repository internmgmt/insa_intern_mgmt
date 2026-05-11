import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSupervisorEvaluationComponents1772000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAttendance = await queryRunner.hasColumn('interns', 'supervisor_attendance');
    if (!hasAttendance) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'supervisor_attendance',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    const hasProtocol = await queryRunner.hasColumn('interns', 'supervisor_protocol');
    if (!hasProtocol) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'supervisor_protocol',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    const hasConduct = await queryRunner.hasColumn('interns', 'supervisor_conduct');
    if (!hasConduct) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'supervisor_conduct',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    const hasWorkFinished = await queryRunner.hasColumn('interns', 'supervisor_work_finished');
    if (!hasWorkFinished) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'supervisor_work_finished',
          type: 'integer',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasWorkFinished = await queryRunner.hasColumn('interns', 'supervisor_work_finished');
    if (hasWorkFinished) {
      await queryRunner.dropColumn('interns', 'supervisor_work_finished');
    }

    const hasConduct = await queryRunner.hasColumn('interns', 'supervisor_conduct');
    if (hasConduct) {
      await queryRunner.dropColumn('interns', 'supervisor_conduct');
    }

    const hasProtocol = await queryRunner.hasColumn('interns', 'supervisor_protocol');
    if (hasProtocol) {
      await queryRunner.dropColumn('interns', 'supervisor_protocol');
    }

    const hasAttendance = await queryRunner.hasColumn('interns', 'supervisor_attendance');
    if (hasAttendance) {
      await queryRunner.dropColumn('interns', 'supervisor_attendance');
    }
  }
}

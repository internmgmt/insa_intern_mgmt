import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddInternCompletionFields1738008000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasSkills = await queryRunner.hasColumn('interns', 'skills');
    if (!hasSkills) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'skills',
          type: 'text',
          isArray: true,
          isNullable: true,
        }),
      );
    }

    const hasInterviewNotes = await queryRunner.hasColumn(
      'interns',
      'interview_notes',
    );
    if (!hasInterviewNotes) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'interview_notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const hasFinalEvaluation = await queryRunner.hasColumn(
      'interns',
      'final_evaluation',
    );
    if (!hasFinalEvaluation) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'final_evaluation',
          type: 'numeric',
          precision: 3,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    const hasCertificateUrl = await queryRunner.hasColumn(
      'interns',
      'certificate_url',
    );
    if (!hasCertificateUrl) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'certificate_url',
          type: 'varchar',
          length: '500',
          isNullable: true,
        }),
      );
    }

    const hasCertificateIssued = await queryRunner.hasColumn(
      'interns',
      'certificate_issued',
    );
    if (!hasCertificateIssued) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'certificate_issued',
          type: 'boolean',
          default: false,
        }),
      );
    }

    const hasCompletionNotes = await queryRunner.hasColumn(
      'interns',
      'completion_notes',
    );
    if (!hasCompletionNotes) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'completion_notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const hasTerminationReason = await queryRunner.hasColumn(
      'interns',
      'termination_reason',
    );
    if (!hasTerminationReason) {
      await queryRunner.addColumn(
        'interns',
        new TableColumn({
          name: 'termination_reason',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_final_evaluation_range'
        ) THEN
          ALTER TABLE interns 
          ADD CONSTRAINT chk_final_evaluation_range 
          CHECK (final_evaluation IS NULL OR (final_evaluation >= 0.00 AND final_evaluation <= 4.00));
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE interns DROP CONSTRAINT IF EXISTS chk_final_evaluation_range;
    `);

    const hasTerminationReason = await queryRunner.hasColumn(
      'interns',
      'termination_reason',
    );
    if (hasTerminationReason) {
      await queryRunner.dropColumn('interns', 'termination_reason');
    }

    const hasCompletionNotes = await queryRunner.hasColumn(
      'interns',
      'completion_notes',
    );
    if (hasCompletionNotes) {
      await queryRunner.dropColumn('interns', 'completion_notes');
    }

    const hasCertificateIssued = await queryRunner.hasColumn(
      'interns',
      'certificate_issued',
    );
    if (hasCertificateIssued) {
      await queryRunner.dropColumn('interns', 'certificate_issued');
    }

    const hasCertificateUrl = await queryRunner.hasColumn(
      'interns',
      'certificate_url',
    );
    if (hasCertificateUrl) {
      await queryRunner.dropColumn('interns', 'certificate_url');
    }

    const hasFinalEvaluation = await queryRunner.hasColumn(
      'interns',
      'final_evaluation',
    );
    if (hasFinalEvaluation) {
      await queryRunner.dropColumn('interns', 'final_evaluation');
    }

    const hasInterviewNotes = await queryRunner.hasColumn(
      'interns',
      'interview_notes',
    );
    if (hasInterviewNotes) {
      await queryRunner.dropColumn('interns', 'interview_notes');
    }

    const hasSkills = await queryRunner.hasColumn('interns', 'skills');
    if (hasSkills) {
      await queryRunner.dropColumn('interns', 'skills');
    }
  }
}

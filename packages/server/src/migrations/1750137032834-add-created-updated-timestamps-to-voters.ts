import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedUpdatedTimestampsToVoters1750137032834
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE voter ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE voter ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE voter DROP COLUMN created_at`);
    await queryRunner.query(`ALTER TABLE voter DROP COLUMN updated_at`);
  }
}

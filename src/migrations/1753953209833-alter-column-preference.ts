import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnPreference1753953209833 implements MigrationInterface {
  name = 'AlterColumnPreference1753953209833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "columns_preference" ADD "table_type" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "columns_preference" ALTER COLUMN "columns_config" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "columns_preference" ALTER COLUMN "columns_config" SET DEFAULT '[{"order": 1, "visible": true, "columnKey": "shift_id"}, {"order": 2, "visible": true, "columnKey": "shift_type"}, {"order": 3, "visible": true, "columnKey": "start_time"}, {"order": 4, "visible": true, "columnKey": "end_time"}, {"order": 5, "visible": true, "columnKey": "start_date"}, {"order": 6, "visible": true, "columnKey": "end_date"}, {"order": 7, "visible": true, "columnKey": "status"}, {"order": 8, "visible": true, "columnKey": "created_at"}, {"order": 9, "visible": false, "columnKey": "created_by_type"}, {"order": 10, "visible": true, "columnKey": "provider"}, {"order": 11, "visible": true, "columnKey": "facility"}, {"order": 12, "visible": true, "columnKey": "certificate"}, {"order": 13, "visible": true, "columnKey": "speciality"}, {"order": 14, "visible": false, "columnKey": "total_requests"}, {"order": 15, "visible": true, "columnKey": "total_invites"}, {"order": 16, "visible": false, "columnKey": "ordered_by"}, {"order": 17, "visible": false, "columnKey": "premium_rate"}, {"order": 18, "visible": false, "columnKey": "description"}, {"order": 19, "visible": false, "columnKey": "follower"}, {"order": 20, "visible": false, "columnKey": "floor"}]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "columns_preference" DROP COLUMN "table_type"`,
    );
  }
}

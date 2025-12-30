import { MigrationInterface, QueryRunner } from 'typeorm';

export class Holiday1755496660679 implements MigrationInterface {
  name = 'Holiday1755496660679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "holiday_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_45ca6263799692e0081c77e28d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_holiday" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "start_date" date NOT NULL, "end_date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "facility_id" uuid, "holiday_group_id" uuid, CONSTRAINT "PK_d6313c2cd4f00b381584626ef32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_704c70d0755b8b53809f4d9e80" ON "facility_holiday" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_96a91fc60e7f478d7909a556f5" ON "facility_holiday" ("holiday_group_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" ADD CONSTRAINT "FK_704c70d0755b8b53809f4d9e80c" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" ADD CONSTRAINT "FK_96a91fc60e7f478d7909a556f5c" FOREIGN KEY ("holiday_group_id") REFERENCES "holiday_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" DROP CONSTRAINT "FK_96a91fc60e7f478d7909a556f5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_holiday" DROP CONSTRAINT "FK_704c70d0755b8b53809f4d9e80c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_96a91fc60e7f478d7909a556f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_704c70d0755b8b53809f4d9e80"`,
    );
    await queryRunner.query(`DROP TABLE "facility_holiday"`);
    await queryRunner.query(`DROP TABLE "holiday_group"`);
  }
}

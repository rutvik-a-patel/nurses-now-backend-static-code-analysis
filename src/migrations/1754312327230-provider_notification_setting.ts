import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderNotificationSetting1754312327230
  implements MigrationInterface
{
  name = 'ProviderNotificationSetting1754312327230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."provider_notification_setting_type_enum" AS ENUM('shift', 'account')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_notification_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "type" "public"."provider_notification_setting_type_enum" NOT NULL, "push" boolean NOT NULL DEFAULT true, "email" boolean NOT NULL DEFAULT false, "order_by" integer, "provider_id" uuid, CONSTRAINT "PK_183707188569d24b69c52f09596" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_notification_setting" ADD CONSTRAINT "FK_457abb159c73c688448f4f0dd22" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`CREATE OR REPLACE FUNCTION add_provider_notification_setting()
            RETURNS TRIGGER AS $$
            BEGIN

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Shift reminder', 'shift', true, false, 1);

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Shift cancellation', 'shift', true, false, 2);
                
                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Shift completion', 'shift', true, false, 3);

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Shift request approval', 'shift', true, false, 4);

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Shift request rejected', 'shift', true, false, 5);

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Shift details update', 'shift', true, false, 6);

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'When the facility invite for the shift', 'shift', true, false, 7);

                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'When the facility takes back the request', 'shift', true, false, 8);
                
                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'New facility alert', 'shift', true, false, 9);


                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Account update', 'account', true, false, 10);
                
                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Payroll notification', 'account', true, false, 11);
                
                INSERT INTO provider_notification_setting (provider_id, name, type, push, email, order_by) 
                VALUES (NEW.id, 'Compliance update', 'account', true, false, 12);
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`CREATE TRIGGER after_create_provider_trigger
            AFTER INSERT ON provider
            FOR EACH ROW
            EXECUTE FUNCTION add_provider_notification_setting();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER after_create_provider_trigger ON provider;`,
    );
    await queryRunner.query(
      `DROP FUNCTION add_provider_notification_setting();`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_notification_setting" DROP CONSTRAINT "FK_457abb159c73c688448f4f0dd22"`,
    );
    await queryRunner.query(`DROP TABLE "provider_notification_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_notification_setting_type_enum"`,
    );
  }
}

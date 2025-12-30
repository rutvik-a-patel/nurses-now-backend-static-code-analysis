import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1752147120383 implements MigrationInterface {
  name = 'Initial1752147120383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS public.shift_number_seq
            INCREMENT 1
            START 1
            MINVALUE 1
            MAXVALUE 9223372036854775807
            CACHE 1;
    `);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.generate_unique_shift_id()
            RETURNS text
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE PARALLEL UNSAFE
        AS $BODY$
        DECLARE
            timestamp_part TEXT;
            random_part TEXT;
            new_shift_id TEXT;
        BEGIN
            LOOP
                -- Generate shift number
                timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
                random_part := nextval('shift_number_seq')::TEXT;
                -- Apply padding only if the sequence number is less than 1000
                IF CAST(random_part AS INTEGER) < 1000 THEN
                    random_part := LPAD(random_part, 4, '0');
                END IF;
                new_shift_id := random_part;

                -- Check if the generated number already exists in the table
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM shift WHERE shift_id::text = new_shift_id::text
                );
            END LOOP;

            RETURN new_shift_id;
        END;
        $BODY$;
    `);
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS public.shift_time_number_seq
            INCREMENT 1
            START 1
            MINVALUE 1
            MAXVALUE 9223372036854775807
            CACHE 1;
    `);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.generate_unique_shift_time_id()
            RETURNS text
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE PARALLEL UNSAFE
        AS $BODY$
        DECLARE
            timestamp_part TEXT;
            random_part TEXT;
            new_shift_time_id TEXT;
        BEGIN
            LOOP
                -- Generate shift_time number
                timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
                random_part := nextval('shift_time_number_seq')::TEXT;
                -- Apply padding only if the sequence number is less than 1000
                IF CAST(random_part AS INTEGER) < 1000 THEN
                    random_part := LPAD(random_part, 4, '0');
                END IF;
                new_shift_time_id := random_part;

                -- Check if the generated number already exists in the table
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM facility_shift_setting WHERE shift_time_id::text = new_shift_time_id::text
                );
            END LOOP;

            RETURN new_shift_time_id;
        END;
        $BODY$;
    `);
    await queryRunner.query(`
        CREATE SEQUENCE IF NOT EXISTS public.document_number_seq
            INCREMENT 1
            START 1
            MINVALUE 1
            MAXVALUE 9223372036854775807
            CACHE 1;
    `);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION public.generate_unique_document_id()
            RETURNS text
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE PARALLEL UNSAFE
        AS $BODY$
        DECLARE
            timestamp_part TEXT;
            random_part TEXT;
            new_document_id TEXT;
        BEGIN
            LOOP
                -- Generate document number
                timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
                random_part := nextval('document_number_seq')::TEXT;
                -- Apply padding only if the sequence number is less than 1000
                IF CAST(random_part AS INTEGER) < 100000 THEN
                    random_part := LPAD(random_part, 6, '0');
                END IF;
                new_document_id := random_part;

                -- Check if the generated number already exists in the table
                EXIT WHEN NOT EXISTS (
                    SELECT 1 FROM provider_credential WHERE document_id::text = new_document_id::text
                );
            END LOOP;

            RETURN new_document_id;
        END;
        $BODY$;
    `);
    await queryRunner.query(
      `CREATE TYPE "public"."permission_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."permission_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sub_section_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."sub_section_status_enum" NOT NULL DEFAULT 'active', "section_id" uuid, CONSTRAINT "PK_8bb7e1b5b1460df44eccc43e804" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."section_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."section_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_section_permission_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_section_permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."role_section_permission_status_enum" NOT NULL DEFAULT 'active', "has_access" boolean NOT NULL DEFAULT false, "is_default" boolean NOT NULL DEFAULT false, "role_id" uuid, "sub_section_id" uuid, "section_id" uuid, "permission_id" uuid, CONSTRAINT "PK_09c69e3d86f4c8001fa668ae453" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."role_status_enum" NOT NULL DEFAULT 'active', "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."status_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."status_setting_status_for_enum" AS ENUM('provider', 'facility')`,
    );
    await queryRunner.query(
      `CREATE TABLE "status_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "background_color" character varying NOT NULL, "text_color" character varying NOT NULL, "description" text, "status" "public"."status_setting_status_enum" NOT NULL DEFAULT 'active', "status_for" "public"."status_setting_status_for_enum", "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c57fddba1d2c497ccd644481efc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."speciality_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "speciality" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "abbreviation" character varying NOT NULL, "status" "public"."speciality_status_enum" NOT NULL DEFAULT 'active', "certificates" uuid array, "display" boolean NOT NULL DEFAULT true, "workforce_portal_alias" character varying NOT NULL DEFAULT true, "text_color" character varying, "background_color" character varying, CONSTRAINT "PK_cfdbcfa372a34f2d9c1d5180052" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "floor_detail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "beds" integer NOT NULL DEFAULT '0', "po_number" character varying, "cost_center" character varying, "phone_number" character varying(15), "description" text, "speciality_id" uuid, "default_order_contact" uuid, "client_contact" uuid, "facility_id" uuid, CONSTRAINT "PK_392bcd62581f20241ac3d3f8add" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_saved_facility" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "provider_id" uuid, "facility_id" uuid, CONSTRAINT "PK_7388fd03f668a811f86d1945780" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_reject_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_reject_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "description" text, "status" "public"."facility_reject_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_bf7fc6a8cd0d16ad2c52b19fefb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_flag_enum" AS ENUM('preferred', 'dnr')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_provider_dnr_type_enum" AS ENUM('clinical', 'professional')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "flag" "public"."facility_provider_flag_enum", "dnr_type" "public"."facility_provider_dnr_type_enum", "dnr_reason" uuid array, "dnr_description" text, "provider_id" uuid, "facility_id" uuid, CONSTRAINT "UQ_3171cf9973065ea567bd973c4e4" UNIQUE ("provider_id", "facility_id"), CONSTRAINT "PK_a490d50f63367d705dac524be0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."time_entry_setting_timecard_rounding_direction_enum" AS ENUM('standard', 'round_up', 'round_down')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."time_entry_setting_time_approval_method_enum" AS ENUM('signed_timecard', 'esignature', 'facility')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."time_entry_setting_allowed_entries_enum" AS ENUM('regular', 'meal_break', 'other_break', 'callback', 'on_call')`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_entry_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "timecard_rounding" integer NOT NULL DEFAULT '0', "timecard_rounding_direction" "public"."time_entry_setting_timecard_rounding_direction_enum" NOT NULL DEFAULT 'standard', "default_lunch_duration" integer NOT NULL DEFAULT '0', "time_approval_method" "public"."time_entry_setting_time_approval_method_enum" NOT NULL DEFAULT 'signed_timecard', "allowed_entries" "public"."time_entry_setting_allowed_entries_enum" array, "check_missed_meal_break" boolean NOT NULL DEFAULT true, "location" text, "enforce_geo_fence" boolean NOT NULL DEFAULT true, "geo_fence_radius" integer NOT NULL DEFAULT '0', "facility_id" uuid, CONSTRAINT "REL_52dc0646a61c6656dfb58b3aad" UNIQUE ("facility_id"), CONSTRAINT "PK_baad01e4732e53f6e171b5ab636" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_portal_setting_scheduling_warnings_enum" AS ENUM('overtime', 'double_shift')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_portal_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "allow_cancellation" boolean NOT NULL DEFAULT true, "cancellation_advance" integer NOT NULL DEFAULT '0', "scheduling_warnings" "public"."facility_portal_setting_scheduling_warnings_enum" array, "client_confirmation" boolean NOT NULL DEFAULT true, "facility_id" uuid, CONSTRAINT "REL_83408f293e2fdfc3b3f8d7a23b" UNIQUE ("facility_id"), CONSTRAINT "PK_ef44eece0fb37bc1073ca51d361" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."line_of_business_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "line_of_business" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "work_comp_code" character varying NOT NULL, "status" "public"."line_of_business_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_38eeccc38228d3292b3b17d7bb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_orientation_process_enum" AS ENUM('orientation_shift', 'electronic_orientation_documents', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "email" character varying, "country_code" character varying(5), "mobile_no" character varying(15), "total_beds" integer NOT NULL DEFAULT '0', "base_url" character varying, "image" character varying, "description" text, "first_shift" text, "orientation" text, "shift_description" text, "breaks_instruction" text, "dress_code" text, "parking_instruction" text, "doors_locks" text, "timekeeping" text, "employee_id" character varying, "password" character varying, "street_address" character varying, "house_no" character varying, "zip_code" character varying, "latitude" numeric(9,6), "longitude" numeric(9,6), "place_id" character varying, "city" character varying, "state" character varying, "country" character varying, "master_facility_id" uuid, "is_master" boolean NOT NULL DEFAULT false, "is_email_verified" boolean NOT NULL DEFAULT false, "is_floor" boolean NOT NULL DEFAULT false, "shift_setting" uuid array NOT NULL DEFAULT '{}', "reason_description" text, "invoice_pay_duration" integer NOT NULL DEFAULT '0', "orientation_process" "public"."facility_orientation_process_enum", "certificate" uuid array, "speciality" uuid array, "work_comp_code" character varying, "orientation_document" character varying, "login_attempt" integer NOT NULL DEFAULT '0', "login_attempt_at" TIMESTAMP WITH TIME ZONE, "timezone" character varying, "client_type" character varying, "general_notes" text, "staff_note" text, "bill_notes" text, "website" character varying, "facility_type_id" uuid, "admin_id" uuid, "referred_by" uuid, "status" uuid, "reason_id" uuid, CONSTRAINT "PK_07c6c82781d105a680b5c265be6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_permission_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."facility_permission_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_143fe231afa07e2b972e5ac8f6d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_user_permission_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_user_permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "has_access" boolean NOT NULL, "status" "public"."facility_user_permission_status_enum" NOT NULL DEFAULT 'active', "facility_user_id" uuid, "facility_permission_id" uuid, CONSTRAINT "PK_008888fa2bade77f4e184a495da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_user_status_enum" AS ENUM('invited', 'active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "email" character varying NOT NULL, "country_code" character varying(5), "mobile_no" character varying(15), "password" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "base_url" character varying, "image" character varying, "signature" character varying, "status" "public"."facility_user_status_enum" NOT NULL DEFAULT 'in_active', "facility_id" uuid array NOT NULL DEFAULT '{}', "login_attempt" integer NOT NULL DEFAULT '0', "login_attempt_at" TIMESTAMP WITH TIME ZONE, "title" character varying, "primary_facility_id" uuid, CONSTRAINT "REL_c26a3bf9e5fcd903869ca0e9b7" UNIQUE ("primary_facility_id"), CONSTRAINT "PK_718ea53c03fe54c85a6b6e8cf8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_cancel_reason_user_type_enum" AS ENUM('provider', 'facility')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_cancel_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_cancel_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "user_type" "public"."shift_cancel_reason_user_type_enum" NOT NULL DEFAULT 'facility', "status" "public"."shift_cancel_reason_status_enum" NOT NULL DEFAULT 'in_active', CONSTRAINT "PK_a6b5c3708af83c70564df88cf5a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_invitation_status_enum" AS ENUM('withdrawn', 'accepted', 'invited', 'unseen', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_invitation_shift_status_enum" AS ENUM('open', 'requested', 'invite_sent', 'scheduled', 'completed', 'un_submitted', 'cancelled', 'ongoing', 'running_late', 'auto_scheduling', 'void')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."shift_invitation_status_enum" NOT NULL DEFAULT 'unseen', "shift_status" "public"."shift_invitation_shift_status_enum" NOT NULL DEFAULT 'invite_sent', "invited_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "provider_id" uuid, "shift_id" uuid, CONSTRAINT "PK_179ce0c075695f087e1ed9cb8b5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8b8abce53647d6fbe62057cf5" ON "shift_invitation" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d23dc93dbbe883e0641dcaf1e9" ON "shift_invitation" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_request_status_enum" AS ENUM('assigned', 'rejected', 'unassigned')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."shift_request_status_enum" NOT NULL DEFAULT 'unassigned', "provider_id" uuid, "shift_id" uuid, CONSTRAINT "PK_4c194a10bbe33ca5c61d3352065" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dbe14770d28bb24651ab709d9d" ON "shift_request" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb58116a757f6a9d910540d839" ON "shift_request" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timecard_reject_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "timecard_reject_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "status" "public"."timecard_reject_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_242efc671f8d3df6f624100de1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "notes" text NOT NULL, "shift_id" uuid, "admin_id" uuid, CONSTRAINT "PK_677109fb293e075d6ea86cb7577" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_cancelled_shift" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "shift_id" uuid, "provider_id" uuid, CONSTRAINT "PK_8bf5f1c4501a9d6024df794b9c6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_status_enum" AS ENUM('open', 'requested', 'invite_sent', 'scheduled', 'completed', 'un_submitted', 'cancelled', 'ongoing', 'running_late', 'auto_scheduling', 'void')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_shift_type_enum" AS ENUM('per_diem', 'long_term', 'travel')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_created_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_updated_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_cancelled_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_timecard_status_enum" AS ENUM('pending', 'invoiced', 'disputed', 'resolved')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_timecard_approve_type_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_timecard_rejected_type_enum" AS ENUM('admin', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "shift_id" character varying NOT NULL DEFAULT generate_unique_shift_id(), "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_repeat" boolean NOT NULL DEFAULT false, "days" text, "start_date" date NOT NULL, "end_date" date NOT NULL, "description" text, "is_publish" boolean NOT NULL DEFAULT false, "base_url" character varying, "status" "public"."shift_status_enum" NOT NULL DEFAULT 'open', "shift_type" "public"."shift_shift_type_enum" NOT NULL DEFAULT 'per_diem', "temp_conf_at" TIMESTAMP WITH TIME ZONE, "client_conf_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid NOT NULL, "created_by_type" "public"."shift_created_by_type_enum" NOT NULL DEFAULT 'admin', "updated_by_id" uuid NOT NULL, "updated_by_type" "public"."shift_updated_by_type_enum" NOT NULL DEFAULT 'admin', "cancelled_on" TIMESTAMP WITH TIME ZONE, "cancelled_by_id" uuid, "cancelled_by_type" "public"."shift_cancelled_by_type_enum", "cancel_reason_description" text, "clock_in_date" date, "clock_out_date" date, "clock_in" TIME, "clock_out" TIME, "break_start_time" bigint, "break_end_time" bigint, "break_duration" integer NOT NULL DEFAULT '0', "total_break" integer NOT NULL DEFAULT '0', "total_worked" integer NOT NULL DEFAULT '0', "additional_details" text, "time_sheets" character varying array, "provider_signature" character varying, "timecard_status" "public"."shift_timecard_status_enum", "timecard_reject_reason_description" text, "timecard_approve_date" TIMESTAMP WITH TIME ZONE, "timecard_approve_type" "public"."shift_timecard_approve_type_enum", "timecard_approve_by_id" uuid, "timecard_rejected_date" TIMESTAMP WITH TIME ZONE, "timecard_rejected_by_id" uuid, "timecard_rejected_type" "public"."shift_timecard_rejected_type_enum", "authority_signature" character varying, "premium_rate" boolean NOT NULL DEFAULT false, "modified_at" TIMESTAMP WITH TIME ZONE, "is_ai_triggered" boolean, "certificate_id" uuid, "speciality_id" uuid, "facility_id" uuid, "follower_id" uuid, "floor_id" uuid, "provider_id" uuid, "shift_cancel_reason_id" uuid, "timecard_reject_reason_id" uuid, CONSTRAINT "PK_53071a6485a1e9dc75ec3db54b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57edf600c3308567809803f54c" ON "shift" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5dd2b2a9c3cac1a05b89badde5" ON "shift" ("certificate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_60020053575649fa85bae8e9af" ON "shift" ("speciality_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e26414f4a2d12160bec341b74f" ON "shift" ("facility_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_367d2376b3928bef0536717afa" ON "shift" ("follower_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2c48397edd67c006a40cdbc1c" ON "shift" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."certificate_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "certificate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "abbreviation" character varying NOT NULL, "status" "public"."certificate_status_enum" NOT NULL DEFAULT 'active', "specialities" uuid array, "display" boolean NOT NULL DEFAULT true, "workforce_portal_alias" character varying, "text_color" character varying, "background_color" character varying, CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_address_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_address_type_enum" AS ENUM('default', 'temporary', 'assignment')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_address_status_enum" NOT NULL DEFAULT 'active', "type" "public"."provider_address_type_enum" NOT NULL DEFAULT 'default', "zip_code" character varying, "street" character varying, "apartment" character varying, "latitude" numeric(9,6), "longitude" numeric(9,6), "place_id" character varying, "city" character varying, "state" character varying, "country" character varying, "provider_id" uuid, CONSTRAINT "PK_3e10fb8288d086608be8e6ff05c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_general_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_general_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_general_setting_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_7912fa544255f739ae624b05dc1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_general_setting_section_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_general_setting_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_general_setting_section_status_enum" NOT NULL DEFAULT 'active', "name" character varying NOT NULL, "key" character varying NOT NULL, "order" integer NOT NULL, "provider_general_setting_id" uuid, CONSTRAINT "PK_8576677975d6fb28141c96f568b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_general_setting_sub_section_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_general_setting_sub_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_general_setting_sub_section_status_enum" NOT NULL DEFAULT 'active', "name" character varying NOT NULL, "key" character varying NOT NULL, "order" integer NOT NULL, "has_remark" boolean NOT NULL DEFAULT false, "placeholder" character varying, "instruction" character varying, "type" character varying, "provider_general_setting_section_id" uuid, CONSTRAINT "PK_2f07e05700f7cc8ff9b7d8aa134" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_acknowledgement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "response" boolean NOT NULL, "remark" character varying, "general_setting_sub_section_id" uuid, "provider_acknowledgement_id" uuid, CONSTRAINT "PK_160a6ac1e55868a16f0a4ab2eb8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_acknowledgement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "base_url" character varying, "signature" character varying NOT NULL, CONSTRAINT "PK_784fbcee249d38127aea0b9ab1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."otp_type_enum" AS ENUM('signup', 'login', 'forgot_password', 'change_number')`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."otp_status_enum" NOT NULL DEFAULT 'active', "otp" integer NOT NULL, "email" character varying, "country_code" character varying(5), "contact_number" character varying(15), "type" "public"."otp_type_enum" NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "expire_at" integer NOT NULL, "provider_id" uuid, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_education_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "school" character varying, "location" character varying, "course" character varying, "degree" character varying, "graduation_date" date, "provider_id" uuid, CONSTRAINT "PK_f3082ecb24ab763cb2b470feb48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_work_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "employer_name" character varying, "supervisors_name" character varying, "supervisors_title" character varying, "work_phone_country_code" character varying(5), "work_phone" character varying(15), "location" character varying, "is_teaching_facility" boolean NOT NULL DEFAULT false, "charge_experience" boolean NOT NULL DEFAULT false, "can_contact_employer" boolean NOT NULL DEFAULT false, "is_current" boolean NOT NULL DEFAULT false, "start_date" date, "end_date" date, "provider_id" uuid, CONSTRAINT "PK_3fa6d81d954c554b61cff6cec6b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_professional_reference_send_form_by_enum" AS ENUM('sms', 'email')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_professional_reference_status_enum" AS ENUM('awaiting_response', 'no_response', 'decline', 'awaiting_approval', 'approved')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_professional_reference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "employer" character varying, "name" character varying, "title" character varying, "email" character varying, "country_code" character varying(5), "mobile_no" character varying(15), "start_date" date, "end_date" date, "send_form_by" "public"."provider_professional_reference_send_form_by_enum", "status" "public"."provider_professional_reference_status_enum" DEFAULT 'awaiting_response', "total_reminder_sent" integer NOT NULL DEFAULT '0', "provider_id" uuid, CONSTRAINT "PK_77d6d62c76ce6f1e50e59c3d63c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "competency_test_option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "option" character varying NOT NULL, "order" integer NOT NULL, "is_answer" boolean NOT NULL DEFAULT false, "competency_test_question_id" uuid, CONSTRAINT "PK_5d6f80ba00a54bc2e89afd0c30c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "competency_test_question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "question" character varying NOT NULL, "order" integer NOT NULL, "competency_test_setting_id" uuid, CONSTRAINT "PK_d726278590526831e564a8ca6f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."competency_test_global_setting_expiration_duration_type_enum" AS ENUM('day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."competency_test_global_setting_reassignment_duration_type_enum" AS ENUM('day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `CREATE TABLE "competency_test_global_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "expires_in" integer NOT NULL DEFAULT '1', "expiration_duration_type" "public"."competency_test_global_setting_expiration_duration_type_enum" NOT NULL DEFAULT 'year', "total_attempts" integer NOT NULL DEFAULT '3', "reassignment_duration" integer NOT NULL DEFAULT '365', "reassignment_duration_type" "public"."competency_test_global_setting_reassignment_duration_type_enum" NOT NULL DEFAULT 'day', "competency_test_setting_id" uuid, CONSTRAINT "REL_ccd19da1c1129afeb81149161f" UNIQUE ("competency_test_setting_id"), CONSTRAINT "PK_c7bc9a7923d57b72876e5de927c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."competency_test_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "competency_test_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "required_score" numeric NOT NULL DEFAULT '0', "duration" character varying NOT NULL, "status" "public"."competency_test_setting_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_e50711a9893ba68c12b310ee6d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "competency_test_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "question" character varying NOT NULL, "option_one" character varying NOT NULL, "option_two" character varying NOT NULL, "option_three" character varying, "option_four" character varying, "correct_answer" character varying NOT NULL, "answer" character varying, "is_correct" boolean NOT NULL DEFAULT false, "competency_test_score_id" uuid, CONSTRAINT "PK_99600a312fe40a309ee4a031168" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."competency_test_score_test_status_enum" AS ENUM('passed', 'failed', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "competency_test_score" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "score" numeric NOT NULL DEFAULT '0', "test_status" "public"."competency_test_score_test_status_enum" NOT NULL DEFAULT 'pending', "name" character varying NOT NULL, "required_score" numeric NOT NULL DEFAULT '0', "total_questions" integer NOT NULL DEFAULT '0', "duration" character varying NOT NULL, "provider_id" uuid, "competency_test_setting_id" uuid, CONSTRAINT "PK_2244e89f07fb0b7f7b5c359785c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credentials_category_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "credentials_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."credentials_category_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_e01c9c6b6a9a030e9ce846f2488" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credentials_auto_assign_enum" AS ENUM('none', 'pre_hire', 'post_hire')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credentials_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."credentials_validate_enum" AS ENUM('none', 'warn', 'refuse')`,
    );
    await queryRunner.query(
      `CREATE TABLE "credentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "credential_id" uuid, "licenses" uuid array NOT NULL, "is_essential" boolean NOT NULL DEFAULT false, "expiry_required" boolean NOT NULL DEFAULT false, "issued_required" boolean NOT NULL DEFAULT false, "document_required" boolean NOT NULL DEFAULT false, "doc_number_required" boolean NOT NULL DEFAULT false, "approval_required" boolean NOT NULL DEFAULT false, "state_id" uuid array, "auto_assign" "public"."credentials_auto_assign_enum" NOT NULL, "status" "public"."credentials_status_enum" NOT NULL DEFAULT 'active', "validate" "public"."credentials_validate_enum" NOT NULL, "credentials_category_id" uuid, "created_by" uuid, "updated_by" uuid, CONSTRAINT "PK_1e38bc43be6697cdda548ad27a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_deddc3fc8fa9227193e910b0c3" ON "credentials" ("credential_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3687b3fccdbab520530e329a7f" ON "credentials" ("credentials_category_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_credential_is_verified_enum" AS ENUM('pending', 'verified', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_credential" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "filename" character varying, "original_filename" character varying, "document_id" character varying NOT NULL DEFAULT generate_unique_document_id(), "license" character varying NOT NULL, "issue_date" date, "expiry_date" date, "is_other" boolean NOT NULL DEFAULT false, "is_verified" "public"."provider_credential_is_verified_enum" NOT NULL DEFAULT 'pending', "credential_id" uuid, "provider_id" uuid, "previous_document_id" uuid, CONSTRAINT "REL_4dd917cb3099a640128a1e2851" UNIQUE ("previous_document_id"), CONSTRAINT "PK_17fd6acbdedcea273d5aebe5743" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_reject_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_reject_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "description" text, "status" "public"."provider_reject_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_60f9abd67940509696224636f79" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_analytics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "total_shift" integer NOT NULL DEFAULT '0', "shift_attended" integer NOT NULL DEFAULT '0', "attendance_score" double precision NOT NULL DEFAULT '0', "on_time_check_in" integer NOT NULL DEFAULT '0', "on_time_rate" double precision NOT NULL DEFAULT '0', "late_shift_ratio" double precision NOT NULL DEFAULT '0', "provider_id" uuid, CONSTRAINT "REL_c23144738caccf7b665613bafd" UNIQUE ("provider_id"), CONSTRAINT "PK_e02caacf93877e49024b4ffe44f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."e_docs_group_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "e_docs_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."e_docs_group_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_36e7b74377584809dbb02a192da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."e_doc_expiration_period_enum" AS ENUM('day', 'week', 'month', 'year')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."e_doc_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "e_doc" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "base_url" character varying, "document" character varying, "new_file" character varying, "original_filename" character varying, "attachment_label" character varying, "instruction" character varying, "require_download" boolean NOT NULL DEFAULT false, "expiration_period" "public"."e_doc_expiration_period_enum", "expiration_duration" integer NOT NULL DEFAULT '0', "field_settings" json, "ref" json, "status" "public"."e_doc_status_enum" NOT NULL DEFAULT 'active', "is_replaced" boolean NOT NULL DEFAULT false, "document_group_id" uuid, CONSTRAINT "PK_26b0a54d7620f6fa248973e7329" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."e_doc_response_status_enum" AS ENUM('pending', 'verified', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "e_doc_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "base_url" character varying NOT NULL, "document" character varying NOT NULL, "is_other" boolean NOT NULL DEFAULT false, "status" "public"."e_doc_response_status_enum" NOT NULL DEFAULT 'pending', "e_doc_id" uuid, "provider_id" uuid, CONSTRAINT "PK_33d8fe526115eedfc2c716b3048" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "assigned_credential" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "credential_id" uuid NOT NULL, "provider_id" uuid, CONSTRAINT "PK_4f02ea7aae16ec8df947dee3a42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refer_facility" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "facility_name" character varying NOT NULL, "contact_person" character varying NOT NULL, "contact_number" character varying NOT NULL, "email" character varying NOT NULL, "extra_details" text, "street_address" character varying, "zip_code" character varying, "latitude" numeric(9,6), "longitude" numeric(9,6), "place_id" character varying, "city" character varying, "state" character varying, "provider_id" uuid, CONSTRAINT "PK_802fa1918ba82bec3907538567e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."skill_checklist_question_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "question" character varying NOT NULL, "order" integer NOT NULL, "status" "public"."skill_checklist_question_status_enum" NOT NULL DEFAULT 'active', "skill_checklist_sub_module_id" uuid, CONSTRAINT "PK_487ff515b6275a317966bb11892" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."skill_checklist_sub_module_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_sub_module" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."skill_checklist_sub_module_status_enum" NOT NULL DEFAULT 'active', "skill_checklist_module_id" uuid, CONSTRAINT "PK_ea103a87cf1effe6285bf47ca29" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."skill_checklist_module_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_module" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "order" integer NOT NULL, "status" "public"."skill_checklist_module_status_enum" NOT NULL DEFAULT 'active', "skill_checklist_template_id" uuid, CONSTRAINT "PK_a581820ed67728b3a264a765d4a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."skill_checklist_template_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."skill_checklist_template_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_d1a3f1fa3146674c8f874997a1b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_question_answer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "question" character varying NOT NULL, "answer" integer, "order" integer NOT NULL, "skill_checklist_answer_module_id" uuid, CONSTRAINT "PK_98874347e929dd8042e34f169d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_answer_module" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "sub_module" character varying NOT NULL, "skill_checklist_answer_id" uuid, CONSTRAINT "PK_a7a92ed4d2b6e2038ae549bdb10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_answer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "module" character varying NOT NULL, "order" integer NOT NULL, "skill_checklist_response_id" uuid, CONSTRAINT "PK_2a2b4d9b734b8a2af1cc3452cbf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."skill_checklist_response_status_enum" AS ENUM('completed', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_checklist_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."skill_checklist_response_status_enum" NOT NULL DEFAULT 'pending', "provider_id" uuid, "skill_checklist_template_id" uuid, CONSTRAINT "PK_0e1276cfbf7a3f24d1cb433a5a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_marital_status_enum" AS ENUM('married', 'unmarried')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_verification_status_enum" AS ENUM('verified', 'pending', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_shift_preference_enum" AS ENUM('Per Diem Shifts', 'Local Contracts', 'Travel Assignments')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_shift_time_enum" AS ENUM('Days', 'Evenings', 'Nights')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_profile_status_enum" AS ENUM('new', 'accepted', 'rejected', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "first_name" character varying, "middle_name" character varying, "nick_name" character varying, "last_name" character varying, "email" character varying, "unverified_email" character varying, "country_code" character varying(5), "mobile_no" character varying(15), "emergency_mobile_country_code" character varying(5), "emergency_mobile_no" character varying(15), "emergency_contact_name" character varying, "relation_with" character varying, "bio" text, "gender" character varying, "birth_date" date, "password" character varying, "google_id" character varying, "facebook_id" character varying, "apple_id" character varying, "base_url" character varying, "profile_image" character varying, "profession" character varying, "referred_by" character varying, "ssn" character varying, "citizenship" character varying, "veteran_status" boolean NOT NULL DEFAULT false, "race" character varying, "first_contact_date" date, "hire_date" date, "rehire_date" date, "first_work_date" date, "last_work_date" date, "last_paid_date" date, "termination_date" date, "work_comp_code" character varying, "hourly_burden" character varying, "employed_at" date, "employee_id" character varying, "is_deceased" boolean NOT NULL DEFAULT false, "deceased_date" date, "marital_status" "public"."provider_marital_status_enum", "verification_status" "public"."provider_verification_status_enum" NOT NULL DEFAULT 'pending', "additional_certification" uuid array, "additional_speciality" uuid array, "shift_preference" "public"."provider_shift_preference_enum" array, "preferred_state" character varying array, "radius" double precision, "shift_time" "public"."provider_shift_time_enum" array NOT NULL DEFAULT '{Days,Evenings,Nights}', "signature_image" character varying, "points" integer, "is_email_verified" boolean NOT NULL DEFAULT false, "is_mobile_verified" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "notify_me" boolean NOT NULL DEFAULT false, "is_terminated" boolean NOT NULL DEFAULT false, "latitude" numeric(9,6), "longitude" numeric(9,6), "availability_status" jsonb, "profile_status" "public"."provider_profile_status_enum" NOT NULL DEFAULT 'new', "reason_description" text, "login_attempt" integer NOT NULL DEFAULT '0', "login_attempt_at" TIMESTAMP WITH TIME ZONE, "checklist_completion_ratio" numeric NOT NULL DEFAULT '0', "credentials_completion_ratio" numeric NOT NULL DEFAULT '0', "test_attempts" integer NOT NULL DEFAULT '0', "test_date" TIMESTAMP WITH TIME ZONE, "certificate_id" uuid, "speciality_id" uuid, "status" uuid, "provider_acknowledgement_id" uuid, "reason_id" uuid, CONSTRAINT "REL_f25c549cb09418f91762aed299" UNIQUE ("provider_acknowledgement_id"), CONSTRAINT "PK_6ab2f66d8987bf1bfdd6136a2d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_device_type_enum" AS ENUM('all', 'web', 'android', 'ios')`,
    );
    await queryRunner.query(
      `CREATE TABLE "token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."token_status_enum" NOT NULL DEFAULT 'active', "jwt" text NOT NULL, "refresh_jwt" text, "firebase" text, "device_id" character varying, "device_name" character varying, "device_type" "public"."token_device_type_enum", "login_at" TIMESTAMP WITH TIME ZONE, "logout_at" TIMESTAMP WITH TIME ZONE, "admin_id" uuid, "provider_id" uuid, "facility_user_id" uuid, "facility_id" uuid, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admin_status_enum" AS ENUM('invited', 'active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying, "country_code" character varying(5), "mobile_no" character varying(15), "password" character varying, "base_url" character varying, "image" character varying, "signature" character varying, "status" "public"."admin_status_enum" NOT NULL DEFAULT 'in_active', "is_email_verified" boolean NOT NULL DEFAULT false, "login_attempt" integer NOT NULL DEFAULT '0', "login_attempt_at" TIMESTAMP WITH TIME ZONE, "role_id" uuid, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('general', 'offer_update', 'order_update', 'lab_report')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_for_enum" AS ENUM('all_user', 'one_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_device_type_enum" AS ENUM('all', 'web', 'android', 'ios')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."notification_status_enum" NOT NULL DEFAULT 'active', "type" "public"."notification_type_enum" NOT NULL DEFAULT 'general', "for" "public"."notification_for_enum" NOT NULL DEFAULT 'all_user', "title" character varying NOT NULL, "text" text NOT NULL, "device_type" "public"."notification_device_type_enum" NOT NULL DEFAULT 'all', "base_url" character varying, "image" character varying, "is_published" boolean NOT NULL DEFAULT true, "date_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "timezone" character varying, "push_type" character varying, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_notification_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."user_notification_status_enum" NOT NULL DEFAULT 'active', "is_read" boolean NOT NULL DEFAULT false, "data" jsonb, "notification_id" uuid, "provider_id" uuid, "facility_id" uuid, "facility_user_id" uuid, "admin_id" uuid, CONSTRAINT "PK_8840aac86dec5f669c541ce67d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_entry_approval" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "key" character varying NOT NULL, "name" character varying NOT NULL, "value" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1c9e9ccea3700b1aee693ead1ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."test_faq_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "test_faq" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "question" character varying NOT NULL, "answer" character varying NOT NULL, "order" integer NOT NULL, "status" "public"."test_faq_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_1222b47398651340f31b39a883b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."country_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "iso_code" character varying NOT NULL, "flag" character varying NOT NULL, "phone_code" character varying NOT NULL, "currency" character varying NOT NULL, "latitude" character varying NOT NULL, "longitude" character varying NOT NULL, "status" "public"."country_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."city_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "country_code" character varying NOT NULL, "state_code" character varying NOT NULL, "latitude" character varying, "longitude" character varying, "status" "public"."city_status_enum" NOT NULL DEFAULT 'active', "state_id" uuid, CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."state_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "iso_code" character varying NOT NULL, "country_code" character varying NOT NULL, "latitude" character varying, "longitude" character varying, "status" "public"."state_status_enum" NOT NULL DEFAULT 'active', "country_id" uuid, CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "site_access_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "base_url" character varying, "image" character varying, "theme_color" character varying, CONSTRAINT "PK_4c2944bb7e506888d6ebbc157ee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_type_shift_type_enum" AS ENUM('per_diem', 'long_term', 'travel')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_type_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "shift_type" "public"."shift_type_shift_type_enum" NOT NULL, "status" "public"."shift_type_status_enum" NOT NULL DEFAULT 'in_active', CONSTRAINT "PK_af30fda0de53b789fce18ac005c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "schedule_request_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "setting" character varying NOT NULL, "value" character varying NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_59405fac68eaa7bb57cfdb6caf5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."room_user_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."room_sender_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user', 'department')`,
    );
    await queryRunner.query(
      `CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "user_id" uuid NOT NULL, "user_type" "public"."room_user_type_enum" NOT NULL, "sender_id" uuid NOT NULL, "sender_type" "public"."room_sender_type_enum" NOT NULL, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reference_form_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reference_form" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "status" "public"."reference_form_status_enum" NOT NULL DEFAULT 'in_active', CONSTRAINT "PK_ddf17e51206ef64d91c5fd793cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reference_form_design_option_type_enum" AS ENUM('multiple_choice', 'dropdown', 'textarea')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reference_form_design" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "option_type" "public"."reference_form_design_option_type_enum" NOT NULL, "order" integer NOT NULL, "reference_form_id" uuid, CONSTRAINT "PK_3d66dc9f0203768c87cebfc08e0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reference_form_option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "order" integer NOT NULL, "reference_form_design_id" uuid, CONSTRAINT "PK_ac63902d803a4be69f7cb8b319c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reference_form_global_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "total_reminder_attempts" integer NOT NULL DEFAULT '3', "reminder_interval" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_47cc8fc2eadaa41080876dca9e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_profile_setting_sub_section_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_profile_setting_sub_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_profile_setting_sub_section_status_enum" NOT NULL DEFAULT 'active', "is_required" boolean NOT NULL DEFAULT true, "order" integer NOT NULL, "name" character varying NOT NULL, "key" character varying NOT NULL, "placeholder" character varying, "type" character varying, "provider_profile_setting_section_id" uuid, CONSTRAINT "PK_8d931c738fe71d13f8facd88ae2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_profile_setting_section_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_profile_setting_section" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_profile_setting_section_status_enum" NOT NULL DEFAULT 'active', "name" character varying NOT NULL, "key" character varying NOT NULL, "order" integer NOT NULL, "provider_profile_setting_id" uuid, CONSTRAINT "PK_d9e6ab7e6e899ec54c2cc2f3a3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_profile_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_profile_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_profile_setting_status_enum" NOT NULL DEFAULT 'active', "name" character varying NOT NULL, "key" character varying NOT NULL, CONSTRAINT "PK_b763eb7d3fcd43651f809aa0f1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."provider_orientation_status_enum" AS ENUM('requested', 'completed', 'approved', 'packet_sent', 'not_interested', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "provider_orientation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."provider_orientation_status_enum" NOT NULL DEFAULT 'requested', "orientation_notes" text, "cancel_description" text, "facility_id" uuid, "provider_id" uuid, CONSTRAINT "PK_64d65cb0f8db2fbb3aa19f04fa1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "professional_reference_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "question" character varying, "answer" character varying, "provider_professional_reference_id" uuid, CONSTRAINT "PK_af0016bcabb58eba7096f180861" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_notification_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "notified_at" TIMESTAMP WITH TIME ZONE NOT NULL, "provider_id" uuid, "shift_id" uuid, CONSTRAINT "PK_05b6de25402fe84f7cc88b2ec5d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_notification_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "notified_at" TIMESTAMP WITH TIME ZONE NOT NULL, "provider_id" uuid, "facility_id" uuid, CONSTRAINT "PK_4438af17bb8582a7e7d79ba884d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_user_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user', 'department')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_sender_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user', 'department')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "message" text, "user_id" uuid NOT NULL, "user_type" "public"."chat_user_type_enum" NOT NULL, "sender_id" uuid NOT NULL, "sender_type" "public"."chat_sender_type_enum" NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "is_edit" boolean NOT NULL DEFAULT false, "shift_id" uuid, "media_id" uuid, "parent_id" uuid, CONSTRAINT "REL_2f993055b56cfb92e62c930c2a" UNIQUE ("media_id"), CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "base_url" character varying NOT NULL, "image" character varying array, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invite_status_enum" AS ENUM('pending', 'accepted', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invite_type_enum" AS ENUM('forgot_password', 'invitation')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invite_role_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."invite_status_enum" NOT NULL DEFAULT 'pending', "email" character varying, "user_id" uuid, "type" "public"."invite_type_enum" NOT NULL, "role" "public"."invite_role_enum" NOT NULL, CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."flag_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "flag_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "description" text, "color" character varying NOT NULL, "status" "public"."flag_setting_status_enum" NOT NULL DEFAULT 'active', "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_98ada30e54405e1dfd6cbb2e914" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_shift_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_shift_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."facility_shift_setting_status_enum" NOT NULL DEFAULT 'active', "name" character varying NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "shift_time_id" character varying NOT NULL DEFAULT generate_unique_shift_time_id(), CONSTRAINT "PK_2f4da44d836e53f0df6e9d9624b" PRIMARY KEY ("id"))`,
    );
    // facility shift setting alter
    await queryRunner.query(
      `ALTER TABLE "facility" DROP COLUMN "shift_setting"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_shift_setting" ADD "facility_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3bf351905e044bace6864f020" ON "facility_shift_setting" ("facility_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_shift_setting" ADD CONSTRAINT "FK_f3bf351905e044bace6864f0201" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "facility_shift_setting" ADD "time_code" character varying`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."facility_profile_setting_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_profile_setting_section_enum" AS ENUM('contact_details', 'general_instructions', 'infrastructure')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_profile_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "status" "public"."facility_profile_setting_status_enum" NOT NULL DEFAULT 'active', "is_required" boolean NOT NULL DEFAULT true, "section" "public"."facility_profile_setting_section_enum" NOT NULL, "name" character varying NOT NULL, "key" character varying NOT NULL, "placeholder" character varying, "type" character varying, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_bb8582e401e3dabf82d1a7c3068" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."facility_general_setting_type_enum" AS ENUM('schedule', 'report', 'chat', 'time_attendance', 'billing')`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_general_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "type" "public"."facility_general_setting_type_enum" NOT NULL, "label" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_18ae81330de58df0297eb8a4186" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_document_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, CONSTRAINT "PK_32832ac78a152bded77cba61a77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "is_required" boolean NOT NULL DEFAULT true, "facility_document_category" uuid, CONSTRAINT "PK_4ef608ba604ef9dd46bc771054b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dnr_reason_reason_type_enum" AS ENUM('clinical', 'professional')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dnr_reason_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dnr_reason" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "reason" character varying NOT NULL, "reason_type" "public"."dnr_reason_reason_type_enum" NOT NULL, "status" "public"."dnr_reason_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_198e3adaef1c10699e3ffda8d48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."department_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying, "base_url" character varying, "image" character varying, "status" "public"."department_status_enum" NOT NULL DEFAULT 'active', "members" uuid array NOT NULL DEFAULT '{}', CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "columns_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "user_id" uuid NOT NULL, "columns_config" jsonb NOT NULL DEFAULT '[{"columnKey":"shift_id","visible":true,"order":1},{"columnKey":"shift_type","visible":true,"order":2},{"columnKey":"start_time","visible":true,"order":3},{"columnKey":"end_time","visible":true,"order":4},{"columnKey":"start_date","visible":true,"order":5},{"columnKey":"end_date","visible":true,"order":6},{"columnKey":"status","visible":true,"order":7},{"columnKey":"created_at","visible":true,"order":8},{"columnKey":"created_by_type","visible":false,"order":9},{"columnKey":"provider","visible":true,"order":10},{"columnKey":"facility","visible":true,"order":11},{"columnKey":"certificate","visible":true,"order":12},{"columnKey":"speciality","visible":true,"order":13},{"columnKey":"total_requests","visible":false,"order":14},{"columnKey":"total_invites","visible":true,"order":15},{"columnKey":"ordered_by","visible":false,"order":16},{"columnKey":"premium_rate","visible":false,"order":17},{"columnKey":"description","visible":false,"order":18},{"columnKey":"follower","visible":false,"order":19},{"columnKey":"floor","visible":false,"order":20}]', CONSTRAINT "PK_47d74490645ccd72f062684babc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "badge_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "attendance_score" integer NOT NULL DEFAULT '0', "on_time_threshold" integer NOT NULL DEFAULT '0', "show_up_rate" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_bd583621c5bd7b095eea4916770" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auto_scheduling_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "provider_radius" integer NOT NULL DEFAULT '10', "running_late_ai_time" integer NOT NULL DEFAULT '30', "check_distance_time" integer NOT NULL DEFAULT '30', "facility_cancel_time" integer NOT NULL DEFAULT '300', "cancel_request_expiry" integer NOT NULL DEFAULT '5', "running_late_request_expiry" integer NOT NULL DEFAULT '5', "send_another_request" integer NOT NULL DEFAULT '300', "post_shift_to_open" integer NOT NULL DEFAULT '300', "bulk_scheduling_duration" integer NOT NULL DEFAULT '7', CONSTRAINT "PK_165eff7c96cb0233efcdf2fc9e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admin_document_status_enum" AS ENUM('active', 'in_active')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."admin_document_category_enum" AS ENUM('save_settings', 'clients', 'provider')`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "name" character varying NOT NULL, "note" character varying, "status" "public"."admin_document_status_enum" NOT NULL DEFAULT 'in_active', "category" "public"."admin_document_category_enum" NOT NULL, CONSTRAINT "PK_a66a62d8d962b740a3d0a8d472a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_action_by_type_enum" AS ENUM('admin', 'provider', 'facility', 'facility_user')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_activity_type_enum" AS ENUM('shift_created', 'shift_updated', 'shift_invited', 'shift_assigned', 'shift_cancelled', 'shift_completed', 'accepted_shift_invitation', 'rejected_shift_invitation', 'provider_accepted_shift_request', 'provider_rejected_shift_request', 'request_withdrawn', 'invite_again', 'provider_cancelled_shift', 'facility_reject_request', 'facility_accept_request', 'provider_request_shift', 'shift_started', 'clock_in', 'clock_out', 'break', 'provider_cancelled', 'no_response', 'no_invites', 'running_late', 'OPEN_ORDER', 'shift_voided', 'marked_running_late', 'distance_running_late', 'replace_running_late', 'no_replace_running_late')`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "action_by_type" "public"."activity_action_by_type_enum", "action_by_id" uuid, "activity_type" "public"."activity_activity_type_enum" NOT NULL, "message" jsonb, "shift_id" uuid, CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "facility_assign_to" ("facilityId" uuid NOT NULL, "facilityUserId" uuid NOT NULL, CONSTRAINT "PK_57eccde287b77d3480e0dffd06d" PRIMARY KEY ("facilityId", "facilityUserId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27acfff08d3a9d7d620ccc5075" ON "facility_assign_to" ("facilityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a1d5fb78237c90d47b0d00550" ON "facility_assign_to" ("facilityUserId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_section" ADD CONSTRAINT "FK_71ad8a037edf3c34730a28f9d39" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" ADD CONSTRAINT "FK_b496a69b8d4470e4b196df334d4" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" ADD CONSTRAINT "FK_feeacd1e9f2cf7d498ae253a0f6" FOREIGN KEY ("sub_section_id") REFERENCES "sub_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" ADD CONSTRAINT "FK_e522085bb16b93247e12d0f024d" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" ADD CONSTRAINT "FK_a4407fc9e6b47de9ffa36c6ed2b" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" ADD CONSTRAINT "FK_02401d33af5dc7e2b348cd7b68a" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" ADD CONSTRAINT "FK_e654dd220748f869d2a783056b4" FOREIGN KEY ("default_order_contact") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" ADD CONSTRAINT "FK_50a570b23c6e4ae1f3151a0ba31" FOREIGN KEY ("client_contact") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" ADD CONSTRAINT "FK_f391505a6ad7e35a6d27f005e49" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_saved_facility" ADD CONSTRAINT "FK_6022bbd0eb9c6e7b631f426a43e" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_saved_facility" ADD CONSTRAINT "FK_ac3c88a323656fd9960ac194d0c" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD CONSTRAINT "FK_f664d631442ad56a029e335a9bd" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" ADD CONSTRAINT "FK_22972950db9adf21b85afa73066" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_entry_setting" ADD CONSTRAINT "FK_52dc0646a61c6656dfb58b3aad6" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_portal_setting" ADD CONSTRAINT "FK_83408f293e2fdfc3b3f8d7a23b9" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD CONSTRAINT "FK_4b018ded9a9c271b1b21ca35dda" FOREIGN KEY ("facility_type_id") REFERENCES "line_of_business"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD CONSTRAINT "FK_c8c2458ef56c4cdaf691d3a7624" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD CONSTRAINT "FK_fc6a3562041859a1959dc4e8b0d" FOREIGN KEY ("referred_by") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD CONSTRAINT "FK_b654fa4d1d642691739f1349b6c" FOREIGN KEY ("status") REFERENCES "status_setting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD CONSTRAINT "FK_06f98f920e949d738138ce11279" FOREIGN KEY ("reason_id") REFERENCES "facility_reject_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user_permission" ADD CONSTRAINT "FK_9ab741a23dabfefbc5b5704e09d" FOREIGN KEY ("facility_user_id") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user_permission" ADD CONSTRAINT "FK_df6c618df7ef35ee4ee7108cef8" FOREIGN KEY ("facility_permission_id") REFERENCES "facility_permission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user" ADD CONSTRAINT "FK_c26a3bf9e5fcd903869ca0e9b72" FOREIGN KEY ("primary_facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ADD CONSTRAINT "FK_e8b8abce53647d6fbe62057cf51" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" ADD CONSTRAINT "FK_d23dc93dbbe883e0641dcaf1e97" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ADD CONSTRAINT "FK_dbe14770d28bb24651ab709d9dd" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" ADD CONSTRAINT "FK_eb58116a757f6a9d910540d8397" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_note" ADD CONSTRAINT "FK_ab57122efe781f55b577d364fec" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_note" ADD CONSTRAINT "FK_5706e52a3b2f45a295bea608e7a" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_cancelled_shift" ADD CONSTRAINT "FK_393d047fc6def12cd64eef53e5f" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_cancelled_shift" ADD CONSTRAINT "FK_1006f88ec0697f2e14e6cff2a40" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_5dd2b2a9c3cac1a05b89badde52" FOREIGN KEY ("certificate_id") REFERENCES "certificate"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_60020053575649fa85bae8e9af9" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_e26414f4a2d12160bec341b74f1" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_367d2376b3928bef0536717afa5" FOREIGN KEY ("follower_id") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_69cc7bdbb9fb742933a1ed13ef0" FOREIGN KEY ("floor_id") REFERENCES "floor_detail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_d2c48397edd67c006a40cdbc1c3" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_a214b44f1e9df4619ce53d18dec" FOREIGN KEY ("shift_cancel_reason_id") REFERENCES "shift_cancel_reason"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_aee7a5c79ad76a473b613712c7d" FOREIGN KEY ("timecard_reject_reason_id") REFERENCES "timecard_reject_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_address" ADD CONSTRAINT "FK_1a0d7f09a417e1d83c7cbfc816b" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_general_setting_section" ADD CONSTRAINT "FK_0cd5f0ba01ae33c94515cdd7c46" FOREIGN KEY ("provider_general_setting_id") REFERENCES "provider_general_setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_general_setting_sub_section" ADD CONSTRAINT "FK_2bab3c1abf8efdffd777b62fa36" FOREIGN KEY ("provider_general_setting_section_id") REFERENCES "provider_general_setting_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_acknowledgement" ADD CONSTRAINT "FK_24070dfbaacae4d95dec6aaa856" FOREIGN KEY ("general_setting_sub_section_id") REFERENCES "provider_general_setting_sub_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_acknowledgement" ADD CONSTRAINT "FK_1de65c3f74d9cd86f74541830de" FOREIGN KEY ("provider_acknowledgement_id") REFERENCES "provider_acknowledgement"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_746f30eb822b68c18bb2218eada" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_education_history" ADD CONSTRAINT "FK_2ab3ba739084fe7c2a9b6eae2e4" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_work_history" ADD CONSTRAINT "FK_4f5e141cb6a1a9882b899ceb5c1" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" ADD CONSTRAINT "FK_6eabf8dd99770a760044e0c2741" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_option" ADD CONSTRAINT "FK_2e134f5ae043bca3b5ad323e568" FOREIGN KEY ("competency_test_question_id") REFERENCES "competency_test_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_question" ADD CONSTRAINT "FK_914e1376fcab5883e0ea737cc9b" FOREIGN KEY ("competency_test_setting_id") REFERENCES "competency_test_setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_global_setting" ADD CONSTRAINT "FK_ccd19da1c1129afeb81149161fb" FOREIGN KEY ("competency_test_setting_id") REFERENCES "competency_test_setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_response" ADD CONSTRAINT "FK_17ff3ed4f01d7d7c765cbade85a" FOREIGN KEY ("competency_test_score_id") REFERENCES "competency_test_score"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_score" ADD CONSTRAINT "FK_0b00fdc117e12f33cf173c48bdc" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_score" ADD CONSTRAINT "FK_e4f0f9daebfc5443aabd290dbbb" FOREIGN KEY ("competency_test_setting_id") REFERENCES "competency_test_setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" ADD CONSTRAINT "FK_3687b3fccdbab520530e329a7f6" FOREIGN KEY ("credentials_category_id") REFERENCES "credentials_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" ADD CONSTRAINT "FK_baa19b51363856be3e9938cc58c" FOREIGN KEY ("created_by") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" ADD CONSTRAINT "FK_fe9b4fb844714ebe6e607c8e26e" FOREIGN KEY ("updated_by") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD CONSTRAINT "FK_3a3730e68255b5e3f15159a5e5b" FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD CONSTRAINT "FK_e32847f5e97e8ceabf220f9a6cb" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" ADD CONSTRAINT "FK_4dd917cb3099a640128a1e2851a" FOREIGN KEY ("previous_document_id") REFERENCES "provider_credential"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_analytics" ADD CONSTRAINT "FK_c23144738caccf7b665613bafd6" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc" ADD CONSTRAINT "FK_1ec54866ed3c29869476fe22b2f" FOREIGN KEY ("document_group_id") REFERENCES "e_docs_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc_response" ADD CONSTRAINT "FK_0d001fa6b71aa208b886e952770" FOREIGN KEY ("e_doc_id") REFERENCES "e_doc"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc_response" ADD CONSTRAINT "FK_d6232f21659691daf57b800aef9" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_credential" ADD CONSTRAINT "FK_bb3c82f27e11de31a01a2b92340" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refer_facility" ADD CONSTRAINT "FK_eca8dbf2b0fc757dcb0378a8bc4" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_question" ADD CONSTRAINT "FK_0fc79602c00d992f445567aa26f" FOREIGN KEY ("skill_checklist_sub_module_id") REFERENCES "skill_checklist_sub_module"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_sub_module" ADD CONSTRAINT "FK_0f0da6306025a245d3152e7dc21" FOREIGN KEY ("skill_checklist_module_id") REFERENCES "skill_checklist_module"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_module" ADD CONSTRAINT "FK_1dc572136ec0e4d1193fa22920f" FOREIGN KEY ("skill_checklist_template_id") REFERENCES "skill_checklist_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_question_answer" ADD CONSTRAINT "FK_525f5b8e58324248bf2b65091d0" FOREIGN KEY ("skill_checklist_answer_module_id") REFERENCES "skill_checklist_answer_module"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_answer_module" ADD CONSTRAINT "FK_2705a680f0fa70e2fec88757c93" FOREIGN KEY ("skill_checklist_answer_id") REFERENCES "skill_checklist_answer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_answer" ADD CONSTRAINT "FK_6001ce7d9ff87ec2f1ae2277bb5" FOREIGN KEY ("skill_checklist_response_id") REFERENCES "skill_checklist_response"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_response" ADD CONSTRAINT "FK_a758569ff4b3e64eb222fe37792" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_response" ADD CONSTRAINT "FK_e71e1a914cb920930a8b4a11e5f" FOREIGN KEY ("skill_checklist_template_id") REFERENCES "skill_checklist_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" ADD CONSTRAINT "FK_8bde3a0f682aa2b877d2660d87e" FOREIGN KEY ("certificate_id") REFERENCES "certificate"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" ADD CONSTRAINT "FK_d106ef9c23f15be27e35d12e03f" FOREIGN KEY ("speciality_id") REFERENCES "speciality"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" ADD CONSTRAINT "FK_3b0cf43e7ce397a79f14d2c07e8" FOREIGN KEY ("status") REFERENCES "status_setting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" ADD CONSTRAINT "FK_f25c549cb09418f91762aed2994" FOREIGN KEY ("provider_acknowledgement_id") REFERENCES "provider_acknowledgement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" ADD CONSTRAINT "FK_0503a1a098deda0df5312fef640" FOREIGN KEY ("reason_id") REFERENCES "provider_reject_reason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_5f202bdd180719e440aa50a9fd5" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_d089dde1dfb44aabfa963af6400" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_a9f831ac72c19b34e0a3ae68e8c" FOREIGN KEY ("facility_user_id") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_b2d389285fd12fc41633e81d5ee" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_fd32421f2d93414e46a8fcfd86b" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_db8be208a22e59619d1e38cc831" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_5cf9ddc57220f136dac38e97862" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_7947f5370a0e1b13038a806d8a7" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_82aa16f4a67012b53e701ac0e61" FOREIGN KEY ("facility_user_id") REFERENCES "facility_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" ADD CONSTRAINT "FK_7e12aa5ca1e94686eb420143550" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_37ecd8addf395545dcb0242a593" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "state" ADD CONSTRAINT "FK_dd19065b0813dbffd8170ea6753" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reference_form_design" ADD CONSTRAINT "FK_5f73f30743edb39235d69914b23" FOREIGN KEY ("reference_form_id") REFERENCES "reference_form"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reference_form_option" ADD CONSTRAINT "FK_5a57638b0ca8ce485b46aa6db98" FOREIGN KEY ("reference_form_design_id") REFERENCES "reference_form_design"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profile_setting_sub_section" ADD CONSTRAINT "FK_3eeed16ab4df7a1ed88fcca9e81" FOREIGN KEY ("provider_profile_setting_section_id") REFERENCES "provider_profile_setting_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profile_setting_section" ADD CONSTRAINT "FK_59a08c4b2bbc0a3e50e4a660fa2" FOREIGN KEY ("provider_profile_setting_id") REFERENCES "provider_profile_setting"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD CONSTRAINT "FK_b61b9d8cadf49871facbde04308" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" ADD CONSTRAINT "FK_61a569edf8295439807222f3c86" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professional_reference_response" ADD CONSTRAINT "FK_e40ee852eaa567e8182a7f74c8d" FOREIGN KEY ("provider_professional_reference_id") REFERENCES "provider_professional_reference"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_notification_log" ADD CONSTRAINT "FK_9cb0569a7e8b358be8b83c1ee90" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_notification_log" ADD CONSTRAINT "FK_69333d3561a5d49a8b8ff1d5cd3" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_notification_log" ADD CONSTRAINT "FK_b499c6e2ea65ec2de8a9e5db9b7" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_notification_log" ADD CONSTRAINT "FK_bde3fe6e7690a45292f0b8aa970" FOREIGN KEY ("facility_id") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" ADD CONSTRAINT "FK_9abeb1cc52bb484d042d6d0f039" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" ADD CONSTRAINT "FK_2f993055b56cfb92e62c930c2af" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" ADD CONSTRAINT "FK_0841007961f3dfc115a8129c4b0" FOREIGN KEY ("parent_id") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_document" ADD CONSTRAINT "FK_cdea1ea6c662d812bba7d84c064" FOREIGN KEY ("facility_document_category") REFERENCES "facility_document_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_e59aa6dc607aced6f7a7a2a4b31" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_assign_to" ADD CONSTRAINT "FK_27acfff08d3a9d7d620ccc5075b" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_assign_to" ADD CONSTRAINT "FK_5a1d5fb78237c90d47b0d005509" FOREIGN KEY ("facilityUserId") REFERENCES "facility_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "void_shift" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at_ip" character varying, "updated_at_ip" character varying, "deleted_at_ip" character varying, "shift_id" uuid, "provider_id" uuid, CONSTRAINT "PK_80ad064a29502e0917732aa1c9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_528bf36cf78fd493c724514b7f" ON "void_shift" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9a31603920e7a855f4ab05ea" ON "void_shift" ("provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_393d047fc6def12cd64eef53e5" ON "provider_cancelled_shift" ("shift_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1006f88ec0697f2e14e6cff2a4" ON "provider_cancelled_shift" ("provider_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "void_shift" ADD CONSTRAINT "FK_528bf36cf78fd493c724514b7f3" FOREIGN KEY ("shift_id") REFERENCES "shift"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "void_shift" ADD CONSTRAINT "FK_af9a31603920e7a855f4ab05eac" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "facility_assign_to" DROP CONSTRAINT "FK_5a1d5fb78237c90d47b0d005509"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_assign_to" DROP CONSTRAINT "FK_27acfff08d3a9d7d620ccc5075b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_e59aa6dc607aced6f7a7a2a4b31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_document" DROP CONSTRAINT "FK_cdea1ea6c662d812bba7d84c064"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT "FK_0841007961f3dfc115a8129c4b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT "FK_2f993055b56cfb92e62c930c2af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat" DROP CONSTRAINT "FK_9abeb1cc52bb484d042d6d0f039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_notification_log" DROP CONSTRAINT "FK_bde3fe6e7690a45292f0b8aa970"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_notification_log" DROP CONSTRAINT "FK_b499c6e2ea65ec2de8a9e5db9b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_notification_log" DROP CONSTRAINT "FK_69333d3561a5d49a8b8ff1d5cd3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_notification_log" DROP CONSTRAINT "FK_9cb0569a7e8b358be8b83c1ee90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professional_reference_response" DROP CONSTRAINT "FK_e40ee852eaa567e8182a7f74c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP CONSTRAINT "FK_61a569edf8295439807222f3c86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_orientation" DROP CONSTRAINT "FK_b61b9d8cadf49871facbde04308"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profile_setting_section" DROP CONSTRAINT "FK_59a08c4b2bbc0a3e50e4a660fa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profile_setting_sub_section" DROP CONSTRAINT "FK_3eeed16ab4df7a1ed88fcca9e81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reference_form_option" DROP CONSTRAINT "FK_5a57638b0ca8ce485b46aa6db98"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reference_form_design" DROP CONSTRAINT "FK_5f73f30743edb39235d69914b23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "state" DROP CONSTRAINT "FK_dd19065b0813dbffd8170ea6753"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "FK_37ecd8addf395545dcb0242a593"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_7e12aa5ca1e94686eb420143550"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_82aa16f4a67012b53e701ac0e61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_7947f5370a0e1b13038a806d8a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_5cf9ddc57220f136dac38e97862"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification" DROP CONSTRAINT "FK_db8be208a22e59619d1e38cc831"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_fd32421f2d93414e46a8fcfd86b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_b2d389285fd12fc41633e81d5ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_a9f831ac72c19b34e0a3ae68e8c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_d089dde1dfb44aabfa963af6400"`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_5f202bdd180719e440aa50a9fd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" DROP CONSTRAINT "FK_0503a1a098deda0df5312fef640"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" DROP CONSTRAINT "FK_f25c549cb09418f91762aed2994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" DROP CONSTRAINT "FK_3b0cf43e7ce397a79f14d2c07e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" DROP CONSTRAINT "FK_d106ef9c23f15be27e35d12e03f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider" DROP CONSTRAINT "FK_8bde3a0f682aa2b877d2660d87e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_response" DROP CONSTRAINT "FK_e71e1a914cb920930a8b4a11e5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_response" DROP CONSTRAINT "FK_a758569ff4b3e64eb222fe37792"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_answer" DROP CONSTRAINT "FK_6001ce7d9ff87ec2f1ae2277bb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_answer_module" DROP CONSTRAINT "FK_2705a680f0fa70e2fec88757c93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_question_answer" DROP CONSTRAINT "FK_525f5b8e58324248bf2b65091d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_module" DROP CONSTRAINT "FK_1dc572136ec0e4d1193fa22920f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_sub_module" DROP CONSTRAINT "FK_0f0da6306025a245d3152e7dc21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skill_checklist_question" DROP CONSTRAINT "FK_0fc79602c00d992f445567aa26f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refer_facility" DROP CONSTRAINT "FK_eca8dbf2b0fc757dcb0378a8bc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assigned_credential" DROP CONSTRAINT "FK_bb3c82f27e11de31a01a2b92340"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc_response" DROP CONSTRAINT "FK_d6232f21659691daf57b800aef9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc_response" DROP CONSTRAINT "FK_0d001fa6b71aa208b886e952770"`,
    );
    await queryRunner.query(
      `ALTER TABLE "e_doc" DROP CONSTRAINT "FK_1ec54866ed3c29869476fe22b2f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_analytics" DROP CONSTRAINT "FK_c23144738caccf7b665613bafd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP CONSTRAINT "FK_4dd917cb3099a640128a1e2851a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP CONSTRAINT "FK_e32847f5e97e8ceabf220f9a6cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_credential" DROP CONSTRAINT "FK_3a3730e68255b5e3f15159a5e5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" DROP CONSTRAINT "FK_fe9b4fb844714ebe6e607c8e26e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" DROP CONSTRAINT "FK_baa19b51363856be3e9938cc58c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credentials" DROP CONSTRAINT "FK_3687b3fccdbab520530e329a7f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_score" DROP CONSTRAINT "FK_e4f0f9daebfc5443aabd290dbbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_score" DROP CONSTRAINT "FK_0b00fdc117e12f33cf173c48bdc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_response" DROP CONSTRAINT "FK_17ff3ed4f01d7d7c765cbade85a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_global_setting" DROP CONSTRAINT "FK_ccd19da1c1129afeb81149161fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_question" DROP CONSTRAINT "FK_914e1376fcab5883e0ea737cc9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "competency_test_option" DROP CONSTRAINT "FK_2e134f5ae043bca3b5ad323e568"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_professional_reference" DROP CONSTRAINT "FK_6eabf8dd99770a760044e0c2741"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_work_history" DROP CONSTRAINT "FK_4f5e141cb6a1a9882b899ceb5c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_education_history" DROP CONSTRAINT "FK_2ab3ba739084fe7c2a9b6eae2e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_746f30eb822b68c18bb2218eada"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_acknowledgement" DROP CONSTRAINT "FK_1de65c3f74d9cd86f74541830de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_acknowledgement" DROP CONSTRAINT "FK_24070dfbaacae4d95dec6aaa856"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_general_setting_sub_section" DROP CONSTRAINT "FK_2bab3c1abf8efdffd777b62fa36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_general_setting_section" DROP CONSTRAINT "FK_0cd5f0ba01ae33c94515cdd7c46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_address" DROP CONSTRAINT "FK_1a0d7f09a417e1d83c7cbfc816b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_aee7a5c79ad76a473b613712c7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_a214b44f1e9df4619ce53d18dec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_d2c48397edd67c006a40cdbc1c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_69cc7bdbb9fb742933a1ed13ef0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_367d2376b3928bef0536717afa5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_e26414f4a2d12160bec341b74f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_60020053575649fa85bae8e9af9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_5dd2b2a9c3cac1a05b89badde52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_cancelled_shift" DROP CONSTRAINT "FK_1006f88ec0697f2e14e6cff2a40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_cancelled_shift" DROP CONSTRAINT "FK_393d047fc6def12cd64eef53e5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_note" DROP CONSTRAINT "FK_5706e52a3b2f45a295bea608e7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_note" DROP CONSTRAINT "FK_ab57122efe781f55b577d364fec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" DROP CONSTRAINT "FK_eb58116a757f6a9d910540d8397"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_request" DROP CONSTRAINT "FK_dbe14770d28bb24651ab709d9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" DROP CONSTRAINT "FK_d23dc93dbbe883e0641dcaf1e97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_invitation" DROP CONSTRAINT "FK_e8b8abce53647d6fbe62057cf51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user" DROP CONSTRAINT "FK_c26a3bf9e5fcd903869ca0e9b72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user_permission" DROP CONSTRAINT "FK_df6c618df7ef35ee4ee7108cef8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_user_permission" DROP CONSTRAINT "FK_9ab741a23dabfefbc5b5704e09d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP CONSTRAINT "FK_06f98f920e949d738138ce11279"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP CONSTRAINT "FK_b654fa4d1d642691739f1349b6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP CONSTRAINT "FK_fc6a3562041859a1959dc4e8b0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP CONSTRAINT "FK_c8c2458ef56c4cdaf691d3a7624"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" DROP CONSTRAINT "FK_4b018ded9a9c271b1b21ca35dda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_portal_setting" DROP CONSTRAINT "FK_83408f293e2fdfc3b3f8d7a23b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_entry_setting" DROP CONSTRAINT "FK_52dc0646a61c6656dfb58b3aad6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP CONSTRAINT "FK_22972950db9adf21b85afa73066"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_provider" DROP CONSTRAINT "FK_f664d631442ad56a029e335a9bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_saved_facility" DROP CONSTRAINT "FK_ac3c88a323656fd9960ac194d0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_saved_facility" DROP CONSTRAINT "FK_6022bbd0eb9c6e7b631f426a43e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" DROP CONSTRAINT "FK_f391505a6ad7e35a6d27f005e49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" DROP CONSTRAINT "FK_50a570b23c6e4ae1f3151a0ba31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" DROP CONSTRAINT "FK_e654dd220748f869d2a783056b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_detail" DROP CONSTRAINT "FK_02401d33af5dc7e2b348cd7b68a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" DROP CONSTRAINT "FK_a4407fc9e6b47de9ffa36c6ed2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" DROP CONSTRAINT "FK_e522085bb16b93247e12d0f024d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" DROP CONSTRAINT "FK_feeacd1e9f2cf7d498ae253a0f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_section_permission" DROP CONSTRAINT "FK_b496a69b8d4470e4b196df334d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_section" DROP CONSTRAINT "FK_71ad8a037edf3c34730a28f9d39"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5a1d5fb78237c90d47b0d00550"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27acfff08d3a9d7d620ccc5075"`,
    );
    await queryRunner.query(`DROP TABLE "facility_assign_to"`);
    await queryRunner.query(`DROP TABLE "activity"`);
    await queryRunner.query(`DROP TYPE "public"."activity_activity_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."activity_action_by_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "admin_document"`);
    await queryRunner.query(
      `DROP TYPE "public"."admin_document_category_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."admin_document_status_enum"`);
    await queryRunner.query(`DROP TABLE "auto_scheduling_setting"`);
    await queryRunner.query(`DROP TABLE "badge_setting"`);
    await queryRunner.query(`DROP TABLE "columns_preference"`);
    await queryRunner.query(`DROP TABLE "department"`);
    await queryRunner.query(`DROP TYPE "public"."department_status_enum"`);
    await queryRunner.query(`DROP TABLE "dnr_reason"`);
    await queryRunner.query(`DROP TYPE "public"."dnr_reason_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."dnr_reason_reason_type_enum"`);
    await queryRunner.query(`DROP TABLE "facility_document"`);
    await queryRunner.query(`DROP TABLE "facility_document_category"`);
    await queryRunner.query(`DROP TABLE "facility_general_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_general_setting_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility_profile_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_profile_setting_section_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."facility_profile_setting_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility_shift_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_shift_setting_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "flag_setting"`);
    await queryRunner.query(`DROP TYPE "public"."flag_setting_status_enum"`);
    await queryRunner.query(`DROP TABLE "invite"`);
    await queryRunner.query(`DROP TYPE "public"."invite_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invite_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invite_status_enum"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "chat"`);
    await queryRunner.query(`DROP TYPE "public"."chat_sender_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."chat_user_type_enum"`);
    await queryRunner.query(`DROP TABLE "facility_notification_log"`);
    await queryRunner.query(`DROP TABLE "shift_notification_log"`);
    await queryRunner.query(`DROP TABLE "professional_reference_response"`);
    await queryRunner.query(`DROP TABLE "provider_orientation"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_orientation_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_profile_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_profile_setting_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_profile_setting_section"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_profile_setting_section_status_enum"`,
    );
    await queryRunner.query(
      `DROP TABLE "provider_profile_setting_sub_section"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_profile_setting_sub_section_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "reference_form_global_setting"`);
    await queryRunner.query(`DROP TABLE "reference_form_option"`);
    await queryRunner.query(`DROP TABLE "reference_form_design"`);
    await queryRunner.query(
      `DROP TYPE "public"."reference_form_design_option_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "reference_form"`);
    await queryRunner.query(`DROP TYPE "public"."reference_form_status_enum"`);
    await queryRunner.query(`DROP TABLE "room"`);
    await queryRunner.query(`DROP TYPE "public"."room_sender_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."room_user_type_enum"`);
    await queryRunner.query(`DROP TABLE "schedule_request_setting"`);
    await queryRunner.query(`DROP TABLE "shift_type"`);
    await queryRunner.query(`DROP TYPE "public"."shift_type_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."shift_type_shift_type_enum"`);
    await queryRunner.query(`DROP TABLE "site_access_setting"`);
    await queryRunner.query(`DROP TABLE "state"`);
    await queryRunner.query(`DROP TYPE "public"."state_status_enum"`);
    await queryRunner.query(`DROP TABLE "city"`);
    await queryRunner.query(`DROP TYPE "public"."city_status_enum"`);
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TYPE "public"."country_status_enum"`);
    await queryRunner.query(`DROP TABLE "test_faq"`);
    await queryRunner.query(`DROP TYPE "public"."test_faq_status_enum"`);
    await queryRunner.query(`DROP TABLE "time_entry_approval"`);
    await queryRunner.query(`DROP TABLE "user_notification"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_notification_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(
      `DROP TYPE "public"."notification_device_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_for_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(`DROP TYPE "public"."admin_status_enum"`);
    await queryRunner.query(`DROP TABLE "token"`);
    await queryRunner.query(`DROP TYPE "public"."token_device_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."token_status_enum"`);
    await queryRunner.query(`DROP TABLE "provider"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_profile_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."provider_shift_time_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_shift_preference_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_verification_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_marital_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "skill_checklist_response"`);
    await queryRunner.query(
      `DROP TYPE "public"."skill_checklist_response_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "skill_checklist_answer"`);
    await queryRunner.query(`DROP TABLE "skill_checklist_answer_module"`);
    await queryRunner.query(`DROP TABLE "skill_checklist_question_answer"`);
    await queryRunner.query(`DROP TABLE "skill_checklist_template"`);
    await queryRunner.query(
      `DROP TYPE "public"."skill_checklist_template_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "skill_checklist_module"`);
    await queryRunner.query(
      `DROP TYPE "public"."skill_checklist_module_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "skill_checklist_sub_module"`);
    await queryRunner.query(
      `DROP TYPE "public"."skill_checklist_sub_module_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "skill_checklist_question"`);
    await queryRunner.query(
      `DROP TYPE "public"."skill_checklist_question_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "refer_facility"`);
    await queryRunner.query(`DROP TABLE "assigned_credential"`);
    await queryRunner.query(`DROP TABLE "e_doc_response"`);
    await queryRunner.query(`DROP TYPE "public"."e_doc_response_status_enum"`);
    await queryRunner.query(`DROP TABLE "e_doc"`);
    await queryRunner.query(`DROP TYPE "public"."e_doc_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."e_doc_expiration_period_enum"`,
    );
    await queryRunner.query(`DROP TABLE "e_docs_group"`);
    await queryRunner.query(`DROP TYPE "public"."e_docs_group_status_enum"`);
    await queryRunner.query(`DROP TABLE "provider_analytics"`);
    await queryRunner.query(`DROP TABLE "provider_reject_reason"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_reject_reason_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_credential"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_credential_is_verified_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3687b3fccdbab520530e329a7f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_deddc3fc8fa9227193e910b0c3"`,
    );
    await queryRunner.query(`DROP TABLE "credentials"`);
    await queryRunner.query(`DROP TYPE "public"."credentials_validate_enum"`);
    await queryRunner.query(`DROP TYPE "public"."credentials_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."credentials_auto_assign_enum"`,
    );
    await queryRunner.query(`DROP TABLE "credentials_category"`);
    await queryRunner.query(
      `DROP TYPE "public"."credentials_category_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "competency_test_score"`);
    await queryRunner.query(
      `DROP TYPE "public"."competency_test_score_test_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "competency_test_response"`);
    await queryRunner.query(`DROP TABLE "competency_test_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."competency_test_setting_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "competency_test_global_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."competency_test_global_setting_reassignment_duration_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."competency_test_global_setting_expiration_duration_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "competency_test_question"`);
    await queryRunner.query(`DROP TABLE "competency_test_option"`);
    await queryRunner.query(`DROP TABLE "provider_professional_reference"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_professional_reference_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_professional_reference_send_form_by_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_work_history"`);
    await queryRunner.query(`DROP TABLE "provider_education_history"`);
    await queryRunner.query(`DROP TABLE "otp"`);
    await queryRunner.query(`DROP TYPE "public"."otp_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."otp_status_enum"`);
    await queryRunner.query(`DROP TABLE "provider_acknowledgement"`);
    await queryRunner.query(`DROP TABLE "sub_acknowledgement"`);
    await queryRunner.query(
      `DROP TABLE "provider_general_setting_sub_section"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."provider_general_setting_sub_section_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_general_setting_section"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_general_setting_section_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_general_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_general_setting_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_address"`);
    await queryRunner.query(`DROP TYPE "public"."provider_address_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."provider_address_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "certificate"`);
    await queryRunner.query(`DROP TYPE "public"."certificate_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2c48397edd67c006a40cdbc1c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_367d2376b3928bef0536717afa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e26414f4a2d12160bec341b74f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60020053575649fa85bae8e9af"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5dd2b2a9c3cac1a05b89badde5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57edf600c3308567809803f54c"`,
    );
    await queryRunner.query(`DROP TABLE "shift"`);
    await queryRunner.query(
      `DROP TYPE "public"."shift_timecard_rejected_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_timecard_approve_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."shift_timecard_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."shift_cancelled_by_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."shift_updated_by_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."shift_created_by_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."shift_shift_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."shift_status_enum"`);
    await queryRunner.query(`DROP TABLE "provider_cancelled_shift"`);
    await queryRunner.query(`DROP TABLE "shift_note"`);
    await queryRunner.query(`DROP TABLE "timecard_reject_reason"`);
    await queryRunner.query(
      `DROP TYPE "public"."timecard_reject_reason_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eb58116a757f6a9d910540d839"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dbe14770d28bb24651ab709d9d"`,
    );
    await queryRunner.query(`DROP TABLE "shift_request"`);
    await queryRunner.query(`DROP TYPE "public"."shift_request_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d23dc93dbbe883e0641dcaf1e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8b8abce53647d6fbe62057cf5"`,
    );
    await queryRunner.query(`DROP TABLE "shift_invitation"`);
    await queryRunner.query(
      `DROP TYPE "public"."shift_invitation_shift_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_invitation_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "shift_cancel_reason"`);
    await queryRunner.query(
      `DROP TYPE "public"."shift_cancel_reason_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."shift_cancel_reason_user_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility_user"`);
    await queryRunner.query(`DROP TYPE "public"."facility_user_status_enum"`);
    await queryRunner.query(`DROP TABLE "facility_user_permission"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_user_permission_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility_permission"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_permission_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_orientation_process_enum"`,
    );
    await queryRunner.query(`DROP TABLE "line_of_business"`);
    await queryRunner.query(
      `DROP TYPE "public"."line_of_business_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility_portal_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_portal_setting_scheduling_warnings_enum"`,
    );
    await queryRunner.query(`DROP TABLE "time_entry_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."time_entry_setting_allowed_entries_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."time_entry_setting_time_approval_method_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."time_entry_setting_timecard_rounding_direction_enum"`,
    );
    await queryRunner.query(`DROP TABLE "facility_provider"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_provider_dnr_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."facility_provider_flag_enum"`);
    await queryRunner.query(`DROP TABLE "facility_reject_reason"`);
    await queryRunner.query(
      `DROP TYPE "public"."facility_reject_reason_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "provider_saved_facility"`);
    await queryRunner.query(`DROP TABLE "floor_detail"`);
    await queryRunner.query(`DROP TABLE "speciality"`);
    await queryRunner.query(`DROP TYPE "public"."speciality_status_enum"`);
    await queryRunner.query(`DROP TABLE "status_setting"`);
    await queryRunner.query(
      `DROP TYPE "public"."status_setting_status_for_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."status_setting_status_enum"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TYPE "public"."role_status_enum"`);
    await queryRunner.query(`DROP TABLE "role_section_permission"`);
    await queryRunner.query(
      `DROP TYPE "public"."role_section_permission_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "section"`);
    await queryRunner.query(`DROP TYPE "public"."section_status_enum"`);
    await queryRunner.query(`DROP TABLE "sub_section"`);
    await queryRunner.query(`DROP TYPE "public"."sub_section_status_enum"`);
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(`DROP TYPE "public"."permission_status_enum"`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.generate_unique_shift_id();`,
    );
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public.shift_number_seq;`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.generate_unique_shift_time_id();`,
    );
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public.shift_time_number_seq;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.generate_unique_document_id();`,
    );
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public.document_number_seq;`,
    );
    await queryRunner.query(
      `ALTER TABLE "void_shift" DROP CONSTRAINT "FK_af9a31603920e7a855f4ab05eac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "void_shift" DROP CONSTRAINT "FK_528bf36cf78fd493c724514b7f3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1006f88ec0697f2e14e6cff2a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_393d047fc6def12cd64eef53e5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af9a31603920e7a855f4ab05ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_528bf36cf78fd493c724514b7f"`,
    );
    await queryRunner.query(`DROP TABLE "void_shift"`);

    // facility shift setting
    await queryRunner.query(
      `ALTER TABLE "facility_shift_setting" DROP CONSTRAINT "FK_f3bf351905e044bace6864f0201"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f3bf351905e044bace6864f020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_shift_setting" DROP COLUMN "facility_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility" ADD "shift_setting" uuid array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "facility_shift_setting" DROP COLUMN "time_code"`,
    );
  }
}

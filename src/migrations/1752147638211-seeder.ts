import { MigrationInterface, QueryRunner } from 'typeorm';

export class Seeder1752147638211 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
		INSERT INTO country ("id","name","iso_code","flag","phone_code","currency","latitude","longitude","created_at") VALUES ('bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d','United States','US','🇺🇸','1','USD','38.00000000','-97.00000000',NOW());
	`);
    await queryRunner.query(`
		INSERT INTO state
			("id","name","iso_code","country_code","latitude","longitude", "country_id","created_at") 
			VALUES
			('b22f907a-2151-4a41-a1bd-75462ba78075','Arizona','AZ','US','34.04892810','-111.09373110','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('50670c12-1a66-47e3-9225-e22fa5650ac9','District of Columbia','DC','US','38.90719230','-77.03687070','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('ff01239c-2322-4231-bd76-bcc698a489d3','Indiana','IN','US','40.26719410','-86.13490190','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('3423603c-9f45-4289-b596-ed7b07a33a6e','Maine','ME','US','45.25378300','-69.44546890','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('7e9cd352-e92f-4157-87fb-e25eda62ecd5','Montana','MT','US','46.87968220','-110.36256580','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('7f97a30a-a8d4-42b0-b561-f5da37ae3b41','California','CA','US','36.77826100','-119.41793240','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('cfc31a7c-3f80-4782-ba74-e770e75ecf78','Hawaii','HI','US','19.89676620','-155.58278180','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('9aa51de9-f0e5-49c9-9a47-d48a7b6479ea','Kansas','KS','US','39.01190200','-98.48424650','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('bb65dc39-b36c-4336-a988-cb394be84a20','Midway Atoll','UM-71','US','28.20721680','-177.37349260','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('bca47e1b-8572-4173-95ab-dcf26c1274b7','Nevada','NV','US','38.80260970','-116.41938900','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('480cee06-870a-4573-ad80-68756a4cdac2','Northern Mariana Islands','MP','US','15.09790000','145.67390000','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('83aa0c74-7d66-4985-b34a-74a14e3b0802','Puerto Rico','PR','US','18.22083300','-66.59014900','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('28cb29e2-7f21-4afc-920a-34d96cad6604','United States Virgin Islands','VI','US','18.33576500','-64.89633500','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('a9b373e2-e72b-402f-a556-e65c772e2198','Alabama','AL','US','32.31823140','-86.90229800','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('ed634952-ddd9-4837-8436-50ccaa6eda59','Arkansas','AR','US','35.20105000','-91.83183340','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('4be88b6e-7751-4755-9f1e-d79e26b26c66','Colorado','CO','US','39.55005070','-105.78206740','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('669a52f7-e596-4586-ba9e-dca42b0468d6','Florida','FL','US','27.66482740','-81.51575350','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('7601eb00-6d8e-4725-8e8a-8b3dcaee90a4','Howland Island','UM-84','US','0.81132190','-176.61827360','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('42d2aa23-e624-46c1-b936-c3f1f2da5a4a','Iowa','IA','US','41.87800250','-93.09770200','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('7b8fb704-44cf-459f-bddd-7550a2e78ff1','Kentucky','KY','US','37.83933320','-84.27001790','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('85cd946c-3b07-41c4-82e3-aafbe399712c','Maryland','MD','US','39.04575490','-76.64127120','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('dbf4aefe-cf0b-4de7-98d0-14bd99e1542a','Minnesota','MN','US','46.72955300','-94.68589980','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('dfee2de9-8911-43b5-a04d-109147db169f','Navassa Island','UM-76','US','18.41006890','-75.01146120','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('2e79e9eb-38e8-4206-9111-973560b46315','New Hampshire','NH','US','43.19385160','-71.57239530','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('faf44670-2066-4e81-b741-3d5aad3b77c9','Alaska','AK','US','64.20084130','-149.49367330','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('47a59a5b-9b32-47f8-a89c-eba56b751093','Baker Island','UM-81','US','0.19362660','-176.47690800','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('3a177706-8a86-47bc-84ea-3e098211c73f','Connecticut','CT','US','41.60322070','-73.08774900','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('0b84dc83-7dd7-4131-b224-97261aefa226','Georgia','GA','US','32.16562210','-82.90007510','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('82ec8d61-80b9-4e17-b0ee-c9f474f85498','Idaho','ID','US','44.06820190','-114.74204080','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('5eaf87c5-112d-4f90-95a9-0b95f6dbbe6c','Jarvis Island','UM-86','US','-0.37435030','-159.99672060','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('1e343942-3e3f-440f-b824-8195054542d9','Kingman Reef','UM-89','US','6.38333300','-162.41666700','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('6ddfa6ca-cd8c-42a8-b449-6bc4fcc492b9','Massachusetts','MA','US','42.40721070','-71.38243740','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('8b29533c-0ed9-4261-b05b-233e3ad8ae5a','Mississippi','MS','US','32.35466790','-89.39852830','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('802cc6ed-f1d0-40f7-bb8a-94c268316ba5','Nebraska','NE','US','41.49253740','-99.90181310','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('83eeb5b2-ba33-47e8-887b-673806a64d1b','North Dakota','ND','US','47.55149260','-101.00201190','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('34791b48-7eac-4925-a286-26c0517a6dd9','Pennsylvania','PA','US','41.20332160','-77.19452470','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('3b9681fc-e89b-4992-b956-69ec2a5d1921','United States Minor Outlying Islands','UM','US','19.28231920','166.64704700', 'bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('69d33431-8abe-4935-9c36-60d5bc1f7bdd','Virginia','VA','US','37.43157340','-78.65689420','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('fffcbea6-69a9-4b43-a7f0-ddda5583dee1','Wisconsin','WI','US','43.78443970','-88.78786780','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('8784aecf-4ae0-4251-91cf-590337b37be9','American Samoa','AS','US','-14.27097200','-170.13221700','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('beb7f3b6-4cad-4766-97e3-203e4016321a','Delaware','DE','US','38.91083250','-75.52766990','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('aecbc98f-9a04-4900-a4ec-ac683661123b','Guam','GU','US','13.44430400','144.79373100','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('221bdedf-6ae5-4dd0-b53d-218b4aa6b528','Illinois','IL','US','40.63312490','-89.39852830','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('4f717b1c-043e-4771-ab2f-0aeba3d23f8a','Johnston Atoll','UM-67','US','16.72950350','-169.53364770','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('6d582bc2-467b-433e-9441-0f974b6704fd','Louisiana','LA','US','30.98429770','-91.96233270','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('e09e7305-8eff-4e04-aead-5bb9e28eeff1','Michigan','MI','US','44.31484430','-85.60236430','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('7a1c75dd-d72a-458c-8874-45784374a221','Missouri','MO','US','37.96425290','-91.83183340','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('dc810f07-2958-4ee9-9aab-b39b9fbf16f1','New Jersey','NJ','US','40.05832380','-74.40566120','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('b5a294c9-51d2-4170-9326-3c2146febc63','North Carolina','NC','US','35.75957310','-79.01929970','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('fbc7bf20-4d71-4bdb-9c20-785dedfff2d9','Oklahoma','OK','US','35.46756020','-97.51642760','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('16a7220e-8d0b-4df4-9529-0458fcb2f148','South Carolina','SC','US','33.83608100','-81.16372450','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('2eff8ab1-dca2-4296-bd6b-f50f29b9a40b','Texas','TX','US','31.96859880','-99.90181310','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('d0eb274f-8631-4b15-afc0-18f10968f9be','Vermont','VT','US','44.55880280','-72.57784150','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('e69ca784-a55d-4fc4-96f6-775a52f86b87','West Virginia','WV','US','38.59762620','-80.45490260','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('963c8646-d870-43cb-a557-88848f4f268d','New Mexico','NM','US','34.51994020','-105.87009010','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('807d981c-d1d6-4dfd-aa02-bbf1854f70a3','Oregon','OR','US','43.80413340','-120.55420120','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('db9948db-95cb-440a-88e1-b18caa55cdb7','South Dakota','SD','US','43.96951480','-99.90181310','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('18ec7237-e706-4125-a078-bc0490004f41','Wake Island','UM-79','US','19.27961900','166.64993480','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('de48bba4-ad40-4f7f-8b34-4d3860d50ae6','New York','NY','US','40.71277530','-74.00597280','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('f7492a97-6a97-4f6a-8899-27e630257cb7','Ohio','OH','US','40.41728710','-82.90712300','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('ad66e269-78d5-4539-b907-ce8e110afdd6','Palmyra Atoll','UM-95','US','5.88850260','-162.07866560','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('d7e34366-4b13-45ad-8aac-496ea51fe03d','Rhode Island','RI','US','41.58009450','-71.47742910','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('9329ab04-0724-428c-8cda-d2faeccbc449','Tennessee','TN','US','35.51749130','-86.58044730','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('d5f36e65-8b26-41b7-8cf4-5c3e443f4616','Utah','UT','US','39.32098010','-111.09373110','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('b6134d25-bfec-4efa-ab94-9a6b7cececf0','Washington','WA','US','47.75107410','-120.74013850','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW()),
			('89f7b738-b90c-4f2e-9152-39d13443e1e8','Wyoming','WY','US','43.07596780','-107.29028390','bd1ff32f-6fc2-4a01-8820-cea3a96b9a3d', NOW());
	`);
    await queryRunner.query(`
		INSERT INTO facility_permission (id, name) VALUES
			('64e85435-0ed4-41db-bb14-9c022818774e', 'admin'),
			('fe7a5db0-162c-42b3-bda8-65c6ed2e563b', 'manage_team'),
			('5386e4a2-fc76-4c26-bcb0-51e374982374', 'add_shift'),
			('c86cfe44-238b-48fc-8bc4-4a244cbf821e', 'approve_reject_shift'),
			('30981f4f-2ef7-4053-9ce7-1c73fcd84f9e', 'cancel_shift'),
			('90c9708b-27e9-4d5d-8c9c-2d524af4a622', 'can_chat'),
			('b7fbf204-a35c-421a-b27e-70e03235aaef', 'can_see_billing_summary'),
			('415a8ee7-6587-463e-86b9-0fc7f50a867c', 'can_flag_provider_as_preferred_and_dnr'),
			('1dc41b8f-48de-47ce-8849-49cb191f9cd1', 'can_view_providers_email_or_phone_number'),
			('acad6324-3316-46a6-92a1-5d13267b6822', 'view_download_provider_credentials'),
			('1c14b034-84f9-4342-9fac-0a819b04454a', 'can_evaluate_provider'),
			('cd16dc16-23c0-46ba-a5ad-75fa8020b508', 'approve_time_card'),
			('51118b5e-3f53-479b-8090-d479622772b8', 'can_manage_billing');
	`);

    await queryRunner.query(
      `INSERT INTO "role" (id, name, description) VALUES ('27a879f5-c044-4074-96c0-34ee3d209f17', 'Master Admin', 'Access to all sections');`,
    );
    await queryRunner.query(
      `INSERT INTO "admin" (id, first_name, last_name, email, country_code, mobile_no, password, role_id, status, is_email_verified) VALUES ('a3cf8d63-bde4-4fc0-aca5-1e50551aa00d', 'Master', 'Admin', 'admin@solguruz.com', '+91', '8511474162', '$2b$10$QOlKVmHQGKMs5TM.pwgDGu/8qytfivQebR6KY0ZWeCm6cXVCUro/u', '27a879f5-c044-4074-96c0-34ee3d209f17', 'active', true);`,
    );
    await queryRunner.query(`
		INSERT INTO permission (id, name)
			VALUES
			('f8704615-c2ed-4647-aff1-7513d82e8ed0', 'view'),
			('c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', 'add'),
			('975ae729-0280-4ad8-ac2b-9853bd134027', 'edit'),
			('df52e400-0ab6-40c4-a9f2-6e6b88ad018f', 'delete'),
			('3e711ad7-9fdd-4835-8a6a-20d8070a6406', 'cancel'),
			('39fc5bf7-9b47-439a-a720-4cae317a2995', 'can_approve'),
			('ec26cb11-eaea-4ddc-a5c4-80782e5af209', 'can_not_approve'),
			('7d5ca181-80c9-405c-b5d8-d5fb3f15b970', 'withdraw'),
			('f79cd16c-a043-4fa2-9cd9-1e0c21a19966', 'assign_credit'),
			('cd9ce94b-3a68-4af8-966e-b806f0470591', 'generate'),
			('86dad3de-9f82-46ba-96ea-3bc899a3436e', 'can_chat'),
			('e8341a7b-3a58-4e1d-a1af-d6fcf3da8c48', 'pay'),
			('809641df-395e-402a-8802-df8ff6b604ab', 'assign'),
			('57017c94-d4d4-460d-a1b7-3479f689f176', 're_open'),
			('c294c16d-1303-4335-a992-49eed1ea8785', 'yes'),
			('e8c263dc-e1f1-4aa4-9e2c-a3f5a9728a01', 'allow');
	`);
    await queryRunner.query(`
		INSERT INTO section (id, name)
			VALUES
			('c0531993-264a-446d-b22b-6365a35451d4', 'dashboard'),
			('2a986ba8-845b-4c88-ac57-de8a9ef9906a', 'schedule'),
			('57ea4f79-7021-4c18-a994-729507edb7a0', 'shift'),
			('a1b3e839-903c-4123-b1e8-d05693faf890', 'provider'),
			('8a2519d2-3089-4b61-965c-a7285e0e24b6', 'facility'),
			('2e02633a-6c41-47f7-ad99-becd1d9bbe0e', 'chat_and_report'),
			('874f73e2-fb97-434d-87c6-e23cd7b00248', 'accounting'),
			('387fc1ab-14c4-4777-8c29-3f4e36641d88', 'admin_contact'),
			('60226d97-9efa-4c29-9b45-d90eff9897c6', 'provider_app_admin_setting'),
			('fcaad133-191b-4cf5-abd7-607156476b45', 'facility_portal_admin_setting'),
			('d6be26d3-c83e-4add-9c70-13c55993653f', 'master_admin_setting'),
			('923928ed-12de-4d71-b940-260f8b52ccc6', 'banking');
	`);
    await queryRunner.query(`
		INSERT INTO sub_section (id, name, section_id) 
			VALUES 
			('7b2848f9-5a2f-4844-814d-23bbfd6d6dfd', 'dashboard', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('8d242e89-13ae-47a2-938c-5115e7fdc808', 'revenue_generated', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('565050a1-dc13-41ad-b7db-6585a7035fc2', 'total_facilities', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('e4f7b277-7f0a-41ad-bec9-ab080628433e', 'total_completed_shifts', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('5a592eb5-9456-43fa-a26c-d8614e2ebf08', 'total_providers', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('c3206645-664d-4cc0-84ee-eb41d6c621b2', 'total_staffing_members', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('b1695865-7aad-434c-b3d5-cc3e0ba53f92', 'no_of_issues_reported', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('fd4ccbc4-f4cb-435b-b3cc-0d3ca0be8450', 'credentials_expiring_soon', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('161887f3-54ee-4618-8796-afc5b5b24e8c', 'total_shifts', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('23b37b71-acc3-47a4-8b44-995e831aaa2a', 'new_signups', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('daee42cd-3d64-4484-9b55-6b51ee207ab2', 'shifts_ratio', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('63dadc3f-1bb0-402f-9671-a6eb3a8ec4e2', 'global_map', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('7d00f55d-a009-46cb-a34a-0ccef9c24e98', 'top_rated_providers', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('d29badbc-c8c1-477e-8625-38ae805cd5cf', 'top_billed_facilities', 'c0531993-264a-446d-b22b-6365a35451d4'),
			('9dbf65f3-2495-451b-aecd-5218bacf03bb', 'schedule_shift', '2a986ba8-845b-4c88-ac57-de8a9ef9906a'),
			('f57661d1-0bd3-4473-9a93-dbfe8251f9e8', 'open_shifts', '2a986ba8-845b-4c88-ac57-de8a9ef9906a'),
			('45e87993-b5b0-4bbe-a26f-56760ce46e9d', 'cancelled_shifts', '2a986ba8-845b-4c88-ac57-de8a9ef9906a'),
			('0dac6210-49bb-4a13-87a6-7f641cc97a36', 'completed_shifts', '2a986ba8-845b-4c88-ac57-de8a9ef9906a'),
			('b2ddda54-1fcb-497a-a5c2-61e576ec0c09', 'requested_shifts', '57ea4f79-7021-4c18-a994-729507edb7a0'),
			('54b70288-ff56-448d-81a2-05eb70556244', 'open_shifts', '57ea4f79-7021-4c18-a994-729507edb7a0'),
			('03fb7f1b-81d2-4eba-9c7d-17000dcc181c', 'scheduled_shifts', '57ea4f79-7021-4c18-a994-729507edb7a0'),
			('0cf164f2-521f-4649-ae3e-07e3a4606533', 'unconfirmed_shifts', '57ea4f79-7021-4c18-a994-729507edb7a0'),
			('10e19afd-3d56-4e6a-af50-2fee76bea5c4', 'cancelled_shifts', '57ea4f79-7021-4c18-a994-729507edb7a0'),
			('74b6fbec-c8e2-49fc-8e9b-aedeb107b6d4', 'add_new_facility', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('37a01657-dbcd-4aac-a891-99ab16a671e4', 'facility_info', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('9dc823c7-0085-4314-9415-56aecc7724a8', 'facility_schedule', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('780d3a5e-15ba-4a63-b72c-b8c65c2188f7', 'shifts', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('e92221b6-3d36-4d72-b3ea-aabb0d4fd82b', 'add_shift', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('4f88442e-f15e-494d-878a-67afe37f1049', 'schedule_shift', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('42ff08b1-21f9-4bdc-bb1c-cbea982cc2ad', 'requested_shifts', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('6ccacc68-311a-40b9-9c2f-d1dcca7f9ca6', 'open_shifts', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('8f296f7a-a9ab-4787-aa55-550acc3f60db', 'cancelled_shifts', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('1bef736f-d3d5-43a5-990c-1decdbe0134e', 'unconfirmed_shifts', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('bb74469e-fe25-4ff6-b736-a0c87155e5c3', 'providers', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('ae096bfa-5b98-4a92-95e7-356fe8317998', 'time_attendance', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('ff1dd8b5-8706-4ec2-af70-2b0dd42af668', 'facility_docs', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('24571a64-be74-4178-af98-cc97198fdcdc', 'evaluation', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('eaa7359b-5bb9-496c-86a3-cfca70fd3236', 'activity', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('f92574de-dac5-4260-96f2-7eef201d4c75', 'contacts', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('5b653103-6943-47dd-8ad1-1d74393160ef', 'settings', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('90c002df-40fe-496d-94bd-c1ea662ac4a4', 'invoicing', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('4e6df067-1f0c-4841-a5ed-95f1211a7a0b', 'credit', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('3f647cc4-437a-44ad-97cc-e82663dda4a2', 'payment', '8a2519d2-3089-4b61-965c-a7285e0e24b6'),
			('a099967f-ac35-430f-a94d-8a4b1c916fa0', 'verification_approval', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('537c2b30-9746-4ad0-855d-308ba6267499', 'provider_info', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('2ee3f7ca-599d-4781-b9e7-b5bfe7e1149e', 'providers_schedule', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('2064061e-3e40-4a0e-ade0-17b90c84e588', 'credentials', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('311e5721-0a48-4759-b157-d99bf57a5ea5', 'shift_history', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('48bebc6f-7b98-42ca-8854-77f6943da6e0', 'activity', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('41842917-18b3-46a1-b13a-15adc270f847', 'facilities', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('2eeea81b-b42a-492a-961c-568785ee68d3', 'reviews', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('0a17ae06-ab8b-48fd-a89b-861b50078dfa', 'evaluation', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('1a266a90-744c-4a87-9537-96521e971f8a', 'notes', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('04fa5bb9-9a36-493b-8f23-691557dc15dd', 'reports', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('7a3747e3-589c-44bc-810a-da9e2a64d2ad', 'referrals', 'a1b3e839-903c-4123-b1e8-d05693faf890'),
			('64eff59f-2f53-4e92-b215-66911620d780', 'can_chat', '2e02633a-6c41-47f7-ad99-becd1d9bbe0e'),
			('0259ce83-2656-4b46-b6b9-de76306cfc3e', 'reports', '2e02633a-6c41-47f7-ad99-becd1d9bbe0e'),
			('670e9ceb-9a4c-456d-8ea5-fd25f426296d', 'admin_contacts', '387fc1ab-14c4-4777-8c29-3f4e36641d88'),
			('783d4dce-edf1-4134-8c2c-648aded28672', 'timecards', '874f73e2-fb97-434d-87c6-e23cd7b00248'),
			('008da058-01d4-44ae-b77d-b2f087b281dd', 'invoicing', '874f73e2-fb97-434d-87c6-e23cd7b00248'),
			('ffdc43b6-e04e-4a09-8514-fcad16b24636', 'rate_group', '874f73e2-fb97-434d-87c6-e23cd7b00248'),
			('838e4610-ac9b-4fd6-8a39-cf66786aceb8', 'holiday_group', '874f73e2-fb97-434d-87c6-e23cd7b00248'),
			('6893d747-4dac-4bbc-ba61-536c1132a82c', 'skill_test_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('b103e4e0-6f25-4fec-b7ef-930e263f27d2', 'quiz_test_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('11dc6c9f-4dbe-467b-83ae-e0b9cf15ff1b', 'gamification_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('1f3406ee-ec13-4ee2-ae3c-9ecaf27290a5', 'attendance_score_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('42b6574e-183a-43c4-96de-5bfc0433fb50', 'document_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('e9b6dbf2-dd39-4b69-8827-b9d7929d4518', 'schedule_and_request_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('c8b27aca-8121-4ed6-9444-45eb5f187345', 'time_entry_approval_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('f5dd829d-7b81-45da-98ad-393129daae67', 'provider_profile_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('39d65d83-629a-4f91-a3af-6a1dd624e59e', 'preference_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('58875098-c3f0-46a0-b2aa-4e3c230bd9ca', 'professionals_reference_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('4a301166-89d3-4e7e-9458-cf047812473c', 'education_history_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('c4a656d2-512f-49e3-8ea2-76b871c869d4', 'employment_history_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('e763f050-bb5f-479c-b551-da6810538920', 'shift_cancel_reject_reason_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('a3f75a73-c832-457c-b93f-6d5a8b508dcb', 'reward_point_settings', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('4aa4330e-fc52-4f07-af61-4faa1ced4232', 'e-document', '60226d97-9efa-4c29-9b45-d90eff9897c6'),
			('d80e571c-90ce-4e6e-a351-64a44884065f', 'schedule_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('a490782f-1515-4288-904f-48ad968cdc34', 'shifts_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('bb87feb6-0ba6-41c4-9e8c-f2d9d60a00b7', 'report_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('fd4ff7e9-4abe-4be4-909a-0d665018d1fb', 'provider_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('63798f30-27df-4cd5-b648-c6f2a9fb511b', 'chat_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('e693abe2-bec8-4486-a74d-2bb636d10fc3', 'time_and_attendance_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('00e0cebf-d514-4bbc-be82-d367585715a3', 'billing_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('162d45d7-f7f9-48b2-9f4a-91096fe76e00', 'facility_contact_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('b7ab9cb7-f425-4715-b28f-48f517de7377', 'my_facility_settings', 'fcaad133-191b-4cf5-abd7-607156476b45'),
			('185a3ced-3775-44d8-8995-55e96dcd54c5', 'shift_settings', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('9d0a7b37-8b3f-48c1-903b-bed1885f72c3', 'specialty', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('29de8483-092d-41b7-851c-eb5bef4932e0', 'certification', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('1a33c5e6-2c4c-4126-bb08-20ccd1402831', 'shift_type', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('cdb5b952-9988-4892-a344-bc98acce1de4', 'note_type', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('aeb9ef79-84bf-41a7-a2bd-aca46a46acd0', 'work_comp_code', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('26a3c80f-d650-40cf-a11d-1b7c105ddbb1', 'languages', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('cc52de48-fb3a-49a7-a32d-2fa9b318ff97', 'status_option', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('7d7482c6-c5df-4da5-817f-5f4aa15bc43e', 'document_categories', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('4466fe2e-3128-41d4-915f-175563aa2241', 'compliance_manager', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('8fa28648-4144-4c22-9e53-d2098942808a', 'notification_settings', 'd6be26d3-c83e-4add-9c70-13c55993653f'),
			('163eff45-6d8e-4556-ad0f-3ebad078f400', 'bank_of_america', '923928ed-12de-4d71-b940-260f8b52ccc6'),
			('ce56c0cb-d17e-4f9a-964e-20b8a4b362e6', 'capital_one', '923928ed-12de-4d71-b940-260f8b52ccc6'),
			('122086f6-4f67-4883-8be4-47858e75d831', 'american_express', '923928ed-12de-4d71-b940-260f8b52ccc6');
	`);
    await queryRunner.query(`
		INSERT INTO role_section_permission (id, role_id, section_id, sub_section_id, permission_id, has_access, is_default) 
			VALUES
			('3b77a33a-8adb-4fad-8045-0502efdce666', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '7b2848f9-5a2f-4844-814d-23bbfd6d6dfd', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('eb56dd08-9f40-40b6-82b8-1740dadec051', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '7b2848f9-5a2f-4844-814d-23bbfd6d6dfd', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('594db14a-401e-416d-a470-3afe50cbf229', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '8d242e89-13ae-47a2-938c-5115e7fdc808', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('a4f3987d-b980-47be-9953-8988fe18c672', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '565050a1-dc13-41ad-b7db-6585a7035fc2', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('adeb1870-a2af-4c4a-b196-98fedf3ef9dc', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '5a592eb5-9456-43fa-a26c-d8614e2ebf08', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('20e8e139-8567-478a-830b-19bb54bd2f43', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', 'c3206645-664d-4cc0-84ee-eb41d6c621b2', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('060374ae-6761-4040-88bd-22b5e4425c17', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', 'b1695865-7aad-434c-b3d5-cc3e0ba53f92', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('30033378-dd07-414d-b899-1692c1e6f501', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', 'fd4ccbc4-f4cb-435b-b3cc-0d3ca0be8450', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('94508795-b4e4-411d-96ff-1838958d2b21', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '161887f3-54ee-4618-8796-afc5b5b24e8c', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('6afc6baf-0057-407e-822d-6fc73ceb8fb4', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '23b37b71-acc3-47a4-8b44-995e831aaa2a', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('20c02f0b-a7c9-4c88-a97f-9b928569e2b8', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', 'daee42cd-3d64-4484-9b55-6b51ee207ab2', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('0a0ea41a-8d67-4aa2-8042-1280024b3ddf', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '63dadc3f-1bb0-402f-9671-a6eb3a8ec4e2', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('0672b529-73d5-46e3-af72-d1f88a7d5b74', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', '7d00f55d-a009-46cb-a34a-0ccef9c24e98', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('e86aeeae-fdc8-4aaf-9503-fa391cf3fed2', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', 'd29badbc-c8c1-477e-8625-38ae805cd5cf', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('15af6c61-d984-4e1f-8eef-f70462a30576', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '9dbf65f3-2495-451b-aecd-5218bacf03bb', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('3efc9ade-09f6-4065-b8f7-978499f8ecdc', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '9dbf65f3-2495-451b-aecd-5218bacf03bb', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('2f7a3311-d820-4cf8-9d8b-d918900a253a', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '9dbf65f3-2495-451b-aecd-5218bacf03bb', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('18fb4c02-4250-4f40-b943-45fbc531142f', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '9dbf65f3-2495-451b-aecd-5218bacf03bb', '3e711ad7-9fdd-4835-8a6a-20d8070a6406', true, true),
			('66b28a48-51d8-4093-8dbc-f6888916775b', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', 'f57661d1-0bd3-4473-9a93-dbfe8251f9e8', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('d9333ba7-7e03-4d1a-b154-19bee95cac1f', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', 'f57661d1-0bd3-4473-9a93-dbfe8251f9e8', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('58f15490-3864-4b68-b11a-71b2486a311d', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', 'f57661d1-0bd3-4473-9a93-dbfe8251f9e8', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('e2f85a0d-1487-45dd-860a-ca9692acbf8e', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', 'f57661d1-0bd3-4473-9a93-dbfe8251f9e8', '3e711ad7-9fdd-4835-8a6a-20d8070a6406', true, true),
			('cf00dffc-df2d-4bed-ac8b-0428b598fe9a', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '45e87993-b5b0-4bbe-a26f-56760ce46e9d', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('2e634d65-2659-4120-83c8-ee75fd781884', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '45e87993-b5b0-4bbe-a26f-56760ce46e9d', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('00ac3c31-d6f4-49dd-be62-873606fec513', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '0dac6210-49bb-4a13-87a6-7f641cc97a36', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('8794153a-4293-40a6-bc60-ff84b3991b71', '27a879f5-c044-4074-96c0-34ee3d209f17', '2a986ba8-845b-4c88-ac57-de8a9ef9906a', '0dac6210-49bb-4a13-87a6-7f641cc97a36', '3e711ad7-9fdd-4835-8a6a-20d8070a6406', true, true),
			('9019295f-df15-4b53-9945-592c436cfe4e', '27a879f5-c044-4074-96c0-34ee3d209f17', 'c0531993-264a-446d-b22b-6365a35451d4', 'e4f7b277-7f0a-41ad-bec9-ab080628433e', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('a4334786-32d4-41f7-a11c-ec914607212d', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', 'b2ddda54-1fcb-497a-a5c2-61e576ec0c09', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('fc41063c-e9bf-4c54-a072-4daede47c971', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', 'b2ddda54-1fcb-497a-a5c2-61e576ec0c09', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('bbc6def5-5325-45fb-a43d-fd430b954498', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', 'b2ddda54-1fcb-497a-a5c2-61e576ec0c09', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('2e6a47b2-cd7a-4e5a-ba30-667c22aa5011', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', 'b2ddda54-1fcb-497a-a5c2-61e576ec0c09', '3e711ad7-9fdd-4835-8a6a-20d8070a6406', true, true),
			('33ace545-234c-4355-b530-7ae353a87fac', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '54b70288-ff56-448d-81a2-05eb70556244', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('07c252f1-25b5-4491-bdaf-2e577043969c', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '54b70288-ff56-448d-81a2-05eb70556244', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('6efc35ff-0840-4e86-a04c-065cc82e6e5b', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '54b70288-ff56-448d-81a2-05eb70556244', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('94b1c642-e272-4734-b40a-ad7d5874a1ba', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '03fb7f1b-81d2-4eba-9c7d-17000dcc181c', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('ba883233-33e2-4bf0-a022-0750aacdb24b', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '03fb7f1b-81d2-4eba-9c7d-17000dcc181c', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('8782e75a-30cb-4339-ba50-7fd9c6d4ba78', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '03fb7f1b-81d2-4eba-9c7d-17000dcc181c', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('452ab7b2-8d4e-46a1-9618-2e6e3c760a31', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '03fb7f1b-81d2-4eba-9c7d-17000dcc181c', '3e711ad7-9fdd-4835-8a6a-20d8070a6406', true, true),
			('a515f248-4ce1-4136-8025-86579a4b0169', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '0cf164f2-521f-4649-ae3e-07e3a4606533', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('b6416e9f-6958-4afb-89a1-d064f0978ef1', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '0cf164f2-521f-4649-ae3e-07e3a4606533', '7d5ca181-80c9-405c-b5d8-d5fb3f15b970', true, true),
			('8113658b-6aa4-4026-9121-4b94583e6536', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '10e19afd-3d56-4e6a-af50-2fee76bea5c4', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('b0322cf8-4e97-485b-9076-2139f281f3eb', '27a879f5-c044-4074-96c0-34ee3d209f17', '57ea4f79-7021-4c18-a994-729507edb7a0', '10e19afd-3d56-4e6a-af50-2fee76bea5c4', '57017c94-d4d4-460d-a1b7-3479f689f176', true, true),
			('ddfef237-b7c8-437f-a237-82ee447f4f89', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', 'a099967f-ac35-430f-a94d-8a4b1c916fa0', '39fc5bf7-9b47-439a-a720-4cae317a2995', true, true),
			('5c1f1462-c8b2-479e-9a85-c80f1944158f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', 'a099967f-ac35-430f-a94d-8a4b1c916fa0', 'ec26cb11-eaea-4ddc-a5c4-80782e5af209', true, true),
			('40263fb5-0fa8-44a9-ad88-bb4edbf2180e', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '537c2b30-9746-4ad0-855d-308ba6267499', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('753596a6-4964-4d21-a6cf-f77d60252c53', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '537c2b30-9746-4ad0-855d-308ba6267499', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('8a362d9a-3374-45e0-be89-7ce2c70a0cc6', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '537c2b30-9746-4ad0-855d-308ba6267499', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('77777d55-f19b-4524-9fd6-4e8d08cfbb52', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '2ee3f7ca-599d-4781-b9e7-b5bfe7e1149e', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('7738000f-7832-40aa-a437-649551b0276c', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '2ee3f7ca-599d-4781-b9e7-b5bfe7e1149e', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('405cd1c0-3c43-45bb-8e81-0cf72650e3b4', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '2064061e-3e40-4a0e-ade0-17b90c84e588', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('6ff0a377-b06f-4669-a9ea-47e3b2d12a28', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '2064061e-3e40-4a0e-ade0-17b90c84e588', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('55911e13-d06f-4343-90e0-234dd88666f0', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '311e5721-0a48-4759-b157-d99bf57a5ea5', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('9a95733f-731d-4e18-8e74-79ec13b7b429', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '48bebc6f-7b98-42ca-8854-77f6943da6e0', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('94a6af55-abaf-4582-a312-7cff027ecef1', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '7a3747e3-589c-44bc-810a-da9e2a64d2ad', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('4b487080-053b-49b8-aa43-3b2aa78d05c4', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '41842917-18b3-46a1-b13a-15adc270f847', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('fa866c6a-1a09-409f-912e-bbc925798670', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '2eeea81b-b42a-492a-961c-568785ee68d3', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('17595ebe-47af-4758-92c4-eca8c7df7c3e', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '0a17ae06-ab8b-48fd-a89b-861b50078dfa', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('76cc2ebf-4603-4f47-9032-a433eb19164f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '1a266a90-744c-4a87-9537-96521e971f8a', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('4bb0a000-0753-4bd1-8ba4-d6a2074714cd', '27a879f5-c044-4074-96c0-34ee3d209f17', 'a1b3e839-903c-4123-b1e8-d05693faf890', '04fa5bb9-9a36-493b-8f23-691557dc15dd', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('c4256568-963f-4caf-ac7d-4103b7a85a07', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '74b6fbec-c8e2-49fc-8e9b-aedeb107b6d4', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('a4846825-5360-4720-856c-6a44927d3025', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '37a01657-dbcd-4aac-a891-99ab16a671e4', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('990975fa-b042-4194-b778-ababdf9c0057', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '37a01657-dbcd-4aac-a891-99ab16a671e4', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('4eed6ddc-6a0f-45a5-a3d6-e62a2ac773f6', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '9dc823c7-0085-4314-9415-56aecc7724a8', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('38b328f0-23c7-4980-8a95-309d34025156', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '9dc823c7-0085-4314-9415-56aecc7724a8', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('05e1a841-7f66-4325-b613-ee7cdee25ee5', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '780d3a5e-15ba-4a63-b72c-b8c65c2188f7', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('97e45a5e-ff2e-4c2e-a455-8036f6b05b41', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '780d3a5e-15ba-4a63-b72c-b8c65c2188f7', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('3a65ea67-249b-4f8f-91b2-427198f4194e', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'e92221b6-3d36-4d72-b3ea-aabb0d4fd82b', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('7f5af447-611a-4811-8837-352b088814fe', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'e92221b6-3d36-4d72-b3ea-aabb0d4fd82b', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('7186059d-71b4-481f-aa33-7d0921dd6bb8', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '4f88442e-f15e-494d-878a-67afe37f1049', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('8875ee09-1dd1-42d3-bf64-e02590909db6', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '4f88442e-f15e-494d-878a-67afe37f1049', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('becb011d-27a9-47e9-b5e4-2629f3ab5c97', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '42ff08b1-21f9-4bdc-bb1c-cbea982cc2ad', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('0abfe337-86c7-40ed-b57a-16665248cf3f', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '42ff08b1-21f9-4bdc-bb1c-cbea982cc2ad', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('fec99d91-56ed-4a82-88af-102488bce25d', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '42ff08b1-21f9-4bdc-bb1c-cbea982cc2ad', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('016abee6-d41a-4a55-8b4f-dba8de22407c', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '42ff08b1-21f9-4bdc-bb1c-cbea982cc2ad', '3e711ad7-9fdd-4835-8a6a-20d8070a6406', true, true),
			('9144b8eb-3404-4330-b462-1e69d257857c', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '6ccacc68-311a-40b9-9c2f-d1dcca7f9ca6', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('b19c0577-262c-4dae-a958-405c03515476', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '6ccacc68-311a-40b9-9c2f-d1dcca7f9ca6', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('9fa03a67-9d3c-494a-a1c3-d76541a3dec8', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '6ccacc68-311a-40b9-9c2f-d1dcca7f9ca6', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('08644d70-ccdc-4a91-8fb0-e70e41fc5e76', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '8f296f7a-a9ab-4787-aa55-550acc3f60db', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('3440a40f-9176-4d5e-8f86-d1074b32f37e', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '8f296f7a-a9ab-4787-aa55-550acc3f60db', '57017c94-d4d4-460d-a1b7-3479f689f176', true, true),
			('eb18de65-01a3-49a2-853c-4c2c0631d1c4', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '1bef736f-d3d5-43a5-990c-1decdbe0134e', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('d00320d7-b949-4d07-b070-5cb2081adc3b', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '1bef736f-d3d5-43a5-990c-1decdbe0134e', '7d5ca181-80c9-405c-b5d8-d5fb3f15b970', true, true),
			('7a5ced09-4f95-44ab-8225-b67c1f5fe474', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'bb74469e-fe25-4ff6-b736-a0c87155e5c3', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('7dff254f-ad40-4ec5-bcf3-caa1b4233af5', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'bb74469e-fe25-4ff6-b736-a0c87155e5c3', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('2c4bdf60-bf99-47ba-a50a-bf0a111cf4e4', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'ae096bfa-5b98-4a92-95e7-356fe8317998', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('4f276573-fd9f-4551-ada4-de0163af76e8', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'ae096bfa-5b98-4a92-95e7-356fe8317998', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('08577af5-047e-48d4-9cfa-4230ce13ebbd', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'ae096bfa-5b98-4a92-95e7-356fe8317998', 'e8341a7b-3a58-4e1d-a1af-d6fcf3da8c48', true, true),
			('017b875d-9b65-4041-b3d2-279880dda6fa', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'ff1dd8b5-8706-4ec2-af70-2b0dd42af668', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('5bc9d1cc-a506-46e2-9d49-4f7f05911f46', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'ff1dd8b5-8706-4ec2-af70-2b0dd42af668', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('89870ca0-abc2-461f-aace-03dac2b42036', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '24571a64-be74-4178-af98-cc97198fdcdc', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('a1c6a16e-6572-46ff-a287-f3582a15ebcd', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '24571a64-be74-4178-af98-cc97198fdcdc', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('25d6bffd-b085-4ef9-8d07-2a7bceb1b56a', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '24571a64-be74-4178-af98-cc97198fdcdc', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('93c78dab-80f3-4d19-bf3d-f67e07e037a5', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'eaa7359b-5bb9-496c-86a3-cfca70fd3236', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('02437259-4dda-4350-84d9-aac4d44e9b3b', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'f92574de-dac5-4260-96f2-7eef201d4c75', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('6dcb0fc3-aeea-4b36-badc-5119d0168ce3', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'f92574de-dac5-4260-96f2-7eef201d4c75', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('94f54ba0-0c2e-4dc7-b46f-82043760f163', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'f92574de-dac5-4260-96f2-7eef201d4c75', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('87273460-93a1-4cd7-9c56-f1dc7f9bf28e', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', 'f92574de-dac5-4260-96f2-7eef201d4c75', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('a9573b51-caf3-4d3a-9ff7-83263f959e9a', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '5b653103-6943-47dd-8ad1-1d74393160ef', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('2a9878c9-593e-4587-9d0c-68e6efb31a68', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '5b653103-6943-47dd-8ad1-1d74393160ef', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('61510afe-c7db-45ea-b7f5-6e1fd4c7f965', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '90c002df-40fe-496d-94bd-c1ea662ac4a4', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('576ab862-9773-4653-8ca9-5018aeb9be39', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '90c002df-40fe-496d-94bd-c1ea662ac4a4', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('f003dad6-c3dd-4844-8377-5b697a580169', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '4e6df067-1f0c-4841-a5ed-95f1211a7a0b', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('46f0aaae-ce8b-40d0-9ac9-b5568347c756', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '4e6df067-1f0c-4841-a5ed-95f1211a7a0b', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('3775f741-114c-437d-90c3-33adb8ff6dd8', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '4e6df067-1f0c-4841-a5ed-95f1211a7a0b', 'f79cd16c-a043-4fa2-9cd9-1e0c21a19966', true, true),
			('a3b68045-2b9a-479a-ace2-033131b6a1d3', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '3f647cc4-437a-44ad-97cc-e82663dda4a2', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('6b3a0179-4c9f-4f24-8734-1c7993a2ec64', '27a879f5-c044-4074-96c0-34ee3d209f17', '8a2519d2-3089-4b61-965c-a7285e0e24b6', '3f647cc4-437a-44ad-97cc-e82663dda4a2', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('c00707c4-e414-41b6-a340-062b52516be9', '27a879f5-c044-4074-96c0-34ee3d209f17', '2e02633a-6c41-47f7-ad99-becd1d9bbe0e', '64eff59f-2f53-4e92-b215-66911620d780', 'c294c16d-1303-4335-a992-49eed1ea8785', true, true),
			('1a177674-a5a1-42c7-a7c0-a596d38ba8bb', '27a879f5-c044-4074-96c0-34ee3d209f17', '2e02633a-6c41-47f7-ad99-becd1d9bbe0e', '0259ce83-2656-4b46-b6b9-de76306cfc3e', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('32d6c3a9-87bd-4194-b91c-905191d56dec', '27a879f5-c044-4074-96c0-34ee3d209f17', '2e02633a-6c41-47f7-ad99-becd1d9bbe0e', '0259ce83-2656-4b46-b6b9-de76306cfc3e', 'cd9ce94b-3a68-4af8-966e-b806f0470591', true, true),
			('75c965f5-d33e-499c-953e-c6dc3e5b61f6', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '783d4dce-edf1-4134-8c2c-648aded28672', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('4ef872be-de10-4bf7-9369-7eb5bb466b8f', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '783d4dce-edf1-4134-8c2c-648aded28672', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('8360f9ca-7e38-49fc-b2cd-1d68d68be572', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '783d4dce-edf1-4134-8c2c-648aded28672', 'e8341a7b-3a58-4e1d-a1af-d6fcf3da8c48', true, true),
			('cff82094-10e5-4653-a25d-d7689d5a2c98', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '008da058-01d4-44ae-b77d-b2f087b281dd', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('d5b1de65-244b-4b79-9ecd-90e2ca774615', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '008da058-01d4-44ae-b77d-b2f087b281dd', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('268e149e-74d9-4a86-9ab4-2f11cb4f8772', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '008da058-01d4-44ae-b77d-b2f087b281dd', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('0510286f-639d-4d2d-a429-a635a13ef8e8', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', 'ffdc43b6-e04e-4a09-8514-fcad16b24636', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('82bf2601-c807-46b3-b4cd-fa7d0aaeee3e', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', 'ffdc43b6-e04e-4a09-8514-fcad16b24636', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('f82a4413-dc7d-43af-90e2-379dec666847', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', 'ffdc43b6-e04e-4a09-8514-fcad16b24636', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('da8fb4a4-5b56-4d5c-bd01-a82c39f1a373', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', 'ffdc43b6-e04e-4a09-8514-fcad16b24636', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('cd00f84d-c708-4991-a904-c7215b692a9b', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '838e4610-ac9b-4fd6-8a39-cf66786aceb8', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('46debb4c-dc3a-4f10-8f57-df20cc1aa92b', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '838e4610-ac9b-4fd6-8a39-cf66786aceb8', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('0a34ce98-c329-4ce0-86fa-19365efad014', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '838e4610-ac9b-4fd6-8a39-cf66786aceb8', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('633059a3-6480-423f-94b0-96ea8a4bfa57', '27a879f5-c044-4074-96c0-34ee3d209f17', '874f73e2-fb97-434d-87c6-e23cd7b00248', '838e4610-ac9b-4fd6-8a39-cf66786aceb8', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('0b2b7be3-7ede-4f90-af1b-b519c9df6275', '27a879f5-c044-4074-96c0-34ee3d209f17', '387fc1ab-14c4-4777-8c29-3f4e36641d88', '670e9ceb-9a4c-456d-8ea5-fd25f426296d', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('18b7aba3-af4d-489c-859c-8f2aed34e780', '27a879f5-c044-4074-96c0-34ee3d209f17', '387fc1ab-14c4-4777-8c29-3f4e36641d88', '670e9ceb-9a4c-456d-8ea5-fd25f426296d', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('70b43580-ccb9-4a41-90d8-647a5e917b0a', '27a879f5-c044-4074-96c0-34ee3d209f17', '387fc1ab-14c4-4777-8c29-3f4e36641d88', '670e9ceb-9a4c-456d-8ea5-fd25f426296d', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('f23fd60f-df63-4606-9847-11a8ed772cb8', '27a879f5-c044-4074-96c0-34ee3d209f17', '387fc1ab-14c4-4777-8c29-3f4e36641d88', '670e9ceb-9a4c-456d-8ea5-fd25f426296d', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('59a4cac2-e4e9-4426-8dcb-9005cb3a34e0', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '6893d747-4dac-4bbc-ba61-536c1132a82c', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('e9915f25-7cc4-4ba7-a999-62392543ef4b', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '6893d747-4dac-4bbc-ba61-536c1132a82c', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('77533699-b410-4eed-9e31-c6dafe2a0cf2', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '6893d747-4dac-4bbc-ba61-536c1132a82c', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('b4f3dc57-d2a1-464d-92b8-c3cb0ee885df', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'b103e4e0-6f25-4fec-b7ef-930e263f27d2', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('0f868dd6-5301-4a20-b00f-8a90c97228ac', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'b103e4e0-6f25-4fec-b7ef-930e263f27d2', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('9e765583-6c0f-47ff-a877-c85a769b6195', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'b103e4e0-6f25-4fec-b7ef-930e263f27d2', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('6f514129-48f9-49ba-9322-8542b32d8597', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '11dc6c9f-4dbe-467b-83ae-e0b9cf15ff1b', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('fe2e45df-eff2-458c-8a0a-c0696c9693c1', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '11dc6c9f-4dbe-467b-83ae-e0b9cf15ff1b', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('a13c8d0d-9076-4854-9c07-7f4247908203', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '1f3406ee-ec13-4ee2-ae3c-9ecaf27290a5', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('80e622bb-aba5-4a4d-8826-4ff9a1e8ac91', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '1f3406ee-ec13-4ee2-ae3c-9ecaf27290a5', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('72184005-4fdd-40b9-9132-99fcadc4575a', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '42b6574e-183a-43c4-96de-5bfc0433fb50', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('1617ff08-f1f3-4ecc-9040-4dd59b6cd477', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '42b6574e-183a-43c4-96de-5bfc0433fb50', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('9783b427-d50f-4839-aa23-bd2fa29e0049', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '42b6574e-183a-43c4-96de-5bfc0433fb50', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('13cc5041-abea-4c5c-98f4-0cdac4498169', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'e9b6dbf2-dd39-4b69-8827-b9d7929d4518', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('e49bd84c-faef-49ae-bcf3-5883ae75365a', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'e9b6dbf2-dd39-4b69-8827-b9d7929d4518', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('d5bf240d-d18c-4477-a077-1284b8b27cae', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'c8b27aca-8121-4ed6-9444-45eb5f187345', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('f07b1aca-0dc0-4454-8bdf-535c28fc599b', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'c8b27aca-8121-4ed6-9444-45eb5f187345', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('e2f58c3b-5706-4093-9db7-938eec022627', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'f5dd829d-7b81-45da-98ad-393129daae67', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('0b07fe7c-d536-4a9a-8e49-653b2c2addce', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'f5dd829d-7b81-45da-98ad-393129daae67', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('da4bbc41-1889-4aa8-9eb3-51a59c61da4f', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '39d65d83-629a-4f91-a3af-6a1dd624e59e', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('9763dbbf-c2ee-4955-88f6-5a523b847cb0', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '39d65d83-629a-4f91-a3af-6a1dd624e59e', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('acdf110a-7f41-424f-8224-1abfc89cec4d', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '58875098-c3f0-46a0-b2aa-4e3c230bd9ca', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('89a34c3f-5d80-4bd4-b7e9-761fc666e7b7', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '58875098-c3f0-46a0-b2aa-4e3c230bd9ca', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('f29fe227-2df4-471e-9c18-bd76d4db55b5', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '4a301166-89d3-4e7e-9458-cf047812473c', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('707ad191-d9ad-4299-9efe-b44c8bc57bc5', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '4a301166-89d3-4e7e-9458-cf047812473c', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('c14b9239-2949-42c6-80b2-8d096c0340ac', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'c4a656d2-512f-49e3-8ea2-76b871c869d4', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('fa9bb83e-defe-4de4-8bbd-63895f9efce6', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'c4a656d2-512f-49e3-8ea2-76b871c869d4', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('e5ee1a6f-23b4-42fd-905e-cfd97c78928f', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'e763f050-bb5f-479c-b551-da6810538920', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('be45649a-4094-4346-a2f2-e6f802771e83', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'e763f050-bb5f-479c-b551-da6810538920', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('c7825314-b7e5-42ca-89a8-809b9e904262', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'e763f050-bb5f-479c-b551-da6810538920', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('87613edf-3f1e-4c76-a5a2-82978a9d4e21', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'a3f75a73-c832-457c-b93f-6d5a8b508dcb', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('1f072263-02fb-4a44-bb9b-63aecc6badca', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '4aa4330e-fc52-4f07-af61-4faa1ced4232', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('3b8978f8-1240-41e2-ba64-21f79af9c437', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '4aa4330e-fc52-4f07-af61-4faa1ced4232', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('25d5b174-6300-4a7a-b7e5-d6036fcbc86f', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', '4aa4330e-fc52-4f07-af61-4faa1ced4232', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('1967f146-88a3-4bad-bc48-70bf42be84fb', '27a879f5-c044-4074-96c0-34ee3d209f17', '60226d97-9efa-4c29-9b45-d90eff9897c6', 'a3f75a73-c832-457c-b93f-6d5a8b508dcb', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('c3eabe32-8401-479b-a0a5-01f87e29fbcd', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'd80e571c-90ce-4e6e-a351-64a44884065f', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('dbb4245a-b012-4f3b-8e4e-d7f473959683', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'd80e571c-90ce-4e6e-a351-64a44884065f', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('7144d0b7-207f-481c-afab-5c909bc64580', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'a490782f-1515-4288-904f-48ad968cdc34', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('c29d59d1-465f-41fd-989b-585a1e5bcbb1', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'a490782f-1515-4288-904f-48ad968cdc34', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('178fa2ab-2161-4fd5-a4e4-f346a44ba3f0', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'a490782f-1515-4288-904f-48ad968cdc34', '809641df-395e-402a-8802-df8ff6b604ab', true, true),
			('97f8a827-5195-4d12-8b95-50476d3c0d5e', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'bb87feb6-0ba6-41c4-9e8c-f2d9d60a00b7', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('91807ea3-c0dd-4afb-9e2d-e9fa6fdccee8', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'bb87feb6-0ba6-41c4-9e8c-f2d9d60a00b7', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('18109075-f689-4791-9f5f-da9ea4fd392c', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'bb87feb6-0ba6-41c4-9e8c-f2d9d60a00b7', '809641df-395e-402a-8802-df8ff6b604ab', true, true),
			('d0e192c4-176d-496e-a05a-854927fe58b4', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'fd4ff7e9-4abe-4be4-909a-0d665018d1fb', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('74678dea-a59f-4888-8f7b-13a10f212515', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'fd4ff7e9-4abe-4be4-909a-0d665018d1fb', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('4085f57d-a933-4d6e-b234-a07fefd87eab', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'fd4ff7e9-4abe-4be4-909a-0d665018d1fb', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('a4a02755-1193-411c-b6c2-32e19c2dbfcd', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '63798f30-27df-4cd5-b648-c6f2a9fb511b', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('4d0441f9-51ca-41bb-a754-1e4ec35f8a7a', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '63798f30-27df-4cd5-b648-c6f2a9fb511b', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('b88e4c03-a3fd-4e39-9e03-904f51bcc810', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'e693abe2-bec8-4486-a74d-2bb636d10fc3', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('7212a762-3fd6-4c1d-84e8-19b76277d518', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'e693abe2-bec8-4486-a74d-2bb636d10fc3', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('a53c7c9b-ca25-4a0b-a975-52f1207a5a4c', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'e693abe2-bec8-4486-a74d-2bb636d10fc3', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('17b0816b-5d45-48ab-9630-43a161eebaa1', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '00e0cebf-d514-4bbc-be82-d367585715a3', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('d60497fb-71cd-4fdf-8454-56a32b5b3bf5', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '00e0cebf-d514-4bbc-be82-d367585715a3', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('111a059a-dc0e-4960-9abe-a5dc4002cb3f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '00e0cebf-d514-4bbc-be82-d367585715a3', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('17aa4b84-5b1e-45c6-b515-71acabc3d77d', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '162d45d7-f7f9-48b2-9f4a-91096fe76e00', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('ecf71aa7-5371-4be5-9560-e8355408736f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '162d45d7-f7f9-48b2-9f4a-91096fe76e00', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('69f12ffd-c068-4730-977c-c513657f853f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', '162d45d7-f7f9-48b2-9f4a-91096fe76e00', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('77de29f1-b597-49da-9abb-98209ffe6481', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'b7ab9cb7-f425-4715-b28f-48f517de7377', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('eb3e2288-0c9b-4325-b6fa-6bfca927d918', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'b7ab9cb7-f425-4715-b28f-48f517de7377', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('1c327a25-6a76-44df-acc7-bc343aadba92', '27a879f5-c044-4074-96c0-34ee3d209f17', 'fcaad133-191b-4cf5-abd7-607156476b45', 'b7ab9cb7-f425-4715-b28f-48f517de7377', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('d5c8156b-1351-4394-a8d9-262058f4489e', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '185a3ced-3775-44d8-8995-55e96dcd54c5', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('13047a29-e5b6-49ff-bc52-be6fb2583d52', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '185a3ced-3775-44d8-8995-55e96dcd54c5', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('e511b264-b5a3-435c-adf8-6caed3d0d399', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '185a3ced-3775-44d8-8995-55e96dcd54c5', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('9d7b974d-5147-4b22-8d18-4fd903fc299d', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '9d0a7b37-8b3f-48c1-903b-bed1885f72c3', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('1ed3a05c-28b3-40e7-92f2-feb701076293', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '9d0a7b37-8b3f-48c1-903b-bed1885f72c3', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('b4973b98-e04f-4066-9410-4eed4ac5e617', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '9d0a7b37-8b3f-48c1-903b-bed1885f72c3', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('cd6ecddb-eab3-45ad-90b7-26d9d2711785', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '9d0a7b37-8b3f-48c1-903b-bed1885f72c3', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('a05ba508-fe67-4c00-b7e9-2aac1b16bf27', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '29de8483-092d-41b7-851c-eb5bef4932e0', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('ac25e3b0-5445-4868-9b1d-0b58dfcf1908', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '29de8483-092d-41b7-851c-eb5bef4932e0', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('8176245d-ad26-44ec-83cf-42497519b065', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '29de8483-092d-41b7-851c-eb5bef4932e0', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('81e8dc28-0735-48bc-948b-f09aaa61ff2f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '29de8483-092d-41b7-851c-eb5bef4932e0', 'df52e400-0ab6-40c4-a9f2-6e6b88ad018f', true, true),
			('b46f364d-2b2c-4ec8-8adc-e9ab3e0f7bc8', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '1a33c5e6-2c4c-4126-bb08-20ccd1402831', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('dc84415c-1b91-4b36-b465-25d16af8e927', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '1a33c5e6-2c4c-4126-bb08-20ccd1402831', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('ae8bf5f4-b68e-4850-9713-ac110953bab7', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '1a33c5e6-2c4c-4126-bb08-20ccd1402831', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('3cf3ec04-88fe-435e-b14e-18b517c4eef5', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'cdb5b952-9988-4892-a344-bc98acce1de4', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('022027d3-587f-4eec-8b0c-ae9ea375a43d', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'cdb5b952-9988-4892-a344-bc98acce1de4', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('d17d238e-4c1d-4494-84e6-4fd7b6e3e1c5', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'cdb5b952-9988-4892-a344-bc98acce1de4', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('36b0a86d-1c96-4ae2-92e5-9c18edef4c8f', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'aeb9ef79-84bf-41a7-a2bd-aca46a46acd0', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('b0b87084-1186-46be-80f1-5aae6c1f6ee9', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'aeb9ef79-84bf-41a7-a2bd-aca46a46acd0', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('7ba5c2c8-6cc9-4162-b521-61cee9d60112', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'aeb9ef79-84bf-41a7-a2bd-aca46a46acd0', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('9536dd14-2cb7-4b1a-93a7-2d16434c3a60', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '26a3c80f-d650-40cf-a11d-1b7c105ddbb1', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('ee65e2e2-ff35-4dcd-902b-e769ecd2cc14', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '26a3c80f-d650-40cf-a11d-1b7c105ddbb1', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('ac99a45c-dd98-4e58-aa12-4a262a485f17', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '26a3c80f-d650-40cf-a11d-1b7c105ddbb1', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('868bd2f1-2eee-4fd9-93be-95973a0c5c1c', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'cc52de48-fb3a-49a7-a32d-2fa9b318ff97', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('df545dd4-c5c7-4e90-94e5-f856ad7fc8f3', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'cc52de48-fb3a-49a7-a32d-2fa9b318ff97', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('d07cd4c8-b2f8-49c2-a13b-f6977fb77fa4', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', 'cc52de48-fb3a-49a7-a32d-2fa9b318ff97', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('cef1b72e-d0ee-4c9f-b57c-a04aaa2f9995', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '7d7482c6-c5df-4da5-817f-5f4aa15bc43e', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('e11027ba-2a93-4275-88f3-1252b2250531', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '7d7482c6-c5df-4da5-817f-5f4aa15bc43e', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('2a8817c9-d17a-48f0-9a79-26dadbdb11fb', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '7d7482c6-c5df-4da5-817f-5f4aa15bc43e', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('71ee5cf8-5b22-4ebf-b46e-69b2e31838d5', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '4466fe2e-3128-41d4-915f-175563aa2241', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('d11d0205-0217-4e10-a9af-e2b5f6949748', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '4466fe2e-3128-41d4-915f-175563aa2241', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('759bbe43-6867-4579-aed7-f16ae1286f1e', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '4466fe2e-3128-41d4-915f-175563aa2241', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('cfe626c4-c935-4fd8-859b-e6aa2efcbe24', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '8fa28648-4144-4c22-9e53-d2098942808a', 'f8704615-c2ed-4647-aff1-7513d82e8ed0', true, true),
			('62edc811-f010-4550-9ea9-8661d6dd9368', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '8fa28648-4144-4c22-9e53-d2098942808a', '975ae729-0280-4ad8-ac2b-9853bd134027', true, true),
			('cb931f5c-7ef6-4f6a-a0c0-5745d276b5b0', '27a879f5-c044-4074-96c0-34ee3d209f17', 'd6be26d3-c83e-4add-9c70-13c55993653f', '8fa28648-4144-4c22-9e53-d2098942808a', 'c12f7f4b-c0c2-4d3b-a52a-46eaf60604f1', true, true),
			('09f25910-70ca-4f56-8086-973adceb4270', '27a879f5-c044-4074-96c0-34ee3d209f17', '923928ed-12de-4d71-b940-260f8b52ccc6', '163eff45-6d8e-4556-ad0f-3ebad078f400', 'e8c263dc-e1f1-4aa4-9e2c-a3f5a9728a01', true, true),
			('c98c58bb-c647-498e-96ca-fba01975d90b', '27a879f5-c044-4074-96c0-34ee3d209f17', '923928ed-12de-4d71-b940-260f8b52ccc6', 'ce56c0cb-d17e-4f9a-964e-20b8a4b362e6', 'e8c263dc-e1f1-4aa4-9e2c-a3f5a9728a01', true, true),
			('968ffe28-0155-404b-9712-d9a211207ee7', '27a879f5-c044-4074-96c0-34ee3d209f17', '923928ed-12de-4d71-b940-260f8b52ccc6', '122086f6-4f67-4883-8be4-47858e75d831', 'e8c263dc-e1f1-4aa4-9e2c-a3f5a9728a01', true, true);
	`);
    await queryRunner.query(`
		INSERT INTO provider_general_setting (id) VALUES ('032bfe7b-c98c-4cad-911d-08e2b32537eb');
	`);
    await queryRunner.query(`
		INSERT INTO provider_general_setting_section (id, name, provider_general_setting_id, key, "order") VALUES
			('ba01ca5f-2534-4ec2-93b2-aae83e910013', 'Where Did You Hear About Us?', '032bfe7b-c98c-4cad-911d-08e2b32537eb', 'heard_about_us', 1),
			('1403ec44-882f-4177-8bc1-b02b7cacfcdb', 'Acknowledgement Questions', '032bfe7b-c98c-4cad-911d-08e2b32537eb', 'acknowledgement_question', 2),
			('221e5748-77eb-4f77-b652-2f3a88b049db', 'Post Statement', '032bfe7b-c98c-4cad-911d-08e2b32537eb', 'post_statement', 4);
	`);
    await queryRunner.query(`
		INSERT INTO provider_general_setting_sub_section (name, has_remark, provider_general_setting_section_id, placeholder,instruction, type, key, "order") VALUES
			('Referred by a friend', true, 'ba01ca5f-2534-4ec2-93b2-aae83e910013', null,null, null, 'by_friend', 1),
			('From a Facility', false, 'ba01ca5f-2534-4ec2-93b2-aae83e910013', null, null, null, 'from_facility', 2),
			('Facebook', false, 'ba01ca5f-2534-4ec2-93b2-aae83e910013', null, null, null, 'facebook', 3),
			('Google', false, 'ba01ca5f-2534-4ec2-93b2-aae83e910013', null, null, null, 'google', 4 ),
			('Instagram', false, 'ba01ca5f-2534-4ec2-93b2-aae83e910013', null, null, null, 'instagram', 5),
			('Are you legally authorized to work in the United States?', false, '1403ec44-882f-4177-8bc1-b02b7cacfcdb', null, null, null, 'authorized_to_work', 1),
			('Have you ever been convicted of a crime or pled guilty or no contest (nolo contendere) to any criminal charge?', true, '1403ec44-882f-4177-8bc1-b02b7cacfcdb', 'Please explain','Please explain. A criminal conviction will not necessarily be a bar to employment.', null, 'has_criminal_charges', 2),
			('Are you aware of any circumstances, which may result in a malpractice claim or suit being made or brought against you?', true, '1403ec44-882f-4177-8bc1-b02b7cacfcdb', 'Please explain','Please explain. Any potential claims or suits will not necessarily be a bar to employment.', null, 'circumstances', 3),
			('Has any malpractice claim or suit ever been brought against you?', true, '1403ec44-882f-4177-8bc1-b02b7cacfcdb', 'Please explain','Please explain. Any claims or suits will not necessarily be a bar to employment.', null, ' malpractice_claim', 4),
			('Have you ever been the subject of a reprimand or disciplinary action or refused employment or admission to a professional society or had professional privileges (in any jurisdiction in which you are licensed) investigated, suspended or revoked by any court or administrative agency or ever been the subject of any ethics investigation at local, state or national level?', true, '1403ec44-882f-4177-8bc1-b02b7cacfcdb', 'Please explain','Please explain. Any reprimands or disciplinary actions will not necessarily be a bar to employment.', null, 'ethics_investigation', 5),
			('Has your professional license or certification ever been investigated or suspended?', false, '1403ec44-882f-4177-8bc1-b02b7cacfcdb', null, null, null,'professional_license_investigated', 6),
			('Post Statement', true, '221e5748-77eb-4f77-b652-2f3a88b049db', 'Post Statement', null, 'text', 'post_statement', 1);
	`);
    await queryRunner.query(`
		INSERT INTO provider_profile_setting (id, name, key) values
			('9afc57c1-a040-403e-9495-555004197dc8', 'Staff Profile', 'provider_profile');
	`);
    await queryRunner.query(`
		INSERT INTO provider_profile_setting_section (id, provider_profile_setting_id, name, key, "order") values
			('f9a791a0-3829-404f-8ff8-f121ed5c0acd', '9afc57c1-a040-403e-9495-555004197dc8', 'Personal Details', 'personal_details', 1),
			('42ed2f91-f51a-492b-81ff-727af24e1011', '9afc57c1-a040-403e-9495-555004197dc8', 'Address Details', 'address_details', 2);
	`);
    await queryRunner.query(`
		INSERT INTO provider_profile_setting_sub_section (id, provider_profile_setting_section_id, name, is_required, placeholder, key, type, "order") values 
			('e1ed283a-5174-48db-b20f-927fdc70fc56', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'First Name', true, 'First Name', 'first_name', 'text', 1),
			('b1ea0050-8b36-40f6-b44b-4bdf047ee81e', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'Middle Name', true, 'Middle Name', 'middle_name', 'text', 2),
			('003a7e67-4abf-4d8a-ba23-0dcae7468e0c', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'Last Name', true, 'Last Name', 'last_name', 'text', 3),
			('93af84e7-8fb4-4ddc-83df-04dbbfe81ed8', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'Nick Name', true, 'Nick Name', 'nick_name', 'text', 4),
			('44b06ffc-df38-42a2-9148-9082a128bb0f', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'Birth Date', true, 'Birth Date', 'birth_date', 'date', 5),
			('b4ba5166-317f-4f94-be16-8eb0a5415282', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'Gender', true, 'Gender', 'gender', 'dropdown', 6),
			('832707d5-f665-4d28-94b1-a78e24be5b0b', 'f9a791a0-3829-404f-8ff8-f121ed5c0acd', 'Brief About You', true, 'Brief About You', 'bio', 'textarea', 7),
			('d57bc696-fe50-4825-842b-f51d455fb1d0', '42ed2f91-f51a-492b-81ff-727af24e1011', 'Street Address', true, 'Street Address', 'street', 'street', 1),
			('647024b0-ca0b-45b3-925b-ea2b02ac56b9', '42ed2f91-f51a-492b-81ff-727af24e1011', 'Apt, Suite, etc', true, 'Apt, Suite, etc', 'apartment', 'text', 2),
			('efb96ad0-8e57-496d-9236-c294ccf1005c', '42ed2f91-f51a-492b-81ff-727af24e1011', 'Town', true, 'Town', 'city', 'city', 3),
			('107493eb-1ca6-4fe1-8363-3f05f966efba', '42ed2f91-f51a-492b-81ff-727af24e1011', 'Select State', true, 'Select State', 'state', 'text', 4),
			('2f25e771-20f4-4ac5-bcf0-c7a1fe3144bd', '42ed2f91-f51a-492b-81ff-727af24e1011', 'Country', true, 'Country', 'country', 'text', 5),
			('4ac243dc-03f0-4f1e-87a3-4de4bd70cb2d', '42ed2f91-f51a-492b-81ff-727af24e1011', 'Postal Code', true, 'Postal Code', 'zip_code', 'text', 5);
	`);

    await queryRunner.query(`
		CREATE OR REPLACE FUNCTION public.after_provider_create()
			RETURNS trigger
			LANGUAGE 'plpgsql'
			COST 100
			VOLATILE NOT LEAKPROOF
		AS $BODY$
		BEGIN
		INSERT INTO provider_analytics (
			id,
			provider_id,
			created_at,
			updated_at
		)
		VALUES (
			uuid_generate_v4(),
			NEW.id,
			NOW(),
			NOW()
		);
		RETURN NEW;
		END;
		$BODY$;

		ALTER FUNCTION public.after_provider_create()
			OWNER TO postgres;
	`);
    await queryRunner.query(`
		CREATE OR REPLACE TRIGGER after_provider_create
			AFTER INSERT
			ON public."provider"
			FOR EACH ROW
			EXECUTE FUNCTION public.after_provider_create();
	`);
    await queryRunner.query(`
		CREATE OR REPLACE FUNCTION public.update_provider_analytics()
			RETURNS trigger
			LANGUAGE 'plpgsql'
			COST 100
			VOLATILE NOT LEAKPROOF
		AS $BODY$
		DECLARE
			total_shift_count INTEGER;
			shift_attended_count INTEGER;
			on_time_check_in_count INTEGER;
			on_time_rate_percentage NUMERIC;
			late_shift_percentage NUMERIC;
			late_shift_count INTEGER;
		BEGIN
			IF NEW.provider_id IS NOT NULL THEN

				SELECT
					COUNT(s.id)::INTEGER INTO total_shift_count
				FROM
					shift s
				WHERE
					s.provider_id = new.provider_id;

				SELECT
					COUNT(s.id)::INTEGER INTO shift_attended_count
				FROM
					shift s
				WHERE
					s.provider_id = new.provider_id
					AND s.status IN ('completed', 'un_submitted');

				SELECT
					(COUNT(s.id) FILTER (
						WHERE
							s.clock_in BETWEEN s.start_time - INTERVAL '10 minutes' AND s.start_time  + INTERVAL '10 minutes'
					)) INTO on_time_check_in_count
				FROM
					shift s
				WHERE
					s.provider_id = new.provider_id
					AND s.status IN ('completed', 'un_submitted');

				SELECT
					CASE
						WHEN COUNT(s.id) = 0 THEN 0
						ELSE (
							COUNT(s.id) FILTER (
								WHERE
									s.clock_in > s.start_time  + INTERVAL '10 minutes'
							)::FLOAT / COUNT(s.id)::FLOAT
						) * 100
					END::NUMERIC INTO late_shift_percentage
				FROM
					shift s
				WHERE
					s.provider_id = new.provider_id
					AND s.status IN ('completed', 'un_submitted');

				SELECT
					COUNT(s.id) FILTER (
						WHERE
							s.clock_in > s.start_time  + INTERVAL '10 minutes'
					)::INTEGER
					INTO late_shift_count
				FROM
					shift s
				WHERE
					s.provider_id = new.provider_id
					AND s.status IN ('completed', 'un_submitted');

				SELECT
					CASE
						WHEN COUNT(s.id) = 0 THEN 0
						ELSE (
							COUNT(s.id) FILTER (
								WHERE
									(s.clock_in_date + s.clock_in) > (s.start_date + s.start_time + INTERVAL '10 minutes')
							)::FLOAT / COUNT(s.id)::FLOAT
						) * 100
					END::NUMERIC INTO on_time_rate_percentage
				FROM
					shift s
				WHERE
					s.provider_id = new.provider_id
					AND s.status IN ('completed', 'un_submitted');

				-- Update total_shift
				UPDATE provider_analytics
				SET total_shift = total_shift_count,
					shift_attended = shift_attended_count,
					on_time_check_in = on_time_check_in_count,
					on_time_rate = ROUND(on_time_rate_percentage,2)::DOUBLE PRECISION,
					late_shift_ratio = ROUND(late_shift_percentage,2)::DOUBLE PRECISION,
					late_shift = late_shift_count,
					attendance_score = (
						ROUND(
							(CASE
								WHEN total_shift_count = 0 THEN 0
								ELSE (shift_attended_count::FLOAT / total_shift_count::FLOAT) * 100
							END
							)::NUMERIC
						, 2)
					)::DOUBLE PRECISION
				WHERE provider_id = NEW.provider_id;

				INSERT INTO provider_late_shift (shift_id, provider_id) VALUES (NEW.id, NEW.provider_id) ON CONFLICT (shift_id, provider_id) DO NOTHING;
			END IF;

			RETURN NEW;
		END;
		$BODY$;
	`);
    await queryRunner.query(`
		CREATE TRIGGER update_provider_analytics_trigger
		AFTER INSERT OR UPDATE ON shift
		FOR EACH ROW
		EXECUTE FUNCTION update_provider_analytics();
	`);
    await queryRunner.query(
      `INSERT INTO auto_scheduling_setting (provider_radius) VALUES (10);`,
    );
    await queryRunner.query(
      `INSERT INTO competency_test_global_setting (expires_in, expiration_duration_type, total_attempts, reassignment_duration, reassignment_duration_type) VALUES (1, 'year', 2, 365, 'day');`,
    );
    await queryRunner.query(
      `INSERT INTO "facility_general_setting"
              (type, label, is_active) VALUES
              ('schedule', 'show_provider_profile_details', true),
              ('schedule', 'show_provider_schedule', true),
              ('schedule', 'show_provider_credentials', true),
              ('schedule', 'can_evaluate_the_provider', true),
              ('schedule', 'show_cancelled_shift_in_the_calender', true),
              ('schedule', 'show_clients_staffing_notes', true),
              ('schedule', 'display_cancellation_notes', true),
              ('report', 'show_schedule_report', true),
              ('report', 'show_provider_work_history_report', true),
              ('report', 'show_unpaid_invoice_report', true),
              ('report', 'show_payment_history_report', true),
              ('report', 'show_payroll_based_journal', true),
              ('chat', 'will_be_able_to_chat_with_All_providers', true),
              ('time_attendance', 'can_approve_the_timecard', true),
              ('billing', 'can_request_more_credits', true);`,
    );
    await queryRunner.query(
      `INSERT INTO "status_setting"
							(created_at, name, background_color, text_color, description, status, status_for, is_default) VALUES
							(NOW(), 'Active', '#F4FBF7', '#28714D', 'Staff that are active in the portal', 'active', 'provider', true),
							(NOW() + INTERVAL '1 millisecond', 'Inactive', '#F7F7F8', '#7D7E82', 'Staff that are inactive in the portal', 'active', 'provider', true),
							(NOW() + INTERVAL '2 millisecond', 'Applicant', '#F2F0FE', '#220EB1', 'New registered Staff', 'active', 'provider', true),
							(NOW() + INTERVAL '3 millisecond', 'On Hold', '#FFF8F0', '#FB8600', 'Staff that are on hold', 'active', 'provider', true),
							(NOW() + INTERVAL '4 millisecond', 'Terminated', '#FDF4F5', '#D1293D', 'Staff that are terminated', 'active', 'provider', true),
							(NOW() + INTERVAL '5 millisecond', 'Active', '#F4FBF7', '#28714D', 'Clients that are active in the portal', 'active', 'facility', true),
							(NOW() + INTERVAL '6 millisecond', 'Inactive', '#F7F7F8', '#7D7E82', 'Clients that are inactive in the portal', 'active', 'facility', true),
							(NOW() + INTERVAL '7 millisecond', 'Prospect', '#F2F0FE', '#220EB1', 'New registered Clients', 'active', 'facility', true);`,
    );
    await queryRunner.query(
      `INSERT INTO "flag_setting"
              (name, color, description, status, is_default) VALUES
              ('Preferred', '#359766', 'Staff that are good in work and can be worked with in future marked as preferred.', 'active', true),
              ('DNR', '#D1293D', 'Staff that are marked (DNR) Do not return', 'active', true);`,
    );
    await queryRunner.query(
      `INSERT INTO "time_entry_approval"
              ("key", "name", "value", "order") VALUES
                ('Maximum numbers of breaks a provider can take', 'total_breaks', 10, 1);`,
    );
    await queryRunner.query(
      `INSERT INTO "schedule_request_setting"
              ("setting", "value", "order") VALUES
                ('show_cancelled_shifts_in_calendar', 'active', 1),
                ('display_cancellation_notes', 'active', 2),
                ('can_chat_with_facility_after_scheduled_for_a_shift', 'active', 3);`,
    );
    await queryRunner.query(
      `INSERT INTO
			"facility_profile_setting"
			("name", "is_required", "placeholder", "key", "type", "section", "order") VALUES
			('Facility Name', true, 'Facility Name', 'name', 'text', 'contact_details', 1),
			('Email', true, 'Email', 'email', 'email', 'contact_details', 2),
			('Phone Number', true, 'Phone Number', 'mobile_no', 'mobile', 'contact_details', 3),
			('Street Address', true, 'Street Address', 'street_address', 'text', 'contact_details', 4),
			('Zip/Postal Code', true, 'Zip/Postal Code', 'zip_code', 'text', 'contact_details', 5),
			('Town/City', true, 'Town/City', 'city', 'city', 'contact_details', 6),
			('State', true, 'State', 'state', 'state', 'contact_details', 7),
			('First Shift', true, 'First Shift', 'first_shift', 'text', 'contact_details', 8),
			('Orientation', false, 'Orientation', 'orientation', 'text', 'general_instructions', 9),
			('Shift Description', false, 'Shift Description', 'shift_description', 'text', 'general_instructions', 10),
			('Lunch/Breaks', false, 'Lunch/Breaks', 'breaks_instruction', 'text', 'general_instructions', 11),
			('Dress Code', false, 'Dress Code', 'dress_code', 'text', 'general_instructions', 12),
			('Parking Instruction', false, 'Parking Instruction', 'parking_instruction', 'text', 'general_instructions', 13),
			('Door Locks', false, 'Door Locks', 'doors_locks', 'text', 'general_instructions', 14),
			('Timekeeping', false, 'Timekeeping', 'timekeeping', 'text', 'general_instructions', 15),
			('Number of Beds', false, 'Number of Beds', 'total_beds', 'number', 'general_instructions', 16),
			('Facility Type', false, 'Facility Type', 'facility_type', 'text', 'infrastructure', 17),
			('Floor Details', false, 'Floor Details', 'floor_details', 'text', 'infrastructure', 18);
			`,
    );
    await queryRunner.query(`
       CREATE OR REPLACE FUNCTION get_shift_time_code(
            shift_start_time TIME WITHOUT TIME ZONE, 
            shift_end_time TIME WITHOUT TIME ZONE, 
            shift_facility_id UUID
        ) RETURNS TEXT AS $$
        DECLARE
            duration_minutes INTEGER;
            start_minutes INTEGER;
            end_minutes INTEGER;
            matched_time_code TEXT;
        BEGIN
            -- Calculate the total duration of the shift in minutes
            start_minutes := EXTRACT(HOUR FROM shift_start_time) * 60 + EXTRACT(MINUTE FROM shift_start_time);
            end_minutes := EXTRACT(HOUR FROM shift_end_time) * 60 + EXTRACT(MINUTE FROM shift_end_time);
            
            -- Handle overnight shifts
            IF shift_end_time <= shift_start_time THEN
                duration_minutes := ((24 * 60) - start_minutes) + end_minutes;
            ELSE
                duration_minutes := end_minutes - start_minutes;
            END IF;
            
            -- Special handling for common 12-hour shift patterns that might calculate as 8 hours
            -- Check if this matches a known 12-hour pattern in the facility settings
            IF duration_minutes > 480 THEN  -- 8 hours calculated, but might be 12-hour shift
                -- Check if there's a facility or default record that treats this as a 12+ hour shift
                SELECT fss.time_code INTO matched_time_code
                FROM facility_shift_setting fss
                WHERE ((fss.facility_id = shift_facility_id AND fss.is_default = false) OR fss.is_default = true)
                AND fss.status = 'active'
                AND fss.start_time = shift_start_time
                AND fss.end_time = shift_end_time
                AND fss.time_code IN ('A', 'P')  -- Look for 12+ hour codes including Night
                ORDER BY 
                    CASE WHEN fss.is_default = false THEN 1 ELSE 2 END  -- Prefer facility-specific
                LIMIT 1;
                
                -- If we found a match, treat it as a 12+ hour shift
                IF matched_time_code IS NOT NULL THEN
                    duration_minutes := 720;  -- Treat as 12+ hour shift
                END IF;
            END IF;

            -- Initialize matched_time_code to NULL
            matched_time_code := NULL;
            
            -- For 12-hour or longer shifts (>= 720 minutes OR close to 12 hours)
            -- Include shifts that are close to 12 hours (11+ hours) to account for slight variations
            IF duration_minutes >= 660 THEN  -- 11 hours or more
                -- Look for facility-specific records first (is_default = false)
                SELECT fss.time_code INTO matched_time_code
                FROM facility_shift_setting fss
                WHERE fss.facility_id = shift_facility_id
                AND fss.is_default = false
                AND fss.status = 'active'
                AND (
                    -- Normal time range (start_time <= end_time)
                    (fss.start_time <= fss.end_time AND shift_start_time >= fss.start_time AND shift_start_time < fss.end_time)
                    OR 
                    -- Overnight time range (start_time > end_time)
                    (fss.start_time > fss.end_time AND (shift_start_time >= fss.start_time OR shift_start_time < fss.end_time))
                )
                ORDER BY 
                    -- Prioritize records that match the shift duration better
                    CASE 
                        WHEN fss.time_code IN ('A', 'P') THEN 1  -- 12+ hour shifts get priority for A/P codes
                        ELSE 2 
                    END,
                    fss.start_time
                LIMIT 1;
                
                -- If no facility-specific match, fallback to global default records
                IF matched_time_code IS NULL THEN
                    SELECT fss.time_code INTO matched_time_code
                    FROM facility_shift_setting fss
                    WHERE fss.is_default = true
                    AND fss.status = 'active'
                    AND (
                        -- Normal time range (start_time <= end_time)
                        (fss.start_time <= fss.end_time AND shift_start_time >= fss.start_time AND shift_start_time < fss.end_time)
                        OR 
                        -- Overnight time range (start_time > end_time)
                        (fss.start_time > fss.end_time AND (shift_start_time >= fss.start_time OR shift_start_time < fss.end_time))
                    )
                    ORDER BY 
                        CASE 
                            WHEN fss.time_code IN ('A', 'P') THEN 1  -- Prefer A/P for long shifts
                            ELSE 2 
                        END,
                        fss.start_time
                    LIMIT 1;
                END IF;
            
            -- For shorter shifts (less than 8 hours)
            ELSE
                -- Look for facility-specific records first
                SELECT fss.time_code INTO matched_time_code
                FROM facility_shift_setting fss
                WHERE fss.facility_id = shift_facility_id
                AND fss.is_default = false
                AND fss.status = 'active'
                AND (
                    -- Normal time range (start_time <= end_time)
                    (fss.start_time <= fss.end_time AND shift_start_time >= fss.start_time AND shift_start_time < fss.end_time)
                    OR 
                    -- Overnight time range (start_time > end_time)
                    (fss.start_time > fss.end_time AND (shift_start_time >= fss.start_time OR shift_start_time < fss.end_time))
                )
                ORDER BY 
                    -- Prioritize more specific time ranges (shorter duration ranges)
                    (CASE 
                        WHEN fss.start_time <= fss.end_time THEN 
                            EXTRACT(EPOCH FROM fss.end_time - fss.start_time) / 60
                        ELSE 
                            (EXTRACT(EPOCH FROM TIME '24:00:00' - fss.start_time) + EXTRACT(EPOCH FROM fss.end_time)) / 60
                    END),
                    fss.start_time
                LIMIT 1;
                
                -- If no facility-specific match, fallback to global defaults
                IF matched_time_code IS NULL THEN
                    SELECT fss.time_code INTO matched_time_code
                    FROM facility_shift_setting fss
                    WHERE fss.is_default = true
                    AND fss.status = 'active'
                    AND (
                        -- Normal time range (start_time <= end_time)
                        (fss.start_time <= fss.end_time AND shift_start_time >= fss.start_time AND shift_start_time < fss.end_time)
                        OR 
                        -- Overnight time range (start_time > end_time)
                        (fss.start_time > fss.end_time AND (shift_start_time >= fss.start_time OR shift_start_time < fss.end_time))
                    )
                    ORDER BY 
                        -- Prioritize more specific/shorter time ranges
                        (CASE 
                            WHEN fss.start_time <= fss.end_time THEN 
                                EXTRACT(EPOCH FROM fss.end_time - fss.start_time) / 60
                            ELSE 
                                (EXTRACT(EPOCH FROM TIME '24:00:00' - fss.start_time) + EXTRACT(EPOCH FROM fss.end_time)) / 60
                        END),
                        fss.start_time
                    LIMIT 1;
                END IF;
            END IF;
            
            -- Return the matched time code
            RETURN matched_time_code;
        END;
        $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(
      `CREATE OR REPLACE VIEW view_calendar_shift_raw AS
					SELECT
					s.id AS shift_id_uuid,
					s.shift_id,
					s.start_date,
					TO_CHAR(s.start_time, 'HH12:MI AM') || ' - ' || TO_CHAR(s.end_time, 'HH12:MI AM') AS shift_duration,
					get_shift_time_code(s.start_time, s.end_time, s.facility_id) AS shift_time_code,
					s.start_time,
					s.end_time,
					s.status,
					s.facility_id,
					-- Provider
					p.id AS provider_id,
					p.first_name,
					p.last_name,
					p.base_url,
					p.profile_image,
					-- Certificate
					c.id AS certificate_id,
					c.name AS certificate_name,
					c.abbreviation AS certificate_abbreviation,
					-- Speciality
					sp.id AS speciality_id,
					sp.name AS speciality_name,
					sp.abbreviation AS speciality_abbreviation,
					-- Counts
					(
							SELECT COUNT(*) FROM shift_request sr
							WHERE sr.shift_id = s.id AND sr.status NOT IN ('rejected', 'assigned') AND sr.deleted_at IS NULL
					) AS request_count,
					(
							SELECT COUNT(*) FROM shift_invitation si
							WHERE si.shift_id = s.id AND si.status NOT IN ('rejected', 'withdrawn', 'accepted') AND si.deleted_at IS NULL
					) AS invite_count
					FROM shift s
					LEFT JOIN provider p ON p.id = s.provider_id
					LEFT JOIN certificate c ON c.id = s.certificate_id
					LEFT JOIN speciality sp ON sp.id = s.speciality_id
					WHERE s.deleted_at IS NULL;`,
    );
    await queryRunner.query(`
		CREATE OR REPLACE FUNCTION public.get_calendar_shift_data(
			p_facility uuid,
			p_startDate date,
			p_endDate date
		)
		RETURNS TABLE(
			shift_duration text,
			shift_time_code text,
			start_time time without time zone,
			job_type json
		)
		LANGUAGE 'plpgsql'
		COST 100
		VOLATILE PARALLEL UNSAFE
		AS $BODY$
		BEGIN
			RETURN QUERY
				SELECT
					job_group.shift_duration,
					job_group.shift_time_code,
					job_group.start_time,
					json_agg(
						json_build_object(
							'name', job_group.certificate_abbreviation,
							'shifts', job_group.shifts
						) ORDER BY job_group.certificate_abbreviation
					) AS job_type
				FROM (
					SELECT
						inner_group.shift_duration,
						inner_group.shift_time_code,
						inner_group.certificate_abbreviation,
						MIN(inner_group.start_time) as start_time,
						json_agg(
							json_build_object(
								'id', inner_group.shift_id_uuid,
								'shift_id', inner_group.shift_id,
								'start_time', inner_group.start_time,
								'end_time', inner_group.end_time,
								'date', inner_group.start_date,
								'shift_status',
									(CASE
									WHEN inner_group.status IN ('requested', 'auto_scheduling', 'invite_sent', 'open', 'cancelled') THEN 'open'
									WHEN inner_group.status IN ('completed', 'scheduled', 'ongoing', 'un_submitted', 'running_late') THEN 'filled'
									WHEN inner_group.status = 'void' THEN 'void'
									ELSE inner_group.status::text
									END)::text,
								'provider_id', inner_group.provider_id,
								'first_name', inner_group.first_name,
								'last_name', inner_group.last_name,
								'base_url', inner_group.base_url,
								'profile_image', inner_group.profile_image,
								'certificate_id', inner_group.certificate_id,
								'certificate_name', inner_group.certificate_name,
								'certificate_abbreviation', inner_group.certificate_abbreviation,
								'speciality_id', inner_group.speciality_id,
								'speciality_name', inner_group.speciality_name,
								'speciality_abbreviation', inner_group.speciality_abbreviation,
								'request_count', inner_group.request_count,
								'invite_count', inner_group.invite_count
							)
							ORDER BY inner_group.start_time ASC
						) AS shifts
					FROM view_calendar_shift_raw inner_group
					WHERE inner_group.facility_id = p_facility
						AND inner_group.start_date BETWEEN p_startDate AND p_endDate
						AND inner_group.provider_id IS NOT NULL
					GROUP BY inner_group.shift_duration, inner_group.shift_time_code, inner_group.certificate_abbreviation
				) job_group
				GROUP BY job_group.shift_duration, job_group.shift_time_code, job_group.start_time
				ORDER BY job_group.start_time ASC;
		END;
		$BODY$;
		`);
    await queryRunner.query(`
		CREATE OR REPLACE VIEW view_credentials_category_with_documents AS
		SELECT
			cc.id AS category_id,
			cc.name AS category_name,
			c.id AS credential_id,
			c.created_at,
			c.name AS credential_name,
			c.expiry_required,
			c.issued_required,
			c.document_required,
			c.doc_number_required,
			c.is_essential,
			c.approval_required,
			c.auto_assign,
			c.licenses,
			c.state_id,
			c.credentials_category_id,
			c.deleted_at AS credential_deleted_at,
			cc.deleted_at AS category_deleted_at,
			c.credential_id AS parent_credential_id
		FROM
			credentials_category cc
			JOIN credentials c ON c.credentials_category_id = cc.id
	`);
    await queryRunner.query(`
		CREATE OR REPLACE VIEW view_credentials_category AS
			SELECT
			c.id AS credential_id,
			c.name AS credential_name,
			c.created_at,
			c.expiry_required,
			c.issued_required,
			c.document_required,
			c.doc_number_required,
			c.approval_required,
			c.is_essential,
			c.licenses,
			c.credentials_category_id,
			cc.id AS category_id,
			cc.name AS category_name
			FROM
			credentials c
			JOIN credentials_category cc ON cc.id = c.credentials_category_id
			WHERE
			c.deleted_at IS NULL
			AND cc.deleted_at IS NULL
			AND c.is_essential = FALSE
			AND c.credential_id IS NULL;
	`);
    await queryRunner.query(
      `CREATE OR REPLACE VIEW view_skill_checklist_response AS
              SELECT
                  scr.id AS id,
                  scr.name AS name,
                  scr.provider_id AS provider_id,
                  (
                      SELECT
                          JSON_AGG(
                              JSON_BUILD_OBJECT(
                                  'id', sca.id,
                                  'topic_name', sca.module,
                                  'section_progress',
                                  ROUND(
                                      (
                                          SELECT COUNT(scqa.id)
                                          FROM skill_checklist_question_answer scqa
                                          LEFT JOIN skill_checklist_answer_module am ON am.id = scqa.skill_checklist_answer_module_id
                                          WHERE am.skill_checklist_answer_id = sca.id AND scqa.answer IS NOT NULL
                                      ) * 100.0 / NULLIF(
                                          (
                                              SELECT COUNT(scqa.id)
                                              FROM skill_checklist_question_answer scqa
                                              LEFT JOIN skill_checklist_answer_module am ON am.id = scqa.skill_checklist_answer_module_id
                                              WHERE am.skill_checklist_answer_id = sca.id
                                          ),
                                          0
                                      ), 2
                                  ),
                                  'sub_topic',
                                  (
                                      SELECT
                                          JSON_AGG(
                                              JSON_BUILD_OBJECT(
                                                  'id', scam_inner.id,
                                                  'topic_name', scam_inner.sub_module,
                                                  'questions',
                                                  (
                                                      SELECT
                                                          JSON_AGG(
                                                              JSON_BUILD_OBJECT(
                                                                  'id', q.id,
                                                                  'question', q.question,
                                                                  'answer', q.answer
                                                              )
                                                          )
                                                      FROM (
                                                          SELECT DISTINCT
                                                              scq.id,
                                                              scq.question,
                                                              scq.answer,
                                                              scq.order
                                                          FROM skill_checklist_question_answer scq
                                                          WHERE scq.skill_checklist_answer_module_id = scam_inner.id
                                                          ORDER BY scq.order ASC
                                                      ) q
                                                  )
                                              )
                                          )
                                      FROM skill_checklist_answer_module scam_inner
                                      WHERE scam_inner.skill_checklist_answer_id = sca.id
                                  )
                              )
                          )
                      FROM (
                          SELECT * 
                          FROM skill_checklist_answer
                          WHERE skill_checklist_response_id = scr.id
                          ORDER BY "order"
                      ) sca
                  ) AS skill_checklist_module
              FROM skill_checklist_response scr;`,
    );
    await queryRunner.query(`
			CREATE OR REPLACE VIEW public.shift_weekly_variation
      AS
      WITH params AS (
              SELECT CURRENT_DATE AS today,
                  (CURRENT_DATE - '7 days'::interval)::date AS cw_start,
                  CURRENT_DATE AS cw_end,
                  (CURRENT_DATE - '14 days'::interval)::date AS lw_start
              ), metrics AS (
              SELECT s.provider_id,
                  sum(
                      CASE
                          WHEN s.start_date >= p.cw_start AND s.start_date <= p.cw_end AND (s.status = ANY (ARRAY['completed'::shift_status_enum, 'un_submitted'::shift_status_enum])) THEN 1
                          ELSE 0
                      END)::double precision AS cw_completed,
                  sum(
                      CASE
                          WHEN s.start_date >= p.cw_start AND s.start_date <= p.cw_end AND s.status <> 'cancelled'::shift_status_enum THEN 1
                          ELSE 0
                      END)::double precision AS cw_total,
                  sum(
                      CASE
                          WHEN s.start_date >= p.lw_start AND s.start_date <= p.cw_start AND (s.status = ANY (ARRAY['completed'::shift_status_enum, 'un_submitted'::shift_status_enum])) THEN 1
                          ELSE 0
                      END)::double precision AS lw_completed,
                  sum(
                      CASE
                          WHEN s.start_date >= p.lw_start AND s.start_date <= p.cw_start AND s.status <> 'cancelled'::shift_status_enum THEN 1
                          ELSE 0
                      END)::double precision AS lw_total,
                  sum(
                      CASE
                          WHEN s.start_date >= p.cw_start AND s.start_date <= p.cw_end AND s.clock_in > (s.start_time + '00:10:00'::interval) THEN 1
                          ELSE 0
                      END)::double precision AS cw_late,
                  sum(
                      CASE
                          WHEN s.start_date >= p.lw_start AND s.start_date <= p.cw_start AND s.clock_in > (s.start_time + '00:10:00'::interval) THEN 1
                          ELSE 0
                      END)::double precision AS lw_late,
                  sum(
                      CASE
                          WHEN s.start_date >= p.cw_start AND s.start_date <= p.cw_end AND p.today >= s.end_date THEN 1
                          ELSE 0
                      END)::double precision AS cw_experience,
                  sum(
                      CASE
                          WHEN s.start_date >= p.lw_start AND s.start_date <= p.cw_start AND p.today >= s.end_date THEN 1
                          ELSE 0
                      END)::double precision AS lw_experience,
                  ( SELECT count(*) AS count
                        FROM void_shift vs
                        WHERE vs.created_at::date >= (CURRENT_DATE - '7 days'::interval)::date AND vs.created_at::date <= CURRENT_DATE AND vs.deleted_at IS NULL AND vs.provider_id = s.provider_id) AS cw_void,
                  ( SELECT count(*) AS count
                        FROM void_shift vs
                        WHERE vs.created_at::date >= (CURRENT_DATE - '14 days'::interval)::date AND vs.created_at::date <= (CURRENT_DATE - '7 days'::interval)::date AND vs.deleted_at IS NULL AND vs.provider_id = s.provider_id) AS lw_void
                FROM shift s
                  CROSS JOIN params p
                WHERE s.deleted_at IS NULL AND s.provider_id IS NOT NULL AND s.status <> 'cancelled'::shift_status_enum AND s.is_orientation = FALSE
                GROUP BY s.provider_id
              )
      SELECT provider_id AS id,
          10.0::double precision AS evaluation_rate_variation,
          COALESCE(
              CASE
                  WHEN (lw_total + lw_void::double precision) = 0::double precision OR lw_completed = 0::double precision THEN cw_completed / NULLIF(cw_total + cw_void::double precision, 0::double precision) * 100.0::double precision
                  ELSE (COALESCE(cw_completed / NULLIF(cw_total + cw_void::double precision, 0::double precision) * 100.0::double precision, 0::double precision) - lw_completed / NULLIF(lw_total + lw_void::double precision, 0::double precision) * 100.0::double precision) / NULLIF(lw_completed / NULLIF(lw_total + lw_void::double precision, 0::double precision) * 100.0::double precision, 0::double precision) * 100.0::double precision
              END, 0.0::double precision) AS show_rate_variation,
          COALESCE(
              CASE
                  WHEN lw_total = 0::double precision OR lw_late = 0::double precision THEN cw_late / NULLIF(cw_total, 0::double precision) * 100.0::double precision
                  ELSE (COALESCE(cw_late / NULLIF(cw_total, 0::double precision) * 100.0::double precision, 0::double precision) - lw_late / NULLIF(lw_total, 0::double precision) * 100.0::double precision) / NULLIF(lw_late / NULLIF(lw_total, 0::double precision) * 100.0::double precision, 0::double precision) * 100.0::double precision
              END, 0.0::double precision) AS late_variation,
          COALESCE(
              CASE
                  WHEN lw_experience = 0::double precision OR (lw_total + lw_void::double precision) = 0::double precision THEN cw_completed / NULLIF(cw_experience + cw_void::double precision, 0::double precision) * 100.0::double precision
                  ELSE (COALESCE(cw_completed / NULLIF(cw_experience + cw_void::double precision, 0::double precision) * 100.0::double precision, 0::double precision) - lw_completed / NULLIF(lw_experience + lw_void::double precision, 0::double precision) * 100.0::double precision) / NULLIF(lw_completed / NULLIF(lw_experience + lw_void::double precision, 0::double precision) * 100.0::double precision, 0::double precision) * 100.0::double precision
              END, 0.0::double precision) AS experience_variation
        FROM metrics;
      `);
    await queryRunner.query(
      `CREATE OR REPLACE VIEW public.cancellation_variation AS
          WITH
            params AS (
              SELECT
                CURRENT_DATE AS today,
                (CURRENT_DATE - '7 days'::INTERVAL)::date AS cw_start,
                CURRENT_DATE AS cw_end,
                (CURRENT_DATE - '14 days'::INTERVAL)::date AS lw_start,
                (CURRENT_DATE - '7 days'::INTERVAL)::date AS lw_end
            ),
          metrics AS (
            SELECT
              ps.provider_id,
              SUM(
                (
                  ps.created_at::date >= p.cw_start
                  AND ps.created_at::date <= p.cw_end
                )::INTEGER
              )::DOUBLE PRECISION AS cw_cancelled,
              (
                SELECT
                  COUNT(shift.id) AS count
                FROM
                  shift
                WHERE
                  shift.provider_id = ps.provider_id
                  AND shift.status <> 'cancelled'::shift_status_enum
                  AND shift.start_date >= (CURRENT_DATE - '7 days'::INTERVAL)
                  AND shift.start_date <= CURRENT_DATE
                  AND shift.is_orientation = false
              ) AS cw_total,
              SUM(
                (
                  ps.created_at::date >= p.lw_start
                  AND ps.created_at::date <= p.lw_end
                )::INTEGER
              )::DOUBLE PRECISION AS lw_cancelled,
              (
                SELECT
                  COUNT(shift.id) AS count
                FROM
                  shift
                WHERE
                  shift.provider_id = ps.provider_id
                  AND shift.status <> 'cancelled'::shift_status_enum
                  AND shift.start_date >= (CURRENT_DATE - '14 days'::INTERVAL)
                  AND shift.start_date <= (CURRENT_DATE - '7 days'::INTERVAL)
                  AND shift.is_orientation = false
              ) AS lw_total
            FROM
              shift s
              JOIN provider_cancelled_shift ps ON ps.shift_id = s.id
              AND ps.created_at < (
                s.start_date + s.start_time + '24:00:00'::INTERVAL
              )
              CROSS JOIN params p
            WHERE
              s.deleted_at IS NULL
              AND s.status <> 'cancelled'::shift_status_enum
              AND s.is_orientation = false
            GROUP BY
              ps.provider_id
          ),
          rates AS (
            SELECT
              metrics.provider_id,
              COALESCE(
                metrics.cw_cancelled / NULLIF(
                  metrics.cw_total::DOUBLE PRECISION + metrics.cw_cancelled,
                  0::DOUBLE PRECISION
                ),
                0::DOUBLE PRECISION
              ) AS cw_rate,
              COALESCE(
                metrics.lw_cancelled / NULLIF(
                  metrics.lw_total::DOUBLE PRECISION + metrics.lw_cancelled,
                  0::DOUBLE PRECISION
                ),
                0::DOUBLE PRECISION
              ) AS lw_rate
            FROM
              metrics
          )
        SELECT
          provider_id AS id,
          CASE
            WHEN lw_rate = 0::DOUBLE PRECISION THEN ROUND(cw_rate::NUMERIC * 100.0, 2)::DOUBLE PRECISION
            ELSE ROUND(
              ((cw_rate - lw_rate) / lw_rate)::NUMERIC * 100.0,
              2
            )::DOUBLE PRECISION
          END AS cancellation_variation
        FROM
          rates;`,
    );
    await queryRunner.query(`
			CREATE OR REPLACE VIEW public.preferred_rate_variation
			AS
			WITH total_facilities AS (
				SELECT facility_provider.provider_id,
						count(*) AS total
					FROM facility_provider
					WHERE facility_provider.deleted_at IS NULL
					GROUP BY facility_provider.provider_id
				)
			SELECT
				fp.provider_id,
				CASE
						WHEN count(DISTINCT fp.facility_id) FILTER (WHERE si.invited_on::date >= (CURRENT_DATE - '14 days'::interval) AND si.invited_on::date <= (CURRENT_DATE - '7 days'::interval)) = 0 THEN round(count(DISTINCT fp.facility_id) FILTER (WHERE si.invited_on::date >= (CURRENT_DATE - '7 days'::interval) AND si.invited_on::date <= CURRENT_DATE)::numeric / tf.total::numeric * 100.0, 2)::double precision
						ELSE round((count(DISTINCT fp.facility_id) FILTER (WHERE si.invited_on::date >= (CURRENT_DATE - '7 days'::interval) AND si.invited_on::date <= CURRENT_DATE)::numeric - count(DISTINCT fp.facility_id) FILTER (WHERE si.invited_on::date >= (CURRENT_DATE - '14 days'::interval) AND si.invited_on::date <= (CURRENT_DATE - '7 days'::interval))::numeric) / NULLIF(count(DISTINCT fp.facility_id) FILTER (WHERE si.invited_on::date >= (CURRENT_DATE - '14 days'::interval) AND si.invited_on::date <= (CURRENT_DATE - '7 days'::interval))::numeric, 0::numeric) * 100.0, 2)::double precision
				END AS preferred_rate_variation
			FROM shift s
				JOIN shift_invitation si ON si.shift_id = s.id AND si.deleted_at IS NULL AND si.shift_status = 'invite_sent'::shift_invitation_shift_status_enum
				JOIN facility_provider fp ON fp.provider_id = si.provider_id AND fp.deleted_at IS NULL AND fp.facility_id = s.facility_id
				JOIN total_facilities tf ON tf.provider_id = fp.provider_id
			WHERE s.deleted_at IS NULL AND s.is_orientation = false
			GROUP BY fp.provider_id, tf.total
			HAVING count(si.id) > 5;
		`);

    await queryRunner.query(
      `INSERT INTO "reference_form_global_setting"
			(TOTAL_REMINDER_ATTEMPTS, REMINDER_INTERVAL) VALUES
			(3, 1);
			`,
    );

    await queryRunner.query(`
			INSERT INTO
				FACILITY_SHIFT_SETTING (
					ID,
					CREATED_AT,
					UPDATED_AT,
					STATUS,
					NAME,
					IS_DEFAULT,
					START_TIME,
					END_TIME,
					TIME_CODE,
					SHIFT_TIME_ID,
					FACILITY_ID
				)
			VALUES
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'active',
					'07:00 AM - 03:00 PM',
					TRUE,
					'07:00:00',
					'15:00:00',
					'D',
					GENERATE_UNIQUE_SHIFT_TIME_ID (),
					NULL
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'active',
					'03:00 PM - 11:00 PM',
					TRUE,
					'15:00:00',
					'23:00:00',
					'E',
					GENERATE_UNIQUE_SHIFT_TIME_ID (),
					NULL
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'active',
					'11:00 PM - 07:00 AM',
					TRUE,
					'23:00:00',
					'07:00:00',
					'N',
					GENERATE_UNIQUE_SHIFT_TIME_ID (),
					NULL
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'active',
					'07:00 AM - 07:00 PM',
					TRUE,
					'07:00:00',
					'19:00:00',
					'A',
					GENERATE_UNIQUE_SHIFT_TIME_ID (),
					NULL
				),
				(
					GEN_RANDOM_UUID (),
					NOW(),
					NOW(),
					'active',
					'07:00 PM - 07:00 AM',
					TRUE,
					'19:00:00',
					'07:00:00',
					'P',
					GENERATE_UNIQUE_SHIFT_TIME_ID (),
					NULL
				);
	`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM state;');
    await queryRunner.query('DELETE FROM country;');
    await queryRunner.query(`DELETE FROM facility_permission`);
    await queryRunner.query('DELETE FROM admin;');
    await queryRunner.query('DELETE FROM role_section_permission;');
    await queryRunner.query('DELETE FROM role;');
    await queryRunner.query(`DELETE FROM sub_section;`);
    await queryRunner.query('DELETE FROM section;');
    await queryRunner.query('DELETE FROM permission;');
    await queryRunner.query(`DELETE FROM provider_general_setting`);
    await queryRunner.query(`DELETE FROM provider_general_setting_section`);
    await queryRunner.query(`DELETE FROM provider_general_setting_sub_section`);
    await queryRunner.query(`DELETE FROM provider_profile_setting`);
    await queryRunner.query(`DELETE FROM provider_profile_setting_section`);
    await queryRunner.query(`DELETE FROM provider_profile_setting_sub_section`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS after_provider_create ON public."provider";`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.after_provider_create();`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_provider_analytics_trigger ON public.shift;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.update_provider_analytics();`,
    );
    await queryRunner.query('DELETE FROM auto_scheduling_setting;');
    await queryRunner.query(`DELETE FROM competency_test_global_setting`);
    await queryRunner.query(`DELETE FROM "facility_general_setting";`);
    await queryRunner.query(`DELETE FROM "status_setting";`);
    await queryRunner.query(`DELETE FROM "flag_setting";`);
    await queryRunner.query(`DELETE FROM "time_entry_approval";`);
    await queryRunner.query(`DELETE FROM "schedule_request_setting"`);
    await queryRunner.query(`DELETE FROM "facility_profile_setting"`);
    await queryRunner.query(`
			DROP FUNCTION IF EXISTS get_calendar_shift_data(UUID, DATE, DATE);
			`);
    await queryRunner.query(`DROP VIEW view_calendar_shift_raw;`);
    await queryRunner.query(
      `DROP VIEW IF EXISTS view_credentials_category_with_documents;`,
    );
    await queryRunner.query(`
        DROP VIEW IF EXISTS view_credentials_category;
    `);
    await queryRunner.query(
      `DROP VIEW IF EXISTS view_skill_checklist_response`,
    );
    await queryRunner.query(`DROP VIEW IF EXISTS cancellation_variation`);
    await queryRunner.query(`DROP VIEW IF EXISTS shift_weekly_variation`);
    await queryRunner.query(`DROP VIEW IF EXISTS preferred_rate_variation`);
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS get_shift_time_code (UUID, DATE, DATE);
    `);
  }
}

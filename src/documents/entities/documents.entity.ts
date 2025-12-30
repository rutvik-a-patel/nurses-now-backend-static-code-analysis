import { Facility } from '@/facility/entities/facility.entity';
import { OrientationRejectReason } from '@/orientation-reject-reason/entities/orientation-reject-reason.entity';
import { Provider } from '@/provider/entities/provider.entity';
import {
  CREDENTIAL_STATUS,
  DEFAULT_STATUS,
  TABLE,
} from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AdminDocument } from '@/admin-document/entities/admin-document.entity';

@Entity()
export class Documents extends BaseEntity {
  @Column({ type: 'character varying', nullable: true })
  name: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  base_url: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  filename: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  original_filename: string;

  @Column({ type: 'date', nullable: true })
  issue_date: Date;

  @Column({ type: 'date', nullable: true })
  completed_date: Date;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  verified_by_id: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  verified_by_type: string;

  @Column({ type: 'timestamptz', nullable: true })
  credential_rejected_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  credential_approved_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  uploaded_at: Date; // for orientation documents uploaded

  @Column({
    type: 'enum',
    enum: CREDENTIAL_STATUS,
    default: CREDENTIAL_STATUS.pending,
  })
  is_verified: CREDENTIAL_STATUS;

  @Index()
  @ManyToOne(() => Facility, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @Index()
  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'text', nullable: true })
  document_notes: string;

  @ManyToOne(
    () => OrientationRejectReason,
    (reason) => reason.provider_orientation,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'reason_id' })
  @Index()
  reason: OrientationRejectReason;

  @Column({ type: 'text', nullable: true })
  reason_description: string;

  @Index()
  @Column({ type: 'character varying', nullable: true })
  uploaded_by_id: string;

  @Index()
  @Column({ type: 'enum', enum: TABLE, nullable: true })
  uploaded_by_type: TABLE;

  @Index()
  @ManyToOne(() => AdminDocument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_document_category_id' })
  admin_document_category: AdminDocument;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;
}

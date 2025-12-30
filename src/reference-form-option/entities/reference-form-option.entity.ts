import { ReferenceFormDesign } from '@/reference-form-design/entities/reference-form-design.entity';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class ReferenceFormOption extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'integer' })
  order: number;

  @ManyToOne(() => ReferenceFormDesign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reference_form_design_id' })
  reference_form_design: ReferenceFormDesign;
}

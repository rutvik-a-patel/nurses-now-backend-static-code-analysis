import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/entity/base.entity';
import { ReferenceFormDesign } from './reference-form-design.entity';
import { DEFAULT_STATUS } from '@/shared/constants/enum';

@Entity()
export class ReferenceForm extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.in_active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => ReferenceFormDesign,
    (referenceFormDesign) => referenceFormDesign.reference_form,
    { cascade: true },
  )
  reference_form_design: ReferenceFormDesign[];
}

import { ReferenceFormOption } from '@/reference-form-option/entities/reference-form-option.entity';
import { OPTION_TYPE } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ReferenceForm } from './reference-form.entity';

@Entity()
export class ReferenceFormDesign extends BaseEntity {
  @Column({ type: 'character varying', nullable: false })
  name: string;

  @Column({ type: 'enum', enum: OPTION_TYPE, nullable: false })
  option_type: OPTION_TYPE;

  @Column({ type: 'integer' })
  order: number;

  @ManyToOne(() => ReferenceForm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reference_form_id' })
  reference_form: ReferenceForm;

  @OneToMany(
    () => ReferenceFormOption,
    (referenceFormOption) => referenceFormOption.reference_form_design,
    { cascade: true },
  )
  reference_form_option: ReferenceFormOption[];
}

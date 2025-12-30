import { Column, Entity, OneToMany } from 'typeorm';
import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { Shift } from '@/shift/entities/shift.entity';
import { RateSheet } from '@/rate-groups/entities/rate-sheet.entity';

@Entity()
export class Certificate extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'character varying' })
  abbreviation: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @Column({ type: 'uuid', array: true, default: null })
  specialities: string[];

  @Column({ type: 'boolean', default: true })
  display: boolean;

  @Column({ type: 'character varying', nullable: true })
  workforce_portal_alias: string;

  @Column({ type: 'character varying', nullable: true })
  text_color: string;

  @Column({ type: 'character varying', nullable: true })
  background_color: string;

  @OneToMany(() => Provider, (provider) => provider.certificate)
  provider: Provider[];

  @OneToMany(() => Shift, (shift) => shift.certificate)
  shift: Shift[];

  @OneToMany(() => RateSheet, (rateSheet) => rateSheet.certificate)
  rate_sheets: RateSheet[];
}

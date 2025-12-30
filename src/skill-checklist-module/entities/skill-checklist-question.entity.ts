import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { SkillChecklistSubModule } from '@/skill-checklist-module/entities/skill-checklist-sub-module.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class SkillChecklistQuestion extends BaseEntity {
  @Column({ type: 'character varying' })
  question: string;

  @Column({ type: 'integer' })
  order: number;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @ManyToOne(() => SkillChecklistSubModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_checklist_sub_module_id' })
  skill_checklist_sub_module: SkillChecklistSubModule;
}

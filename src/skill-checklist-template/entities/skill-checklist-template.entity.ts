import { DEFAULT_STATUS } from '@/shared/constants/enum';
import { BaseEntity } from '@/shared/entity/base.entity';
import { SkillChecklistModule } from '@/skill-checklist-module/entities/skill-checklist-module.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class SkillChecklistTemplate extends BaseEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({
    type: 'enum',
    enum: DEFAULT_STATUS,
    default: DEFAULT_STATUS.active,
  })
  status: DEFAULT_STATUS;

  @OneToMany(
    () => SkillChecklistModule,
    (SkillChecklistModule) => SkillChecklistModule.skill_checklist_template,
    { cascade: true },
  )
  skill_checklist_module: SkillChecklistModule[];
}

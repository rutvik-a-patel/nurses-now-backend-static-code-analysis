import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { SkillChecklistTemplateService } from './skill-checklist-template.service';
import { CreateSkillChecklistTemplateDto } from './dto/create-skill-checklist-template.dto';
import response from '@/shared/response';
import { MultiSelectQueryParamsDto } from '@/shared/dto/query-params.dto';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSkillChecklistTemplateDto } from './dto/update-skill-checklist-template.dto';
import { RoleGuard } from '@/shared/guard/role.guard';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.skill_checklist)
@Controller('skill-checklist-template')
export class SkillChecklistTemplateController {
  constructor(
    private readonly skillChecklistTemplateService: SkillChecklistTemplateService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createSkillChecklistTemplateDto: CreateSkillChecklistTemplateDto,
  ) {
    try {
      const alreadyExists = await this.skillChecklistTemplateService.checkName(
        createSkillChecklistTemplateDto.name,
      );

      if (alreadyExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Skill checklist'),
          data: {},
        });
      }

      const template = await this.skillChecklistTemplateService.create(
        createSkillChecklistTemplateDto,
      );

      for (const moduleDto of createSkillChecklistTemplateDto.skill_checklist_module) {
        moduleDto.skill_checklist_template = template.id;
        const module =
          await this.skillChecklistTemplateService.createModule(moduleDto);
        for (const subModuleDto of moduleDto.skill_checklist_sub_module) {
          subModuleDto.skill_checklist_module = module.id;
          const subModule =
            await this.skillChecklistTemplateService.createSubModule(
              subModuleDto,
            );
          for (const questionDto of subModuleDto.skill_checklist_question) {
            questionDto.skill_checklist_sub_module = subModule.id;
            await this.skillChecklistTemplateService.createQuestion(
              questionDto,
            );
          }
        }
      }
      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Skill Checklist'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get()
  async findAll(@Query() queryParamsDto: MultiSelectQueryParamsDto) {
    try {
      const [list, count] =
        await this.skillChecklistTemplateService.getAll(queryParamsDto);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist'),
        total: count,
        limit: +queryParamsDto.limit,
        offset: +queryParamsDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get(':id')
  async findOne(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const result = await this.skillChecklistTemplateService.findOne({
        where: {
          id,
        },
        relations: {
          skill_checklist_module: {
            skill_checklist_sub_module: {
              skill_checklist_question: true,
            },
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
          updated_at: true,
          skill_checklist_module: {
            id: true,
            name: true,
            order: true,
            created_at: true,
            skill_checklist_sub_module: {
              id: true,
              name: true,
              created_at: true,
              skill_checklist_question: {
                id: true,
                question: true,
                order: true,
                created_at: true,
              },
            },
          },
        },
      });

      const data = {
        message: result
          ? CONSTANT.SUCCESS.RECORD_FOUND('Skill Checklist')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist'),
        data: result ? result : {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch(':id')
  async update(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateSkillChecklistTemplateDto: UpdateSkillChecklistTemplateDto,
  ) {
    try {
      const template = await this.skillChecklistTemplateService.findOne({
        where: {
          id,
        },
      });
      if (!template) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Skill Checklist'),
          data: {},
        });
      }

      await this.skillChecklistTemplateService.deleteSkillChecklist(
        updateSkillChecklistTemplateDto,
      );

      const result = await this.skillChecklistTemplateService.update(
        { id },
        updateSkillChecklistTemplateDto,
      );

      if (
        updateSkillChecklistTemplateDto.skill_checklist_module &&
        updateSkillChecklistTemplateDto.skill_checklist_module.length
      ) {
        for (const moduleDto of updateSkillChecklistTemplateDto.skill_checklist_module) {
          const moduleData =
            await this.skillChecklistTemplateService.updateModule({
              ...moduleDto,
              skill_checklist_template: template.id,
            });
          if (
            moduleDto.skill_checklist_sub_module &&
            moduleDto.skill_checklist_sub_module.length
          ) {
            for (const subModuleDto of moduleDto.skill_checklist_sub_module) {
              const subModuleData =
                await this.skillChecklistTemplateService.updateSubModule({
                  ...subModuleDto,
                  skill_checklist_module: moduleData.id,
                });
              if (
                subModuleDto.skill_checklist_question &&
                subModuleDto.skill_checklist_question.length
              ) {
                for (const questionDto of subModuleDto.skill_checklist_question) {
                  await this.skillChecklistTemplateService.updateQuestion({
                    ...questionDto,
                    skill_checklist_sub_module: subModuleData.id,
                  });
                }
              }
            }
          }
        }
      }

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Skill Checklist')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Skill Checklist'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.delete)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Delete('template/:id')
  async removeTemplate(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const isTemplateUsed =
        await this.skillChecklistTemplateService.isTemplateUsed(id);

      if (isTemplateUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('skill checklist'),
          data: {},
        });
      }
      const result = await this.skillChecklistTemplateService.removeTemplate(
        { id: id },
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Skill Checklist Template')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Skill Checklist Template'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

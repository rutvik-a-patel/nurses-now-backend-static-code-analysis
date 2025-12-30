import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompetencyTestSettingService } from './competency-test-setting.service';
import { CreateCompetencyTestSettingDto } from './dto/create-competency-test-setting.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import {
  UpdateCompetencyTestGlobalSettingDto,
  UpdateCompetencyTestSettingDto,
} from './dto/update-competency-test-setting.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { IsNull } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { CompetencyFilterDto } from './dto/competency-filter.dto';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { PERMISSIONS, SECTIONS, SUB_SECTION } from '@/shared/constants/enum';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Section(SECTIONS.staff_app_settings, SUB_SECTION.competency_test)
@Controller('competency-test-setting')
export class CompetencyTestSettingController {
  constructor(
    private readonly competencyTestSettingService: CompetencyTestSettingService,
  ) {}

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post()
  async create(
    @Body() createCompetencyTestSettingDto: CreateCompetencyTestSettingDto,
  ) {
    try {
      const isExist = await this.competencyTestSettingService.checkName(
        createCompetencyTestSettingDto.name,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Competency Test Setting'),
          data: {},
        });
      }

      const setting = await this.competencyTestSettingService.create(
        createCompetencyTestSettingDto,
      );

      if (createCompetencyTestSettingDto?.global_test_setting) {
        await this.competencyTestSettingService.createTestSetting({
          ...createCompetencyTestSettingDto.global_test_setting,
          competency_test_setting: setting.id,
        });
      }

      const optionPromises = [];
      for (const questionDto of createCompetencyTestSettingDto.competency_test_question) {
        const question = await this.competencyTestSettingService.createQuestion(
          {
            ...questionDto,
            competency_test_setting: setting.id,
          },
        );

        for (const optionDto of questionDto.competency_test_option) {
          optionPromises.push(
            this.competencyTestSettingService.createOption({
              ...optionDto,
              competency_test_question: question.id,
            }),
          );
        }
      }

      if (optionPromises.length) {
        await Promise.all(optionPromises);
      }

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Competency Test'),
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
  async findAll(@Query() queryParamsDto: CompetencyFilterDto) {
    try {
      const [list, count] =
        await this.competencyTestSettingService.getAll(queryParamsDto);

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Competency Test')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test'),
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
  @Get('global-setting')
  async getGlobalSetting() {
    try {
      const data = await this.competencyTestSettingService.findOneTestSetting({
        where: { competency_test_setting: IsNull() },
      });

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Test settings'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Test settings'),
        data: data,
      });
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
      const result = await this.competencyTestSettingService.findOne({
        where: {
          id,
        },
        relations: {
          test_setting: true,
          competency_test_question: {
            competency_test_option: true,
          },
        },
        select: {
          id: true,
          name: true,
          required_score: true,
          duration: true,
          status: true,
          created_at: true,
          updated_at: true,
          competency_test_question: {
            id: true,
            question: true,
            order: true,
            created_at: true,
            competency_test_option: {
              id: true,
              option: true,
              order: true,
              is_answer: true,
              created_at: true,
            },
          },
        },
      });

      if (!result) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        });
      }

      if (!result.test_setting) {
        const globalSetting =
          await this.competencyTestSettingService.findOneTestSetting({
            where: { competency_test_setting: IsNull() },
          });
        result.test_setting = globalSetting;
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Competency Test'),
        data: result,
      });
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
    @Body() updateCompetencyTestSettingDto: UpdateCompetencyTestSettingDto,
  ) {
    try {
      const template = await this.competencyTestSettingService.findOne({
        relations: { test_setting: true },
        where: { id },
      });

      if (!template) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
          data: {},
        });
      }
      const isExist = await this.competencyTestSettingService.checkName(
        updateCompetencyTestSettingDto.name,
        id,
      );

      if (isExist) {
        return response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Competency Test Setting'),
          data: {},
        });
      }
      const { global_test_setting, competency_test_question, ...updateData } =
        updateCompetencyTestSettingDto;

      // Update main test details
      await this.competencyTestSettingService.updateCompetencyTest(updateData);

      if (global_test_setting) {
        if (template.test_setting) {
          await this.competencyTestSettingService.updateTestSetting(
            { id: template.test_setting.id },
            global_test_setting,
          );
        } else {
          await this.competencyTestSettingService.createTestSetting({
            ...global_test_setting,
            competency_test_setting: template.id,
          });
        }
      }

      const result = await this.competencyTestSettingService.update(
        { id },
        updateData,
      );

      if (competency_test_question?.length) {
        const optionPromises = await Promise.all(
          competency_test_question.map(async (questionDto) => {
            const questionData =
              await this.competencyTestSettingService.updateQuestion({
                ...questionDto,
                competency_test_setting: template.id,
              });

            if (questionDto.competency_test_option?.length) {
              return Promise.all(
                questionDto.competency_test_option.map((optionDto) =>
                  this.competencyTestSettingService.updateOption({
                    ...optionDto,
                    competency_test_question: questionData.id,
                  }),
                ),
              );
            }
            return [];
          }),
        );

        // Flatten the array of promises if needed
        await Promise.all(optionPromises.flat());
      }

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Competency Test')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Competency Test'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.delete)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Delete('setting/:id')
  async removeTemplate(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const isTestUsed = await this.competencyTestSettingService.isTestUsed(id);

      if (isTestUsed) {
        return response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('competency test'),
          data: {},
        });
      }

      const result = await this.competencyTestSettingService.removeSetting(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Competency Test')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test Setting'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('question/:id')
  async removeQuestion(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const result = await this.competencyTestSettingService.removeQuestion(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Competency Test Question')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test Question'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Delete('option/:id')
  async removeOption(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() deleteDto: DeleteDto,
  ) {
    try {
      const result = await this.competencyTestSettingService.removeOption(
        id,
        deleteDto,
      );
      const data = {
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_DELETED('Competency Test Option')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Competency Test Option'),
        data: {},
      };
      return response.successResponse(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post('global')
  async saveGlobalTestSetting(
    @Body()
    testGlobalSettingDto: UpdateCompetencyTestGlobalSettingDto,
  ) {
    try {
      const setting =
        await this.competencyTestSettingService.findOneTestSetting({
          where: {
            competency_test_setting: IsNull(),
          },
        });

      if (!setting) {
        await this.competencyTestSettingService.createTestSetting(
          testGlobalSettingDto,
        );
      } else {
        await this.competencyTestSettingService.updateTestSetting(
          {
            id: setting.id,
          },
          testGlobalSettingDto,
        );
      }

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Test settings saved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('setting/:id')
  async saveTestSetting(
    @Param('id', UUIDValidationPipe) id: string,
    @Body()
    testGlobalSettingDto: UpdateCompetencyTestGlobalSettingDto,
  ) {
    try {
      const data = await this.competencyTestSettingService.findOneTestSetting({
        where: { competency_test_setting: { id: id } },
      });

      if (data) {
        await this.competencyTestSettingService.updateTestSetting(
          {
            competency_test_setting: { id },
          },
          testGlobalSettingDto,
        );
      } else {
        testGlobalSettingDto.competency_test_setting = id;
        await this.competencyTestSettingService.createTestSetting(
          testGlobalSettingDto,
        );
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Test settings saved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

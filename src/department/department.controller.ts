import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { IRequest } from '@/shared/constants/types';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { In } from 'typeorm';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Req() req: IRequest,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    try {
      const baseUrl = process.env.AWS_BASE_URL;

      if (createDepartmentDto?.departments?.length) {
        createDepartmentDto.departments.forEach((department) => {
          if (!department.members.includes(req.user.id)) {
            department.members.push(req.user.id);
          }
          department.base_url = baseUrl;
        });
      }

      const { delete_department = [] } = createDepartmentDto;

      if (delete_department.length) {
        delete createDepartmentDto.delete_department;
        await this.departmentService.remove(
          { id: In(delete_department) },
          {
            deleted_at_ip: createDepartmentDto.updated_at_ip,
          },
        );
      }

      if (createDepartmentDto?.departments?.length) {
        await this.departmentService.create(createDepartmentDto.departments);
      }

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Department Saved'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getAllTeams(@Req() req: IRequest) {
    try {
      const data = await this.departmentService.findAll(req.user.id);

      return response.successResponse({
        message:
          data && data.length
            ? CONSTANT.SUCCESS.RECORD_FOUND('Department')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Department'),
        data: data && data.length ? data : [],
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

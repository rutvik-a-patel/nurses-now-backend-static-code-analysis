import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { AuthGuard } from '@nestjs/passport';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getAllPermissions() {
    try {
      const [list] = await this.permissionService.findAll({});
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
        data: list,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

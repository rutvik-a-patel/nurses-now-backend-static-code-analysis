import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Not } from 'typeorm';
import { ContactFilterDto } from '@/facility-user/dto/contact-filter.dto';
import { IRequest } from '@/shared/constants/types';
import {
  ENTITY_STATUS,
  ACTIVITY_TYPE,
  SECTIONS,
  SUB_SECTION,
  PERMISSIONS,
} from '@/shared/constants/enum';
import { FilterFacilityDto } from './dto/filter-facility.dto';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import {
  Permission,
  Section,
} from '@/shared/decorator/access-control.decorator';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Section(SECTIONS.admin_portal_settings, SUB_SECTION.users)
  @Roles('admin')
  @Permission(PERMISSIONS.add)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Post('add-contact')
  async addContact(
    @Body() createAdminDto: CreateAdminDto,
    @Req() req: IRequest,
  ) {
    try {
      const admin = await this.adminService.findOneWhere({
        where: [
          { email: createAdminDto.email },
          {
            country_code: createAdminDto.country_code,
            mobile_no: createAdminDto.mobile_no,
          },
        ],
      });

      if (admin) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        });
      }

      if (createAdminDto.image) {
        Object.assign(createAdminDto, {
          base_url: process.env.AWS_ASSETS_PATH,
        });
      }

      createAdminDto.status = ENTITY_STATUS.invited;
      const data = await this.adminService.create(createAdminDto);
      await this.adminService.sendInvitation(data);

      const role = await this.adminService.findRole(
        createAdminDto.role as unknown as string,
      );

      await this.adminService.contactActivityLog(
        req,
        data.id,
        ACTIVITY_TYPE.CONTACT_USER_CREATED,
        {
          [req.user.role]: `${req.user.first_name} ${req.user.last_name}`,
          contact_user: `${createAdminDto.first_name} ${createAdminDto.last_name}`,
          contact_user_email: createAdminDto.email,
          assigned_role: role?.name || 'unknown',
        },
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.RECORD_CREATED('Admin Contact'),
        data: createAdminDto,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.admin_portal_settings, SUB_SECTION.users)
  @Roles('admin')
  @Permission(PERMISSIONS.edit)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Patch('edit-contact/:id')
  async editContact(
    @Param('id', UUIDValidationPipe) id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() req: IRequest,
  ) {
    try {
      const user = await this.adminService.findOneWhere({
        where: { id: id },
        relations: { role: true },
      });

      if (!user) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const where = [];

      if (updateAdminDto?.email) {
        where.push({ email: updateAdminDto.email, id: Not(id) });
      }

      if (updateAdminDto?.country_code && updateAdminDto.mobile_no) {
        where.push({
          country_code: updateAdminDto.country_code,
          mobile_no: updateAdminDto.mobile_no,
          id: Not(id),
        });
      }

      const emailOrMobileExists = where.length
        ? await this.adminService.findOneWhere({
            where: where,
          })
        : null;

      if (emailOrMobileExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        });
      }

      const result = await this.adminService.update(user.id, updateAdminDto);

      const updatedData = await this.adminService.findOneWhere({
        where: { id: user.id },
        relations: { role: true },
      });

      this.adminService.contactActivityUpdateLog(
        req,
        user.id,
        user,
        updatedData,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Contact')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contact'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.admin_portal_settings, SUB_SECTION.users)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all-contacts')
  async getAllContacts(
    @Query() queryParamsDto: ContactFilterDto,
    @Req() req: IRequest,
  ) {
    try {
      const [list, count] = await this.adminService.getAllContacts(
        queryParamsDto,
        req.user.id,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Contacts')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contacts'),
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

  @Section(SECTIONS.admin_portal_settings, SUB_SECTION.users)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('profile/:id')
  async getContactProfile(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const admin = await this.adminService.findOneWhere({
        where: { id: id },
        relations: { role: true },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });

      if (!admin) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Contact profile'),
        data: admin,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('my-profile')
  async getMyProfile(@Req() req: IRequest) {
    try {
      const user = await this.adminService.findOneWhere({
        relations: { role: true },
        where: { id: req.user.id },
        select: {
          role: {
            id: true,
            name: true,
          },
        },
      });

      delete user.password;
      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Profile'),
        data: user,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('edit-profile')
  async editMyProfile(
    @Req() req: IRequest,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    try {
      const where = [];
      if (updateAdminDto?.email) {
        where.push({
          email: updateAdminDto.email,
          id: Not(req.user.id),
        });
      }

      if (updateAdminDto?.country_code && updateAdminDto?.mobile_no) {
        where.push({
          country_code: updateAdminDto.country_code,
          mobile_no: updateAdminDto.mobile_no,
          id: Not(req.user.id),
        });
      }

      const emailOrMobileExists = where.length
        ? await this.adminService.findOneWhere({
            where: where,
          })
        : null;

      if (emailOrMobileExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        });
      }

      if (updateAdminDto.image && req.user.image) {
        await s3DeleteFile(req.user.image);
      }

      if (updateAdminDto.signature && req.user.signature) {
        await s3DeleteFile(req.user.signature);
      }

      if (updateAdminDto.image || updateAdminDto.signature) {
        Object.assign(updateAdminDto, {
          base_url: process.env.AWS_ASSETS_PATH,
        });
      }

      const data = await this.adminService.update(req.user.id, updateAdminDto);

      return response.successResponse({
        message: data.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Profile')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('all-facilities')
  async getAllFacilities(@Query() filterFacilityDto: FilterFacilityDto) {
    try {
      const [list, count] =
        await this.adminService.getAllFacilities(filterFacilityDto);
      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Facilities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facilities'),
        total: count,
        limit: +filterFacilityDto.limit,
        offset: +filterFacilityDto.offset,
        data: list,
      };
      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Section(SECTIONS.facilities, SUB_SECTION.facilities)
  @Roles('admin')
  @Permission(PERMISSIONS.view)
  @UseGuards(AuthGuard('jwt'), RoleGuard, AccessControlGuard)
  @Get('facility-details/:id')
  async getFacilityDetails(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.adminService.getFacilityDetails(id);

      if (!data) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Facility'),
          data: {},
        });
      }

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Facility'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

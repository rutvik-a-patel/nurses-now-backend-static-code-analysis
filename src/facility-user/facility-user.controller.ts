import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import response from '@/shared/response';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FacilityUserService } from './facility-user.service';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { IRequest } from '@/shared/constants/types';
import { Not } from 'typeorm';
import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';

@Controller('facility-user')
export class FacilityUserController {
  constructor(private readonly facilityUserService: FacilityUserService) {}

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('contact-profile/:id')
  async getContactDetails(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const data = await this.facilityUserService.getContactProfile(id);

      return response.successResponse({
        message: data
          ? CONSTANT.SUCCESS.RECORD_FOUND('Contact')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Contact'),
        data: data,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch()
  async editProfile(
    @Req() req: IRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const user = await this.facilityUserService.findOneWhere({
        where: { id: req.user.id },
      });

      if (!user) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Record'),
          data: {},
        });
      }

      const where = [];
      if (updateProfileDto?.email) {
        where.push({ email: updateProfileDto.email, id: Not(req.user.id) });
      }

      if (updateProfileDto?.country_code && updateProfileDto.mobile_no) {
        where.push({
          country_code: updateProfileDto.country_code,
          mobile_no: updateProfileDto.mobile_no,
          id: Not(req.user.id),
        });
      }

      const emailOrMobileExists = where.length
        ? await this.facilityUserService.findOneWhere({
            where: where,
          })
        : null;

      if (emailOrMobileExists) {
        return response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        });
      }

      if (updateProfileDto.image || updateProfileDto.signature) {
        Object.assign(updateProfileDto, {
          base_url: process.env.AWS_ASSETS_PATH,
        });
      }

      const result = await this.facilityUserService.update(
        user.id,
        updateProfileDto,
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Profile')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Profile'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getMyProfile(@Req() req: IRequest) {
    try {
      const user = await this.facilityUserService.findOneWhere({
        where: { id: req.user.id },
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

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Patch('hide-inactive-contacts')
  async hideInactiveContacts(
    @Body('hide_inactive_contacts') hide_inactive_contacts: boolean,
    @Body('hide_inactive_users') hide_inactive_users: boolean,
    @Req() req: IRequest,
  ) {
    try {
      const result = await this.facilityUserService.hideInactiveContacts(
        req.user,
        {
          hide_inactive_contacts,
          hide_inactive_users,
        },
      );

      return response.successResponse({
        message: result.affected
          ? CONSTANT.SUCCESS.RECORD_UPDATED('Settings')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Settings'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('hide-inactive-contacts/status')
  async getHideInactiveContactsStatus(@Req() req: IRequest) {
    try {
      const user: any = await this.facilityUserService.getContactSettings(
        req.user,
      );

      return response.successResponse({
        message: CONSTANT.SUCCESS.RECORD_FOUND('Settings'),
        data: {
          hide_inactive_contacts: user ? user.hide_inactive_contacts : false,
          hide_inactive_users: user ? user.hide_inactive_users : false,
        },
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

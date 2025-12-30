import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReferFriendService } from './refer-friend.service';
import { CreateReferFriendDto } from './dto/create-refer-friend.dto';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { IRequest } from '@/shared/constants/types';
import { ReferralQueryDto } from './dto/refer-friend.dto';

@Controller('refer-friend')
export class ReferFriendController {
  constructor(private readonly referFriendService: ReferFriendService) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Req() req: IRequest,
    @Body() createReferFriendDto: CreateReferFriendDto,
  ) {
    const checkName = await this.referFriendService.checkName(
      createReferFriendDto.email,
      createReferFriendDto.mobile_no,
    );
    if (checkName) {
      return response.badRequest({
        message: CONSTANT.ERROR.ALREADY_EXISTS('Staff'),
        data: {},
      });
    }

    createReferFriendDto.referred_by = req.user.id;

    const data = await this.referFriendService.create(createReferFriendDto);
    await this.referFriendService.sendReferralInvitationEmail(
      data,
      req.user.first_name + ' ' + req.user.last_name,
    );

    return response.successCreate({
      message: CONSTANT.SUCCESS.INVITATION_SENT('Referral'),
      data: data,
    });
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getInvites(@Req() req: IRequest) {
    const data = await this.referFriendService.findAllWithProviderData(
      req.user.id,
    );
    return response.successResponse({
      message:
        data.length > 0
          ? CONSTANT.SUCCESS.RECORD_FOUND('Invites')
          : CONSTANT.ERROR.RECORD_NOT_FOUND('Invites'),
      data: data,
    });
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('staff-referral/:id')
  async getInvitesForStaff(
    @Param('id') provider_id: string,
    @Query() query: ReferralQueryDto,
  ) {
    const [list, count] =
      await this.referFriendService.allReferralsWithCertificates(
        provider_id,
        query,
      );

    return response.successResponseWithPagination({
      message: count
        ? CONSTANT.SUCCESS.RECORD_FOUND('Referral')
        : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Referral'),
      total: count,
      limit: +query.limit,
      offset: +query.offset,
      data: count ? list : [],
    });
  }
}

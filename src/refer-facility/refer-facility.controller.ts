import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ReferFacilityService } from './refer-facility.service';
import { CreateReferFacilityDto } from './dto/create-refer-facility.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { IRequest } from '@/shared/constants/types';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';

@Controller('refer-facility')
export class ReferFacilityController {
  constructor(private readonly referFacilityService: ReferFacilityService) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Req() req: IRequest,
    @Body() createReferFacilityDto: CreateReferFacilityDto,
  ) {
    try {
      createReferFacilityDto.provider = req.user.id;
      const result = await this.referFacilityService.create(
        createReferFacilityDto,
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Referred'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { ProviderSavedFacilityService } from './provider-saved-facility.service';
import { CreateProviderSavedFacilityDto } from './dto/create-provider-saved-facility.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Roles } from '@/shared/decorator/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '@/shared/constants/types';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';

@Controller('provider-saved-facility')
export class ProviderSavedFacilityController {
  constructor(
    private readonly providerSavedFacilityService: ProviderSavedFacilityService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async saveOrRemoveFacility(
    @Req() req: IRequest,
    @Body() createProviderSavedFacilityDto: CreateProviderSavedFacilityDto,
  ) {
    try {
      let data;
      const savedFacility =
        await this.providerSavedFacilityService.findOneWhere({
          where: {
            provider: { id: req?.user?.id },
            facility: { id: createProviderSavedFacilityDto.facility },
          },
        });

      Object.assign(createProviderSavedFacilityDto, { provider: req.user.id });
      if (!savedFacility) {
        data = await this.providerSavedFacilityService.create(
          createProviderSavedFacilityDto,
        );

        return response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Saved'),
          data: data,
        });
      }

      data = await this.providerSavedFacilityService.remove(savedFacility.id);
      return response.successResponse({
        message: data?.affected
          ? CONSTANT.SUCCESS.SUCCESSFULLY('Facility Removed')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Facility'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get()
  async getSavedFacilities(
    @Req() req: IRequest,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [list, count] = await this.providerSavedFacilityService.findAll({
        relations: {
          facility: true,
        },
        where: {
          provider: { id: req?.user?.id },
        },
        select: {
          id: true,
          created_at: true,
          facility: {
            id: true,
            name: true,
            base_url: true,
            image: true,
          },
        },
        take: +queryParamsDto.limit,
        skip: +queryParamsDto.offset,
        order: queryParamsDto.order,
      });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Saved Facilities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Saved Facilities'),
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
  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('dnr-facilities')
  async getDnrFacilities(
    @Req() req: IRequest,
    @Query() queryParamsDto: QueryParamsDto,
  ) {
    try {
      const [list, count] =
        await this.providerSavedFacilityService.findSelfFacility({
          relations: {
            facility: true,
          },
          where: {
            provider: { id: req?.user?.id },
            self_dnr: true,
          },
          select: {
            id: true,
            created_at: true,
            facility: {
              id: true,
              name: true,
              base_url: true,
              image: true,
            },
          },
          take: +queryParamsDto.limit,
          skip: +queryParamsDto.offset,
          order: queryParamsDto.order,
        });

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('DNR Facilities')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('DNR Facilities'),
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
}

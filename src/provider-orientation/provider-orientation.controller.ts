import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ProviderOrientationService } from './provider-orientation.service';
import { Roles } from '@/shared/decorator/role.decorator';
import { RoleGuard } from '@/shared/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { IRequest } from '@/shared/constants/types';

import { UUIDValidationPipe } from '@/shared/pipe/uuid.validation.pipe';
import { CreateProviderOrientationDto } from './dto/create-provider-orientation.dto';
import {
  FilterProviderOrientationDto,
  OrientationDocQueryDto,
} from './dto/filter-provider-orientation.dto';
import {
  ACTION_TABLES,
  ACTIVITY_TYPE,
  CREDENTIAL_STATUS,
  EJS_FILES,
  ORIENTATION_STATUS,
  ORIENTATION_TYPE,
  PushNotificationType,
  SHIFT_STATUS,
  TABLE,
  VERIFICATION_STATUS,
} from '@/shared/constants/enum';
import { ProviderOrientation } from './entities/provider-orientation.entity';
import {
  NewRequestOrientationDto,
  OrientationPacketDto,
  OrientationQueryDto,
} from './dto/orientation-action.dto';
import { IsNull } from 'typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { Facility } from '@/facility/entities/facility.entity';
import * as moment from 'moment';
import { ShiftNotificationService } from '@/shared/helpers/shift-notifications';
import { ActivityService } from '@/activity/activity.service';
import { active } from '@/shared/constants/constant';

@Controller('provider-orientation')
export class ProviderOrientationController {
  constructor(
    private readonly providerOrientationService: ProviderOrientationService,
    private readonly shiftNotificationService: ShiftNotificationService,
    private readonly activityService: ActivityService,
  ) {}

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post()
  async create(
    @Body() createProviderOrientationDto: CreateProviderOrientationDto,
    @Req() req: IRequest,
  ) {
    try {
      if (req.user.verification_status === VERIFICATION_STATUS.rejected) {
        return response.badRequest({
          message: CONSTANT.ERROR.PROFILE_REJECTED,
          data: {},
        });
      }
      if (req.user.status.name !== active) {
        return response.badRequest({
          message: CONSTANT.ERROR.STAFF_PROFILE_UNVERIFIED,
          data: {},
        });
      }

      const isResponded = await this.providerOrientationService.findOneWhere({
        where: {
          provider: { id: req.user.id },
          facility: { id: createProviderOrientationDto.facility_id },
        },
        relations: { facility: true },
        select: {
          id: true,
          facility: { id: true, name: true, orientation_enabled: true },
          status: true,
          cancel_description: true,
          created_at: true,
        },
      });

      if (isResponded) {
        const { status } = isResponded;
        let message;

        switch (status) {
          case ORIENTATION_STATUS.orientation_requested:
            message = CONSTANT.VALIDATION.ALREADY_REQUESTED;
            break;
          case ORIENTATION_STATUS.orientation_rejected:
            message = CONSTANT.VALIDATION.REJECTED;
            break;
          case ORIENTATION_STATUS.not_interested:
            message = CONSTANT.VALIDATION.ALREADY_RESPONDED;
            break;
          case ORIENTATION_STATUS.orientation_completed:
            message = CONSTANT.VALIDATION.ALREADY_DONE(
              'Orientation',
              ORIENTATION_STATUS.orientation_completed,
            );
            break;
          default:
            message = 'Response sent for the orientation.';
        }

        return response.badRequest({
          message,
          data: {
            orientation_enabled: isResponded.facility.orientation_enabled,
          },
        });
      }
      createProviderOrientationDto.provider_id = req.user.id;
      const result = await this.providerOrientationService.create(
        createProviderOrientationDto,
      );

      await this.providerOrientationService.providerOrientationActivityLog(
        req,
        ACTIVITY_TYPE.ORIENTATION_REQUEST_RECEIVED,
        {
          changes: {
            license: req.user.certificate.abbreviation,
            speciality: req.user.speciality.abbreviation,
            from_status: 'N/A',
            to_status: ORIENTATION_STATUS.orientation_requested,
          },
        },
      );
      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Orientation Request Sent'),
        data: result,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('provider')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('packet-submit/:id') // facility_id
  async submitOrientationPacket(
    @Body() orientationPacket: OrientationPacketDto,
    @Param('id') facilityId: string,
    @Req() req: IRequest,
  ) {
    try {
      const isPacketAssigned =
        await this.providerOrientationService.findOrientationDocument({
          where: {
            provider: { id: req.user.id },
            facility: { id: facilityId },
            completed_date: IsNull(),
          },
          relations: { facility: true },
          select: {
            id: true,
            facility: { id: true, name: true },
            is_verified: true,
            completed_date: true,
            created_at: true,
          },
          order: { created_at: 'DESC' },
        });

      if (!isPacketAssigned) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Assigned Document'),
          data: {},
        });
      }

      if (isPacketAssigned.completed_date) {
        return response.badRequest({
          message: CONSTANT.ERROR.RESPONSE_ALREADY_SUBMITTED(
            'Orientation Document',
          ),
          data: {},
        });
      }

      // Update orientation document with completed date
      await this.providerOrientationService.updateOrientationDocument(
        { provider: { id: req.user.id }, facility: { id: facilityId } },
        {
          ...orientationPacket,
          name: orientationPacket.name
            ? orientationPacket.name
            : orientationPacket.original_filename,
          base_url: orientationPacket.base_url
            ? orientationPacket.base_url
            : process.env.AWS_ASSETS_PATH,
          completed_date: new Date(),
          uploaded_by_id: req.user.id,
          uploaded_by_type: req.user.role,
          uploaded_at: new Date(),
        },
      );

      return response.successCreate({
        message: CONSTANT.SUCCESS.SUCCESSFULLY(
          'Orientation document submitted',
        ),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get(':id') // facility_id
  async findAll(
    @Param('id', UUIDValidationPipe) facilityId: string,
    @Query() filterProviderOrientationDto: FilterProviderOrientationDto,
  ) {
    try {
      const [list, count] = await this.providerOrientationService.findAll(
        facilityId,
        filterProviderOrientationDto,
      );

      const data = {
        message: count
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff Orientation')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff Orientation'),
        total: count,
        limit: +filterProviderOrientationDto.limit,
        offset: +filterProviderOrientationDto.offset,
        data: list,
      };

      return response.successResponseWithPagination(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('details/:id') // orientation record id
  async findDetails(@Param('id', UUIDValidationPipe) id: string) {
    try {
      const provider = await this.providerOrientationService.findOneWhere({
        where: { id },
        relations: {
          provider: { address: true, certificate: true, speciality: true },
          facility: true,
          reason: true,
        },
        select: {
          id: true,
          status: true,
          provider: {
            id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            base_url: true,
            profile_image: true,
            email: true,
            mobile_no: true,
            birth_date: true,
            certificate: { id: true, name: true, abbreviation: true },
            speciality: { id: true, name: true, abbreviation: true },
            address: {
              id: true,
              street: true,
              apartment: true,
              city: true,
              state: true,
              zip_code: true,
              country: true,
            },
          },
          facility: {
            id: true,
            name: true,
            orientation_process: true,
          },
          reason: { id: true, reason: true, description: true },
        },
      });

      // mark as read
      await this.providerOrientationService.update({ id }, { is_read: true });
      return response.successResponse({
        message: provider
          ? CONSTANT.SUCCESS.RECORD_FOUND('Staff Details')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
        data: provider || {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('orientation/document')
  async listOrientationSubmittedDocument(
    @Query() orientationDocQueryDto: OrientationDocQueryDto,
  ) {
    try {
      if (
        !orientationDocQueryDto.provider_id ||
        !orientationDocQueryDto.facility_id
      ) {
        return response.badRequest({
          message: CONSTANT.ERROR.REQUIRED('`provider_id` and `facility_id`'),
          data: {},
        });
      }

      const documents =
        await this.providerOrientationService.listSubmittedDocuments(
          orientationDocQueryDto.provider_id,
          orientationDocQueryDto.facility_id,
        );
      return response.successResponse({
        message: documents.documents.length
          ? CONSTANT.SUCCESS.RECORD_FOUND('Orientation Documents')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Documents'),
        data: documents,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('orientation/document/details/:id') // document id
  async orientationDocumentDetails(
    @Param('id', UUIDValidationPipe) id: string,
  ) {
    try {
      const documents =
        await this.providerOrientationService.orientationDocumentsDetails(id);
      return response.successResponse({
        message: documents
          ? CONSTANT.SUCCESS.RECORD_FOUND('Orientation Documents')
          : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Documents'),
        data: documents,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('document/verify')
  async verifyOrientationDocument(
    @Body() orientationDocQueryDto: OrientationDocQueryDto,
    @Req() req: IRequest,
  ) {
    try {
      const findDocument =
        await this.providerOrientationService.findOrientationDocument({
          where: {
            id: orientationDocQueryDto.document_id,
          },
          relations: { provider: true, facility: true },
          select: {
            id: true,
            is_verified: true,
            completed_date: true,
            provider: { id: true, first_name: true, last_name: true },
            facility: { id: true, name: true },
          },
        });

      if (!findDocument) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Orientation Document'),
          data: {},
        });
      }

      if (!findDocument.completed_date) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.DOCUMENT_NOT_SUBMITTED(
            'Orientation Document',
            findDocument.provider.first_name,
          ),
          data: {},
        });
      }

      if (orientationDocQueryDto.is_verified === findDocument.is_verified) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.ALREADY_DONE(
            'Orientation Document',
            orientationDocQueryDto.is_verified,
          ),
          data: {},
        });
      }
      const documents = await this.providerOrientationService.updateDocument(
        {
          id: orientationDocQueryDto.document_id,
        },
        {
          is_verified: orientationDocQueryDto.is_verified,
          credential_approved_at:
            orientationDocQueryDto.is_verified === CREDENTIAL_STATUS.verified
              ? new Date()
              : null,
          credential_rejected_at:
            orientationDocQueryDto.is_verified === CREDENTIAL_STATUS.rejected
              ? new Date()
              : null,
          verified_by_id: req.user.id,
          verified_by_type: req.user.role,
          reason: orientationDocQueryDto.reason
            ? { id: orientationDocQueryDto.reason }
            : null,
        },
      );

      // Update orientation status based on verification result
      const newStatus =
        orientationDocQueryDto.is_verified === CREDENTIAL_STATUS.verified
          ? ORIENTATION_STATUS.orientation_completed
          : orientationDocQueryDto.is_verified === CREDENTIAL_STATUS.rejected
            ? ORIENTATION_STATUS.orientation_rejected
            : ORIENTATION_STATUS.packet_sent;

      await this.providerOrientationService.update(
        {
          provider: { id: findDocument.provider.id },
          facility: { id: findDocument.facility.id },
        },
        { status: newStatus },
      );

      if (orientationDocQueryDto.is_verified !== CREDENTIAL_STATUS.rejected) {
        // add the provider to facility provider list if not exist
        const isExist =
          await this.providerOrientationService.checkFacilityProvider({
            where: {
              provider: {
                id: findDocument.provider.id,
              },
              facility: {
                id: findDocument.facility.id,
              },
            },
          });

        if (!isExist) {
          await this.providerOrientationService.addFacilityProvider({
            provider: findDocument.provider,
            facility: findDocument.facility,
          });
        }
      }
      if (newStatus === ORIENTATION_STATUS.orientation_completed) {
        // Activity log for orientation approved
        await this.providerOrientationService.providerOrientationActivityLog(
          req,
          ACTIVITY_TYPE.ORIENTATION_COMPLETED,
          {
            provider:
              findDocument.provider.first_name +
              ' ' +
              findDocument.provider.last_name,
            from_status: ORIENTATION_STATUS.packet_sent,
            to_status: ORIENTATION_STATUS.orientation_completed,
            orientation_process:
              ORIENTATION_TYPE.electronic_orientation_documents,
          },
        );
      }

      return response.successResponse({
        message:
          documents.affected > 0
            ? CONSTANT.SUCCESS.RECORD_UPDATED('Orientation Document')
            : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Orientation Document'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Get('request/new')
  async newOrientationRequest(
    @Query() newRequestOrientation: NewRequestOrientationDto,
  ) {
    try {
      const count = await this.providerOrientationService.countBy({
        where: {
          facility: { id: newRequestOrientation.facility_id },
          status: ORIENTATION_STATUS.orientation_requested,
          is_read: false,
        },
      });

      return response.successResponse({
        message: CONSTANT.SUCCESS.SUCCESSFULLY('Count Fetched'),
        data: count,
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Roles('admin', 'facility', 'facility_user')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Post('action')
  async approveOrientation(
    @Query() query: OrientationQueryDto,
    @Req() req: IRequest,
  ) {
    try {
      const orientationData =
        await this.providerOrientationService.findOneWhere({
          where: {
            facility: { id: query.facility_id },
            provider: { id: query.provider_id },
          },
          relations: {
            facility: true,
            provider: true,
            shift: true,
          },
        });

      if (!orientationData) {
        return response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Orientation Request'),
          data: {},
        });
      }

      // send request to shift if orientation is not enabled and action is approve
      if (
        !orientationData.facility.orientation_enabled &&
        query.action === 'approve' &&
        orientationData.shift
      ) {
        await this.addProviderToShift(query, orientationData, req);
        await this.providerOrientationService.providerOrientationActivityLog(
          req,
          ACTIVITY_TYPE.ORIENTATION_APPROVED,
          {
            provider:
              orientationData.provider.first_name +
              ' ' +
              orientationData.provider.last_name,
            from_status: ORIENTATION_STATUS.orientation_requested,
            to_status: ORIENTATION_STATUS.orientation_completed,
          },
        );
      }

      if (
        orientationData.status === ORIENTATION_STATUS.orientation_scheduled &&
        query.action === 'shift'
      ) {
        return response.badRequest({
          message: CONSTANT.VALIDATION.ALREADY_HAVE_ORIENTATION(
            orientationData.provider.first_name,
          ),
          data: {},
        });
      }

      switch (query.action) {
        case 'packet':
          return await this.handlePacketAction(orientationData, req);
        case 'shift':
          return await this.handleShiftAction(
            orientationData,
            query.facility_id,
            query.shift_id,
            req,
          );
        case 'approve':
          return await this.handleApproveAction(orientationData, query, req);
        case 'reject':
          return await this.handleRejectAction(
            orientationData,
            query.reason_id,
            req,
          );
      }
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  private async addProviderToShift(
    query: OrientationQueryDto,
    orientationData: ProviderOrientation,
    req: IRequest,
  ) {
    const mainShift = await this.providerOrientationService.findOneShift({
      where: {
        id: orientationData.shift.id,
        facility: { id: query.facility_id },
      },
      relations: { facility: true },
      select: { id: true },
    });

    const result = await this.providerOrientationService.createShiftRequest({
      provider: orientationData.provider.id,
      shift: mainShift.id,
    });

    if (result) {
      // assigning the value to the object
      mainShift.provider = req.user;

      if (mainShift && mainShift.status === SHIFT_STATUS.open) {
        await this.shiftNotificationService.sendNotification({
          email: mainShift.follower.email,
          emailType: EJS_FILES.shift_requested,
          role: TABLE.facility_user,
          userId: mainShift.follower.id,
          shiftStatus: SHIFT_STATUS.requested,
          text: CONSTANT.NOTIFICATION.SHIFT_REQUEST_TEXT(
            `${req.user.first_name} ${req.user.last_name}`,
            mainShift.start_date,
            moment(mainShift.start_time, 'HH:mm:ss').format('hh:mm A'),
            mainShift.facility.name,
          ),
          title: CONSTANT.NOTIFICATION.SHIFT_REQUEST_TITLE,
          subject: CONSTANT.EMAIL.SHIFT_REQUESTED,
          shiftData: { ...mainShift },
          push_type: PushNotificationType.shift_requested,
        });
      }

      await this.providerOrientationService.updateShift(
        { id: mainShift.id },
        {
          status: SHIFT_STATUS.requested,
        },
      );

      // activity
      await this.activityService.logShiftActivity(
        mainShift,
        req,
        ACTIVITY_TYPE.PROVIDER_REQUEST_SHIFT,
        {
          from_status: SHIFT_STATUS.requested,
          to_status: '',
        },
        ACTION_TABLES.PROVIDER_ORIENTATION,
      );

      // update orientation status to completed
      await this.providerOrientationService.update(
        {
          provider: { id: query.provider_id },
          facility: { id: query.facility_id },
        },
        { status: ORIENTATION_STATUS.orientation_completed },
      );
    }
  }

  private async handleRejectAction(
    orientationData: ProviderOrientation,
    reason: string,
    req: IRequest,
  ) {
    if (!reason) {
      return response.badRequest({
        message: CONSTANT.ERROR.REQUIRED(`'reason_id'`),
        data: {},
      });
    }

    await this.providerOrientationService.rejectOrientationRequest(
      orientationData,
      reason,
    );

    // Activity log for orientation rejected
    await this.providerOrientationService.providerOrientationActivityLog(
      req,
      ACTIVITY_TYPE.ORIENTATION_REJECTED,
      {
        provider:
          orientationData.provider.first_name +
          ' ' +
          orientationData.provider.last_name,
      },
    );
    return response.successResponse({
      message: CONSTANT.SUCCESS.ORIENTATION_REJECTED(
        orientationData.provider.first_name,
      ),
      data: {},
    });
  }

  private async handleShiftAction(
    orientationData: ProviderOrientation,
    facilityId: string,
    shiftId: string,
    req: IRequest,
  ) {
    if (!shiftId) {
      return response.badRequest({
        message: CONSTANT.ERROR.MISSING('Shift ID'),
        data: {},
      });
    }

    const shift = await this.providerOrientationService.findOneShift({
      where: { id: shiftId, facility: { id: facilityId } },
      relations: { facility: true },
      select: { id: true },
    });

    if (!shift) {
      return response.badRequest({
        message: CONSTANT.ERROR.RECORD_NOT_FOUND('Shift'),
        data: {},
      });
    }

    await this.providerOrientationService.update(
      { id: orientationData.id },
      {
        shift: { id: shift.id },
        status: ORIENTATION_STATUS.orientation_scheduled,
      },
    );

    await this.providerOrientationService.updateShift(
      { id: shift.id },
      {
        status: SHIFT_STATUS.scheduled,
        provider: { id: orientationData.provider.id },
      },
    );

    // Activity log for shift assigned
    await this.providerOrientationService.providerOrientationActivityLog(
      req,
      ACTIVITY_TYPE.ORIENTATION_DOCUMENT_ASSIGNED,
      {
        provider:
          orientationData.provider.first_name +
          ' ' +
          orientationData.provider.last_name,
        from_status: ORIENTATION_STATUS.orientation_requested,
        to_status: ORIENTATION_STATUS.orientation_scheduled,
      },
    );

    return response.successResponse({
      message: CONSTANT.SUCCESS.ORIENTATION_ASSIGNED(
        'shift',
        orientationData.provider.first_name,
      ),
      data: {},
    });
  }

  private async handlePacketAction(
    orientationData: ProviderOrientation,
    req: IRequest,
  ) {
    const { facility } = orientationData;

    if (
      (facility?.orientation_process ===
        ORIENTATION_TYPE.electronic_orientation_documents ||
        facility?.orientation_process === ORIENTATION_TYPE.both) &&
      !facility?.orientation_document
    ) {
      return response.badRequest({
        message: CONSTANT.ERROR.MISSING('Orientation Document'),
        data: {},
      });
    }

    await this.providerOrientationService.assignPacket(orientationData, req);

    // Activity log for packet sent
    await this.providerOrientationService.providerOrientationActivityLog(
      req,
      ACTIVITY_TYPE.ORIENTATION_DOCUMENT_ASSIGNED,
      {
        provider:
          orientationData.provider.first_name +
          ' ' +
          orientationData.provider.last_name,
        from_status: ORIENTATION_STATUS.orientation_requested,
        to_status: ORIENTATION_STATUS.packet_sent,
      },
    );

    return response.successResponse({
      message: CONSTANT.SUCCESS.ORIENTATION_ASSIGNED(
        'packet',
        orientationData.provider.first_name,
      ),
      data: {},
    });
  }

  private async handleApproveAction(
    orientationData: ProviderOrientation,
    query: OrientationQueryDto,
    req: IRequest,
  ) {
    // add the provider to facility provider list if not exist
    const isExist = await this.providerOrientationService.checkFacilityProvider(
      {
        where: {
          provider: {
            id: query.provider_id,
          },
          facility: {
            id: query.facility_id,
          },
        },
      },
    );

    if (!isExist) {
      await this.providerOrientationService.addFacilityProvider({
        provider: { id: query.provider_id } as Provider,
        facility: { id: query.facility_id } as Facility,
      });
    }

    await this.providerOrientationService.update(
      { id: orientationData.id },
      { status: ORIENTATION_STATUS.orientation_completed },
    );

    // Activity log for orientation approved
    await this.providerOrientationService.providerOrientationActivityLog(
      req,
      ACTIVITY_TYPE.ORIENTATION_APPROVED,
      {
        provider:
          orientationData.provider.first_name +
          ' ' +
          orientationData.provider.last_name,
        from_status: ORIENTATION_STATUS.orientation_requested,
        to_status: ORIENTATION_STATUS.orientation_completed,
      },
    );

    return response.successResponse({
      message: CONSTANT.SUCCESS.ORIENTATION_COMPLETED(
        orientationData.provider.first_name,
      ),
      data: {},
    });
  }
}

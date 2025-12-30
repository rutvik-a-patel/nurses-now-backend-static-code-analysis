import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { IRequest } from '@/shared/constants/types';
import { RoleGuard } from '@/shared/guard/role.guard';
import { Provider } from '@/provider/entities/provider.entity';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { ProviderCredential } from '@/provider-credentials/entities/provider-credential.entity';

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: any;

  const mockDashboardService = {
    findOneProviderWhere: jest.fn(),
    getProviderDashboard: jest.fn(),
    getProviderCredentialsSummary: jest.fn(),
    getApplicationProgress: jest.fn(),
  };

  const mockRequest: IRequest = {
    headers: { timezone: '02:00' },
    user: { id: 'provider-id', certificate_id: { id: 'cert' } },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(jest.fn())
      .overrideGuard(RoleGuard)
      .useValue(jest.fn())
      .compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProviderDashboard', () => {
    it('should return a provider dashboard summary', async () => {
      const providerMock = new Provider();
      providerMock.certificate = new Certificate();
      const data = {
        overall_progress: 100.0,
        sectional_progress: {
          profile_completed: 100.0,
          credential_completed: 100.0,
          experience_completed: 100.0,
          signature_completed: 100.0,
          acknowledgement_completed: 100.0,
          skills_completed: 100.0,
          competency_test_completed: 100.0,
          payment_setup_completed: 100.0,
        },
      };

      const summaryMock = { totalShifts: 10 };
      dashboardService.findOneProviderWhere.mockResolvedValue(providerMock);
      dashboardService.getApplicationProgress.mockResolvedValue(data);
      dashboardService.getProviderDashboard.mockResolvedValue(summaryMock);

      const result = await controller.getProviderDashboard(mockRequest);

      expect(dashboardService.findOneProviderWhere).toHaveBeenCalledWith({
        where: { id: mockRequest.user.id },
        relations: {
          certificate: true,
          speciality: true,
          address: true,
          status: true,
        },
      });
      expect(dashboardService.getApplicationProgress).toHaveBeenCalledWith(
        mockRequest.user,
      );
      expect(dashboardService.getProviderDashboard).toHaveBeenCalledWith(
        providerMock,
        expect.any(Number),
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Dashboard Summary'),
          data: { ...summaryMock, overall_progress: data.overall_progress },
        }),
      );
    });

    it('should return a bad request if provider not found', async () => {
      dashboardService.findOneProviderWhere.mockResolvedValue(null);

      const result = await controller.getProviderDashboard(mockRequest);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should handle exceptions', async () => {
      const error = new Error('Unexpected error');
      dashboardService.findOneProviderWhere.mockRejectedValue(error);

      const result = await controller.getProviderDashboard(mockRequest);

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProviderCredentials', () => {
    it('should return a list of provider credentials', async () => {
      const providerMock = new Provider();
      providerMock.certificate = new Certificate();
      const credentialsListMock = [new ProviderCredential()];
      const queryParamsDto = new QueryParamsDto();
      dashboardService.findOneProviderWhere.mockResolvedValue(providerMock);
      dashboardService.getProviderCredentialsSummary.mockResolvedValue([
        credentialsListMock,
        1,
      ]);

      const result = await controller.getProviderCredentials(
        '1',
        queryParamsDto,
      );

      expect(dashboardService.findOneProviderWhere).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: { certificate: true },
      });
      expect(
        dashboardService.getProviderCredentialsSummary,
      ).toHaveBeenCalledWith(providerMock, queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: credentialsListMock,
        }),
      );
    });

    it('should return a list of provider credentials', async () => {
      const providerMock = new Provider();
      providerMock.certificate = new Certificate();
      const credentialsListMock = [];
      const queryParamsDto = new QueryParamsDto();
      dashboardService.findOneProviderWhere.mockResolvedValue(providerMock);
      dashboardService.getProviderCredentialsSummary.mockResolvedValue([
        credentialsListMock,
        0,
      ]);

      const result = await controller.getProviderCredentials(
        '1',
        queryParamsDto,
      );

      expect(dashboardService.findOneProviderWhere).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: { certificate: true },
      });
      expect(
        dashboardService.getProviderCredentialsSummary,
      ).toHaveBeenCalledWith(providerMock, queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Credentials'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: credentialsListMock,
        }),
      );
    });

    it('should return a bad request if provider not found', async () => {
      dashboardService.findOneProviderWhere.mockResolvedValue(null);

      const result = await controller.getProviderCredentials(
        '1',
        new QueryParamsDto(),
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should handle exceptions', async () => {
      const error = new Error('Unexpected error');
      dashboardService.findOneProviderWhere.mockRejectedValue(error);

      const result = await controller.getProviderCredentials(
        '1',
        new QueryParamsDto(),
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

jest.mock('@/shared/helpers/s3-delete-file', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { Provider } from './entities/provider.entity';
import { ProviderAddressService } from '@/provider-address/provider-address.service';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { AddProviderDataDto } from './dto/add-provider-data.dto';
import { ProviderAddress } from '@/provider-address/entities/provider-address.entity';
import { CreateProviderAddressDto } from '@/provider-address/dto/create-provider-address.dto';
import { EditProviderDto } from './dto/edit-provider.dto';
import { Not } from 'typeorm';
import { ProviderCredentialsService } from '@/provider-credentials/provider-credentials.service';
import { CompetencyTestResponseService } from '@/competency-test-response/competency-test-response.service';
import { ProviderSignatureDto } from './dto/provider-signature.dto';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { UpdatePreferenceSettingDto } from './dto/update-preference-setting.dto';
import { RejectFacilityDto } from '@/facility/dto/update-facility.dto';
import { Certificate } from '@/certificate/entities/certificate.entity';
import { CredentialsCategory } from '@/credentials-category/entities/credentials-category.entity';
import { USER_STATUS, VERIFICATION_STATUS } from '@/shared/constants/enum';
import { CompetencyTestScore } from '@/competency-test-response/entities/competency-test-score.entity';
import { ProviderWorkHistoryService } from '@/provider-work-history/provider-work-history.service';
import { ProviderEducationHistoryService } from '@/provider-education-history/provider-education-history.service';
import { ProviderProfessionalReferenceService } from '@/provider-professional-reference/provider-professional-reference.service';
import { CompetencyTestSetting } from '@/competency-test-setting/entities/competency-test-setting.entity';
import { SkillChecklistTemplate } from '@/skill-checklist-template/entities/skill-checklist-template.entity';
import { ProviderEducationHistory } from '@/provider-education-history/entities/provider-education-history.entity';
import { ProviderWorkHistory } from '@/provider-work-history/entities/provider-work-history.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';
import { FilterProviderListDto } from './dto/filter-provider-list.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';
import { FacilityProviderService } from '@/facility-provider/facility-provider.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatGateway } from '@/chat/chat.gateway';
import { ChatService } from '@/chat/chat.service';
import { NotificationService } from '@/notification/notification.service';
import { FirebaseNotificationService } from '@/shared/helpers/firebase-notification';
import { TokenService } from '@/token/token.service';
import { UserNotificationService } from '@/user-notification/user-notification.service';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('ProviderController', () => {
  let controller: ProviderController;
  let providerService: any;
  let providerCredentialsService: any;
  let competencyTestResponseService: any;
  let deleteFile: any;
  let providerAddressService: any;
  let providerWorkHistoryService: any;
  let providerEducationHistoryService: any;
  let providerProfessionalReferenceService: any;
  let notificationService: any;
  let firebaseNotificationService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [
        ProviderAddressService,
        {
          provide: ProviderService,
          useValue: {
            findProfileData: jest.fn(),
            findOneWhere: jest.fn(),
            addProviderData: jest.fn(),
            checkIsActive: jest.fn(),
            updateWhere: jest.fn(),
            update: jest.fn(),
            findAllV2: jest.fn(),
            findOneV2: jest.fn(),
            getAllCredentialsCategory: jest.fn(),
            getCompetencyList: jest.fn(),
            getSkillChecklist: jest.fn(),
            getProviderDetails: jest.fn(),
            shiftTimeLabels: jest.fn(),
            getProviderMetrics: jest.fn(),
            getProviderPerformance: jest.fn(),
          },
        },
        {
          provide: ProviderAddressService,
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ProviderCredentialsService,
          useValue: {},
        },
        {
          provide: CompetencyTestResponseService,
          useValue: {
            getAllTest: jest.fn(),
          },
        },
        {
          provide: ProviderWorkHistoryService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: ProviderEducationHistoryService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: ProviderProfessionalReferenceService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: EncryptDecryptService,
          useValue: {},
        },
        {
          provide: FacilityProviderService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: FirebaseNotificationService,
          useValue: {},
        },
        {
          provide: UserNotificationService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: ChatGateway,
          useValue: {},
        },
        {
          provide: ChatService,
          useValue: {},
        },

        {
          provide: getRepositoryToken(ProviderProfessionalReference),
          useValue: {},
        },
        {
          provide: AccessControlGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    })
      .overrideGuard(AccessControlGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<ProviderController>(ProviderController);
    providerService = module.get<ProviderService>(ProviderService);
    providerCredentialsService = module.get<ProviderCredentialsService>(
      ProviderCredentialsService,
    );
    competencyTestResponseService = module.get<CompetencyTestResponseService>(
      CompetencyTestResponseService,
    );
    providerAddressService = module.get<ProviderAddressService>(
      ProviderAddressService,
    );
    providerWorkHistoryService = module.get<ProviderWorkHistoryService>(
      ProviderWorkHistoryService,
    );
    providerEducationHistoryService =
      module.get<ProviderEducationHistoryService>(
        ProviderEducationHistoryService,
      );
    providerProfessionalReferenceService =
      module.get<ProviderProfessionalReferenceService>(
        ProviderProfessionalReferenceService,
      );
    notificationService = module.get<NotificationService>(NotificationService);
    firebaseNotificationService = module.get<FirebaseNotificationService>(
      FirebaseNotificationService,
    );
    deleteFile = s3DeleteFile as jest.MockedFunction<typeof s3DeleteFile>;

    providerService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.findOneWhere
    >;
    providerService.findOneV2 = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.findOneV2
    >;
    providerService.findAllV2 = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.findAllV2
    >;
    providerService.addProviderData = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.addProviderData
    >;
    providerService.findProfileData = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.findProfileData
    >;
    providerService.updateWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.updateWhere
    >;
    providerService.update = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerService.update
    >;
    providerCredentialsService.getAllCredentialsCategory = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerCredentialsService.getAllCredentialsCategory
    >;
    providerAddressService.create = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerAddressService.create
    >;
    providerAddressService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerAddressService.findOneWhere
    >;
    providerAddressService.updateWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof providerAddressService.updateWhere
    >;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile data', async () => {
      const req: any = { user: { id: '1' } };
      providerService.findProfileData.mockResolvedValue(new Provider());
      const result = await controller.getProfile(req);
      expect(providerService.findProfileData).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
          data: new Provider(),
        }),
      );
    });

    it('should return profile data', async () => {
      const req: any = { user: { id: '1' } };
      providerService.findProfileData.mockResolvedValue(null);
      const result = await controller.getProfile(req);
      expect(providerService.findProfileData).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should handle errors during the contact details process', async () => {
      const errorMessage = 'Error creating contact';
      const req: any = { user: { id: '1' } };
      providerService.findProfileData.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.getProfile(req);

      expect(providerService.findProfileData).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('addProviderData', () => {
    const id = '1';
    it('should return bad request if user not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.addProviderData(
        id,
        new AddProviderDataDto(),
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, profile_status: Not(USER_STATUS.deleted) },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('update user', async () => {
      const provider = new Provider();
      const address: CreateProviderAddressDto = {
        id: '1',
        street: 'C-43, Ashram road',
        apartment: '',
        zip_code: '382350',
        latitude: '4',
        longitude: '3',
        place_id: '1',
        country: '1',
        city: '2',
        state: '3',
        provider: provider, // Ensure the provider is correctly mocked
      };

      const addProviderDataDto = new AddProviderDataDto();
      addProviderDataDto.address = {
        id: '1',
        street: 'C-43, Ashram road',
        apartment: '',
        zip_code: '382350',
        country: '1',
        city: '2',
        place_id: '1',
        state: '3',
        latitude: '4',
        longitude: '3',
      };

      providerService.findOneWhere.mockResolvedValue(provider);
      providerAddressService.findOneWhere.mockResolvedValue({
        id: '1',
        street: 'C-43, Ashram road',
        apartment: '',
        zip_code: '382350',
        latitude: '4',
        longitude: '3',
        place_id: '1',
        country: '1',
        city: '2',
        state: '3',
        provider: provider,
      });
      providerAddressService.create.mockResolvedValue(new ProviderAddress());
      providerService.addProviderData.mockResolvedValue({ affected: 1 });

      const result = await controller.addProviderData(id, addProviderDataDto);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, profile_status: Not(USER_STATUS.deleted) },
      });
      expect(providerAddressService.create).toHaveBeenCalledWith(address);
      expect(providerService.addProviderData).toHaveBeenCalledWith(
        { id: id },
        addProviderDataDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Staff'),
          data: {},
        }),
      );
    });

    it('update user', async () => {
      const provider = new Provider();
      const address: CreateProviderAddressDto = {
        street: 'C-43, Ashram road',
        apartment: '',
        zip_code: '382350',
        latitude: '4',
        longitude: '3',
        place_id: '1',
        country: '1',
        city: '2',
        state: '3',
        provider: provider, // Ensure the provider is correctly mocked
      };

      const addProviderDataDto = new AddProviderDataDto();
      addProviderDataDto.address = {
        street: 'C-43, Ashram road',
        apartment: '',
        zip_code: '382350',
        country: '1',
        city: '2',
        place_id: '1',
        state: '3',
        latitude: '4',
        longitude: '3',
      };

      providerService.findOneWhere.mockResolvedValue(provider);
      providerAddressService.create.mockResolvedValue(new ProviderAddress());
      providerService.addProviderData.mockResolvedValue({ affected: 0 });

      const result = await controller.addProviderData(id, addProviderDataDto);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, profile_status: Not(USER_STATUS.deleted) },
      });
      expect(providerAddressService.create).toHaveBeenCalledWith(address);
      expect(providerService.addProviderData).toHaveBeenCalledWith(
        { id: id },
        addProviderDataDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should handle errors during the contact details process', async () => {
      const errorMessage = 'Error creating contact';
      providerService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.addProviderData(
        'id',
        new AddProviderDataDto(),
      );

      expect(providerService.findOneWhere).toHaveBeenCalled();
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('updateProfile', () => {
    const id = '1';
    it('should return bad request if user not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.updateProfile(id, new EditProviderDto());
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id, profile_status: Not(USER_STATUS.deleted) },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('should return a bad request if updated email or mobile number already exists', async () => {
      const id = '1';
      const editProviderDto = new EditProviderDto();
      editProviderDto.email = 'john@example.com';
      editProviderDto.mobile_no = '1234567890';
      editProviderDto.country_code = '+91';
      providerService.findOneWhere
        .mockResolvedValueOnce({
          id,
          email: 'john@example.com',
          mobile_no: '1234567890',
        }) // User exists
        .mockResolvedValueOnce(true); // Duplicate found

      const result = await controller.updateProfile(id, editProviderDto);

      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: [
          {
            email: editProviderDto.email,
            id: Not(id),
            profile_status: Not(USER_STATUS.deleted),
          },
          {
            country_code: editProviderDto.country_code,
            mobile_no: editProviderDto.mobile_no,
            id: Not(id),
            profile_status: Not(USER_STATUS.deleted),
          },
        ],
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.EMAIL_OR_MOBILE_ALREADY_EXIST,
          data: {},
        }),
      );
    });

    it('should update provider profile successfully', async () => {
      const id = '1';
      const editProviderDto = new EditProviderDto();
      Object.assign(editProviderDto, {
        email: 'newemail@example.com',
        country_code: '+1',
        mobile_no: '1234567890',
        profile_image: null,
        signature_image: 'signature.jpg',
        address: {
          id: 'address1',
          street: 'New Street',
          city: 'New City',
          country: 'New Country',
          state: 'New State',
          zip_code: '123456',
          apartment: 'test',
        },
      });

      const provider = new Provider();
      provider.profile_image = 'update_profile.jpg';
      provider.signature_image = 'update_signature.jpg';
      provider.id = id;

      // First call to findOneWhere to get the provider by ID
      providerService.findOneWhere.mockResolvedValueOnce(provider);
      // Second call to findOneWhere to check for email/mobile conflicts
      providerService.findOneWhere.mockResolvedValueOnce(null);
      providerAddressService.findOneWhere.mockResolvedValue(
        new ProviderAddress(),
      );
      providerService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.updateProfile(id, editProviderDto);

      // Check the first call to findOneWhere (by ID)
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(1, {
        where: { id, profile_status: Not(USER_STATUS.deleted) },
      });

      // Check the second call to findOneWhere (email/mobile conflicts)
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          {
            email: editProviderDto.email,
            id: Not(id),
            profile_status: Not(USER_STATUS.deleted),
          },
          {
            id: Not(id),
            country_code: editProviderDto.country_code,
            mobile_no: editProviderDto.mobile_no,
            profile_status: Not(USER_STATUS.deleted),
          },
        ],
      });

      // Check the call to findOneWhere for the address
      expect(providerAddressService.findOneWhere).toHaveBeenCalledWith({
        where: { id: editProviderDto.address.id },
      });
      expect(deleteFile).toHaveBeenCalledWith(provider.signature_image);

      // Check the call to updateWhere for the address
      expect(providerAddressService.updateWhere).toHaveBeenCalledWith(
        { id: editProviderDto.address.id },
        editProviderDto.address,
      );

      // Check the call to updateWhere for the provider
      expect(providerService.updateWhere).toHaveBeenCalledWith(
        { id: provider.id },
        editProviderDto,
      );

      // Check the response
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Staff'),
          data: {},
        }),
      );
    });

    it('should update provider profile successfully', async () => {
      const id = '1';
      const editProviderDto = new EditProviderDto();
      Object.assign(editProviderDto, {
        email: 'newemail@example.com',
        country_code: '+1',
        mobile_no: '1234567890',
        profile_image: 'profile.jpg',
        signature_image: null,
        address: {
          id: 'address1',
          street: 'New Street',
          city: 'New City',
          country: 'New Country',
          state: 'New State',
          zip_code: '123456',
          apartment: 'test',
        },
      });

      const provider = new Provider();
      provider.profile_image = 'update_profile.jpg';
      provider.signature_image = 'update_signature.jpg';
      provider.id = id;

      // First call to findOneWhere to get the provider by ID
      providerService.findOneWhere.mockResolvedValueOnce(provider);
      // Second call to findOneWhere to check for email/mobile conflicts
      providerService.findOneWhere.mockResolvedValueOnce(null);
      providerAddressService.findOneWhere.mockResolvedValue(
        new ProviderAddress(),
      );
      providerService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.updateProfile(id, editProviderDto);

      // Check the first call to findOneWhere (by ID)
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(1, {
        where: { id, profile_status: Not(USER_STATUS.deleted) },
      });

      // Check the second call to findOneWhere (email/mobile conflicts)
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          {
            email: editProviderDto.email,
            id: Not(id),
            profile_status: Not(USER_STATUS.deleted),
          },
          {
            id: Not(id),
            country_code: editProviderDto.country_code,
            mobile_no: editProviderDto.mobile_no,
            profile_status: Not(USER_STATUS.deleted),
          },
        ],
      });

      // Check the call to findOneWhere for the address
      expect(providerAddressService.findOneWhere).toHaveBeenCalledWith({
        where: { id: editProviderDto.address.id },
      });
      expect(deleteFile).toHaveBeenCalledWith(provider.profile_image);

      // Check the call to updateWhere for the address
      expect(providerAddressService.updateWhere).toHaveBeenCalledWith(
        { id: editProviderDto.address.id },
        editProviderDto.address,
      );

      // Check the call to updateWhere for the provider
      expect(providerService.updateWhere).toHaveBeenCalledWith(
        { id: provider.id },
        editProviderDto,
      );

      // Check the response
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should update provider profile successfully', async () => {
      const id = '1';
      const editProviderDto = new EditProviderDto();
      Object.assign(editProviderDto, {
        email: 'newemail@example.com',
        country_code: '+1',
        mobile_no: '1234567890',
        profile_image: 'profile.jpg',
        signature_image: 'signature.jpg',
        address: {
          id: 'address1',
          street: 'New Street',
          city: 'New City',
          country: 'New Country',
          state: 'New State',
          zip_code: '123456',
          apartment: 'test',
        },
      });

      const provider = new Provider();
      provider.profile_image = 'update_profile.jpg';
      provider.signature_image = 'update_signature.jpg';
      provider.id = id;

      // First call to findOneWhere to get the provider by ID
      providerService.findOneWhere.mockResolvedValueOnce(provider);
      // Second call to findOneWhere to check for email/mobile conflicts
      providerService.findOneWhere.mockResolvedValueOnce(null);
      providerAddressService.findOneWhere.mockResolvedValue(
        new ProviderAddress(),
      );
      providerService.updateWhere.mockResolvedValue({ affected: 1 });

      // Call the controller method
      const result = await controller.updateProfile(id, editProviderDto);

      // Check the first call to findOneWhere (by ID)
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(1, {
        where: { id, profile_status: Not(USER_STATUS.deleted) },
      });

      // Check the second call to findOneWhere (email/mobile conflicts)
      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(2, {
        where: [
          {
            email: editProviderDto.email,
            id: Not(id),
            profile_status: Not(USER_STATUS.deleted),
          },
          {
            id: Not(id),
            country_code: editProviderDto.country_code,
            mobile_no: editProviderDto.mobile_no,
            profile_status: Not(USER_STATUS.deleted),
          },
        ],
      });

      expect(providerService.updateWhere).toHaveBeenCalledWith(
        { id: provider.id },
        editProviderDto,
      );

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Staff'),
          data: {},
        }),
      );
    });

    it('should return error if address not found', async () => {
      const id = '1';
      const editProviderDto = new EditProviderDto();
      Object.assign(editProviderDto, {
        address: {
          id: 'address1',
          street: 'New Street',
          city: 'New City',
          country: 'New Country',
          state: 'New State',
          zip_code: '123456',
          apartment: 'test',
        },
      });

      const provider = new Provider();
      provider.id = id;

      providerService.findOneWhere.mockResolvedValueOnce(provider);
      providerAddressService.findOneWhere.mockResolvedValueOnce(null);

      const result = await controller.updateProfile(id, editProviderDto);

      expect(providerService.findOneWhere).toHaveBeenNthCalledWith(1, {
        where: { id, profile_status: Not(USER_STATUS.deleted) },
      });
      expect(providerAddressService.findOneWhere).toHaveBeenNthCalledWith(1, {
        where: { id: editProviderDto.address.id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Address'),
          data: {},
        }),
      );
    });

    it('should return error if update operation fails', async () => {
      const errorMessage = 'Error creating contact';
      providerService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const id = '1';
      const editProviderDto = new EditProviderDto();

      const result = await controller.updateProfile(id, editProviderDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('updatePreferenceSetting', () => {
    const req: any = { user: { id: '1' } };
    const updatePreferenceSettingDto = new UpdatePreferenceSettingDto();
    it('should return not found if data not updated', async () => {
      providerService.update.mockResolvedValue({ affected: 0 });
      const result = await controller.updatePreferenceSetting(
        req,
        updatePreferenceSettingDto,
      );
      expect(providerService.update).toHaveBeenCalledWith(
        req.user.id,
        updatePreferenceSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Preference Setting'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      providerService.update.mockResolvedValue({ affected: 1 });
      const result = await controller.updatePreferenceSetting(
        req,
        updatePreferenceSettingDto,
      );
      expect(providerService.update).toHaveBeenCalledWith(
        req.user.id,
        updatePreferenceSettingDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Preference Setting'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      const error = new Error('error');
      providerService.update.mockRejectedValue(error);
      const result = await controller.updatePreferenceSetting(
        req,
        updatePreferenceSettingDto,
      );
      expect(providerService.update).toHaveBeenCalledWith(
        req.user.id,
        updatePreferenceSettingDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateSignature', () => {
    const req: any = { user: { id: '1' } };
    const providerSignatureDto = new ProviderSignatureDto();
    it('should return bad request if data not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.updateSignature(
        req,
        providerSignatureDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
        },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.WRONG_CREDENTIALS,
          data: {},
        }),
      );
    });

    it('should update provider signature', async () => {
      const provider = new Provider();
      provider.signature_image = 'demo.jpg';
      providerSignatureDto.signature_image = 'signature.jpg';
      providerService.findOneWhere.mockResolvedValue(provider);
      providerService.updateWhere.mockResolvedValue({ affected: 0 });
      const result = await controller.updateSignature(
        req,
        providerSignatureDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
        },
      });
      expect(deleteFile).toHaveBeenCalledWith(provider.signature_image);
      expect(providerService.updateWhere).toHaveBeenCalledWith(
        { id: provider.id },
        providerSignatureDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
          data: {},
        }),
      );
    });

    it('should update provider signature', async () => {
      const provider = new Provider();
      provider.signature_image = 'demo.jpg';
      providerSignatureDto.signature_image = 'signature.jpg';
      providerService.findOneWhere.mockResolvedValue(provider);
      providerService.updateWhere.mockResolvedValue({ affected: 1 });
      const result = await controller.updateSignature(
        req,
        providerSignatureDto,
      );
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: req.user.id,
        },
      });
      expect(deleteFile).toHaveBeenCalledWith(provider.signature_image);
      expect(providerService.updateWhere).toHaveBeenCalledWith(
        { id: provider.id },
        providerSignatureDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Signature'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      providerService.findOneWhere.mockRejectedValue(error);
      const result = await controller.updateSignature(
        req,
        providerSignatureDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto = new FilterProviderListDto();
    it('should return not found if list is blank', async () => {
      const provider = [];
      const count = provider.length;
      providerService.findAllV2.mockResolvedValue([provider, count]);
      const result = await controller.findAll(queryParamsDto);
      expect(providerService.findAllV2).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return provider list', async () => {
      const provider = [new Provider()];
      const count = provider.length;
      providerService.findAllV2.mockResolvedValue([provider, count]);
      const result = await controller.findAll(queryParamsDto);
      expect(providerService.findAllV2).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: provider,
        }),
      );
    });
    it('should handle failure case', async () => {
      const error = new Error('error');
      providerService.findAllV2.mockRejectedValue(error);
      const result = await controller.findAll(queryParamsDto);
      expect(providerService.findAllV2).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return not found if there is not record', async () => {
      providerService.findOneV2.mockResolvedValue(null);
      const result = await controller.findOne(id);
      expect(providerService.findOneV2).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return data if found', async () => {
      providerService.findOneV2.mockResolvedValue(new Provider());
      const result = await controller.findOne(id);
      expect(providerService.findOneV2).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
          data: new Provider(),
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      providerService.findOneV2.mockRejectedValue(error);
      const result = await controller.findOne(id);
      expect(providerService.findOneV2).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateProviderDto = new RejectFacilityDto();
    updateProviderDto.status = USER_STATUS.accepted;
    updateProviderDto.reason = '1';
    updateProviderDto.reason_description = ' test';
    it('should return not found if data not updated', async () => {
      providerService.update.mockResolvedValue({ affected: 0 });
      const result = await controller.update(id, updateProviderDto);
      expect(providerService.update).toHaveBeenCalledWith(id, {
        reason: { id: updateProviderDto.reason },
        reason_description: updateProviderDto.reason_description || '',
        verification_status: VERIFICATION_STATUS.rejected,
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      providerService.update.mockResolvedValue({ affected: 1 });
      notificationService.createUserSpecificNotification = jest.fn();
      firebaseNotificationService.sendNotificationToOne = jest.fn();
      const result = await controller.update(id, updateProviderDto);
      expect(providerService.update).toHaveBeenCalledWith(id, {
        reason: { id: updateProviderDto.reason },
        reason_description: updateProviderDto.reason_description || '',
        verification_status: VERIFICATION_STATUS.rejected,
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Staff Rejected'),
          data: {},
        }),
      );
    });

    it('should return success message if data updated', async () => {
      updateProviderDto.reason_description = null;
      const error = new Error('error');
      providerService.update.mockRejectedValue(error);
      const result = await controller.update(id, updateProviderDto);
      expect(providerService.update).toHaveBeenCalledWith(id, {
        reason: { id: updateProviderDto.reason },
        reason_description: '',
        verification_status: VERIFICATION_STATUS.rejected,
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllProviderList', () => {
    const queryParamsDto = new FilterProviderListDto();
    it('should return not found if data is blank', async () => {
      const provider = [];
      const count = provider.length;
      providerService.findAllV2.mockResolvedValue([provider, count]);
      const result = await controller.getAllProviderList(queryParamsDto);
      expect(providerService.findAllV2).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Staff'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should return provider list', async () => {
      const provider = [new Provider()];
      const count = provider.length;
      providerService.findAllV2.mockResolvedValue([provider, count]);
      const result = await controller.getAllProviderList(queryParamsDto);
      expect(providerService.findAllV2).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff'),
          total: count,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: provider,
        }),
      );
    });

    it('should handle failure test case', async () => {
      const error = new Error('error');
      providerService.findAllV2.mockRejectedValue(error);
      const result = await controller.getAllProviderList(queryParamsDto);
      expect(providerService.findAllV2).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllCredentials', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.getAllCredentials(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { certificate: true, speciality: true },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return provider list', async () => {
      const provider = new Provider();
      provider.certificate = new Certificate();
      const credentials = [new CredentialsCategory()];
      const competencyTest = [new CompetencyTestSetting()];
      const skillChecklist = [new SkillChecklistTemplate()];
      providerService.findOneWhere.mockResolvedValue(provider);
      providerCredentialsService.getAllCredentialsCategory.mockResolvedValue(
        credentials,
      );
      competencyTestResponseService.getAllTest.mockResolvedValue(
        competencyTest,
      );
      providerService.getSkillChecklist.mockResolvedValue(skillChecklist);
      const result = await controller.getAllCredentials(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { certificate: true, speciality: true },
      });
      expect(
        providerCredentialsService.getAllCredentialsCategory,
      ).toHaveBeenCalledWith(provider, true);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Credentials'),
          data: {
            credentials,
            competency_test: competencyTest,
            skill_checklist: skillChecklist,
          },
        }),
      );
    });

    it('should handle failure test case', async () => {
      const error = new Error('error');
      providerService.findOneWhere.mockRejectedValue(error);
      const result = await controller.getAllCredentials(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
        relations: { certificate: true, speciality: true },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllTests', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);
      const result = await controller.getAllTests(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return test data', async () => {
      const provider = new Provider();
      const test = [new CompetencyTestScore()];
      providerService.findOneWhere.mockResolvedValue(provider);
      competencyTestResponseService.getAllTest.mockResolvedValue(test);
      const result = await controller.getAllTests(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(competencyTestResponseService.getAllTest).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Test'),
          data: test,
        }),
      );
    });

    it('should handle failure test case', async () => {
      const error = new Error('error');
      providerService.findOneWhere.mockRejectedValue(error);
      const result = await controller.getAllTests(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProviderDetails', () => {
    const id = '1';
    const query = new QueryParamsDto();
    query.start_date = '2025-08-28';
    query.end_date = '2025-08-28';

    it('should return bad request if data not found', async () => {
      providerService.getProviderDetails.mockResolvedValue(null);

      const result = await controller.getProviderDetails(id, query);
      expect(providerService.getProviderDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return provider details', async () => {
      const provider = new Provider();

      providerService.getProviderDetails.mockResolvedValue(id);
      providerService.getProviderMetrics.mockResolvedValue(id, query);
      providerService.getProviderPerformance.mockResolvedValue(provider);

      const result = await controller.getProviderDetails(id, query);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Staff Details'),
          data: {
            provider: id,
            metric: id,
            performance: provider,
          },
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      providerService.getProviderDetails.mockRejectedValue(error);

      const result = await controller.getProviderDetails(id, query);
      expect(providerService.getProviderDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getProviderExperience', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      providerService.findOneWhere.mockResolvedValue(null);

      const result = await controller.getProviderExperience(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Staff'),
          data: {},
        }),
      );
    });

    it('should return all experiences', async () => {
      providerService.findOneWhere.mockResolvedValue(new Provider());
      const mockWork = [new ProviderWorkHistory()];
      const mockEducation = [new ProviderEducationHistory()];
      const mockReference = [new ProviderProfessionalReference()];
      providerWorkHistoryService.findAll.mockResolvedValue([mockWork, 1]);
      providerEducationHistoryService.findAll.mockResolvedValue([
        mockEducation,
        1,
      ]);
      providerProfessionalReferenceService.findAll.mockResolvedValue([
        mockReference,
        1,
      ]);

      const result = await controller.getProviderExperience(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(providerWorkHistoryService.findAll).toHaveBeenCalledWith({
        where: { provider: { id } },
      });
      expect(providerEducationHistoryService.findAll).toHaveBeenCalledWith({
        where: { provider: { id } },
      });
      expect(providerProfessionalReferenceService.findAll).toHaveBeenCalledWith(
        {
          where: { provider: { id } },
        },
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Experience'),
          data: {
            work_history: mockWork,
            education_history: mockEducation,
            professional_reference: mockReference,
          },
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      providerService.findOneWhere.mockRejectedValue(error);

      const result = await controller.getProviderExperience(id);
      expect(providerService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

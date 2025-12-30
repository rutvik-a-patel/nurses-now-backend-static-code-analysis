import { Test, TestingModule } from '@nestjs/testing';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { Certificate } from './entities/certificate.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('CertificateController', () => {
  let controller: CertificateController;
  let certificateService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateController],
      providers: [
        {
          provide: CertificateService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            getAllContacts: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
            getCertificateDetails: jest.fn(),
            isCertificateUsed: jest.fn(),
            checkName: jest.fn(),
          },
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

    controller = module.get<CertificateController>(CertificateController);
    certificateService = module.get<CertificateService>(CertificateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCertificate', () => {
    it('should return a bad request if the certificate already exists', async () => {
      const createCertificateDto = new CreateCertificateDto();
      createCertificateDto.name = 'Test Certificate';

      certificateService.checkName.mockResolvedValue(new Certificate()); // Simulate finding an existing certificate

      const result = await controller.createCertificate(createCertificateDto);

      expect(certificateService.checkName).toHaveBeenCalledWith(
        createCertificateDto, // FIX: pass full DTO
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('License or Abbreviation'),
          data: {},
        }),
      );
    });

    it('should successfully create a certificate', async () => {
      const createCertificateDto = new CreateCertificateDto();
      createCertificateDto.name = 'New Certificate';

      certificateService.checkName.mockResolvedValue(null); // No existing certificate found
      certificateService.create.mockResolvedValue({
        id: '123',
        name: 'New Certificate',
      }); // Simulate successful certificate creation

      const result = await controller.createCertificate(createCertificateDto);

      expect(certificateService.checkName).toHaveBeenCalledWith(
        createCertificateDto, // FIX: pass full DTO
      );
      expect(certificateService.create).toHaveBeenCalledWith(
        createCertificateDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('License'),
          data: { id: '123', name: 'New Certificate' },
        }),
      );
    });

    it('should handle errors during certificate creation', async () => {
      const createCertificateDto = new CreateCertificateDto();
      createCertificateDto.name = 'Error Certificate';

      const error = new Error('Database Error');
      certificateService.checkName.mockRejectedValue(error); // Simulate an error during the findOne operation

      const result = await controller.createCertificate(createCertificateDto);

      expect(certificateService.checkName).toHaveBeenCalledWith(
        createCertificateDto, // FIX: pass full DTO
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateCertificate', () => {
    it('should return a bad request if the certificate does not exist', async () => {
      const id = '1';
      const updateCertificateDto = new UpdateCertificateDto();
      updateCertificateDto.name = 'Updated Name';

      certificateService.findOneWhere.mockResolvedValue(null);

      const result = await controller.updateCertificate(
        id,
        updateCertificateDto,
      );

      expect(certificateService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('License'),
          data: {},
        }),
      );
    });

    it('should return a bad request if another certificate with the same name exists', async () => {
      const id = '1';
      const updateCertificateDto = new UpdateCertificateDto();
      updateCertificateDto.name = 'Existing Name';

      certificateService.findOneWhere.mockResolvedValueOnce(new Certificate()); // Mock finding the certificate to update
      certificateService.checkName.mockResolvedValueOnce({ id: '2' }); // Mock finding another certificate with the same name

      const result = await controller.updateCertificate(
        id,
        updateCertificateDto,
      );

      expect(certificateService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });

      expect(certificateService.checkName).toHaveBeenCalledWith(
        updateCertificateDto, // FIX: pass full DTO
      );

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('License or Abbreviation'),
          data: {},
        }),
      );
    });

    it('should successfully update the certificate', async () => {
      const id = '1';
      const updateCertificateDto = new UpdateCertificateDto();
      updateCertificateDto.name = 'Updated Name';

      certificateService.findOneWhere.mockResolvedValueOnce(new Certificate()); // Mock finding the certificate
      certificateService.checkName.mockResolvedValueOnce(null);

      certificateService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.updateCertificate(
        id,
        updateCertificateDto,
      );

      expect(certificateService.checkName).toHaveBeenCalledWith(
        updateCertificateDto, // FIX: pass full DTO
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('License'),
          data: {},
        }),
      );
    });

    it('should return an error if no records were updated', async () => {
      const id = '1';
      const updateCertificateDto = new UpdateCertificateDto();

      certificateService.findOneWhere.mockResolvedValueOnce(new Certificate()); // Mock finding the certificate
      certificateService.checkName.mockResolvedValueOnce(null); // No conflicting name found

      certificateService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.updateCertificate(
        id,
        updateCertificateDto,
      );

      expect(certificateService.checkName).toHaveBeenCalledWith(
        updateCertificateDto, // FIX: pass full DTO
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('License'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const id = '1';
      const updateCertificateDto = new UpdateCertificateDto();
      const error = new Error('Unexpected Error');

      certificateService.findOneWhere.mockRejectedValue(error);

      const result = await controller.updateCertificate(
        id,
        updateCertificateDto,
      );

      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    it('should return the certificate if found', async () => {
      const id = '1';
      const expectedCertificate = new Certificate();
      expectedCertificate.id = id;
      expectedCertificate.name = 'Test Certificate';

      certificateService.getCertificateDetails.mockResolvedValue(
        expectedCertificate,
      );

      const result = await controller.findOne(id);

      expect(certificateService.getCertificateDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('License'),
          data: expectedCertificate,
        }),
      );
    });

    it('should return a bad request if the certificate is not found', async () => {
      const id = '2';
      certificateService.getCertificateDetails.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(certificateService.getCertificateDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('License'),
          data: {},
        }),
      );
    });

    it('should handle errors during the retrieval process', async () => {
      const id = '3';
      const error = new Error('Database Error');
      certificateService.getCertificateDetails.mockRejectedValue(error);

      const result = await controller.findOne(id);

      expect(certificateService.getCertificateDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    const queryParamsDto: QueryParamsDto = {
      limit: '10',
      offset: '0',
      search: 'John',
      order: { created_at: 'ASC' },
    };
    it('should successfully retrieve certificates', async () => {
      const mockCertificate = Array(10).fill(new Certificate());
      const mockCount = 10;

      certificateService.findAll.mockResolvedValue([
        mockCertificate,
        mockCount,
      ]); // Mock service response

      const result = await controller.findAll(queryParamsDto);

      expect(certificateService.findAll).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('License'),
          total: mockCount,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockCertificate,
        }),
      );
    });

    it('should return no records found when there are no certificates', async () => {
      certificateService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);
      expect(certificateService.findAll).toHaveBeenCalledWith(queryParamsDto);
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('License'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors during the fetch process', async () => {
      const errorMessage = 'Database error';
      certificateService.findAll.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('remove', () => {
    it('should return a success response when a certificate is successfully deleted', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.1';

      certificateService.isCertificateUsed.mockResolvedValue(false); // FIX: always check usage first
      certificateService.remove.mockResolvedValue({ affected: 1 }); // Simulate successful deletion

      const result = await controller.remove(id, deleteDto);

      expect(certificateService.isCertificateUsed).toHaveBeenCalledWith(id); // FIX: always check usage first
      expect(certificateService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('License'),
          data: {},
        }),
      );
    });

    it('should not delete certificate when it is already in use', async () => {
      const id = '1';
      const deleteDto = new DeleteDto();
      certificateService.isCertificateUsed.mockResolvedValue(true);
      const result = await controller.remove(id, deleteDto);
      expect(certificateService.isCertificateUsed).toHaveBeenCalledWith(id);
      expect(certificateService.remove).not.toHaveBeenCalled(); // FIX: should not call remove if in use
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('License'),
          data: {},
        }),
      );
    });

    it('should return a not found response when no certificate is deleted', async () => {
      const id = '2';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.2';

      certificateService.isCertificateUsed.mockResolvedValue(false); // FIX: always check usage first
      certificateService.remove.mockResolvedValue({ affected: 0 }); // Simulate no records affected

      const result = await controller.remove(id, deleteDto);

      expect(certificateService.isCertificateUsed).toHaveBeenCalledWith(id); // FIX: always check usage first
      expect(certificateService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('License'),
          data: {},
        }),
      );
    });

    it('should handle errors during the deletion process', async () => {
      const id = '3';
      const deleteDto = new DeleteDto();
      deleteDto.deleted_at_ip = '192.168.1.3';
      const error = new Error('Database error');

      certificateService.isCertificateUsed.mockResolvedValue(false); // FIX: always check usage first
      certificateService.remove.mockRejectedValue(error); // Simulate an error

      const result = await controller.remove(id, deleteDto);

      expect(certificateService.isCertificateUsed).toHaveBeenCalledWith(id); // FIX: always check usage first
      expect(certificateService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SpecialityController } from './speciality.controller';
import { SpecialityService } from './speciality.service';
import response from '../shared/response';
import { Speciality } from './entities/speciality.entity';
import { CONSTANT } from '@/shared/constants/message';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('SpecialityController', () => {
  let controller: SpecialityController;
  let specialityService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecialityController],
      providers: [
        {
          provide: SpecialityService,
          useValue: {
            create: jest.fn(),
            findOneWhere: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
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

    controller = module.get<SpecialityController>(SpecialityController);
    specialityService = module.get<SpecialityService>(SpecialityService);

    // Initialize each method as a Jest mock directly
    specialityService.findOneWhere = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof specialityService.findOneWhere
    >;
    specialityService.create = jest
      .fn()
      .mockResolvedValue(new Speciality()) as jest.MockedFunction<
      typeof specialityService.create
    >;
    specialityService.update = jest
      .fn()
      .mockResolvedValue({ affected: 1 }) as jest.MockedFunction<
      typeof specialityService.update
    >;
    specialityService.remove = jest
      .fn()
      .mockResolvedValue([[new Speciality()], 1]) as jest.MockedFunction<
      typeof specialityService.remove
    >;
    specialityService.findAll = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof specialityService.findAll
    >;
    specialityService.isSpecialityUsed = jest
      .fn()
      .mockResolvedValue(false) as jest.MockedFunction<
      typeof specialityService.isSpecialityUsed
    >;
    specialityService.checkName = jest
      .fn()
      .mockResolvedValue(null) as jest.MockedFunction<
      typeof specialityService.checkName
    >;
    specialityService.getSpecialityDetails = jest
      .fn()
      .mockResolvedValue(new Speciality()) as jest.MockedFunction<
      typeof specialityService.getSpecialityDetails
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests go here
  describe('createSpeciality', () => {
    const createSpecialityDto: any = {
      name: 'New Speciality',
      abbreviation: 'New Speciality',
    };

    it('should create a new speciality successfully', async () => {
      specialityService.checkName.mockResolvedValue(null);
      specialityService.create.mockResolvedValue(createSpecialityDto);

      const result = await controller.createSpeciality(createSpecialityDto);

      expect(specialityService.checkName).toHaveBeenCalledWith(
        createSpecialityDto,
      );

      expect(specialityService.create).toHaveBeenCalledWith(
        createSpecialityDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Specialty'),
          data: createSpecialityDto,
        }),
      );
    });

    it('should return bad request if speciality already exists', async () => {
      specialityService.checkName.mockResolvedValue(createSpecialityDto);

      const result = await controller.createSpeciality(createSpecialityDto);

      expect(specialityService.checkName).toHaveBeenCalledWith(
        createSpecialityDto,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Specialty or Abbreviation'),
          data: {},
        }),
      );
    });

    it('should handle errors during the speciality creation process', async () => {
      const createSpecialityDto = new CreateSpecialityDto();
      createSpecialityDto.name = 'Error speciality';

      const error = new Error('Database Error');
      specialityService.checkName.mockRejectedValue(error); // Simulate an error during the findOne operation

      const result = await controller.createSpeciality(createSpecialityDto);

      expect(specialityService.checkName).toHaveBeenCalledWith(
        createSpecialityDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('updateSpeciality', () => {
    const id = '1';
    const updateSpecialityDto: any = {
      name: 'New Speciality',
      abbreviation: 'New Speciality',
    };

    it('should return a bad request if speciality is found for the given id', async () => {
      specialityService.findOneWhere.mockResolvedValue(null); // No user found

      const result = await controller.updateSpeciality(id, updateSpecialityDto);

      expect(specialityService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Specialty'),
          data: {},
        }),
      );
    });

    it('should return bad request if speciality with same name already exists', async () => {
      specialityService.findOneWhere.mockResolvedValue(new Speciality()); // Duplicate found
      specialityService.checkName.mockResolvedValueOnce(new Speciality());
      const result = await controller.updateSpeciality(id, updateSpecialityDto);

      expect(specialityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(specialityService.checkName).toHaveBeenCalledWith(
        updateSpecialityDto,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('Specialty or Abbreviation'),
          data: {},
        }),
      );
    });

    it('should successfully update the speciality if no duplicates are found', async () => {
      specialityService.findOneWhere.mockResolvedValueOnce(new Speciality()); // Mock finding the certificate
      specialityService.checkName.mockResolvedValueOnce(null);

      specialityService.update.mockResolvedValue({ affected: 0 }); // Update successful

      const result = await controller.updateSpeciality(id, updateSpecialityDto);

      expect(specialityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(specialityService.checkName).toHaveBeenCalledWith(
        updateSpecialityDto,
      );

      expect(specialityService.update).toHaveBeenCalledWith(
        id,
        updateSpecialityDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Specialty'),
          data: {},
        }),
      );
    });

    it('should successfully update the speciality if no duplicates are found', async () => {
      specialityService.findOneWhere.mockResolvedValueOnce(new Speciality()); // Mock finding the certificate
      specialityService.checkName.mockResolvedValueOnce(null);

      specialityService.update.mockResolvedValue({ affected: 1 }); // Update successful

      const result = await controller.updateSpeciality(id, updateSpecialityDto);

      expect(specialityService.findOneWhere).toHaveBeenCalledWith({
        where: {
          id: id,
        },
      });
      expect(specialityService.checkName).toHaveBeenCalledWith(
        updateSpecialityDto,
      );

      expect(specialityService.update).toHaveBeenCalledWith(
        id,
        updateSpecialityDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Specialty'),
          data: {},
        }),
      );
    });

    it('should handle errors during the update process', async () => {
      const errorMessage = 'Error updating profile';

      // Simulate the user existing and no duplicates
      specialityService.findOneWhere.mockRejectedValue(new Error(errorMessage)); // No duplicate email or mobile

      // Simulate an error in the update process
      specialityService.update.mockRejectedValue(new Error(errorMessage));

      // Corrected to use 'updateSpeciality' instead of 'edit speciality'
      const result = await controller.updateSpeciality(id, updateSpecialityDto);

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findOne', () => {
    const id = '1';

    it('should return speciality if found', async () => {
      const mockSpeciality = {
        id: id,
        name: 'Speciality',
        abbreviation: 'Speciality',
      };

      specialityService.getSpecialityDetails.mockResolvedValue(mockSpeciality);

      const result = await controller.findOne(id);

      expect(specialityService.getSpecialityDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Specialty'),
          data: mockSpeciality,
        }),
      );
    });

    it('should return a bad request if the speciality is not found', async () => {
      specialityService.getSpecialityDetails.mockResolvedValue(null); // Simulate no admin found

      const result = await controller.findOne(id);

      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Specialty'),
          data: {},
        }),
      );
    });

    it('should handle errors during the profile fetching process', async () => {
      const errorMessage = 'Error fetching speciality';
      specialityService.getSpecialityDetails.mockRejectedValue(
        new Error(errorMessage),
      ); // Simulate an error

      const result = await controller.findOne(id);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('findAll', () => {
    const specialities = [new Speciality()];
    const queryParamsDto = new QueryParamsDto();

    it('should return paginated speciality list successfully', async () => {
      specialityService.findAll.mockResolvedValue([specialities, 1]); // Mock specialityService with specialities and count

      const result = await controller.findAll(queryParamsDto);

      expect(specialityService.findAll).toHaveBeenCalledWith(queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Specialty'),
          total: 1,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [new Speciality()],
        }),
      );
    });

    it('should return no speciality found when list is empty', async () => {
      specialityService.findAll.mockResolvedValue([[], 0]);

      const result = await controller.findAll(queryParamsDto);

      expect(specialityService.findAll).toHaveBeenCalledWith(queryParamsDto);

      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Specialty'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when fetching speciality fails', async () => {
      const errorMessage = 'Database error';
      specialityService.findAll.mockRejectedValue(new Error(errorMessage));

      const result = await controller.findAll(queryParamsDto);

      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deletedDto: any = { deleted_at_ip: '127.0.0.1' };

    it('should not delete certificate when it is already in use', async () => {
      const id = '1';
      specialityService.isSpecialityUsed.mockResolvedValue(true);
      const result = await controller.remove(id, deletedDto);
      expect(specialityService.isSpecialityUsed).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('Specialty'),
          data: {},
        }),
      );
    });

    it('should handle delete process', async () => {
      specialityService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deletedDto);
      expect(specialityService.remove).toHaveBeenCalledWith(id, deletedDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Specialty'),
          data: {},
        }),
      );
    });

    it('should return a not found response if no records are deleted', async () => {
      specialityService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deletedDto);

      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Specialty'),
          data: {},
        }),
      );
    });

    it('should handle errors during the delete process', async () => {
      const errorMessage = 'Error deleting speciality';

      // Simulate an error in the update process
      specialityService.remove.mockRejectedValue(new Error(errorMessage));

      const result = await controller.remove(id, deletedDto);

      // Ensure the correct failure response is expected
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});

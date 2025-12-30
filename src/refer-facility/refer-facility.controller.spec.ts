import { Test, TestingModule } from '@nestjs/testing';
import { ReferFacilityController } from './refer-facility.controller';
import { ReferFacilityService } from './refer-facility.service';
import { CreateReferFacilityDto } from './dto/create-refer-facility.dto';
import { ReferFacility } from './entities/refer-facility.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';

describe('ReferFacilityController', () => {
  let controller: ReferFacilityController;
  let referFacilityService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferFacilityController],
      providers: [
        {
          provide: ReferFacilityService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReferFacilityController>(ReferFacilityController);
    referFacilityService =
      module.get<ReferFacilityService>(ReferFacilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const req: any = { user: { id: '1' } };
    const createReferFacilityDto = new CreateReferFacilityDto();
    it('should refer facility', async () => {
      createReferFacilityDto.provider = req.user.id;
      referFacilityService.create.mockResolvedValue(new ReferFacility());

      const result = await controller.create(req, createReferFacilityDto);
      expect(referFacilityService.create).toHaveBeenCalledWith(
        createReferFacilityDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Facility Referred'),
          data: new ReferFacility(),
        }),
      );
    });

    it('should handle failure case', async () => {
      createReferFacilityDto.provider = req.user.id;
      const error = new Error('error');
      referFacilityService.create.mockRejectedValue(error);

      const result = await controller.create(req, createReferFacilityDto);
      expect(referFacilityService.create).toHaveBeenCalledWith(
        createReferFacilityDto,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

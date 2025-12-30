import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';

describe('PermissionController', () => {
  let controller: PermissionController;
  let permissionService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    permissionService = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPermissions', () => {
    it('should get all permission', async () => {
      permissionService.findAll.mockResolvedValue([[new Permission()]]);

      const result = await controller.getAllPermissions();
      expect(permissionService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Permission'),
          data: [new Permission()],
        }),
      );
    });

    it('should handle error while process', async () => {
      const error = new Error('Database Error');
      permissionService.findAll.mockResolvedValue(error);

      const result = await controller.getAllPermissions();
      expect(permissionService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

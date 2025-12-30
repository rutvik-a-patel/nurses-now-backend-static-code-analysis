import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  DepartmentDto,
} from './dto/create-department.dto';
import { Department } from './entities/department.entity';
import { In } from 'typeorm';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let departmentService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        {
          provide: DepartmentService,
          useValue: {
            remove: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DepartmentController>(DepartmentController);
    departmentService = module.get<DepartmentService>(DepartmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const req: any = { user: { id: '1' } };
    const createDepartmentDto = new CreateDepartmentDto();
    it('should create new department', async () => {
      const departmentDto = new DepartmentDto();
      departmentDto.members = ['2'];
      createDepartmentDto.delete_department = ['3'];
      createDepartmentDto.departments = [departmentDto];

      departmentService.remove.mockResolvedValue({ affected: 1 });
      departmentService.create.mockResolvedValue(new Department());

      const result = await controller.create(req, createDepartmentDto);
      expect(departmentService.remove).toHaveBeenCalledWith(
        { id: In(['3']) },
        {
          deleted_at_ip: createDepartmentDto.updated_at_ip,
        },
      );
      expect(departmentService.create).toHaveBeenCalledWith(
        createDepartmentDto.departments,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Department Saved'),
          data: {},
        }),
      );
    });

    it('should create new department', async () => {
      const departmentDto = new DepartmentDto();
      departmentDto.members = ['2'];
      createDepartmentDto.departments = [departmentDto];

      departmentService.create.mockResolvedValue(new Department());

      const result = await controller.create(req, createDepartmentDto);
      expect(departmentService.create).toHaveBeenCalledWith(
        createDepartmentDto.departments,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.SUCCESSFULLY('Department Saved'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const departmentDto = new DepartmentDto();
      departmentDto.members = ['2'];
      createDepartmentDto.delete_department = ['3'];
      createDepartmentDto.departments = [departmentDto];
      const error = new Error('error');

      departmentService.remove.mockRejectedValue(error);

      const result = await controller.create(req, createDepartmentDto);
      expect(departmentService.remove).toHaveBeenCalledWith(
        { id: In(['3']) },
        {
          deleted_at_ip: createDepartmentDto.updated_at_ip,
        },
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('getAllTeams', () => {
    const req: any = { user: { id: '1' } };
    it('should return not found if no list found', async () => {
      departmentService.findAll.mockResolvedValue([]);

      const result = await controller.getAllTeams(req);
      expect(departmentService.findAll).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Department'),
          data: [],
        }),
      );
    });

    it('should return department list found', async () => {
      departmentService.findAll.mockResolvedValue([new Department()]);

      const result = await controller.getAllTeams(req);
      expect(departmentService.findAll).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Department'),
          data: [new Department()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      departmentService.findAll.mockRejectedValue(error);

      const result = await controller.getAllTeams(req);
      expect(departmentService.findAll).toHaveBeenCalledWith(req.user.id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

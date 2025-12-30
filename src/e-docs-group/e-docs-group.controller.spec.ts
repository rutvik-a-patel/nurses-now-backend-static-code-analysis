import { Test, TestingModule } from '@nestjs/testing';
import { EDocsGroupController } from './e-docs-group.controller';
import { EDocsGroupService } from './e-docs-group.service';
import { CreateEDocsGroupDto } from './dto/create-e-docs-group.dto';
import { EDocsGroup } from './entities/e-docs-group.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateEDocsGroupDto } from './dto/update-e-docs-group.dto';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';
import { ILike } from 'typeorm';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('EDocsGroupController', () => {
  let controller: EDocsGroupController;
  let eDocsGroupService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EDocsGroupController],
      providers: [
        {
          provide: EDocsGroupService,
          useValue: {
            checkName: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOneWhere: jest.fn(),
            updateWhere: jest.fn(),
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

    controller = module.get<EDocsGroupController>(EDocsGroupController);
    eDocsGroupService = module.get<EDocsGroupService>(EDocsGroupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createEDocsGroupDto = new CreateEDocsGroupDto();
    it('should return bad request if name already exist', async () => {
      eDocsGroupService.checkName.mockResolvedValue(new EDocsGroup());

      const result = await controller.create(createEDocsGroupDto);
      expect(eDocsGroupService.checkName).toHaveBeenCalledWith(
        createEDocsGroupDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Docs Group'),
          data: {},
        }),
      );
    });

    it('should create e-doc group', async () => {
      eDocsGroupService.checkName.mockResolvedValue(null);
      eDocsGroupService.create.mockResolvedValue(new EDocsGroup());

      const result = await controller.create(createEDocsGroupDto);
      expect(eDocsGroupService.checkName).toHaveBeenCalledWith(
        createEDocsGroupDto.name,
      );
      expect(eDocsGroupService.create).toHaveBeenCalledWith(
        createEDocsGroupDto,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('E-Docs Group'),
          data: new EDocsGroup(),
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsGroupService.checkName.mockRejectedValue(error);

      const result = await controller.create(createEDocsGroupDto);
      expect(eDocsGroupService.checkName).toHaveBeenCalledWith(
        createEDocsGroupDto.name,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findAll', () => {
    it('should return e-docs group list', async () => {
      const query = { search: 'test' } as QueryParamsDto;
      eDocsGroupService.findAll.mockResolvedValue([new EDocsGroup()]);

      const result = await controller.findAll(query);
      expect(eDocsGroupService.findAll).toHaveBeenCalledWith({
        relations: {
          document: true,
        },
        where: [
          { name: ILike(`%${query.search.trim()}%`) },
          { document: { name: ILike(`%${query.search.trim()}%`) } },
        ],
        order: {
          created_at: 'DESC',
          document: {
            created_at: 'DESC',
          },
        },
      });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('E-Docs Group'),
          data: [new EDocsGroup()],
        }),
      );
    });

    it('should handle failure case', async () => {
      const query = { search: 'test' } as QueryParamsDto;
      const error = new Error('error');
      eDocsGroupService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(query);
      expect(eDocsGroupService.findAll).toHaveBeenCalledWith({
        relations: {
          document: true,
        },
        where: [
          { name: ILike(`%${query.search.trim()}%`) },
          { document: { name: ILike(`%${query.search.trim()}%`) } },
        ],
        order: {
          created_at: 'DESC',
          document: {
            created_at: 'DESC',
          },
        },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateEDocsGroupDto = new UpdateEDocsGroupDto();
    it('should return bad request if data not found', async () => {
      eDocsGroupService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateEDocsGroupDto);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Docs Group'),
          data: {},
        }),
      );
    });

    it('should return bad request if name already exist', async () => {
      const mockGroup = new EDocsGroup();
      mockGroup.id = '2';
      eDocsGroupService.findOneWhere.mockResolvedValue(mockGroup);
      eDocsGroupService.checkName.mockResolvedValue(mockGroup);

      const result = await controller.update(id, updateEDocsGroupDto);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(eDocsGroupService.checkName).toHaveBeenCalledWith(
        updateEDocsGroupDto.name,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Docs Group'),
          data: {},
        }),
      );
    });

    it('should return not found if data not updated', async () => {
      const mockGroup = new EDocsGroup();
      mockGroup.id = '1';
      eDocsGroupService.findOneWhere.mockResolvedValue(mockGroup);
      eDocsGroupService.checkName.mockResolvedValue(mockGroup);
      eDocsGroupService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateEDocsGroupDto);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(eDocsGroupService.checkName).toHaveBeenCalledWith(
        updateEDocsGroupDto.name,
      );
      expect(eDocsGroupService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateEDocsGroupDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Docs Group'),
          data: {},
        }),
      );
    });

    it('should update e-docs group', async () => {
      const mockGroup = new EDocsGroup();
      mockGroup.id = '1';
      eDocsGroupService.findOneWhere.mockResolvedValue(mockGroup);
      eDocsGroupService.checkName.mockResolvedValue(mockGroup);
      eDocsGroupService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateEDocsGroupDto);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(eDocsGroupService.checkName).toHaveBeenCalledWith(
        updateEDocsGroupDto.name,
      );
      expect(eDocsGroupService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateEDocsGroupDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('E-Docs Group'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsGroupService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateEDocsGroupDto);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      eDocsGroupService.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Docs Group'),
          data: {},
        }),
      );
    });

    it('should not delete if group is used', async () => {
      const mockGroup = new EDocsGroup();
      mockGroup.id = '1';
      eDocsGroupService.findOneWhere.mockResolvedValue(mockGroup);
      eDocsGroupService.isGroupUsed = jest.fn().mockResolvedValue(true);

      const result = await controller.remove(id);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(eDocsGroupService.isGroupUsed).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.CANNOT_DELETE('E-Docs Group'),
          data: {},
        }),
      );
    });
    it('should delete if group is not used', async () => {
      const mockGroup = new EDocsGroup();
      mockGroup.id = '1';
      eDocsGroupService.findOneWhere.mockResolvedValue(mockGroup);
      eDocsGroupService.isGroupUsed = jest.fn().mockResolvedValue(false);
      eDocsGroupService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(eDocsGroupService.isGroupUsed).toHaveBeenCalledWith(id);
      expect(eDocsGroupService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('E-Doc'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsGroupService.findOneWhere.mockRejectedValue(error);

      const result = await controller.remove(id);
      expect(eDocsGroupService.findOneWhere).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

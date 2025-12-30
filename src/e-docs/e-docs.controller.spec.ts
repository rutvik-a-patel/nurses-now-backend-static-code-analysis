import { Test, TestingModule } from '@nestjs/testing';
import { EDocsController } from './e-docs.controller';
import { EDocsService } from './e-docs.service';
import { CreateEDocDto } from './dto/create-e-doc.dto';
import { EDoc } from './entities/e-doc.entity';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { UpdateEDocDto } from './dto/update-e-doc.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';
import { AccessControlGuard } from '@/shared/guard/access-control.guard';

describe('EDocsController', () => {
  let controller: EDocsController;
  let eDocsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EDocsController],
      providers: [
        {
          provide: EDocsService,
          useValue: {
            checkName: jest.fn(),
            create: jest.fn(),
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

    controller = module.get<EDocsController>(EDocsController);
    eDocsService = module.get<EDocsService>(EDocsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createEDocDto = new CreateEDocDto();
    it('should return bad request if name already exist', async () => {
      eDocsService.checkName.mockResolvedValue(new EDoc());

      const result = await controller.create(createEDocDto);
      expect(eDocsService.checkName).toHaveBeenCalledWith(
        createEDocDto.name,
        createEDocDto.document_group,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Doc'),
          data: {},
        }),
      );
    });

    it('should create e-doc successfully', async () => {
      eDocsService.checkName.mockResolvedValue(null);
      eDocsService.create.mockResolvedValue(new EDoc());

      const result = await controller.create(createEDocDto);
      expect(eDocsService.checkName).toHaveBeenCalledWith(
        createEDocDto.name,
        createEDocDto.document_group,
      );
      expect(eDocsService.create).toHaveBeenCalled();
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('E-Doc'),
          data: new EDoc(),
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsService.checkName.mockRejectedValue(error);

      const result = await controller.create(createEDocDto);
      expect(eDocsService.checkName).toHaveBeenCalledWith(
        createEDocDto.name,
        createEDocDto.document_group,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '1';
    const updateEDocDto = new UpdateEDocDto();
    it('should return bad request if data not found', async () => {
      eDocsService.findOneWhere.mockResolvedValue(null);

      const result = await controller.update(id, updateEDocDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        }),
      );
    });

    it('should return bad request if name already exist', async () => {
      const mockDoc = new EDoc();
      mockDoc.id = '2';
      eDocsService.findOneWhere.mockResolvedValue(mockDoc);
      eDocsService.checkName.mockResolvedValue(mockDoc);

      const result = await controller.update(id, updateEDocDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(eDocsService.checkName).toHaveBeenCalledWith(
        updateEDocDto.name,
        updateEDocDto.document_group,
      );
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.ALREADY_EXISTS('E-Doc'),
          data: {},
        }),
      );
    });

    it('should return not found if no data updated', async () => {
      const mockDoc = new EDoc();
      mockDoc.id = '1';
      eDocsService.findOneWhere.mockResolvedValue(mockDoc);
      eDocsService.checkName.mockResolvedValue(mockDoc);
      eDocsService.updateWhere.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateEDocDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(eDocsService.checkName).toHaveBeenCalledWith(
        updateEDocDto.name,
        updateEDocDto.document_group,
      );
      expect(eDocsService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateEDocDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        }),
      );
    });

    it('should return not found if no data updated', async () => {
      const mockDoc = new EDoc();
      mockDoc.id = '1';
      eDocsService.findOneWhere.mockResolvedValue(mockDoc);
      eDocsService.checkName.mockResolvedValue(mockDoc);
      eDocsService.updateWhere.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateEDocDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(eDocsService.checkName).toHaveBeenCalledWith(
        updateEDocDto.name,
        updateEDocDto.document_group,
      );
      expect(eDocsService.updateWhere).toHaveBeenCalledWith(
        { id },
        updateEDocDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('E-Doc'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsService.findOneWhere.mockRejectedValue(error);

      const result = await controller.update(id, updateEDocDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findOne', () => {
    const id = '1';
    it('should return bad request if data not found', async () => {
      eDocsService.findOneWhere.mockResolvedValue(null);

      const result = await controller.findOne(id);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        }),
      );
    });

    it('should return data successfully', async () => {
      eDocsService.findOneWhere.mockResolvedValue(new EDoc());

      const result = await controller.findOne(id);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_FOUND('E-Doc'),
          data: new EDoc(),
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsService.findOneWhere.mockRejectedValue(error);

      const result = await controller.findOne(id);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '1';
    const deleteDto = new DeleteDto();
    it('should return bad request if data not found', async () => {
      eDocsService.findOneWhere.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        }),
      );
    });

    it('should return not found if data not updated', async () => {
      eDocsService.findOneWhere.mockResolvedValue(new EDoc());
      eDocsService.isEDocUsed = jest.fn().mockResolvedValue(false);
      eDocsService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deleteDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(eDocsService.isEDocUsed).toHaveBeenCalledWith(id);
      expect(eDocsService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('E-Doc'),
          data: {},
        }),
      );
    });

    it('should return success msg if data updated', async () => {
      eDocsService.findOneWhere.mockResolvedValue(new EDoc());
      eDocsService.isEDocUsed = jest.fn().mockResolvedValue(false);
      eDocsService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deleteDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(eDocsService.isEDocUsed).toHaveBeenCalledWith(id);
      expect(eDocsService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('E-Doc'),
          data: {},
        }),
      );
    });

    it('should handle failure case', async () => {
      const error = new Error('error');
      eDocsService.findOneWhere.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);
      expect(eDocsService.findOneWhere).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

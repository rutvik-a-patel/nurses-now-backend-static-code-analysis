import { Test, TestingModule } from '@nestjs/testing';
import { ShiftNoteController } from './shift-note.controller';
import { ShiftNoteService } from './shift-note.service';
import { CreateShiftNoteDto } from './dto/create-shift-note.dto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { ShiftNote } from './entities/shift-note.entity';
import { QueryParamsDto } from '@/shared/dto/query-params.dto';

describe('ShiftNoteController', () => {
  let controller: ShiftNoteController;
  let shiftNoteService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftNoteController],
      providers: [
        {
          provide: ShiftNoteService,
          useValue: {
            create: jest.fn(),
            findByShiftId: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShiftNoteController>(ShiftNoteController);
    shiftNoteService = module.get<ShiftNoteService>(ShiftNoteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createShiftNoteDto = new CreateShiftNoteDto();
    const req: any = { user: { id: '1' } };

    it('should create a shift note successfully', async () => {
      shiftNoteService.create.mockResolvedValue(new ShiftNote());

      const result = await controller.create(createShiftNoteDto, req);

      expect(shiftNoteService.create).toHaveBeenCalledWith(
        createShiftNoteDto,
        req.user.id,
      );
      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.RECORD_CREATED('Note'),
          data: {},
        }),
      );
    });

    it('should handle errors when creating a shift note', async () => {
      const error = new Error('Test error');
      shiftNoteService.create.mockRejectedValue(error);

      const result = await controller.create(createShiftNoteDto, req);

      expect(shiftNoteService.create).toHaveBeenCalledWith(
        createShiftNoteDto,
        req.user.id,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('findByShiftId', () => {
    const shiftId = '123';
    const queryParamsDto: QueryParamsDto = {
      limit: '10',
      offset: '0',
      order: { created_at: 'DESC' },
    };

    it('should return notes with pagination when notes exist', async () => {
      const mockNotes = [new ShiftNote()];
      const total = 1;
      shiftNoteService.findByShiftId.mockResolvedValue([mockNotes, total]);

      const result = await controller.findByShiftId(shiftId, queryParamsDto);

      expect(shiftNoteService.findByShiftId).toHaveBeenCalledWith(
        shiftId,
        +queryParamsDto.limit,
        +queryParamsDto.offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_FOUND('Notes'),
          total,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: mockNotes,
        }),
      );
    });

    it('should return empty response when no notes exist', async () => {
      shiftNoteService.findByShiftId.mockResolvedValue([[], 0]);

      const result = await controller.findByShiftId(shiftId, queryParamsDto);

      expect(shiftNoteService.findByShiftId).toHaveBeenCalledWith(
        shiftId,
        +queryParamsDto.limit,
        +queryParamsDto.offset,
      );
      expect(result).toEqual(
        response.successResponseWithPagination({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Notes'),
          total: 0,
          limit: +queryParamsDto.limit,
          offset: +queryParamsDto.offset,
          data: [],
        }),
      );
    });

    it('should handle errors when finding notes', async () => {
      const error = new Error('Test error');
      shiftNoteService.findByShiftId.mockRejectedValue(error);

      const result = await controller.findByShiftId(shiftId, queryParamsDto);

      expect(shiftNoteService.findByShiftId).toHaveBeenCalledWith(
        shiftId,
        +queryParamsDto.limit,
        +queryParamsDto.offset,
      );
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('update', () => {
    const id = '123';
    const updateShiftNoteDto = { notes: 'Updated note content' };

    it('should return bad request if note does not exist', async () => {
      shiftNoteService.findOne.mockResolvedValue(null);

      const result = await controller.update(id, updateShiftNoteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Note'),
          data: {},
        }),
      );
    });

    it('should update note successfully', async () => {
      shiftNoteService.findOne.mockResolvedValue(new ShiftNote());
      shiftNoteService.update.mockResolvedValue({ affected: 1 });

      const result = await controller.update(id, updateShiftNoteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(shiftNoteService.update).toHaveBeenCalledWith(
        id,
        updateShiftNoteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_UPDATED('Note'),
          data: {},
        }),
      );
    });

    it('should return not found if note was not updated', async () => {
      shiftNoteService.findOne.mockResolvedValue(new ShiftNote());
      shiftNoteService.update.mockResolvedValue({ affected: 0 });

      const result = await controller.update(id, updateShiftNoteDto);

      expect(shiftNoteService.update).toHaveBeenCalledWith(
        id,
        updateShiftNoteDto,
      );
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Note'),
          data: {},
        }),
      );
    });

    it('should handle errors when updating note', async () => {
      const error = new Error('Test error');
      shiftNoteService.findOne.mockRejectedValue(error);

      const result = await controller.update(id, updateShiftNoteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });

  describe('remove', () => {
    const id = '123';
    const deleteDto = { deleted_at_ip: '127.0.0.1' };

    it('should return bad request if note does not exist', async () => {
      shiftNoteService.findOne.mockResolvedValue(null);

      const result = await controller.remove(id, deleteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        response.badRequest({
          message: CONSTANT.ERROR.RECORD_NOT_FOUND('Note'),
          data: {},
        }),
      );
    });

    it('should delete note successfully', async () => {
      shiftNoteService.findOne.mockResolvedValue(new ShiftNote());
      shiftNoteService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove(id, deleteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(shiftNoteService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_DELETED('Note'),
          data: {},
        }),
      );
    });

    it('should return not found if note was not deleted', async () => {
      shiftNoteService.findOne.mockResolvedValue(new ShiftNote());
      shiftNoteService.remove.mockResolvedValue({ affected: 0 });

      const result = await controller.remove(id, deleteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(shiftNoteService.remove).toHaveBeenCalledWith(id, deleteDto);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.RECORD_NOT_FOUND('Note'),
          data: {},
        }),
      );
    });

    it('should handle errors when deleting note', async () => {
      const error = new Error('Test error');
      shiftNoteService.findOne.mockRejectedValue(error);

      const result = await controller.remove(id, deleteDto);

      expect(shiftNoteService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(response.failureResponse(error));
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ShiftNoteService } from './shift-note.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShiftNote } from './entities/shift-note.entity';
import { Repository, IsNull } from 'typeorm';
import { CreateShiftNoteDto } from './dto/create-shift-note.dto';
import { plainToClass } from 'class-transformer';

describe('ShiftNoteService', () => {
  let service: ShiftNoteService;
  let shiftNoteRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftNoteService,
        {
          provide: getRepositoryToken(ShiftNote),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              getManyAndCount: jest
                .fn()
                .mockResolvedValue([[new ShiftNote()], 1]),
            })),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShiftNoteService>(ShiftNoteService);
    shiftNoteRepository = module.get<Repository<ShiftNote>>(
      getRepositoryToken(ShiftNote),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new shift note', async () => {
      const createShiftNoteDto = new CreateShiftNoteDto();
      const admin_id = '1';
      const mockNote = new ShiftNote();

      shiftNoteRepository.save.mockResolvedValue(mockNote);

      const result = await service.create(createShiftNoteDto, admin_id);

      expect(shiftNoteRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: createShiftNoteDto.notes,
          shift: { id: createShiftNoteDto.shift_id },
          admin: { id: admin_id },
        }),
      );
      expect(result).toEqual(plainToClass(ShiftNote, mockNote));
    });
  });

  describe('findByShiftId', () => {
    let mockQueryBuilder;

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      shiftNoteRepository.createQueryBuilder = jest.fn(() => mockQueryBuilder);
    });

    it('should return shift notes with count', async () => {
      const shiftId = '123';
      const limit = 10;
      const offset = 0;
      const mockNotes = [new ShiftNote()];
      const total = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockNotes, total]);

      const result = await service.findByShiftId(shiftId, limit, offset);

      expect(shiftNoteRepository.createQueryBuilder).toHaveBeenCalledWith('sn');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('sn.admin', 'a');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'sn.id',
        'sn.notes',
        'sn.created_at',
        'a.id',
        'a.base_url',
        'a.image',
        'a.first_name',
        'a.last_name',
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'sn.shift_id = :shiftId',
        { shiftId },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'sn.created_at',
        'DESC',
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(offset);
      expect(result).toEqual([mockNotes, total]);
    });

    it('should return empty result if no notes found', async () => {
      const shiftId = '123';
      const limit = 10;
      const offset = 0;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findByShiftId(shiftId, limit, offset);

      expect(result).toEqual([[], 0]);
    });

    it('should throw an error if query fails', async () => {
      const shiftId = '123';
      const limit = 10;
      const offset = 0;

      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.findByShiftId(shiftId, limit, offset),
      ).rejects.toThrow('DB Error');
    });
  });

  describe('findOne', () => {
    it('should find one shift note', async () => {
      const id = '123';
      const mockNote = new ShiftNote();

      shiftNoteRepository.findOne.mockResolvedValue(mockNote);

      const result = await service.findOne(id);

      expect(shiftNoteRepository.findOne).toHaveBeenCalledWith({
        where: { id, deleted_at: IsNull() },
        relations: ['admin'],
      });
      expect(result).toEqual(plainToClass(ShiftNote, mockNote));
    });
  });

  describe('update', () => {
    it('should update a shift note', async () => {
      const id = '123';
      const updateShiftNoteDto = { notes: 'Updated content' };
      const mockResult = { affected: 1 };

      shiftNoteRepository.update.mockResolvedValue(mockResult);

      const result = await service.update(id, updateShiftNoteDto);

      expect(shiftNoteRepository.update).toHaveBeenCalledWith(
        { id, deleted_at: IsNull() },
        {
          ...updateShiftNoteDto,
          updated_at: expect.any(String),
        },
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a shift note', async () => {
      const id = '123';
      const deleteDto = { deleted_at_ip: '127.0.0.1' };
      const mockResult = { affected: 1 };

      shiftNoteRepository.update.mockResolvedValue(mockResult);

      const result = await service.remove(id, deleteDto);

      expect(shiftNoteRepository.update).toHaveBeenCalledWith(
        { id, deleted_at: IsNull() },
        {
          deleted_at_ip: deleteDto.deleted_at_ip,
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual(mockResult);
    });
  });
});

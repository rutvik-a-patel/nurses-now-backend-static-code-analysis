import { Test, TestingModule } from '@nestjs/testing';
import { ShiftInvitationService } from './shift-invitation.service';
import { ShiftInvitation } from './entities/shift-invitation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShiftInvitationDto } from './dto/create-shift-invitation.dto';
import { UpdateShiftInvitationDto } from './dto/update-shift-invitation.dto';
import { ProviderOrientation } from '@/provider-orientation/entities/provider-orientation.entity';

describe('ShiftInvitationService', () => {
  let service: ShiftInvitationService;
  let shiftInvitationRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftInvitationService,
        {
          provide: getRepositoryToken(ShiftInvitation),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderOrientation),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ShiftInvitationService>(ShiftInvitationService);
    shiftInvitationRepository = module.get<Repository<ShiftInvitation>>(
      getRepositoryToken(ShiftInvitation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new invitation', async () => {
      const createShiftInvitationDto = new CreateShiftInvitationDto();
      const mockInvitation = new ShiftInvitation();
      shiftInvitationRepository.save.mockResolvedValue(mockInvitation);

      const result = await service.create(createShiftInvitationDto);

      expect(shiftInvitationRepository.save).toHaveBeenCalledWith(
        createShiftInvitationDto,
      );
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('findOneWhere', () => {
    it('should find one invitation by criteria', async () => {
      const options = { where: { id: '1' } };
      const mockInvitation = new ShiftInvitation();
      shiftInvitationRepository.findOne.mockResolvedValue(mockInvitation);
      const result = await service.findOneWhere(options);
      expect(shiftInvitationRepository.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('findAll', () => {
    it('should return a list of invitation and count', async () => {
      const options = {};
      const mockInvitation = [new ShiftInvitation(), new ShiftInvitation()];
      const count = mockInvitation.length;
      shiftInvitationRepository.findAndCount.mockResolvedValue([
        mockInvitation,
        count,
      ]);
      const result = await service.findAll(options);
      expect(shiftInvitationRepository.findAndCount).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual([mockInvitation, count]);
    });
  });

  describe('update', () => {
    it('should update an invitation and return the result', async () => {
      const updateShiftInvitationDto = new UpdateShiftInvitationDto();
      const where: any = { id: '1' };
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateShiftInvitationDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      shiftInvitationRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(where, updateShiftInvitationDto);

      expect(shiftInvitationRepository.update).toHaveBeenCalledWith(
        where,
        expectedDto,
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should mark a invitation as deleted', async () => {
      const updateResult: any = { affected: 1 };
      shiftInvitationRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove({ id: '1' });
      expect(shiftInvitationRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        {
          deleted_at: expect.any(String),
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});

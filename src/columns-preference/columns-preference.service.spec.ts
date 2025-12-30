import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsPreferenceService } from './columns-preference.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnsPreference } from './entities/columns-preference.entity';
import { ShiftTableColumns } from '@/shared/constants/default-column-preference';

describe('ColumnsPreferenceService', () => {
  let service: ColumnsPreferenceService;
  let columnsPreferenceRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsPreferenceService,
        {
          provide: getRepositoryToken(ColumnsPreference),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ColumnsPreferenceService>(ColumnsPreferenceService);
    columnsPreferenceRepository = module.get<Repository<ColumnsPreference>>(
      getRepositoryToken(ColumnsPreference),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const userId = '1';

    it('should return existing preference if found', async () => {
      const mockPreference = new ColumnsPreference();
      mockPreference.columns_config = ShiftTableColumns;
      columnsPreferenceRepository.findOne.mockResolvedValue(mockPreference);

      const result = await service.findOne({
        where: { user_id: userId, table_type: 'shift' },
      });

      expect(columnsPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, table_type: 'shift' },
      });
      expect(result).toEqual(mockPreference);
    });

    it('should return null if no preference exists', async () => {
      columnsPreferenceRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne({
        where: { user_id: userId, table_type: 'shift' },
      });

      expect(columnsPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, table_type: 'shift' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new preference', async () => {
      const mockData = {
        user_id: '1',
        columns_config: ShiftTableColumns,
      };
      const mockPreference = new ColumnsPreference();
      Object.assign(mockPreference, mockData);

      columnsPreferenceRepository.save.mockResolvedValue(mockPreference);

      const result = await service.create(mockData);

      expect(columnsPreferenceRepository.save).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockPreference);
    });
  });

  describe('update', () => {
    const preferenceId = '1';

    it('should update existing preference', async () => {
      const updateData = {
        columns_config: { ...ShiftTableColumns, newColumn: true },
      };
      const mockUpdatedPreference = new ColumnsPreference();
      Object.assign(mockUpdatedPreference, { id: preferenceId, ...updateData });

      columnsPreferenceRepository.update.mockResolvedValue({ affected: 1 });
      columnsPreferenceRepository.findOne.mockResolvedValue(
        mockUpdatedPreference,
      );

      const result = await service.update(preferenceId, updateData);

      expect(columnsPreferenceRepository.update).toHaveBeenCalledWith(
        { id: preferenceId },
        updateData,
      );
      expect(columnsPreferenceRepository.findOne).toHaveBeenCalledWith({
        where: { id: preferenceId },
      });
      expect(result).toEqual(mockUpdatedPreference);
    });

    it('should return null if preference not found after update', async () => {
      const updateData = { columns_config: ShiftTableColumns };

      columnsPreferenceRepository.update.mockResolvedValue({ affected: 1 });
      columnsPreferenceRepository.findOne.mockResolvedValue(null);

      const result = await service.update(preferenceId, updateData);

      expect(result).toBeNull();
    });
  });
});

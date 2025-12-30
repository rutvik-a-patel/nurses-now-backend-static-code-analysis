import { Test, TestingModule } from '@nestjs/testing';
import { AutoSchedulingSettingService } from './auto-scheduling-setting.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AutoSchedulingSetting } from './entities/auto-scheduling-setting.entity';
import { Repository } from 'typeorm';
import { UpdateAutoSchedulingSettingDto } from './dto/update-auto-scheduling-setting.dto';

describe('AutoSchedulingSettingService', () => {
  let service: AutoSchedulingSettingService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoSchedulingSettingService,
        {
          provide: getRepositoryToken(AutoSchedulingSetting),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AutoSchedulingSettingService>(
      AutoSchedulingSettingService,
    );
    repository = module.get<Repository<AutoSchedulingSetting>>(
      getRepositoryToken(AutoSchedulingSetting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('find', () => {
    it('should return a list of settings', async () => {
      const options = {};
      const settings = [
        new AutoSchedulingSetting(),
        new AutoSchedulingSetting(),
      ];
      repository.find.mockResolvedValue(settings);
      const result = await service.find(options);
      expect(repository.find).toHaveBeenCalledWith(options);
      expect(result).toEqual(settings);
    });
  });

  describe('update', () => {
    it('should update an setting and return the result', async () => {
      const updateAutoSchedulingSettingDto =
        new UpdateAutoSchedulingSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };
      const expectedDto = {
        ...updateAutoSchedulingSettingDto,
        updated_at: expect.any(String), // Expect any string for the 'updated_at', or mock Date to control output
      };

      repository.update.mockResolvedValue(updateResult);

      const result = await service.update(id, updateAutoSchedulingSettingDto);

      expect(repository.update).toHaveBeenCalledWith({ id }, expectedDto);
      expect(result).toEqual(updateResult);
    });
  });
});

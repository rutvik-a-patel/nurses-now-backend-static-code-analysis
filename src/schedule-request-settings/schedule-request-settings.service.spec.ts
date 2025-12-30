import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleRequestSettingsService } from './schedule-request-settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScheduleRequestSetting } from './entities/schedule-request-setting.entity';
import { Repository } from 'typeorm';
import { UpdateScheduleRequestSettingDto } from './dto/update-schedule-request-setting.dto';

describe('ScheduleRequestSettingsService', () => {
  let service: ScheduleRequestSettingsService;
  let scheduleRequestSettingRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleRequestSettingsService,
        {
          provide: getRepositoryToken(ScheduleRequestSetting),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleRequestSettingsService>(
      ScheduleRequestSettingsService,
    );
    scheduleRequestSettingRepository = module.get<
      Repository<ScheduleRequestSetting>
    >(getRepositoryToken(ScheduleRequestSetting));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneWhere', () => {
    it('should find one setting by criteria', async () => {
      const options = { where: { setting: 'CN' } };
      const data = new ScheduleRequestSetting();
      scheduleRequestSettingRepository.findOne.mockResolvedValue(data);
      const result = await service.findOneWhere(options);
      expect(scheduleRequestSettingRepository.findOne).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(data);
    });
  });

  describe('findAll', () => {
    it('should return a list of setting', async () => {
      const options = {};
      const data = [new ScheduleRequestSetting(), new ScheduleRequestSetting()];
      scheduleRequestSettingRepository.find.mockResolvedValue(data);
      const result = await service.findAll(options);
      expect(scheduleRequestSettingRepository.find).toHaveBeenCalledWith(
        options,
      );
      expect(result).toEqual(data);
    });
  });

  describe('update', () => {
    it('should update an setting and return the result', async () => {
      const updateScheduleRequestSettingDto =
        new UpdateScheduleRequestSettingDto();
      const id = '1';
      const updateResult = { affected: 1 };

      scheduleRequestSettingRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(
        { id },
        updateScheduleRequestSettingDto,
      );
      expect(result).toEqual(updateResult);
    });
  });
});

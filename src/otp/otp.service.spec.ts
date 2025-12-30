import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateOtpDto } from './dto/create-otp.dto';

describe('OtpService', () => {
  let service: OtpService;
  let otpRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(Otp),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpRepository = module.get<Repository<Otp>>(getRepositoryToken(Otp));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const where: FindOneOptions<Otp> = { where: { id: '1' } };
    it('should return one otp detail', async () => {
      otpRepository.findOne.mockResolvedValue(new Otp());
      const result = await service.findOne(where);
      expect(otpRepository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(new Otp());
    });
  });

  describe('create', () => {
    const createOtpDto = new CreateOtpDto();
    it('should create one new OTP', async () => {
      otpRepository.save.mockResolvedValue(new Otp());
      const result = await service.create(createOtpDto);
      expect(otpRepository.save).toHaveBeenCalledWith(createOtpDto);
      expect(result).toEqual(new Otp());
    });
  });

  describe('update', () => {
    const id = '1';
    const updateOtpDto = new CreateOtpDto();
    it('should update OTP', async () => {
      otpRepository.update.mockResolvedValue({ affected: 1 });
      const result = await service.update(id, updateOtpDto);
      expect(otpRepository.update).toHaveBeenCalledWith(id, updateOtpDto);
      expect(result).toEqual({ affected: 1 });
    });
  });
});

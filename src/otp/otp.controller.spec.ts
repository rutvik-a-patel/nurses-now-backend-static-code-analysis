import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';

describe('OtpController', () => {
  let controller: OtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(Otp),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

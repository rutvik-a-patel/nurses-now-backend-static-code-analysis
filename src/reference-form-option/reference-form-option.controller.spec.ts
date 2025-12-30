import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceFormOptionController } from './reference-form-option.controller';
import { ReferenceFormOptionService } from './reference-form-option.service';

describe('ReferenceFormOptionController', () => {
  let controller: ReferenceFormOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceFormOptionController],
      providers: [ReferenceFormOptionService],
    }).compile();

    controller = module.get<ReferenceFormOptionController>(
      ReferenceFormOptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

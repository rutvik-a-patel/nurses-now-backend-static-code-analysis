import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceFormOptionService } from './reference-form-option.service';

describe('ReferenceFormOptionService', () => {
  let service: ReferenceFormOptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferenceFormOptionService],
    }).compile();

    service = module.get<ReferenceFormOptionService>(
      ReferenceFormOptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

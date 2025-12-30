import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyTestOptionController } from './competency-test-option.controller';
import { CompetencyTestOptionService } from './competency-test-option.service';

describe('CompetencyTestOptionController', () => {
  let controller: CompetencyTestOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyTestOptionController],
      providers: [CompetencyTestOptionService],
    }).compile();

    controller = module.get<CompetencyTestOptionController>(
      CompetencyTestOptionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

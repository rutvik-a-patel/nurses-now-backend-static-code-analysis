import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyTestQuestionController } from './competency-test-question.controller';
import { CompetencyTestQuestionService } from './competency-test-question.service';

describe('CompetencyTestQuestionController', () => {
  let controller: CompetencyTestQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyTestQuestionController],
      providers: [CompetencyTestQuestionService],
    }).compile();

    controller = module.get<CompetencyTestQuestionController>(
      CompetencyTestQuestionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyTestQuestionService } from './competency-test-question.service';

describe('CompetencyTestQuestionService', () => {
  let service: CompetencyTestQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetencyTestQuestionService],
    }).compile();

    service = module.get<CompetencyTestQuestionService>(
      CompetencyTestQuestionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

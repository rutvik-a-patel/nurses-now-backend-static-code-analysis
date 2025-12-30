import { Test, TestingModule } from '@nestjs/testing';
import { FacilityNoteController } from './facility-note.controller';
import { FacilityNoteService } from './facility-note.service';

describe('FacilityNoteController', () => {
  let controller: FacilityNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilityNoteController],
      providers: [
        {
          provide: FacilityNoteService,
          useValue: {
            create: jest.fn(),
            detailedList: jest.fn(),
            relatesToList: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findOneWhere: jest.fn(),
            isAlreadyUsed: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FacilityNoteController>(FacilityNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

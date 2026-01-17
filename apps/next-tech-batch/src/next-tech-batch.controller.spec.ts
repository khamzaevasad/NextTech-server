import { Test, TestingModule } from '@nestjs/testing';
import { NextTechBatchController } from './next-tech-batch.controller';
import { NextTechBatchService } from './next-tech-batch.service';

describe('NextTechBatchController', () => {
  let nextTechBatchController: NextTechBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NextTechBatchController],
      providers: [NextTechBatchService],
    }).compile();

    nextTechBatchController = app.get<NextTechBatchController>(NextTechBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nextTechBatchController.getHello()).toBe('Hello World!');
    });
  });
});

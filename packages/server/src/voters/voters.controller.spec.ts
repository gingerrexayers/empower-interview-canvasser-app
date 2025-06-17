import { Test, TestingModule } from '@nestjs/testing';
import { VotersController } from './voters.controller';

describe('VotersController', () => {
  let controller: VotersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotersController],
    }).compile();

    controller = module.get<VotersController>(VotersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

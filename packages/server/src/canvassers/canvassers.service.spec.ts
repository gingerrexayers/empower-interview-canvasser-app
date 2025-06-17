import { Test, TestingModule } from '@nestjs/testing';
import { CanvassersService } from './canvassers.service';

describe('CanvassersService', () => {
  let service: CanvassersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CanvassersService],
    }).compile();

    service = module.get<CanvassersService>(CanvassersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

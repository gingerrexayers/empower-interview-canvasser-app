import { Test, TestingModule } from '@nestjs/testing';
import { VotersController } from './voters.controller';
import { VotersService } from './voters.service';
import { JwtService } from '@nestjs/jwt';

describe('VotersController', () => {
  let controller: VotersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotersController],
      providers: [
        {
          provide: VotersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getVotersAsCsv: jest.fn(),
            // Add any other methods used by the controller
          },
        },
        {
          provide: JwtService,
          useValue: {
            // Mock any JwtService methods that AuthGuard might use, e.g., verify
            verify: jest.fn(),
            sign: jest.fn(),
            // Add other methods if needed, or keep it simple if AuthGuard only needs instantiation
          },
        },
      ],
    }).compile();

    controller = module.get<VotersController>(VotersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CanvassersService } from './canvassers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Canvasser } from './canvasser.entity';

// Define the specific shape of the mock returned by createMockRepository
type SpecificMockRepository = {
  find: jest.Mock;
  findOneBy: jest.Mock;
  delete: jest.Mock;
};

const createMockRepository = (): SpecificMockRepository => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

describe('CanvassersService', () => {
  let service: CanvassersService;
  let repository: SpecificMockRepository;

  // Create a sample canvasser to use in our tests
  const mockCanvasser: Canvasser = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedpassword123',
    voters: [], // assuming no voters for simplicity in this test
  };

  beforeEach(async () => {
    // Create a NestJS testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanvassersService,
        {
          // Provide a mock for the Canvasser repository
          provide: getRepositoryToken(Canvasser),
          // Use our factory function to create the mock
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    // Get instances of the service and the mock repository from the testing module
    service = module.get<CanvassersService>(CanvassersService);
    repository = module.get<SpecificMockRepository>(
      getRepositoryToken(Canvasser),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return an array of canvassers', async () => {
      // Arrange: mock the repository's find method to return our sample canvasser
      const canvassers = [mockCanvasser];
      repository.find.mockResolvedValue(canvassers);

      // Act: call the service method
      const result = await service.findAll();

      // Assert: check that the result matches what we expect
      expect(result).toEqual(canvassers);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne()', () => {
    it('should return a single canvasser when found', async () => {
      // Arrange: mock the findOneBy method to return our sample canvasser
      const id = 1;
      repository.findOneBy.mockResolvedValue(mockCanvasser);

      // Act: call the service method
      const result = await service.findOne(id);

      // Assert: check the result and that the repository was called correctly
      expect(result).toEqual(mockCanvasser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should return null if no canvasser is found', async () => {
      // Arrange: mock the findOneBy method to return null
      const id = 999; // An ID that doesn't exist
      repository.findOneBy.mockResolvedValue(null);

      // Act: call the service method
      const result = await service.findOne(id);

      // Assert: check the result
      expect(result).toBeNull();
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });
});

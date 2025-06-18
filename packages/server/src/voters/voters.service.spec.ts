import { Test, TestingModule } from '@nestjs/testing';
import { VotersService } from './voters.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Voter } from './voter.entity';
import { Like, Repository } from 'typeorm';
import { CreateVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';

// Define a type for our mock repository for better autocompletion
type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('VotersService', () => {
  let service: VotersService;
  let voterRepository: MockRepository<Voter>;

  const canvasserId = 1;
  const mockVoter: Voter = {
    id: 1,
    name: 'John Voter',
    email: 'john.voter@example.com',
    notes: 'Some notes here.',
    canvasser_id: canvasserId,
    canvasser: undefined, // Not needed for these tests
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotersService,
        {
          provide: getRepositoryToken(Voter),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VotersService>(VotersService);
    voterRepository = module.get<MockRepository<Voter>>(
      getRepositoryToken(Voter),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a voter', async () => {
      // Arrange
      const createVoterDto: CreateVoterDto = {
        name: 'Jane Voter',
        email: 'jane.voter@example.com',
      };
      const newVoter = { ...mockVoter, ...createVoterDto };

      voterRepository.create!.mockReturnValue(newVoter);
      voterRepository.save!.mockResolvedValue(newVoter);

      // Act
      const result = await service.create(createVoterDto, canvasserId);

      // Assert
      expect(voterRepository.create).toHaveBeenCalledWith({
        ...createVoterDto,
        canvasser_id: canvasserId,
      });
      expect(voterRepository.save).toHaveBeenCalledWith(newVoter);
      expect(result).toEqual(newVoter);
    });
  });

  describe('getVoters', () => {
    it('should find voters for a canvasser without a search term', async () => {
      // Arrange
      voterRepository.find!.mockResolvedValue([mockVoter]);

      // Act
      await service.getVoters(canvasserId);

      // Assert
      expect(voterRepository.find).toHaveBeenCalledWith({
        where: { canvasser_id: canvasserId },
        order: { updated_at: 'DESC' },
      });
    });

    it('should find voters with a search term', async () => {
      // Arrange
      const searchTerm = 'search';
      voterRepository.find!.mockResolvedValue([mockVoter]);

      // Act
      await service.getVoters(canvasserId, searchTerm);

      // Assert
      expect(voterRepository.find).toHaveBeenCalledWith({
        where: [
          { canvasser_id: canvasserId, name: Like(`%${searchTerm}%`) },
          { canvasser_id: canvasserId, notes: Like(`%${searchTerm}%`) },
        ],
        order: {
          updated_at: 'DESC',
        },
      });
    });
  });

  describe('updateVoter', () => {
    it('should update a voter successfully', async () => {
      // Arrange
      const updateVoterDto: UpdateVoterDto = { name: 'John Voter Updated' };
      const updatedVoter = { ...mockVoter, ...updateVoterDto };

      voterRepository.findOne!.mockResolvedValue(mockVoter);
      voterRepository.save!.mockResolvedValue(updatedVoter);

      // Act
      const result = await service.updateVoter(
        mockVoter.id,
        updateVoterDto,
        canvasserId,
      );

      // Assert
      expect(voterRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockVoter.id, canvasser_id: canvasserId },
      });
      expect(voterRepository.save).toHaveBeenCalledWith(updatedVoter);
      expect(result).toEqual(updatedVoter);
    });

    it('should throw an error if voter to update is not found', async () => {
      // Arrange
      const updateVoterDto: UpdateVoterDto = { name: 'John Voter Updated' };
      voterRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateVoter(999, updateVoterDto, canvasserId),
      ).rejects.toThrow(
        new NotFoundException(
          `Voter with ID: 999 not found for canvasser ID: ${canvasserId}.`,
        ),
      );
    });
  });

  describe('getVotersAsCsv', () => {
    it('should return a correctly formatted CSV string for a list of voters', async () => {
      // Arrange
      const voters = [
        { ...mockVoter, id: 1, name: 'Voter One', email: 'one@test.com' },
        {
          ...mockVoter,
          id: 2,
          name: 'Voter, Two',
          email: null,
          notes: 'Has a "comma" in notes',
        },
      ];
      voterRepository.find!.mockResolvedValue(voters);

      const expectedHeader = 'ID,Name,Email,Notes,CreatedAt,UpdatedAt\n';
      const row1 = `${voters[0].id},"${voters[0].name}","${voters[0].email}","${voters[0].notes}",${voters[0].created_at.toISOString()},${voters[0].updated_at.toISOString()}`;
      const row2 = `${voters[1].id},"${voters[1].name.replace(/"/g, '""')}",,"${voters[1].notes?.replace(/"/g, '""')}",${voters[1].created_at.toISOString()},${voters[1].updated_at.toISOString()}`;
      const expectedCsv = expectedHeader + [row1, row2].join('\n');

      // Act
      const result = await service.getVotersAsCsv(canvasserId);

      // Assert
      expect(result).toBe(expectedCsv);
    });

    it('should return a message if no voters are found', async () => {
      // Arrange
      voterRepository.find!.mockResolvedValue([]);

      // Act
      const result = await service.getVotersAsCsv(canvasserId);

      // Assert
      expect(result).toBe('No voters found');
    });
  });
});

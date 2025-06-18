import { Test, TestingModule } from '@nestjs/testing';
import { VotersController } from './voters.controller';
import { VotersService } from './voters.service';
import { RequestWithUser } from '../common/types/request-with-user.type';
import { Voter } from './voter.entity';
import { JwtService } from '@nestjs/jwt';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { CreateVoterDto } from './dto/create-voter.dto';
import { Response } from 'express';
import { validate } from 'class-validator';

describe('VotersController', () => {
  let controller: VotersController;
  let votersService: VotersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotersController],
      providers: [
        {
          provide: VotersService,
          useValue: {
            // Define mocks for all methods of VotersService that VotersController uses
            getVoters: jest.fn(),
            updateVoter: jest.fn(),
            create: jest.fn(),
            getVotersAsCsv: jest.fn(),
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
    votersService = module.get<VotersService>(VotersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('allVoters', () => {
    const mockUserId = 1;
    const mockRequest = { user: { id: mockUserId } } as RequestWithUser;
    const mockVoters: Voter[] = [
      {
        id: 1,
        name: 'Voter 1',
        email: 'v1@test.com',
        notes: '',
        created_at: new Date(),
        updated_at: new Date(),
        canvasser_id: mockUserId,
      },
      {
        id: 2,
        name: 'Voter 2',
        email: 'v2@test.com',
        notes: 'note',
        created_at: new Date(),
        updated_at: new Date(),
        canvasser_id: mockUserId,
      },
    ];

    it('should call votersService.getVoters with userId and no search term', async () => {
      jest.spyOn(votersService, 'getVoters').mockResolvedValue(mockVoters);

      const result = await controller.allVoters(mockRequest, undefined);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(votersService.getVoters).toHaveBeenCalledWith(
        mockUserId,
        undefined,
      );
      expect(result).toEqual(mockVoters);
    });

    it('should call votersService.getVoters with userId and a search term', async () => {
      const searchTerm = 'test search';
      jest
        .spyOn(votersService, 'getVoters')
        .mockResolvedValue(mockVoters.slice(0, 1)); // Simulate filtered result

      const result = await controller.allVoters(mockRequest, searchTerm);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(votersService.getVoters).toHaveBeenCalledWith(
        mockUserId,
        searchTerm,
      );
      expect(result).toEqual(mockVoters.slice(0, 1));
    });
  });

  describe('updateVoter', () => {
    const mockUserId = 1;
    const mockRequest = { user: { id: mockUserId } } as RequestWithUser;
    const mockVoterId = '123';
    const mockUpdateVoterDto: UpdateVoterDto = {
      name: 'Updated Voter Name',
      email: 'updated@test.com',
      notes: 'Updated notes',
    };
    const mockUpdatedVoter: Voter = {
      id: Number(mockVoterId),
      name: mockUpdateVoterDto.name!,
      email: mockUpdateVoterDto.email!,
      notes: mockUpdateVoterDto.notes!,
      created_at: new Date(),
      updated_at: new Date(),
      canvasser_id: mockUserId,
    };

    it('should call votersService.updateVoter with correct parameters and return updated voter', async () => {
      jest
        .spyOn(votersService, 'updateVoter')
        .mockResolvedValue(mockUpdatedVoter);

      const result = await controller.updateVoter(
        mockVoterId,
        mockUpdateVoterDto,
        mockRequest,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(votersService.updateVoter).toHaveBeenCalledWith(
        Number(mockVoterId),
        mockUpdateVoterDto,
        mockUserId,
      );
      expect(result).toEqual(mockUpdatedVoter);
    });
  });

  describe('create', () => {
    const mockUserId = 1;
    const mockRequest = { user: { id: mockUserId } } as RequestWithUser;
    const mockCreateVoterDto: CreateVoterDto = {
      name: 'New Voter',
      email: 'new@test.com',
      notes: 'Some notes',
    };
    const mockCreatedVoter: Voter = {
      id: 999, // Mock ID for the new voter
      name: mockCreateVoterDto.name, // name is required
      email: mockCreateVoterDto.email ?? null, // Voter.email is string | null
      notes: mockCreateVoterDto.notes ?? '', // Voter.notes is string
      created_at: new Date(),
      updated_at: new Date(),
      canvasser_id: mockUserId,
    };

    it('should call votersService.create with correct parameters and return created voter', async () => {
      jest.spyOn(votersService, 'create').mockResolvedValue(mockCreatedVoter);

      const result = await controller.create(mockCreateVoterDto, mockRequest);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(votersService.create).toHaveBeenCalledWith(
        mockCreateVoterDto,
        mockUserId,
      );
      expect(result).toEqual(mockCreatedVoter);
    });
  });

  describe('exportVotersAsCsv', () => {
    const mockUserId = 1;
    const mockRequest = { user: { id: mockUserId } } as RequestWithUser;
    const mockCsvData = 'id,name,email\n1,Test Voter,test@example.com';
    let mockResponse: Response;

    beforeEach(() => {
      mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
    });

    it('should call votersService.getVotersAsCsv and send CSV data in response', async () => {
      jest
        .spyOn(votersService, 'getVotersAsCsv')
        .mockResolvedValue(mockCsvData);

      await controller.exportVotersAsCsv(mockRequest, mockResponse);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(votersService.getVotersAsCsv).toHaveBeenCalledWith(mockUserId);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="voters.csv"',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockCsvData);
    });
  });
});

describe('UpdateVoterDto Validation', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdateVoterDto();
    dto.name = 'Valid Name';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if name is an empty string', async () => {
    const dto = new UpdateVoterDto();
    dto.name = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should pass validation if name is undefined (optional)', async () => {
    const dto = new UpdateVoterDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

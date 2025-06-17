import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Canvasser } from '../canvassers/canvasser.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CanvasserEmailAlreadyExistsException } from './exceptions/canvasser-email-already-exists.exception';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Mock the entire bcrypt library
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let canvasserRepository: jest.Mocked<Repository<Canvasser>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Canvasser),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    canvasserRepository = module.get(getRepositoryToken(Canvasser));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword';
    const salt = 'salt';

    it('should successfully register a user', async () => {
      // Arrange
      // Object that repository methods will interact with (includes password)
      const userPayloadForRepo = { ...registerDto, password: hashedPassword };
      const createdCanvasserEntity: Canvasser = {
        id: 1,
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      };

      // Object that the service is expected to return (password excluded)
      const expectedServiceOutput = {
        id: 1,
        name: registerDto.name,
        email: registerDto.email,
      };

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      canvasserRepository.create.mockReturnValue(createdCanvasserEntity);
      canvasserRepository.save.mockResolvedValue(createdCanvasserEntity);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, salt);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(canvasserRepository.create).toHaveBeenCalledWith(
        userPayloadForRepo,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(canvasserRepository.save).toHaveBeenCalledWith(
        createdCanvasserEntity,
      );
      expect(result).toEqual(expectedServiceOutput);
      expect('password' in result).toBe(false);
    });

    it('should throw CanvasserEmailAlreadyExistsException if email is taken', async () => {
      // Arrange
      // This creates a mock error that simulates a unique constraint violation from MySQL
      const driverError = {
        name: 'DriverError', // TypeORM QueryFailedError expects driverError to have a name property
        message: 'Duplicate entry for key...', // and a message
        code: 'ER_DUP_ENTRY', // and the specific code we're testing for
      } as Error; // Cast to Error to satisfy QueryFailedError's expectation for driverError structure
      const queryFailedError = new QueryFailedError('query', [], driverError);

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      canvasserRepository.create.mockReturnValue({} as Canvasser); // Mock a basic canvasser object
      canvasserRepository.save.mockRejectedValue(queryFailedError);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        new CanvasserEmailAlreadyExistsException(registerDto.email),
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      // Mock console.error for this test to hide the expected error output
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Arrange
      canvasserRepository.save.mockRejectedValue(new Error('Some other error'));
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error('Some other error'),
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockUser: Canvasser = {
      id: 1,
      name: 'Test User',
      email: loginDto.email,
      password: 'hashedPassword',
      voters: [],
    };

    it('should successfully log in a user and return a token', async () => {
      // Arrange
      const token = 'mock_jwt_token';
      canvasserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(token);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(canvasserRepository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        id: mockUser.id,
        name: mockUser.name,
      });
      expect(result).toEqual({ token });
    });

    it('should throw UnauthorizedException for a non-existent user', async () => {
      // Arrange
      canvasserRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid login!'),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for an incorrect password', async () => {
      // Arrange
      canvasserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid login!'),
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});

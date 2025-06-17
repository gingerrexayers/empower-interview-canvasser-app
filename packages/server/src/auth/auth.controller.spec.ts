import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Canvasser } from '../canvassers/canvasser.entity';

// Create a mock AuthService object
// We define the type to get autocompletion for the service's methods.
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<typeof mockAuthService>(AuthService);
  });

  afterEach(() => {
    // Clear mock history after each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the new user', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'securePassword123',
      };

      const expectedUser: Omit<Canvasser, 'password'> = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        voters: [],
      };

      // Mock the service's register method to return our expected user
      service.register.mockResolvedValue(expectedUser as Canvasser);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      // 1. Check if the service method was called with the correct data
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);

      // 2. Check if the controller returned the value from the service
      expect(result).toEqual(expectedUser);
    });
  });

  describe('login', () => {
    it('should call authService.login and return a token object', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'jane.doe@example.com',
        password: 'securePassword123',
      };

      const expectedToken = { token: 'some.jwt.token' };

      // Mock the service's login method
      service.login.mockResolvedValue(expectedToken);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      // 1. Check if the service method was called correctly
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);

      // 2. Check if the controller returned the correct value
      expect(result).toEqual(expectedToken);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Canvasser } from '../canvassers/canvasser.entity';
import { validate } from 'class-validator';

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

describe('RegisterDto Validation', () => {
  const createDto = (overrides: Partial<RegisterDto>): RegisterDto => {
    const dto = new RegisterDto(); // Create an instance
    // Set default valid values
    dto.name = 'Test User';
    dto.email = 'test@example.com';
    dto.password = 'password123';

    // Apply any overrides directly to the instance
    Object.assign(dto, overrides);

    return dto; // Return the modified instance
  };

  it('should pass with valid data', async () => {
    const dto = createDto({});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if name is empty', async () => {
    const dto = createDto({ name: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'Name should not be empty',
    );
  });

  // Note: IsString might not fail for non-strings if transform is on, as it might be coerced.
  // However, the type system and IsNotEmpty usually catch issues before IsString for empty/null.
  // For a direct IsString test, you might pass a non-string type if not for TS.

  it('should fail if email is empty', async () => {
    const dto = createDto({ email: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'Email should not be empty',
    );
  });

  it('should fail if email is invalid', async () => {
    const dto = createDto({ email: 'invalid-email' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isEmail',
      'Please provide a valid email address',
    );
  });

  it('should fail if password is empty', async () => {
    const dto = createDto({ password: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'Password should not be empty',
    );
  });

  it('should fail if password is too short', async () => {
    const dto = createDto({ password: 'short' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'minLength',
      'Password must be at least 8 characters long',
    );
  });
});

describe('LoginDto Validation', () => {
  const createLoginDto = (overrides: Partial<LoginDto>): LoginDto => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';
    Object.assign(dto, overrides);
    return dto;
  };

  it('should pass with valid data', async () => {
    const dto = createLoginDto({});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is empty', async () => {
    const dto = createLoginDto({ email: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    // For empty email, IsNotEmpty fires before IsEmail
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'Email should not be empty.',
    );
  });

  it('should fail if email is invalid', async () => {
    const dto = createLoginDto({ email: 'invalid-email' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isEmail',
      'Please provide a valid email address.',
    );
  });

  it('should fail if password is empty', async () => {
    const dto = createLoginDto({ password: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isNotEmpty',
      'Password should not be empty.',
    );
  });
});

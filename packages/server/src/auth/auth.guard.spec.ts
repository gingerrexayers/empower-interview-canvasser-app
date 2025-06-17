import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

interface MockApiRequestType {
  headers: {
    authorization?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true and attach user to request for a valid token', async () => {
      // Arrange
      const mockToken = 'valid.jwt.token';
      const mockUserPayload = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
      };

      // Define the shape of the mock request, including the 'user' property
      const mockApiRequest: MockApiRequestType = {
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
        // user property will be populated by the guard or remain undefined
      };

      // We use createMock from @golevelup/ts-jest to easily create a mock ExecutionContext
      // It allows us to deeply mock the nested properties.
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => mockApiRequest, // getRequest now returns our more detailed mock
        }),
      });

      jwtService.verifyAsync.mockResolvedValue(mockUserPayload);

      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(mockApiRequest.user).toEqual(mockUserPayload);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
        secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
      });
      expect(mockApiRequest.user).toEqual(mockUserPayload);
    });

    it('should throw UnauthorizedException if authorization header is missing', async () => {
      // Arrange
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {}, // No authorization header
          }),
        }),
      });

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is not bearer type', async () => {
      // Arrange
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Basic some-other-token', // Invalid type
            },
          }),
        }),
      });

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is not provided', async () => {
      // Arrange
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer ', // No token
            },
          }),
        }),
      });

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if jwtService.verifyAsync fails', async () => {
      // Arrange
      const mockToken = 'invalid.jwt.token';
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${mockToken}`,
            },
          }),
        }),
      });

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

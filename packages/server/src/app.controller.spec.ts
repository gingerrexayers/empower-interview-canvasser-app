import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

// Create a mock DataSource object. We only need to mock the `query` method.
const mockDataSource = {
  query: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DataSource, // Provide the mock for the DataSource token
          useValue: mockDataSource,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    // Clear mock history after each test to ensure they are independent
    jest.clearAllMocks();
  });

  describe('checkHealth()', () => {
    it('should return a healthy status when the database connection is ok', async () => {
      // Arrange
      // Mock the dataSource.query method to resolve successfully
      mockDataSource.query.mockResolvedValue(true);

      // Act
      const result = await appController.checkHealth();

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockDataSource.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        status: 'ok',
        message: 'Database connection is healthy',
      });
    });

    it('should throw a ServiceUnavailableException when the database connection fails', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      // Mock the dataSource.query method to reject with an error
      mockDataSource.query.mockRejectedValue(dbError);

      // Act & Assert
      // We expect the promise to be rejected and we can check the thrown exception.
      await expect(appController.checkHealth()).rejects.toThrow(
        new HttpException(
          {
            status: 'error',
            message: 'Database connection failed',
            details: dbError.message,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );

      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockDataSource.query).toHaveBeenCalledTimes(1);
    });
  });
});

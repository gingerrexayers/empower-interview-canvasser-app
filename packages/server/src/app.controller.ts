import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get('health')
  async checkHealth() {
    this.logger.log('Health check initiated...');
    try {
      await this.dataSource.query('SELECT 1'); // Simple query to check DB connection
      this.logger.log('Database connection is healthy.');
      return { status: 'ok', message: 'Database connection is healthy' };
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred during health check.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(
        'Database connection failed during health check.',
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new HttpException(
        {
          status: 'error',
          message: 'Database connection failed',
          details: errorMessage,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

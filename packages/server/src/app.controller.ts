import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async checkHealth() {
    try {
      await this.dataSource.query('SELECT 1'); // Simple query to check DB connection
      return { status: 'ok', message: 'Database connection is healthy' };
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred during health check.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './data-source';
import { AuthModule } from './auth/auth.module';
import { CanvassersModule } from './canvassers/canvassers.module';
import { VotersModule } from './voters/voters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule settings available project-wide
      envFilePath: '.env', // Specifies the path to your .env file
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignores .env file in production
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    CanvassersModule,
    VotersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

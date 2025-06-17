import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './data-source';
import { AuthModule } from './auth/auth.module';
import { CanvassersModule } from './canvassers/canvassers.module';
import { VotersModule } from './voters/voters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    CanvassersModule,
    VotersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

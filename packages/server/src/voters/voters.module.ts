import { Module } from '@nestjs/common';
import { VotersController } from './voters.controller';
import { VotersService } from './voters.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voter } from './voter.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([Voter]),
  ],
  controllers: [VotersController],
  providers: [VotersService, AuthGuard],
})
export class VotersModule {}

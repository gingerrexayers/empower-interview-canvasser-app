import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Canvasser } from './canvasser.entity';
import { CanvassersService } from './canvassers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Canvasser])],
  providers: [CanvassersService],
})
export class CanvassersModule {}

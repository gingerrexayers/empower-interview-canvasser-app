import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Canvasser } from './canvasser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Canvasser])],
})
export class CanvassersModule {}
